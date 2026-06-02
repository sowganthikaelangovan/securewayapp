// Client-side cache for SecureWay state. Mutations call the backend
// (see secureway-api.ts) and then refresh the cache. Screens consume the
// cache via useSecureway().
import { useEffect, useState } from "react";
import { api, getToken, setToken, type ApiContact, type ApiAlert, type ApiUser } from "./secureway-api";

export type Contact = ApiContact;
export type SosAlert = { id: string; lat: number; lng: number; msg: string; time: string };
export type User = {
  phone: string;
  name: string;
  status: "safe" | "alert";
  lat: number;
  lng: number;
};

const CACHE_KEY = "secureway:cache:v2";

type State = { user: User | null; contacts: Contact[]; alerts: SosAlert[] };
const empty: State = { user: null, contacts: [], alerts: [] };

function normalizeUser(u: ApiUser | null | undefined): User | null {
  if (!u) return null;
  return {
    phone: u.phone,
    name: u.name ?? "User",
    status: (u.status as "safe" | "alert") ?? "safe",
    lat: u.lat ?? 12.9716,
    lng: u.lng ?? 77.5946,
  };
}

function normalizeAlert(a: ApiAlert): SosAlert {
  return {
    id: a.id,
    lat: a.lat,
    lng: a.lng,
    msg: a.msg ?? "Emergency SOS triggered",
    time: a.time ?? a.created_at ?? new Date().toISOString(),
  };
}

export function loadState(): State {
  if (typeof window === "undefined") return empty;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return empty;
    return JSON.parse(raw);
  } catch {
    return empty;
  }
}

function saveState(s: State) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CACHE_KEY, JSON.stringify(s));
  window.dispatchEvent(new Event("secureway:update"));
}

function patch(updater: (s: State) => State) {
  saveState(updater(loadState()));
}

export async function refresh(): Promise<State> {
  if (!getToken()) {
    saveState(empty);
    return empty;
  }
  const [meRes, contactsRes, historyRes] = await Promise.all([
    api.me().catch(() => null),
    api.listContacts().catch(() => ({ contacts: [] })),
    api.sosHistory().catch(() => ({ alerts: [] })),
  ]);
  const next: State = {
    user: normalizeUser(meRes?.user ?? null),
    contacts: contactsRes.contacts ?? [],
    alerts: (historyRes.alerts ?? []).map(normalizeAlert),
  };
  saveState(next);
  return next;
}

export async function sendOtp(phone: string) {
  await api.sendOtp(phone);
}

export async function verifyOtp(phone: string, otp: string) {
  const { token, user } = await api.verifyOtp(phone, otp);
  setToken(token);
  saveState({ user: normalizeUser(user) ?? null, contacts: [], alerts: [] });
  await refresh();
}

export function logout() {
  setToken(null);
  saveState(empty);
}

export async function addContact(c: Omit<Contact, "id">) {
  const { contact } = await api.addContact(c);
  patch((s) => ({ ...s, contacts: [...s.contacts, contact] }));
}

export async function removeContact(id: string) {
  await api.removeContact(id);
  patch((s) => ({ ...s, contacts: s.contacts.filter((c) => c.id !== id) }));
}

export async function recordSos(lat: number, lng: number) {
  const { alert } = await api.triggerSos(lat, lng);
  patch((s) => ({
    ...s,
    user: s.user ? { ...s.user, status: "alert" } : s.user,
    alerts: [normalizeAlert(alert), ...s.alerts],
  }));
}

export async function clearAlert() {
  try { await api.clearSos(); } catch { /* non-fatal */ }
  patch((s) => ({ ...s, user: s.user ? { ...s.user, status: "safe" } : s.user }));
}

export function useSecureway() {
  const [state, setState] = useState<State>(empty);
  useEffect(() => {
    setState(loadState());
    const onUpdate = () => setState(loadState());
    window.addEventListener("secureway:update", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("secureway:update", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);
  return state;
}
