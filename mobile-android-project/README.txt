============================================================
 CELLAR POS — ANDROID NATIVE APPLICATION PACKAGE
============================================================

This package contains the complete Android project with local
offline web assets bundled inside assets/www/.

HOW TO BUILD THE APK:
1. Open this folder in Android Studio, OR
2. In terminal run:
   ./gradlew assembleRelease
   (or ./gradlew assembleDebug)
3. The compiled APK will be generated at:
   app/build/outputs/apk/debug/app-debug.apk

HOW TO INSTALL ON ANDROID PHONES:
- Connect phone via USB with USB Debugging enabled, or
- Copy app-debug.apk directly to phone storage, tap it to install!
- Alternatively, users can install directly from Chrome by tapping
  "Install App" on the till website.
