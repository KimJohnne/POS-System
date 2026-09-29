import React from 'react';
import { ShoppingCart, Package, ReceiptText, Settings as SettingsIcon, Wine } from 'lucide-react';

export type NavTab = 'sell' | 'stock' | 'sales' | 'settings';

interface NavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  lowStockCount: number;
  todaySalesCount: number;
  cartItemCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  lowStockCount,
  todaySalesCount,
  cartItemCount,
}) => {
  const tabs = [
    {
      id: 'sell' as NavTab,
      label: 'Sell',
      icon: ShoppingCart,
      badge: cartItemCount > 0 ? `${cartItemCount}` : null,
      badgeColor: 'bg-amber-500 text-stone-950 font-bold',
    },
    {
      id: 'stock' as NavTab,
      label: 'Stock',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} low` : null,
      badgeColor: 'bg-amber-600/90 text-white font-medium text-[10px]',
    },
    {
      id: 'sales' as NavTab,
      label: 'Sales',
      icon: ReceiptText,
      badge: todaySalesCount > 0 ? `${todaySalesCount}` : null,
      badgeColor: 'bg-stone-700 text-stone-200 text-[10px]',
    },
    {
      id: 'settings' as NavTab,
      label: 'Settings',
      icon: SettingsIcon,
      badge: null,
      badgeColor: '',
    },
  ];

  return (
    <>
      {/* Desktop & Tablet Left Rail (md and up) */}
      <aside className="hidden md:flex flex-col justify-between w-64 bg-stone-900 border-r border-stone-800 shrink-0 select-none text-stone-200">
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-stone-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 via-rose-800 to-amber-900 flex items-center justify-center shadow-lg shadow-rose-950/40 border border-amber-500/20">
              <Wine className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                CELLAR <span className="text-amber-400 font-semibold">POS</span>
              </h1>
              <p className="text-[11px] text-stone-400 uppercase tracking-widest font-mono">Wines & Spirits Till</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 mt-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-semibold text-sm transition-all text-left ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                      : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-stone-950' : 'text-stone-400'}`} />
                    <span>{tab.label}</span>
                  </div>

                  {tab.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs leading-none ${
                        isActive ? 'bg-stone-950 text-amber-300' : tab.badgeColor
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Till Footer Info in Rail */}
        <div className="p-4 border-t border-stone-800 space-y-2 text-xs text-stone-400">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-stone-300 font-medium">Till Active</span>
            </span>
            <span className="text-[10px] font-mono text-stone-400 bg-stone-800 px-1.5 py-0.5 rounded">v1.0 Local</span>
          </div>
          <p className="text-[11px] text-stone-400 leading-tight">
            100% offline data stored in local SQLite format.
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar (sm and down) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-900 border-t border-stone-800 shadow-2xl flex items-center justify-around px-2 py-2 safe-bottom no-print">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-xs font-medium transition relative ${
                isActive
                  ? 'text-amber-400 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-amber-400' : ''}`} />
                {tab.badge && (
                  <span
                    className={`absolute -top-1.5 -right-2.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold leading-tight ${
                      isActive ? 'bg-amber-400 text-stone-950' : 'bg-amber-600 text-white'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="mt-1 text-[11px]">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
