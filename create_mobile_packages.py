import os
import base64
import zipfile
import shutil

app_url = "https://ais-dev-4tzssnswtwyamrzryb6jkm-978042510279.europe-west2.run.app"
dist_dir = "dist"
public_dir = "public"

os.makedirs(public_dir, exist_ok=True)
os.makedirs(dist_dir, exist_ok=True)

# 1. GENERATE iOS .mobileconfig (Official Apple Configuration Profile for direct iPhone/iPad App install)
icon_path = os.path.join(public_dir, "apple-touch-icon.png")
icon_b64 = ""
if os.path.exists(icon_path):
    with open(icon_path, "rb") as f:
        icon_b64 = base64.b64encode(f.read()).decode("utf-8")

mobileconfig_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PayloadContent</key>
    <array>
        <dict>
            <key>FullScreen</key>
            <true/>
            <key>Icon</key>
            <data>
{icon_b64}
            </data>
            <key>IsRemovable</key>
            <true/>
            <key>Label</key>
            <string>Cellar POS</string>
            <key>PayloadDescription</key>
            <string>Installs the Cellar POS in-store retail till on your iOS device</string>
            <key>PayloadDisplayName</key>
            <string>Cellar POS Till</string>
            <key>PayloadIdentifier</key>
            <string>com.cellarpos.till.webclip</string>
            <key>PayloadType</key>
            <string>com.apple.webClip.managed</string>
            <key>PayloadUUID</key>
            <string>B6C3F1B0-9A24-4B4B-9E36-8E7B2F64C001</string>
            <key>PayloadVersion</key>
            <integer>1</integer>
            <key>Precomposed</key>
            <true/>
            <key>URL</key>
            <string>{app_url}</string>
        </dict>
    </array>
    <key>PayloadDescription</key>
    <string>Installs the Cellar POS Wines &amp; Spirits retail till app on your iPhone or iPad.</string>
    <key>PayloadDisplayName</key>
    <string>Cellar POS Mobile App</string>
    <key>PayloadIdentifier</key>
    <string>com.cellarpos.till</string>
    <key>PayloadOrganization</key>
    <string>The Cellar Wines &amp; Spirits</string>
    <key>PayloadRemovalDisallowed</key>
    <false/>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>E71822F0-45D3-4819-B5B9-F8436B690A02</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
</dict>
</plist>
"""

with open(os.path.join(public_dir, "cellar-pos.mobileconfig"), "w", encoding="utf-8") as f:
    f.write(mobileconfig_content)
with open(os.path.join(dist_dir, "cellar-pos.mobileconfig"), "w", encoding="utf-8") as f:
    f.write(mobileconfig_content)

print("Generated iOS .mobileconfig profile")

# 2. GENERATE ANDROID STUDIO PROJECT (Ready-to-build APK with pre-bundled offline web assets)
android_dir = "mobile-android-project"
if os.path.exists(android_dir):
    shutil.rmtree(android_dir)

app_assets = os.path.join(android_dir, "app", "src", "main", "assets", "www")
os.makedirs(app_assets, exist_ok=True)
os.makedirs(os.path.join(android_dir, "app", "src", "main", "java", "com", "cellarpos", "till"), exist_ok=True)
os.makedirs(os.path.join(android_dir, "app", "src", "main", "res", "values"), exist_ok=True)
os.makedirs(os.path.join(android_dir, "app", "src", "main", "res", "mipmap"), exist_ok=True)

# Copy dist files to assets/www
for item in os.listdir(dist_dir):
    s = os.path.join(dist_dir, item)
    d = os.path.join(app_assets, item)
    if os.path.isdir(s):
        shutil.copytree(s, d)
    elif not item.endswith(".zip"):
        shutil.copy2(s, d)

# AndroidManifest.xml
manifest = """<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.cellarpos.till">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Cellar POS"
        android:roundIcon="@mipmap/ic_launcher"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.NoTitleBar.Fullscreen">
        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|keyboardHidden|screenSize"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
"""
with open(os.path.join(android_dir, "app", "src", "main", "AndroidManifest.xml"), "w") as f:
    f.write(manifest)

# MainActivity.java
main_activity = """package com.cellarpos.till;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.view.Window;
import android.view.WindowManager;

public class MainActivity extends Activity {
    private WebView mWebView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);

        mWebView = new WebView(this);
        setContentView(mWebView);

        WebSettings webSettings = mWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);

        mWebView.setWebViewClient(new WebViewClient());
        // Loads offline bundled local POS till
        mWebView.loadUrl("file:///android_asset/www/index.html");
    }

    @Override
    public void onBackPressed() {
        if (mWebView != null && mWebView.canGoBack()) {
            mWebView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
"""
with open(os.path.join(android_dir, "app", "src", "main", "java", "com", "cellarpos", "till", "MainActivity.java"), "w") as f:
    f.write(main_activity)

# root build.gradle
root_gradle = """// Top-level build file
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.2'
    }
}
allprojects {
    repositories {
        google()
        mavenCentral()
    }
}
"""
with open(os.path.join(android_dir, "build.gradle"), "w") as f:
    f.write(root_gradle)

# app build.gradle
app_gradle = """plugins {
    id 'com.android.application'
}

android {
    namespace 'com.cellarpos.till'
    compileSdk 34

    defaultConfig {
        applicationId "com.cellarpos.till"
        minSdk 21
        targetSdk 34
        versionCode 1
        versionName "1.0"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
}
"""
with open(os.path.join(android_dir, "app", "build.gradle"), "w") as f:
    f.write(app_gradle)

# settings.gradle
with open(os.path.join(android_dir, "settings.gradle"), "w") as f:
    f.write("rootProject.name = 'Cellar POS'\ninclude ':app'\n")

# Android README
android_readme = """============================================================
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
"""
with open(os.path.join(android_dir, "README.txt"), "w") as f:
    f.write(android_readme)

# Copy icon to android res
if os.path.exists(os.path.join(public_dir, "pwa-192x192.png")):
    shutil.copy2(os.path.join(public_dir, "pwa-192x192.png"), os.path.join(android_dir, "app", "src", "main", "res", "mipmap", "ic_launcher.png"))

# Zip Android Project
android_zip = os.path.join(public_dir, "cellar-pos-android-project.zip")
with zipfile.ZipFile(android_zip, "w", zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(android_dir):
        for file in files:
            fp = os.path.join(root, file)
            arcname = os.path.relpath(fp, android_dir)
            zf.write(fp, arcname)

shutil.copy2(android_zip, os.path.join(dist_dir, "cellar-pos-android-project.zip"))
print("Generated Android Studio project package, size:", os.path.getsize(android_zip))

# 3. GENERATE iOS XCODE PROJECT PACKAGE
ios_dir = "mobile-ios-project"
if os.path.exists(ios_dir):
    shutil.rmtree(ios_dir)

ios_app_dir = os.path.join(ios_dir, "CellarPOS")
ios_assets_dir = os.path.join(ios_app_dir, "www")
os.makedirs(ios_assets_dir, exist_ok=True)

# Copy dist files to iOS www
for item in os.listdir(dist_dir):
    s = os.path.join(dist_dir, item)
    d = os.path.join(ios_assets_dir, item)
    if os.path.isdir(s):
        shutil.copytree(s, d)
    elif not item.endswith(".zip"):
        shutil.copy2(s, d)

# ViewController.swift
view_controller = """import UIKit
import WebKit

class ViewController: UIViewController, WKNavigationDelegate {
    var webView: WKWebView!

    override func loadView() {
        let webConfiguration = WKWebViewConfiguration()
        webConfiguration.allowsInlineMediaPlayback = true
        webView = WKWebView(frame: .zero, configuration: webConfiguration)
        webView.navigationDelegate = self
        view = webView
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        // Load bundled offline POS till from local app bundle
        if let htmlPath = Bundle.main.path(forResource: "index", ofType: "html", inDirectory: "www") {
            let htmlUrl = URL(fileURLWithPath: htmlPath)
            webView.loadFileURL(htmlUrl, allowingReadAccessTo: htmlUrl.deletingLastPathComponent())
        }
    }
}
"""
with open(os.path.join(ios_app_dir, "ViewController.swift"), "w") as f:
    f.write(view_controller)

# Info.plist
info_plist = """<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleDisplayName</key>
    <string>Cellar POS</string>
    <key>CFBundleExecutable</key>
    <string>$(EXECUTABLE_NAME)</string>
    <key>CFBundleIdentifier</key>
    <string>com.cellarpos.till</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>$(PRODUCT_NAME)</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSRequiresIPhoneOS</key>
    <true/>
    <key>UIRequiredDeviceCapabilities</key>
    <array>
        <string>armv7</string>
    </array>
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
</dict>
</plist>
"""
with open(os.path.join(ios_app_dir, "Info.plist"), "w") as f:
    f.write(info_plist)

# iOS README
ios_readme = """============================================================
 CELLAR POS — iOS XCODE NATIVE APPLICATION PACKAGE
============================================================

This package contains the complete native iOS project (Swift/WKWebView)
with all production web assets pre-bundled inside the app.

HOW TO RUN & INSTALL ON IPHONE / IPAD:
1. Open this project in Xcode on any Mac.
2. Select your connected iPhone or an iOS Simulator.
3. Select your Personal Apple Team in Signing & Capabilities.
4. Press Run (Cmd + R) to install directly onto the iPhone!

FOR NO-MAC / INSTANT HOME SCREEN INSTALLATION:
- Open the till website in Safari on the iPhone.
- Tap the Share button -> tap "Add to Home Screen".
- Or download the Apple "cellar-pos.mobileconfig" profile to install
  as a managed WebClip profile.
"""
with open(os.path.join(ios_dir, "README.txt"), "w") as f:
    f.write(ios_readme)

# Zip iOS Project
ios_zip = os.path.join(public_dir, "cellar-pos-ios-project.zip")
with zipfile.ZipFile(ios_zip, "w", zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(ios_dir):
        for file in files:
            fp = os.path.join(root, file)
            arcname = os.path.relpath(fp, ios_dir)
            zf.write(fp, arcname)

shutil.copy2(ios_zip, os.path.join(dist_dir, "cellar-pos-ios-project.zip"))
print("Generated iOS Xcode project package, size:", os.path.getsize(ios_zip))
