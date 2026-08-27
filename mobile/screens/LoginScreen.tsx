import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { verifyOtp } from "@/lib/secureway-store";

// ─── Native Firebase Auth ─────────────────────────────────────────────────────
// Uses @react-native-firebase/auth — sends REAL SMS OTP via Firebase without reCAPTCHA
let nativeAuth: any = null;
let nativeGoogleSignin: any = null;
let PhoneAuthProvider: any = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  nativeAuth = require("@react-native-firebase/auth").default;
} catch (e) {
  console.warn("@react-native-firebase/auth not available:", e);
}

try {
  const googleSignin = require("@react-native-google-signin/google-signin");
  nativeGoogleSignin = googleSignin.GoogleSignin;
  // Configure Google Sign-In with your Web Client ID from Firebase Console
  // Authentication → Sign-in method → Google → Web SDK config → Web client ID
  nativeGoogleSignin.configure({
    webClientId: "182883918097-r0q0p9sfaavq4f2t3dvhtc2e8cd5t655.apps.googleusercontent.com",
    offlineAccess: true,
  });
} catch (e) {
  console.warn("@react-native-google-signin not available:", e);
}

// ─── Component ────────────────────────────────────────────────────────────────
export function LoginScreen() {
  const [phone, setPhone] = useState("+91 ");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<any>(null);

  const handlePhoneChange = (text: string) => {
    if (!text.startsWith("+91")) {
      const clean = text.replace(/[^\d]/g, "");
      setPhone("+91 " + clean);
    } else {
      setPhone(text);
    }
  };

  const getFullPhoneNumber = () => {
    let clean = phone.replace(/[^\d+]/g, "");
    if (!clean.startsWith("+")) clean = "+" + clean;
    return clean;
  };

  // ── Send REAL SMS OTP via native Firebase ──────────────────────────────────
  const handleSendOtp = async () => {
    const fullPhone = getFullPhoneNumber();
    if (fullPhone.replace(/\D/g, "").length < 12) {
      Alert.alert("Invalid Number", "Please enter your 10-digit mobile number.");
      return;
    }

    if (!nativeAuth) {
      Alert.alert(
        "App Needs Rebuild",
        "Native Firebase is not yet linked. Please rebuild the app after adding GoogleService-Info.plist."
      );
      return;
    }

    setLoading(true);
    try {
      const confirmResult = await nativeAuth().signInWithPhoneNumber(fullPhone);
      setConfirmation(confirmResult);
      setStep("otp");
      Alert.alert("OTP Sent!", `A 6-digit code was sent to ${fullPhone}. Please check your SMS.`);
    } catch (err: any) {
      console.error("sendOtp error:", err);
      Alert.alert(
        "OTP Failed",
        err.message ?? "Could not send OTP. Make sure Phone Auth is enabled in Firebase Console."
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Verify real OTP ────────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.trim().length < 6) {
      Alert.alert("Invalid Code", "Please enter the 6-digit code from SMS.");
      return;
    }
    if (!confirmation) {
      Alert.alert("Session Expired", "Please request OTP again.");
      setStep("phone");
      return;
    }

    setLoading(true);
    try {
      const result = await confirmation.confirm(otp.trim());
      const user = result.user;
      // Sync into local store
      await verifyOtp(user.phoneNumber ?? getFullPhoneNumber(), otp.trim());
    } catch (err: any) {
      console.error("verifyOtp error:", err);
      Alert.alert("Wrong Code", "The OTP you entered is incorrect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Real Google Sign-In (opens Google account chooser) ─────────────────────
  const handleGoogleSignIn = async () => {
    if (!nativeGoogleSignin || !nativeAuth) {
      Alert.alert(
        "App Needs Rebuild",
        "Native Google Sign-In is not yet linked. Please rebuild the app after adding GoogleService-Info.plist and setting the Web Client ID."
      );
      return;
    }

    setLoading(true);
    try {
      await nativeGoogleSignin.hasPlayServices();
      const userInfo = await nativeGoogleSignin.signIn();
      const googleCredential = nativeAuth.GoogleAuthProvider.credential(userInfo.data?.idToken);
      const result = await nativeAuth().signInWithCredential(googleCredential);
      const user = result.user;
      await verifyOtp(user.email ?? "google-user", "google-native");
    } catch (err: any) {
      console.error("Google Sign-In error:", err);
      if (err.code === "SIGN_IN_CANCELLED") {
        // User cancelled — no alert needed
      } else {
        Alert.alert("Google Sign-In Failed", err.message ?? "Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── UI ─────────────────────────────────────────────────────────────────────
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
              <Text style={styles.cardTitle}>Sign in to SecureWay</Text>
              <Text style={styles.cardSub}>Sign in with Google or your mobile number</Text>

              {/* Google Sign-In */}
              <TouchableOpacity
                style={[styles.googleBtn, loading && styles.btnDisabled]}
                activeOpacity={0.85}
                onPress={handleGoogleSignIn}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ea4335" size="small" />
                ) : (
                  <Ionicons name="logo-google" size={18} color="#ea4335" />
                )}
                <Text style={styles.googleBtnText}>Continue with Google</Text>
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR PHONE OTP</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.inputBox}>
                <Ionicons name="phone-portrait" size={18} color="#0284c7" />
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={handlePhoneChange}
                  placeholder="+91 9876543210"
                  placeholderTextColor="#64748b"
                  keyboardType="phone-pad"
                  returnKeyType="send"
                  onSubmitEditing={handleSendOtp}
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.btnDisabled]}
                activeOpacity={0.8}
                onPress={handleSendOtp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Text style={styles.primaryBtnText}>Send OTP</Text>
                    <Ionicons name="arrow-forward" size={18} color="#ffffff" />
                  </>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.cardTitle}>Verify Your Number</Text>
              <Text style={styles.cardSub}>
                OTP sent to {getFullPhoneNumber()} — check your SMS
              </Text>

              <View style={styles.inputBox}>
                <Ionicons name="lock-closed" size={18} color="#0284c7" />
                <TextInput
                  style={[styles.input, styles.otpInput]}
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="• • • • • •"
                  placeholderTextColor="#64748b"
                  keyboardType="number-pad"
                  maxLength={6}
                  returnKeyType="done"
                  onSubmitEditing={handleVerifyOtp}
                  autoFocus
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, (loading || otp.length < 6) && styles.btnDisabled]}
                activeOpacity={0.8}
                onPress={handleVerifyOtp}
                disabled={loading || otp.length < 6}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.primaryBtnText}>Verify & Sign In</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => { setStep("phone"); setOtp(""); setConfirmation(null); }}
              >
                <Text style={styles.backBtnText}>← Change phone number</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#090d16" },
  content: { flex: 1, padding: 24, justifyContent: "center" },
  brandContainer: { alignItems: "center", marginBottom: 28 },
  logoBg: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: "rgba(2, 132, 199, 0.15)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "rgba(2, 132, 199, 0.3)", marginBottom: 16,
  },
  appName: { color: "#f8fafc", fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  tagline: { color: "#94a3b8", fontSize: 13, marginTop: 4, textAlign: "center" },
  card: {
    backgroundColor: "#131b2e", borderRadius: 24,
    padding: 24, borderWidth: 1, borderColor: "#1e293b",
  },
  cardTitle: { color: "#f8fafc", fontSize: 20, fontWeight: "700" },
  cardSub: { color: "#94a3b8", fontSize: 13, marginTop: 4, marginBottom: 18 },
  googleBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#ffffff", paddingVertical: 13, borderRadius: 16,
    gap: 10, marginBottom: 16,
  },
  googleBtnText: { color: "#0f172a", fontSize: 15, fontWeight: "600" },
  dividerRow: { flexDirection: "row", alignItems: "center", marginVertical: 12, gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#1e293b" },
  dividerText: { color: "#64748b", fontSize: 10, fontWeight: "700", letterSpacing: 1 },
  inputBox: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#1e293b", borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 12, gap: 12, marginBottom: 16,
  },
  input: { flex: 1, color: "#f8fafc", fontSize: 16 },
  otpInput: { fontSize: 24, letterSpacing: 10, fontWeight: "700", textAlign: "center" },
  primaryBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#0284c7", paddingVertical: 14,
    borderRadius: 16, gap: 8, minHeight: 50,
  },
  btnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
  backBtn: { alignItems: "center", marginTop: 16, padding: 8 },
  backBtnText: { color: "#38bdf8", fontSize: 13 },
});
