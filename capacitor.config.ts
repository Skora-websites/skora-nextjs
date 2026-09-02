import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.skora.hrms",
  appName: "Skora HRMS",
  webDir: "out",
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    BackgroundLocation: {
      // Native background-location implementation must be configured in the
      // platform projects with the required OS permissions and review settings.
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
    allowMixedContent: false,
  },
  ios: {
    contentInset: "automatic",
    backgroundColor: "#0B0F19",
  },
};

export default config;
