import React, { useState } from 'react';
import { Download, Monitor, Smartphone, Check, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  if (isInstalled) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-950/40 text-emerald-300 border border-emerald-800/40`}>
        <Check className="w-3.5 h-3.5 text-emerald-400" />
        <span>Installed App</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setJustInstalled(true);
        setTimeout(() => setJustInstalled(false), 3000);
      }
    } else {
      setShowGuide(true);
    }
  };

  if (compact) {
    return (
      <>
        <button
          onClick={handleInstallClick}
          title="Install Cellar POS on this PC or tablet"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 active:scale-95 transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install Till</span>
        </button>

        {showGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs no-print">
            <div className="w-full max-w-md rounded-2xl bg-stone-900 border border-stone-800 p-6 shadow-2xl text-stone-100">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-base">Install Cellar POS Desktop App</h3>
                </div>
                <button
                  onClick={() => setShowGuide(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-4 text-sm text-stone-300">
                <p>
                  Cellar POS can run as a standalone desktop application on Windows, Linux, Mac, or touchscreen tablets without browser toolbars.
                </p>

                {isIOS ? (
                  <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700/60 space-y-2">
                    <p className="font-semibold text-amber-300 flex items-center gap-2">
                      <Smartphone className="w-4 h-4" /> iPad / iPhone Installation:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-xs text-stone-300">
                      <li>Tap the <strong>Share</strong> icon in the Safari toolbar.</li>
                      <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
                      <li>Launch Cellar POS directly from your home screen.</li>
                    </ol>
                  </div>
                ) : (
                  <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700/60 space-y-2">
                    <p className="font-semibold text-amber-300 flex items-center gap-2">
                      <Monitor className="w-4 h-4" /> Windows / Chrome / Edge Installation:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-xs text-stone-300">
                      <li>Look for the <strong>Install icon</strong> in your browser address bar (top right).</li>
                      <li>Click <strong>Install Cellar POS</strong> to add it to your Windows Start Menu, Taskbar, and Desktop.</li>
                      <li>It runs 100% offline with no internet required for everyday till ringing.</li>
                    </ol>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowGuide(false)}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 font-semibold text-sm text-stone-950 transition"
                >
                  Understood
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-950 border border-stone-800 shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-amber-400" />
            <h4 className="font-bold text-stone-100 text-sm">Standalone In-Store Installation</h4>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed">
            Install this application onto your in-store Windows computer or tablet. It runs in full-screen window mode, operates completely offline, and connects directly to your local database.
          </p>
        </div>
        <button
          onClick={handleInstallClick}
          className="shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500 text-stone-950 hover:bg-amber-400 active:scale-95 transition shadow-sm"
        >
          <Download className="w-4 h-4" />
          {isInstallable ? 'Install Now' : 'How to Install'}
        </button>
      </div>

      {justInstalled && (
        <p className="mt-2 text-xs text-emerald-400 font-medium flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5" /> App installed successfully! You can launch it from your Desktop or Start Menu.
        </p>
      )}

      {showGuide && (
        <div className="mt-4 pt-3 border-t border-stone-800 text-xs text-stone-300 space-y-2">
          <p className="font-semibold text-amber-300">Instructions for this PC:</p>
          <p>
            Click the Install icon in your browser's address bar (on the right end of the URL bar in Google Chrome or Microsoft Edge), or click menu (⋮) → "Cast, save, and share" → "Install Cellar POS".
          </p>
        </div>
      )}
    </div>
  );
};
