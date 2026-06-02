import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Home, Users, MapPin, Route as RouteIcon, User as UserIcon, LogOut } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useSecureway, logout } from "@/lib/secureway-store";

const tabs = [
  { to: "/app", label: "Home", icon: Home, exact: true },
  { to: "/app/contacts", label: "Contacts", icon: Users },
  { to: "/app/location", label: "Location", icon: MapPin },
  { to: "/app/routes", label: "Routes", icon: RouteIcon },
  { to: "/app/profile", label: "Profile", icon: UserIcon },
];

export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  const state = useSecureway();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!state.user && typeof window !== "undefined") {
      // hydration-safe: only redirect after first paint if no user
      const t = setTimeout(() => {
        if (!loadCheck()) navigate({ to: "/app/login" });
      }, 50);
      return () => clearTimeout(t);
    }
  }, [state.user, navigate]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="max-w-md mx-auto px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">SecureWay</p>
            <h1 className="text-xl font-semibold">{title ?? "Home"}</h1>
          </div>
          <button
            onClick={() => { logout(); navigate({ to: "/app/login" }); }}
            className="p-2 rounded-full hover:bg-muted text-muted-foreground"
            aria-label="Sign out"
          >
            <LogOut className="size-5" />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-5 pt-6">{children}</main>

      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[min(420px,calc(100%-2rem))]">
        <div className="bg-card/95 backdrop-blur-xl border border-border shadow-card rounded-full px-3 py-2 flex items-center justify-between">
          {tabs.map((t) => {
            const active = t.exact
              ? location.pathname === t.to
              : location.pathname.startsWith(t.to);
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-full transition-colors ${
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                <Icon className="size-5" />
                <span className="text-[10px] font-medium">{t.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function loadCheck() {
  try {
    const raw = localStorage.getItem("secureway:state:v1");
    if (!raw) return false;
    return !!JSON.parse(raw).user;
  } catch {
    return false;
  }
}
