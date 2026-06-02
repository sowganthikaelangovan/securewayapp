// Supabase-backed data layer for SecureWay.
// Exposes the same hook surface as the previous demo store so screens don't change.
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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

// ---------- Auth ----------
export async function sendOtp(phone: string) {
  const { error } = await supabase.auth.signInWithOtp({
    phone,
    options: { channel: "sms" },
  });
  if (error) throw error;
}

export async function verifyOtp(phone: string, token: string) {
  const { error } = await supabase.auth.verifyOtp({ phone, token, type: "sms" });
  if (error) throw error;
  await refresh();
}

export async function logout() {
  await supabase.auth.signOut();
  setState(() => empty);
}

// ---------- Data ----------
export async function refresh(): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (!session) {
    setState(() => empty);
    return;
  }
  setState((s) => ({ ...s, loading: true }));
  const [profileRes, contactsRes, alertsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle(),
    supabase.from("contacts").select("*").order("created_at", { ascending: true }),
    supabase.from("sos_alerts").select("*").order("created_at", { ascending: false }).limit(50),
  ]);
  const p = profileRes.data;
  const user: User | null = p
    ? {
        id: p.id,
        phone: p.phone ?? session.user.phone ?? "",
        name: p.name ?? "You",
        status: (p.status as "safe" | "alert") ?? "safe",
        lat: p.lat ?? 12.9716,
        lng: p.lng ?? 77.5946,
      }
    : {
        id: session.user.id,
        phone: session.user.phone ?? "",
        name: "You",
        status: "safe",
        lat: 12.9716,
        lng: 77.5946,
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
  const { data: sessionData } = await supabase.auth.getSession();
  const uid = sessionData.session?.user.id;
  if (!uid) throw new Error("Not signed in");
  const { data, error } = await supabase
    .from("contacts")
    .insert({ user_id: uid, name: c.name, phone: c.phone, relation: c.relation })
    .select()
    .single();
  if (error) throw error;
  setState((s) => ({ ...s, contacts: [...s.contacts, data as Contact] }));
}

export async function removeContact(id: string) {
  const { error } = await supabase.from("contacts").delete().eq("id", id);
  if (error) throw error;
  setState((s) => ({ ...s, contacts: s.contacts.filter((c) => c.id !== id) }));
}

export async function recordSos(lat: number, lng: number) {
  const { data: sessionData } = await supabase.auth.getSession();
  const uid = sessionData.session?.user.id;
  if (!uid) throw new Error("Not signed in");
  const { data, error } = await supabase
    .from("sos_alerts")
    .insert({ user_id: uid, lat, lng })
    .select()
    .single();
  if (error) throw error;
  await supabase.from("profiles").update({ status: "alert", lat, lng, updated_at: new Date().toISOString() }).eq("id", uid);
  setState((s) => ({
    ...s,
    user: s.user ? { ...s.user, status: "alert", lat, lng } : s.user,
    alerts: [
      { id: data.id, lat: data.lat, lng: data.lng, msg: data.msg, time: data.created_at },
      ...s.alerts,
    ],
  }));
}

export async function clearAlert() {
  const { data: sessionData } = await supabase.auth.getSession();
  const uid = sessionData.session?.user.id;
  if (!uid) return;
  await supabase.from("profiles").update({ status: "safe", updated_at: new Date().toISOString() }).eq("id", uid);
  await supabase
    .from("sos_alerts")
    .update({ status: "cleared", cleared_at: new Date().toISOString() })
    .eq("user_id", uid)
    .eq("status", "active");
  setState((s) => ({ ...s, user: s.user ? { ...s.user, status: "safe" } : s.user }));
}

export async function updateMyLocation(lat: number, lng: number) {
  const { data: sessionData } = await supabase.auth.getSession();
  const uid = sessionData.session?.user.id;
  if (!uid) return;
  await supabase.from("profiles").update({ lat, lng, updated_at: new Date().toISOString() }).eq("id", uid);
  setState((s) => ({ ...s, user: s.user ? { ...s.user, lat, lng } : s.user }));
}

export async function updateMyName(name: string) {
  const { data: sessionData } = await supabase.auth.getSession();
  const uid = sessionData.session?.user.id;
  if (!uid) return;
  const { error } = await supabase.from("profiles").update({ name }).eq("id", uid);
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

// Wire realtime + auth listener once on the client.
let wired = false;
export function bootstrapSecureway() {
  if (typeof window === "undefined" || wired) return;
  wired = true;

  supabase.auth.onAuthStateChange((_event, session) => {
    if (!session) {
      setState(() => empty);
    } else {
      refresh().catch(() => { /* ignore */ });
    }
  });

  // Realtime updates for the signed-in user's rows.
  supabase
    .channel("secureway-contacts")
    .on("postgres_changes", { event: "*", schema: "public", table: "contacts" }, () => {
      refresh().catch(() => {});
    })
    .subscribe();

  supabase
    .channel("secureway-sos")
    .on("postgres_changes", { event: "*", schema: "public", table: "sos_alerts" }, () => {
      refresh().catch(() => {});
    })
    .subscribe();

  supabase
    .channel("secureway-profiles")
    .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
      refresh().catch(() => {});
    })
    .subscribe();

  refresh().catch(() => {});
}
