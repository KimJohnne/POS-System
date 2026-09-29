export interface DocSection {
  id: string;
  title: string;
  summary: string;
  content: string;
  subsections?: {
    title: string;
    body: string;
  }[];
}

export const DOCUMENTATION_METADATA = {
  title: "Cellar POS — Comprehensive Software Architecture, Technical Specification & Operations Manual",
  version: "1.0.0 Production",
  date: "September 2026",
  classification: "Enterprise Commercial Retail System",
  targetOS: "Windows 10/11 Desktop, Android Phones/Tablets, Apple iOS (iPhone/iPad)",
  author: "Principal Solutions Architect & Engineering Team",
};

export const DOCUMENTATION_SECTIONS: DocSection[] = [
  {
    id: "overview",
    title: "1. Executive Summary & Problem Statement",
    summary: "Business context, retail operational challenges, and core engineering objectives.",
    content: `The retail wines and spirits sector in Kenya operates in a dynamic, high-volume trading environment. Retailers face four primary operational bottlenecks:

1. Severe Peak Congestion: Extreme checkout rushes on Friday/Saturday evenings and holidays where transactions must process in under 5 seconds to prevent walkouts.
2. Network Vulnerability: Frequent commercial internet outages, fiber cuts, and cellular data latency that paralyze cloud-only till systems.
3. Inventory Vulnerability & Shrinkage: High-value stock subject to pilferage, unrecorded breakages, dispenser spillage, and bottle miscounts across multiple bottle sizes (250ml, 350ml, 750ml, 1 Litre).
4. Dual-Tender Reconciliation Complexity: High split between physical cash drawer takings and mobile money (Safaricom M-Pesa Till payments), requiring reconciliation at shift-end to detect cash shortfalls.

Cellar POS was engineered from the ground up to solve these retail challenges through 100% offline autonomy, sub-second checkout ringing, dual-tender cash & M-Pesa balancing, and audit-controlled inventory management.`,
    subsections: [
      {
        title: "1.1 Core System Objectives",
        body: "• 100% Offline Autonomy: Complete transactional capability requiring zero internet connection.\n• High-Throughput Ringing: Rapid barcode scanning and touchscreen-friendly interface for sub-5 second sales.\n• Multi-Channel Receipts: 58mm/80mm ESC/POS thermal printing, WhatsApp paperless delivery, SMS formatting, and ASCII plaintext copy.\n• Shrinkage Control & Auditing: Automatic stock deductions on sale, automatic stock restoration on voided sales, and mandatory-reason shrinkage logs.\n• Daily Dual-Tender Reconciliation: Separate tracking and reconciliation for physical Cash Drawer versus M-Pesa Till Statement.",
      },
    ],
  },
  {
    id: "architecture",
    title: "2. Architecture & Platform Topology",
    summary: "Single-Page Application client stack, offline caching, and cross-platform native wrappers.",
    content: `Cellar POS employs an enterprise client-side Single Page Application (SPA) architecture combined with platform-native loopback wrappers for Windows Desktop, Android mobile devices, and Apple iOS.

Technology Specification:
• Frontend Core: React 18 + TypeScript (Strict static typing, reactive state tree, fast virtual DOM)
• Build System: Vite 8 + Rollup (Production tree-shaking, code-splitting, relative asset path resolution)
• Thermal Styling: Tailwind CSS 4 + @media print (Dark store UI theme and zero-margin receipt formatting for 58mm/80mm printers)
• Visual Analytics: Recharts (SVG Engine) (Interactive weekly revenue charts categorized by Cash vs M-Pesa)
• Storage Engine: Relational Local Store (ACID-like persistence, transactional atomicity, JSON export/restore)
• Offline Cache: Service Worker + Workbox PWA (Precached static bundles, offline manifest, instant standalone launch)
• Windows Desktop: Standalone loopback server & batch script launcher (No Node or Python required)
• Android Mobile: WebAPK browser install & native Android Studio Gradle project with local assets
• Apple iOS: Managed WebClip .mobileconfig profile & native Swift WKWebView Xcode project`,
  },
  {
    id: "schema",
    title: "3. Data Architecture & Relational Schema",
    summary: "Entity relationships, TypeScript data models, and transactional integrity.",
    content: `All application state is maintained in relational entities with strict validation:

1. Product Entity (Product):
• id: string (Unique SKU UUID)
• name: string (Product descriptor including volume, e.g., 'Gilbeys Gin 750ml')
• category: string (Spirits, Wine, Beer, Cider/RTD, Mixers, Other)
• price: number (Retail selling price in KSh)
• qty: number (Current physical stock balance on hand)
• low_stock_threshold: number (Reorder alert threshold, default: 5)
• barcode?: string (Optional EAN-13 / UPC barcode)

2. Sale Transaction Entity (Sale):
• id: string (Unique sale identifier)
• receipt_no: number (Sequential receipt number)
• ts: string (ISO 8601 transaction timestamp)
• items: SaleItem[] (Purchased line item array)
• total: number (Final payable total in KSh)
• payment_method: 'Cash' | 'M-Pesa'
• cash_received?: number (Amount tendered in Cash mode)
• change?: number (Change returned in Cash mode)
• reference?: string (Safaricom M-Pesa transaction code)
• status: 'completed' | 'voided'
• void_reason?: string (Mandatory reason for transaction void)

3. Line Item Entity (SaleItem):
• id: string
• sale_id: string
• product_id: string
• name: string (Snapshot of product name at sale time)
• price: number (Unit price snapshot)
• qty: number (Quantity purchased)
• line_total: number (price * qty)

4. Stock Adjustment Entity (StockAdjustment):
• id: string (Unique audit ID)
• product_id: string
• delta: number (Signed integer: +12 for restock, -1 for breakage)
• reason: 'Restock' | 'Breakage' | 'Spillage' | 'Correction' | 'Other'
• notes?: string (Invoice or incident memo)
• created_at: string (Timestamp)

5. Settings Entity (Settings):
• shop_name: string
• shop_location: string
• till_number: string (Safaricom M-Pesa Buy Goods Till Number)
• next_receipt_no: number
• low_stock_threshold: number`,
  },
  {
    id: "operations",
    title: "4. Till & Checkout Operations (SOP)",
    summary: "Cashier workflows, void/refund procedures, thermal printing, and daily reconciliations.",
    content: `Standard Operating Procedures (SOP) for Store Cashiers & Managers:

4.1 Checkout Workflow:
1. Search product via category filter or barcode scanner.
2. Select bottle size SKU and adjust quantity with touchscreen steppers. Stock bounds enforce inventory availability.
3. Select Payment Mode:
   - Cash: Click quick denomination buttons (+100, +200, +500, +1000, +2000, Exact). Real-time change is calculated.
   - M-Pesa: Enter customer's 10-character Safaricom transaction code (e.g., QKD8291KL0).
4. Complete Sale: Inventory decrements automatically; digital receipt opens immediately.

4.2 Reversible Void & Refund Policy:
- Transactions are never deleted. Voiding creates an audited reversing entry.
- Requires selecting a mandatory business reason (Return, Cashier error, Payment dispute).
- Line item quantities are automatically restocked into inventory balance.
- Receipt is branded in red with VOIDED stamp, timestamp, and reason.

4.3 Shift Close-out & Daily Reconciliation:
1. Count physical cash in till drawer. Compare against 'Cash in Till' figure.
2. Inspect Safaricom merchant till statement. Compare against 'M-Pesa Till' figure.
3. Review voided receipts with shift supervisor.`,
  },
  {
    id: "compliance",
    title: "5. Regulatory Compliance & KRA eTIMS Scope",
    summary: "Internal commercial till boundaries, statutory disclaimers, and audit trails.",
    content: `Statutory Scope & Compliance Notice (Version 1.0):

In strict accordance with Section 7 of the software specification, Cellar POS Version 1.0 operates as an internal retail management till system. Receipts generated are internal commercial receipts for customer proof of purchase and till balancing.

Statutory Notice Printed on All Receipts:
*** Internal receipt — not a KRA eTIMS tax invoice ***

Technical Scope Boundaries:
1. Internal Management: Operates autonomously without requiring external internet connectivity.
2. No Automatic KRA Transmission: Invoices are not transmitted to the Kenya Revenue Authority (KRA) eTIMS portal in Version 1.0.
3. Audit Compliance: All sales, receipts, and voids maintain immutable timestamps and sequential receipt numbers suitable for financial auditing.
4. Future Roadmap (v2.0): Planned integration with certified KRA OSCU / VSCU middleware APIs for registered VAT taxpayers.`,
  },
  {
    id: "installation",
    title: "6. Installation & Deployment Guide",
    summary: "Complete setup instructions for Windows PC, Android devices, and Apple iOS.",
    content: `Step-by-step installation instructions for all target environments:

1. Windows Desktop PC (In-Store Till):
• Direct Browser PWA (Recommended): Open in Chrome/Edge, click the 'Install App' icon in the address bar. Creates a native desktop shortcut that runs offline.
• Offline Installer Package: Download cellar-pos-desktop-offline-installer.zip. Extract to C:\\CellarPOS and double-click start-cellar-pos.bat or install-desktop-shortcut.bat. Launches borderless full-screen till.

2. Android Phones & Tablets:
• Direct Browser 1-Tap (Recommended): Open the till URL in Google Chrome. Tap 'Install App' from the top banner. Installs an official Android WebAPK in the App Drawer.
• Android Studio Project: Download cellar-pos-android-project.zip. Open in Android Studio, connect phone or emulator, and build APK. Pre-bundled with offline web assets.

3. Apple iOS (iPhone & iPad):
• Apple Configuration Profile (.mobileconfig): Download cellar-pos.mobileconfig in Safari on iPhone. Go to Settings -> Profile Downloaded -> Install. Adds permanent home-screen app running full-screen.
• Safari Add to Home Screen: In Safari, tap Share -> 'Add to Home Screen' -> Add.
• Native Xcode Project: Download cellar-pos-ios-project.zip. Open in Xcode on macOS to compile and deploy.`,
  },
];
