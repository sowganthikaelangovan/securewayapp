import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bell, Lock, HelpCircle, Info, LogOut, ChevronRight, Pencil } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useSecureway, logout } from "@/lib/secureway-store";

export const Route = createFileRoute("/app/profile")({
  head: () => ({ meta: [{ title: "Profile · SecureWay" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, contacts, alerts } = useSecureway();
  const navigate = useNavigate();

  return (
    <AppShell title="Profile">
      <div className="rounded-3xl bg-gradient-emergency text-primary-foreground p-6 shadow-sos">
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-2xl bg-primary-foreground/20 grid place-items-center font-display text-2xl font-bold">
            {user?.name?.charAt(0) ?? "U"}
          </div>
          <div className="flex-1">
            <p className="text-xl font-semibold">{user?.name}</p>
            <p className="text-sm opacity-90">{user?.phone}</p>
          </div>
          <button className="size-10 rounded-full bg-primary-foreground/20 grid place-items-center"><Pencil className="size-4" /></button>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          <Stat label="Contacts" value={contacts.length} />
          <Stat label="SOS sent" value={alerts.length} />
          <Stat label="Status" value={user?.status === "alert" ? "Alert" : "Safe"} />
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <Row icon={Bell} label="Notifications" hint="Manage how SecureWay alerts you" />
        <Row icon={Lock} label="Privacy & data" hint="Control who sees your location" />
        <Row icon={HelpCircle} label="Help & support" hint="FAQs and contact us" />
        <Row icon={Info} label="About SecureWay" hint="Version 1.0 · Demo build" />
      </div>

      <button
        onClick={() => { logout(); navigate({ to: "/app/login" }); }}
        className="mt-6 w-full rounded-full border border-emergency/30 text-emergency py-3 font-semibold inline-flex items-center justify-center gap-2 hover:bg-emergency/10"
      >
        <LogOut className="size-4" /> Sign out
      </button>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-2xl bg-primary-foreground/15 backdrop-blur py-3">
      <p className="font-display text-xl font-bold">{value}</p>
      <p className="text-xs opacity-80">{label}</p>
    </div>
  );
}

function Row({ icon: Icon, label, hint }: any) {
  return (
    <button className="w-full flex items-center gap-4 rounded-2xl bg-card border border-border p-4 shadow-card hover:bg-muted/40 text-left">
      <div className="size-10 rounded-xl bg-muted grid place-items-center text-muted-foreground"><Icon className="size-5" /></div>
      <div className="flex-1">
        <p className="font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <ChevronRight className="size-5 text-muted-foreground" />
    </button>
  );
}
