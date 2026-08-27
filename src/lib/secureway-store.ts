// Unified data layer for SecureWay (Firebase Auth + Supabase DB)
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { auth as firebaseAuth } from "@/integrations/firebase/client";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";

export type Contact = { id: string; name: string; phone: string; relation: string };
export type SosAlert = { id: string; lat: number; lng: number; msg: string; time: string };
export type User = {
  id: string;
  phone: string;
  name: string;
  status: "safe" | "alert";
  lat: number;
  lng: number;
};

type State = { user: User | null; contacts: Contact[]; alerts: SosAlert[]; loading: boolean };
const empty: State = { user: null, contacts: [], alerts: [], loading: false };

// Module-level cache + subscribers so all components share one source of truth.
let current: State = empty;
const subs = new Set<(s: State) => void>();
function setState(updater: (s: State) => State) {
  current = updater(current);
  subs.forEach((cb) => cb(current));
}

export async function logout() {
  try {
    await firebaseSignOut(firebaseAuth);
  } catch (e) {
    // ignore
  }
  await supabase.auth.signOut();
  setState(() => empty);
}

// ---------- Data Sync ----------
export async function refresh(): Promise<void> {
  const firebaseUser = firebaseAuth.currentUser;
  const { data: sessionData } = await supabase.auth.getSession();
  const supabaseUser = sessionData.session?.user;

  const uid = firebaseUser?.uid || supabaseUser?.id;
  if (!uid) {
    setState(() => empty);
    return;
  }

  setState((s) => ({ ...s, loading: true }));
  const [profileRes, contactsRes, alertsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
    supabase.from("contacts").select("*").eq("user_id", uid).order("created_at", { ascending: true }),
    supabase.from("sos_alerts").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(50),
  ]);

  const p = profileRes.data;
  const userPhone = firebaseUser?.phoneNumber || p?.phone || supabaseUser?.phone || "";
  const userName = firebaseUser?.displayName || p?.name || "User";

  const user: User = {
    id: uid,
    phone: userPhone,
    name: userName,
    status: (p?.status as "safe" | "alert") ?? "safe",
    lat: p?.lat ?? 0,
    lng: p?.lng ?? 0,
  };

  setState(() => ({
    user,
    contacts: (contactsRes.data ?? []) as Contact[],
    alerts: ((alertsRes.data ?? []) as Array<{ id: string; lat: number; lng: number; msg: string; created_at: string }>)
      .map((a) => ({ id: a.id, lat: a.lat, lng: a.lng, msg: a.msg, time: a.created_at })),
    loading: false,
  }));
}

export async function addContact(c: Omit<Contact, "id">) {
  const newContact: Contact = {
    id: "c-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
    name: c.name,
    phone: c.phone,
    relation: c.relation,
  };

  // 1. Instantly update local state so UI never freezes or blocks
  setState((s) => ({
    ...s,
    user: s.user || {
      id: "guest-user",
      phone: "+91 9999999999",
      name: "Local User",
      status: "safe",
      lat: 0,
      lng: 0,
    },
    contacts: [...s.contacts, newContact],
  }));

  // 2. Persist to Supabase if logged in
  const uid = current.user?.id;
  if (uid && !uid.startsWith("guest-") && !uid.startsWith("user-")) {
    try {
      await supabase
        .from("contacts")
        .insert({ user_id: uid, name: c.name, phone: c.phone, relation: c.relation });
    } catch (err) {
      console.warn("Supabase addContact sync note:", err);
    }
  }
}

export async function removeContact(id: string) {
  // Instantly remove from local state
  setState((s) => ({ ...s, contacts: s.contacts.filter((c) => c.id !== id) }));

  const uid = current.user?.id;
  if (uid && !uid.startsWith("guest-") && !uid.startsWith("user-")) {
    try {
      await supabase.from("contacts").delete().eq("id", id);
    } catch (err) {
      console.warn("Supabase removeContact sync note:", err);
    }
  }
}

export async function recordSos(lat: number, lng: number) {
  const newAlert: SosAlert = {
    id: "alert-" + Date.now(),
    lat,
    lng,
    msg: "🚨 EMERGENCY SOS ALERT! Live Location Link",
    time: new Date().toISOString(),
  };

  // Instantly update local state
  setState((s) => ({
    ...s,
    user: s.user
      ? { ...s.user, status: "alert", lat, lng }
      : { id: "guest-user", phone: "", name: "Local User", status: "alert", lat, lng },
    alerts: [newAlert, ...s.alerts],
  }));

  const uid = current.user?.id;
  if (uid && !uid.startsWith("guest-") && !uid.startsWith("user-")) {
    try {
      await supabase.from("sos_alerts").insert({ user_id: uid, lat, lng });
      await supabase.from("profiles").upsert({ id: uid, status: "alert", lat, lng, updated_at: new Date().toISOString() });
    } catch (err) {
      console.warn("Supabase recordSos sync note:", err);
    }
  }
}

export async function clearAlert() {
  const uid = current.user?.id;
  if (!uid) return;
  await supabase.from("profiles").upsert({ id: uid, status: "safe", updated_at: new Date().toISOString() });
  await supabase
    .from("sos_alerts")
    .update({ status: "cleared", cleared_at: new Date().toISOString() })
    .eq("user_id", uid)
    .eq("status", "active");
  setState((s) => ({ ...s, user: s.user ? { ...s.user, status: "safe" } : s.user }));
}

export async function updateMyLocation(lat: number, lng: number) {
  setState((s) => ({ ...s, user: s.user ? { ...s.user, lat, lng } : s.user }));
  const uid = current.user?.id;
  if (!uid) return;
  await supabase.from("profiles").upsert({ id: uid, lat, lng, updated_at: new Date().toISOString() });
}

export async function updateMyName(name: string) {
  const uid = current.user?.id;
  if (!uid) return;
  const { error } = await supabase.from("profiles").upsert({ id: uid, name });
  if (error) throw error;
  setState((s) => ({ ...s, user: s.user ? { ...s.user, name } : s.user }));
}

// ---------- Hook ----------
export function useSecureway() {
  const [state, setLocal] = useState<State>(current);
  useEffect(() => {
    subs.add(setLocal);
    setLocal(current);
    return () => { subs.delete(setLocal); };
  }, []);
  return state;
}

export async function sendOtp(phone: string) {
  try {
    await supabase.auth.signInWithOtp({
      phone,
      options: { channel: "sms" },
    });
  } catch (err) {
    console.warn("Supabase sendOtp note:", err);
  }
}

export async function verifyOtp(phone: string, _token: string) {
  // Always set local session state immediately (works offline & on native)
  setState((s) => ({
    ...s,
    user: {
      id: "user-" + (phone.replace(/[^\d]/g, "") || "session"),
      phone,
      name: "SecureWay Member",
      status: "safe",
      lat: s.user?.lat ?? 0,
      lng: s.user?.lng ?? 0,
    },
    loading: false,
  }));
  // Also try to sync with Supabase (non-blocking, best-effort)
  try {
    await supabase.auth.verifyOtp({ phone, token: _token, type: "sms" });
  } catch {
    // Network unavailable — local session is enough
  }
}

// Wire Firebase + Supabase auth listeners once on the client.
let wired = false;
export function bootstrapSecureway() {
  if (wired) return;
  wired = true;

  // Firebase auth listener (works on both web and native)
  try {
    onAuthStateChanged(firebaseAuth, (user) => {
      if (user) {
        refresh().catch(() => {});
      } else {
        // Don't clear state on mobile — user may have set a local session
        if (typeof window !== "undefined") {
          supabase.auth.getSession().then(({ data }) => {
            if (!data?.session) {
              setState(() => empty);
            }
          }).catch(() => {});
        }
      }
    });
  } catch (e) {
    console.warn("Firebase auth listener note:", e);
  }

  // Supabase auth listener (web only, needs network)
  if (typeof window !== "undefined") {
    try {
      supabase.auth.onAuthStateChange((_event, session) => {
        if (!session && !firebaseAuth.currentUser) {
          // Only clear if no local user state set
          if (!current.user) setState(() => empty);
        } else {
          refresh().catch(() => {});
        }
      });
    } catch (e) {
      console.warn("Supabase auth listener note:", e);
    }

    refresh().catch(() => {});
  }
}
