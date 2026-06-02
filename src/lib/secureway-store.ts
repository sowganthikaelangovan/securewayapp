// Tiny localStorage-backed demo store for SecureWay
export type Contact = { id: string; name: string; phone: string; relation: string };
export type SosAlert = { id: string; lat: number; lng: number; msg: string; time: string };
export type User = {
  phone: string;
  name: string;
  status: "safe" | "alert";
  lat: number;
  lng: number;
};

const KEY = "secureway:state:v1";

type State = {
  user: User | null;
  contacts: Contact[];
  alerts: SosAlert[];
};

const seed = (phone: string): State => ({
  user: {
    phone,
    name: "Sarah Johnson",
    status: "safe",
    lat: 12.9716,
    lng: 77.5946,
  },
  contacts: [
    { id: "1", name: "Mom", phone: "+91 98765 43210", relation: "Family" },
    { id: "2", name: "Best Friend", phone: "+91 91234 56789", relation: "Friend" },
    { id: "3", name: "Brother", phone: "+91 87654 32109", relation: "Family" },
  ],
  alerts: [],
});

const empty: State = { user: null, contacts: [], alerts: [] };

export function loadState(): State {
  if (typeof window === "undefined") return empty;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty;
    return JSON.parse(raw);
  } catch {
    return empty;
  }
}

export function saveState(s: State) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new Event("secureway:update"));
}

export function login(phone: string) {
  const next = seed(phone);
  saveState(next);
}

export function logout() {
  saveState(empty);
}

export function addContact(c: Omit<Contact, "id">) {
  const s = loadState();
  s.contacts.push({ ...c, id: crypto.randomUUID() });
  saveState(s);
}

export function removeContact(id: string) {
  const s = loadState();
  s.contacts = s.contacts.filter((c) => c.id !== id);
  saveState(s);
}

export function recordSos(lat: number, lng: number) {
  const s = loadState();
  s.alerts.unshift({
    id: crypto.randomUUID(),
    lat,
    lng,
    msg: "Emergency SOS triggered",
    time: new Date().toISOString(),
  });
  if (s.user) s.user.status = "alert";
  saveState(s);
}

export function clearAlert() {
  const s = loadState();
  if (s.user) s.user.status = "safe";
  saveState(s);
}

import { useEffect, useState } from "react";
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
