import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface StatusBannerProps {
  status: "safe" | "alert";
  onClearAlert?: () => void;
}

export function StatusBanner({ status, onClearAlert }: StatusBannerProps) {
  const isAlert = status === "alert";

  return (
    <View style={[styles.container, isAlert ? styles.alertBg : styles.safeBg]}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.headerText}>CURRENT STATUS</Text>
          <Text style={styles.statusTitle}>
            {isAlert ? "Emergency Alert Active" : "You are Safe"}
          </Text>
          <Text style={styles.statusSub}>
            {isAlert
              ? "Your live coordinates have been broadcasted to emergency contacts."
              : "Tap SOS below to instantly notify trusted contacts with live location."}
          </Text>
        </View>

        <View style={[styles.iconContainer, isAlert ? styles.alertIconBg : styles.safeIconBg]}>
          {isAlert ? (
            <Ionicons name="alert-circle" size={24} color="#ffffff" />
          ) : (
            <Ionicons name="shield-checkmark" size={24} color="#ffffff" />
          )}
        </View>
      </View>

      {isAlert && onClearAlert ? (
        <TouchableOpacity style={styles.clearButton} activeOpacity={0.7} onPress={onClearAlert}>
          <Text style={styles.clearButtonText}>I'm Safe Now — Clear Alert</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 12,
    borderWidth: 1,
  },
  safeBg: {
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    borderColor: "rgba(16, 185, 129, 0.25)",
  },
  alertBg: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderColor: "rgba(239, 68, 68, 0.4)",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textContainer: {
    flex: 1,
    paddingRight: 12,
  },
  headerText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94a3b8",
    letterSpacing: 1,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#f8fafc",
    marginTop: 4,
  },
  statusSub: {
    fontSize: 12,
    color: "#cbd5e1",
    marginTop: 4,
    lineHeight: 18,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  safeIconBg: {
    backgroundColor: "#10b981",
  },
  alertIconBg: {
    backgroundColor: "#ef4444",
  },
  clearButton: {
    marginTop: 16,
    backgroundColor: "#1e293b",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  clearButtonText: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "600",
  },
});
