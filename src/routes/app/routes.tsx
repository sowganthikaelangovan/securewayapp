import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Star, Clock, Footprints, Lightbulb, Search, MapPin, Loader2, Navigation } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useSecureway } from "@/lib/secureway-store";
import { getCurrentLiveLocation, reverseGeocodeCoords } from "@/lib/location-service";
import { calculateSafeRoutes, ComputedRoute } from "@/lib/maps-service";

export const Route = createFileRoute("/app/routes")({
  head: () => ({ meta: [{ title: "Safe routes · SecureWay" }] }),
  component: RoutesPage,
});

function RoutesPage() {
  const { user } = useSecureway();
  const [destination, setDestination] = useState("");
  const [originAddress, setOriginAddress] = useState<string>("Current Location");
  const [computedRoutes, setComputedRoutes] = useState<ComputedRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user?.lat && user?.lng && user.lat !== 0) {
      reverseGeocodeCoords(user.lat, user.lng).then(setOriginAddress).catch(() => {});
    } else {
      getCurrentLiveLocation().then((loc) => {
        if (loc) reverseGeocodeCoords(loc.lat, loc.lng).then(setOriginAddress).catch(() => {});
      });
    }
  }, [user?.lat, user?.lng]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      let origin = { lat: user?.lat ?? 0, lng: user?.lng ?? 0 };
      if (origin.lat === 0 && origin.lng === 0) {
        const fresh = await getCurrentLiveLocation();
        if (fresh) origin = fresh;
        else throw new Error("Please enable location access to find safe routes from your position.");
      }

      const results = await calculateSafeRoutes(origin, destination);
      setComputedRoutes(results);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to calculate routes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="Safe routes">
      <p className="text-sm text-muted-foreground">
        Calculate real well-lit and populated paths from your live location to any destination.
      </p>

      {/* Start Location Pill */}
      <div className="mt-4 flex items-center gap-2.5 rounded-2xl bg-info/10 border border-info/20 p-3.5 text-xs">
        <MapPin className="size-4 text-info shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-info uppercase tracking-wider text-[10px]">Start Location</p>
          <p className="truncate text-foreground font-medium mt-0.5">{originAddress}</p>
        </div>
      </div>

      {/* Destination Form */}
      <form onSubmit={handleSearch} className="mt-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Search street, cafe, or destination..."
            className="w-full rounded-2xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-info/50"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !destination.trim()}
          className="rounded-2xl bg-info px-4 py-2.5 text-sm font-semibold text-info-foreground shadow-sm disabled:opacity-50 inline-flex items-center gap-1.5"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : "Search"}
        </button>
      </form>

      {errorMsg && (
        <div className="mt-4 rounded-2xl bg-destructive/15 border border-destructive/30 p-3.5 text-xs text-destructive">
          {errorMsg}
        </div>
      )}

      {/* Calculated Routes List */}
      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="py-12 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
            <Loader2 className="size-6 animate-spin text-info" />
            <p>Computing safe walking corridors via Google Maps...</p>
          </div>
        ) : computedRoutes.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground border border-dashed border-border rounded-3xl p-6">
            <Navigation className="size-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="font-semibold text-foreground">No Route Calculated Yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Type a destination above to evaluate well-lit paths.</p>
          </div>
        ) : (
          computedRoutes.map((r) => (
            <div key={r.id} className="rounded-3xl bg-card border border-border p-5 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{r.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{r.startAddress} → {r.endAddress}</p>
                </div>
                <div className="shrink-0 rounded-full px-3 py-1 text-sm font-semibold inline-flex items-center gap-1 bg-safe/15 text-safe-foreground">
                  <Star className="size-3.5 fill-current" /> {r.safetyScore}% Safe
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                <Tag icon={Clock} label={`${r.duration} (${r.distance})`} />
                <Tag icon={Footprints} label={`${r.crowdLevel} activity`} />
                <Tag icon={Lightbulb} label={`${r.litLevel} lighting`} />
              </div>
              <button
                onClick={() => alert(`Navigation started for ${r.name}!`)}
                className="mt-4 w-full rounded-full bg-foreground text-background py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Start navigation
              </button>
            </div>
          ))
        )}
      </div>
    </AppShell>
  );
}

function Tag({ icon: Icon, label }: any) {
  return (
    <div className="rounded-xl bg-muted/60 px-2.5 py-2 flex items-center gap-1.5 text-muted-foreground">
      <Icon className="size-3.5 shrink-0" />
      <span className="truncate">{label}</span>
    </div>
  );
}
