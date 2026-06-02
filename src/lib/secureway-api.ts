// HTTP client for the SecureWay Node/Express + SQLite backend.
// Base URL is read from localStorage("secureway:apiUrl") with a fallback to
// VITE_SECUREWAY_API_URL. Users can override it on the login screen.

const URL_KEY = "secureway:apiUrl";
const TOKEN_KEY = "secureway:token";

export function getApiUrl(): string {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(URL_KEY);
    if (stored) return stored.replace(/\/$/, "");
  }
  const envUrl = (import.meta as any).env?.VITE_SECUREWAY_API_URL as string | undefined;
  return (envUrl ?? "").replace(/\/$/, "");
}

export function setApiUrl(url: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(URL_KEY, url.trim().replace(/\/$/, ""));
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(t: string | null) {
  if (typeof window === "undefined") return;
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const base = getApiUrl();
  if (!base) throw new Error("Backend URL not set. Configure it on the sign-in screen.");
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${base}${path}`, { ...init, headers });
  const text = await res.text();
  const body = text ? safeJson(text) : null;
  if (!res.ok) {
    const msg = (body && (body.error || body.message)) || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return body as T;
}

function safeJson(t: string) {
  try { return JSON.parse(t); } catch { return null; }
}

// API surface — assumes a conventional Express shape. Adjust here if your
// backend uses different paths/payloads.
export type ApiUser = { id?: string; phone: string; name: string; status?: "safe" | "alert"; lat?: number; lng?: number };
export type ApiContact = { id: string; name: string; phone: string; relation: string };
export type ApiAlert = { id: string; lat: number; lng: number; msg?: string; time?: string; created_at?: string };

export const api = {
  sendOtp: (phone: string) =>
    request<{ ok: true }>("/api/auth/send-otp", { method: "POST", body: JSON.stringify({ phone }) }),
  verifyOtp: (phone: string, otp: string) =>
    request<{ token: string; user: ApiUser }>("/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ phone, otp }),
    }),
  me: () => request<{ user: ApiUser }>("/api/user/me"),
  listContacts: () => request<{ contacts: ApiContact[] }>("/api/contacts"),
  addContact: (c: Omit<ApiContact, "id">) =>
    request<{ contact: ApiContact }>("/api/contacts", { method: "POST", body: JSON.stringify(c) }),
  removeContact: (id: string) =>
    request<{ ok: true }>(`/api/contacts/${id}`, { method: "DELETE" }),
  triggerSos: (lat: number, lng: number) =>
    request<{ alert: ApiAlert }>("/api/sos", { method: "POST", body: JSON.stringify({ lat, lng }) }),
  clearSos: () => request<{ ok: true }>("/api/sos/clear", { method: "POST" }),
  sosHistory: () => request<{ alerts: ApiAlert[] }>("/api/sos/history"),
};
