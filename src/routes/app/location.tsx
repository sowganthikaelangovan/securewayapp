import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { MapPin, Share2, Navigation, Wifi } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useSecureway, updateMyLocation } from "@/lib/secureway-store";
import { reverseGeocodeCoords, getCurrentLiveLocation } from "@/lib/location-service";

export const Route = createFileRoute("/app/location")({
  head: () => ({ meta: [{ title: "Location · SecureWay" }] }),
  component: LocationPage,
});

function LocationPage() {
  const { user } = useSecureway();
  const [sharing, setSharing] = useState(true);
  const [address, setAddress] = useState<string>("Acquiring live location...");
  const watchId = useRef<number | null>(null);

  const lat = user?.lat ?? 0;
  const lng = user?.lng ?? 0;
  const hasCoords = lat !== 0 || lng !== 0;

  useEffect(() => {
    getCurrentLiveLocation().then((loc) => {
      if (loc) {
        reverseGeocodeCoords(loc.lat, loc.lng).then(setAddress).catch(() => {});
      }
    });
  }, []);

  useEffect(() => {
    if (hasCoords) {
      reverseGeocodeCoords(lat, lng).then(setAddress).catch(() => {});
    }
  }, [lat, lng, hasCoords]);

  useEffect(() => {
    if (!sharing) {
      if (watchId.current != null && typeof navigator !== "undefined") {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      return;
    }
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => { void updateMyLocation(pos.coords.latitude, pos.coords.longitude); },
      () => { /* permission denied or unavailable */ },
      { enableHighAccuracy: true, maximumAge: 10000 },
    );
    return () => {
      if (watchId.current != null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    };
  }, [sharing]);

  return (
    <AppShell title="Your location">
      <div className="rounded-3xl overflow-hidden bg-card border border-border shadow-card">
        {/* Stylized map */}
        <div className="relative h-64 bg-[oklch(0.94_0.04_220)] overflow-hidden">
          <div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage: `
                linear-gradient(oklch(0.85_0.05_220) 1px, transparent 1px),
                linear-gradient(90deg, oklch(0.85_0.05_220) 1px, transparent 1px)
              `,
              backgroundSize: "32px 32px",
            }}
          />
          <div className="absolute top-10 left-8 right-32 h-1.5 rounded-full bg-info/40" />
          <div className="absolute top-32 left-20 right-10 h-1.5 rounded-full bg-info/40" />
          <div className="absolute top-20 left-32 bottom-8 w-1.5 rounded-full bg-info/40" />
          <div className="absolute inset-0 grid place-items-center">
            <div className="relative">
              <div className="size-24 rounded-full bg-emergency/20 animate-ping absolute inset-0" />
              <div className="relative size-12 rounded-full bg-gradient-emergency text-primary-foreground grid place-items-center shadow-sos">
                <Navigation className="size-5" />
              </div>
            </div>
          </div>
        </div>
        <div className="p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Current location</p>
          <p className="mt-1 font-semibold text-lg">{address}</p>
          <p className="text-sm text-muted-foreground">
            {hasCoords ? `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E` : "Locating..."}
          </p>
        </div>
      </div>

      <button
        onClick={() => setSharing((s) => !s)}
        className={`mt-5 w-full rounded-full py-3.5 font-semibold inline-flex items-center justify-center gap-2 ${
          sharing ? "bg-safe text-safe-foreground" : "bg-gradient-emergency text-primary-foreground shadow-sos"
        }`}
      >
        {sharing ? <><Wifi className="size-5 animate-pulse" /> Sharing live · Tap to stop</> : <><Share2 className="size-5" /> Share live location</>}
      </button>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Stat icon={MapPin} label="Accuracy" value="~5 m (GPS)" tint="bg-info/15 text-info" />
        <Stat icon={Navigation} label="Last update" value="Just now" tint="bg-violet/15 text-violet" />
      </div>

      <div className="mt-6 rounded-2xl bg-muted/50 border border-border p-4 text-sm text-muted-foreground">
        Your location is only ever visible to the contacts you've added. You can stop sharing at any time.
      </div>
    </AppShell>
  );
}

function Stat({ icon: Icon, label, value, tint }: any) {
  return (
    <div className="rounded-2xl bg-card border border-border p-4 shadow-card">
      <div className={`size-9 rounded-xl grid place-items-center ${tint}`}><Icon className="size-4" /></div>
      <p className="mt-3 text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
