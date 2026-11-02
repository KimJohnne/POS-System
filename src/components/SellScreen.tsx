import React, { useState, useMemo } from 'react';
import { Product, CartItem, Settings } from '../types';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  Banknote, 
  Smartphone, 
  Check, 
  AlertCircle,
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface SellScreenProps {
  products: Product[];
  settings: Settings;
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
  onUpdateCartQty: (productId: string, delta: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onClearCart: () => void;
  onCompleteSale: (payload: {
    items: CartItem[];
    payment_method: 'Cash' | 'M-Pesa';
    reference?: string;
    cash_received?: number;
    change?: number;
  }) => boolean;
}

export const SellScreen: React.FC<SellScreenProps> = ({
  products,
  settings,
  cart,
  onAddToCart,
  onUpdateCartQty,
  onRemoveFromCart,
  onClearCart,
  onCompleteSale,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'M-Pesa'>('Cash');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [mpesaReference, setMpesaReference] = useState<string>('');
  const [isCartOpenMobile, setIsCartOpenMobile] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Categories list including 'All'
  const categories = useMemo(() => {
    return ['All', ...settings.categories];
  }, [settings.categories]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat =
        selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, selectedCategory]);

  // Cart calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((count, item) => count + item.qty, 0);
  }, [cart]);

  const numCashTendered = parseFloat(cashTendered) || 0;
  const cashChange = numCashTendered >= cartSubtotal ? numCashTendered - cartSubtotal : 0;
  const isCashSufficient = paymentMethod === 'Cash' ? numCashTendered >= cartSubtotal : true;

  // Format currency
  const formatKSh = (amount: number) => {
    return `KSh ${amount.toLocaleString('en-KE')}`;
  };

  // Quick cash buttons
  const handleQuickCash = (amount: number) => {
    setCashTendered(String(amount));
    setErrorMessage(null);
  };

  const handleExactCash = () => {
    setCashTendered(String(cartSubtotal));
    setErrorMessage(null);
  };

  const handleAddQuickTender = (addAmount: number) => {
    const current = parseFloat(cashTendered) || 0;
    setCashTendered(String(current + addAmount));
    setErrorMessage(null);
  };

  // Complete checkout handler
  const handleCheckout = () => {
    if (cart.length === 0) {
      setErrorMessage('Your cart is empty. Add products before completing a sale.');
      return;
    }

    if (paymentMethod === 'Cash') {
      if (numCashTendered < cartSubtotal) {
        setErrorMessage(
          `Cash tendered (${formatKSh(numCashTendered)}) is less than total (${formatKSh(
            cartSubtotal
          )}). Need ${formatKSh(cartSubtotal - numCashTendered)} more.`
        );
        return;
      }
    }

    if (paymentMethod === 'M-Pesa' && !/^[A-Z0-9-]{6,32}$/.test(mpesaReference.trim().toUpperCase())) {
      setErrorMessage('Enter the confirmed M-Pesa reference (6–32 letters, digits or hyphens).');
      return;
    }

    // Complete sale; retain entered payment details when persistence fails.
    const succeeded = onCompleteSale({
      items: cart,
      payment_method: paymentMethod,
      reference: paymentMethod === 'M-Pesa' ? mpesaReference.trim().toUpperCase() : undefined,
      cash_received: paymentMethod === 'Cash' ? numCashTendered : undefined,
      change: paymentMethod === 'Cash' ? cashChange : undefined,
    });

    if (!succeeded) {
      setErrorMessage('Transaction was not saved. Check the error and try again.');
      return;
    }

    // Reset local checkout states
    setCashTendered('');
    setMpesaReference('');
    setErrorMessage(null);
    setIsCartOpenMobile(false);
  };

  // Category badge colors
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Spirits':
        return 'bg-amber-950/40 text-amber-300 border-amber-800/40';
      case 'Wine':
        return 'bg-rose-950/40 text-rose-300 border-rose-800/40';
      case 'Beer':
        return 'bg-yellow-950/40 text-yellow-300 border-yellow-800/40';
      case 'Cider/RTD':
        return 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40';
      case 'Mixers & Soft Drinks':
        return 'bg-cyan-950/40 text-cyan-300 border-cyan-800/40';
      default:
        return 'bg-stone-800 text-stone-300 border-stone-700';
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-stone-950 text-stone-100">
      {/* LEFT SECTION: Search, Categories & Product Grid */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden border-r border-stone-800">
        {/* Top Controls: Search Bar & Filter Chips */}
        <div className="p-3 sm:p-4 border-b border-stone-800 bg-stone-900/60 backdrop-blur-md space-y-3 shrink-0">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products by name or category (e.g. Gilbeys, Tusker, Jameson)..."
              className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Chips Scrollable Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {categories.map(cat => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition active:scale-95 ${
                    isSelected
                      ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                      : 'bg-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-700/80 border border-stone-700/40'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Catalog Grid */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          {filteredProducts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-stone-500">
              <Search className="w-10 h-10 mb-2 stroke-1 text-stone-600" />
              <p className="font-semibold text-stone-300 text-sm">No products found</p>
              <p className="text-xs text-stone-500 mt-1">
                Try a different keyword or category filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3.5">
              {filteredProducts.map(product => {
                const threshold =
                  product.low_stock_threshold ?? settings.low_stock_threshold;
                const isOutOfStock = product.qty <= 0;
                const isLowStock = !isOutOfStock && product.qty <= threshold;
                const inCartItem = cart.find(i => i.product.id === product.id);
                const inCartQty = inCartItem?.qty || 0;

                return (
                  <button
                    key={product.id}
                    disabled={isOutOfStock}
                    onClick={() => {
                      if (!isOutOfStock) onAddToCart(product);
                    }}
                    className={`group relative text-left p-3.5 rounded-2xl border transition-all flex flex-col justify-between select-none ${
                      isOutOfStock
                        ? 'bg-stone-900/40 border-stone-800/50 opacity-55 cursor-not-allowed'
                        : inCartQty > 0
                        ? 'bg-stone-900 border-amber-500/60 shadow-lg shadow-amber-500/5 hover:border-amber-400'
                        : 'bg-stone-900/80 border-stone-800 hover:border-stone-700 hover:bg-stone-900 active:scale-[0.98]'
                    }`}
                  >
                    {/* Top: Category Tag & Cart Count */}
                    <div className="flex items-center justify-between gap-1 w-full mb-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${getCategoryColor(
                          product.category
                        )}`}
                      >
                        {product.category}
                      </span>

                      {inCartQty > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-amber-500 text-stone-950 animate-in fade-in">
                          {inCartQty} in cart
                        </span>
                      )}
                    </div>

                    {/* Middle: Product Name */}
                    <div className="my-1.5 flex-1">
                      <h3 className="font-bold text-sm text-stone-100 group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
                        {product.name}
                      </h3>
                    </div>

                    {/* Bottom: Price & Stock Status */}
                    <div className="pt-2 border-t border-stone-800/80 flex items-end justify-between gap-1 w-full">
                      <div className="font-extrabold text-base font-mono text-amber-400">
                        {formatKSh(product.price)}
                      </div>

                      {/* Stock Badge */}
                      {isOutOfStock ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800">
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 text-amber-400 border border-amber-800 animate-pulse">
                          {product.qty} left
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-stone-400">
                          {product.qty} in stock
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Mobile Floating Cart Summary Button */}
        {cart.length > 0 && (
          <div className="lg:hidden p-3 bg-stone-900 border-t border-stone-800 shrink-0 mb-14 sm:mb-0 no-print">
            <button
              onClick={() => setIsCartOpenMobile(true)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold transition shadow-lg active:scale-98"
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                <span className="text-sm">
                  {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold font-mono">
                  {formatKSh(cartSubtotal)}
                </span>
                <span className="text-xs bg-stone-950/20 px-2 py-0.5 rounded-md">View Cart →</span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* RIGHT SECTION: Cart & Checkout Panel (Desktop fixed sidebar & Mobile slide-over) */}
      <div
        className={`${
          isCartOpenMobile ? 'fixed inset-0 z-50 flex flex-col bg-stone-950' : 'hidden lg:flex'
        } lg:w-96 xl:w-[420px] flex-col bg-stone-900 shrink-0 border-l border-stone-800 text-stone-100 overflow-hidden`}
      >
        {/* Cart Header */}
        <div className="p-4 border-b border-stone-800 flex items-center justify-between shrink-0 bg-stone-900">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-amber-400" />
            <h2 className="font-extrabold text-base tracking-tight">Active Till Cart</h2>
            {cart.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {cartItemCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={onClearCart}
                className="text-xs text-stone-400 hover:text-rose-400 transition px-2 py-1 rounded hover:bg-stone-800 flex items-center gap-1"
                title="Clear all items in cart"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
            {/* Close button for mobile slide-over */}
            {isCartOpenMobile && (
              <button
                onClick={() => setIsCartOpenMobile(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {/* Cart Line Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {cart.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-stone-500">
              <div className="w-14 h-14 rounded-2xl bg-stone-800/80 flex items-center justify-center mb-3">
                <ShoppingCart className="w-7 h-7 text-stone-600" />
              </div>
              <p className="font-bold text-stone-300 text-sm">Till Cart is Empty</p>
              <p className="text-xs text-stone-500 mt-1 max-w-xs">
                Tap or click items in the catalog to add them to this sale.
              </p>
            </div>
          ) : (
            cart.map(item => {
              const maxStock = item.product.qty;
              const isAtMaxStock = item.qty >= maxStock;

              return (
                <div
                  key={item.product.id}
                  className="p-3 rounded-2xl bg-stone-950/70 border border-stone-800/80 flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-xs text-stone-100 truncate">
                      {item.product.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-stone-400">
                      <span>{formatKSh(item.product.price)} each</span>
                      <span>•</span>
                      <span className="text-stone-500 font-mono">Stock: {maxStock}</span>
                    </div>
                  </div>

                  {/* Quantity Stepper & Remove */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center bg-stone-800 rounded-xl p-0.5 border border-stone-700/60">
                      <button
                        onClick={() => onUpdateCartQty(item.product.id, -1)}
                        className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-stone-700 active:scale-95 transition"
                        title="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <span className="w-7 text-center font-mono font-bold text-xs text-stone-100">
                        {item.qty}
                      </span>

                      <button
                        onClick={() => onUpdateCartQty(item.product.id, 1)}
                        disabled={isAtMaxStock}
                        className={`p-1.5 rounded-lg transition ${
                          isAtMaxStock
                            ? 'text-stone-600 cursor-not-allowed'
                            : 'text-stone-300 hover:text-white hover:bg-stone-700 active:scale-95'
                        }`}
                        title={isAtMaxStock ? 'Cannot exceed stock on hand' : 'Increase quantity'}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Line total */}
                    <div className="w-20 text-right font-mono font-bold text-xs text-stone-200">
                      {formatKSh(item.product.price * item.qty)}
                    </div>

                    <button
                      onClick={() => onRemoveFromCart(item.product.id)}
                      className="p-1 rounded text-stone-500 hover:text-rose-400 transition"
                      title="Remove line"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Checkout Drawer Section */}
        {cart.length > 0 && (
          <div className="p-4 bg-stone-950 border-t border-stone-800 space-y-3 shrink-0">
            {/* Subtotal & Total */}
            <div className="space-y-1 pb-3 border-b border-stone-800">
              <div className="flex justify-between text-xs text-stone-400">
                <span>Subtotal ({cartItemCount} items):</span>
                <span className="font-mono text-stone-300">{formatKSh(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between items-baseline pt-1">
                <span className="text-sm font-bold text-stone-200 uppercase tracking-wider">
                  Total Due:
                </span>
                <span className="text-xl font-extrabold font-mono text-amber-400">
                  {formatKSh(cartSubtotal)}
                </span>
              </div>
            </div>

            {/* Payment Method Switcher */}
            <div>
              <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1.5">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('Cash');
                    setErrorMessage(null);
                  }}
                  className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition ${
                    paymentMethod === 'Cash'
                      ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md shadow-amber-500/20'
                      : 'bg-stone-900 text-stone-400 border-stone-800 hover:bg-stone-800'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>Cash</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('M-Pesa');
                    setErrorMessage(null);
                  }}
                  className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition ${
                    paymentMethod === 'M-Pesa'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20'
                      : 'bg-stone-900 text-stone-400 border-stone-800 hover:bg-stone-800'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>M-Pesa</span>
                </button>
              </div>
            </div>

            {/* Payment Inputs */}
            {paymentMethod === 'Cash' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-300">
                    Cash Tendered (KSh)
                  </label>
                  <button
                    type="button"
                    onClick={handleExactCash}
                    className="text-[11px] font-bold text-amber-400 hover:underline"
                  >
                    Exact ({formatKSh(cartSubtotal)})
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={cashTendered}
                    onChange={e => {
                      setCashTendered(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder={`e.g. ${cartSubtotal}`}
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3.5 py-2.5 text-base font-mono text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-stone-500">
                    KSh
                  </span>
                </div>

                {/* Quick denomination chips */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {[100, 200, 500, 1000, 2000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleAddQuickTender(amt)}
                      className="px-2 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-[11px] font-mono text-stone-300 transition"
                    >
                      +{amt}
                    </button>
                  ))}
                </div>

                {/* Change Calculated */}
                {numCashTendered > 0 && (
                  <div
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-mono transition ${
                      isCashSufficient
                        ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
                        : 'bg-rose-950/40 border-rose-800/50 text-rose-300'
                    }`}
                  >
                    <span>{isCashSufficient ? 'Change to return:' : 'Shortage:'}</span>
                    <span className="font-bold text-sm">
                      {isCashSufficient
                        ? formatKSh(cashChange)
                        : formatKSh(cartSubtotal - numCashTendered)}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
                  <span>M-Pesa Confirmation Code</span>
                  <span className="text-[10px] text-stone-500">Optional / Manual</span>
                </label>
                <input
                  type="text"
                  value={mpesaReference}
                  onChange={e => {
                    setMpesaReference(e.target.value.toUpperCase());
                    setErrorMessage(null);
                  }}
                  placeholder="e.g. QKH7189KL0"
                  className="w-full uppercase bg-stone-900 border border-stone-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-stone-500">
                  Enter the code from the customer's M-Pesa SMS to print on their receipt.
                </p>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-800 text-xs text-rose-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Complete Sale Button */}
            <button
              onClick={handleCheckout}
              disabled={!isCashSufficient && paymentMethod === 'Cash'}
              className={`w-full py-3.5 px-4 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98 ${
                paymentMethod === 'Cash' && !isCashSufficient
                  ? 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-500/20'
              }`}
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>Complete Sale ({formatKSh(cartSubtotal)})</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
