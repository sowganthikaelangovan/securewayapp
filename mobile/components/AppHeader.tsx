import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  isAlert?: boolean;
}

export function AppHeader({ title, subtitle, isAlert = false }: AppHeaderProps) {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <View style={[styles.badge, isAlert ? styles.alertBadge : styles.safeBadge]}>
        {isAlert ? (
          <>
            <Ionicons name="warning" size={14} color="#ff4d4d" />
            <Text style={[styles.badgeText, styles.alertText]}>ALERT ACTIVE</Text>
          </>
        ) : (
          <>
            <Ionicons name="shield-checkmark" size={14} color="#10b981" />
            <Text style={[styles.badgeText, styles.safeText]}>PROTECTED</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#0d1322",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  title: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 2,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  safeBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  alertBadge: {
    backgroundColor: "rgba(255, 77, 77, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 77, 77, 0.4)",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  safeText: {
    color: "#10b981",
  },
  alertText: {
    color: "#ff4d4d",
  },
});
