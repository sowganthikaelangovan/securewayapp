import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface QuickActionTileProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBgColor: string;
  onPress: () => void;
}

export function QuickActionTile({
  title,
  subtitle,
  icon,
  iconBgColor,
  onPress,
}: QuickActionTileProps) {
  return (
    <TouchableOpacity style={styles.tile} activeOpacity={0.7} onPress={onPress}>
      <View style={[styles.iconBg, { backgroundColor: iconBgColor }]}>{icon}</View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#64748b" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#131b2e",
    borderRadius: 20,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
    marginLeft: 14,
  },
  title: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "600",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 2,
  },
});
