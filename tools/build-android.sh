#!/bin/bash
# Android Build | Usage: ./tools/build-android.sh [debug|release] [--install] [--clean]
set -e
cd "$(dirname "$0")/.."

TYPE="${1:-debug}"
INSTALL=false; CLEAN=false
for arg in "$@"; do
  case $arg in --install|-i) INSTALL=true;; --clean|-c) CLEAN=true;; debug|release) TYPE="$arg";; esac
done

[ ! -d "android" ] && echo "Error: android/ not found" && exit 1
[ ! -d "node_modules" ] && npm install

cd android
$CLEAN && ./gradlew clean
[ "$TYPE" = "release" ] && ./gradlew assembleRelease || ./gradlew assembleDebug
cd ..

APK=$(find "android/app/build/outputs/apk/$TYPE" -name "*.apk" 2>/dev/null | head -1)
[ -z "$APK" ] && echo "Build failed: APK not found" && exit 1

echo "✅ APK: $APK ($(du -h "$APK" | cut -f1))"

if $INSTALL; then
  command -v adb &>/dev/null || { echo "ADB not found"; exit 1; }
  adb install -r "$APK"
  PKG=$(grep "applicationId" android/app/build.gradle | head -1 | sed 's/.*"\(.*\)".*/\1/')
  [ -n "$PKG" ] && adb shell am start -n "$PKG/.MainActivity"
fi
