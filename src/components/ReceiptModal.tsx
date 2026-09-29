import React, { useState } from 'react';
import { Sale, Settings } from '../types';
import { 
  Printer, 
  Share2, 
  Copy, 
  Check, 
  X, 
  MessageSquare, 
  AlertOctagon,
  ArrowRight
} from 'lucide-react';

interface ReceiptModalProps {
  sale: Sale;
  settings: Settings;
  onClose: () => void;
  onNewSale?: () => void;
  onVoidSale?: (saleId: string) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  sale,
  settings,
  onClose,
  onNewSale,
  onVoidSale,
}) => {
  const [copied, setCopied] = useState(false);
  const isVoided = sale.status === 'voided';

  // Format currency
  const formatKSh = (amount: number) => {
    return `KSh ${Math.abs(amount).toLocaleString('en-KE')}`;
  };

  // Format date & time
  const saleDate = new Date(sale.ts);
  const formattedDate = saleDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = saleDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Plain text receipt format for WhatsApp / SMS / Clipboard
  const generatePlainTextReceipt = () => {
    const divider = '--------------------------------';
    const lines = [
      `*${settings.shop_name.toUpperCase()}*`,
      settings.shop_location,
      settings.shop_phone ? `Tel: ${settings.shop_phone}` : '',
      settings.till_number || '',
      divider,
      isVoided ? '*** VOIDED / REFUND RECEIPT ***' : 'SALE RECEIPT',
      `Receipt No: #RCP-${String(sale.receipt_no).padStart(4, '0')}`,
      `Date/Time: ${formattedDate} ${formattedTime}`,
      divider,
      ...sale.items.map(
        item =>
          `${item.name}\n  ${item.qty} x ${formatKSh(item.price)} = ${formatKSh(item.line_total)}`
      ),
      divider,
      `*TOTAL: ${formatKSh(sale.total)}*`,
      `Payment: ${sale.payment_method}`,
      sale.reference ? `M-Pesa Ref: ${sale.reference}` : '',
      sale.cash_received ? `Cash Tendered: ${formatKSh(sale.cash_received)}` : '',
      sale.change !== undefined && sale.change !== null
        ? `Change: ${formatKSh(sale.change)}`
        : '',
      isVoided && sale.void_reason ? `Void Reason: ${sale.void_reason}` : '',
      divider,
      'Internal receipt — not a KRA eTIMS tax invoice',
      'Thank you for your patronage!',
    ].filter(Boolean);

    return lines.join('\n');
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(generatePlainTextReceipt());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(generatePlainTextReceipt());
    const url = `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  const handleSMSShare = () => {
    const text = encodeURIComponent(generatePlainTextReceipt());
    window.location.href = `sms:?body=${text}`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto no-print">
      <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Actions Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 bg-stone-900/90 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-stone-200">
              Receipt #RCP-{String(sale.receipt_no).padStart(4, '0')}
            </span>
            {isVoided && (
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-950 text-rose-400 border border-rose-800">
                VOIDED
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[68vh]">
          {/* Printable Receipt Paper Container */}
          <div
            id="printable-receipt"
            className={`p-6 rounded-2xl shadow-inner font-mono text-xs transition relative ${
              isVoided
                ? 'bg-rose-50/90 text-stone-900 border-2 border-dashed border-rose-400'
                : 'bg-amber-50 text-stone-900 border border-amber-200/80'
            }`}
          >
            {/* Voided Watermark & Badge */}
            {isVoided && (
              <div className="mb-4 p-2.5 rounded-xl bg-rose-600 text-white text-center font-bold tracking-wider text-sm flex items-center justify-center gap-2 shadow-sm">
                <AlertOctagon className="w-4 h-4" />
                <span>*** VOIDED / REFUND RECEIPT ***</span>
              </div>
            )}

            {/* Shop Header */}
            <div className="text-center pb-3 border-b border-stone-300 space-y-1">
              <h3 className="font-extrabold text-base tracking-tight text-stone-950">
                {settings.shop_name}
              </h3>
              <p className="text-[11px] text-stone-600 leading-tight">
                {settings.shop_location}
              </p>
              {settings.shop_phone && (
                <p className="text-[11px] text-stone-600">Tel: {settings.shop_phone}</p>
              )}
              {settings.till_number && (
                <p className="text-[11px] font-semibold text-stone-800 bg-stone-200/60 inline-block px-2 py-0.5 rounded">
                  {settings.till_number}
                </p>
              )}
            </div>

            {/* Receipt Metadata */}
            <div className="py-2.5 border-b border-stone-300 text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-stone-500">Receipt No:</span>
                <span className="font-bold text-stone-900">#RCP-{String(sale.receipt_no).padStart(4, '0')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Date & Time:</span>
                <span className="text-stone-800">{formattedDate} {formattedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Payment:</span>
                <span className="font-semibold text-stone-900">{sale.payment_method}</span>
              </div>
              {sale.reference && (
                <div className="flex justify-between">
                  <span className="text-stone-500">M-Pesa Ref:</span>
                  <span className="font-bold text-emerald-800">{sale.reference}</span>
                </div>
              )}
              {isVoided && sale.void_reason && (
                <div className="flex justify-between text-rose-700 font-medium pt-1">
                  <span>Void Reason:</span>
                  <span>{sale.void_reason}</span>
                </div>
              )}
            </div>

            {/* Line Items Table */}
            <div className="py-3 border-b border-stone-300 space-y-2">
              <div className="flex justify-between text-[10px] uppercase font-bold text-stone-400 pb-1">
                <span>Item</span>
                <span>Total</span>
              </div>

              {sale.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between font-semibold text-stone-900">
                    <span className="truncate pr-2">{item.name}</span>
                    <span className="shrink-0">{formatKSh(item.line_total)}</span>
                  </div>
                  <div className="text-[10px] text-stone-500">
                    {item.qty} x {formatKSh(item.price)}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals Section */}
            <div className="py-3 border-b border-stone-300 space-y-1.5">
              <div className="flex justify-between text-sm font-extrabold text-stone-950 pt-1">
                <span>TOTAL:</span>
                <span className={isVoided ? 'text-rose-700' : 'text-stone-950'}>
                  {formatKSh(sale.total)}
                </span>
              </div>

              {sale.payment_method === 'Cash' && sale.cash_received !== undefined && (
                <>
                  <div className="flex justify-between text-[11px] text-stone-600">
                    <span>Cash Tendered:</span>
                    <span>{formatKSh(sale.cash_received)}</span>
                  </div>
                  {sale.change !== undefined && (
                    <div className="flex justify-between text-[11px] font-bold text-emerald-800">
                      <span>Change Given:</span>
                      <span>{formatKSh(sale.change)}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Compliance Footer per Section 7 */}
            <div className="pt-3 text-center space-y-1 text-[10px] text-stone-500">
              <p className="font-semibold text-stone-600">
                Internal receipt — not a KRA eTIMS tax invoice
              </p>
              <p>Thank you for shopping at {settings.shop_name}!</p>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 bg-stone-950 border-t border-stone-800 space-y-3 shrink-0">
          {/* Quick Share / Print Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Print / Save to PDF */}
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition active:scale-95"
              title="Print receipt or save to PDF"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Print / PDF</span>
            </button>

            {/* WhatsApp Share */}
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/60 text-emerald-300 text-xs font-semibold transition active:scale-95"
              title="Share receipt via WhatsApp"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp</span>
            </button>

            {/* SMS Share */}
            <button
              onClick={handleSMSShare}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition active:scale-95"
              title="Share receipt via SMS"
            >
              <MessageSquare className="w-4 h-4 text-sky-400" />
              <span>SMS</span>
            </button>

            {/* Copy Plaintext */}
            <button
              onClick={handleCopyText}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition active:scale-95"
              title="Copy receipt text to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-stone-400" />
                  <span>Copy Text</span>
                </>
              )}
            </button>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-3 pt-1">
            {!isVoided && onVoidSale && (
              <button
                onClick={() => onVoidSale(sale.id)}
                className="px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 border border-rose-900/40 transition"
              >
                Void / Refund Sale
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition"
              >
                Close
              </button>

              {onNewSale && (
                <button
                  onClick={onNewSale}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition active:scale-95"
                >
                  <span>Ring Up Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
