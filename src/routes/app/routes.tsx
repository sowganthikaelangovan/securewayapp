import { createFileRoute } from "@tanstack/react-router";
import { Star, Clock, Footprints, Lightbulb, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/app/routes")({
  head: () => ({ meta: [{ title: "Safe routes · SecureWay" }] }),
  component: RoutesPage,
});

const routes = [
  {
    name: "MG Road → Indiranagar",
    rating: 4.8,
    time: "18 min",
    foot: "High foot traffic",
    light: "Well-lit",
    note: "Popular evening route, lots of cafés open until midnight.",
    tint: "bg-safe/15 text-safe-foreground",
  },
  {
    name: "Koramangala → HSR Layout",
    rating: 4.6,
    time: "22 min",
    foot: "Moderate foot traffic",
    light: "Well-lit",
    note: "Police checkpoint at the midpoint, recently rated safer.",
    tint: "bg-info/15 text-info",
  },
  {
    name: "Brigade Road → Lavelle Road",
    rating: 4.5,
    time: "12 min",
    foot: "High foot traffic",
    light: "Brightly lit",
    note: "Main shopping street, busy until late.",
    tint: "bg-violet/15 text-violet",
  },
];

function RoutesPage() {
  return (
    <AppShell title="Safe routes">
      <p className="text-sm text-muted-foreground">Community-rated paths near you, scored on lighting, foot traffic, and recent safety reports.</p>

      <div className="mt-6 space-y-4">
        {routes.map((r) => (
          <div key={r.name} className="rounded-3xl bg-card border border-border p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{r.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{r.note}</p>
              </div>
              <div className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold inline-flex items-center gap-1 ${r.tint}`}>
                <Star className="size-3.5 fill-current" /> {r.rating}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <Tag icon={Clock} label={r.time} />
              <Tag icon={Footprints} label={r.foot} />
              <Tag icon={Lightbulb} label={r.light} />
            </div>
            <button className="mt-4 w-full rounded-full bg-foreground text-background py-2.5 text-sm font-medium">
              Start navigation
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-3xl bg-gradient-violet text-primary-foreground p-5 shadow-card">
        <div className="flex items-center gap-3">
          <Users className="size-5" />
          <p className="font-semibold">Powered by community ratings</p>
        </div>
        <p className="mt-2 text-sm opacity-90">Routes are rated by thousands of women walking these streets. Add your own rating after each trip.</p>
      </div>
    </AppShell>
  );
}

function Tag({ icon: Icon, label }: any) {
  return (
    <div className="rounded-xl bg-muted/60 px-2.5 py-2 flex items-center gap-1.5 text-muted-foreground">
      <Icon className="size-3.5" />
      <span className="truncate">{label}</span>
    </div>
  );
}
