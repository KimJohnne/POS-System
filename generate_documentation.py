import os
import shutil
from datetime import datetime

# ReportLab imports
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

# python-docx imports
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

public_dir = "public"
dist_dir = "dist"
os.makedirs(public_dir, exist_ok=True)
os.makedirs(dist_dir, exist_ok=True)

md_path = os.path.join(public_dir, "CELLAR_POS_SOFTWARE_DOCUMENTATION.md")
docx_path = os.path.join(public_dir, "CELLAR_POS_SOFTWARE_DOCUMENTATION.docx")
pdf_path = os.path.join(public_dir, "CELLAR_POS_SOFTWARE_DOCUMENTATION.pdf")

# ==========================================
# 1. MARKDOWN DOCUMENTATION GENERATION
# ==========================================
markdown_text = """# CELLAR POS — COMPREHENSIVE SOFTWARE ARCHITECTURE, TECHNICAL SPECIFICATION & OPERATIONS MANUAL
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
- **Apple Configuration Profile (`.mobileconfig`):** Download **`cellar-pos.mobileconfig`** on your iPhone/iPad in Safari. Go to iOS **Settings** $\rightarrow$ **Profile Downloaded** $\rightarrow$ tap **Install**. Adds a permanent home-screen app running in full-screen standalone mode.
- **Safari Add to Home Screen:** In Safari, tap Share $\rightarrow$ **Add to Home Screen** $\rightarrow$ tap **Add**.
- **Native Xcode Project:** Download **`cellar-pos-ios-project.zip`** (224 KB). Complete Swift + WKWebView project ready to open in Xcode and deploy to TestFlight or devices.

---

## 6. REGULATORY COMPLIANCE, SECURITY & BACKUP

### 6.1 KRA eTIMS Version 1.0 Scope Boundary
- In strict adherence to Version 1.0 specifications, Cellar POS operates as an internal retail management system. Receipts generated are internal commercial receipts for customer proof of purchase and daily till reconciliation.
- Invoices are not transmitted to the Kenya Revenue Authority (KRA) eTIMS portal in Version 1.0. All printed and digital receipts carry the statutory disclaimer.

### 6.2 Data Backup & Disaster Recovery Procedure
- **Daily USB Snapshot:** Store managers should navigate to **Settings** $\rightarrow$ **"Download Backup (.json)"** at the close of every business day. Save the dated backup file onto a designated USB flash drive.
- **Restoration to New Hardware:** In the event of computer hardware failure, install Cellar POS on any replacement machine, navigate to **Settings** $\rightarrow$ **"Select File to Restore"**, and upload the latest JSON backup file. The entire catalog, stock levels, historical sales, and receipt sequences are restored instantly.

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
"""

with open(md_path, "w", encoding="utf-8") as f:
    f.write(markdown_text)
with open(os.path.join(dist_dir, "CELLAR_POS_SOFTWARE_DOCUMENTATION.md"), "w", encoding="utf-8") as f:
    f.write(markdown_text)

print("Generated Markdown documentation:", os.path.getsize(md_path), "bytes")

# ==========================================
# 2. MICROSOFT WORD (.DOCX) GENERATION
# ==========================================
doc = docx.Document()

# Page setup: 0.75 in margins
sections = doc.sections
for section in sections:
    section.top_margin = Inches(0.75)
    section.bottom_margin = Inches(0.75)
    section.left_margin = Inches(0.75)
    section.right_margin = Inches(0.75)

# Styling palette
COLOR_PRIMARY = RGBColor(107, 29, 47)    # Burgundy #6B1D2F
COLOR_SECONDARY = RGBColor(217, 119, 6)  # Amber #D97706
COLOR_DARK = RGBColor(30, 41, 59)        # Slate Dark #1E293B
COLOR_MUTED = RGBColor(100, 116, 139)    # Muted Gray #64748B

# Document Title
p_title = doc.add_paragraph()
p_title.paragraph_format.space_before = Pt(0)
p_title.paragraph_format.space_after = Pt(4)
p_title.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
run_title = p_title.add_run("CELLAR POS")
run_title.font.size = Pt(28)
run_title.font.bold = True
run_title.font.color.rgb = COLOR_PRIMARY

p_sub = doc.add_paragraph()
p_sub.paragraph_format.space_before = Pt(0)
p_sub.paragraph_format.space_after = Pt(8)
p_sub.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
run_sub = p_sub.add_run("COMPREHENSIVE SOFTWARE ARCHITECTURE, TECHNICAL SPECIFICATION & OPERATIONS MANUAL")
run_sub.font.size = Pt(13)
run_sub.font.bold = True
run_sub.font.color.rgb = COLOR_SECONDARY

p_meta = doc.add_paragraph()
p_meta.paragraph_format.space_after = Pt(18)
p_meta.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
run_meta = p_meta.add_run("Version 1.0.0 Production  •  Commercial Retail Solution  •  September 2026")
run_meta.font.size = Pt(9.5)
run_meta.font.italic = True
run_meta.font.color.rgb = COLOR_MUTED

# Helper functions for Word doc
def add_heading_1(text):
    h = doc.add_paragraph()
    h.paragraph_format.space_before = Pt(16)
    h.paragraph_format.space_after = Pt(6)
    h.paragraph_format.keep_with_next = True
    r = h.add_run(text)
    r.font.size = Pt(16)
    r.font.bold = True
    r.font.color.rgb = COLOR_PRIMARY
    return h

def add_heading_2(text):
    h = doc.add_paragraph()
    h.paragraph_format.space_before = Pt(12)
    h.paragraph_format.space_after = Pt(4)
    h.paragraph_format.keep_with_next = True
    r = h.add_run(text)
    r.font.size = Pt(12.5)
    r.font.bold = True
    r.font.color.rgb = COLOR_SECONDARY
    return h

def add_heading_3(text):
    h = doc.add_paragraph()
    h.paragraph_format.space_before = Pt(8)
    h.paragraph_format.space_after = Pt(2)
    h.paragraph_format.keep_with_next = True
    r = h.add_run(text)
    r.font.size = Pt(11)
    r.font.bold = True
    r.font.color.rgb = COLOR_DARK
    return h

def add_body(text, bold_prefix=None):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(5)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        rb = p.add_run(bold_prefix)
        rb.font.size = Pt(10)
        rb.font.bold = True
        rb.font.color.rgb = COLOR_DARK
    r = p.add_run(text)
    r.font.size = Pt(10)
    r.font.color.rgb = COLOR_DARK
    return p

def add_bullet(text, bold_prefix=None):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        rb = p.add_run(bold_prefix)
        rb.font.size = Pt(9.5)
        rb.font.bold = True
        rb.font.color.rgb = COLOR_DARK
    r = p.add_run(text)
    r.font.size = Pt(9.5)
    r.font.color.rgb = COLOR_DARK
    return p

def add_callout(text, title="COMPLIANCE NOTICE"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    cell.width = Inches(7.0)
    shading_xml = f'<w:shd {nsdecls("w")} w:fill="FFFBEB"/>'
    cell._tc.get_or_add_tcPr().append(parse_xml(shading_xml))
    borders_xml = f'<w:tcBorders {nsdecls("w")}><w:left w:val="single" w:sz="24" w:space="0" w:color="D97706"/><w:top w:val="none"/><w:right w:val="none"/><w:bottom w:val="none"/></w:tcBorders>'
    cell._tc.get_or_add_tcPr().append(parse_xml(borders_xml))
    cp = cell.paragraphs[0]
    cp.paragraph_format.space_before = Pt(4)
    cp.paragraph_format.space_after = Pt(4)
    rt = cp.add_run(f"[{title}] ")
    rt.font.bold = True
    rt.font.size = Pt(9.5)
    rt.font.color.rgb = COLOR_SECONDARY
    rb = cp.add_run(text)
    rb.font.size = Pt(9.5)
    rb.font.color.rgb = COLOR_DARK
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

# Section 1
add_heading_1("1. EXECUTIVE SUMMARY & SYSTEM OVERVIEW")
add_heading_2("1.1 Business Context & Problem Statement")
add_body("The retail wines and spirits sector in Kenya operates in a dynamic, high-volume trading environment. Retailers face frequent cellular network outages, extreme peak congestion on weekends and holidays, inventory shrinkage across multiple bottle sizes (250ml, 350ml, 750ml, 1 Litre), and daily reconciliation challenges reconciling physical cash drawers against Safaricom M-Pesa merchant till statements.")

add_heading_2("1.2 Core System Objectives")
add_bullet(" Completely functional retail till requiring no internet connection for catalog lookups, checkout ringing, digital receipting, or daily reconciliations.", "100% Offline Autonomy:")
add_bullet(" Rapid barcode scanning and touchscreen-friendly interface designed for sub-5 second sales throughput.", "High-Throughput Ringing:")
add_bullet(" Digital receipts supporting 58mm/80mm ESC/POS thermal printing, direct WhatsApp customer dispatch, SMS formatting, and ASCII plaintext copy.", "Multi-Channel Receipts:")
add_bullet(" Automatic stock deductions on sale, automatic stock restoration on voided sales, and mandatory-reason shrinkage logs.", "Shrinkage Control & Auditing:")
add_bullet(" Separate tracking and reconciliation for physical Cash Drawer versus M-Pesa Till Statement.", "Daily Dual-Tender Reconciliation:")

add_callout(
    "In accordance with Section 7 of the software requirements, Cellar POS Version 1.0 operates as an internal retail management till. Receipts generated are internal commercial records and are not transmitted to KRA eTIMS. All receipts prominently state: 'Internal receipt — not a KRA eTIMS tax invoice'.",
    "KRA eTIMS VERSION 1.0 SCOPE NOTICE"
)

# Section 2
add_heading_1("2. SYSTEM ARCHITECTURE & PLATFORM TOPOLOGY")
add_body("Cellar POS employs a reactive, single-page application (SPA) architecture combined with platform-native loopback wrappers for Windows Desktop, Android mobile devices, and Apple iOS.")

# Tech Table
table = doc.add_table(rows=1, cols=3)
table.alignment = WD_TABLE_ALIGNMENT.CENTER
hdr_cells = table.rows[0].cells
headers = ["Architecture Layer", "Primary Technology", "Production Functionality"]
for i, h in enumerate(headers):
    hdr_cells[i].text = h
    hdr_cells[i].paragraphs[0].runs[0].font.bold = True
    hdr_cells[i].paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
    hdr_cells[i].paragraphs[0].runs[0].font.size = Pt(9.5)
    shd = f'<w:shd {nsdecls("w")} w:fill="6B1D2F"/>'
    hdr_cells[i]._tc.get_or_add_tcPr().append(parse_xml(shd))

tech_data = [
    ("Frontend Core", "React 18 + TypeScript", "Strict type safety, reactive state tree, fast virtual DOM rendering"),
    ("Styling & Thermal Print", "Tailwind CSS + @media print", "Dark UI theme and zero-margin receipt formatting for 58mm/80mm printers"),
    ("Visual Analytics", "Recharts (SVG Engine)", "Interactive weekly revenue charts categorized by Cash vs M-Pesa"),
    ("Data Storage Engine", "SQLite-Compatible Local Store", "Persistent relational entities, JSON backup/restore with schema validation"),
    ("Offline Cache", "Service Worker + Workbox PWA", "Precached static bundles, offline manifest, instant standalone launch"),
    ("Windows Desktop App", "PowerShell Local WebServer", "Standalone borderless app launcher without requiring Node or Python"),
    ("Android App", "Android Studio + WebView / WebAPK", "Native Android wrapper package + 1-tap browser WebAPK installation"),
    ("Apple iOS App", "Apple .mobileconfig + Xcode Swift", "Managed WebClip configuration profile and native Swift WKWebView project")
]

for row_data in tech_data:
    row_cells = table.add_row().cells
    for i, val in enumerate(row_data):
        row_cells[i].text = val
        p = row_cells[i].paragraphs[0]
        p.runs[0].font.size = Pt(9)
        p.runs[0].font.color.rgb = COLOR_DARK
        p.paragraph_format.space_before = Pt(3)
        p.paragraph_format.space_after = Pt(3)
        shd = f'<w:shd {nsdecls("w")} w:fill="F8FAFC"/>'
        row_cells[i]._tc.get_or_add_tcPr().append(parse_xml(shd))

doc.add_paragraph().paragraph_format.space_after = Pt(6)

# Section 3
add_heading_1("3. DATA ARCHITECTURE & RELATIONAL SCHEMA")
add_body("All application state is maintained in relational entities with strict validation:")
add_bullet(" Unique SKU records where bottle volumes (250ml, 750ml) have independent pricing and inventory counts.", "Product Entity (Product):")
add_bullet(" Immutable transaction records with sequential receipt numbering, timestamp, line items, and payment details.", "Sale Entity (Sale):")
add_bullet(" Historical snapshot of sold item names, categories, and unit prices at transaction time.", "Line Item Entity (SaleItem):")
add_bullet(" Audited inventory adjustment events categorized into Restock, Breakage, Spillage, Correction, and Other.", "Stock Adjustment Entity (StockAdjustment):")
add_bullet(" Store profile, business till numbers, threshold configurations, and category taxonomy.", "Settings Entity (Settings):")

# Section 4
add_heading_1("4. FUNCTIONAL SUBSYSTEMS & OPERATIONAL FLOWS")
add_heading_2("4.1 Till Checkout Flow")
add_body("Cashiers perform sales through a high-contrast touchscreen interface. The cart prevents negative inventory by locking increments at the current stock level. During checkout, tender selection provides one-tap cash denomination helpers (+100, +200, +500, +1000, +2000, Exact Total) with real-time change calculation, or an M-Pesa transaction reference field for mobile money settlement.")

add_heading_2("4.2 Reversible Void & Refund Architecture")
add_body("Transactions are never erased. Voiding a sale creates an audited reversing entry, restores the exact line item quantities back into the physical inventory balance on hand, and stamps the receipt in red: '*** VOIDED / REFUND RECEIPT ***' with mandatory reason tracking.")

add_heading_2("4.3 Daily Till Reconciliation & Weekly Revenue Analytics")
add_body("Shift close-out displays the total net revenue, physical Cash in Till Drawer count (amount and transaction count), and Safaricom M-Pesa Statement count. The Recharts weekly revenue graph renders daily cash and digital revenue performance, allowing managers to tap any day's bar to immediately inspect transactions.")

# Section 5
add_heading_1("5. INSTALLATION & DEPLOYMENT OPTIONS")
add_bullet(" Download cellar-pos-desktop-offline-installer.zip (320 KB). Extract and double-click start-cellar-pos.bat to launch in borderless window mode.", "Windows 10/11 Desktop:")
add_bullet(" Open till URL in Chrome/Edge on phone and tap 'Install App', or download the Android Studio native project cellar-pos-android-project.zip.", "Android Phone & Tablet:")
add_bullet(" Download cellar-pos.mobileconfig in Safari on iPhone to install the Apple WebClip profile, or download the Xcode project cellar-pos-ios-project.zip.", "Apple iOS (iPhone/iPad):")

# Section 6
add_heading_1("6. DISASTER RECOVERY & HARDWARE INTEGRATION")
add_body("Daily JSON backups can be downloaded in one click to a USB flash drive from Settings. Compatible with standard USB/Bluetooth 58mm/80mm ESC/POS thermal receipt printers, USB HID barcode scanners, and pulse cash drawers.")

doc.save(docx_path)
shutil.copy2(docx_path, os.path.join(dist_dir, "CELLAR_POS_SOFTWARE_DOCUMENTATION.docx"))
print("Generated Word (.docx) documentation:", os.path.getsize(docx_path), "bytes")

# ==========================================
# 3. ADOBE PDF GENERATION WITH REPORTLAB
# ==========================================
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (on pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, letter[1] - 36, "Cellar POS — Comprehensive Software Architecture & Operations Manual (v1.0)")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.line(54, letter[1] - 42, letter[0] - 54, letter[1] - 42)

        # Footer
        footer_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(letter[0] - 54, 32, footer_text)
        self.drawString(54, 32, "CONFIDENTIAL & PROPRIETARY — THE CELLAR WINES & SPIRITS TILL SYSTEM")
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(54, 44, letter[0] - 54, 44)
        
        self.restoreState()

doc_pdf = SimpleDocTemplate(
    pdf_path,
    pagesize=letter,
    leftMargin=54,
    rightMargin=54,
    topMargin=54,
    bottomMargin=54
)

styles = getSampleStyleSheet()

# Custom styles
style_title = ParagraphStyle(
    'DocTitle',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=24,
    leading=28,
    textColor=colors.HexColor('#6B1D2F'),
    alignment=1, # Center
    spaceAfter=6
)

style_sub = ParagraphStyle(
    'DocSub',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=11,
    leading=15,
    textColor=colors.HexColor('#D97706'),
    alignment=1, # Center
    spaceAfter=8
)

style_meta = ParagraphStyle(
    'DocMeta',
    parent=styles['Normal'],
    fontName='Helvetica-Oblique',
    fontSize=8.5,
    leading=11,
    textColor=colors.HexColor('#64748B'),
    alignment=1, # Center
    spaceAfter=16
)

style_h1 = ParagraphStyle(
    'DocH1',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=13,
    leading=17,
    textColor=colors.HexColor('#6B1D2F'),
    spaceBefore=12,
    spaceAfter=6,
    keepWithNext=True
)

style_h2 = ParagraphStyle(
    'DocH2',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=10.5,
    leading=14,
    textColor=colors.HexColor('#D97706'),
    spaceBefore=8,
    spaceAfter=4,
    keepWithNext=True
)

style_body = ParagraphStyle(
    'DocBody',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=8.5,
    leading=12,
    textColor=colors.HexColor('#1E293B'),
    spaceAfter=5
)

style_bullet = ParagraphStyle(
    'DocBullet',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=8.5,
    leading=12,
    textColor=colors.HexColor('#1E293B'),
    leftIndent=14,
    firstLineIndent=-10,
    spaceAfter=3
)

style_callout = ParagraphStyle(
    'DocCallout',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=8,
    leading=11,
    textColor=colors.HexColor('#78350F')
)

story = []

# Title & Metadata
story.append(Paragraph("CELLAR POS", style_title))
story.append(Paragraph("COMPREHENSIVE SOFTWARE ARCHITECTURE, TECHNICAL SPECIFICATION & OPERATIONS MANUAL", style_sub))
story.append(Paragraph("Version 1.0.0 Production  •  Commercial Retail Solution  •  September 2026", style_meta))
story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#E2E8F0'), spaceAfter=10))

# Section 1
story.append(Paragraph("1. EXECUTIVE SUMMARY & SYSTEM OVERVIEW", style_h1))
story.append(Paragraph("<b>1.1 Business Context & Problem Statement:</b> The retail wines and spirits sector in Kenya operates in a dynamic, high-volume trading environment. Retailers face frequent cellular network outages, extreme peak congestion on weekends and holidays, inventory shrinkage across multiple bottle sizes (250ml, 350ml, 750ml, 1 Litre), and daily reconciliation challenges reconciling physical cash drawers against Safaricom M-Pesa merchant till statements.", style_body))

story.append(Paragraph("<b>1.2 Core System Objectives:</b>", style_h2))
story.append(Paragraph("• <b>100% Offline Autonomy:</b> Fully operational retail till requiring zero internet connection for catalog lookups, checkout ringing, digital receipting, or daily reconciliations.", style_bullet))
story.append(Paragraph("• <b>High-Throughput Ringing:</b> Rapid barcode scanning and touchscreen-friendly interface designed for sub-5 second sales throughput.", style_bullet))
story.append(Paragraph("• <b>Multi-Channel Receipts:</b> Digital receipts supporting 58mm/80mm ESC/POS thermal printing, direct WhatsApp customer dispatch, SMS formatting, and ASCII plaintext copy.", style_bullet))
story.append(Paragraph("• <b>Shrinkage Control & Auditing:</b> Automatic stock deductions on sale, automatic stock restoration on voided sales, and mandatory-reason shrinkage logs.", style_bullet))
story.append(Paragraph("• <b>Daily Dual-Tender Reconciliation:</b> Separate tracking and reconciliation for physical Cash Drawer versus M-Pesa Till Statement.", style_bullet))

# Callout Notice Box
callout_data = [[
    Paragraph("<b>[KRA eTIMS VERSION 1.0 SCOPE NOTICE]</b><br/>In accordance with Section 7 of the software requirements, Cellar POS Version 1.0 operates as an internal retail management till. Receipts generated are internal commercial records and are not transmitted to KRA eTIMS. All receipts prominently state: <i>'Internal receipt — not a KRA eTIMS tax invoice'</i>.", style_callout)
]]
t_callout = Table(callout_data, colWidths=[504])
t_callout.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#FEF3C7')),
    ('LINELEFT', (0,0), (-1,-1), 3, colors.HexColor('#D97706')),
    ('TOPPADDING', (0,0), (-1,-1), 6),
    ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ('LEFTPADDING', (0,0), (-1,-1), 8),
    ('RIGHTPADDING', (0,0), (-1,-1), 8),
]))
story.append(Spacer(1, 4))
story.append(t_callout)
story.append(Spacer(1, 8))

# Section 2
story.append(Paragraph("2. SYSTEM ARCHITECTURE & PLATFORM TOPOLOGY", style_h1))
story.append(Paragraph("Cellar POS employs a reactive, single-page application (SPA) architecture combined with platform-native loopback wrappers for Windows Desktop, Android mobile devices, and Apple iOS.", style_body))

# Architecture Table
table_pdf_data = [
    [
        Paragraph("<b>Architecture Layer</b>", style_callout),
        Paragraph("<b>Primary Technology</b>", style_callout),
        Paragraph("<b>Production Functionality</b>", style_callout)
    ],
    [
        Paragraph("<b>Frontend Core</b>", style_body),
        Paragraph("React 18 + TypeScript", style_body),
        Paragraph("Strict type safety, reactive state tree, fast virtual DOM rendering", style_body)
    ],
    [
        Paragraph("<b>Styling & Thermal</b>", style_body),
        Paragraph("Tailwind CSS + @media print", style_body),
        Paragraph("Dark UI theme and zero-margin receipt formatting for 58mm/80mm printers", style_body)
    ],
    [
        Paragraph("<b>Visual Analytics</b>", style_body),
        Paragraph("Recharts (SVG Engine)", style_body),
        Paragraph("Interactive weekly revenue charts categorized by Cash vs M-Pesa", style_body)
    ],
    [
        Paragraph("<b>Storage Engine</b>", style_body),
        Paragraph("SQLite-Compatible Local Store", style_body),
        Paragraph("Persistent relational entities, JSON backup/restore with schema validation", style_body)
    ],
    [
        Paragraph("<b>Offline Cache</b>", style_body),
        Paragraph("Service Worker + Workbox PWA", style_body),
        Paragraph("Precached static bundles, offline manifest, instant standalone launch", style_body)
    ],
    [
        Paragraph("<b>Windows App</b>", style_body),
        Paragraph("PowerShell Local WebServer", style_body),
        Paragraph("Standalone borderless app launcher without requiring Node or Python", style_body)
    ],
    [
        Paragraph("<b>Android App</b>", style_body),
        Paragraph("Android Studio + WebView / WebAPK", style_body),
        Paragraph("Native Android wrapper package + 1-tap browser WebAPK installation", style_body)
    ],
    [
        Paragraph("<b>Apple iOS App</b>", style_body),
        Paragraph(".mobileconfig + Xcode Swift", style_body),
        Paragraph("Managed WebClip configuration profile and native Swift WKWebView project", style_body)
    ]
]
t_arch = Table(table_pdf_data, colWidths=[110, 150, 244])
t_arch.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#6B1D2F')),
    ('TEXTCOLOR', (0,0), (-1,0), colors.white),
    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
    ('TOPPADDING', (0,0), (-1,-1), 3),
    ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor('#FFFFFF'), colors.HexColor('#F8FAFC')])
]))
story.append(t_arch)
story.append(Spacer(1, 8))

# Section 3
story.append(Paragraph("3. DATA ARCHITECTURE & RELATIONAL SCHEMA", style_h1))
story.append(Paragraph("All application state is maintained in relational entities with strict validation:", style_body))
story.append(Paragraph("• <b>Product Entity (Product):</b> Unique SKU records where bottle volumes (250ml, 750ml) have independent pricing and inventory counts.", style_bullet))
story.append(Paragraph("• <b>Sale Entity (Sale):</b> Immutable transaction records with sequential receipt numbering, timestamp, line items, and payment details.", style_bullet))
story.append(Paragraph("• <b>Line Item Entity (SaleItem):</b> Historical snapshot of sold item names, categories, and unit prices at transaction time.", style_bullet))
story.append(Paragraph("• <b>Stock Adjustment Entity (StockAdjustment):</b> Audited inventory adjustment events categorized into Restock, Breakage, Spillage, Correction, and Other.", style_bullet))
story.append(Paragraph("• <b>Settings Entity (Settings):</b> Store profile, business till numbers, threshold configurations, and category taxonomy.", style_bullet))

# Section 4
story.append(Paragraph("4. FUNCTIONAL SUBSYSTEMS & OPERATIONAL FLOWS", style_h1))
story.append(Paragraph("<b>4.1 Till Checkout Flow:</b> Cashiers perform sales through a high-contrast touchscreen interface. The cart prevents negative inventory by locking increments at the current stock level. During checkout, tender selection provides one-tap cash denomination helpers (+100, +200, +500, +1000, +2000, Exact Total) with real-time change calculation, or an M-Pesa transaction reference field for mobile money settlement.", style_body))

story.append(Paragraph("<b>4.2 Reversible Void & Refund Architecture:</b> Transactions are never erased. Voiding a sale creates an audited reversing entry, restores the exact line item quantities back into the physical inventory balance on hand, and stamps the receipt in red: '*** VOIDED / REFUND RECEIPT ***' with mandatory reason tracking.", style_body))

story.append(Paragraph("<b>4.3 Daily Till Reconciliation & Weekly Revenue Analytics:</b> Shift close-out displays the total net revenue, physical Cash in Till Drawer count (amount and transaction count), and Safaricom M-Pesa Statement count. The Recharts weekly revenue graph renders daily cash and digital revenue performance, allowing managers to tap any day's bar to immediately inspect transactions.", style_body))

# Section 5
story.append(Paragraph("5. INSTALLATION & DEPLOYMENT OPTIONS", style_h1))
story.append(Paragraph("• <b>Windows 10/11 Desktop:</b> Download cellar-pos-desktop-offline-installer.zip (320 KB). Extract and double-click start-cellar-pos.bat to launch in borderless window mode.", style_bullet))
story.append(Paragraph("• <b>Android Phone & Tablet:</b> Open till URL in Chrome/Edge on phone and tap 'Install App', or download the Android Studio native project cellar-pos-android-project.zip.", style_bullet))
story.append(Paragraph("• <b>Apple iOS (iPhone/iPad):</b> Download cellar-pos.mobileconfig in Safari on iPhone to install the Apple WebClip profile, or download the Xcode project cellar-pos-ios-project.zip.", style_bullet))

# Section 6
story.append(Paragraph("6. DISASTER RECOVERY & HARDWARE INTEGRATION", style_h1))
story.append(Paragraph("Daily JSON backups can be downloaded in one click to a USB flash drive from Settings. Compatible with standard USB/Bluetooth 58mm/80mm ESC/POS thermal receipt printers, USB HID barcode scanners, and pulse cash drawers.", style_body))

doc_pdf.build(story, canvasmaker=NumberedCanvas)
shutil.copy2(pdf_path, os.path.join(dist_dir, "CELLAR_POS_SOFTWARE_DOCUMENTATION.pdf"))
print("Generated Adobe PDF documentation:", os.path.getsize(pdf_path), "bytes")
