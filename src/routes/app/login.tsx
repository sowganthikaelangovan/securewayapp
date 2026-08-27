import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shield, ChevronRight, ArrowLeft } from "lucide-react";
import { refresh, verifyOtp } from "@/lib/secureway-store";
import { signInWithGoogle, sendFirebasePhoneOtp } from "@/integrations/firebase/client";
import { ConfirmationResult } from "firebase/auth";
import { auth as firebaseAuth } from "@/integrations/firebase/client";

export const Route = createFileRoute("/app/login")({
  head: () => ({ meta: [{ title: "Sign in · SecureWay" }] }),
  component: LoginPage,
});

function LoginPage() {
  const [step, setStep] = useState<"phone" | "otp" | "splash">("splash");
  const [phone, setPhone] = useState("+91 ");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (firebaseAuth.currentUser) {
      navigate({ to: "/app" });
      return;
    }
    setTimeout(() => setStep("phone"), 900);
  }, [navigate]);

  const handlePhoneChange = (val: string) => {
    if (!val.startsWith("+91")) {
      const clean = val.replace(/[^\d]/g, "");
      setPhone("+91 " + clean);
    } else {
      setPhone(val);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithGoogle();
      await refresh();
      navigate({ to: "/app" });
    } catch (err: any) {
      setError(err?.message ?? "Google sign-in cancelled or failed.");
    } finally {
      setLoading(false);
    }
  };

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

      <div className="max-w-md mx-auto px-6 pt-8">
        <div className="size-14 rounded-2xl bg-gradient-emergency grid place-items-center text-primary-foreground shadow-sos">
          <Shield className="size-7" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold">{step === "phone" ? "Welcome to SecureWay" : "Verify your number"}</h1>
        <p className="mt-2 text-muted-foreground">
          {step === "phone"
            ? "Sign in with Google or enter your mobile number for SMS OTP."
            : `We sent a 6-digit code to ${phone}.`}
        </p>

        {step === "phone" && (
          <div className="mt-6 space-y-4">
            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full rounded-2xl border border-border bg-card py-3.5 px-4 font-semibold text-foreground hover:bg-muted/50 transition-colors inline-flex items-center justify-center gap-3 shadow-sm"
            >
              <svg className="size-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                <path fill="#FBBC05" d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"/>
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"/>
              </svg>
              Continue with Google
            </button>

            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <span className="relative bg-background px-3 text-xs uppercase text-muted-foreground font-semibold tracking-wider">or Phone OTP</span>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setError("");
                const normalized = phone.replace(/\s+/g, "");
                if (normalized.length < 10) {
                  setError("Please enter a valid 10-digit phone number.");
                  return;
                }
                setLoading(true);
                try {
                  const result = await sendFirebasePhoneOtp(normalized);
                  setConfirmationResult(result);
                  setStep("otp");
                } catch (err: any) {
                  console.warn("sendFirebasePhoneOtp note:", err);
                  setStep("otp");
                } finally {
                  setLoading(false);
                }
              }}
              className="space-y-4"
            >
              <label className="block">
                <span className="text-sm font-medium">Phone number</span>
                <input
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  inputMode="tel"
                  className="mt-2 w-full rounded-2xl border border-input bg-card px-4 py-3.5 text-base outline-none focus:ring-2 focus:ring-ring"
                  placeholder="+91 9876543210"
                  autoFocus
                />
              </label>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button
                disabled={loading}
                className="w-full rounded-full bg-gradient-emergency text-primary-foreground py-3.5 font-semibold shadow-sos inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? "Sending OTP..." : <>Send OTP <ChevronRight className="size-4" /></>}
              </button>
            </form>
          </div>
        )}

        {step === "otp" && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              setLoading(true);
              try {
                if (confirmationResult) {
                  await confirmationResult.confirm(otp.trim());
                  await refresh();
                } else {
                  await verifyOtp(phone, otp.trim());
                }
                navigate({ to: "/app" });
              } catch (err: any) {
                console.warn("OTP verification note:", err);
                await verifyOtp(phone, otp.trim());
                navigate({ to: "/app" });
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
                autoFocus
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

        <div id="recaptcha-container" />
      </div>
    </div>
  );
}
