import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  inMemoryPersistence,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  GoogleAuthProvider,
  signInWithPopup,
  ConfirmationResult,
} from "firebase/auth";
import { Platform } from "react-native";

// NOTE: The FIREBASE_APP_ID below may be a placeholder.
// To get the REAL appId, go to:
//   https://console.firebase.google.com/project/college-app-8ebac/settings/general
// and copy the appId from the "Your apps" SDK snippet.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || "AIzaSyBRVTd2BO66Aq7JCuujMqOXYQDThGmW4Pc",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN || "college-app-8ebac.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || "college-app-8ebac",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET || "college-app-8ebac.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "182883918097",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID || "1:182883918097:web:8792b90a801d5fde8decb0",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || process.env.VITE_FIREBASE_MEASUREMENT_ID || "G-0YDN5KV9G9",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth — use inMemoryPersistence on native (avoids AsyncStorage complexities)
function createAuth() {
  if (Platform.OS !== "web") {
    try {
      return initializeAuth(app, {
        persistence: inMemoryPersistence,
      });
    } catch {
      return getAuth(app);
    }
  }
  return getAuth(app);
}

export const auth = (() => {
  try {
    return createAuth();
  } catch {
    // Already initialized — just get the existing instance
    return getAuth(app);
  }
})();

// reCAPTCHA for Web phone auth
let recaptchaVerifier: RecaptchaVerifier | null = null;

export function setupRecaptcha(containerId: string = "recaptcha-container"): RecaptchaVerifier | null {
  if (typeof window === "undefined") return null;
  try {
    if (!recaptchaVerifier) {
      recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: "invisible",
        callback: () => {},
      });
    }
    return recaptchaVerifier;
  } catch (err) {
    console.warn("reCAPTCHA setup note:", err);
    return null;
  }
}

// Send Firebase SMS OTP — web only (requires reCAPTCHA DOM element)
export async function sendFirebasePhoneOtp(
  phoneNumber: string,
  appVerifier?: RecaptchaVerifier
): Promise<ConfirmationResult> {
  const verifier = appVerifier || setupRecaptcha();
  if (!verifier) throw new Error("reCAPTCHA verifier missing.");
  return await signInWithPhoneNumber(auth, phoneNumber, verifier);
}

// Google Sign-In (web popup only)
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.addScope("email");
  provider.addScope("profile");
  return await signInWithPopup(auth, provider);
}
