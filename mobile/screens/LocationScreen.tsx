import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Share,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSecureway } from "@/lib/secureway-store";
import {
  requestForegroundLocationPermission,
  requestBackgroundLocationPermission,
  getCurrentLiveLocation,
  reverseGeocodeCoords,
  startLiveLocationWatch,
  stopLiveLocationWatch,
} from "@/lib/location-service";
import { AppHeader } from "../components/AppHeader";

export function LocationScreen() {
  const { user } = useSecureway();
  const [isSharing, setIsSharing] = useState(true);
  const [backgroundEnabled, setBackgroundEnabled] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [loadingLoc, setLoadingLoc] = useState(false);

  const lat = user?.lat ?? 0;
  const lng = user?.lng ?? 0;
  const hasCoords = lat !== 0 || lng !== 0;

  useEffect(() => {
    initLocation();
    return () => {
      stopLiveLocationWatch();
    };
  }, []);

  useEffect(() => {
    if (hasCoords) {
      reverseGeocodeCoords(lat, lng).then(setAddress).catch(() => {});
    }
  }, [lat, lng]);

  const initLocation = async () => {
    setLoadingLoc(true);
    const fgGranted = await requestForegroundLocationPermission();
    if (!fgGranted) {
      Alert.alert(
        "Location Permission Required",
        "SecureWay needs location permission to monitor your live position and keep you safe."
      );
      setLoadingLoc(false);
      return;
    }

    const currentLoc = await getCurrentLiveLocation();
    if (currentLoc) {
      const addr = await reverseGeocodeCoords(currentLoc.lat, currentLoc.lng);
      setAddress(addr);
    }
    setLoadingLoc(false);

    if (isSharing) {
      await startLiveLocationWatch();
    }
  };

  const handleToggleSharing = async (value: boolean) => {
    setIsSharing(value);
    if (value) {
      const fgGranted = await requestForegroundLocationPermission();
      if (fgGranted) {
        await startLiveLocationWatch();
      } else {
        setIsSharing(false);
      }
    } else {
      stopLiveLocationWatch();
    }
  };

  const handleToggleBackground = async (value: boolean) => {
    if (value) {
      const bgGranted = await requestBackgroundLocationPermission();
      if (bgGranted) {
        setBackgroundEnabled(true);
        Alert.alert(
          "Background Tracking Active",
          "SecureWay will now update your live position even when the app is running in the background."
        );
      } else {
        setBackgroundEnabled(false);
        Alert.alert(
          "Background Permission Denied",
          "Please enable 'Always Allow' location permission in your device settings to allow background safety tracking."
        );
      }
    } else {
      setBackgroundEnabled(false);
    }
  };

  const handleRefreshGps = async () => {
    setLoadingLoc(true);
    const loc = await getCurrentLiveLocation();
    if (loc) {
      const addr = await reverseGeocodeCoords(loc.lat, loc.lng);
      setAddress(addr);
    }
    setLoadingLoc(false);
  };

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

          {address && <Text style={styles.addressText}>{address}</Text>}

          <Text style={styles.radarSub}>
            {isSharing
              ? "Your encrypted GPS position is active and synced live."
              : "Enable live sharing to let your circle view your journey."}
          </Text>

          {hasCoords ? (
            <View style={styles.coordsBox}>
              <Ionicons name="location" size={16} color="#0284c7" />
              <Text style={styles.coordsText}>
                {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
              </Text>
            </View>
          ) : (
            <View style={styles.coordsBox}>
              <Text style={styles.coordsText}>Acquiring GPS Signal...</Text>
            </View>
          )}

          <TouchableOpacity style={styles.refreshBtn} activeOpacity={0.7} onPress={handleRefreshGps}>
            {loadingLoc ? (
              <ActivityIndicator color="#38bdf8" size="small" />
            ) : (
              <Text style={styles.refreshBtnText}>Fetch Current GPS Location</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Sharing Toggle Tile */}
        <View style={styles.tile}>
          <View style={styles.tileLeft}>
            <Ionicons name="shield-checkmark" size={20} color="#10b981" />
            <View style={styles.tileText}>
              <Text style={styles.tileTitle}>Share with Emergency Contacts</Text>
              <Text style={styles.tileSub}>Real-time location stream while using app</Text>
            </View>
          </View>
          <Switch
            value={isSharing}
            onValueChange={handleToggleSharing}
            trackColor={{ false: "#334155", true: "#0284c7" }}
            thumbColor="#f8fafc"
          />
        </View>

        {/* Background Location Toggle Tile */}
        <View style={styles.tile}>
          <View style={styles.tileLeft}>
            <Ionicons name="location" size={20} color="#8b5cf6" />
            <View style={styles.tileText}>
              <Text style={styles.tileTitle}>Track When App Is Closed</Text>
              <Text style={styles.tileSub}>Background "Always Allow" location shield</Text>
            </View>
          </View>
          <Switch
            value={backgroundEnabled}
            onValueChange={handleToggleBackground}
            trackColor={{ false: "#334155", true: "#8b5cf6" }}
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
  addressText: {
    color: "#38bdf8",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 6,
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
