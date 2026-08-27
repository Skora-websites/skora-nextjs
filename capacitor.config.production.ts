import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Production Capacitor config
 * 
 * Before building for production:
 * 1. Deploy your Next.js app to a server (Vercel, AWS, etc.)
 * 2. Update SERVER_URL below to your deployed URL
 * 3. Run: npx cap sync
 * 4. Build in Android Studio / Xcode
 */
const SERVER_URL = "https://hrms.yourcompany.com"; // ← CHANGE THIS

const config: CapacitorConfig = {
  appId: "com.skora.hrms",
  appName: "Skora HRMS",
  webDir: "out",
  server: {
    androidScheme: "https",
    url: SERVER_URL,
    cleartext: false, // Production — HTTPS only
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2500,
      backgroundColor: "#0B0F19",
      showSpinner: true,
      spinnerColor: "#6366f1",
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0B0F19",
    },
  },
  android: {
    allowMixedContent: false, // HTTPS only in production
  },
  ios: {
    contentInset: "automatic",
    backgroundColor: "#0B0F19",
    scheme: "SkoraHRMS",
  },
};

export default config;
