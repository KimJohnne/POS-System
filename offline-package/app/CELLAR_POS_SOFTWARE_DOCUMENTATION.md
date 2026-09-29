# CELLAR POS — COMPREHENSIVE SOFTWARE ARCHITECTURE, TECHNICAL SPECIFICATION & OPERATIONS MANUAL
**Document Version:** 1.0.0  
**Classification:** Enterprise Software Documentation / Commercial Retail System  
**Author:** Principal Solutions Architect & Engineering Team  
**System Name:** Cellar POS (Wines & Spirits Retail Point of Sale)  
**Date of Release:** September 2026  
**Target Environment:** Windows 10/11 Desktop, Android (Mobile/Tablet), Apple iOS (iPhone/iPad)

---

## 1. EXECUTIVE SUMMARY & SYSTEM OVERVIEW

### 1.1 Business Context & Problem Statement
The retail wines and spirits trade operates within a fast-moving, high-transaction volume environment characterized by:
1. **Severe Peak Congestion:** Extreme checkout rushes on Friday/Saturday evenings and holidays where transactions must process within seconds.
2. **Network Vulnerability:** Frequent commercial internet downtimes, fiber cuts, and fluctuating cellular data latency that paralyze cloud-only till systems.
3. **Inventory Vulnerability & Shrinkage:** High-value stock subject to pilferage, unrecorded breakages, spillages, and bottle miscounts across multiple bottle sizes (e.g., 250ml, 350ml, 750ml, 1 Litre).
4. **Dual-Tender Reconciliation Complexity:** High split between physical cash drawer takings and mobile money (Safaricom M-Pesa Till payments), requiring reconciliation at shift-end to detect cash shortfalls.

### 1.2 Core System Objectives
Cellar POS was architected from the ground up to solve these retail challenges:
- **100% Offline Autonomy:** Fully operational point of sale requiring zero internet connectivity for product catalog lookups, checkout processing, local SQLite-compatible persistence, receipt printing, and daily till reconciliations.
- **Sub-Second Ringing Speed:** Touch-optimized keyboard and tactile UI allowing a complete checkout transaction in under 5 seconds.
- **Multi-Channel Receipting:** Instant receipt generation supporting physical thermal roll printing (58mm and 80mm ESC/POS layout), direct WhatsApp customer delivery, SMS formatting, and clipboard sharing.
- **Audit-Controlled Stock Management:** Automated stock decrements on sale completion, automated stock restoration on transaction voiding, and audited manual adjustments requiring specific categorization (*Restock*, *Breakage*, *Spillage*, *Correction*, *Other*).
- **Statutory Transparency (KRA eTIMS Scope):** Strict operational focus as an internal retail till system with prominent disclaimer watermarking on all receipts per Version 1.0 scope boundaries.

---

## 2. SYSTEM ARCHITECTURE & PLATFORM TOPOLOGY

### 2.1 Software Stack Specification
Cellar POS leverages an enterprise client-side Single Page Application (SPA) architecture combined with local runtime wrappers:

| Layer | Technology | Specification / Role |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + TypeScript | Strict static typing, declarative component tree, unidirectional data flow |
| **Build System** | Vite 8 + Rollup | High-speed bundling, code-splitting, tree-shaking, production minification |
| **Styling & Thermal Layout** | Tailwind CSS 4 + `@media print` | Custom typography, high-contrast dark theme, zero-margin thermal printer CSS |
| **Data Visualization** | Recharts 2.x | Hardware-accelerated SVG daily/weekly revenue breakdown by payment method |
| **Storage Engine** | Local Storage / IndexedDB Wrapper | ACID-like transactional persistence, schema versioning, JSON backup engine |
| **Offline Cache** | Service Worker + Workbox PWA | Full asset precaching, cache-first network strategy, offline manifest |
| **Desktop Wrapper** | Windows Batch + PowerShell WebServer | Native Windows 10/11 standalone loopback server (`http://localhost:5000`) |
| **Android Wrapper** | Android Studio + WebView + WebAPK | Native Java/Android wrapper, Fullscreen hardware-accelerated WebClient |
| **Apple iOS Wrapper** | Apple .mobileconfig + Xcode Swift | Standalone WebClip configuration profile and native Swift WKWebView project |

### 2.2 Offline-First Data Flow Topology
```
[User Touch / Barcode Input]
             │
             ▼
[Active POS Cart Engine] <──────────> [Local Inventory Engine]
             │                                   │
             ▼                                   ▼
[Payment Engine: Cash / M-Pesa]         [Stock Decrement & Low-Stock Alerts]
             │                                   │
             ▼                                   │
[Transactional Storage Engine (Local DB)] <──────┘
             │
   ┌─────────┴──────────────────────────────────────┐
   ▼                                                ▼
[Digital Receipt Engine]                 [Daily Reconciliation & Recharts]
 - ESC/POS Thermal Print                  - Cash in Till Drawer Count
 - WhatsApp Direct Delivery               - M-Pesa Till Statement Count
 - SMS Text Delivery                      - Weekly Cash vs M-Pesa Trends
```

---

## 3. DATA ARCHITECTURE & SCHEMA SPECIFICATION

The data layer is modeled using strict TypeScript interfaces and persisted in a structured local relational store.

### 3.1 Data Models (Entity-Relationship)

#### Product Entity (`Product`)
Defines individual stock keeping units (SKUs) where bottle volumes are distinct records:
```typescript
interface Product {
  id: string;                   // Unique UUID (e.g., 'prod-sp-01')
  name: string;                 // Product descriptor including volume (e.g., 'Gilbeys Gin 750ml')
  category: string;             // Category: Spirits, Wine, Beer, Cider/RTD, Mixers, Other
  price: number;                // Retail price in Kenyan Shillings (KSh)
  qty: number;                  // Current physical stock balance on hand
  low_stock_threshold?: number; // SKU-level threshold for reorder alerts (default: 5)
  barcode?: string;             // Optional EAN-13 / UPC barcode string
  created_at: string;           // ISO 8601 creation timestamp
  updated_at: string;           // ISO 8601 modification timestamp
}
```

#### Sale Transaction Entity (`Sale`)
Represents finalized or voided commercial transactions:
```typescript
interface Sale {
  id: string;                     // Unique sale identifier (e.g., 'sale-1001')
  receipt_no: number;             // Human-readable sequential receipt number (e.g., 1001)
  ts: string;                     // Transaction ISO 8601 timestamp
  items: SaleItem[];              // Array of purchased line items
  subtotal: number;               // Sum of item totals (KSh)
  discount?: number;              // Optional discount applied (KSh)
  total: number;                  // Final payable amount (KSh)
  payment_method: 'Cash' | 'M-Pesa'; // Method of settlement
  cash_received?: number;         // Amount tendered by customer in Cash mode
  change?: number;                // Change returned to customer in Cash mode
  reference?: string;             // Safaricom M-Pesa transaction code (e.g., 'QKD8291KL0')
  status: 'completed' | 'voided'; // Transaction status
  voided_at?: string;             // ISO 8601 timestamp of void action
  void_reason?: string;           // Mandatory reason for transaction void
}
```

#### Line Item Entity (`SaleItem`)
```typescript
interface SaleItem {
  id: string;                     // Line item identifier
  sale_id: string;                // Parent sale identifier
  product_id: string;             // Referenced Product ID
  name: string;                   // Snapshot of product name at sale time
  category: string;               // Snapshot of category at sale time
  price: number;                  // Snapshot of unit price at sale time
  qty: number;                    // Quantity purchased
  line_total: number;             // Calculated as (price * qty)
}
```

#### Stock Adjustment Entity (`StockAdjustment`)
```typescript
interface StockAdjustment {
  id: string;                     // Unique adjustment audit ID (e.g., 'adj-01')
  product_id: string;             // Target product identifier
  product_name: string;           // Snapshot of product name
  delta: number;                  // Signed integer (+12 for restock, -1 for breakage)
  reason: 'Restock' | 'Breakage' | 'Spillage' | 'Correction' | 'Other';
  notes?: string;                 // Delivery invoice number or spillage incident notes
  created_at: string;             // ISO 8601 timestamp of adjustment
}
```

#### System Settings Entity (`Settings`)
```typescript
interface Settings {
  shop_name: string;              // Registered business name
  shop_location: string;          // Physical street address / town
  phone_number: string;           // Official shop telephone / mobile
  till_number: string;            // Safaricom M-Pesa Buy Goods Till Number
  receipt_footer: string;         // Custom greeting or return policy notice
  next_receipt_no: number;        // Sequential counter seed for next transaction
  low_stock_threshold: number;    // Global default low stock alert trigger
  categories: string[];           // Active list of product categories
}
```

---

## 4. FUNCTIONAL SUBSYSTEMS & USER WORKFLOWS

### 4.1 Till & Fast Checkout Subsystem
1. **Catalog Presentation:** Products are displayed in responsive cards showing current selling price and live stock availability badges.
2. **Instant Search & Category Filtering:** Cashiers can filter by category pills or use full-text search across product titles and bottle sizes.
3. **Cart Interaction:** Line quantities are incremented or decremented via tactile buttons. The cart dynamically enforces stock bounds, preventing sales in excess of physical inventory.
4. **Settlement Flow:**
   - **Cash Payment:** Cashiers enter tendered cash or click one-tap quick denomination buttons (+100, +200, +500, +1,000, +2,000, Exact Total). The system computes customer change in real time.
   - **M-Pesa Payment:** Cashiers enter the customer's Safaricom confirmation code (e.g., `QKD8291KL0`) to be printed on receipts for audit cross-referencing.
5. **Immediate Receipt Dispatch:** Upon settlement, inventory decrements atomically and the digital receipt modal automatically opens.

### 4.2 Digital Receipts & Thermal Printing Subsystem
- **Receipt Layout:** Formatted specifically for standard 58mm and 80mm thermal roll printers using clean mono typography.
- **Header Elements:** Shop Name, Location, Phone Number, M-Pesa Till Number, Sequential Receipt #, Date & Time.
- **Body Elements:** Itemized line item table (Quantity, Item Name, Unit Price, Line Total).
- **Settlement Summary:** Subtotal, Total, Payment Method, Tendered Amount, Change Due, M-Pesa Reference Code.
- **Regulatory Watermark:** Every receipt prints with the explicit disclosure:  
  `*** Internal receipt — not a KRA eTIMS tax invoice ***`
- **Multi-Channel Dispatch:**
  - **Print / PDF:** Uses standard browser print dialog styled via `@media print` rules.
  - **WhatsApp Sharing:** Encodes the entire receipt into an official WhatsApp Web URI (`https://wa.me/?text=...`) for instant paperless delivery to customer phones.
  - **SMS Sharing:** Generates an SMS URI (`sms:?body=...`) for standard cellular messaging.
  - **Copy Plaintext:** One-tap clipboard copy formatted in clean ASCII.

### 4.3 Reversible Void & Refund Subsystem
- **Non-Destructive Auditing:** Transactions are never permanently deleted from the database.
- **Audit Requirement:** Voiding requires selecting or specifying an audited business reason (*Customer returned item*, *Cashier entry error*, *Payment failure*, or custom explanation).
- **Automatic Restock:** When a transaction is voided, every line item's quantity is automatically returned to the inventory balance on hand.
- **Voided Receipt Stamping:** Voided receipts are prominently branded in red:  
  `*** VOIDED / REFUND RECEIPT ***` with the void timestamp and logged reason.

### 4.4 Stock Adjustments & Shrinkage Control
- **Per-Bottle Sizing Architecture:** Every volume variation of a liquor brand (e.g., 250ml, 350ml, 750ml) is tracked as an autonomous stock record with independent wholesale replenishment costs and retail price points.
- **Categorized Adjustment Flow:** Manual adjustments require selecting a mandatory classification:
  - **Restock (+):** Incoming deliveries from distributors (with invoice note).
  - **Breakage (-):** Accidental bottle drops during handling or shelving.
  - **Spillage (-):** Leaking bottles or bar dispense losses.
  - **Correction (±):** Physical inventory stock-take reconciliations.
  - **Other (±):** Promotional sampling or internal use.
- **Audit Log:** Dedicated adjustments log maintaining full history separate from sales records.

### 4.5 Daily Till Reconciliation & Weekly Analytics
- **Cash in Till Drawer:** Sum of all completed cash sales and transaction count, matching the cashier's physical cash count.
- **M-Pesa Till Statement:** Sum of all completed M-Pesa sales and transaction count, matching the Safaricom merchant statement.
- **Net Daily Revenue:** Total completed sales less voided/refunded items.
- **Visual Weekly Revenue Chart (Recharts):**
  - Interactive daily sales bars for the current week (Monday through Sunday) or trailing 7 days.
  - Color-coded split: Cash Sales (Warm Amber `#f59e0b`) vs M-Pesa Sales (Emerald Green `#10b981`).
  - Toggle between **Stacked Bars** (total height = total day volume) and **Grouped Bars** (side-by-side comparison).
  - Tap any day's bar to immediately filter the sales log and daily reconciliation cards below to that specific date.

---

## 5. INSTALLATION & DEPLOYMENT GUIDE

### 5.1 Windows Desktop Installation (In-Store PC)
1. Download **`cellar-pos-desktop-offline-installer.zip`** (320 KB) from the Settings screen or app header.
2. Copy the zip file onto a USB flash drive or directly to the store PC.
3. Extract the zip folder (e.g., to `C:\CellarPOS`).
4. Double-click **`install-desktop-shortcut.bat`** to create the Desktop icon.
5. Double-click **`start-cellar-pos.bat`** to launch the POS till in dedicated borderless window mode. No internet or external software is needed!

### 5.2 Android Mobile & Tablet Installation
- **Direct 1-Tap WebAPK (Recommended):** Open the till URL in Chrome on any Android phone or tablet. Tap **"Install App"** from the banner or menu. The app installs directly into the Android App Drawer and runs full-screen offline.
- **Native Android Studio Project:** Download **`cellar-pos-android-project.zip`** (226 KB). Contains complete Android Studio Gradle project with local assets pre-bundled in `assets/www/` for compilation to `.apk`.

### 5.3 Apple iOS (iPhone & iPad) Installation
- **Apple Configuration Profile (`.mobileconfig`):** Download **`cellar-pos.mobileconfig`** on your iPhone/iPad in Safari. Go to iOS **Settings** $ightarrow$ **Profile Downloaded** $ightarrow$ tap **Install**. Adds a permanent home-screen app running in full-screen standalone mode.
- **Safari Add to Home Screen:** In Safari, tap Share $ightarrow$ **Add to Home Screen** $ightarrow$ tap **Add**.
- **Native Xcode Project:** Download **`cellar-pos-ios-project.zip`** (224 KB). Complete Swift + WKWebView project ready to open in Xcode and deploy to TestFlight or devices.

---

## 6. REGULATORY COMPLIANCE, SECURITY & BACKUP

### 6.1 KRA eTIMS Version 1.0 Scope Boundary
- In strict adherence to Version 1.0 specifications, Cellar POS operates as an internal retail management system. Receipts generated are internal commercial receipts for customer proof of purchase and daily till reconciliation.
- Invoices are not transmitted to the Kenya Revenue Authority (KRA) eTIMS portal in Version 1.0. All printed and digital receipts carry the statutory disclaimer.

### 6.2 Data Backup & Disaster Recovery Procedure
- **Daily USB Snapshot:** Store managers should navigate to **Settings** $ightarrow$ **"Download Backup (.json)"** at the close of every business day. Save the dated backup file onto a designated USB flash drive.
- **Restoration to New Hardware:** In the event of computer hardware failure, install Cellar POS on any replacement machine, navigate to **Settings** $ightarrow$ **"Select File to Restore"**, and upload the latest JSON backup file. The entire catalog, stock levels, historical sales, and receipt sequences are restored instantly.

---

## 7. HARDWARE INTEGRATION REFERENCE

| Peripheral | Recommended Interface | Configuration Notes |
| :--- | :--- | :--- |
| **Receipt Printer** | USB / Bluetooth 58mm or 80mm ESC/POS | Set default printer margins to 'None' in OS print settings. |
| **Barcode Scanner** | USB / Bluetooth HID Keyboard Wedge | Operates in keyboard emulation mode; automatically populates SKU search bar. |
| **Cash Drawer** | RJ11 / RJ12 connected to Receipt Printer | Configured via printer driver to trigger pulse on receipt print. |
| **Touchscreen Monitor** | USB Touch Interface (Windows 10/11 HID) | Native touch support enabled across all cart and denomination buttons. |

---
*End of Technical Specification & Operations Manual — Cellar POS Version 1.0*
