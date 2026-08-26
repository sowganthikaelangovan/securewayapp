import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSecureway, updateMyName, logout } from "@/lib/secureway-store";
import { AppHeader } from "../components/AppHeader";

export function ProfileScreen() {
  const { user } = useSecureway();
  const [name, setName] = useState(user?.name ?? "");
  const [pin, setPin] = useState("4921");
  const [medicalNotes, setMedicalNotes] = useState("No known drug allergies. Blood type O+.");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async () => {
    try {
      if (name.trim()) {
        await updateMyName(name);
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update profile.");
    }
  };

  const handleLogout = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out of SecureWay?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Profile & Safety Settings" subtitle="Emergency details & account" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarLarge}>
            <Ionicons name="person" size={32} color="#0284c7" />
          </View>
          <Text style={styles.userName}>{user?.name ?? "User"}</Text>
          <Text style={styles.userPhone}>{user?.phone ?? "+1 555-0199"}</Text>
        </View>

        {/* Input Groups */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={16} color="#0284c7" />
            <Text style={styles.sectionTitle}>PERSONAL DETAILS</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>DISPLAY NAME</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your full name"
              placeholderTextColor="#64748b"
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="lock-closed" size={16} color="#8b5cf6" />
            <Text style={styles.sectionTitle}>EMERGENCY DISARM PIN</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>4-DIGIT PIN</Text>
            <TextInput
              style={styles.input}
              value={pin}
              onChangeText={setPin}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
            />
            <Text style={styles.fieldSub}>Used to cancel false SOS alerts safely.</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text" size={16} color="#10b981" />
            <Text style={styles.sectionTitle}>MEDICAL & ALLERGY NOTES</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>NOTES FOR FIRST RESPONDERS</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={medicalNotes}
              onChangeText={setMedicalNotes}
              multiline
              numberOfLines={3}
              placeholder="Allergies, blood group, emergency info..."
              placeholderTextColor="#64748b"
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveBtn} activeOpacity={0.8} onPress={handleSave}>
          {savedSuccess ? (
            <>
              <Ionicons name="checkmark" size={18} color="#ffffff" />
              <Text style={styles.saveBtnText}>Saved Successfully!</Text>
            </>
          ) : (
            <Text style={styles.saveBtnText}>Save Profile Changes</Text>
          )}
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.7} onPress={handleLogout}>
          <Ionicons name="log-out" size={18} color="#ef4444" />
          <Text style={styles.logoutBtnText}>Sign Out of SecureWay</Text>
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
    paddingBottom: 40,
  },
  userCard: {
    alignItems: "center",
    paddingVertical: 24,
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(2, 132, 199, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(2, 132, 199, 0.3)",
    marginBottom: 12,
  },
  userName: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "700",
  },
  userPhone: {
    color: "#94a3b8",
    fontSize: 14,
    marginTop: 2,
  },
  card: {
    backgroundColor: "#131b2e",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 8,
  },
  sectionTitle: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  field: {},
  label: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#f8fafc",
    fontSize: 15,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  fieldSub: {
    color: "#64748b",
    fontSize: 11,
    marginTop: 6,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0284c7",
    paddingVertical: 14,
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 16,
    gap: 8,
  },
  saveBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    paddingVertical: 14,
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.25)",
  },
  logoutBtnText: {
    color: "#ef4444",
    fontSize: 15,
    fontWeight: "600",
  },
});
