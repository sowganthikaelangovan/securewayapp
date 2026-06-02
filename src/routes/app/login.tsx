import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shield, ChevronRight, ArrowLeft, Server } from "lucide-react";
import { sendOtp, verifyOtp } from "@/lib/secureway-store";
import { getApiUrl, setApiUrl } from "@/lib/secureway-api";

export const Route = createFileRoute("/app/login")({
  head: () => ({ meta: [{ title: "Sign in · SecureWay" }] }),
  component: LoginPage,
});

function LoginPage() {
  const [step, setStep] = useState<"phone" | "otp" | "splash">("splash");
  const [phone, setPhone] = useState("+91 99999 99999");
  const [otp, setOtp] = useState("");
  const [apiUrl, setApiUrlState] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setApiUrlState(getApiUrl());
    const t = setTimeout(() => setStep("phone"), 1200);
    return () => clearTimeout(t);
  }, []);

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
        <h1 className="mt-6 text-3xl font-semibold">{step === "phone" ? "Welcome back" : "Verify your number"}</h1>
        <p className="mt-2 text-muted-foreground">
          {step === "phone"
            ? "Sign in with your phone number to access your safety circle."
            : `We sent a 6-digit code to ${phone}.`}
        </p>

        {step === "phone" && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              if (!apiUrl.trim()) {
                setError("Set your backend URL first.");
                return;
              }
              setApiUrl(apiUrl);
              setLoading(true);
              try {
                await sendOtp(phone);
                setStep("otp");
              } catch (err: any) {
                setError(err?.message ?? "Failed to reach backend.");
              } finally {
                setLoading(false);
              }
            }}
            className="mt-8 space-y-4"
          >
            <label className="block">
              <span className="text-sm font-medium inline-flex items-center gap-1.5">
                <Server className="size-3.5" /> Backend URL
              </span>
              <input
                value={apiUrl}
                onChange={(e) => setApiUrlState(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm font-mono outline-none focus:ring-2 focus:ring-ring"
                placeholder="https://your-backend.example.com"
              />
              <span className="text-xs text-muted-foreground mt-1 block">
                Your Express + SQLite server. Saved on this device.
              </span>
            </label>

            <label className="block">
              <span className="text-sm font-medium">Phone number</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-input bg-card px-4 py-3.5 text-base outline-none focus:ring-2 focus:ring-ring"
                placeholder="+91 99999 99999"
              />
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
              disabled={loading || otp.length < 4}
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
