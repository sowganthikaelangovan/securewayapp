import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated, StyleSheet } from "react-native";

interface SosButtonProps {
  onPress: () => void;
  isAlert?: boolean;
}

export function SosButton({ onPress, isAlert = false }: SosButtonProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[
          styles.ring,
          isAlert ? styles.ringAlert : styles.ringNormal,
          { transform: [{ scale: pulseAnim }] },
        ]}
      />
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={[styles.button, isAlert ? styles.buttonAlert : styles.buttonNormal]}
      >
        <Text style={styles.sosText}>SOS</Text>
        <Text style={styles.subText}>{isAlert ? "ALERT ACTIVE" : "HOLD / TAP FOR HELP"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 32,
  },
  ring: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  ringNormal: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderWidth: 1.5,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  ringAlert: {
    backgroundColor: "rgba(255, 0, 0, 0.3)",
    borderWidth: 2,
    borderColor: "rgba(255, 0, 0, 0.6)",
  },
  button: {
    width: 190,
    height: 190,
    borderRadius: 95,
    alignItems: "center",
    justifyContent: "center",
    elevation: 12,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  buttonNormal: {
    backgroundColor: "#dc2626",
  },
  buttonAlert: {
    backgroundColor: "#b91c1c",
    borderWidth: 3,
    borderColor: "#f87171",
  },
  sosText: {
    color: "#ffffff",
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: 4,
  },
  subText: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 4,
  },
});
