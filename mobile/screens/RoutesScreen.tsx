import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "../components/AppHeader";
import { RouteCard, SafeRouteItem } from "../components/RouteCard";

const MOCK_ROUTES: SafeRouteItem[] = [
  {
    id: "route-1",
    name: "Main St & Commercial Boulevard",
    distance: "1.4 km",
    duration: "18 mins",
    safetyScore: 98,
    litLevel: "High",
    crowdLevel: "Busy",
  },
  {
    id: "route-2",
    name: "Park Avenue Safe Corridor",
    distance: "1.8 km",
    duration: "22 mins",
    safetyScore: 94,
    litLevel: "High",
    crowdLevel: "Moderate",
  },
  {
    id: "route-3",
    name: "University Quad Lighted Trail",
    distance: "0.9 km",
    duration: "12 mins",
    safetyScore: 91,
    litLevel: "Medium",
    crowdLevel: "Busy",
  },
];

export function RoutesScreen() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"All" | "MostLit" | "HighestSafety">("All");

  const filteredRoutes = MOCK_ROUTES.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => {
    if (activeFilter === "HighestSafety") return b.safetyScore - a.safetyScore;
    if (activeFilter === "MostLit") return a.litLevel === "High" ? -1 : 1;
    return 0;
  });

  const handleSelectRoute = (route: SafeRouteItem) => {
    Alert.alert(
      "Navigation Started",
      `Safe navigation initiated along ${route.name}. Your location is continuously checked for deviations.`
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Safe Routes" subtitle="Verified well-lit & populated paths" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search destination or street..."
            placeholderTextColor="#64748b"
            value={search}
            onChangeText={setSearch}
          />
          <Ionicons name="options" size={18} color="#64748b" />
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, activeFilter === "All" && styles.filterChipActive]}
            onPress={() => setActiveFilter("All")}
          >
            <Text style={[styles.filterText, activeFilter === "All" && styles.filterTextActive]}>
              All Routes
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

        {/* Safety Recommendation Banner */}
        <View style={styles.tipCard}>
          <Ionicons name="shield-checkmark" size={20} color="#f59e0b" />
          <Text style={styles.tipText}>
            Routes are updated live using street camera lighting data & community safety reports.
          </Text>
        </View>

        {/* Route Items */}
        {filteredRoutes.map((route) => (
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
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#131b2e",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: "#f8fafc",
    fontSize: 15,
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
});
