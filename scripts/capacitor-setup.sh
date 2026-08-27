#!/bin/bash
# ══════════════════════════════════════════════════════════════
# Skora HRMS — Capacitor Mobile App Setup Guide
# ══════════════════════════════════════════════════════════════

echo "╔═══════════════════════════════════════════════════════╗"
echo "║   Skora HRMS — Mobile App Setup (Capacitor)         ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# ── Step 1: Prerequisites ──────────────────────────────────
echo "📋 STEP 1: Prerequisites Check"
echo "─────────────────────────────"

# Check Node.js
if command -v node &> /dev/null; then
  echo "  ✅ Node.js: $(node --version)"
else
  echo "  ❌ Node.js not found. Install from https://nodejs.org"
  exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
  echo "  ✅ npm: $(npm --version)"
else
  echo "  ❌ npm not found"
  exit 1
fi

# Check Java (for Android)
if command -v java &> /dev/null; then
  echo "  ✅ Java: $(java -version 2>&1 | head -1)"
else
  echo "  ⚠️  Java not found. Install JDK 17+ for Android builds"
  echo "     Download: https://adoptium.net"
fi

# Check Android SDK
if [ -d "$ANDROID_HOME" ] || [ -d "$ANDROID_SDK_ROOT" ]; then
  echo "  ✅ Android SDK found"
else
  echo "  ⚠️  Android SDK not found. Install Android Studio for Android builds"
  echo "     Download: https://developer.android.com/studio"
fi

# Check Xcode (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
  if command -v xcodebuild &> /dev/null; then
    echo "  ✅ Xcode: $(xcodebuild -version | head -1)"
  else
    echo "  ⚠️  Xcode not found. Install from App Store for iOS builds"
  fi
else
  echo "  ℹ️  Not macOS — iOS builds require a Mac"
fi

echo ""

# ── Step 2: Install dependencies ───────────────────────────
echo "📦 STEP 2: Installing Capacitor dependencies..."
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios \
  @capacitor/push-notifications @capacitor/local-notifications \
  @capacitor/haptics @capacitor/share @capacitor/camera \
  @capacitor/splash-screen @capacitor/status-bar @capacitor/keyboard

echo ""

# ── Step 3: Add platforms ──────────────────────────────────
echo "📱 STEP 3: Adding mobile platforms..."

if [ -d "android" ]; then
  echo "  ℹ️  Android platform already exists"
else
  echo "  ➕ Adding Android platform..."
  npx cap add android
fi

if [[ "$OSTYPE" == "darwin"* ]]; then
  if [ -d "ios" ]; then
    echo "  ℹ️  iOS platform already exists"
  else
    echo "  ➕ Adding iOS platform..."
    npx cap add ios
  fi
else
  echo "  ⏭️  Skipping iOS (not macOS)"
fi

echo ""

# ── Step 4: Build & Sync ──────────────────────────────────
echo "🔨 STEP 4: Building web app and syncing with Capacitor..."
echo ""
echo "  ⚠️  IMPORTANT: Before building, update capacitor.config.ts"
echo "     Set server.url to your deployed server URL:"
echo "     e.g., https://hrms.yourcompany.com"
echo ""
echo "  For local development:"
echo "     server.url: 'http://YOUR_IP:3000'"
echo "     (Use your machine's IP, not localhost, for mobile device)"
echo ""

read -p "  Ready to build? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "  🔨 Building Next.js..."
  npm run build
  
  echo "  📱 Syncing with Capacitor..."
  npx cap sync
  
  echo ""
  echo "  ✅ Build complete!"
  echo ""
  
  # ── Step 5: Open in IDE ──────────────────────────────────
  echo "🚀 STEP 5: Opening in IDE..."
  if [[ "$OSTYPE" == "darwin"* ]] && [ -d "ios" ]; then
    read -p "  Open iOS project in Xcode? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      npx cap open ios
    fi
  fi
  
  if [ -d "android" ]; then
    read -p "  Open Android project in Android Studio? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      npx cap open android
    fi
  fi
else
  echo "  ⏭️  Skipped build. Run 'npm run build:mobile' when ready."
fi

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║   Setup Complete!                                    ║"
echo "╠═══════════════════════════════════════════════════════╣"
echo "║                                                       ║"
echo "║  📱 Android:  npx cap open android                    ║"
echo "║  🍎 iOS:      npx cap open ios                        ║"
echo "║  🔄 Sync:     npx cap sync                            ║"
echo "║  🏃 Run:      npx cap run android / ios               ║"
echo "║                                                       ║"
echo "║  For production builds:                               ║"
echo "║  - Android: Build APK/AAB in Android Studio           ║"
echo "║  - iOS: Archive in Xcode → Upload to App Store        ║"
echo "║                                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
