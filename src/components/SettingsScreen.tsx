import React, { useState } from 'react';
import { Settings } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { DocumentationModal } from './DocumentationModal';
import { 
  Settings as SettingsIcon, 
  Store, 
  Sliders, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  AlertTriangle, 
  ShieldAlert, 
  Plus, 
  X,
  FileCheck,
  Info,
  Smartphone,
  Apple,
  QrCode,
  BookOpen,
  FileText,
  Laptop
} from 'lucide-react';

interface SettingsScreenProps {
  settings: Settings;
  onUpdateSettings: (newSettings: Settings) => void;
  onExportBackup: () => void;
  onImportBackup: (fileContent: string) => { success: boolean; message: string };
  onResetSampleData: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onExportBackup,
  onImportBackup,
  onResetSampleData,
}) => {
  // Shop details form
  const [shopName, setShopName] = useState(settings.shop_name);
  const [shopPhone, setShopPhone] = useState(settings.shop_phone);
  const [shopLocation, setShopLocation] = useState(settings.shop_location);
  const [tillNumber, setTillNumber] = useState(settings.till_number);
  const [lowStockThreshold, setLowStockThreshold] = useState(String(settings.low_stock_threshold));

  // Category management
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoriesList, setCategoriesList] = useState<string[]>(settings.categories);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);

  // Helper for reliable file downloading in iframe environments
  const downloadFile = async (url: string, filename: string, mimeType: string) => {
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
      }, 800);
    } catch {
      window.open(url, '_blank');
    }
  };

  // Status banners
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [restoreFeedback, setRestoreFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  // Save Shop profile
  const handleSaveShopProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const thresholdNum = parseInt(lowStockThreshold, 10) || 5;

    const updated: Settings = {
      ...settings,
      shop_name: shopName.trim() || 'The Cellar Wines & Spirits',
      shop_phone: shopPhone.trim(),
      shop_location: shopLocation.trim(),
      till_number: tillNumber.trim(),
      low_stock_threshold: thresholdNum,
      categories: categoriesList,
    };

    onUpdateSettings(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Add Category
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const cat = newCategoryName.trim();
    if (!categoriesList.includes(cat)) {
      const updated = [...categoriesList, cat];
      setCategoriesList(updated);
      onUpdateSettings({ ...settings, categories: updated });
    }
    setNewCategoryName('');
  };

  // Remove Category
  const handleRemoveCategory = (catToRemove: string) => {
    const updated = categoriesList.filter(c => c !== catToRemove);
    setCategoriesList(updated);
    onUpdateSettings({ ...settings, categories: updated });
  };

  // File import handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const result = onImportBackup(content);
        setRestoreFeedback(result);
        setTimeout(() => setRestoreFeedback(null), 5000);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset
  };

  return (
    <div className="flex-1 overflow-y-auto bg-stone-950 text-stone-100 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-stone-800">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          <SettingsIcon className="w-6 h-6 text-amber-400" />
          <span>Till & System Settings</span>
        </h1>
        <p className="text-xs text-stone-400 mt-1">
          Configure shop receipt information, low-stock alerts, categories, backups, and desktop install.
        </p>
      </div>

      {/* SECTION 1: SHOP & RECEIPT PROFILE */}
      <div className="p-5 sm:p-6 rounded-2xl bg-stone-900 border border-stone-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-stone-800">
          <Store className="w-5 h-5 text-amber-400" />
          <h2 className="font-bold text-base text-stone-100">Shop Profile & Receipt Header</h2>
        </div>

        <form onSubmit={handleSaveShopProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                Shop Name (Prints on Receipts)
              </label>
              <input
                type="text"
                required
                value={shopName}
                onChange={e => setShopName(e.target.value)}
                placeholder="e.g. The Cellar Wines & Spirits"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                Shop Phone Number
              </label>
              <input
                type="text"
                value={shopPhone}
                onChange={e => setShopPhone(e.target.value)}
                placeholder="e.g. +254 722 123 456"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                Shop Physical Location
              </label>
              <input
                type="text"
                value={shopLocation}
                onChange={e => setShopLocation(e.target.value)}
                placeholder="e.g. Argwings Kodhek Rd, Kilimani, Nairobi"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                Till / Paybill Number (Shown on receipts)
              </label>
              <input
                type="text"
                value={tillNumber}
                onChange={e => setTillNumber(e.target.value)}
                placeholder="e.g. Buy Goods Till: 894521"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm font-mono text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            {savedSuccess ? (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Shop settings saved successfully!</span>
              </span>
            ) : (
              <span className="text-xs text-stone-500">
                Receipts will immediately reflect these updated shop details.
              </span>
            )}

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition active:scale-95"
            >
              Save Shop Details
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: INVENTORY & CATEGORY DEFAULTS */}
      <div className="p-5 sm:p-6 rounded-2xl bg-stone-900 border border-stone-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-stone-800">
          <Sliders className="w-5 h-5 text-amber-400" />
          <h2 className="font-bold text-base text-stone-100">Inventory & Category Rules</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Global Low Stock Threshold */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-300 block">
              Default Global Low-Stock Threshold
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                value={lowStockThreshold}
                onChange={e => setLowStockThreshold(e.target.value)}
                className="w-28 bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm font-mono text-stone-100 focus:outline-none focus:border-amber-500"
              />
              <span className="text-xs text-stone-400">units remaining</span>
            </div>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              When a bottle drops to or below this threshold, the till surfaces an amber warning badge. You can also customize thresholds per individual product.
            </p>
          </div>

          {/* Categories Management */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-300 block">
              Product Categories
            </label>

            <div className="flex flex-wrap gap-1.5">
              {categoriesList.map(cat => (
                <span
                  key={cat}
                  className="px-2.5 py-1 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 text-xs font-medium flex items-center gap-1.5"
                >
                  <span>{cat}</span>
                  {categoriesList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(cat)}
                      className="text-stone-400 hover:text-rose-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="New category name..."
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCategory();
                  }
                }}
                className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500 flex-1 max-w-xs"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs flex items-center gap-1 border border-stone-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: BACKUP & RESTORE (Section 4.5) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-stone-900 border border-stone-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-stone-800">
          <Download className="w-5 h-5 text-amber-400" />
          <h2 className="font-bold text-base text-stone-100">Manual Data Backup & Restore</h2>
        </div>

        <p className="text-xs text-stone-400 leading-relaxed">
          Because Cellar POS is a local, offline-first application, all data resides on this computer. You can export complete snapshots to a USB flash drive or restore your database at any time.
        </p>

        {restoreFeedback && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              restoreFeedback.success
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                : 'bg-rose-950/60 border-rose-800 text-rose-300'
            }`}
          >
            {restoreFeedback.success ? (
              <FileCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            )}
            <span>{restoreFeedback.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Export button */}
          <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 flex flex-col justify-between space-y-3">
            <div>
              <h3 className="font-bold text-sm text-stone-200">Export Backup File</h3>
              <p className="text-xs text-stone-400 mt-1">
                Downloads a full `.json` database file with products, sales receipts, stock adjustments, and settings.
              </p>
            </div>
            <button
              onClick={onExportBackup}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download Backup (.json)</span>
            </button>
          </div>

          {/* Import button */}
          <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 flex flex-col justify-between space-y-3">
            <div>
              <h3 className="font-bold text-sm text-stone-200">Restore from Backup</h3>
              <p className="text-xs text-stone-400 mt-1">
                Select a previously saved Cellar POS backup file to restore onto this machine.
              </p>
            </div>

            <label className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center justify-center gap-2 border border-stone-700 cursor-pointer transition active:scale-95">
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Select File to Restore</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* SECTION 4: MOBILE & DESKTOP INSTALLATION PACKAGES */}
      <div className="space-y-4">
        {/* Browser Direct Desktop/Mobile Install */}
        <PWAInstallButton compact={false} />

        {/* Android Mobile Package Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-stone-900 border border-stone-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-400" />
              <h2 className="font-bold text-base text-stone-100">
                Android Phone & Tablet Mobile Application
              </h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              Android v1.0
            </span>
          </div>

          <p className="text-xs text-stone-400 leading-relaxed">
            Install Cellar POS on Android phones and tablets. On Android Chrome or Samsung Internet, simply tap <strong>"Install App"</strong> to create a native Android application in your app drawer. Alternatively, download the complete Android Studio project pre-bundled with offline assets.
          </p>

          <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[11px] text-stone-500 font-mono">
              Ready-to-compile Android Gradle package (226 KB)
            </span>

            <a
              href="/cellar-pos-android-project.zip"
              download="cellar-pos-android-project.zip"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-95 shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Download Android Package (.zip)</span>
            </a>
          </div>
        </div>

        {/* Apple iOS iPhone & iPad Package Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-stone-900 border border-stone-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <Apple className="w-5 h-5 text-sky-400" />
              <h2 className="font-bold text-base text-stone-100">
                Apple iOS (iPhone & iPad) Application
              </h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
              Apple iOS v1.0
            </span>
          </div>

          <p className="text-xs text-stone-400 leading-relaxed">
            Install directly on any iPhone or iPad using Apple's official <strong>.mobileconfig</strong> profile (creates a permanent home screen icon running in standalone window mode), or download the native Xcode project (Swift/WKWebView).
          </p>

          <div className="pt-1 flex flex-wrap items-center justify-end gap-2.5">
            <a
              href="/cellar-pos.mobileconfig"
              download="cellar-pos.mobileconfig"
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download cellar-pos.mobileconfig</span>
            </a>

            <a
              href="/cellar-pos-ios-project.zip"
              download="cellar-pos-ios-project.zip"
              className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center justify-center gap-2 border border-stone-700 transition active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download iOS Xcode Project (.zip)</span>
            </a>
          </div>
        </div>

        {/* Downloadable Windows Native Installers */}
        <div className="p-5 sm:p-6 rounded-2xl bg-stone-900 border border-stone-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-amber-400" />
              <h2 className="font-bold text-base text-stone-100">
                Windows Desktop Installation Options
              </h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              Setup Wizard (.exe) + Portable (.zip)
            </span>
          </div>

          <p className="text-xs text-stone-400 leading-relaxed">
            Install Cellar POS permanently on your in-store Windows computer. Run the official Windows Setup Wizard to automatically install to your system, create Desktop & Start Menu shortcuts, and register in Windows Control Panel.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Native EXE Installer Card */}
            <div className="p-4 rounded-xl bg-stone-950 border border-emerald-900/40 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-emerald-400 flex items-center gap-1.5">
                    <Laptop className="w-4 h-4" />
                    <span>Windows Setup Installer (.exe)</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Recommended
                  </span>
                </div>
                <p className="text-[11px] text-stone-400">
                  Standard Windows Setup Wizard. Installs desktop icon, Start Menu folder, uninstaller, and auto-launches in standalone app window.
                </p>
              </div>

              <button
                type="button"
                onClick={() => downloadFile('/Cellar-POS-Setup-v1.0.exe', 'Cellar-POS-Setup-v1.0.exe', 'application/vnd.microsoft.portable-executable')}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Windows Setup (.exe)</span>
              </button>
            </div>

            {/* Portable ZIP Card */}
            <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-stone-200 flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>Portable Offline Package (.zip)</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-400 border border-stone-700">
                    386 KB
                  </span>
                </div>
                <p className="text-[11px] text-stone-400">
                  Zero-install portable folder. Extract to USB drive or PC, double-click <code>start-cellar-pos.bat</code> or <code>open-in-browser.bat</code>.
                </p>
              </div>

              <button
                type="button"
                onClick={() => downloadFile('/cellar-pos-desktop-offline-installer.zip', 'cellar-pos-desktop-offline-installer.zip', 'application/zip')}
                className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Portable (.zip)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: FULL SYSTEM DOCUMENTATION & TECHNICAL MANUALS */}
      <div className="p-5 sm:p-6 rounded-2xl bg-stone-900 border border-stone-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-base text-stone-100">
              System Documentation & Technical Manuals
            </h2>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
            Available in PDF, DOCX & Markdown
          </span>
        </div>

        <p className="text-xs text-stone-400 leading-relaxed">
          Comprehensive architecture specifications, entity-relationship data schemas, cashier shift operational procedures (SOP), daily cash/M-Pesa reconciliation guides, and hardware printer integration references.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1">
          {/* Read In-App */}
          <button
            type="button"
            onClick={() => setIsDocsModalOpen(true)}
            className="p-3.5 rounded-xl bg-stone-950 hover:bg-stone-800/80 border border-stone-800 text-left transition flex flex-col justify-between space-y-2 group"
          >
            <div className="flex items-center justify-between text-amber-400">
              <BookOpen className="w-4 h-4" />
              <span className="text-[10px] font-mono text-stone-500 group-hover:text-amber-400">View</span>
            </div>
            <div>
              <span className="font-bold text-xs text-stone-200 block">Interactive Manual</span>
              <span className="text-[10px] text-stone-400">Read in-app viewer</span>
            </div>
          </button>

          {/* PDF Download */}
          <button
            type="button"
            onClick={() => downloadFile('/CELLAR_POS_SOFTWARE_DOCUMENTATION.pdf', 'CELLAR_POS_SOFTWARE_DOCUMENTATION.pdf', 'application/pdf')}
            className="p-3.5 rounded-xl bg-stone-950 hover:bg-rose-950/30 border border-stone-800 hover:border-rose-800 text-left transition flex flex-col justify-between space-y-2 group cursor-pointer"
          >
            <div className="flex items-center justify-between text-rose-400">
              <FileText className="w-4 h-4" />
              <Download className="w-3.5 h-3.5 text-stone-500 group-hover:text-rose-400" />
            </div>
            <div>
              <span className="font-bold text-xs text-stone-200 block">Adobe PDF Document</span>
              <span className="text-[10px] text-rose-300 font-mono">Download .pdf (8 KB)</span>
            </div>
          </button>

          {/* Word DOCX Download */}
          <button
            type="button"
            onClick={() => downloadFile('/CELLAR_POS_SOFTWARE_DOCUMENTATION.docx', 'CELLAR_POS_SOFTWARE_DOCUMENTATION.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')}
            className="p-3.5 rounded-xl bg-stone-950 hover:bg-blue-950/30 border border-stone-800 hover:border-blue-800 text-left transition flex flex-col justify-between space-y-2 group cursor-pointer"
          >
            <div className="flex items-center justify-between text-blue-400">
              <FileText className="w-4 h-4" />
              <Download className="w-3.5 h-3.5 text-stone-500 group-hover:text-blue-400" />
            </div>
            <div>
              <span className="font-bold text-xs text-stone-200 block">Microsoft Word</span>
              <span className="text-[10px] text-blue-300 font-mono">Download .docx (40 KB)</span>
            </div>
          </button>

          {/* Markdown Download */}
          <button
            type="button"
            onClick={() => downloadFile('/CELLAR_POS_SOFTWARE_DOCUMENTATION.md', 'CELLAR_POS_SOFTWARE_DOCUMENTATION.md', 'text/markdown')}
            className="p-3.5 rounded-xl bg-stone-950 hover:bg-stone-800/80 border border-stone-800 hover:border-stone-700 text-left transition flex flex-col justify-between space-y-2 group cursor-pointer"
          >
            <div className="flex items-center justify-between text-stone-400">
              <FileText className="w-4 h-4" />
              <Download className="w-3.5 h-3.5 text-stone-500 group-hover:text-stone-300" />
            </div>
            <div>
              <span className="font-bold text-xs text-stone-200 block">Markdown Source</span>
              <span className="text-[10px] text-stone-400 font-mono">Download .md (17 KB)</span>
            </div>
          </button>
        </div>
      </div>

      {/* SECTION 6: KRA eTIMS COMPLIANCE NOTICE (§7) */}
      <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 text-stone-300 text-xs space-y-2">
        <div className="flex items-center gap-2 text-stone-400 font-bold uppercase tracking-wider text-[11px]">
          <Info className="w-4 h-4 text-amber-400" />
          <span>KRA eTIMS Scope Notice (Version 1.0)</span>
        </div>
        <p className="text-stone-400 leading-relaxed">
          Receipts generated by this application are internal retail receipts for till reconciliation and customer transaction records. In accordance with §7 of the specification, invoices are not transmitted to KRA eTIMS in this version. Every receipt prominently states: <em>"Internal receipt — not a KRA eTIMS tax invoice"</em>.
        </p>
      </div>

      {/* SECTION 6: RESET TO SAMPLE DATA */}
      <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-900/40 space-y-3">
        <div className="flex items-center gap-2 text-rose-400">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          <h3 className="font-bold text-sm">Demo & Training Data Reset</h3>
        </div>
        <p className="text-xs text-stone-400 leading-relaxed">
          Reset database to default Kenyan wines & spirits sample stock (Tusker, Gilbeys, Chrome, Jameson, Four Cousins, etc.) with pre-populated demo sales.
        </p>
        <button
          onClick={() => setShowResetConfirmModal(true)}
          className="px-4 py-2 rounded-xl bg-rose-900/50 hover:bg-rose-800/80 text-rose-200 border border-rose-800 text-xs font-bold transition flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset to Sample Data</span>
        </button>
      </div>

      {/* RESET CONFIRMATION MODAL */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl text-stone-100 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 rounded-xl bg-rose-950/80 border border-rose-800">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
              <h3 className="font-extrabold text-base text-stone-100">Reset All Data?</h3>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              This will overwrite current products, sales receipts, and stock adjustments with sample catalog data.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
              <button
                onClick={() => setShowResetConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onResetSampleData();
                  setShowResetConfirmModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition"
              >
                Yes, Reset Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* System Documentation Modal */}
      <DocumentationModal
        isOpen={isDocsModalOpen}
        onClose={() => setIsDocsModalOpen(false)}
      />
    </div>
  );
};
