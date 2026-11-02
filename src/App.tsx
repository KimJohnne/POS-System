/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Product, StockAdjustment, Sale, Settings, CartItem } from './types';
import {
  initStorage,
  getProducts,
  saveProducts,
  saveCatalogProduct,
  getStockAdjustments,
  recordStockAdjustment,
  getSales,
  getSettings,
  saveSettings,
  completeSale,
  voidSale,
  exportDatabaseBackup,
  importDatabaseBackup,
  resetToSampleData,
} from './lib/storage';
import { Navigation, NavTab } from './components/Navigation';
import { Header } from './components/Header';
import { SellScreen } from './components/SellScreen';
import { StockScreen } from './components/StockScreen';
import { SalesScreen } from './components/SalesScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { ReceiptModal } from './components/ReceiptModal';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>('sell');

  // Application Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [settings, setSettings] = useState<Settings>(getSettings());

  // Active Cart State
  const [cart, setCart] = useState<CartItem[]>([]);

  // Receipt Modal State
  const [viewingReceipt, setViewingReceipt] = useState<Sale | null>(null);

  // Online / Offline tracking
  const isOnline = useOnlineStatus();

  // Load state from local database engine
  const refreshAllData = useCallback(() => {
    setProducts(getProducts());
    setAdjustments(getStockAdjustments());
    setSales(getSales());
    setSettings(getSettings());
  }, []);

  useEffect(() => {
    initStorage();
    refreshAllData();
    setIsReady(true);
  }, [refreshAllData]);

  // Low stock calculation
  const lowStockCount = products.filter(
    p => p.qty <= (p.low_stock_threshold ?? settings.low_stock_threshold)
  ).length;

  // Today sales count
  const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Nairobi', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const todaySalesCount = sales.filter(
    s => new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Nairobi', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(s.ts)) === todayStr && s.status === 'completed'
  ).length;

  const totalCartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // CART ACTIONS
  const handleAddToCart = (product: Product) => {
    if (product.qty <= 0) return;

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.qty < product.qty) {
          return prev.map(item =>
            item.product.id === product.id
              ? { ...item, qty: item.qty + 1 }
              : item
          );
        }
        return prev; // stock limit reached
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const handleUpdateCartQty = (productId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.qty + delta;
            if (newQty <= 0) return null;
            if (newQty > item.product.qty) return item; // limit to on-hand stock
            return { ...item, qty: newQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // CHECKOUT & SALE
  const handleCompleteSale = (payload: {
    items: CartItem[];
    payment_method: 'Cash' | 'M-Pesa';
    reference?: string;
    cash_received?: number;
    change?: number;
  }): boolean => {
    try {
      const newSale = completeSale(payload);
      refreshAllData();
      setCart([]);
      setViewingReceipt(newSale); // Automatically opens receipt modal
      return true;
    } catch (err) {
      alert(`Sale failed: ${(err as Error).message}`);
      return false;
    }
  };

  // VOID SALE
  const handleVoidSale = (saleId: string, reason: string) => {
    try {
      const updatedOriginal = voidSale(saleId, reason);
      refreshAllData();
      if (viewingReceipt && viewingReceipt.id === saleId) {
        setViewingReceipt(updatedOriginal);
      }
    } catch (err) {
      alert(`Void failed: ${(err as Error).message}`);
    }
  };

  // PRODUCT ACTIONS
  const handleSaveProduct = (
    prodData: Partial<Product> & { name: string; category: string; price: number; qty: number }
  ) => {
    const prods = [...products];
    if (prodData.id) {
      // Edit
      const idx = prods.findIndex(p => p.id === prodData.id);
      if (idx !== -1) {
        prods[idx] = {
          ...prods[idx],
          name: prodData.name,
          category: prodData.category,
          price: prodData.price,
          qty: prodData.qty,
          low_stock_threshold: prodData.low_stock_threshold,
          updated_at: new Date().toISOString(),
        };
      }
    } else {
      // Add
      const newProd: Product = {
        id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: prodData.name,
        category: prodData.category,
        price: prodData.price,
        qty: prodData.qty,
        low_stock_threshold: prodData.low_stock_threshold,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      prods.unshift(newProd);
    }

    const changed = prods.find(p => p.id === (prodData.id || '')) || prods[0];
    saveCatalogProduct(changed);
    refreshAllData();
  };

  const handleDeleteProduct = (productId: string) => {
    if (sales.some(s => s.items.some(i => i.product_id === productId))) {
      alert('Cannot delete products with sales history. Set stock to zero instead.');
      return;
    }
    if (products.some(p => p.id === productId && p.qty !== 0)) {
      alert('Set stock to zero using a recorded correction before deleting.');
      return;
    }
    const updated = products.filter(p => p.id !== productId);
    saveProducts(updated);
    setProducts(updated);
    setCart(prev => prev.filter(c => c.product.id !== productId));
  };

  const handleRecordAdjustment = (adjData: {
    product_id: string;
    product_name: string;
    delta: number;
    reason: any;
    notes?: string;
  }) => {
    recordStockAdjustment(adjData);
    refreshAllData();
  };

  // SETTINGS ACTIONS
  const handleUpdateSettings = (newSettings: Settings) => {
    saveSettings(newSettings);
    setSettings(newSettings);
  };

  const handleExportBackup = () => {
    exportDatabaseBackup();
  };

  const handleImportBackup = (fileContent: string) => {
    const result = importDatabaseBackup(fileContent);
    if (result.success) {
      refreshAllData();
      setCart([]);
    }
    return result;
  };

  const handleResetSampleData = () => {
    resetToSampleData();
    refreshAllData();
    setCart([]);
  };

  if (!isReady) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-stone-950 text-amber-400 font-mono text-sm">
        Initializing Cellar POS Database...
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-stone-950 text-stone-100 font-sans antialiased">
      {/* Left Rail Navigation (Desktop & Tablet) */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        lowStockCount={lowStockCount}
        todaySalesCount={todaySalesCount}
        cartItemCount={totalCartCount}
      />

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header
          settings={settings}
          lowStockCount={lowStockCount}
          onNavigateToStock={() => setActiveTab('stock')}
        />

        {/* Active Screen */}
        <main className="flex-1 flex min-h-0 overflow-hidden relative">
          {activeTab === 'sell' && (
            <SellScreen
              products={products}
              settings={settings}
              cart={cart}
              onAddToCart={handleAddToCart}
              onUpdateCartQty={handleUpdateCartQty}
              onRemoveFromCart={handleRemoveFromCart}
              onClearCart={handleClearCart}
              onCompleteSale={handleCompleteSale}
            />
          )}

          {activeTab === 'stock' && (
            <StockScreen
              products={products}
              adjustments={adjustments}
              settings={settings}
              onSaveProduct={handleSaveProduct}
              onDeleteProduct={handleDeleteProduct}
              onRecordAdjustment={handleRecordAdjustment}
            />
          )}

          {activeTab === 'sales' && (
            <SalesScreen
              sales={sales}
              settings={settings}
              onOpenReceipt={sale => setViewingReceipt(sale)}
              onVoidSale={handleVoidSale}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsScreen
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onExportBackup={handleExportBackup}
              onImportBackup={handleImportBackup}
              onResetSampleData={handleResetSampleData}
            />
          )}
        </main>
      </div>

      {/* Receipt Modal (opened upon completing sale or tapping any sale in log) */}
      {viewingReceipt && (
        <ReceiptModal
          sale={viewingReceipt}
          settings={settings}
          onClose={() => setViewingReceipt(null)}
          onNewSale={() => {
            setViewingReceipt(null);
            setActiveTab('sell');
          }}
          onVoidSale={saleId => {
            handleVoidSale(saleId, 'Customer return requested');
          }}
        />
      )}

      {/* Offline Toast Indicator */}
      {!isOnline && (
        <div className="fixed bottom-16 md:bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-2xl animate-in slide-in-from-bottom-2 no-print">
          <WifiOff className="w-4 h-4 text-amber-200 shrink-0" />
          <span>Offline Mode: Operating normally from local in-store database.</span>
        </div>
      )}
    </div>
  );
}
