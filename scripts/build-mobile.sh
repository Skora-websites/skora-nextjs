#!/bin/bash
# ══════════════════════════════════════════════════════════════
# Skora HRMS — Mobile App Build Script
# ══════════════════════════════════════════════════════════════

set -e

echo "╔═══════════════════════════════════════════════════════╗"
echo "║   Skora HRMS — Mobile App Builder                    ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# ── Step 1: Check prerequisites ──────────────────────────
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Install from https://nodejs.org"
  exit 1
fi
echo "  ✅ Node.js $(node --version)"

# Check Java
if command -v java &> /dev/null; then
  echo "  ✅ Java $(java -version 2>&1 | head -1)"
else
  echo "  ❌ Java not found. Install JDK 17+:"
  echo "     Windows: https://adoptium.net"
  echo "     macOS: brew install --cask temurin17"
  exit 1
fi

# Check ANDROID_HOME
if [ -z "$ANDROID_HOME" ]; then
  if [ -d "$LOCALAPPDATA/Android/Sdk" ]; then
    export ANDROID_HOME="$LOCALAPPDATA/Android/Sdk"
  elif [ -d "$HOME/Library/Android/sdk" ]; then
    export ANDROID_HOME="$HOME/Library/Android/sdk"
  else
    echo "  ❌ Android SDK not found. Install Android Studio:"
    echo "     https://developer.android.com/studio"
    exit 1
  fi
fi
echo "  ✅ Android SDK: $ANDROID_HOME"

echo ""

# ── Step 2: Update capacitor.config.ts with server URL ───
echo "📝 Server URL Configuration"
echo ""
echo "  Current server URL in capacitor.config.ts:"
grep -A2 "url:" capacitor.config.ts | head -3
echo ""
echo "  ⚠️  IMPORTANT: Update the server URL before building!"
echo "  Edit capacitor.config.ts and change:"
echo '    url: "http://10.0.2.2:3000"  →  url: "https://your-server.com"'
echo ""
read -p "  Press Enter when ready to continue..." 

# ── Step 3: Install dependencies ──────────────────────────
echo ""
echo "📦 Installing dependencies..."
npm install

# ── Step 4: Build Next.js app ─────────────────────────────
echo ""
echo "🔨 Building Next.js app..."
npm run build

# ── Step 5: Sync with Capacitor ───────────────────────────
echo ""
echo "📱 Syncing with Capacitor..."
npx cap sync android
npx cap sync ios

echo ""
echo "✅ Build complete!"
echo ""

# ── Step 6: Build Android APK ─────────────────────────────
echo "📱 Android APK Build"
echo "─────────────────────"
echo ""
echo "  Option A: Build APK from command line"
echo "    cd android && ./gradlew assembleDebug"
echo "    APK location: android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "  Option B: Open in Android Studio"
echo "    npx cap open android"
echo "    Then: Build → Build Bundle(s) / APK(s)"
echo ""
echo "  For production (Play Store):"
echo "    cd android && ./gradlew bundleRelease"
echo "    AAB location: android/app/build/outputs/bundle/release/app-release.aab"
echo ""

# ── Step 7: iOS Build ─────────────────────────────────────
echo "🍎 iOS Build (requires macOS)"
echo "──────────────────────────────"
echo ""
echo "  1. Open in Xcode:"
echo "    npx cap open ios"
echo ""
echo "  2. In Xcode:"
echo "    - Select your team (Apple Developer account)"
echo "    - Product → Archive"
echo "    - Upload to App Store Connect"
echo ""
echo "  For testing on device (free):"
echo "    - Connect iPhone via USB"
echo "    - Select your device in Xcode"
echo "    - Press Run (▶)"
echo "    - App works for 7 days without paid account"
echo ""

echo "╔═══════════════════════════════════════════════════════╗"
echo "║   Build Complete!                                    ║"
echo "╠═══════════════════════════════════════════════════════╣"
echo "║                                                       ║"
echo "║  📱 Android APK:  cd android && ./gradlew assembleDebug ║"
echo "║  🍎 iOS:          npx cap open ios                    ║"
echo "║                                                       ║"
echo "║  For Play Store:                                      ║"
echo "║    cd android && ./gradlew bundleRelease              ║"
echo "║                                                       ║"
echo "║  For App Store:                                       ║"
echo "║    Xcode → Product → Archive → Upload                ║"
echo "║                                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
