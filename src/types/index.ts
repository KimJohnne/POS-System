export type ProductCategory = 
  | 'Wine'
  | 'Spirits'
  | 'Beer'
  | 'Cider/RTD'
  | 'Mixers & Soft Drinks'
  | 'Other'
  | string;

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number; // Integer KSh
  qty: number; // Stock on hand
  low_stock_threshold?: number | null; // Optional override of global setting
  created_at: string;
  updated_at: string;
}

export type AdjustmentReason = 
  | 'Restock'
  | 'Breakage'
  | 'Spillage'
  | 'Correction'
  | 'Other';

export interface StockAdjustment {
  id: string;
  product_id: string;
  product_name: string;
  delta: number; // Positive (increment) or negative (decrement)
  reason: AdjustmentReason;
  notes?: string;
  created_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  name: string;
  category: string;
  price: number; // Snapshot at time of sale
  qty: number;
  line_total: number;
}

export type PaymentMethod = 'Cash' | 'M-Pesa';

export type SaleStatus = 'completed' | 'voided';

export interface Sale {
  id: string;
  receipt_no: number; // Sequential integer (e.g. 1001)
  ts: string; // ISO datetime
  subtotal: number;
  total: number;
  payment_method: PaymentMethod;
  reference?: string; // M-Pesa transaction reference code
  cash_received?: number; // Cash sales only
  change?: number; // Cash sales only
  status: SaleStatus;
  voided_sale_id?: string | null; // Link to original if reversing entry
  void_reason?: string;
  voided_at?: string;
  items: SaleItem[];
}

export interface Settings {
  shop_name: string;
  shop_phone: string;
  shop_location: string;
  till_number: string;
  low_stock_threshold: number; // Default global threshold (e.g. 5)
  categories: string[];
  next_receipt_no: number;
}

export interface CartItem {
  product: Product;
  qty: number;
}
