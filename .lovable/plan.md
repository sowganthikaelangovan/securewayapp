## What I'll build

Replace the demo's localStorage + custom Express assumption with a real, multi-device backend on **Lovable Cloud** (Postgres + Supabase Auth). The `/app` UI stays the same; only data + auth change.

### 1. Enable Lovable Cloud
Provisions Postgres, Auth, and the generated Supabase clients (`@/integrations/supabase/client`, `auth-middleware`, `client.server`).

### 2. Database schema (one migration)

```text
profiles
  id uuid PK = auth.users.id
  phone text, name text, status text default 'safe'
  lat double precision, lng double precision
  updated_at timestamptz

contacts
  id uuid PK, user_id uuid → auth.users
  name text, phone text, relation text
  created_at timestamptz

sos_alerts
  id uuid PK, user_id uuid → auth.users
  lat double precision, lng double precision
  msg text, status text default 'active'
  created_at timestamptz, cleared_at timestamptz
```

- RLS enabled on all three; policies scope every row to `auth.uid() = user_id` (and `id` for profiles).
- GRANTs to `authenticated` + `service_role` (no anon).
- Trigger: on new `auth.users`, auto-insert a `profiles` row using `raw_user_meta_data.phone`.

### 3. Phone OTP authentication
Use Supabase Auth's built-in phone OTP:
- `supabase.auth.signInWithOtp({ phone })` — sends SMS
- `supabase.auth.verifyOtp({ phone, token, type: 'sms' })` — creates a session

**You need to configure Twilio once in Cloud → Users → Auth Settings → Phone Provider** (Account SID, Auth Token, Messaging Service SID). Until that's done, OTP SMS won't actually deliver — I'll surface a clear error in the UI if sending fails.

### 4. Replace `secureway-store.ts` + `secureway-api.ts`
New `secureway-data.ts` exposes the same hook surface (`useSecureway()`, `addContact`, `removeContact`, `recordSos`, `clearAlert`, `refresh`, `logout`) but talks to Supabase via the browser client. Realtime subscription on `contacts` and `sos_alerts` so the UI updates instantly.

Drop the old "Backend URL" input from the login screen — no longer needed.

### 5. UI changes (minimal)
- `login.tsx`: keep splash → phone → OTP flow, but call real Supabase methods. Show "set up Twilio" hint on send failure.
- `AppShell.tsx`: redirect to `/login` based on `supabase.auth.getSession()` instead of localStorage; subscribe to `onAuthStateChange`.
- `contacts.tsx`, `index.tsx`, `profile.tsx`: unchanged except for the async handlers already in place — they'll just hit Supabase now.
- `location.tsx`: persists `lat/lng` to `profiles` when the browser grants geolocation; falls back to the seeded coords.

### 6. Root subscriber
Add `onAuthStateChange` in `__root.tsx` to invalidate the router + react-query cache on sign-in/out (per TanStack + Supabase guidance).

## What you'll need to do after I'm done

1. **Configure Twilio** in Cloud → Users → Auth Settings → Phone Provider (one-time, ~2 minutes). Without it, OTP SMS won't send.
2. Test with your real phone number.

## Technical notes

- Browser uses `@/integrations/supabase/client` directly — no server functions needed for this CRUD (RLS does the protection). Faster to ship, and the realtime subscription pattern requires the browser client anyway.
- The `profiles` insert trigger means we don't need a server function to create profiles on signup.
- I'll delete `secureway-api.ts` and the old localStorage `secureway-store.ts`.

Confirm and I'll execute.