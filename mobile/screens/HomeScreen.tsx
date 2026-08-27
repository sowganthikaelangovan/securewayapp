import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Modal,
  TouchableOpacity,
  Linking,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSecureway, recordSos, clearAlert, Contact } from "@/lib/secureway-store";
import { AppHeader } from "../components/AppHeader";
import { StatusBanner } from "../components/StatusBanner";
import { SosButton } from "../components/SosButton";
import { QuickActionTile } from "../components/QuickActionTile";
import { getCurrentLiveLocation, reverseGeocodeCoords } from "@/lib/location-service";

export function HomeScreen({ navigation }: any) {
  const { user, contacts } = useSecureway();
  const [sosModalVisible, setSosModalVisible] = useState(false);
  const [sosAddress, setSosAddress] = useState<string>("");
  const [sendingSms, setSendingSms] = useState(false);

  const sendEmergencySmsToContacts = async (lat: number, lng: number, addressStr: string) => {
    if (contacts.length === 0) return;
    const phoneNumbers = contacts.map((c) => c.phone.replace(/[^\d+]/g, "")).filter(Boolean);
    if (phoneNumbers.length === 0) return;

    const googleMapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
    const locationText = addressStr ? `${addressStr} (${googleMapsUrl})` : googleMapsUrl;
    const message = `🚨 EMERGENCY SOS ALERT! I need immediate help. My live GPS location: ${locationText}. Sent via SecureWay App.`;

    setSendingSms(true);
    try {
      if (Platform.OS !== "web") {
        const ExpoSms = await import("expo-sms");
        const isAvailable = await ExpoSms.isAvailableAsync();
        if (isAvailable) {
          await ExpoSms.sendSMSAsync(phoneNumbers, message);
          return;
        }
      }
      // Fallback: SMS URL scheme
      const recipients = phoneNumbers.join(",");
      const smsUrl = `sms:${recipients}?body=${encodeURIComponent(message)}`;
      await Linking.openURL(smsUrl);
    } catch (err) {
      console.warn("SMS trigger note:", err);
    } finally {
      setSendingSms(false);
    }
  };

  const handleSosPress = async () => {
    setSosModalVisible(true);
    try {
      let lat = user?.lat ?? 0;
      let lng = user?.lng ?? 0;
      let addressStr = "";

      const currentLoc = await getCurrentLiveLocation();
      if (currentLoc) {
        lat = currentLoc.lat;
        lng = currentLoc.lng;
        addressStr = await reverseGeocodeCoords(lat, lng);
        setSosAddress(addressStr);
      }

      await recordSos(lat, lng);
      await sendEmergencySmsToContacts(lat, lng, addressStr);
    } catch (err) {
      console.error("SOS trigger error", err);
    }
  };

  const handleClearAlert = async () => {
    try {
      await clearAlert();
    } catch (err) {
      console.error("Clear alert error", err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title={`Hi, ${user?.name?.split(" ")[0] ?? "SecureWay"}`}
        subtitle="Your safety shield is active"
        isAlert={user?.status === "alert"}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <StatusBanner status={user?.status ?? "safe"} onClearAlert={handleClearAlert} />

        <SosButton onPress={handleSosPress} isAlert={user?.status === "alert"} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
        </View>

        <QuickActionTile
          title="Share Live Location"
          subtitle="Allow trusted circle to track your path"
          icon={<Ionicons name="location" size={22} color="#0284c7" />}
          iconBgColor="rgba(2, 132, 199, 0.15)"
          onPress={() => navigation.navigate("Location")}
        />

        <QuickActionTile
          title="Emergency Contacts"
          subtitle={`${contacts.length} trusted ${contacts.length === 1 ? "person" : "people"} configured`}
          icon={<Ionicons name="people" size={22} color="#8b5cf6" />}
          iconBgColor="rgba(139, 92, 246, 0.15)"
          onPress={() => navigation.navigate("Contacts")}
        />

        <QuickActionTile
          title="Find Safe Route"
          subtitle="Curated well-lit & high activity paths"
          icon={<Ionicons name="navigate" size={22} color="#f59e0b" />}
          iconBgColor="rgba(245, 158, 11, 0.15)"
          onPress={() => navigation.navigate("Routes")}
        />
      </ScrollView>

      {/* SOS Active Emergency Modal */}
      <Modal visible={sosModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconBg}>
                <Ionicons name="warning" size={28} color="#ef4444" />
              </View>
              <TouchableOpacity onPress={() => setSosModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalTitle}>Emergency SOS Sent!</Text>
            <Text style={styles.modalSub}>
              Your live GPS coordinates were broadcasted to {contacts.length} emergency contacts.
            </Text>

            {sosAddress ? (
              <View style={styles.locationBadge}>
                <Ionicons name="pin" size={14} color="#38bdf8" />
                <Text style={styles.locationBadgeText} numberOfLines={2}>
                  {sosAddress}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.broadcastSmsBtn}
              activeOpacity={0.8}
              disabled={sendingSms}
              onPress={() => sendEmergencySmsToContacts(user?.lat ?? 0, user?.lng ?? 0, sosAddress)}
            >
              <Ionicons name="paper-plane" size={16} color="#ffffff" />
              <Text style={styles.broadcastSmsText}>
                {sendingSms ? "Preparing SMS..." : "Send Location SMS to All Contacts"}
              </Text>
            </TouchableOpacity>

            <ScrollView style={styles.contactsList} showsVerticalScrollIndicator={false}>
              {contacts.length === 0 ? (
                <Text style={{ color: "#94a3b8", textAlign: "center", marginVertical: 12 }}>
                  No emergency contacts added yet. Go to Contacts screen to add friends.
                </Text>
              ) : (
                contacts.map((c: Contact) => (
                  <View key={c.id} style={styles.modalContactItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.contactName}>{c.name}</Text>
                      <Text style={styles.contactPhone}>{c.phone}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.dialBtn}
                      onPress={() => Linking.openURL(`tel:${c.phone.replace(/[^\d+]/g, "")}`)}
                    >
                      <Ionicons name="call" size={16} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>

            <TouchableOpacity style={styles.dismissBtn} onPress={() => setSosModalVisible(false)}>
              <Text style={styles.dismissBtnText}>Close Modal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090d16",
  },
  scrollContent: {
    paddingBottom: 32,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
    letterSpacing: 1.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#131b2e",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#1e293b",
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalIconBg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#1e293b",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#f8fafc",
    marginTop: 16,
  },
  modalSub: {
    fontSize: 13,
    color: "#94a3b8",
    marginTop: 4,
    lineHeight: 18,
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    padding: 10,
    borderRadius: 12,
    marginVertical: 12,
    gap: 8,
  },
  locationBadgeText: {
    color: "#38bdf8",
    fontSize: 12,
    flex: 1,
  },
  broadcastSmsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
    marginVertical: 8,
  },
  broadcastSmsText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  contactsList: {
    marginVertical: 10,
    maxHeight: 180,
  },
  modalContactItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1e293b",
    padding: 14,
    borderRadius: 14,
    marginVertical: 4,
  },
  contactName: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "600",
  },
  contactPhone: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 2,
  },
  dialBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
  },
  dismissBtn: {
    backgroundColor: "#334155",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },
  dismissBtnText: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "600",
  },
});
