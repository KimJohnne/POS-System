import React, { useState, useMemo } from 'react';
import { Sale, Settings } from '../types';
import { WeeklyRevenueChart } from './WeeklyRevenueChart';
import { 
  ReceiptText, 
  Calendar, 
  Search, 
  Banknote, 
  Smartphone, 
  ArrowRight, 
  AlertOctagon, 
  CheckCircle2, 
  XCircle,
  Filter,
  RefreshCw,
  Eye,
  AlertCircle,
  BarChart3,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface SalesScreenProps {
  sales: Sale[];
  settings: Settings;
  onOpenReceipt: (sale: Sale) => void;
  onVoidSale: (saleId: string, reason: string) => void;
}

export const SalesScreen: React.FC<SalesScreenProps> = ({
  sales,
  settings,
  onOpenReceipt,
  onVoidSale,
}) => {
  // Selected date in YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'All' | 'Cash' | 'M-Pesa'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'completed' | 'voided'>('All');
  const [showWeeklyChart, setShowWeeklyChart] = useState(true);

  // Void modal state
  const [voidTargetSale, setVoidTargetSale] = useState<Sale | null>(null);
  const [voidReason, setVoidReason] = useState('Customer returned item');
  const [customVoidReason, setCustomVoidReason] = useState('');
  const [voidError, setVoidError] = useState<string | null>(null);

  // Set quick date
  const handleSetToday = () => setSelectedDate(todayStr);
  const handleSetYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Filter sales for the selected date
  const dateSales = useMemo(() => {
    return sales.filter(s => {
      const saleDate = s.ts.split('T')[0];
      return saleDate === selectedDate;
    });
  }, [sales, selectedDate]);

  // Daily Reconciliation Metrics
  const dailyMetrics = useMemo(() => {
    // Only count completed sales toward net till totals; voided reversals cancel out
    let totalRevenue = 0;
    let cashTotal = 0;
    let cashCount = 0;
    let mpesaTotal = 0;
    let mpesaCount = 0;
    let completedCount = 0;
    let voidedCount = 0;
    let refundedAmount = 0;

    dateSales.forEach(sale => {
      // Exclude reversing entries from transaction count if they are linked
      if (sale.status === 'completed') {
        completedCount++;
        totalRevenue += sale.total;
        if (sale.payment_method === 'Cash') {
          cashTotal += sale.total;
          cashCount++;
        } else if (sale.payment_method === 'M-Pesa') {
          mpesaTotal += sale.total;
          mpesaCount++;
        }
      } else if (sale.status === 'voided') {
        if (!sale.voided_sale_id) {
          // This was the original completed sale that got voided
          voidedCount++;
          refundedAmount += sale.total;
        }
      }
    });

    return {
      totalRevenue,
      cashTotal,
      cashCount,
      mpesaTotal,
      mpesaCount,
      completedCount,
      voidedCount,
      refundedAmount,
      totalOrders: completedCount + voidedCount,
    };
  }, [dateSales]);

  // Filtered sales log for table
  const filteredSales = useMemo(() => {
    return dateSales.filter(s => {
      const matchesSearch =
        s.receipt_no.toString().includes(searchQuery) ||
        (s.reference && s.reference.toLowerCase().includes(searchQuery.toLowerCase())) ||
        s.items.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPayment =
        paymentFilter === 'All' || s.payment_method === paymentFilter;

      const matchesStatus =
        statusFilter === 'All' || s.status === statusFilter;

      return matchesSearch && matchesPayment && matchesStatus;
    });
  }, [dateSales, searchQuery, paymentFilter, statusFilter]);

  const formatKSh = (amount: number) => {
    return `KSh ${amount.toLocaleString('en-KE')}`;
  };

  // Open void dialog
  const handleOpenVoidModal = (sale: Sale, e: React.MouseEvent) => {
    e.stopPropagation();
    setVoidTargetSale(sale);
    setVoidReason('Customer returned item');
    setCustomVoidReason('');
    setVoidError(null);
  };

  // Confirm void
  const handleConfirmVoid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voidTargetSale) return;

    const finalReason =
      voidReason === 'Other' ? customVoidReason.trim() : voidReason;

    if (!finalReason) {
      setVoidError('Please select or specify a reason for voiding.');
      return;
    }

    onVoidSale(voidTargetSale.id, finalReason);
    setVoidTargetSale(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-stone-950 text-stone-100">
      {/* Top Banner: Date Selection & Till Reconciliation Summary */}
      <div className="p-4 sm:p-5 border-b border-stone-800 bg-stone-900/50 backdrop-blur-md shrink-0 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <ReceiptText className="w-5 h-5 text-amber-400" />
              <span>Sales Log & Daily Reconciliation</span>
            </h1>
            <p className="text-xs text-stone-400 mt-0.5">
              Reconcile physical cash drawer and M-Pesa receipts against day's trading history.
            </p>
          </div>

          {/* Date Picker Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowWeeklyChart(!showWeeklyChart)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                showWeeklyChart
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
              title="Toggle weekly revenue chart"
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
              <span>{showWeeklyChart ? 'Hide Weekly Chart' : 'Show Weekly Chart'}</span>
              {showWeeklyChart ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              onClick={handleSetToday}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedDate === todayStr
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              Today
            </button>
            <button
              onClick={handleSetYesterday}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-800 text-stone-300 hover:bg-stone-700 transition"
            >
              Yesterday
            </button>

            <div className="relative flex items-center">
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5 text-xs font-mono text-stone-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Daily Till Reconciliation Cards (§4.4) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          {/* Total Net Revenue */}
          <div className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 shadow-xs space-y-1">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">
              Total Net Sales
            </span>
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-amber-400">
              {formatKSh(dailyMetrics.totalRevenue)}
            </div>
            <span className="text-[10px] text-stone-500 font-mono block">
              {dailyMetrics.completedCount} completed {dailyMetrics.completedCount === 1 ? 'sale' : 'sales'}
            </span>
          </div>

          {/* Cash Sales (Till Drawer) */}
          <div className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-400 flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5 text-amber-400" />
                <span>Cash in Till</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-800 text-stone-300">
                {dailyMetrics.cashCount} txns
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-stone-100">
              {formatKSh(dailyMetrics.cashTotal)}
            </div>
            <span className="text-[10px] text-stone-500 block">Matches cash drawer count</span>
          </div>

          {/* M-Pesa Sales */}
          <div className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-400 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>M-Pesa Till</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-900/60">
                {dailyMetrics.mpesaCount} txns
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-400">
              {formatKSh(dailyMetrics.mpesaTotal)}
            </div>
            <span className="text-[10px] text-stone-500 block">Matches M-Pesa statement</span>
          </div>

          {/* Voids & Refunds */}
          <div className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-400 flex items-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                <span>Voided / Refunds</span>
              </span>
              {dailyMetrics.voidedCount > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-900">
                  {dailyMetrics.voidedCount} void
                </span>
              )}
            </div>
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-rose-400">
              {formatKSh(dailyMetrics.refundedAmount)}
            </div>
            <span className="text-[10px] text-stone-500 block">Restocked to inventory</span>
          </div>
        </div>
      </div>

      {/* Weekly Revenue Breakdown Chart */}
      {showWeeklyChart && (
        <div className="p-3 sm:p-5 pb-0 shrink-0">
          <WeeklyRevenueChart
            sales={sales}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </div>
      )}

      {/* Filter and Search Bar for Daily Sales */}
      <div className="p-3 sm:p-4 border-y border-stone-800 bg-stone-900/90 backdrop-blur-md flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between sticky top-0 z-20 shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by receipt #, M-Pesa code, or bottle name..."
            className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-8 py-2 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Payment filter */}
          <select
            value={paymentFilter}
            onChange={e => setPaymentFilter(e.target.value as 'All' | 'Cash' | 'M-Pesa')}
            className="bg-stone-950 border border-stone-800 rounded-xl px-2.5 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Payments</option>
            <option value="Cash">Cash Only</option>
            <option value="M-Pesa">M-Pesa Only</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as 'All' | 'completed' | 'voided')}
            className="bg-stone-950 border border-stone-800 rounded-xl px-2.5 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Statuses</option>
            <option value="completed">Completed Only</option>
            <option value="voided">Voided Only</option>
          </select>
        </div>
      </div>

      {/* Sales Receipts Table */}
      <div className="p-3 sm:p-5 flex-1">
        {filteredSales.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-stone-500">
            <ReceiptText className="w-10 h-10 mb-2 stroke-1 text-stone-600" />
            <p className="font-semibold text-stone-300 text-sm">No sales records found</p>
            <p className="text-xs text-stone-500 mt-1">
              No transactions match this date and filter criteria.
            </p>
          </div>
        ) : (
          <div className="border border-stone-800 rounded-2xl overflow-hidden bg-stone-900/60 shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="bg-stone-950/80 text-stone-400 text-[11px] uppercase tracking-wider font-semibold border-b border-stone-800">
                  <tr>
                    <th className="py-3 px-4">Receipt #</th>
                    <th className="py-3 px-3">Time</th>
                    <th className="py-3 px-3">Items Purchased</th>
                    <th className="py-3 px-3">Payment</th>
                    <th className="py-3 px-3">Total (KSh)</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/70 font-mono">
                  {filteredSales.map(sale => {
                    const isVoided = sale.status === 'voided';
                    const isReversingEntry = !!sale.voided_sale_id;
                    const saleTime = new Date(sale.ts).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <tr
                        key={sale.id}
                        onClick={() => onOpenReceipt(sale)}
                        className={`hover:bg-stone-800/50 cursor-pointer transition ${
                          isVoided ? 'bg-rose-950/15' : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-bold text-stone-100 flex items-center gap-1.5">
                          <span>#RCP-{String(sale.receipt_no).padStart(4, '0')}</span>
                          {isReversingEntry && (
                            <span className="text-[10px] text-rose-400 font-sans font-normal">(Reversal)</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-stone-400 text-[11px]">
                          {saleTime}
                        </td>

                        <td className="py-3 px-3 font-sans text-stone-200 max-w-xs truncate">
                          {sale.items
                            .map(i => `${Math.abs(i.qty)}x ${i.name}`)
                            .join(', ')}
                        </td>

                        <td className="py-3 px-3 font-sans">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium border inline-flex items-center gap-1 ${
                              sale.payment_method === 'Cash'
                                ? 'bg-amber-950/50 text-amber-300 border-amber-800/50'
                                : 'bg-emerald-950/50 text-emerald-300 border-emerald-800/50'
                            }`}
                          >
                            {sale.payment_method === 'Cash' ? (
                              <Banknote className="w-3 h-3 text-amber-400" />
                            ) : (
                              <Smartphone className="w-3 h-3 text-emerald-400" />
                            )}
                            <span>{sale.payment_method}</span>
                            {sale.reference && (
                              <span className="text-[10px] font-mono text-emerald-400">
                                ({sale.reference})
                              </span>
                            )}
                          </span>
                        </td>

                        <td className="py-3 px-3 font-bold text-sm">
                          <span className={isVoided ? 'text-rose-400' : 'text-amber-400'}>
                            {formatKSh(sale.total)}
                          </span>
                        </td>

                        <td className="py-3 px-3 font-sans">
                          {isVoided ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                              {isReversingEntry ? 'Reversing Entry' : 'Voided'}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-900/60">
                              Completed
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right font-sans">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                onOpenReceipt(sale);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 transition flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5 text-stone-400" />
                              <span>Receipt</span>
                            </button>

                            {!isVoided && !isReversingEntry && (
                              <button
                                onClick={e => handleOpenVoidModal(sale, e)}
                                className="px-2 py-1 rounded-lg text-rose-400 hover:bg-rose-950/60 hover:text-rose-300 border border-rose-900/40 text-xs transition"
                                title="Void sale and restock items"
                              >
                                Void
                              </button>
                            )}
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

      {/* VOID / REFUND CONFIRMATION MODAL */}
      {voidTargetSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl text-stone-100 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center gap-3 text-rose-400 pb-3 border-b border-stone-800">
              <div className="p-2 rounded-xl bg-rose-950/80 border border-rose-800">
                <AlertOctagon className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-stone-100">
                  Void Sale #RCP-{String(voidTargetSale.receipt_no).padStart(4, '0')}
                </h3>
                <p className="text-xs text-stone-400">Total: {formatKSh(voidTargetSale.total)}</p>
              </div>
            </div>

            <div className="text-xs text-stone-300 space-y-2">
              <p>
                Voiding this transaction will:
              </p>
              <ul className="list-disc list-inside space-y-1 text-stone-400 font-mono text-[11px]">
                <li>Automatically increment stock back to inventory</li>
                <li>Write a traceable linked reversing entry</li>
                <li>Preserve original sale record marked as VOIDED</li>
                <li>Update today's reconciliation totals</li>
              </ul>
            </div>

            <form onSubmit={handleConfirmVoid} className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-1">
                  Reason for Void / Refund
                </label>
                <select
                  value={voidReason}
                  onChange={e => setVoidReason(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-rose-500"
                >
                  <option value="Customer returned item">Customer returned item</option>
                  <option value="Customer changed mind before leaving">Customer changed mind before leaving</option>
                  <option value="Wrong item or bottle size rung up">Wrong item or bottle size rung up</option>
                  <option value="Accidental duplicate transaction">Accidental duplicate transaction</option>
                  <option value="Other">Other (specify below)</option>
                </select>
              </div>

              {voidReason === 'Other' && (
                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">
                    Specify Reason
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Broken seal upon opening"
                    value={customVoidReason}
                    onChange={e => setCustomVoidReason(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-rose-500"
                  />
                </div>
              )}

              {voidError && (
                <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{voidError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setVoidTargetSale(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition"
                >
                  Confirm & Restock Items
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
