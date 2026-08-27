import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.skora.hrms",
  appName: "Skora HRMS",
  webDir: "out",
  server: {
    androidScheme: "https",
    url: "http://10.0.2.2:3000",
    cleartext: true,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    BackgroundLocation: {
      // Android: Foreground service for background GPS
      // iOS: Always Allow location permission + background modes
    },
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: "#0B0F19",
      showSpinner: true,
      spinnerColor: "#6366f1",
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0B0F19",
    },
  },
  android: {
    allowMixedContent: true,
    // Permissions are configured in AndroidManifest.xml:
    // - ACCESS_FINE_LOCATION
    // - ACCESS_COARSE_LOCATION
    // - ACCESS_BACKGROUND_LOCATION
    // - FOREGROUND_SERVICE
    // - FOREGROUND_SERVICE_LOCATION
    // - WAKE_LOCK
    // - RECEIVE_BOOT_COMPLETED
  },
  ios: {
    contentInset: "automatic",
    backgroundColor: "#0B0F19",
    // Background modes configured in Info.plist:
    // - location
    // - background-fetch
    // - remote-notification
    // Location permission: "Always Allow"
  },
};

export default config;
