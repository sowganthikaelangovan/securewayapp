# SecureWay - Women's Safety App

SecureWay is a modern, mobile-first women's safety web application built with React, Vite, TanStack Router, and Supabase. It is packaged using Ionic Capacitor to run as a dedicated native iOS application.

## Prerequisites

Before getting started, ensure you have the following installed on your Mac:
1. **Node.js** (v18 or higher) and **npm**
2. **Xcode** (Available from the Mac App Store) for iOS compilation and the iOS Simulator
3. **CocoaPods** (Run `sudo gem install cocoapods` in terminal if you don't have it installed)

## Getting Started

Follow these steps from start to finish to get SecureWay running in the Xcode iOS Simulator.

### 1. Clone the Repository
Open your terminal and clone the project:
```bash
git clone <your-repository-url>
cd securewayapp
```

### 2. Install Dependencies
Install all the required Node packages:
```bash
npm install
```

### 3. Local Development Setup (Live Reload)
For the best development experience, you can point the native app to your local Vite server. This means any changes you make in your IDE will instantly update in the iOS simulator without needing to rebuild via Xcode.

1. **Start the local dev server:**
   ```bash
   npm run dev
   ```
   *Note: Leave this terminal window running in the background.*

2. **Verify your Capacitor configuration:**
   Open `capacitor.config.ts` and ensure it contains the `server` configuration pointing to your local port:
   ```typescript
   import { CapacitorConfig } from '@capacitor/cli';

   const config: CapacitorConfig = {
     appId: 'com.secureway.app',
     appName: 'SecureWay',
     webDir: 'dist/client',
     server: {
       url: 'http://localhost:8080', // Make sure this matches your Vite dev server port
       cleartext: true
     }
   };
   export default config;
   ```

3. **Sync with iOS and Open Xcode:**
   Open a *new* terminal window and run:
   ```bash
   npx cap sync ios
   npx cap open ios
   ```
   This will synchronize the web assets and native plugins, and automatically open the `ios/App` workspace in Xcode.

4. **Run in the Simulator:**
   - At the top of the Xcode window, select a simulator (e.g., **iPhone 15 Pro**).
   - Click the **Run button** (the ▶ play icon) or press `Cmd + R`.
   - The iOS simulator will boot up, install SecureWay as a dedicated native app on the home screen, and launch it!

### 4. Creating a Standalone Production Build
If you want to test the app exactly how it will run on a real phone in production (without needing the Vite dev server running in the background), follow these steps:

1. **Build the static web project:**
   ```bash
   npm run build
   ```
2. **Update Capacitor config:**
   In `capacitor.config.ts`, you **must** remove or comment out the `server` block so the native app knows to read from the bundled `dist/client` directory instead of trying to load localhost:
   ```typescript
   const config: CapacitorConfig = {
     appId: 'com.secureway.app',
     appName: 'SecureWay',
     webDir: 'dist/client',
     // REMOVE OR COMMENT OUT THIS BLOCK:
     // server: {
     //   url: 'http://localhost:8080',
     //   cleartext: true
     // }
   };
   export default config;
   ```
3. **Sync and Run:**
   ```bash
   npx cap sync ios
   npx cap open ios
   ```
   Then run the project in Xcode as you normally would.

## Testing the App (Demo Credentials)
You do not need to configure an SMS provider (like Twilio) or even connect to the live Supabase database to test the user interface. We have built in a local demo bypass:

- **Phone Number:** `+91 99999 99999` (You can simply tap the demo hint on the login screen to autofill this)
- **OTP Code:** `123456`

Using these exact credentials will safely bypass the real authentication flow. It creates a mocked local session allowing you to test all features — triggering SOS alerts, managing emergency contacts, and viewing location data — completely offline.
