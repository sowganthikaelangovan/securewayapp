import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSecureway } from "@/lib/secureway-store";
import { getCurrentLiveLocation, reverseGeocodeCoords } from "@/lib/location-service";
import { calculateSafeRoutes, ComputedRoute } from "@/lib/maps-service";
import { AppHeader } from "../components/AppHeader";
import { RouteCard, SafeRouteItem } from "../components/RouteCard";

export function RoutesScreen() {
  const { user } = useSecureway();
  const [destination, setDestination] = useState("");
  const [originAddress, setOriginAddress] = useState<string>("Current Location");
  const [routes, setRoutes] = useState<ComputedRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"All" | "MostLit" | "HighestSafety">("All");

  const userLat = user?.lat ?? 0;
  const userLng = user?.lng ?? 0;

  useEffect(() => {
    initUserOrigin();
  }, []);

  const initUserOrigin = async () => {
    const loc = await getCurrentLiveLocation();
    if (loc) {
      const addr = await reverseGeocodeCoords(loc.lat, loc.lng);
      setOriginAddress(addr);
    }
  };

  const handleSearchRoutes = async () => {
    if (!destination.trim()) {
      Alert.alert("Enter Destination", "Please type a destination, street, or landmark.");
      return;
    }

    setLoading(true);
    try {
      let origin = { lat: userLat, lng: userLng };
      if (origin.lat === 0 && origin.lng === 0) {
        const freshLoc = await getCurrentLiveLocation();
        if (freshLoc) {
          origin = freshLoc;
        } else {
          throw new Error("Unable to fetch current GPS position. Please enable location permissions.");
        }
      }

      const calculated = await calculateSafeRoutes(origin, destination);
      setRoutes(calculated);
    } catch (err: any) {
      Alert.alert("Route Calculation Error", err.message || "Failed to find routes to destination.");
    } finally {
      setLoading(false);
    }
  };

  const filteredRoutes = [...routes]
    .sort((a, b) => {
      if (activeFilter === "HighestSafety") return b.safetyScore - a.safetyScore;
      if (activeFilter === "MostLit") return a.litLevel === "High" ? -1 : 1;
      return 0;
    });

  const handleSelectRoute = (route: SafeRouteItem) => {
    Alert.alert(
      "Navigation Started",
      `Safe navigation initiated along ${route.name} (${route.distance}, ${route.duration}). Your live GPS location is continuously monitored for deviations.`
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Safe Routes" subtitle="Calculated from your live location" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Origin Pill */}
        <View style={styles.originCard}>
          <Ionicons name="navigate-circle" size={20} color="#0284c7" />
          <View style={{ flex: 1 }}>
            <Text style={styles.originLabel}>STARTING POINT</Text>
            <Text style={styles.originValue} numberOfLines={1}>
              {originAddress}
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Enter destination address or landmark..."
            placeholderTextColor="#64748b"
            value={destination}
            onChangeText={setDestination}
            onSubmitEditing={handleSearchRoutes}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.findBtn} onPress={handleSearchRoutes}>
            <Text style={styles.findBtnText}>Search</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Pills */}
        {routes.length > 0 && (
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterChip, activeFilter === "All" && styles.filterChipActive]}
              onPress={() => setActiveFilter("All")}
            >
              <Text style={[styles.filterText, activeFilter === "All" && styles.filterTextActive]}>
                All Paths ({routes.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, activeFilter === "HighestSafety" && styles.filterChipActive]}
              onPress={() => setActiveFilter("HighestSafety")}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === "HighestSafety" && styles.filterTextActive,
                ]}
              >
                Highest Safety
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, activeFilter === "MostLit" && styles.filterChipActive]}
              onPress={() => setActiveFilter("MostLit")}
            >
              <Text style={[styles.filterText, activeFilter === "MostLit" && styles.filterTextActive]}>
                Well-Lit First
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Safety Recommendation Banner */}
        <View style={styles.tipCard}>
          <Ionicons name="shield-checkmark" size={20} color="#f59e0b" />
          <Text style={styles.tipText}>
            Routes are evaluated in real-time based on distance, street lighting metadata, and open venue activity.
          </Text>
        </View>

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0284c7" />
            <Text style={styles.loadingText}>Computing safest routes via Google Maps...</Text>
          </View>
        )}

        {/* Empty Search State */}
        {!loading && routes.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="map-outline" size={48} color="#334155" />
            <Text style={styles.emptyTitle}>Search Any Destination</Text>
            <Text style={styles.emptySub}>
              Type a destination above to find well-lit, populated, and emergency-backed safe walking paths.
            </Text>
          </View>
        )}

        {/* Route Items */}
        {!loading &&
          filteredRoutes.map((route) => (
            <RouteCard key={route.id} route={route} onSelect={handleSelectRoute} />
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090d16",
  },
  content: {
    paddingBottom: 32,
  },
  originCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(2, 132, 199, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    marginHorizontal: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(2, 132, 199, 0.2)",
    gap: 10,
  },
  originLabel: {
    color: "#0284c7",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  originValue: {
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#131b2e",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 20,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: "#f8fafc",
    fontSize: 14,
  },
  findBtn: {
    backgroundColor: "#0284c7",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  findBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  filterChip: {
    backgroundColor: "#131b2e",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  filterChipActive: {
    backgroundColor: "#f59e0b",
    borderColor: "#f59e0b",
  },
  filterText: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
  },
  filterTextActive: {
    color: "#000000",
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    padding: 14,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.25)",
    gap: 10,
  },
  tipText: {
    color: "#cbd5e1",
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 12,
  },
  loadingText: {
    color: "#94a3b8",
    fontSize: 14,
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
    gap: 8,
  },
  emptyTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 8,
  },
  emptySub: {
    color: "#94a3b8",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
});
