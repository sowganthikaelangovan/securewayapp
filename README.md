# SecureWay - Women's Safety App (React Native)

SecureWay is a dedicated React Native mobile application for women's safety. It features emergency SOS alerts, trusted contact management, live location sharing, community-rated safe routes, and profile management.

## Prerequisites

Before getting started, ensure you have the following installed on your Mac:
1. **Node.js** (v18 or higher) and **npm**
2. **Xcode** (Available from the Mac App Store) — needed for iOS compilation and the Simulator
3. **CocoaPods** — Run `sudo gem install cocoapods` if not installed

## Getting Started

Follow these steps from start to finish to get SecureWay running on your iOS Simulator.

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd securewayapp
```

### 2. Install Dependencies
```bash
cd securewaynative
npm install
```

### 3. Install iOS Pods
```bash
cd ios
pod install
cd ..
```

### 4. Run the App
```bash
npx react-native run-ios
```
This will:
- Start the Metro JavaScript bundler
- Compile the native iOS project via Xcode
- Boot the iOS Simulator
- Install and launch the SecureWay app as a dedicated native app

> **Note:** The first build takes 2-5 minutes. Subsequent runs are much faster.

## Testing the App (Demo Credentials)

You do **not** need a real phone number or SMS provider to test the app. A built-in demo bypass is included:

- **Phone Number:** `+91 99999 99999` (tap the blue "Demo" link on the login screen to autofill)
- **OTP Code:** `123456`

Using these credentials creates a local mock session, allowing you to test all features completely offline:
- ✅ Trigger SOS alerts
- ✅ Add and manage emergency contacts
- ✅ Toggle live location sharing
- ✅ Browse community-rated safe routes
- ✅ View profile and stats

## Project Structure

```
securewaynative/
├── index.js                          # App entry point (URL polyfill loaded here)
├── src/
│   ├── App.tsx                       # Root navigation container
│   ├── screens/
│   │   ├── LoginScreen.tsx           # Phone + OTP authentication
│   │   └── TabScreens.tsx            # All 5 tab screens (Dashboard, Contacts, Location, Routes, Profile)
│   ├── navigation/
│   │   └── MainTabNavigator.tsx      # Bottom tab navigator
│   ├── lib/
│   │   └── secureway-store.ts        # Supabase data layer + demo bypass
│   └── integrations/
│       └── supabase/
│           └── client.ts             # Supabase client with AsyncStorage
├── ios/                              # Native iOS project (open .xcworkspace in Xcode)
└── android/                          # Native Android project
```

## Running on a Physical Device

1. Open `securewaynative/ios/securewaynative.xcworkspace` in Xcode
2. Select your connected device from the device dropdown
3. Set your development team under **Signing & Capabilities**
4. Click Run (▶) or press `Cmd + R`
