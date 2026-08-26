import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { sendOtp, verifyOtp } from "@/lib/secureway-store";

export function LoginScreen() {
  const [phone, setPhone] = useState("+91 99999 99999");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      Alert.alert("Invalid Phone", "Please enter a valid phone number.");
      return;
    }
    setLoading(true);
    try {
      await sendOtp(phone.trim());
      setStep("otp");
      if (phone.includes("9999999999")) {
        setOtp("123456");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      Alert.alert("Missing OTP", "Please enter the verification code.");
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(phone.trim(), otp.trim());
    } catch (err: any) {
      Alert.alert("Error", err.message || "Invalid OTP code.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await verifyOtp("+919999999999", "123456");
    } catch (err: any) {
      Alert.alert("Demo Mode Error", err.message || "Failed to login demo user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Brand */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBg}>
            <Ionicons name="shield" size={36} color="#0284c7" />
          </View>
          <Text style={styles.appName}>SecureWay</Text>
          <Text style={styles.tagline}>Personal Safety & Instant SOS Companion</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {step === "phone" ? (
            <>
              <Text style={styles.cardTitle}>Sign in with Phone</Text>
              <Text style={styles.cardSub}>We will send you a one-time verification code</Text>

              <View style={styles.inputBox}>
                <Ionicons name="phone-portrait" size={18} color="#64748b" />
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+1 555-0199"
                  placeholderTextColor="#64748b"
                  keyboardType="phone-pad"
                />
              </View>

              <TouchableOpacity
                style={styles.primaryBtn}
                activeOpacity={0.8}
                onPress={handleSendOtp}
                disabled={loading}
              >
                <Text style={styles.primaryBtnText}>
                  {loading ? "Sending Code..." : "Continue"}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#ffffff" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.cardTitle}>Enter Verification Code</Text>
              <Text style={styles.cardSub}>Code sent to {phone}</Text>

              <View style={styles.inputBox}>
                <Ionicons name="lock-closed" size={18} color="#64748b" />
                <TextInput
                  style={styles.input}
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="123456"
                  placeholderTextColor="#64748b"
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>

              <TouchableOpacity
                style={styles.primaryBtn}
                activeOpacity={0.8}
                onPress={handleVerifyOtp}
                disabled={loading}
              >
                <Text style={styles.primaryBtnText}>
                  {loading ? "Verifying..." : "Verify & Enter"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.backBtn} onPress={() => setStep("phone")}>
                <Text style={styles.backBtnText}>Change phone number</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Demo Fast Access */}
        <TouchableOpacity style={styles.demoCard} activeOpacity={0.8} onPress={handleDemoLogin}>
          <Ionicons name="sparkles" size={20} color="#f59e0b" />
          <View style={styles.demoTextContainer}>
            <Text style={styles.demoTitle}>One-Tap Demo Access</Text>
            <Text style={styles.demoSub}>Explore instant SOS, location & contacts</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090d16",
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  brandContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(2, 132, 199, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(2, 132, 199, 0.3)",
    marginBottom: 16,
  },
  appName: {
    color: "#f8fafc",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  tagline: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 4,
  },
  card: {
    backgroundColor: "#131b2e",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  cardTitle: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "700",
  },
  cardSub: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 4,
    marginBottom: 20,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    color: "#f8fafc",
    fontSize: 16,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0284c7",
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  primaryBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  backBtn: {
    alignItems: "center",
    marginTop: 16,
  },
  backBtnText: {
    color: "#38bdf8",
    fontSize: 13,
  },
  demoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    padding: 16,
    borderRadius: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
    gap: 14,
  },
  demoTextContainer: {
    flex: 1,
  },
  demoTitle: {
    color: "#f59e0b",
    fontSize: 15,
    fontWeight: "700",
  },
  demoSub: {
    color: "#cbd5e1",
    fontSize: 12,
    marginTop: 2,
  },
});
