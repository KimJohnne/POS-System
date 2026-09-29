import React, { useState, useEffect } from 'react';
import { Settings as SettingsType } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { MobileInstallHub } from './MobileInstallHub';
import { DocumentationModal } from './DocumentationModal';
import { Wifi, WifiOff, AlertTriangle, Clock, Smartphone, FileText } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface HeaderProps {
  settings: SettingsType;
  lowStockCount: number;
  onNavigateToStock: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  lowStockCount,
  onNavigateToStock,
}) => {
  const isOnline = useOnlineStatus();
  const [timeStr, setTimeStr] = useState<string>('');
  const [isMobileHubOpen, setIsMobileHubOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="bg-stone-900 border-b border-stone-800 text-stone-100 px-4 py-3 shrink-0 no-print">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Shop info */}
          <div className="flex items-center gap-3">
            <div className="md:hidden flex items-center gap-2">
              <span className="font-extrabold text-amber-400 tracking-wider text-sm">CELLAR</span>
              <span className="text-stone-400 text-xs font-mono">POS</span>
            </div>

            <div className="hidden sm:block">
              <h2 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                <span>{settings.shop_name}</span>
                {settings.till_number && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                    {settings.till_number}
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-stone-400 truncate max-w-xs">{settings.shop_location}</p>
            </div>
          </div>

          {/* Center / Right: Warnings & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Low Stock Alert Button */}
            {lowStockCount > 0 && (
              <button
                onClick={onNavigateToStock}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition active:scale-95"
                title={`${lowStockCount} products are low or out of stock`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>{lowStockCount} Low Stock</span>
              </button>
            )}

            {/* Mobile Apps Hub button */}
            <button
              onClick={() => setIsMobileHubOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition active:scale-95"
              title="Download Mobile Apps for Android & iPhone"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span>Mobile Apps</span>
            </button>

            {/* System Documentation button */}
            <button
              onClick={() => setIsDocsOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition active:scale-95"
              title="View & Download System Documentation (PDF, DOCX, Markdown)"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Docs</span>
            </button>

            {/* Real-time Clock */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-stone-400 font-mono bg-stone-800/80 px-2.5 py-1 rounded-lg border border-stone-700/60">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>{timeStr}</span>
            </div>

            {/* Offline / Online status indicator */}
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                isOnline
                  ? 'bg-stone-800 text-emerald-400 border-emerald-900/50'
                  : 'bg-amber-950/60 text-amber-300 border-amber-800/60'
              }`}
              title={isOnline ? 'Online (Ready for WhatsApp / Print)' : 'Offline (Local mode active)'}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Offline (Local)</span>
                </>
              )}
            </div>

            {/* Desktop / PWA Install Button */}
            <PWAInstallButton compact={true} />
          </div>
        </div>
      </header>

      {/* Mobile Apps & Installation Hub Modal */}
      <MobileInstallHub
        isOpen={isMobileHubOpen}
        onClose={() => setIsMobileHubOpen(false)}
      />

      {/* System Documentation & Manuals Modal */}
      <DocumentationModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />
    </>
  );
};
