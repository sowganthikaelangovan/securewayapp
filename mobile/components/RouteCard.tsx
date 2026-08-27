import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface SafeRouteItem {
  id: string;
  name: string;
  distance: string;
  duration: string;
  safetyScore: number;
  litLevel: "High" | "Medium" | "Low";
  crowdLevel: "Busy" | "Moderate" | "Quiet";
}

interface RouteCardProps {
  route: SafeRouteItem;
  onSelect: (route: SafeRouteItem) => void;
}

export function RouteCard({ route, onSelect }: RouteCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{route.name}</Text>
        <View style={styles.scoreBadge}>
          <Ionicons name="shield-checkmark" size={14} color="#10b981" />
          <Text style={styles.scoreText}>{route.safetyScore}% Safe</Text>
        </View>
      </View>

      <Text style={styles.metricsText}>
        {route.distance} • {route.duration}
      </Text>

      <View style={styles.tagsRow}>
        <View style={styles.tag}>
          <Ionicons name="sunny" size={12} color="#f59e0b" />
          <Text style={styles.tagText}>{route.litLevel} Lighting</Text>
        </View>
        <View style={styles.tag}>
          <Ionicons name="people" size={12} color="#8b5cf6" />
          <Text style={styles.tagText}>{route.crowdLevel} Activity</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.navBtn} activeOpacity={0.8} onPress={() => onSelect(route)}>
        <Ionicons name="navigate" size={16} color="#ffffff" />
        <Text style={styles.navBtnText}>Navigate Safe Path</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#131b2e",
    borderRadius: 20,
    padding: 18,
    marginVertical: 8,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  name: {
    color: "#f8fafc",
    fontSize: 17,
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
  },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  scoreText: {
    color: "#10b981",
    fontSize: 12,
    fontWeight: "700",
  },
  metricsText: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 4,
  },
  tagsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
  },
  tagText: {
    color: "#cbd5e1",
    fontSize: 11,
    fontWeight: "600",
  },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0284c7",
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 16,
    gap: 8,
  },
  navBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
});
