import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Users, Route as RouteIcon, ShieldCheck, X, PhoneCall } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useSecureway, recordSos, clearAlert } from "@/lib/secureway-store";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Home · SecureWay" }] }),
  component: AppHome,
});

function AppHome() {
  const { user, contacts } = useSecureway();
  const [sosOpen, setSosOpen] = useState(false);

  const triggerSos = async () => {
    setSosOpen(true);
    try {
      await recordSos(user?.lat ?? 12.9716, user?.lng ?? 77.5946);
    } catch (err) {
      console.error("SOS failed", err);
    }
  };

  return (
    <AppShell title={`Hi, ${user?.name?.split(" ")[0] ?? "there"}`}>
      <div className={`rounded-3xl p-5 shadow-card ${user?.status === "alert" ? "bg-emergency/10" : "bg-safe/15"}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Current status</p>
            <p className="text-2xl font-semibold mt-1">
              {user?.status === "alert" ? "Alert active" : "You're safe"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {user?.status === "alert"
                ? "Your trusted contacts have been notified."
                : "Tap the SOS button below in an emergency."}
            </p>
          </div>
          <div className={`size-10 rounded-full grid place-items-center ${user?.status === "alert" ? "bg-emergency text-emergency-foreground animate-pulse" : "bg-safe text-safe-foreground"}`}>
            <ShieldCheck className="size-5" />
          </div>
        </div>
        {user?.status === "alert" && (
          <button
            onClick={() => clearAlert()}
            className="mt-4 w-full rounded-full bg-card border border-border py-2.5 text-sm font-medium"
          >
            I'm safe now — clear alert
          </button>
        )}
      </div>

      {/* SOS button */}
      <div className="mt-10 grid place-items-center">
        <button
          onClick={triggerSos}
          className="size-56 rounded-full bg-gradient-emergency text-primary-foreground font-display text-5xl font-bold tracking-widest animate-sos-pulse active:scale-95 transition-transform"
        >
          SOS
        </button>
        <p className="mt-4 text-sm text-muted-foreground">Tap to alert your circle instantly</p>
      </div>

      {/* Quick actions */}
      <div className="mt-10 space-y-3">
        <p className="text-sm font-medium text-muted-foreground px-1">Quick actions</p>
        <QuickAction to="/app/location" icon={MapPin} title="Share live location" subtitle="Let your circle follow your route" tint="bg-info/15 text-info" />
        <QuickAction to="/app/contacts" icon={Users} title="Emergency contacts" subtitle={`${contacts.length} trusted ${contacts.length === 1 ? "person" : "people"}`} tint="bg-violet/15 text-violet" />
        <QuickAction to="/app/routes" icon={RouteIcon} title="Find a safe route" subtitle="Curated, well-lit paths near you" tint="bg-warn/20 text-warn-foreground" />
      </div>

      {sosOpen && <SosModal contacts={contacts} onClose={() => setSosOpen(false)} />}
    </AppShell>
  );
}

function QuickAction({ to, icon: Icon, title, subtitle, tint }: { to: string; icon: any; title: string; subtitle: string; tint: string }) {
  return (
    <Link to={to} className="flex items-center gap-4 rounded-2xl bg-card border border-border p-4 shadow-card hover:bg-muted/40 transition-colors">
      <div className={`size-12 rounded-2xl grid place-items-center ${tint}`}>
        <Icon className="size-5" />
      </div>
      <div className="flex-1">
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </Link>
  );
}

function SosModal({ contacts, onClose }: { contacts: { id: string; name: string; phone: string }[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm grid place-items-center p-5">
      <div className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-card animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between">
          <div className="size-12 rounded-2xl bg-emergency/15 text-emergency grid place-items-center">
            <ShieldCheck className="size-6" />
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted">
            <X className="size-5" />
          </button>
        </div>
        <h2 className="mt-4 text-2xl font-semibold">SOS sent</h2>
        <p className="mt-1 text-muted-foreground text-sm">
          Your live location was shared with {contacts.length} emergency contact{contacts.length === 1 ? "" : "s"}.
        </p>
        <div className="mt-5 space-y-2">
          {contacts.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3">
              <div>
                <p className="font-medium text-sm">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.phone}</p>
              </div>
              <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="size-9 rounded-full bg-safe text-safe-foreground grid place-items-center">
                <PhoneCall className="size-4" />
              </a>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="mt-6 w-full rounded-full bg-foreground text-background py-3 font-medium">
          Close
        </button>
      </div>
    </div>
  );
}
