import { updateMyLocation } from "./secureway-store";

const isWeb = typeof window !== "undefined" && typeof document !== "undefined";

export type LocationPermissionState = {
  foregroundGranted: boolean;
  backgroundGranted: boolean;
  lat: number | null;
  lng: number | null;
  address: string | null;
  isTracking: boolean;
};

let expoLocationModule: typeof import("expo-location") | null = null;

async function getExpoLocation() {
  if (isWeb) return null;
  if (expoLocationModule) return expoLocationModule;
  try {
    const mod = await import("expo-location");
    expoLocationModule = mod;
    return expoLocationModule;
  } catch (err) {
    console.warn("expo-location native module note:", err);
    return null;
  }
}

// Request foreground location permissions ("While using the app")
export async function requestForegroundLocationPermission(): Promise<boolean> {
  if (isWeb) {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          () => resolve(true),
          () => resolve(false),
          { timeout: 10000 }
        );
      });
    }
    return false;
  }

  const Location = await getExpoLocation();
  if (!Location) return false;
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === "granted";
}

// Request background location permissions ("Always allow")
export async function requestBackgroundLocationPermission(): Promise<boolean> {
  if (isWeb) {
    // Web doesn't support native background tracking, but standard location streaming works while tab is open
    return true;
  }

  const Location = await getExpoLocation();
  if (!Location) return false;

  // Foreground permission MUST be granted first
  const fgGranted = await requestForegroundLocationPermission();
  if (!fgGranted) return false;

  const { status } = await Location.requestBackgroundPermissionsAsync();
  return status === "granted";
}

// Fetch single precise current location
export async function getCurrentLiveLocation(): Promise<{ lat: number; lng: number } | null> {
  if (isWeb) {
    return new Promise((resolve) => {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          void updateMyLocation(lat, lng);
          resolve({ lat, lng });
        },
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 15000 }
      );
    });
  }

  const Location = await getExpoLocation();
  if (!Location) return null;

  try {
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy?.High ?? 4,
    });
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    void updateMyLocation(lat, lng);
    return { lat, lng };
  } catch (err) {
    console.warn("Failed to get current location:", err);
    return null;
  }
}

// Reverse geocode lat/lng to readable address using Google / Expo Geocoder
export async function reverseGeocodeCoords(lat: number, lng: number): Promise<string> {
  const apiKey =
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.VITE_GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY;

  if (apiKey) {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
      );
      const data = await res.json();
      if (data.status === "OK" && data.results && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
    } catch (e) {
      console.warn("Google Geocoding error:", e);
    }
  }

  // Fallback: OpenStreetMap Nominatim
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: { "User-Agent": "SecureWay/1.0" } }
    );
    const data = await res.json();
    if (data && data.display_name) {
      const parts = data.display_name.split(",");
      return parts.slice(0, 3).join(", ");
    }
  } catch (e) {
    console.warn("OSM Geocoding error:", e);
  }

  return `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;
}

// Start continuous position watcher (updates Supabase & state)
let activeSubscription: any = null;

export async function startLiveLocationWatch(
  onUpdate?: (coords: { lat: number; lng: number }) => void
) {
  if (activeSubscription) {
    stopLiveLocationWatch();
  }

  if (isWeb) {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          void updateMyLocation(lat, lng);
          if (onUpdate) onUpdate({ lat, lng });
        },
        (err) => console.warn("Web location watch error:", err),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
      );
      activeSubscription = { remove: () => navigator.geolocation.clearWatch(id) };
    }
    return;
  }

  const Location = await getExpoLocation();
  if (!Location) return;

  try {
    const sub = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 10000,
        distanceInterval: 10,
      },
      (location) => {
        const lat = location.coords.latitude;
        const lng = location.coords.longitude;
        void updateMyLocation(lat, lng);
        if (onUpdate) onUpdate({ lat, lng });
      }
    );
    activeSubscription = sub;
  } catch (err) {
    console.warn("Mobile location watch error:", err);
  }
}

export function stopLiveLocationWatch() {
  if (activeSubscription) {
    if (typeof activeSubscription.remove === "function") {
      activeSubscription.remove();
    }
    activeSubscription = null;
  }
}
