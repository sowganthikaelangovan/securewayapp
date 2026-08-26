import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSecureway, updateMyLocation } from "@/lib/secureway-store";
import { AppHeader } from "../components/AppHeader";

export function LocationScreen() {
  const { user } = useSecureway();
  const [isSharing, setIsSharing] = useState(true);

  const lat = user?.lat ?? 12.9716;
  const lng = user?.lng ?? 77.5946;
  const shareUrl = `https://secureway.app/track?lat=${lat}&lng=${lng}`;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Track my live location on SecureWay: ${shareUrl}`,
        url: shareUrl,
      });
    } catch (err) {
      console.error("Share location error", err);
    }
  };

  const handleRefreshGps = async () => {
    // Mock standard GPS update delta
    const deltaLat = (Math.random() - 0.5) * 0.002;
    const deltaLng = (Math.random() - 0.5) * 0.002;
    await updateMyLocation(lat + deltaLat, lng + deltaLng);
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Live Location" subtitle="GPS Tracking & Live Sharing" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Radar Card */}
        <View style={styles.radarCard}>
          <View style={styles.radarIconOuter}>
            <View style={styles.radarIconInner}>
              <Ionicons name="radio" size={28} color="#0284c7" />
            </View>
          </View>
          <Text style={styles.radarTitle}>
            {isSharing ? "Live Tracking Enabled" : "Live Sharing Paused"}
          </Text>
          <Text style={styles.radarSub}>
            {isSharing
              ? "Your encrypted GPS position is active and synced with trusted contacts."
              : "Enable live sharing to let your circle view your journey on the map."}
          </Text>

          <View style={styles.coordsBox}>
            <Ionicons name="location" size={16} color="#0284c7" />
            <Text style={styles.coordsText}>
              {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
            </Text>
          </View>

          <TouchableOpacity style={styles.refreshBtn} activeOpacity={0.7} onPress={handleRefreshGps}>
            <Text style={styles.refreshBtnText}>Update GPS Signal</Text>
          </TouchableOpacity>
        </View>

        {/* Sharing Toggle Tile */}
        <View style={styles.tile}>
          <View style={styles.tileLeft}>
            <Ionicons name="shield-checkmark" size={20} color="#10b981" />
            <View style={styles.tileText}>
              <Text style={styles.tileTitle}>Share with Emergency Contacts</Text>
              <Text style={styles.tileSub}>Real-time location stream</Text>
            </View>
          </View>
          <Switch
            value={isSharing}
            onValueChange={setIsSharing}
            trackColor={{ false: "#334155", true: "#0284c7" }}
            thumbColor="#f8fafc"
          />
        </View>

        {/* Battery Tile */}
        <View style={styles.tile}>
          <View style={styles.tileLeft}>
            <Ionicons name="battery-charging" size={20} color="#f59e0b" />
            <View style={styles.tileText}>
              <Text style={styles.tileTitle}>Low Battery Alerting</Text>
              <Text style={styles.tileSub}>Notify contacts if battery drops below 15%</Text>
            </View>
          </View>
          <Switch
            value={true}
            trackColor={{ false: "#334155", true: "#0284c7" }}
            thumbColor="#f8fafc"
          />
        </View>

        {/* Share Link Action */}
        <TouchableOpacity style={styles.shareBtn} activeOpacity={0.8} onPress={handleShare}>
          <Ionicons name="share-social" size={18} color="#ffffff" />
          <Text style={styles.shareBtnText}>Share Tracking Link</Text>
        </TouchableOpacity>
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
  radarCard: {
    backgroundColor: "#131b2e",
    borderRadius: 24,
    padding: 24,
    margin: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  radarIconOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(2, 132, 199, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  radarIconInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(2, 132, 199, 0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  radarTitle: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "700",
  },
  radarSub: {
    color: "#94a3b8",
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
  coordsBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  coordsText: {
    color: "#e2e8f0",
    fontSize: 13,
    fontWeight: "600",
  },
  refreshBtn: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  refreshBtnText: {
    color: "#38bdf8",
    fontSize: 13,
    fontWeight: "600",
  },
  tile: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#131b2e",
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  tileLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  tileText: {
    marginLeft: 12,
    flex: 1,
  },
  tileTitle: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "600",
  },
  tileSub: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 2,
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0284c7",
    paddingVertical: 14,
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 20,
    gap: 8,
  },
  shareBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
