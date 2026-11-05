# Theproteino 40-Feature E-Commerce Admin Console & MySQL Database Architecture

A complete, production-ready `/admin` control center protected by PIN `9890` and backed by an enterprise-grade, non-destructive MySQL database schema that powers 40 essential e-commerce, CMS, inventory, CRM, marketing, and operations features with instant live reflection across the storefront.

## User Review & Critical Decisions

> [!IMPORTANT]
> All three focus areas from your clarifying responses have been incorporated in full. Every change made in `/admin` persists to your MySQL database (with an automatic server-side synchronization layer so live storefront updates are reflected instantaneously without requiring a page rebuild).

- **Confirmed Decision 1 — Live Storefront CMS**: Full real-time editing of Hero Banners, Top Announcement Bar, Brand Story, Footer Config, Comparison Matrix, Live Milestone Counters, Community Reels, Store Essentials Bundles, FAQs, and Policy Pages.
- **Confirmed Decision 2 — Fulfillment, Inventory & Operations**: End-to-end Order Lifecycle & Status Pipeline, Printable/Downloadable Tax Invoices, Dynamic Shipping & Tax Rules, Payment Gateway Toggles, SKU Stock Tracking & Low-Stock Alerts, Batch Inventory Updates, Returns/Refunds Queue, and Support Tickets.
- **Confirmed Decision 3 — Marketing, CRM, Analytics & DevOps**: Advanced Coupon & B2G1/Free-Gift Engine, Flash Sale Campaigns, Customer CRM & Loyalty Ledger, Review Moderation, Revenue & Conversion Analytics, CSV Data Exports, SEO Meta Manager, Admin Audit Logs, and 1-Click VPS Deployment Trigger (`/update`).
- **Database Compatibility Guarantee**: All new MySQL tables and columns are provisioned strictly via `CREATE TABLE IF NOT EXISTS` in `mysql.ts` without dropping or altering any existing columns in `users`, `user_addresses`, `orders`, `products`, `product_categories`, `product_variants`, `product_flavors`, `reels`, or `product_reviews`.

---

## 1. Overview & Core Concept

- **What It Does**: Provides a unified `/admin` command center gated by PIN `9890` where store owners can manage all 40 core aspects of Theproteino—from catalog pricing, variants, flavors, and inventory levels to homepage hero banners, comparison tables, coupons, shipping fees, customer orders, refunds, and SEO metadata—with every update taking effect immediately on the live customer-facing store.
- **Target Audience / Persona**: Store owner and operations manager requiring rapid, code-free control over merchandising, promotions, fulfillment, and storefront content.
- **Key Value**: Eliminates hardcoded storefront data by wiring every storefront section to a centralized MySQL-backed Store Configuration & Catalog API (`/api/storefront/bootstrap` and `/api/admin/*`).

---

## 2. User Experience & Visual Design

### Key User Flows
1. **PIN `9890` Security Gate (`/admin`)**:
   - Navigating to `/admin` (or clicking the discreet Admin link in the footer) presents a clean, high-contrast PIN pad. Entering `9890` unlocks the admin session and logs the access event in the Audit Log.
2. **Real-Time Catalog & Inventory Management**:
   - Admins can create, edit, duplicate, or archive products, manage multi-size variants and flavors, toggle bestseller/in-stock flags, adjust SKU stock quantities in batch, and configure free gift tags.
3. **Instant Storefront CMS Editor**:
   - Dedicated editors for the Top Announcement Bar, Hero Campaign Banner (headline, subheadline, CTA, stats, featured image), "Theproteino vs The Rest" Comparison Matrix rows, Live Counter Banner numbers, Watch & Shop Reels, Store Essentials Bundles, About/Contact details, FAQs, and Policy pages. Saving immediately updates the live store state.
4. **Order Fulfillment, Invoices & Returns**:
   - Filter orders by status (`confirmed`, `processing`, `shipped`, `delivered`, `cancelled`), assign tracking numbers/couriers, generate formatted tax invoices, and process customer return/refund requests.

### Visual Identity & Theme
- **Aesthetic Direction**: Utilitarian enterprise SaaS console tailored to Theproteino's signature botanical palette (`#00632d` deep forest emerald, `#fbf7f0` warm parchment canvas, `#0f172a` slate workspace framing).
- **Color Palette & Mood**:
  - **60% Neutral Canvas**: Crisp `#f8fafc` and `#ffffff` data tables and editor surfaces for effortless scannability.
  - **30% Structural Surfaces**: Deep slate sidebar (`#0f172a`) with hairline `#e2e8f0` borders and single-elevation cards.
  - **10% Accent Budget**: Forest emerald (`#00632d`) primary actions, lime (`#8ee000`) active indicators, semantic status colors (`#16a34a` active/delivered, `#d97706` pending/low-stock, `#dc2626` alert/cancelled).
- **Typography & Hierarchy**:
  - **Display & Navigation**: `Fredoka` / `Plus Jakarta Sans` SemiBold/Bold for clear section headers.
  - **Body & Controls**: `Plus Jakarta Sans` (13px–15px) with single-line `whitespace-nowrap` buttons and tabs.
  - **Tabular Metrics**: `font-mono tabular-nums` on all prices, SKU stock counts, order IDs, conversion rates, and timestamps.
- **Layout Structure**:
  - $260\text{px}$ fixed sidebar navigation grouped into 8 logical command modules + top bar with breadcrumb trail, live store status, "View Live Store" shortcut, and "Save & Sync" action + high-density main workspace viewport.

---

## 3. The 40 Essential E-Commerce Features & MySQL Schema Mapping

### Module A: Executive Analytics & BI (Features 1–5)
1. **Real-Time KPI Command Ribbon**: Total Revenue, Orders Count, Average Order Value (AOV), Conversion Rate, and Low-Stock Alerts.
2. **Revenue & Order Volume Time-Series Chart**: Interactive daily/weekly/monthly revenue breakdown.
3. **Category & Bestseller Performance Matrix**: Revenue share and unit velocity by product category.
4. **Conversion Funnel Visualizer**: Store Visits $\to$ Product Views $\to$ Added to Bag $\to$ Checkout Started $\to$ Orders Completed.
5. **1-Click CSV Data Exporter**: Export Orders, Products, Customers, Coupons, and Inventory ledgers to CSV.

### Module B: Catalog, Variants & Inventory Engine (Features 6–13)
6. **Full Product CRUD Manager**: Create, edit, and delete products with primary/secondary imagery, badges, descriptions, and ingredients.
7. **Multi-Variant & Pricing Matrix**: Manage size variants (`500g`, `1 kg`, `2 kg`), selling prices, MRP (`originalPrice`), and auto-calculated discount percentages.
8. **Flavor & Nutrition Facts Editor**: Dynamic flavor tags and nutrition table editor (`protein`, `bcaa`, `calories`, `carbs`, `fat`, `sugar`, `servingSize`).
9. **Category Showcase Manager**: Edit category names, icons, circular dish images, pastel background tones (`bgTone`), and micro-badges.
10. **SKU Inventory & Stock Ledger**: Track real-time unit stock per product/variant (`stock_quantity`, `sku_code`, `reorder_level`).
11. **Batch Stock & Price Updater**: Bulk update prices, discounts, and stock counts across multiple products in one table view.
12. **Store Essentials & Bundles Builder**: Manage curated combo packs and bundle discounts shown on `/essentials`.
13. **Free Gift & B2G1 Rule Assignment**: Attach automatic free gifts (e.g., Free Gym Shaker) or Buy-2-Get-1 badges to specific products.

### Module C: Order Fulfillment, Returns & Billing (Features 14–19)
14. **Order Pipeline & Status Manager**: Transition orders through `confirmed` $\to$ `packed` $\to$ `shipped` $\to$ `out_for_delivery` $\to$ `delivered` / `cancelled`.
15. **Shipment & Courier Tracker**: Attach AWB tracking numbers, courier partner names, and estimated delivery dates to orders.
16. **Printable GST/Tax Invoice Generator**: Generate and print/download itemized customer invoices from any order row.
17. **Returns, Replacements & Refunds Queue**: Manage customer return requests, approve/reject refunds, and restock returned items (`order_returns` table).
18. **Manual / POS Order Creator**: Create phone/WhatsApp orders directly from the admin panel on behalf of customers.
19. **Abandoned Cart Recovery Log**: View active/abandoned carts with item breakdowns and customer contact info (`abandoned_carts` table).

### Module D: Customer CRM, Loyalty & Reviews (Features 20–24)
20. **Customer Directory & Profile Inspector**: View registered Firebase/MySQL users, lifetime spend, order history, and account status.
21. **Customer Address Book Manager**: Inspect and edit saved customer delivery addresses (`user_addresses` table).
22. **Loyalty Points & Wallet Ledger**: Award or deduct reward points (`loyalty_points` balance per customer).
23. **Product Review Moderation & Pinning**: Approve, reply to, feature, or remove customer reviews (`product_reviews` table), plus add verified buyer reviews.
24. **Customer Support & Contact Inquiries Desk**: Manage messages submitted via `/contact` (`support_tickets` table) with status tracking (`open`, `in_progress`, `resolved`).

### Module E: Marketing, Coupons & Promotions (Features 25–29)
25. **Dynamic Coupon Engine**: Create percentage or flat-discount promo codes (`coupons` table) with minimum order value, usage limits, and expiry dates.
26. **Flash Sale & Campaign Scheduler**: Configure limited-time storewide or category-specific discount campaigns (`flash_sales` table).
27. **Top Announcement Bar Manager**: Edit the rotating promotional messages and one-click coupon buttons in the top bar.
28. **Promotional Banner & Offer Card Editor**: Customize the Mega Menu promotional card and checkout upsell offers.
29. **Newsletter & WhatsApp Subscriber List**: View and export opted-in marketing subscribers (`newsletter_subscribers` table).

### Module F: Live Storefront CMS & Visual Builder (Features 30–35)
30. **Hero Banner Studio**: Edit the main hero badge, headline, subheadline, CTA buttons, product showcase image, and nutrition callout cards.
31. **"Theproteino vs The Rest" Comparison Matrix Editor**: Add, edit, or reorder comparison parameters and brand advantages (`comparison_rows` table).
32. **Live Milestone Counter & Trust Badges Manager**: Update the Jar/Scoop counter number, certification badges, and nutrition highlights.
33. **Community Reels ("Watch & Shop") Manager**: Add, edit, or remove creator video/image reels and link them to live products (`reels` table).
34. **Brand Story & About Us Editor**: Customize the wave banner copy, founder story, mission pillars, and lab certification highlights.
35. **FAQ & Policy Pages CMS**: Full rich-text/markdown editor for Privacy Policy, Terms of Service, Shipping Policy, Refund Policy, and store FAQs (`cms_pages` and `faqs` tables).

### Module G: Store Operations, Payments, Shipping & System (Features 36–40)
36. **Shipping Zones & Free-Shipping Threshold Config**: Dynamically adjust the free shipping threshold (e.g., `₹499`), standard shipping fee (`₹70`), and express delivery rates.
37. **Tax / GST & Pricing Rules**: Configure inclusive/exclusive GST percentages and invoice company details (GSTIN, FSSAI license number).
38. **Payment Gateway & COD Toggles**: Enable/disable Cash on Delivery (COD), UPI, Cards, and NetBanking, plus set COD fee or max COD order limits.
39. **SEO Meta, OpenGraph & Footer Configurator**: Manage global page titles, meta descriptions, social links, support phone/email, and footer links.
40. **Admin Security, Audit Trail & VPS Auto-Deploy Control**: Change Admin PIN (default `9890`), inspect timestamped `admin_audit_logs`, check live MySQL table health, and trigger `/update` (`deploy.sh`) directly from the dashboard.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Data Flow Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER (React 19 SPA)                       │
├─────────────────────────────────────┬──────────────────────────────────────┤
│      LIVE STOREFRONT VIEWS          │       /admin COMMAND CONSOLE         │
│  (Home, Shop, PDP, Cart, Checkout,  │     (PIN '9890' Auth Gate + 8        │
│   Wishlist, Essentials, About,      │      Management Modules Covering     │
│   Contact, Policy Pages)            │      All 40 E-Commerce Features)     │
└──────────────────┬──────────────────┴───────────────────┬──────────────────┘
                   │                                      │
                   ▼                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│             StoreDataContext (Live Reactive Storefront State)              │
│   Fetches /api/storefront/bootstrap on load & updates immediately when     │
│   any mutation occurs in /admin (zero reload delay across all views)       │
└─────────────────────────────────────┬──────────────────────────────────────┘
                                      │ REST API (/api/storefront/* & /api/admin/*)
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                     EXPRESS BACKEND SERVER (server.ts)                     │
│  • PIN '9890' Verification Header / Middleware                             │
│  • Complete CRUD Endpoints for Catalog, CMS, Orders, Coupons, CRM, Settings│
│  • Write-Through Cache + MySQL Persistence Layer                           │
└─────────────────────────────────────┬──────────────────────────────────────┘
                                      │ mysql2/promise Pool
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                   MYSQL DATABASE (22-Table Giant Schema)                   │
├────────────────────────┬─────────────────────────┬─────────────────────────┤
│ Core & Catalog         │ Orders & CRM            │ CMS, Marketing & Ops    │
│ • products (+cols)     │ • orders (+cols)        │ • store_settings        │
│ • product_categories   │ • order_status_history  │ • cms_sections          │
│ • product_variants     │ • order_returns         │ • cms_pages             │
│ • product_flavors      │ • abandoned_carts       │ • comparison_rows       │
│ • product_bundles      │ • users (+loyalty)      │ • faqs                  │
│ • inventory_logs       │ • user_addresses        │ • coupons               │
│ • reels                │ • product_reviews       │ • flash_sales           │
│                        │ • support_tickets       │ • shipping_rules        │
│                        │ • newsletter_subscribers│ • admin_audit_logs      │
└────────────────────────┴─────────────────────────┴─────────────────────────┘
```

### Expanded MySQL Schema (22 Tables — Non-Destructive)
All existing tables (`users`, `user_addresses`, `orders`, `product_categories`, `products`, `product_variants`, `product_flavors`, `reels`, `product_reviews`) are preserved untouched, with safe `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` extensions where helpful, plus 13 new tables created via `CREATE TABLE IF NOT EXISTS`:
1. `store_settings`: Key-value JSON configuration store for global settings (PIN, shipping threshold, tax/GST, payment methods, SEO, contact info, top bar, hero, live counter, footer).
2. `cms_sections`: Structured JSON content for Hero Banner, Brand Story, Comparison Matrix, Live Counter, and Mega Menu Promo.
3. `cms_pages`: Editable markdown/HTML content for Policy pages (`privacy-policy`, `terms-of-service`, `shipping-policy`, `refund-policy`, `about-us`).
4. `comparison_rows`: Rows for "Theproteino vs The Rest" comparison matrix (`feature`, `theproteino_value`, `others_value`, `sort_order`).
5. `faqs`: Storefront & product FAQs (`question`, `answer`, `category`, `sort_order`, `is_active`).
6. `product_bundles`: Curated bundles for `/essentials` (`id`, `name`, `subtitle`, `price`, `original_price`, `image`, `badge`, `items_json`, `is_active`).
7. `inventory_logs`: Audit trail of stock adjustments (`product_id`, `variant_size`, `change_amount`, `new_stock`, `reason`, `created_at`).
8. `coupons`: Promotional discount codes (`code`, `discount_type`, `discount_value`, `min_order_amount`, `max_discount`, `usage_limit`, `used_count`, `free_gift_name`, `is_active`, `expires_at`).
9. `flash_sales`: Scheduled promotional campaigns (`id`, `title`, `discount_percent`, `category_filter`, `starts_at`, `ends_at`, `banner_text`, `is_active`).
10. `order_status_history`: Timestamped order status transitions and tracking notes (`order_id`, `status`, `tracking_number`, `courier_name`, `note`, `created_at`).
11. `order_returns`: Customer return and refund requests (`id`, `order_id`, `customer_email`, `reason`, `status`, `refund_amount`, `resolution_note`, `created_at`).
12. `abandoned_carts`: Live/abandoned shopping cart sessions (`session_id`, `customer_email`, `customer_phone`, `items_json`, `subtotal`, `updated_at`).
13. `support_tickets`: Customer inquiries from `/contact` (`id`, `name`, `email`, `phone`, `subject`, `message`, `status`, `admin_reply`, `created_at`).
14. `newsletter_subscribers`: Email/WhatsApp marketing signups (`id`, `email`, `phone`, `source`, `created_at`).
15. `admin_audit_logs`: Complete log of every admin action (`id`, `action_type`, `entity_name`, `entity_id`, `summary`, `ip_address`, `created_at`).

### Interactive Component & State Mapping
- **`StoreDataContext`**: Wraps the application and provides live, reactive access to products, categories, bundles, reels, coupons, hero/CMS content, comparison rows, shipping rules, payment toggles, and policies. Whenever the admin saves any item in `/admin`, `StoreDataContext` updates both MySQL (via `/api/admin/...`) and the live React state immediately.
- **Contact & Checkout Integration**: Submitting the `/contact` form now creates a real `support_tickets` record in MySQL; applying a coupon in `/cart` or `/checkout` validates against the dynamic `coupons` table; shipping fees and payment options in `/checkout` dynamically obey the admin-configured thresholds and payment toggles.
