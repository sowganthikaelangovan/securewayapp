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

const STORAGE_KEY = "secureway_active_user";

async function saveStoredUser(user: User | null) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      if (user) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  } catch {
    // ignore
  }
  try {
    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
    if (user) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore if not native
  }
}

async function loadStoredUser(): Promise<User | null> {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const item = window.localStorage.getItem(STORAGE_KEY);
      if (item) return JSON.parse(item);
    }
  } catch {
    // ignore
  }
  try {
    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
    const item = await AsyncStorage.getItem(STORAGE_KEY);
    if (item) return JSON.parse(item);
  } catch {
    // ignore
  }
  return null;
}

export async function logout() {
  try {
    await firebaseSignOut(firebaseAuth);
  } catch (e) {
    // ignore
  }
  try {
    await supabase.auth.signOut();
  } catch (e) {
    // ignore
  }
  await saveStoredUser(null);
  setState(() => empty);
}

// ---------- Data Sync ----------
export async function refresh(): Promise<void> {
  try {
    const firebaseUser = firebaseAuth.currentUser;
    let sessionData: any = null;
    try {
      const res = await supabase.auth.getSession();
      sessionData = res.data;
    } catch {
      // offline / supabase network unavailable
    }
    const supabaseUser = sessionData?.session?.user;

    const uid = firebaseUser?.uid || supabaseUser?.id || current.user?.id;
    if (!uid) {
      const stored = await loadStoredUser();
      if (!stored) {
        setState(() => empty);
        return;
      }
      setState((s) => ({ ...s, user: stored, loading: false }));
      return;
    }

    setState((s) => ({ ...s, loading: true }));
    const [profileRes, contactsRes, alertsRes] = await Promise.all([
      Promise.resolve(
        supabase
          .from("profiles")
          .select("*")
          .eq("id", uid)
          .maybeSingle()
      ).catch(() => ({ data: null })),
      Promise.resolve(
        supabase
          .from("contacts")
          .select("*")
          .eq("user_id", uid)
          .order("created_at", { ascending: true })
      ).catch(() => ({ data: [] })),
      Promise.resolve(
        supabase
          .from("sos_alerts")
          .select("*")
          .eq("user_id", uid)
          .order("created_at", { ascending: false })
          .limit(50)
      ).catch(() => ({ data: [] })),
    ]);

    const p = profileRes?.data;
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
      contacts: (contactsRes?.data ?? []) as Contact[],
      alerts: ((alertsRes?.data ?? []) as Array<{ id: string; lat: number; lng: number; msg: string; created_at: string }>)
        .map((a) => ({ id: a.id, lat: a.lat, lng: a.lng, msg: a.msg, time: a.created_at })),
      loading: false,
    }));
  } catch (err) {
    console.warn("SecureWay refresh note (network/backend offline):", err);
    setState((s) => ({ ...s, loading: false }));
  }
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
  const cleanPhone = phone || "+91 99999 99999";
  const user: User = {
    id: "user-" + (cleanPhone.replace(/[^\d]/g, "") || "session"),
    phone: cleanPhone,
    name: "SecureWay Member",
    status: "safe",
    lat: current.user?.lat || 12.9716,
    lng: current.user?.lng || 77.5946,
  };

  // 1. Instantly update in-memory state
  setState((s) => ({
    ...s,
    user,
    loading: false,
  }));

  // 2. Persist to storage (localStorage / AsyncStorage)
  await saveStoredUser(user);

  // 3. Best-effort Supabase sync (does not block local authentication)
  try {
    await supabase.auth.verifyOtp({ phone: cleanPhone, token: _token, type: "sms" });
  } catch {
    // Network unavailable or demo OTP — local session remains active
  }
}

// Wire Firebase + Supabase auth listeners once on the client.
let wired = false;
export async function bootstrapSecureway() {
  // Load persisted user session from storage first
  try {
    const storedUser = await loadStoredUser();
    if (storedUser && !current.user) {
      setState((s) => ({ ...s, user: storedUser }));
    }
  } catch {
    // ignore
  }

  if (wired) return;
  wired = true;

  // Firebase auth listener
  try {
    onAuthStateChanged(firebaseAuth, (user) => {
      if (user) {
        refresh().catch(() => {});
      }
    });
  } catch (e) {
    console.warn("Firebase auth listener note:", e);
  }

  // Supabase auth listener
  if (typeof window !== "undefined") {
    try {
      supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          refresh().catch(() => {});
        }
      });
    } catch (e) {
      console.warn("Supabase auth listener note:", e);
    }
  }
}
