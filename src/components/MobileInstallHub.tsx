import React, { useState } from 'react';
import { 
  Smartphone, 
  Apple, 
  Download, 
  Check, 
  X, 
  QrCode, 
  ExternalLink, 
  ShieldCheck, 
  Monitor,
  Info
} from 'lucide-react';

interface MobileInstallHubProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileInstallHub: React.FC<MobileInstallHubProps> = ({ isOpen, onClose }) => {
  const [activePlatform, setActivePlatform] = useState<'android' | 'ios' | 'desktop'>('android');
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const downloadFile = async (url: string, filename: string, mimeType: string) => {
    setDownloading(filename);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(new Blob([blob], { type: mimeType }));
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(objectUrl);
        setDownloading(null);
      }, 800);
    } catch {
      setDownloading(null);
      window.open(url, '_blank');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // SVG QR Code generator for the current app URL
  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    currentUrl
  )}&color=000000&bgcolor=ffffff&qzone=1`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto no-print">
      <div className="w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 text-stone-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-800 bg-stone-950/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Mobile Apps & Installation Hub</h3>
              <p className="text-xs text-stone-400">
                Install Cellar POS on Android phones, iPhones, iPads, and Windows computers.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Tabs */}
        <div className="flex items-center border-b border-stone-800 bg-stone-950 px-4 pt-2 gap-2 shrink-0">
          <button
            onClick={() => setActivePlatform('android')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activePlatform === 'android'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Android (APK / WebAPK)</span>
          </button>

          <button
            onClick={() => setActivePlatform('ios')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activePlatform === 'ios'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Apple className="w-4 h-4" />
            <span>Apple iOS (iPhone / iPad)</span>
          </button>

          <button
            onClick={() => setActivePlatform('desktop')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activePlatform === 'desktop'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Windows Desktop (.zip)</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Quick QR Code Scanner (Available across all mobile devices) */}
          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 flex flex-col sm:flex-row items-center gap-4">
            <div className="p-2 bg-white rounded-xl shadow-md shrink-0">
              <img
                src={qrSvgUrl}
                alt="Scan to open on phone"
                className="w-28 h-28 object-contain"
              />
            </div>
            <div className="space-y-1.5 text-center sm:text-left flex-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Scan With Phone Camera
              </span>
              <h4 className="font-bold text-sm text-stone-100">
                Open Cellar POS Directly on Your Phone
              </h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                Scan this QR code with your iPhone or Android camera to immediately launch the till app on your mobile device.
              </p>
              <div className="pt-1 flex items-center justify-center sm:justify-start gap-2">
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-mono font-medium border border-stone-700 transition"
                >
                  {copiedLink ? 'Copied Link!' : 'Copy App URL'}
                </button>
              </div>
            </div>
          </div>

          {/* TAB 1: ANDROID */}
          {activePlatform === 'android' && (
            <div className="space-y-4">
              {/* Method 1: Instant PWA/WebAPK Install */}
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-400">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h4 className="font-bold text-sm text-stone-100">
                    Method 1: Instant Android Device Installation (Recommended)
                  </h4>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  On Android phones running Chrome, Edge, or Samsung Internet, the system automatically registers as a native Android app:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-xs text-stone-400 font-mono">
                  <li>Open this till link in Chrome or Edge on your Android phone.</li>
                  <li>Tap the <strong>"Install App"</strong> prompt banner or tap the 3 dots (⋮) menu.</li>
                  <li>Tap <strong>"Install Cellar POS"</strong> or <strong>"Add to Home Screen"</strong>.</li>
                  <li>The app is installed to your Android App Drawer, operates full-screen, and caches 100% of data offline!</li>
                </ol>
              </div>

              {/* Method 2: Android Studio APK Project */}
              <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-stone-100">
                      Method 2: Download Android Studio Native Project
                    </h4>
                    <p className="text-xs text-stone-400 mt-1">
                      Complete native Android wrapper project with pre-bundled offline HTML/JS/CSS assets in <code>assets/www/</code>, <code>AndroidManifest.xml</code>, and <code>build.gradle</code>.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 shrink-0">
                    226 KB (.zip)
                  </span>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-800">
                  <span className="text-[11px] text-stone-500 font-mono">
                    Run: ./gradlew assembleRelease to build .apk
                  </span>
                  <button
                    type="button"
                    onClick={() => downloadFile('/cellar-pos-android-project.zip', 'cellar-pos-android-project.zip', 'application/zip')}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-95 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Android Project (.zip)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: APPLE iOS */}
          {activePlatform === 'ios' && (
            <div className="space-y-4">
              {/* Method 1: Apple .mobileconfig Profile */}
              <div className="p-4 rounded-2xl bg-sky-950/20 border border-sky-900/40 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 text-sky-400">
                    <Apple className="w-5 h-5 text-sky-400" />
                    <h4 className="font-bold text-sm text-stone-100">
                      Method 1: Apple Configuration Profile (.mobileconfig)
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 shrink-0">
                    Instant iOS Profile
                  </span>
                </div>

                <p className="text-xs text-stone-300 leading-relaxed">
                  Apple's official enterprise & developer profile format for installing standalone app WebClips onto an iPhone or iPad:
                </p>

                <ol className="list-decimal list-inside space-y-1 text-xs text-stone-400 font-mono">
                  <li>Download <strong>cellar-pos.mobileconfig</strong> on your iPhone or iPad.</li>
                  <li>Safari will notify: <em>"Profile Downloaded"</em>.</li>
                  <li>Open <strong>Settings</strong> $\rightarrow$ tap <strong>"Profile Downloaded"</strong> (or General $\rightarrow$ VPN & Device Management).</li>
                  <li>Tap <strong>Install</strong> in the top right corner. The Cellar POS app icon will appear permanently on your iPhone home screen!</li>
                </ol>

                <div className="pt-2 border-t border-sky-900/30 flex justify-end">
                  <button
                    type="button"
                    onClick={() => downloadFile('/cellar-pos.mobileconfig', 'cellar-pos.mobileconfig', 'application/x-apple-aspen-config')}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition active:scale-95 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download cellar-pos.mobileconfig</span>
                  </button>
                </div>
              </div>

              {/* Method 2: Safari Add to Home Screen */}
              <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2.5">
                <h4 className="font-bold text-sm text-stone-100">
                  Method 2: Safari "Add to Home Screen"
                </h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  1. Open this website in Safari on your iPhone.<br />
                  2. Tap the <strong>Share</strong> button (box with upward arrow at bottom).<br />
                  3. Scroll down and tap <strong>"Add to Home Screen"</strong>.<br />
                  4. Tap <strong>Add</strong>. It runs standalone without Safari toolbars!
                </p>
              </div>

              {/* Method 3: Xcode Native Project */}
              <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-stone-100">
                      Method 3: Download Xcode Native iOS Project
                    </h4>
                    <p className="text-xs text-stone-400 mt-1">
                      Native Swift + WKWebView project with local asset bundle, <code>Info.plist</code>, and app icons for building directly in Xcode or deploying to TestFlight.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-300 shrink-0">
                    224 KB (.zip)
                  </span>
                </div>

                <div className="pt-2 flex justify-end border-t border-stone-800">
                  <button
                    type="button"
                    onClick={() => downloadFile('/cellar-pos-ios-project.zip', 'cellar-pos-ios-project.zip', 'application/zip')}
                    className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center gap-2 border border-stone-700 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download iOS Xcode Project (.zip)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DESKTOP */}
          {activePlatform === 'desktop' && (
            <div className="space-y-4">
              {/* Method 1: Windows Setup Wizard (.exe) */}
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-stone-100">
                        Method 1: Windows Setup Installer (.exe)
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        Recommended
                      </span>
                    </div>
                    <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                      Official Windows Setup Wizard (NSIS). Automatically installs Cellar POS, adds a Desktop icon with custom liquor till logo, creates a Start Menu entry, and adds a Control Panel uninstaller.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-900 text-stone-300 border border-stone-800 shrink-0">
                    1.6 MB (.exe)
                  </span>
                </div>

                <div className="pt-2 flex justify-end border-t border-emerald-900/30">
                  <button
                    type="button"
                    onClick={() => downloadFile('/Cellar-POS-Setup-v1.0.exe', 'Cellar-POS-Setup-v1.0.exe', 'application/vnd.microsoft.portable-executable')}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition active:scale-95 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Windows Setup (.exe)</span>
                  </button>
                </div>
              </div>

              {/* Method 2: Portable ZIP Package */}
              <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-stone-100">
                      Method 2: Standalone Portable Offline Package (.zip)
                    </h4>
                    <p className="text-xs text-stone-400 mt-1">
                      Zero-installation portable directory. Extract to a USB flash drive or desktop and double-click <code>start-cellar-pos.bat</code> or <code>open-in-browser.bat</code>.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700 shrink-0">
                    386 KB (.zip)
                  </span>
                </div>

                <div className="pt-2 flex justify-end border-t border-stone-800">
                  <button
                    type="button"
                    onClick={() => downloadFile('/cellar-pos-desktop-offline-installer.zip', 'cellar-pos-desktop-offline-installer.zip', 'application/zip')}
                    className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-bold text-xs flex items-center gap-2 shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Portable (.zip)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-stone-500">
            Offline SQLite compatible local database preserved across all platforms.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
