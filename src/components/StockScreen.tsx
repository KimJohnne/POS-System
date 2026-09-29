import React, { useState, useMemo } from 'react';
import { Product, StockAdjustment, AdjustmentReason, Settings } from '../types';
import { 
  Plus, 
  Minus,
  Search, 
  Edit3, 
  Trash2, 
  SlidersHorizontal, 
  AlertTriangle, 
  Package, 
  History, 
  ArrowUpRight, 
  ArrowDownRight, 
  Check, 
  X,
  Filter,
  AlertCircle
} from 'lucide-react';

interface StockScreenProps {
  products: Product[];
  adjustments: StockAdjustment[];
  settings: Settings;
  onSaveProduct: (product: Partial<Product> & { name: string; category: string; price: number; qty: number }) => void;
  onDeleteProduct: (productId: string) => void;
  onRecordAdjustment: (adj: {
    product_id: string;
    product_name: string;
    delta: number;
    reason: AdjustmentReason;
    notes?: string;
  }) => void;
}

export const StockScreen: React.FC<StockScreenProps> = ({
  products,
  adjustments,
  settings,
  onSaveProduct,
  onDeleteProduct,
  onRecordAdjustment,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'adjustments'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustTargetProduct, setAdjustTargetProduct] = useState<Product | null>(null);
  const [adjustDelta, setAdjustDelta] = useState<string>('');
  const [adjustType, setAdjustType] = useState<'add' | 'remove'>('add');
  const [adjustReason, setAdjustReason] = useState<AdjustmentReason>('Restock');
  const [adjustNotes, setAdjustNotes] = useState('');
  const [adjustError, setAdjustError] = useState<string | null>(null);

  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<Product | null>(null);

  // Product form state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formQty, setFormQty] = useState('');
  const [formLowStockThreshold, setFormLowStockThreshold] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Categories
  const categories = useMemo(() => {
    return ['All', ...settings.categories];
  }, [settings.categories]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat =
        selectedCategory === 'All' || p.category === selectedCategory;
      const threshold = p.low_stock_threshold ?? settings.low_stock_threshold;
      const isLowOrOut = p.qty <= threshold;
      const matchesLowStock = filterLowStockOnly ? isLowOrOut : true;
      return matchesSearch && matchesCat && matchesLowStock;
    });
  }, [products, searchQuery, selectedCategory, filterLowStockOnly, settings.low_stock_threshold]);

  // Overall metrics
  const totalProducts = products.length;
  const totalUnits = products.reduce((sum, p) => sum + p.qty, 0);
  const lowStockCount = products.filter(
    p => p.qty <= (p.low_stock_threshold ?? settings.low_stock_threshold)
  ).length;

  const formatKSh = (amount: number) => {
    return `KSh ${amount.toLocaleString('en-KE')}`;
  };

  // Open modal to add product
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory(settings.categories[0] || 'Spirits');
    setFormPrice('');
    setFormQty('0');
    setFormLowStockThreshold(String(settings.low_stock_threshold));
    setFormError(null);
    setIsProductModalOpen(true);
  };

  // Open modal to edit product
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormCategory(prod.category);
    setFormPrice(String(prod.price));
    setFormQty(String(prod.qty));
    setFormLowStockThreshold(
      prod.low_stock_threshold !== undefined && prod.low_stock_threshold !== null
        ? String(prod.low_stock_threshold)
        : ''
    );
    setFormError(null);
    setIsProductModalOpen(true);
  };

  // Save Product submit
  const handleSaveProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Product name is required.');
      return;
    }
    const priceNum = parseInt(formPrice, 10);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Valid selling price in KSh is required.');
      return;
    }
    const qtyNum = parseInt(formQty, 10);
    if (isNaN(qtyNum) || qtyNum < 0) {
      setFormError('Valid stock quantity is required.');
      return;
    }

    const thresholdVal = formLowStockThreshold.trim() !== ''
      ? parseInt(formLowStockThreshold, 10)
      : undefined;

    onSaveProduct({
      id: editingProduct ? editingProduct.id : undefined,
      name: formName.trim(),
      category: formCategory || settings.categories[0] || 'Other',
      price: priceNum,
      qty: qtyNum,
      low_stock_threshold: thresholdVal,
    });

    setIsProductModalOpen(false);
  };

  // Open adjustment modal
  const handleOpenAdjust = (prod: Product) => {
    setAdjustTargetProduct(prod);
    setAdjustDelta('1');
    setAdjustType('add');
    setAdjustReason('Restock');
    setAdjustNotes('');
    setAdjustError(null);
    setIsAdjustModalOpen(true);
  };

  // Submit Adjustment
  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTargetProduct) return;

    const deltaNum = parseInt(adjustDelta, 10);
    if (isNaN(deltaNum) || deltaNum <= 0) {
      setAdjustError('Please enter a quantity greater than zero.');
      return;
    }

    const finalDelta = adjustType === 'add' ? deltaNum : -deltaNum;
    if (adjustType === 'remove' && adjustTargetProduct.qty < deltaNum) {
      setAdjustError(`Cannot deduct ${deltaNum}. Current stock is only ${adjustTargetProduct.qty}.`);
      return;
    }

    onRecordAdjustment({
      product_id: adjustTargetProduct.id,
      product_name: adjustTargetProduct.name,
      delta: finalDelta,
      reason: adjustReason,
      notes: adjustNotes.trim() || undefined,
    });

    setIsAdjustModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-stone-950 text-stone-100">
      {/* Top Banner & Stats */}
      <div className="p-4 sm:p-5 border-b border-stone-800 bg-stone-900/50 backdrop-blur-md shrink-0 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-400" />
              <span>Stock & Inventory</span>
            </h1>
            <p className="text-xs text-stone-400 mt-0.5">
              Manage product catalog, unit pricing, stock levels, and audit adjustments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAddProduct}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {/* Quick Stock Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
          <div className="p-3 rounded-xl bg-stone-900 border border-stone-800">
            <span className="text-[11px] text-stone-400 uppercase tracking-wider block font-semibold">
              Total Products
            </span>
            <span className="text-lg sm:text-xl font-extrabold font-mono text-stone-100">
              {totalProducts}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-stone-900 border border-stone-800">
            <span className="text-[11px] text-stone-400 uppercase tracking-wider block font-semibold">
              Total Units On Hand
            </span>
            <span className="text-lg sm:text-xl font-extrabold font-mono text-stone-100">
              {totalUnits}
            </span>
          </div>

          <button
            onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
            className={`col-span-2 sm:col-span-1 p-3 rounded-xl border text-left transition flex items-center justify-between ${
              filterLowStockOnly
                ? 'bg-amber-950/60 border-amber-500/80 text-amber-300'
                : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
            }`}
          >
            <div>
              <span className="text-[11px] uppercase tracking-wider block font-semibold text-stone-400">
                Low / Out of Stock
              </span>
              <span className={`text-lg sm:text-xl font-extrabold font-mono ${lowStockCount > 0 ? 'text-amber-400' : 'text-stone-300'}`}>
                {lowStockCount} items
              </span>
            </div>
            <div className={`px-2 py-1 rounded text-[11px] font-bold ${filterLowStockOnly ? 'bg-amber-400 text-stone-950' : 'bg-stone-800 text-stone-400'}`}>
              {filterLowStockOnly ? 'Filtered' : 'Filter'}
            </div>
          </button>
        </div>

        {/* Tab Switcher: Products Catalog vs Adjustments Log */}
        <div className="flex items-center gap-2 border-b border-stone-800 pb-1">
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'products'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Product Catalog ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('adjustments')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'adjustments'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Stock Adjustments Log ({adjustments.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PRODUCT CATALOG */}
      {activeTab === 'products' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Search & Category Filter Bar */}
          <div className="p-3 sm:p-4 border-b border-stone-800 bg-stone-900/30 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between shrink-0">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search stock by item name or category..."
                className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-8 py-2 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-amber-500 text-stone-950 font-bold'
                      : 'bg-stone-800/80 text-stone-400 hover:text-stone-200 border border-stone-700/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Products Table */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4">
            {filteredProducts.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center p-6 text-stone-500">
                <Package className="w-8 h-8 mb-2 stroke-1 text-stone-600" />
                <p className="font-semibold text-stone-300 text-sm">No products found</p>
                <p className="text-xs text-stone-500 mt-1">Try clearing search filters or add a new product.</p>
              </div>
            ) : (
              <div className="border border-stone-800 rounded-2xl overflow-hidden bg-stone-900/60 shadow-md">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-stone-300">
                    <thead className="bg-stone-950/80 text-stone-400 text-[11px] uppercase tracking-wider font-semibold border-b border-stone-800">
                      <tr>
                        <th className="py-3 px-4">Product Name</th>
                        <th className="py-3 px-3">Category</th>
                        <th className="py-3 px-3">Price (KSh)</th>
                        <th className="py-3 px-3">Stock on Hand</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/70 font-mono">
                      {filteredProducts.map(prod => {
                        const threshold = prod.low_stock_threshold ?? settings.low_stock_threshold;
                        const isOutOfStock = prod.qty <= 0;
                        const isLowStock = !isOutOfStock && prod.qty <= threshold;

                        return (
                          <tr key={prod.id} className="hover:bg-stone-800/40 transition">
                            <td className="py-3 px-4 font-sans font-semibold text-stone-100">
                              {prod.name}
                            </td>
                            <td className="py-3 px-3 font-sans">
                              <span className="px-2 py-0.5 rounded bg-stone-800 border border-stone-700 text-stone-300 text-[10px]">
                                {prod.category}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-bold text-amber-400">
                              {formatKSh(prod.price)}
                            </td>
                            <td className="py-3 px-3 font-bold text-stone-100 text-sm">
                              {prod.qty}
                              {prod.low_stock_threshold !== undefined && prod.low_stock_threshold !== null && (
                                <span className="text-[10px] text-stone-500 font-sans ml-1 font-normal">
                                  (min {prod.low_stock_threshold})
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 font-sans">
                              {isOutOfStock ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800">
                                  Out of Stock
                                </span>
                              ) : isLowStock ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800 flex items-center gap-1 w-fit">
                                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                                  <span>Low ({prod.qty} left)</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950/40 text-emerald-400 border border-emerald-900/50">
                                  In Stock
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right font-sans">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenAdjust(prod)}
                                  className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 transition"
                                  title="Adjust stock (restock, spillage, correction)"
                                >
                                  Adjust
                                </button>
                                <button
                                  onClick={() => handleOpenEditProduct(prod)}
                                  className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
                                  title="Edit product"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmProduct(prod)}
                                  className="p-1.5 rounded-lg text-stone-500 hover:text-rose-400 hover:bg-rose-950/40 transition"
                                  title="Delete product"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: STOCK ADJUSTMENTS LOG */}
      {activeTab === 'adjustments' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="p-3 bg-stone-900/80 border border-stone-800 rounded-2xl flex items-center justify-between text-xs text-stone-400">
            <span className="flex items-center gap-2">
              <History className="w-4 h-4 text-amber-400" />
              <span>Traceable inventory adjustment history (sales, restocks, spillages, and breakages)</span>
            </span>
            <span className="font-mono text-stone-300 font-bold">{adjustments.length} logged events</span>
          </div>

          {adjustments.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center p-6 text-stone-500">
              <History className="w-8 h-8 mb-2 stroke-1 text-stone-600" />
              <p className="font-semibold text-stone-300 text-sm">No adjustments logged yet</p>
              <p className="text-xs text-stone-500 mt-1">Manual stock updates will be tracked here.</p>
            </div>
          ) : (
            <div className="border border-stone-800 rounded-2xl overflow-hidden bg-stone-900/60 shadow-md">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="bg-stone-950/80 text-stone-400 text-[11px] uppercase tracking-wider font-semibold border-b border-stone-800">
                  <tr>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-3">Product</th>
                    <th className="py-3 px-3">Reason</th>
                    <th className="py-3 px-3">Adjustment</th>
                    <th className="py-3 px-4">Notes / Invoice Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/70 font-mono">
                  {adjustments.map(adj => {
                    const isPositive = adj.delta > 0;
                    const adjDate = new Date(adj.created_at);
                    const formatted = `${adjDate.toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                    })} ${adjDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

                    return (
                      <tr key={adj.id} className="hover:bg-stone-800/30 transition">
                        <td className="py-3 px-4 text-stone-400 text-[11px]">{formatted}</td>
                        <td className="py-3 px-3 font-sans font-semibold text-stone-100">
                          {adj.product_name}
                        </td>
                        <td className="py-3 px-3 font-sans">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              adj.reason === 'Restock'
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                                : adj.reason === 'Breakage' || adj.reason === 'Spillage'
                                ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                                : 'bg-stone-800 text-stone-300 border border-stone-700'
                            }`}
                          >
                            {adj.reason}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold">
                          <span
                            className={`inline-flex items-center gap-1 font-mono text-xs ${
                              isPositive ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isPositive ? (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowDownRight className="w-3.5 h-3.5" />
                            )}
                            {isPositive ? `+${adj.delta}` : adj.delta}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-stone-400 font-sans text-xs">
                          {adj.notes || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: ADD / EDIT PRODUCT */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl text-stone-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="font-extrabold text-base">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-1">
                  Product Name & Bottle Size
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gilbeys Gin 750ml, Tusker Lager 500ml"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                  >
                    {settings.categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">
                    Selling Price (KSh)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 1450"
                    value={formPrice}
                    onChange={e => setFormPrice(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm font-mono text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">
                    Quantity on Hand
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="e.g. 12"
                    value={formQty}
                    onChange={e => setFormQty(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm font-mono text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder={`Default: ${settings.low_stock_threshold}`}
                    value={formLowStockThreshold}
                    onChange={e => setFormLowStockThreshold(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm font-mono text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {formError && (
                <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="mt-5 flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-white hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: MANUAL STOCK ADJUSTMENT */}
      {isAdjustModalOpen && adjustTargetProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl text-stone-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="font-extrabold text-base">Adjust Stock Level</h3>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="mt-4 space-y-4">
              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800">
                <span className="text-[11px] text-stone-400 block">Product</span>
                <span className="font-bold text-stone-100 text-sm">{adjustTargetProduct.name}</span>
                <div className="mt-1 flex items-center gap-2 text-xs font-mono text-stone-400">
                  <span>Current on-hand:</span>
                  <span className="font-bold text-amber-400 text-sm">{adjustTargetProduct.qty} units</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-1">
                  Adjustment Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustType('add');
                      setAdjustReason('Restock');
                    }}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition ${
                      adjustType === 'add'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                        : 'bg-stone-950 text-stone-400 border-stone-800 hover:bg-stone-800'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Stock (+)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAdjustType('remove');
                      setAdjustReason('Breakage');
                    }}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition ${
                      adjustType === 'remove'
                        ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                        : 'bg-stone-950 text-stone-400 border-stone-800 hover:bg-stone-800'
                    }`}
                  >
                    <Minus className="w-4 h-4" />
                    <span>Deduct Stock (-)</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">
                    Units Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 6"
                    value={adjustDelta}
                    onChange={e => setAdjustDelta(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-sm font-mono text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">
                    Required Reason
                  </label>
                  <select
                    value={adjustReason}
                    onChange={e => setAdjustReason(e.target.value as AdjustmentReason)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Restock">Restock</option>
                    <option value="Breakage">Breakage</option>
                    <option value="Spillage">Spillage</option>
                    <option value="Correction">Correction</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-1">
                  Notes / Memo (Distributor Delivery, Bottle Drop, etc.)
                </label>
                <input
                  type="text"
                  placeholder="Optional note e.g. Supplier Invoice #8821"
                  value={adjustNotes}
                  onChange={e => setAdjustNotes(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              {adjustError && (
                <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{adjustError}</span>
                </div>
              )}

              <div className="mt-5 flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-white hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition"
                >
                  Record Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE CONFIRMATION */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl text-stone-100 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 rounded-xl bg-rose-950/60 border border-rose-800">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-stone-100">Delete Product?</h3>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Are you sure you want to delete <strong>{deleteConfirmProduct.name}</strong>? This item will be removed from your catalog.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
              <button
                onClick={() => setDeleteConfirmProduct(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteProduct(deleteConfirmProduct.id);
                  setDeleteConfirmProduct(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
