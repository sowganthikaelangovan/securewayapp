import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shield, ChevronRight, ArrowLeft } from "lucide-react";
import { sendOtp, verifyOtp } from "@/lib/secureway-store";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/app/login")({
  head: () => ({ meta: [{ title: "Sign in · SecureWay" }] }),
  component: LoginPage,
});

function LoginPage() {
  const [step, setStep] = useState<"phone" | "otp" | "splash">("splash");
  const [phone, setPhone] = useState("+91");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate({ to: "/app" });
        return;
      }
      setTimeout(() => setStep("phone"), 900);
    });
  }, [navigate]);

  if (step === "splash") {
    return (
      <div className="min-h-screen bg-gradient-emergency grid place-items-center text-primary-foreground">
        <div className="text-center animate-in fade-in zoom-in duration-700">
          <div className="size-24 rounded-3xl bg-primary-foreground/15 backdrop-blur grid place-items-center mx-auto">
            <Shield className="size-12" />
          </div>
          <h1 className="mt-6 font-display text-4xl font-bold tracking-tight">SecureWay</h1>
          <p className="mt-2 opacity-80">Your safety, one tap away</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-6 pt-6">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back
        </Link>
      </div>

      <div className="max-w-md mx-auto px-6 pt-10">
        <div className="size-14 rounded-2xl bg-gradient-emergency grid place-items-center text-primary-foreground shadow-sos">
          <Shield className="size-7" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold">{step === "phone" ? "Welcome" : "Verify your number"}</h1>
        <p className="mt-2 text-muted-foreground">
          {step === "phone"
            ? "Sign in with your phone number. We'll text you a verification code."
            : `We sent a 6-digit code to ${phone}.`}
        </p>

        {step === "phone" && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              const normalized = phone.replace(/\s+/g, "");
              if (!/^\+\d{8,15}$/.test(normalized)) {
                setError("Use international format, e.g. +14155551234");
                return;
              }
              setLoading(true);
              try {
                await sendOtp(normalized);
                setPhone(normalized);
                setStep("otp");
              } catch (err: any) {
                const msg = err?.message ?? "Failed to send OTP.";
                setError(
                  /provider|sms|twilio|disabled/i.test(msg)
                    ? "SMS provider isn't configured yet. Set up Twilio in Cloud → Users → Auth Settings → Phone."
                    : msg
                );
              } finally {
                setLoading(false);
              }
            }}
            className="mt-8 space-y-4"
          >
            <label className="block">
              <span className="text-sm font-medium">Phone number</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                className="mt-2 w-full rounded-2xl border border-input bg-card px-4 py-3.5 text-base outline-none focus:ring-2 focus:ring-ring"
                placeholder="+14155551234"
              />
              <span className="text-xs text-muted-foreground mt-1 block">
                Include country code (e.g. +91 for India, +1 for US).
              </span>
            </label>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button
              disabled={loading}
              className="w-full rounded-full bg-gradient-emergency text-primary-foreground py-3.5 font-semibold shadow-sos inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? "Sending..." : <>Send OTP <ChevronRight className="size-4" /></>}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              setLoading(true);
              try {
                await verifyOtp(phone, otp.trim());
                navigate({ to: "/app" });
              } catch (err: any) {
                setError(err?.message ?? "Verification failed.");
              } finally {
                setLoading(false);
              }
            }}
            className="mt-8 space-y-4"
          >
            <label className="block">
              <span className="text-sm font-medium">6-digit code</span>
              <input
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="mt-2 w-full rounded-2xl border border-input bg-card px-4 py-3.5 text-2xl tracking-[0.5em] text-center font-mono outline-none focus:ring-2 focus:ring-ring"
                placeholder="••••••"
              />
            </label>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button
              disabled={loading || otp.length < 6}
              className="w-full rounded-full bg-gradient-emergency text-primary-foreground py-3.5 font-semibold shadow-sos disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify & continue"}
            </button>
            <button
              type="button"
              onClick={() => setStep("phone")}
              className="w-full text-sm text-muted-foreground hover:text-foreground"
            >
              Change phone number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
