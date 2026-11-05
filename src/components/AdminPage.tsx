import React, { useState, useEffect, useCallback } from 'react';
import {
  Lock,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Layers,
  Settings,
  Database,
  Plus,
  Trash2,
  Edit3,
  X,
  Download,
  RefreshCw,
  Printer,
  ArrowLeft,
  Search,
  CheckCircle2,
  Rocket,
  Eye,
  Pin,
  TrendingUp,
  ChevronRight,
  ExternalLink,
  AlertTriangle,
  FileText,
  Filter,
  Save,
  Check,
  ShieldCheck,
  HelpCircle,
  Truck,
  CreditCard,
  Globe,
  Sparkles,
  DollarSign,
  Box,
  Sliders,
  Mail,
  MessageSquare,
  Clock,
  LogOut,
  FolderPlus,
  List,
} from 'lucide-react';
import { useStoreData } from '../context/StoreDataContext';
import {
  Product,
  CategoryItem,
  ReelItem,
  ProductReview,
  StoreSettings,
  ComparisonRow,
  CouponItem,
  FlashSaleItem,
  FaqItem,
  CmsPageItem,
  OrderRecord,
  UserProfile,
  OrderReturnRecord,
  SupportTicketRecord,
  AbandonedCartRecord,
  NewsletterSubscriber,
  InventoryLogRecord,
  AuditLogRecord,
} from '../types/store';
import { createProductSlug } from '../data/products';

interface AdminPageProps {
  onGoToStorefront: () => void;
  version: string;
  onViewProduct?: (slug: string) => void;
}

// Dedicated full-page routing inside the Admin Console
export type AdminPageSlug =
  | 'overview'
  // Catalog & Inventory
  | 'products'
  | 'product-add'
  | 'product-edit'
  | 'categories'
  | 'bundles'
  | 'inventory'
  // Orders & Fulfillment
  | 'orders'
  | 'order-detail'
  | 'pos-order'
  | 'returns'
  | 'abandoned'
  // CRM & Customers
  | 'customers'
  | 'reviews'
  | 'tickets'
  | 'subscribers'
  // Marketing
  | 'coupons'
  | 'flash-sales'
  // Storefront CMS
  | 'cms-hero'
  | 'cms-comparison'
  | 'cms-counters'
  | 'cms-reels'
  | 'cms-brand'
  | 'cms-faqs'
  | 'cms-policies'
  | 'cms-footer'
  // Operations & Settings
  | 'settings-shipping'
  | 'settings-tax'
  | 'settings-payments'
  | 'settings-seo'
  // Database & System
  | 'db-schema'
  | 'db-audit'
  | 'db-deploy';

const MYSQL_SCHEMA_TABLES = [
  { name: 'users', group: 'CRM & Auth', desc: 'Customer accounts, Firebase UIDs, loyalty points & total spend' },
  { name: 'user_addresses', group: 'CRM & Auth', desc: 'Saved customer shipping addresses and PIN codes' },
  { name: 'orders', group: 'Fulfillment', desc: 'Master order ledger, totals, payment status, courier & AWB' },
  { name: 'order_status_history', group: 'Fulfillment', desc: 'Timestamped pipeline transitions (confirmed -> delivered)' },
  { name: 'order_returns', group: 'Fulfillment', desc: 'Customer RMA return, replacement & refund requests' },
  { name: 'abandoned_carts', group: 'Fulfillment', desc: 'High-intent checkout dropoffs for WhatsApp/Email recovery' },
  { name: 'product_categories', group: 'Catalog', desc: 'Storefront category showcase cards, icons & badges' },
  { name: 'products', group: 'Catalog', desc: 'Master SKUs, pricing, nutrition JSON, stock & free gifts' },
  { name: 'product_variants', group: 'Catalog', desc: 'Multi-size pack variants (350g, 500g, 1kg) & variant stock' },
  { name: 'product_flavors', group: 'Catalog', desc: 'Flavor options per product (Cold Coffee, Dark Chocolate, etc.)' },
  { name: 'product_bundles', group: 'Catalog', desc: 'Store Essentials & combo kits with bundle discounts' },
  { name: 'inventory_logs', group: 'Catalog', desc: 'Stock movement audit ledger (restock, manual adjust, sale)' },
  { name: 'coupons', group: 'Marketing', desc: 'Promo codes (PERCENT / FLAT), min order & usage limits' },
  { name: 'flash_sales', group: 'Marketing', desc: 'Time-bound campaign banners, countdowns & featured SKUs' },
  { name: 'reels', group: 'Storefront CMS', desc: 'Watch & Shop vertical video reels linked to products' },
  { name: 'product_reviews', group: 'CRM & Auth', desc: 'Verified customer reviews, star ratings, pins & admin replies' },
  { name: 'store_settings', group: 'Operations', desc: 'Key-value JSON store for Hero, Top Bar, Shipping, Tax, SEO' },
  { name: 'cms_sections', group: 'Storefront CMS', desc: 'Modular homepage visual sections and layout blocks' },
  { name: 'cms_pages', group: 'Storefront CMS', desc: 'Legal & policy documents (Privacy, Terms, Refund, Shipping, Labdoor)' },
  { name: 'comparison_rows', group: 'Storefront CMS', desc: 'Theproteino vs Ghar Ka Khaana vs Junk Food matrix rows' },
  { name: 'faqs', group: 'Storefront CMS', desc: 'Frequently asked questions categorized for product & help pages' },
  { name: 'support_tickets', group: 'CRM & Auth', desc: 'Customer care inquiries from /contact with admin responses' },
  { name: 'newsletter_subscribers', group: 'Marketing', desc: 'Opt-in email subscribers from footer discount capture' },
  { name: 'admin_audit_logs', group: 'System & Security', desc: 'Immutable log of every admin mutation and deployment trigger' },
];

const createBlankProduct = (): Product => ({
  id: `sku-prot-${Date.now().toString().slice(-4)}`,
  name: '',
  tagline: '100% Real Peanut Protein',
  description: '',
  price: 699,
  originalPrice: 899,
  discountPercent: 22,
  rating: 4.9,
  reviewCount: 1,
  image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=600&q=80',
  category: 'Protein Powder',
  inStock: true,
  stockQuantity: 100,
  lowStockThreshold: 15,
  badge: 'NEW LAUNCH',
  isBestseller: true,
  skuCode: `PRT-${Date.now().toString().slice(-4)}`,
  variants: [
    { size: '500g Jar', price: 699, originalPrice: 899, stockQuantity: 60 },
    { size: '1kg Bag', price: 1299, originalPrice: 1699, stockQuantity: 40 },
  ],
  flavors: ['Cold Coffee', 'Dark Chocolate'],
  nutrition: {
    protein: '30g',
    bcaa: '6.2g',
    calories: '162 kcal',
    carbs: '8g',
    fat: '1.2g',
    sugar: '0g',
    servingSize: '33g (1 Scoop)',
  },
  features: ['100% Real Ingredients', 'No Palm Oil', 'Cold-Filtered Nutrition'],
  ingredients: 'Slow Roasted Peanuts, Natural Flavors, Stevia',
  hasFreeGift: 'Free Shaker (₹499)',
});

export const AdminPage: React.FC<AdminPageProps> = ({ onGoToStorefront, version, onViewProduct }) => {
  const { applyBootstrapPayload, refreshStorefront } = useStoreData();

  // Authentication State
  const [pin, setPin] = useState<string>(() => sessionStorage.getItem('theproteino_admin_pin') || '');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Dedicated Page Routing
  const [currentPage, setCurrentPage] = useState<AdminPageSlug>('overview');
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' | 'info' } | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Master Store State
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [bundles, setBundles] = useState<Product[]>([]);
  const [reels, setReels] = useState<ReelItem[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [comparisonRows, setComparisonRows] = useState<ComparisonRow[]>([]);
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [flashSales, setFlashSales] = useState<FlashSaleItem[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [cmsPages, setCmsPages] = useState<CmsPageItem[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [returns, setReturns] = useState<OrderReturnRecord[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicketRecord[]>([]);
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCartRecord[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLogRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [mysqlConnected, setMysqlConnected] = useState<boolean>(false);

  // Dedicated Product Editing / Creation State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormTab, setProductFormTab] = useState<'general' | 'inventory' | 'variants' | 'flavors' | 'nutrition' | 'gifts'>('general');

  // Dedicated Order Inspection State
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [orderCourierInput, setOrderCourierInput] = useState('');
  const [orderAwbInput, setOrderAwbInput] = useState('');

  // Search & Filter State
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [deployOutput, setDeployOutput] = useState<string | null>(null);

  // Manual POS Order State
  const [posCustomerName, setPosCustomerName] = useState('');
  const [posCustomerEmail, setPosCustomerEmail] = useState('');
  const [posCustomerPhone, setPosCustomerPhone] = useState('');
  const [posAddress, setPosAddress] = useState('102 Fitness Heights, Bandra West');
  const [posCity, setPosCity] = useState('Mumbai');
  const [posPincode, setPosPincode] = useState('400050');
  const [posProductId, setPosProductId] = useState('');
  const [posQty, setPosQty] = useState(1);
  const [posPaymentMethod, setPosPaymentMethod] = useState<'UPI' | 'Card' | 'NetBanking' | 'COD'>('UPI');

  // New Category Form State
  const [newCategory, setNewCategory] = useState<CategoryItem>({
    id: '',
    name: '',
    icon: '🥜',
    description: '',
    badge: 'Popular',
  });

  // New Coupon Form State
  const [newCoupon, setNewCoupon] = useState<CouponItem>({
    code: '',
    description: '',
    discountType: 'PERCENT',
    discountValue: 15,
    minOrderAmount: 499,
    maxDiscount: 500,
    freeGiftName: '',
    usageLimit: 500,
    usedCount: 0,
    isActive: true,
    expiresAt: '2027-12-31',
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const applyDashboardData = useCallback(
    (payload: any) => {
      if (!payload) return;
      const data = payload.state || payload;
      if (data.settings) setSettings(data.settings);
      if (data.categories) setCategories(data.categories);
      if (data.products) setProducts(data.products);
      if (data.bundles) setBundles(data.bundles);
      if (data.reels) setReels(data.reels);
      if (data.reviews) setReviews(data.reviews);
      if (data.comparisonRows) setComparisonRows(data.comparisonRows);
      if (data.coupons) setCoupons(data.coupons);
      if (data.flashSales) setFlashSales(data.flashSales);
      if (data.faqs) setFaqs(data.faqs);
      if (data.cmsPages) setCmsPages(data.cmsPages);
      if (data.orders) setOrders(data.orders);
      if (data.customers) setCustomers(data.customers);
      if (data.returns) setReturns(data.returns);
      if (data.supportTickets) setSupportTickets(data.supportTickets);
      if (data.abandonedCarts) setAbandonedCarts(data.abandonedCarts);
      if (data.subscribers) setSubscribers(data.subscribers);
      if (data.inventoryLogs) setInventoryLogs(data.inventoryLogs);
      if (data.auditLogs) setAuditLogs(data.auditLogs);
      if (typeof payload.mysqlConnected === 'boolean') setMysqlConnected(payload.mysqlConnected);

      applyBootstrapPayload(data);
    },
    [applyBootstrapPayload]
  );

  const fetchDashboard = useCallback(
    async (adminPin: string) => {
      try {
        const res = await fetch('/api/admin/dashboard', {
          headers: { 'x-admin-pin': adminPin },
        });
        if (res.ok) {
          const data = await res.json();
          applyDashboardData(data);
          setIsAuthenticated(true);
          sessionStorage.setItem('theproteino_admin_pin', adminPin);
        } else {
          setIsAuthenticated(false);
          sessionStorage.removeItem('theproteino_admin_pin');
        }
      } catch (err) {
        console.error('Admin fetch error:', err);
      }
    },
    [applyDashboardData]
  );

  useEffect(() => {
    if (pin) {
      fetchDashboard(pin);
    }
  }, [pin, fetchDashboard]);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    try {
      const res = await fetch('/api/admin/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput.trim() }),
      });
      if (res.ok) {
        const cleanPin = pinInput.trim();
        setPin(cleanPin);
        const data = await res.json();
        applyDashboardData(data);
        setIsAuthenticated(true);
        sessionStorage.setItem('theproteino_admin_pin', cleanPin);
        showToast('Welcome to Theproteino Admin Console');
      } else {
        setPinError('Invalid security PIN. Enter 9890 to log in.');
      }
    } catch {
      setPinError('Unable to connect to server.');
    }
  };

  const adminPost = async (endpoint: string, body: any, successMsg: string) => {
    setIsSaving(true);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        await fetchDashboard(pin);
        await refreshStorefront();
        showToast(successMsg, 'success');
      } else {
        showToast(data.error || 'Operation failed', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while saving to MySQL', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // CSV Export Utility
  const handleExportCSV = (dataset: 'orders' | 'products' | 'customers' | 'coupons' | 'inventory') => {
    let rows: any[] = [];
    if (dataset === 'orders') {
      rows = orders.map((o) => ({
        OrderID: o.orderId,
        Date: o.createdAt,
        Customer: o.customerName,
        Email: o.customerEmail,
        Phone: o.customerPhone,
        TotalINR: o.totalAmount,
        PaymentMethod: o.paymentMethod,
        OrderStatus: o.orderStatus,
        Courier: o.courierName || '',
        TrackingAWB: o.trackingNumber || '',
      }));
    } else if (dataset === 'products') {
      rows = products.map((p) => ({
        ID: p.id,
        SKU: p.skuCode || p.id.toUpperCase(),
        Name: p.name,
        Category: p.category,
        PriceINR: p.price,
        MRP: p.originalPrice,
        Stock: p.stockQuantity ?? 100,
        InStock: p.inStock ? 'YES' : 'NO',
        Rating: p.rating,
        Reviews: p.reviewCount,
      }));
    } else if (dataset === 'customers') {
      rows = customers.map((c) => ({
        Name: c.displayName,
        Email: c.email,
        Phone: c.phone || '',
        LoyaltyPoints: c.loyaltyPoints || 0,
        TotalSpentINR: c.totalSpent || 0,
        Status: c.status || 'active',
      }));
    } else if (dataset === 'coupons') {
      rows = coupons.map((c) => ({
        Code: c.code,
        Type: c.discountType,
        Value: c.discountValue,
        MinOrder: c.minOrderAmount,
        UsedCount: c.usedCount,
        Limit: c.usageLimit,
        Active: c.isActive ? 'YES' : 'NO',
      }));
    } else if (dataset === 'inventory') {
      rows = inventoryLogs.map((l) => ({
        ID: l.id,
        Product: l.productName,
        Variant: l.variantSize,
        ChangeQty: l.changeAmount,
        NewStock: l.newStock,
        Reason: l.reason,
        Time: l.createdAt,
      }));
    }

    if (rows.length === 0) {
      showToast('No records available to export', 'info');
      return;
    }
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(','),
      ...rows.map((r) =>
        headers.map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `theproteino_${dataset}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${dataset.toUpperCase()} CSV`);
  };

  // Switch to dedicated "Add New Product" page
  const handleOpenAddProduct = () => {
    setEditingProduct(createBlankProduct());
    setProductFormTab('general');
    setCurrentPage('product-add');
  };

  // Switch to dedicated "Edit Product" page
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(JSON.parse(JSON.stringify(prod)));
    setProductFormTab('general');
    setCurrentPage('product-edit');
  };

  // Switch to dedicated "Order Details" page
  const handleOpenOrderDetail = (order: OrderRecord) => {
    setSelectedOrder(order);
    setOrderCourierInput(order.courierName || 'BlueDart Express');
    setOrderAwbInput(order.trackingNumber || '');
    setCurrentPage('order-detail');
  };

  // Save product from dedicated Add or Edit page
  const handleSaveProduct = async () => {
    if (!editingProduct) return;
    if (!editingProduct.name.trim()) {
      showToast('Please enter a product title', 'error');
      return;
    }
    await adminPost(
      '/api/admin/products/upsert',
      { product: editingProduct },
      `Successfully published "${editingProduct.name}" to MySQL!`
    );
    setCurrentPage('products');
  };

  // Delete product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}" from MySQL?`)) {
      return;
    }
    await adminPost('/api/admin/products/delete', { id }, `Deleted ${name}`);
    if (currentPage === 'product-edit') {
      setCurrentPage('products');
    }
  };

  // Computed Metrics
  const totalRevenue = orders
    .filter((o) => o.orderStatus !== 'cancelled')
    .reduce((acc, o) => acc + Number(o.totalAmount || 0), 0);
  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;
  const lowStockProducts = products.filter(
    (p) => (p.stockQuantity ?? 100) <= (p.lowStockThreshold ?? 20)
  );
  const pendingOrdersCount = orders.filter(
    (o) => o.orderStatus === 'confirmed' || o.orderStatus === 'packed'
  ).length;
  const openTicketsCount = supportTickets.filter((t) => t.status !== 'resolved').length;

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      searchFilter === '' ||
      p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (p.skuCode && p.skuCode.toLowerCase().includes(searchFilter.toLowerCase()));
    const matchesCategory =
      categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus =
      orderStatusFilter === 'all' || o.orderStatus === orderStatusFilter;
    const matchesSearch =
      searchFilter === '' ||
      o.orderId.toLowerCase().includes(searchFilter.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // =========================================================================
  // LIGHT & PROFESSIONAL WORDPRESS LOGIN SCREEN
  // =========================================================================
  if (!isAuthenticated || !settings) {
    return (
      <div className="min-h-screen bg-[#f0f0f1] text-[#2c3338] flex flex-col items-center justify-center p-4 antialiased selection:bg-[#2271b1] selection:text-white">
        <div className="w-full max-w-sm mb-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#1d2327] text-white shadow-md mb-3">
            <span className="font-display font-black text-2xl tracking-tight text-[#8ee000]">P</span>
          </div>
          <h1 className="text-xl font-semibold text-[#1d2327] tracking-tight">Theproteino Admin</h1>
          <p className="text-xs text-[#646970] mt-0.5">Enterprise Store & MySQL Management Console</p>
        </div>

        <div className="w-full max-w-sm bg-white border border-[#c3c4c7] shadow-sm rounded-sm p-6 space-y-5">
          <div className="bg-[#f6f7f7] border-l-4 border-[#2271b1] p-3 text-xs text-[#2c3338] leading-relaxed">
            Please enter your 4-digit security PIN (<span className="font-mono font-bold text-[#1d2327]">9890</span>) to access the store administration panel.
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1d2327] mb-1.5 uppercase tracking-wide">
                Security PIN Code
              </label>
              <input
                type="password"
                inputMode="numeric"
                autoFocus
                placeholder="••••"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full px-3.5 py-2.5 text-center text-2xl font-mono font-bold tracking-[0.4em] bg-white border border-[#8c8f94] rounded-sm text-[#1d2327] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] transition-all"
              />
            </div>

            {pinError && (
              <div className="bg-[#fcf0f1] border-l-4 border-[#d63638] p-2.5 text-xs text-[#d63638] font-medium">
                {pinError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#2271b1] hover:bg-[#135e96] text-white text-sm font-semibold rounded-sm transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
            >
              <span>Log In</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="w-full max-w-sm mt-4 text-center">
          <button
            onClick={onGoToStorefront}
            className="text-xs text-[#2271b1] hover:text-[#135e96] hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Go to Theproteino Storefront</span>
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // LIGHT & PROFESSIONAL WORDPRESS ADMIN SUITE
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#f0f0f1] text-[#2c3338] flex flex-col antialiased selection:bg-[#2271b1] selection:text-white font-sans">
      {/* -------------------------------------------------------------------
          1. WORDPRESS TOP ADMIN BAR (36px high dark charcoal #1d2327)
      ------------------------------------------------------------------- */}
      <header className="h-9 bg-[#1d2327] text-[#f0f0f1] px-4 flex items-center justify-between text-xs sticky top-0 z-50 select-none shadow-xs">
        {/* Left: Brand & Visit Store */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold tracking-tight text-white hover:text-[#72aee6] cursor-pointer">
            <span className="w-5 h-5 rounded-sm bg-[#2271b1] text-white flex items-center justify-center font-display text-[11px] font-black">
              P
            </span>
            <span>Theproteino</span>
          </div>

          <span className="text-[#646970]">|</span>

          <button
            onClick={onGoToStorefront}
            className="flex items-center gap-1 text-[#c3c4c7] hover:text-white transition-colors cursor-pointer"
            title="Open live storefront"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Visit Store</span>
          </button>

          <span className="text-[#646970]">|</span>

          {/* Quick Add Menu */}
          <div className="relative group">
            <button className="flex items-center gap-1 text-[#c3c4c7] hover:text-white transition-colors cursor-pointer">
              <Plus className="w-3.5 h-3.5 text-[#72aee6]" />
              <span>New</span>
            </button>
            <div className="hidden group-hover:block absolute left-0 top-full bg-[#2c3338] shadow-lg border border-[#3c434a] min-w-40 py-1 rounded-b z-50">
              <button
                onClick={handleOpenAddProduct}
                className="w-full text-left px-3 py-1.5 text-xs text-[#c3c4c7] hover:bg-[#2271b1] hover:text-white cursor-pointer"
              >
                + New Product
              </button>
              <button
                onClick={() => setCurrentPage('pos-order')}
                className="w-full text-left px-3 py-1.5 text-xs text-[#c3c4c7] hover:bg-[#2271b1] hover:text-white cursor-pointer"
              >
                + New Order (POS)
              </button>
              <button
                onClick={() => setCurrentPage('coupons')}
                className="w-full text-left px-3 py-1.5 text-xs text-[#c3c4c7] hover:bg-[#2271b1] hover:text-white cursor-pointer"
              >
                + New Coupon
              </button>
            </div>
          </div>
        </div>

        {/* Right: MySQL status, Admin user, Version & Logout */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
              mysqlConnected
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                : 'bg-amber-950 text-amber-300 border border-amber-700/60'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${mysqlConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span>{mysqlConnected ? 'MySQL Connected' : 'Sync Ready'}</span>
          </div>

          <span className="text-[#646970]">|</span>

          <span className="text-[#c3c4c7] hidden sm:inline">
            Howdy, <strong className="text-white">Admin (PIN 9890)</strong>
          </span>

          <span className="text-[#8c8f94] font-mono text-[11px] hidden md:inline">
            {version}
          </span>

          <button
            onClick={() => {
              sessionStorage.removeItem('theproteino_admin_pin');
              setIsAuthenticated(false);
              setPinInput('');
            }}
            className="flex items-center gap-1 text-[#c3c4c7] hover:text-red-300 transition-colors cursor-pointer"
            title="Log out of admin"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </header>

      {/* Floating Notice / Toast */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 bg-white border-l-4 shadow-xl rounded-xs px-4 py-3 flex items-center gap-3 text-xs font-semibold animate-in fade-in transition-all ${
            toast.type === 'error'
              ? 'border-[#d63638] text-[#d63638]'
              : toast.type === 'info'
              ? 'border-[#72aee6] text-[#2c3338]'
              : 'border-[#00a32a] text-[#1d2327]'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-[#d63638]" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#00a32a]" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* -------------------------------------------------------------------
          2. WORKPRESS SIDEBAR + MAIN WORKSPACE BODY
      ------------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col md:flex-row min-w-0">
        {/* Left Sidebar Menu (#1d2327) */}
        <aside className="w-full md:w-56 bg-[#1d2327] text-[#f0f0f1] shrink-0 border-r border-[#2c3338] select-none flex flex-col justify-between">
          <div className="py-2">
            {/* Dashboard Link */}
            <button
              onClick={() => setCurrentPage('overview')}
              className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between cursor-pointer transition-colors ${
                currentPage === 'overview'
                  ? 'bg-[#2271b1] text-white font-semibold'
                  : 'text-[#f0f0f1] hover:bg-[#135e96] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4 text-[#72aee6]" />
                <span>Dashboard</span>
              </div>
            </button>

            {/* Separator / Section: Catalog */}
            <div className="px-3.5 pt-3 pb-1 text-[10px] uppercase font-bold tracking-wider text-[#8c8f94]">
              Catalog & Products
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => setCurrentPage('products')}
                className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                  currentPage === 'products'
                    ? 'bg-[#2271b1] text-white font-semibold'
                    : 'text-[#c3c4c7] hover:bg-[#2c3338] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <span>All Products</span>
                </div>
                <span className="text-[10px] font-mono text-[#8c8f94]">{products.length}</span>
              </button>

              <button
                onClick={handleOpenAddProduct}
                className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                  currentPage === 'product-add'
                    ? 'bg-[#2271b1] text-white font-semibold'
                    : 'text-[#c3c4c7] hover:bg-[#2c3338] hover:text-white'
                }`}
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Add New Product</span>
              </button>

              <button
                onClick={() => setCurrentPage('categories')}
                className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                  currentPage === 'categories'
                    ? 'bg-[#2271b1] text-white font-semibold'
                    : 'text-[#c3c4c7] hover:bg-[#2c3338] hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
                <span>Categories</span>
              </button>

              <button
                onClick={() => setCurrentPage('bundles')}
                className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                  currentPage === 'bundles'
                    ? 'bg-[#2271b1] text-white font-semibold'
                    : 'text-[#c3c4c7] hover:bg-[#2c3338] hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Essentials Bundles</span>
              </button>

              <button
                onClick={() => setCurrentPage('inventory')}
                className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                  currentPage === 'inventory'
                    ? 'bg-[#2271b1] text-white font-semibold'
                    : 'text-[#c3c4c7] hover:bg-[#2c3338] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4" />
                  <span>Stock & Inventory</span>
                </div>
                {lowStockProducts.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-[#d63638] text-white rounded text-[10px] font-bold">
                    {lowStockProducts.length}
                  </span>
                )}
              </button>
            </div>

            {/* Section: Orders & Fulfillment */}
            <div className="px-3.5 pt-3 pb-1 text-[10px] uppercase font-bold tracking-wider text-[#8c8f94]">
              Fulfillment
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => setCurrentPage('orders')}
                className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                  currentPage === 'orders'
                    ? 'bg-[#2271b1] text-white font-semibold'
                    : 'text-[#c3c4c7] hover:bg-[#2c3338] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  <span>Orders</span>
                </div>
                {pendingOrdersCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-[#dba617] text-[#1d2327] rounded text-[10px] font-bold">
                    {pendingOrdersCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setCurrentPage('pos-order')}
                className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                  currentPage === 'pos-order'
                    ? 'bg-[#2271b1] text-white font-semibold'
                    : 'text-[#c3c4c7] hover:bg-[#2c3338] hover:text-white'
                }`}
              >
                <Plus className="w-4 h-4 text-sky-400" />
                <span>Add Order (POS)</span>
              </button>

              <button
                onClick={() => setCurrentPage('returns')}
                className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                  currentPage === 'returns'
                    ? 'bg-[#2271b1] text-white font-semibold'
                    : 'text-[#c3c4c7] hover:bg-[#2c3338] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  <span>Returns & Refunds</span>
                </div>
                {returns.length > 0 && (
                  <span className="text-[10px] font-mono text-[#8c8f94]">{returns.length}</span>
                )}
              </button>

              <button
                onClick={() => setCurrentPage('abandoned')}
                className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                  currentPage === 'abandoned'
                    ? 'bg-[#2271b1] text-white font-semibold'
                    : 'text-[#c3c4c7] hover:bg-[#2c3338] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Abandoned Carts</span>
                </div>
                {abandonedCarts.length > 0 && (
                  <span className="text-[10px] font-mono text-[#8c8f94]">{abandonedCarts.length}</span>
                )}
              </button>
            </div>

            {/* Section: Customers & Desk */}
            <div className="px-3.5 pt-3 pb-1 text-[10px] uppercase font-bold tracking-wider text-[#8c8f94]">
              CRM & Care
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => setCurrentPage('customers')}
                className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                  currentPage === 'customers'
                    ? 'bg-[#2271b1] text-white font-semibold'
                    : 'text-[#c3c4c7] hover:bg-[#2c3338] hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Customers</span>
              </button>

              <button
                onClick={() => setCurrentPage('reviews')}
                className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                  currentPage === 'reviews'
                    ? 'bg-[#2271b1] text-white font-semibold'
                    : 'text-[#c3c4c7] hover:bg-[#2c3338] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>Product Reviews</span>
                </div>
                <span className="text-[10px] font-mono text-[#8c8f94]">{reviews.length}</span>
              </button>

              <button
                onClick={() => setCurrentPage('tickets')}
                className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                  currentPage === 'tickets'
                    ? 'bg-[#2271b1] text-white font-semibold'
                    : 'text-[#c3c4c7] hover:bg-[#2c3338] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>Support Desk</span>
                </div>
                {openTicketsCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-[#d63638] text-white rounded text-[10px] font-bold">
                    {openTicketsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setCurrentPage('subscribers')}
                className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                  currentPage === 'subscribers'
                    ? 'bg-[#2271b1] text-white font-semibold'
                    : 'text-[#c3c4c7] hover:bg-[#2c3338] hover:text-white'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>Subscribers</span>
              </button>
            </div>

            {/* Section: Marketing */}
            <div className="px-3.5 pt-3 pb-1 text-[10px] uppercase font-bold tracking-wider text-[#8c8f94]">
              Marketing
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => setCurrentPage('coupons')}
                className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                  currentPage === 'coupons'
                    ? 'bg-[#2271b1] text-white font-semibold'
                    : 'text-[#c3c4c7] hover:bg-[#2c3338] hover:text-white'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>Coupons & Promos</span>
              </button>

              <button
                onClick={() => setCurrentPage('flash-sales')}
                className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                  currentPage === 'flash-sales'
                    ? 'bg-[#2271b1] text-white font-semibold'
                    : 'text-[#c3c4c7] hover:bg-[#2c3338] hover:text-white'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Flash Sales</span>
              </button>
            </div>

            {/* Section: Storefront CMS */}
            <div className="px-3.5 pt-3 pb-1 text-[10px] uppercase font-bold tracking-wider text-[#8c8f94]">
              Storefront CMS
            </div>
            <div className="space-y-0.5">
              {[
                { id: 'cms-hero', label: 'Hero & Top Bar' },
                { id: 'cms-comparison', label: 'Comparison Matrix' },
                { id: 'cms-counters', label: 'Live Counters' },
                { id: 'cms-reels', label: 'Watch & Shop Reels' },
                { id: 'cms-brand', label: 'Brand Story' },
                { id: 'cms-faqs', label: 'FAQs' },
                { id: 'cms-policies', label: 'Policy Pages' },
                { id: 'cms-footer', label: 'Footer Config' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCurrentPage(c.id as AdminPageSlug)}
                  className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                    currentPage === c.id
                      ? 'bg-[#2271b1] text-white font-semibold'
                      : 'text-[#c3c4c7] hover:bg-[#2c3338] hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{c.label}</span>
                </button>
              ))}
            </div>

            {/* Section: Settings & Operations */}
            <div className="px-3.5 pt-3 pb-1 text-[10px] uppercase font-bold tracking-wider text-[#8c8f94]">
              Settings
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => setCurrentPage('settings-shipping')}
                className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                  currentPage === 'settings-shipping'
                    ? 'bg-[#2271b1] text-white font-semibold'
                    : 'text-[#c3c4c7] hover:bg-[#2c3338] hover:text-white'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>Shipping Rules</span>
              </button>

              <button
                onClick={() => setCurrentPage('settings-tax')}
                className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                  currentPage === 'settings-tax'
                    ? 'bg-[#2271b1] text-white font-semibold'
                    : 'text-[#c3c4c7] hover:bg-[#2c3338] hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Tax & Compliance</span>
              </button>

              <button
                onClick={() => setCurrentPage('settings-payments')}
                className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                  currentPage === 'settings-payments'
                    ? 'bg-[#2271b1] text-white font-semibold'
                    : 'text-[#c3c4c7] hover:bg-[#2c3338] hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Payments Gateways</span>
              </button>

              <button
                onClick={() => setCurrentPage('settings-seo')}
                className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                  currentPage === 'settings-seo'
                    ? 'bg-[#2271b1] text-white font-semibold'
                    : 'text-[#c3c4c7] hover:bg-[#2c3338] hover:text-white'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>SEO & Metadata</span>
              </button>
            </div>

            {/* Section: MySQL Database & Tools */}
            <div className="px-3.5 pt-3 pb-1 text-[10px] uppercase font-bold tracking-wider text-[#8c8f94]">
              Tools & Database
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => setCurrentPage('db-schema')}
                className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                  currentPage === 'db-schema'
                    ? 'bg-[#2271b1] text-white font-semibold'
                    : 'text-[#c3c4c7] hover:bg-[#2c3338] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>24 MySQL Tables</span>
                </div>
                <span className="text-[10px] font-mono text-[#8c8f94]">24</span>
              </button>

              <button
                onClick={() => setCurrentPage('db-audit')}
                className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                  currentPage === 'db-audit'
                    ? 'bg-[#2271b1] text-white font-semibold'
                    : 'text-[#c3c4c7] hover:bg-[#2c3338] hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                <span>Admin Audit Logs</span>
              </button>

              <button
                onClick={() => setCurrentPage('db-deploy')}
                className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                  currentPage === 'db-deploy'
                    ? 'bg-[#2271b1] text-white font-semibold'
                    : 'text-[#c3c4c7] hover:bg-[#2c3338] hover:text-white'
                }`}
              >
                <Rocket className="w-4 h-4 text-rose-400" />
                <span>Deploy / Update</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area (Light White #f0f0f1 + Clean White Cards) */}
        <main className="flex-1 min-w-0 p-5 md:p-8 space-y-6">
          {/* =================================================================
              PAGE: DASHBOARD (OVERVIEW & BI ANALYTICS)
          ================================================================= */}
          {currentPage === 'overview' && (
            <div className="space-y-6">
              {/* Header Title & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#c3c4c7] pb-4">
                <div>
                  <h1 className="text-2xl font-bold text-[#1d2327]">Dashboard</h1>
                  <p className="text-xs text-[#646970] mt-0.5">
                    Real-time sales, order pipeline, inventory alerts & MySQL telemetry.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => adminPost('/api/admin/sync-mysql', {}, 'Synced with MySQL Database')}
                    className="px-3 py-1.5 bg-white border border-[#c3c4c7] hover:border-[#2271b1] text-[#2c3338] text-xs font-semibold rounded-sm shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
                    <span>Sync MySQL</span>
                  </button>
                  <button
                    onClick={onGoToStorefront}
                    className="px-3.5 py-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white text-xs font-semibold rounded-sm shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Storefront</span>
                  </button>
                </div>
              </div>

              {/* 5 KPI Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
                <div className="bg-white border border-[#c3c4c7] p-4 rounded-sm shadow-xs">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#646970]">
                    Total Revenue
                  </div>
                  <div className="text-2xl font-black text-[#1d2327] font-mono mt-1">
                    ₹{totalRevenue.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-emerald-700 font-medium mt-1">
                    Live orders total
                  </div>
                </div>

                <div className="bg-white border border-[#c3c4c7] p-4 rounded-sm shadow-xs">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#646970]">
                    Total Orders
                  </div>
                  <div className="text-2xl font-black text-[#1d2327] font-mono mt-1">
                    {orders.length}
                  </div>
                  <div className="text-[11px] text-[#2271b1] font-medium mt-1">
                    {pendingOrdersCount} awaiting shipment
                  </div>
                </div>

                <div className="bg-white border border-[#c3c4c7] p-4 rounded-sm shadow-xs">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#646970]">
                    Avg Order Value
                  </div>
                  <div className="text-2xl font-black text-[#1d2327] font-mono mt-1">
                    ₹{avgOrderValue.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-[#646970] font-medium mt-1">Per transaction</div>
                </div>

                <div className="bg-white border border-[#c3c4c7] p-4 rounded-sm shadow-xs">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#646970]">
                    Registered Customers
                  </div>
                  <div className="text-2xl font-black text-[#1d2327] font-mono mt-1">
                    {customers.length}
                  </div>
                  <div className="text-[11px] text-emerald-700 font-medium mt-1">
                    {subscribers.length} newsletter opt-ins
                  </div>
                </div>

                <div className="bg-white border border-[#c3c4c7] p-4 rounded-sm shadow-xs">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#646970]">
                    Stock Alerts
                  </div>
                  <div
                    className={`text-2xl font-black font-mono mt-1 ${
                      lowStockProducts.length > 0 ? 'text-[#d63638]' : 'text-emerald-700'
                    }`}
                  >
                    {lowStockProducts.length}
                  </div>
                  <div className="text-[11px] text-[#646970] font-medium mt-1">
                    {lowStockProducts.length > 0 ? 'SKUs below threshold' : 'All SKUs healthy'}
                  </div>
                </div>
              </div>

              {/* Quick Jump Shortcuts Box */}
              <div className="bg-white border border-[#c3c4c7] p-4 rounded-sm shadow-xs">
                <div className="text-sm font-semibold text-[#1d2327] mb-3">Quick Shortcuts</div>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={handleOpenAddProduct}
                    className="px-3 py-1.5 bg-[#2271b1] text-white text-xs font-semibold rounded-sm hover:bg-[#135e96] flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Product</span>
                  </button>
                  <button
                    onClick={() => setCurrentPage('products')}
                    className="px-3 py-1.5 bg-white border border-[#c3c4c7] hover:border-[#2271b1] text-xs font-semibold rounded-sm text-[#2c3338] cursor-pointer"
                  >
                    View All Products ({products.length})
                  </button>
                  <button
                    onClick={() => setCurrentPage('orders')}
                    className="px-3 py-1.5 bg-white border border-[#c3c4c7] hover:border-[#2271b1] text-xs font-semibold rounded-sm text-[#2c3338] cursor-pointer"
                  >
                    Manage Orders ({orders.length})
                  </button>
                  <button
                    onClick={() => setCurrentPage('pos-order')}
                    className="px-3 py-1.5 bg-white border border-[#c3c4c7] hover:border-[#2271b1] text-xs font-semibold rounded-sm text-[#2c3338] cursor-pointer"
                  >
                    Create Manual POS Order
                  </button>
                  <button
                    onClick={() => setCurrentPage('coupons')}
                    className="px-3 py-1.5 bg-white border border-[#c3c4c7] hover:border-[#2271b1] text-xs font-semibold rounded-sm text-[#2c3338] cursor-pointer"
                  >
                    Promo Coupons ({coupons.length})
                  </button>
                  <button
                    onClick={() => handleExportCSV('orders')}
                    className="px-3 py-1.5 bg-white border border-[#c3c4c7] hover:border-[#2271b1] text-xs font-semibold rounded-sm text-[#2c3338] flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Orders CSV</span>
                  </button>
                </div>
              </div>

              {/* Recent Orders & Low Stock Side-by-Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Recent Orders Box */}
                <div className="bg-white border border-[#c3c4c7] rounded-sm shadow-xs overflow-hidden">
                  <div className="p-3.5 border-b border-[#c3c4c7] bg-[#f6f7f7] flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1d2327] uppercase tracking-wide">
                      Recent Orders
                    </span>
                    <button
                      onClick={() => setCurrentPage('orders')}
                      className="text-xs text-[#2271b1] hover:underline cursor-pointer"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="divide-y divide-[#f0f0f1]">
                    {orders.slice(0, 5).map((o) => (
                      <div
                        key={o.orderId}
                        onClick={() => handleOpenOrderDetail(o)}
                        className="p-3 hover:bg-[#f6f7f7] flex items-center justify-between text-xs cursor-pointer"
                      >
                        <div>
                          <div className="font-semibold text-[#1d2327]">{o.customerName}</div>
                          <div className="text-[11px] text-[#646970] font-mono">
                            {o.orderId} · {o.createdAt}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold font-mono text-[#1d2327]">₹{o.totalAmount}</div>
                          <span
                            className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase ${
                              o.orderStatus === 'delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : o.orderStatus === 'cancelled'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {o.orderStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Low Stock Watchlist */}
                <div className="bg-white border border-[#c3c4c7] rounded-sm shadow-xs overflow-hidden">
                  <div className="p-3.5 border-b border-[#c3c4c7] bg-[#f6f7f7] flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1d2327] uppercase tracking-wide">
                      Inventory Alerts
                    </span>
                    <button
                      onClick={() => setCurrentPage('inventory')}
                      className="text-xs text-[#2271b1] hover:underline cursor-pointer"
                    >
                      Batch Restock →
                    </button>
                  </div>
                  <div className="divide-y divide-[#f0f0f1]">
                    {lowStockProducts.length === 0 ? (
                      <div className="p-6 text-center text-xs text-[#646970]">
                        ✓ All product stocks are above safety thresholds.
                      </div>
                    ) : (
                      lowStockProducts.slice(0, 5).map((p) => (
                        <div
                          key={p.id}
                          className="p-3 hover:bg-[#f6f7f7] flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-8 h-8 rounded object-cover border border-[#c3c4c7]"
                            />
                            <div>
                              <div className="font-semibold text-[#1d2327]">{p.name}</div>
                              <div className="text-[11px] text-[#646970]">{p.category}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              {p.stockQuantity ?? 0} Left
                            </span>
                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              className="block text-[11px] text-[#2271b1] hover:underline mt-1 cursor-pointer"
                            >
                              Edit Stock →
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              PAGE: ALL PRODUCTS (WORDPRESS CATALOG TABLE)
          ================================================================= */}
          {currentPage === 'products' && (
            <div className="space-y-4">
              {/* Top Header with "Add New" Button */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#c3c4c7] pb-3">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-[#1d2327]">Products</h1>
                  <button
                    onClick={handleOpenAddProduct}
                    className="px-2.5 py-1 bg-white border border-[#2271b1] text-[#2271b1] hover:bg-[#2271b1] hover:text-white text-xs font-semibold rounded-sm transition-colors cursor-pointer shadow-xs"
                  >
                    Add New Product
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExportCSV('products')}
                    className="px-3 py-1.5 bg-white border border-[#c3c4c7] text-[#2c3338] text-xs font-semibold rounded-sm hover:border-[#2271b1] flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="bg-white border border-[#c3c4c7] p-3 rounded-sm shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-[#8c8f94]" />
                  <input
                    type="text"
                    placeholder="Search products by title or SKU..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#8c8f94] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] rounded-sm text-xs"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-[#646970] font-semibold">Category:</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-2.5 py-1.5 border border-[#8c8f94] focus:border-[#2271b1] rounded-sm text-xs bg-white"
                  >
                    <option value="all">All Categories ({products.length})</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Products Table (Classic WordPress Post Table Style) */}
              <div className="bg-white border border-[#c3c4c7] rounded-sm shadow-xs overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#f6f7f7] border-b border-[#c3c4c7] text-[11px] font-bold text-[#2c3338] uppercase">
                      <th className="py-2.5 px-3 w-12 text-center">Image</th>
                      <th className="py-2.5 px-3">Product Name & Actions</th>
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3">Stock</th>
                      <th className="py-2.5 px-3">Price / MRP</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Badge</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f0f1]">
                    {filteredProducts.map((p) => {
                      const isLowStock = (p.stockQuantity ?? 100) <= (p.lowStockThreshold ?? 20);
                      return (
                        <tr key={p.id} className="hover:bg-[#fcfcfc] transition-colors group">
                          {/* Thumbnail */}
                          <td className="py-2 px-3 text-center">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-10 h-10 object-cover rounded border border-[#dcdcde] mx-auto"
                            />
                          </td>

                          {/* Name + WordPress Hover Action Links */}
                          <td className="py-2 px-3">
                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              className="font-bold text-[#1d2327] hover:text-[#2271b1] text-left cursor-pointer"
                            >
                              {p.name}
                            </button>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-[#2271b1]">
                              <button
                                onClick={() => handleOpenEditProduct(p)}
                                className="hover:underline cursor-pointer"
                              >
                                Edit
                              </button>
                              <span className="text-[#c3c4c7]">|</span>
                              <button
                                onClick={() => {
                                  if (onViewProduct) {
                                    onViewProduct(createProductSlug(p.name));
                                  } else {
                                    onGoToStorefront();
                                  }
                                }}
                                className="hover:underline cursor-pointer"
                              >
                                View in Store
                              </button>
                              <span className="text-[#c3c4c7]">|</span>
                              <button
                                onClick={() => handleDeleteProduct(p.id, p.name)}
                                className="text-[#d63638] hover:underline cursor-pointer"
                              >
                                Trash
                              </button>
                            </div>
                          </td>

                          {/* SKU */}
                          <td className="py-2 px-3 font-mono text-[#646970]">
                            {p.skuCode || p.id.toUpperCase()}
                          </td>

                          {/* Stock Status */}
                          <td className="py-2 px-3">
                            {p.inStock ? (
                              <span
                                className={`inline-flex items-center gap-1 font-semibold ${
                                  isLowStock ? 'text-amber-700' : 'text-emerald-700'
                                }`}
                              >
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    isLowStock ? 'bg-amber-500' : 'bg-emerald-500'
                                  }`}
                                />
                                <span>
                                  In Stock ({p.stockQuantity ?? 100})
                                </span>
                              </span>
                            ) : (
                              <span className="text-[#d63638] font-semibold">Out of Stock</span>
                            )}
                          </td>

                          {/* Pricing */}
                          <td className="py-2 px-3 font-mono">
                            <span className="font-bold text-[#1d2327]">₹{p.price}</span>
                            {p.originalPrice && (
                              <span className="text-[#8c8f94] line-through ml-1.5 text-[11px]">
                                ₹{p.originalPrice}
                              </span>
                            )}
                          </td>

                          {/* Category */}
                          <td className="py-2 px-3 text-[#2c3338]">{p.category}</td>

                          {/* Promo Badge */}
                          <td className="py-2 px-3">
                            {p.badge ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#eaf4ec] text-[#00632d] border border-[#c5e0ca]">
                                {p.badge}
                              </span>
                            ) : (
                              <span className="text-[#8c8f94]">—</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-2 px-3 text-right">
                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              className="px-2.5 py-1 bg-white border border-[#c3c4c7] hover:border-[#2271b1] text-[#2271b1] font-semibold text-xs rounded-sm shadow-xs cursor-pointer inline-flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =================================================================
              PAGE: ADD NEW PRODUCT (DEDICATED FULL-PAGE WORDPRESS EDITOR)
              PAGE: EDIT PRODUCT (DEDICATED FULL-PAGE WORDPRESS EDITOR)
          ================================================================= */}
          {(currentPage === 'product-add' || currentPage === 'product-edit') && editingProduct && (
            <div className="space-y-4">
              {/* Breadcrumb & Main Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#c3c4c7] pb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage('products')}
                    className="text-xs text-[#2271b1] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>All Products</span>
                  </button>
                  <span className="text-[#8c8f94]">/</span>
                  <h1 className="text-xl font-bold text-[#1d2327]">
                    {currentPage === 'product-add' ? 'Add New Product' : `Edit: ${editingProduct.name}`}
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage('products')}
                    className="px-3 py-1.5 bg-white border border-[#c3c4c7] text-[#2c3338] text-xs font-semibold rounded-sm hover:bg-[#f6f7f7] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProduct}
                    disabled={isSaving}
                    className="px-4 py-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white text-xs font-semibold rounded-sm shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{currentPage === 'product-add' ? 'Publish Product' : 'Update Product'}</span>
                  </button>
                </div>
              </div>

              {/* 2-Column WordPress Gutenberg / WooCommerce Form Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left 8 Columns: Main Content Inputs & Product Data Tabs */}
                <div className="lg:col-span-8 space-y-4">
                  {/* Product Title Field */}
                  <div className="bg-white border border-[#c3c4c7] p-4 rounded-sm shadow-xs space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#646970]">
                      Product Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Supernatural Peanut Protein Powder – Cold Coffee"
                      value={editingProduct.name}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-base font-semibold text-[#1d2327] border border-[#8c8f94] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] rounded-sm"
                    />

                    {/* Permalink Preview */}
                    <div className="text-xs text-[#646970] flex items-center gap-1 pt-1 font-mono">
                      <span>Permalink:</span>
                      <span className="text-[#2271b1]">
                        https://theproteino.com/product/{createProductSlug(editingProduct.name || 'product')}
                      </span>
                    </div>
                  </div>

                  {/* Main Long Description */}
                  <div className="bg-white border border-[#c3c4c7] p-4 rounded-sm shadow-xs space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#646970]">
                      Product Description
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Write comprehensive product description, highlights, benefits, roasting process..."
                      value={editingProduct.description}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, description: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs text-[#2c3338] border border-[#8c8f94] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] rounded-sm"
                    />
                  </div>

                  {/* WooCommerce-Style Product Data Box (Tabbed) */}
                  <div className="bg-white border border-[#c3c4c7] rounded-sm shadow-xs overflow-hidden">
                    {/* Meta Box Header */}
                    <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-4 py-2.5 flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1d2327] uppercase tracking-wide">
                        Product Data & Nutrition Meta Box
                      </span>
                      <span className="text-[11px] text-[#646970]">Saved directly to MySQL</span>
                    </div>

                    {/* Tab Navigation Ribbon */}
                    <div className="flex border-b border-[#c3c4c7] bg-[#f0f0f1] overflow-x-auto text-xs">
                      {[
                        { id: 'general', label: '1. General & Pricing', icon: DollarSign },
                        { id: 'inventory', label: '2. Inventory & SKU', icon: Box },
                        { id: 'variants', label: '3. Multi-Pack Variants', icon: Sliders },
                        { id: 'flavors', label: '4. Flavor Options', icon: Sparkles },
                        { id: 'nutrition', label: '5. Nutrition Facts', icon: FileText },
                        { id: 'gifts', label: '6. Free Gifts & B2G1', icon: Tag },
                      ].map((t) => {
                        const Icon = t.icon;
                        const active = productFormTab === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setProductFormTab(t.id as any)}
                            className={`px-3 py-2 font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors border-r border-[#c3c4c7] ${
                              active
                                ? 'bg-white text-[#2271b1] border-b-2 border-b-[#2271b1]'
                                : 'text-[#646970] hover:bg-[#e0e0e0] hover:text-[#1d2327]'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{t.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Tab 1: General & Pricing */}
                    {productFormTab === 'general' && (
                      <div className="p-4 space-y-4 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block font-bold text-[#2c3338] mb-1">
                              Selling Price (₹) *
                            </label>
                            <input
                              type="number"
                              value={editingProduct.price}
                              onChange={(e) => {
                                const price = Number(e.target.value);
                                const orig = editingProduct.originalPrice || price;
                                const disc =
                                  orig > price ? Math.round(((orig - price) / orig) * 100) : 0;
                                setEditingProduct({
                                  ...editingProduct,
                                  price,
                                  discountPercent: disc,
                                });
                              }}
                              className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm font-mono font-bold"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-[#2c3338] mb-1">
                              Regular MRP (₹)
                            </label>
                            <input
                              type="number"
                              value={editingProduct.originalPrice || editingProduct.price}
                              onChange={(e) => {
                                const orig = Number(e.target.value);
                                const price = editingProduct.price;
                                const disc =
                                  orig > price ? Math.round(((orig - price) / orig) * 100) : 0;
                                setEditingProduct({
                                  ...editingProduct,
                                  originalPrice: orig,
                                  discountPercent: disc,
                                });
                              }}
                              className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm font-mono"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-[#2c3338] mb-1">
                              Calculated Discount %
                            </label>
                            <input
                              type="number"
                              disabled
                              value={editingProduct.discountPercent || 0}
                              className="w-full px-3 py-2 bg-[#f6f7f7] border border-[#c3c4c7] rounded-sm font-mono font-bold text-[#00632d]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                          <div>
                            <label className="block font-bold text-[#2c3338] mb-1">
                              Marketing Badge (e.g. BESTSELLER, B2G1 FREE)
                            </label>
                            <input
                              type="text"
                              value={editingProduct.badge || ''}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, badge: e.target.value })
                              }
                              placeholder="e.g. BESTSELLER"
                              className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-[#2c3338] mb-1">
                              Average Customer Rating (1.0 - 5.0)
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              min="1"
                              max="5"
                              value={editingProduct.rating || 4.9}
                              onChange={(e) =>
                                setEditingProduct({
                                  ...editingProduct,
                                  rating: Number(e.target.value),
                                })
                              }
                              className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tab 2: Inventory & SKU */}
                    {productFormTab === 'inventory' && (
                      <div className="p-4 space-y-4 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block font-bold text-[#2c3338] mb-1">
                              Master SKU Code
                            </label>
                            <input
                              type="text"
                              value={editingProduct.skuCode || ''}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, skuCode: e.target.value })
                              }
                              placeholder="e.g. PRT-500-CC"
                              className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm font-mono"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-[#2c3338] mb-1">
                              Available Stock Quantity
                            </label>
                            <input
                              type="number"
                              value={editingProduct.stockQuantity ?? 100}
                              onChange={(e) =>
                                setEditingProduct({
                                  ...editingProduct,
                                  stockQuantity: Number(e.target.value),
                                })
                              }
                              className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm font-mono font-bold"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-[#2c3338] mb-1">
                              Low-Stock Alert Threshold
                            </label>
                            <input
                              type="number"
                              value={editingProduct.lowStockThreshold ?? 15}
                              onChange={(e) =>
                                setEditingProduct({
                                  ...editingProduct,
                                  lowStockThreshold: Number(e.target.value),
                                })
                              }
                              className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm font-mono"
                            />
                          </div>
                        </div>

                        <div className="pt-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editingProduct.inStock ?? true}
                              onChange={(e) =>
                                setEditingProduct({
                                  ...editingProduct,
                                  inStock: e.target.checked,
                                })
                              }
                              className="w-4 h-4 text-[#2271b1] rounded-sm"
                            />
                            <span className="font-bold text-[#1d2327]">
                              In Stock (Enable customer purchases on storefront)
                            </span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Tab 3: Multi-Pack Variants */}
                    {productFormTab === 'variants' && (
                      <div className="p-4 space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#1d2327]">
                            Pack Size Variations (e.g. 350g Jar, 500g Jar, 1kg Bag, 2kg Tub)
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setEditingProduct({
                                ...editingProduct,
                                variants: [
                                  ...(editingProduct.variants || []),
                                  { size: '1kg Bag', price: 1299, originalPrice: 1699, stockQuantity: 40 },
                                ],
                              })
                            }
                            className="px-2.5 py-1 bg-[#2271b1] text-white rounded-sm font-semibold hover:bg-[#135e96] flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Size Variant</span>
                          </button>
                        </div>

                        <div className="space-y-2 pt-2">
                          {(editingProduct.variants || []).map((v, vIdx) => (
                            <div
                              key={vIdx}
                              className="grid grid-cols-1 sm:grid-cols-5 gap-2 p-2.5 bg-[#f6f7f7] border border-[#c3c4c7] rounded-sm items-center"
                            >
                              <div>
                                <label className="text-[10px] font-bold text-[#646970] block">Size / Weight</label>
                                <input
                                  type="text"
                                  value={v.size}
                                  onChange={(e) => {
                                    const next = [...editingProduct.variants];
                                    next[vIdx] = { ...v, size: e.target.value };
                                    setEditingProduct({ ...editingProduct, variants: next });
                                  }}
                                  className="w-full px-2 py-1 bg-white border border-[#8c8f94] rounded-sm font-bold"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-bold text-[#646970] block">Selling (₹)</label>
                                <input
                                  type="number"
                                  value={v.price}
                                  onChange={(e) => {
                                    const next = [...editingProduct.variants];
                                    next[vIdx] = { ...v, price: Number(e.target.value) };
                                    setEditingProduct({ ...editingProduct, variants: next });
                                  }}
                                  className="w-full px-2 py-1 bg-white border border-[#8c8f94] rounded-sm font-mono font-bold"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-bold text-[#646970] block">MRP (₹)</label>
                                <input
                                  type="number"
                                  value={v.originalPrice}
                                  onChange={(e) => {
                                    const next = [...editingProduct.variants];
                                    next[vIdx] = { ...v, originalPrice: Number(e.target.value) };
                                    setEditingProduct({ ...editingProduct, variants: next });
                                  }}
                                  className="w-full px-2 py-1 bg-white border border-[#8c8f94] rounded-sm font-mono"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-bold text-[#646970] block">Variant Stock</label>
                                <input
                                  type="number"
                                  value={v.stockQuantity ?? 50}
                                  onChange={(e) => {
                                    const next = [...editingProduct.variants];
                                    next[vIdx] = { ...v, stockQuantity: Number(e.target.value) };
                                    setEditingProduct({ ...editingProduct, variants: next });
                                  }}
                                  className="w-full px-2 py-1 bg-white border border-[#8c8f94] rounded-sm font-mono"
                                />
                              </div>

                              <div className="text-right pt-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (editingProduct.variants.length <= 1) return;
                                    setEditingProduct({
                                      ...editingProduct,
                                      variants: editingProduct.variants.filter((_, i) => i !== vIdx),
                                    });
                                  }}
                                  className="text-[#d63638] font-semibold hover:underline cursor-pointer"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tab 4: Flavor Options */}
                    {productFormTab === 'flavors' && (
                      <div className="p-4 space-y-3 text-xs">
                        <label className="block font-bold text-[#1d2327]">
                          Flavors (Comma-separated)
                        </label>
                        <input
                          type="text"
                          value={(editingProduct.flavors || []).join(', ')}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              flavors: e.target.value
                                .split(',')
                                .map((s) => s.trim())
                                .filter(Boolean),
                            })
                          }
                          placeholder="e.g. Cold Coffee, Dark Chocolate, Salted Caramel, Raw Masala"
                          className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm"
                        />
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {(editingProduct.flavors || []).map((f, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-[#f0f0f1] border border-[#c3c4c7] rounded text-xs font-semibold text-[#1d2327]"
                            >
                              ☕ {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tab 5: Nutrition Facts */}
                    {productFormTab === 'nutrition' && (
                      <div className="p-4 space-y-3 text-xs">
                        <span className="font-bold text-[#1d2327] block">
                          Nutritional Breakdown (per serving)
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {['protein', 'carbs', 'fats', 'energy', 'bcaa', 'servingSize'].map((nKey) => (
                            <div key={nKey}>
                              <label className="font-bold uppercase text-[10px] text-[#646970] block mb-1">
                                {nKey}
                              </label>
                              <input
                                type="text"
                                value={(editingProduct.nutrition as any)?.[nKey] || ''}
                                onChange={(e) =>
                                  setEditingProduct({
                                    ...editingProduct,
                                    nutrition: {
                                      ...editingProduct.nutrition,
                                      [nKey]: e.target.value,
                                    },
                                  })
                                }
                                placeholder={nKey === 'protein' ? '30g' : nKey === 'energy' ? '160 kcal' : 'Amount'}
                                className="w-full px-2.5 py-1.5 border border-[#8c8f94] rounded-sm font-mono"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tab 6: Free Gifts & B2G1 Perks */}
                    {productFormTab === 'gifts' && (
                      <div className="p-4 space-y-4 text-xs">
                        <div>
                          <label className="block font-bold text-[#2c3338] mb-1">
                            Free Gift Promotion Callout
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Free 700ml Gym Shaker (₹499)"
                            value={editingProduct.hasFreeGift || ''}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                hasFreeGift: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm"
                          />
                        </div>

                        <div className="pt-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editingProduct.isBestseller ?? false}
                              onChange={(e) =>
                                setEditingProduct({
                                  ...editingProduct,
                                  isBestseller: e.target.checked,
                                })
                              }
                              className="w-4 h-4 text-[#2271b1] rounded-sm"
                            />
                            <span className="font-bold text-[#1d2327]">
                              Feature as Best Seller on homepage showcase
                            </span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right 4 Columns: Publish Box & Category Selection */}
                <div className="lg:col-span-4 space-y-4">
                  {/* Publish Meta Box */}
                  <div className="bg-white border border-[#c3c4c7] rounded-sm shadow-xs overflow-hidden">
                    <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-4 py-2.5 font-bold text-xs text-[#1d2327] uppercase">
                      Publish Status
                    </div>
                    <div className="p-4 space-y-3 text-xs">
                      <div className="flex items-center justify-between text-[#646970]">
                        <span>Status:</span>
                        <strong className="text-emerald-700">Published (MySQL)</strong>
                      </div>
                      <div className="flex items-center justify-between text-[#646970]">
                        <span>Visibility:</span>
                        <strong className="text-[#1d2327]">Public</strong>
                      </div>
                      <div className="border-t border-[#f0f0f1] pt-3 flex items-center justify-between">
                        {currentPage === 'product-edit' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(editingProduct.id, editingProduct.name)}
                            className="text-[#d63638] font-semibold hover:underline cursor-pointer"
                          >
                            Delete Product
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleSaveProduct}
                          disabled={isSaving}
                          className="px-4 py-2 bg-[#2271b1] hover:bg-[#135e96] text-white font-semibold rounded-sm shadow-xs cursor-pointer ml-auto"
                        >
                          {currentPage === 'product-add' ? 'Publish Now' : 'Update Now'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Product Featured Image Box */}
                  <div className="bg-white border border-[#c3c4c7] rounded-sm shadow-xs overflow-hidden">
                    <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-4 py-2.5 font-bold text-xs text-[#1d2327] uppercase">
                      Featured Product Image
                    </div>
                    <div className="p-4 space-y-3 text-xs">
                      {editingProduct.image && (
                        <div className="relative aspect-square w-full rounded border border-[#c3c4c7] overflow-hidden bg-white">
                          <img
                            src={editingProduct.image}
                            alt="Featured preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-[11px] font-bold text-[#646970] mb-1">
                          Image URL
                        </label>
                        <input
                          type="text"
                          value={editingProduct.image}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, image: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 border border-[#8c8f94] rounded-sm font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Product Category Box */}
                  <div className="bg-white border border-[#c3c4c7] rounded-sm shadow-xs overflow-hidden">
                    <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-4 py-2.5 font-bold text-xs text-[#1d2327] uppercase">
                      Assigned Category
                    </div>
                    <div className="p-4 space-y-2 text-xs">
                      {categories.map((c) => (
                        <label
                          key={c.id}
                          className="flex items-center gap-2 cursor-pointer hover:bg-[#f6f7f7] p-1 rounded"
                        >
                          <input
                            type="radio"
                            name="category"
                            checked={editingProduct.category === c.name}
                            onChange={() =>
                              setEditingProduct({ ...editingProduct, category: c.name })
                            }
                            className="text-[#2271b1]"
                          />
                          <span className="text-[#2c3338] font-medium">
                            {c.icon} {c.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              PAGE: ORDERS (ORDERS LIST)
          ================================================================= */}
          {currentPage === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#c3c4c7] pb-3">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-[#1d2327]">Orders</h1>
                  <button
                    onClick={() => setCurrentPage('pos-order')}
                    className="px-2.5 py-1 bg-white border border-[#2271b1] text-[#2271b1] hover:bg-[#2271b1] hover:text-white text-xs font-semibold rounded-sm transition-colors cursor-pointer shadow-xs"
                  >
                    Add Order (POS)
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExportCSV('orders')}
                    className="px-3 py-1.5 bg-white border border-[#c3c4c7] text-[#2c3338] text-xs font-semibold rounded-sm hover:border-[#2271b1] flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Status Filter */}
              <div className="bg-white border border-[#c3c4c7] p-3 rounded-sm shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-[#8c8f94]" />
                  <input
                    type="text"
                    placeholder="Search by Order ID, customer name or email..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#8c8f94] focus:border-[#2271b1] rounded-sm text-xs"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-[#646970] font-semibold">Status:</label>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="px-2.5 py-1.5 border border-[#8c8f94] rounded-sm text-xs bg-white"
                  >
                    <option value="all">All Orders ({orders.length})</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="packed">Packed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-white border border-[#c3c4c7] rounded-sm shadow-xs overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#f6f7f7] border-b border-[#c3c4c7] text-[11px] font-bold text-[#2c3338] uppercase">
                      <th className="py-2.5 px-3">Order ID</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Payment</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Total (₹)</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f0f1]">
                    {filteredOrders.map((o) => (
                      <tr key={o.orderId} className="hover:bg-[#fcfcfc] transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#2271b1]">
                          <button
                            onClick={() => handleOpenOrderDetail(o)}
                            className="hover:underline cursor-pointer"
                          >
                            {o.orderId}
                          </button>
                        </td>
                        <td className="py-2.5 px-3 text-[#646970]">{o.createdAt}</td>
                        <td className="py-2.5 px-3 font-semibold text-[#1d2327]">
                          {o.customerName}
                          <div className="text-[11px] text-[#646970] font-normal">{o.customerEmail}</div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[#646970]">{o.paymentMethod}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              o.orderStatus === 'delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : o.orderStatus === 'cancelled'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {o.orderStatus}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-[#1d2327]">
                          ₹{o.totalAmount.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleOpenOrderDetail(o)}
                            className="px-2.5 py-1 bg-white border border-[#c3c4c7] hover:border-[#2271b1] text-[#2271b1] font-semibold text-xs rounded-sm shadow-xs cursor-pointer"
                          >
                            View Order & Invoice
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =================================================================
              PAGE: ORDER DETAIL & GST TAX INVOICE (DEDICATED FULL-PAGE)
          ================================================================= */}
          {currentPage === 'order-detail' && selectedOrder && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#c3c4c7] pb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage('orders')}
                    className="text-xs text-[#2271b1] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Orders</span>
                  </button>
                  <span className="text-[#8c8f94]">/</span>
                  <h1 className="text-xl font-bold text-[#1d2327]">
                    Order #{selectedOrder.orderId}
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-white border border-[#c3c4c7] text-[#2c3338] text-xs font-semibold rounded-sm hover:border-[#2271b1] flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Invoice</span>
                  </button>
                </div>
              </div>

              {/* Status Pipeline Transition Ribbon */}
              <div className="bg-white border border-[#c3c4c7] p-4 rounded-sm shadow-xs">
                <div className="text-xs font-bold text-[#646970] uppercase mb-2">
                  Order Status Pipeline
                </div>
                <div className="flex flex-wrap gap-2">
                  {['confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'].map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() =>
                          adminPost(
                            '/api/admin/orders/update-status',
                            {
                              orderId: selectedOrder.orderId,
                              status: st,
                              courierName: orderCourierInput,
                              trackingNumber: orderAwbInput,
                            },
                            `Order ${selectedOrder.orderId} moved to ${st}`
                          )
                        }
                        className={`px-3 py-1.5 rounded-sm text-xs font-bold uppercase transition-all cursor-pointer ${
                          selectedOrder.orderStatus === st
                            ? 'bg-[#2271b1] text-white'
                            : 'bg-[#f6f7f7] text-[#2c3338] hover:bg-[#e0e0e0]'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Printable Invoice & Customer Details Box */}
              <div className="bg-white border border-[#c3c4c7] p-6 rounded-sm shadow-xs space-y-6">
                <div className="flex items-start justify-between border-b border-[#c3c4c7] pb-4">
                  <div>
                    <h2 className="text-2xl font-black text-[#1d2327]">
                      {settings.shippingAndTax.companyName}
                    </h2>
                    <p className="text-xs text-[#646970] mt-1">
                      {settings.shippingAndTax.roasteryAddress}
                    </p>
                    <p className="text-xs font-mono font-bold text-[#1d2327] mt-1">
                      GSTIN: {settings.shippingAndTax.gstIn} · FSSAI: {settings.shippingAndTax.fssaiLicense}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold uppercase text-[#646970]">Tax Invoice</span>
                    <div className="text-lg font-bold font-mono text-[#2271b1]">
                      {selectedOrder.orderId}
                    </div>
                    <div className="text-xs text-[#646970]">Date: {selectedOrder.createdAt}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#f6f7f7] p-4 rounded-sm border border-[#c3c4c7] text-xs">
                  <div>
                    <div className="font-bold text-[#646970] uppercase text-[10px]">
                      Customer Details & Shipping
                    </div>
                    <div className="font-bold text-sm text-[#1d2327] mt-1">
                      {selectedOrder.customerName}
                    </div>
                    <div className="text-[#2c3338]">{selectedOrder.shippingAddress?.addressLine1}</div>
                    <div className="text-[#2c3338]">
                      {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} -{' '}
                      {selectedOrder.shippingAddress?.postalCode}
                    </div>
                    <div className="text-[#646970] mt-1">Email: {selectedOrder.customerEmail}</div>
                    <div className="text-[#646970]">Phone: {selectedOrder.customerPhone}</div>
                  </div>

                  <div>
                    <div className="font-bold text-[#646970] uppercase text-[10px]">
                      Courier & Shipment Tracking
                    </div>
                    <div className="space-y-2 mt-1">
                      <div>
                        <label className="text-[11px] font-semibold text-[#646970] block">Courier Name</label>
                        <input
                          type="text"
                          value={orderCourierInput}
                          onChange={(e) => setOrderCourierInput(e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-[#8c8f94] rounded-sm text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-[#646970] block">Tracking AWB</label>
                        <input
                          type="text"
                          value={orderAwbInput}
                          onChange={(e) => setOrderAwbInput(e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-[#8c8f94] rounded-sm font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Line Items Table */}
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#c3c4c7] bg-[#f6f7f7] text-[10px] font-bold uppercase text-[#646970]">
                      <th className="py-2 px-3">Item Description</th>
                      <th className="py-2 px-3 text-center">Qty</th>
                      <th className="py-2 px-3 text-right">Unit Price</th>
                      <th className="py-2 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f0f1]">
                    {(selectedOrder.items || []).map((it: any, i: number) => (
                      <tr key={i}>
                        <td className="py-2.5 px-3 font-bold text-[#1d2327]">
                          {it.product?.name || 'Nutrition Staple'} ({it.selectedSize})
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">{it.quantity}</td>
                        <td className="py-2.5 px-3 text-right font-mono">₹{it.unitPrice}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#1d2327]">
                          ₹{(it.unitPrice * it.quantity).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="border-t border-[#c3c4c7] pt-4 flex justify-between items-center text-xs">
                  <div className="text-[#646970]">
                    Computer generated GST invoice with {settings.shippingAndTax.gstPercent}% GST.
                  </div>
                  <div className="text-right font-mono text-base font-black text-[#1d2327]">
                    Grand Total: ₹{selectedOrder.totalAmount.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              PAGE: MANUAL POS ORDER CREATOR
          ================================================================= */}
          {currentPage === 'pos-order' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-[#c3c4c7] pb-3">
                <button
                  onClick={() => setCurrentPage('orders')}
                  className="text-xs text-[#2271b1] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Orders</span>
                </button>
                <span className="text-[#8c8f94]">/</span>
                <h1 className="text-xl font-bold text-[#1d2327]">Add New Order (Manual POS)</h1>
              </div>

              <div className="bg-white border border-[#c3c4c7] p-6 rounded-sm shadow-xs max-w-2xl space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-[#2c3338] mb-1">Customer Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Vikram Sharma"
                      value={posCustomerName}
                      onChange={(e) => setPosCustomerName(e.target.value)}
                      className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#2c3338] mb-1">Customer Email *</label>
                    <input
                      type="email"
                      placeholder="e.g. vikram@gmail.com"
                      value={posCustomerEmail}
                      onChange={(e) => setPosCustomerEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-[#2c3338] mb-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+91 98200 12345"
                      value={posCustomerPhone}
                      onChange={(e) => setPosCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#2c3338] mb-1">City</label>
                    <input
                      type="text"
                      value={posCity}
                      onChange={(e) => setPosCity(e.target.value)}
                      className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#2c3338] mb-1">Postal Pincode</label>
                    <input
                      type="text"
                      value={posPincode}
                      onChange={(e) => setPosPincode(e.target.value)}
                      className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#2c3338] mb-1">Street Address</label>
                  <input
                    type="text"
                    value={posAddress}
                    onChange={(e) => setPosAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-[#2c3338] mb-1">Select Product SKU</label>
                    <select
                      value={posProductId || (products[0]?.id ?? '')}
                      onChange={(e) => setPosProductId(e.target.value)}
                      className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm bg-white"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — ₹{p.price}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-[#2c3338] mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={posQty}
                      onChange={(e) => setPosQty(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#2c3338] mb-1">Payment Method</label>
                  <select
                    value={posPaymentMethod}
                    onChange={(e) => setPosPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm bg-white"
                  >
                    <option value="UPI">UPI Instant (GPay / PhonePe / Paytm)</option>
                    <option value="Card">Credit / Debit Card</option>
                    <option value="NetBanking">Net Banking</option>
                    <option value="COD">Cash On Delivery (COD)</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-[#c3c4c7]">
                  <button
                    onClick={() => {
                      if (!posCustomerName || !posCustomerEmail) {
                        showToast('Customer name and email are required', 'error');
                        return;
                      }
                      adminPost(
                        '/api/admin/orders/create-pos',
                        {
                          customerName: posCustomerName,
                          customerEmail: posCustomerEmail,
                          customerPhone: posCustomerPhone,
                          shippingAddress: {
                            addressLine1: posAddress,
                            city: posCity,
                            state: 'Maharashtra',
                            postalCode: posPincode,
                            country: 'India',
                          },
                          productId: posProductId || products[0]?.id,
                          quantity: posQty,
                          paymentMethod: posPaymentMethod,
                        },
                        'Manual POS order saved to MySQL!'
                      );
                      setCurrentPage('orders');
                    }}
                    className="px-5 py-2.5 bg-[#2271b1] hover:bg-[#135e96] text-white font-semibold rounded-sm cursor-pointer shadow-xs"
                  >
                    Save & Generate Order
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              PAGE: CATEGORIES (CLASSIC WORDPRESS TAXONOMY 2-COLUMN VIEW)
          ================================================================= */}
          {currentPage === 'categories' && (
            <div className="space-y-4">
              <div className="border-b border-[#c3c4c7] pb-3">
                <h1 className="text-2xl font-bold text-[#1d2327]">Product Categories</h1>
                <p className="text-xs text-[#646970]">
                  Manage storefront category cards, icons, slugs and badges.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Left 4 cols: Add Category Form */}
                <div className="md:col-span-4 bg-white border border-[#c3c4c7] p-4 rounded-sm shadow-xs space-y-3 text-xs">
                  <div className="font-bold text-sm text-[#1d2327]">Add New Category</div>
                  <div>
                    <label className="block font-semibold text-[#646970] mb-1">Category Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Protein Muesli"
                      value={newCategory.name}
                      onChange={(e) =>
                        setNewCategory({
                          ...newCategory,
                          name: e.target.value,
                          id: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                        })
                      }
                      className="w-full px-3 py-1.5 border border-[#8c8f94] rounded-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#646970] mb-1">Slug / Identifier</label>
                    <input
                      type="text"
                      value={newCategory.id}
                      onChange={(e) => setNewCategory({ ...newCategory, id: e.target.value })}
                      className="w-full px-3 py-1.5 border border-[#8c8f94] rounded-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#646970] mb-1">Emoji Icon</label>
                    <input
                      type="text"
                      value={newCategory.icon}
                      onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                      className="w-full px-3 py-1.5 border border-[#8c8f94] rounded-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#646970] mb-1">Badge Callout</label>
                    <input
                      type="text"
                      value={newCategory.badge || ''}
                      onChange={(e) => setNewCategory({ ...newCategory, badge: e.target.value })}
                      placeholder="e.g. Popular, New"
                      className="w-full px-3 py-1.5 border border-[#8c8f94] rounded-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#646970] mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={newCategory.description}
                      onChange={(e) =>
                        setNewCategory({ ...newCategory, description: e.target.value })
                      }
                      className="w-full px-3 py-1.5 border border-[#8c8f94] rounded-sm"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (!newCategory.name) return;
                      const next = [...categories, newCategory];
                      adminPost(
                        '/api/admin/categories/save',
                        { categories: next },
                        `Added category ${newCategory.name}`
                      );
                      setNewCategory({ id: '', name: '', icon: '🥜', description: '', badge: '' });
                    }}
                    className="w-full py-2 bg-[#2271b1] hover:bg-[#135e96] text-white font-semibold rounded-sm cursor-pointer shadow-xs"
                  >
                    Add Category
                  </button>
                </div>

                {/* Right 8 cols: Categories Table */}
                <div className="md:col-span-8 bg-white border border-[#c3c4c7] rounded-sm shadow-xs overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#f6f7f7] border-b border-[#c3c4c7] text-[11px] font-bold text-[#2c3338] uppercase">
                        <th className="py-2.5 px-3">Icon</th>
                        <th className="py-2.5 px-3">Name</th>
                        <th className="py-2.5 px-3">Slug</th>
                        <th className="py-2.5 px-3">Badge</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0f0f1]">
                      {categories.map((c) => (
                        <tr key={c.id} className="hover:bg-[#fcfcfc]">
                          <td className="py-2.5 px-3 text-lg">{c.icon}</td>
                          <td className="py-2.5 px-3 font-semibold text-[#1d2327]">{c.name}</td>
                          <td className="py-2.5 px-3 font-mono text-[#646970]">{c.id}</td>
                          <td className="py-2.5 px-3">
                            {c.badge && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#eaf4ec] text-[#00632d]">
                                {c.badge}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => {
                                if (categories.length <= 1) return;
                                const next = categories.filter((item) => item.id !== c.id);
                                adminPost(
                                  '/api/admin/categories/save',
                                  { categories: next },
                                  `Deleted category ${c.name}`
                                );
                              }}
                              className="text-[#d63638] font-semibold hover:underline cursor-pointer"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              PAGE: BUNDLES (STORE ESSENTIALS & COMBO KITS)
          ================================================================= */}
          {currentPage === 'bundles' && (
            <div className="space-y-4">
              <div className="border-b border-[#c3c4c7] pb-3">
                <h1 className="text-2xl font-bold text-[#1d2327]">Store Essentials & Bundles</h1>
                <p className="text-xs text-[#646970]">
                  Manage curated combo starter kits, routine packs, and bundle discount pricing.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {bundles.map((b, idx) => (
                  <div
                    key={b.id || idx}
                    className="bg-white border border-[#c3c4c7] rounded-sm shadow-xs p-4 space-y-3 text-xs"
                  >
                    <img
                      src={b.image}
                      alt={b.name}
                      className="w-full h-36 object-cover rounded border border-[#c3c4c7]"
                    />
                    <div>
                      <div className="font-bold text-[#1d2327] text-sm">{b.name}</div>
                      <div className="text-[11px] text-[#646970] mt-0.5">{b.description}</div>
                    </div>
                    <div className="flex items-center justify-between font-mono pt-2 border-t border-[#f0f0f1]">
                      <div>
                        <span className="font-bold text-base text-[#1d2327]">₹{b.price}</span>
                        <span className="line-through text-[#8c8f94] ml-1.5 text-xs">
                          ₹{b.originalPrice}
                        </span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#eaf4ec] text-[#00632d]">
                        {b.discountPercent}% OFF
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =================================================================
              PAGE: INVENTORY (STOCK LEDGER & BATCH UPDATER)
          ================================================================= */}
          {currentPage === 'inventory' && (
            <div className="space-y-4">
              <div className="border-b border-[#c3c4c7] pb-3">
                <h1 className="text-2xl font-bold text-[#1d2327]">Stock & Inventory Manager</h1>
                <p className="text-xs text-[#646970]">
                  Track live SKU counts, adjust stock levels, and audit warehouse inventory movements.
                </p>
              </div>

              {/* SKU Batch Updater Table */}
              <div className="bg-white border border-[#c3c4c7] rounded-sm shadow-xs overflow-hidden">
                <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-4 py-2.5 font-bold text-xs text-[#1d2327] uppercase">
                  Batch SKU Stock Adjuster
                </div>
                <div className="p-4 overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#c3c4c7] text-[#646970] font-bold uppercase text-[10px]">
                        <th className="py-2 px-3">Product Name</th>
                        <th className="py-2 px-3">Category</th>
                        <th className="py-2 px-3">Current Stock</th>
                        <th className="py-2 px-3">Quick Adjust</th>
                        <th className="py-2 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0f0f1]">
                      {products.map((p) => (
                        <tr key={p.id}>
                          <td className="py-2.5 px-3 font-semibold text-[#1d2327]">{p.name}</td>
                          <td className="py-2.5 px-3 text-[#646970]">{p.category}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-[#1d2327]">
                            {p.stockQuantity ?? 100} units
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() =>
                                  adminPost(
                                    '/api/admin/inventory/batch-update',
                                    {
                                      productId: p.id,
                                      changeAmount: 25,
                                      reason: 'Batch Restock (+25)',
                                    },
                                    `Added 25 units to ${p.name}`
                                  )
                                }
                                className="px-2 py-1 bg-white border border-[#c3c4c7] hover:border-[#2271b1] text-xs font-semibold rounded cursor-pointer"
                              >
                                +25
                              </button>
                              <button
                                onClick={() =>
                                  adminPost(
                                    '/api/admin/inventory/batch-update',
                                    {
                                      productId: p.id,
                                      changeAmount: 50,
                                      reason: 'Batch Restock (+50)',
                                    },
                                    `Added 50 units to ${p.name}`
                                  )
                                }
                                className="px-2 py-1 bg-white border border-[#c3c4c7] hover:border-[#2271b1] text-xs font-semibold rounded cursor-pointer"
                              >
                                +50
                              </button>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {(p.stockQuantity ?? 100) <= (p.lowStockThreshold ?? 20) ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                                Low Stock Alert
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Healthy
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              PAGE: RETURNS & REFUNDS (RMA QUEUE)
          ================================================================= */}
          {currentPage === 'returns' && (
            <div className="space-y-4">
              <div className="border-b border-[#c3c4c7] pb-3">
                <h1 className="text-2xl font-bold text-[#1d2327]">Returns & Refunds Queue</h1>
                <p className="text-xs text-[#646970]">
                  Process customer returns, replacement requests, and refund approvals.
                </p>
              </div>

              <div className="bg-white border border-[#c3c4c7] rounded-sm shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#f6f7f7] border-b border-[#c3c4c7] text-[11px] font-bold text-[#2c3338] uppercase">
                      <th className="py-2.5 px-3">Return ID</th>
                      <th className="py-2.5 px-3">Order ID</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Reason</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f0f1]">
                    {returns.map((r) => (
                      <tr key={r.id} className="hover:bg-[#fcfcfc]">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#2271b1]">{r.id}</td>
                        <td className="py-2.5 px-3 font-mono">{r.orderId}</td>
                        <td className="py-2.5 px-3 font-semibold">{r.customerName}</td>
                        <td className="py-2.5 px-3 text-[#646970]">{r.reason}</td>
                        <td className="py-2.5 px-3 font-mono font-bold">₹{r.refundAmount}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              r.status === 'refunded'
                                ? 'bg-emerald-100 text-emerald-800'
                                : r.status === 'rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {r.status === 'pending' && (
                            <button
                              onClick={() =>
                                adminPost(
                                  '/api/admin/returns/update',
                                  { returnId: r.id, status: 'approved' },
                                  `Approved return ${r.id}`
                                )
                              }
                              className="px-2 py-1 bg-[#2271b1] text-white rounded font-semibold cursor-pointer"
                            >
                              Approve Refund
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =================================================================
              PAGE: ABANDONED CARTS
          ================================================================= */}
          {currentPage === 'abandoned' && (
            <div className="space-y-4">
              <div className="border-b border-[#c3c4c7] pb-3">
                <h1 className="text-2xl font-bold text-[#1d2327]">Abandoned Carts</h1>
                <p className="text-xs text-[#646970]">
                  High-intent shoppers who left checkout before payment.
                </p>
              </div>

              <div className="bg-white border border-[#c3c4c7] rounded-sm shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#f6f7f7] border-b border-[#c3c4c7] text-[11px] font-bold text-[#2c3338] uppercase">
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Contact</th>
                      <th className="py-2.5 px-3">Cart Value</th>
                      <th className="py-2.5 px-3">Items</th>
                      <th className="py-2.5 px-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f0f1]">
                    {abandonedCarts.map((c) => (
                      <tr key={c.id}>
                        <td className="py-2.5 px-3 font-semibold text-[#1d2327]">
                          {c.customerName || 'Anonymous Shopper'}
                        </td>
                        <td className="py-2.5 px-3 text-[#646970]">
                          {c.customerEmail || c.sessionId} {c.customerPhone && `· ${c.customerPhone}`}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold">₹{c.subtotal}</td>
                        <td className="py-2.5 px-3 font-mono">{(c.items || []).length} items</td>
                        <td className="py-2.5 px-3 text-[#646970]">{c.updatedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =================================================================
              PAGE: CUSTOMERS CRM & LOYALTY POINTS
          ================================================================= */}
          {currentPage === 'customers' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#c3c4c7] pb-3">
                <div>
                  <h1 className="text-2xl font-bold text-[#1d2327]">Customers & CRM</h1>
                  <p className="text-xs text-[#646970]">
                    Customer profiles, order frequency, and loyalty points adjustment.
                  </p>
                </div>
                <button
                  onClick={() => handleExportCSV('customers')}
                  className="px-3 py-1.5 bg-white border border-[#c3c4c7] text-[#2c3338] text-xs font-semibold rounded-sm hover:border-[#2271b1] flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Customers CSV</span>
                </button>
              </div>

              <div className="bg-white border border-[#c3c4c7] rounded-sm shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#f6f7f7] border-b border-[#c3c4c7] text-[11px] font-bold text-[#2c3338] uppercase">
                      <th className="py-2.5 px-3">Customer Name</th>
                      <th className="py-2.5 px-3">Email & Phone</th>
                      <th className="py-2.5 px-3">Loyalty Points</th>
                      <th className="py-2.5 px-3">Lifetime Spent</th>
                      <th className="py-2.5 px-3 text-right">Adjust Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f0f1]">
                    {customers.map((c) => {
                      const userKey = c.firebaseUid || String(c.id || c.email);
                      return (
                        <tr key={userKey} className="hover:bg-[#fcfcfc]">
                          <td className="py-2.5 px-3 font-semibold text-[#1d2327]">{c.displayName || 'Customer'}</td>
                          <td className="py-2.5 px-3 text-[#646970]">
                            {c.email} {c.phone && `· ${c.phone}`}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                            {c.loyaltyPoints || 0} pts
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold">
                            ₹{(c.totalSpent || 0).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right space-x-1">
                            <button
                              onClick={() =>
                                adminPost(
                                  '/api/admin/customers/update-points',
                                  { uid: userKey, delta: 100 },
                                  `Awarded +100 points to ${c.displayName || c.email}`
                                )
                              }
                              className="px-2 py-0.5 bg-white border border-[#c3c4c7] hover:border-emerald-600 text-emerald-700 font-bold rounded cursor-pointer"
                            >
                              +100
                            </button>
                            <button
                              onClick={() =>
                                adminPost(
                                  '/api/admin/customers/update-points',
                                  { uid: userKey, delta: -50 },
                                  `Deducted 50 points from ${c.displayName || c.email}`
                                )
                              }
                              className="px-2 py-0.5 bg-white border border-[#c3c4c7] hover:border-rose-600 text-rose-700 font-bold rounded cursor-pointer"
                            >
                              -50
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =================================================================
              PAGE: PRODUCT REVIEWS MODERATION
          ================================================================= */}
          {currentPage === 'reviews' && (
            <div className="space-y-4">
              <div className="border-b border-[#c3c4c7] pb-3">
                <h1 className="text-2xl font-bold text-[#1d2327]">Product Reviews Moderation</h1>
                <p className="text-xs text-[#646970]">
                  Approve, pin to top, or remove verified customer reviews.
                </p>
              </div>

              <div className="bg-white border border-[#c3c4c7] rounded-sm shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#f6f7f7] border-b border-[#c3c4c7] text-[11px] font-bold text-[#2c3338] uppercase">
                      <th className="py-2.5 px-3">Product</th>
                      <th className="py-2.5 px-3">Reviewer</th>
                      <th className="py-2.5 px-3">Rating</th>
                      <th className="py-2.5 px-3">Comment</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f0f1]">
                    {reviews.map((r) => (
                      <tr key={r.id} className="hover:bg-[#fcfcfc]">
                        <td className="py-2.5 px-3 font-semibold text-[#1d2327]">
                          {r.productId}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-[#1d2327]">{r.userName}</div>
                          <div className="text-[10px] text-[#646970]">{r.date}</div>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-amber-600">
                          ★ {r.rating}.0
                        </td>
                        <td className="py-2.5 px-3 text-[#2c3338] max-w-xs">{r.comment}</td>
                        <td className="py-2.5 px-3 text-right space-x-1.5">
                          <button
                            onClick={() =>
                              adminPost(
                                '/api/admin/reviews/action',
                                { id: r.id, action: 'pin' },
                                `Toggled pin for review #${r.id}`
                              )
                            }
                            className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer ${
                              r.isPinned ? 'bg-amber-100 text-amber-800' : 'bg-white border border-[#c3c4c7]'
                            }`}
                          >
                            {r.isPinned ? 'Pinned' : 'Pin'}
                          </button>
                          <button
                            onClick={() =>
                              adminPost(
                                '/api/admin/reviews/action',
                                { id: r.id, action: 'delete' },
                                `Deleted review #${r.id}`
                              )
                            }
                            className="text-[#d63638] font-semibold hover:underline cursor-pointer"
                          >
                            Trash
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =================================================================
              PAGE: SUPPORT DESK (/contact TICKETS)
          ================================================================= */}
          {currentPage === 'tickets' && (
            <div className="space-y-4">
              <div className="border-b border-[#c3c4c7] pb-3">
                <h1 className="text-2xl font-bold text-[#1d2327]">Customer Support Desk</h1>
                <p className="text-xs text-[#646970]">
                  Live inquiries and help tickets submitted via the /contact storefront page.
                </p>
              </div>

              <div className="bg-white border border-[#c3c4c7] rounded-sm shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#f6f7f7] border-b border-[#c3c4c7] text-[11px] font-bold text-[#2c3338] uppercase">
                      <th className="py-2.5 px-3">Ticket ID</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Subject</th>
                      <th className="py-2.5 px-3">Message</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f0f1]">
                    {supportTickets.map((t) => (
                      <tr key={t.id} className="hover:bg-[#fcfcfc]">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#2271b1]">{t.id}</td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-[#1d2327]">{t.name}</div>
                          <div className="text-[11px] text-[#646970]">{t.email}</div>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-[#1d2327]">{t.subject}</td>
                        <td className="py-2.5 px-3 text-[#2c3338] max-w-xs">{t.message}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              t.status === 'resolved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {t.status !== 'resolved' && (
                            <button
                              onClick={() =>
                                adminPost(
                                  '/api/admin/support/reply',
                                  {
                                    id: t.id,
                                    reply: 'Thank you for reaching out! Your query has been resolved by our support team.',
                                  },
                                  `Resolved ticket #${t.id}`
                                )
                              }
                              className="px-2.5 py-1 bg-[#2271b1] text-white rounded font-semibold cursor-pointer"
                            >
                              Mark Resolved
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =================================================================
              PAGE: NEWSLETTER SUBSCRIBERS
          ================================================================= */}
          {currentPage === 'subscribers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#c3c4c7] pb-3">
                <div>
                  <h1 className="text-2xl font-bold text-[#1d2327]">Newsletter Subscribers</h1>
                  <p className="text-xs text-[#646970]">
                    Opt-in email leads captured from the storefront footer.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-[#c3c4c7] rounded-sm shadow-xs p-4">
                <div className="divide-y divide-[#f0f0f1] text-xs">
                  {subscribers.map((s) => (
                    <div key={s.id} className="py-2.5 flex items-center justify-between">
                      <div className="font-semibold text-[#1d2327]">{s.email}</div>
                      <div className="text-[#646970] font-mono text-[11px]">{s.createdAt}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              PAGE: COUPONS & PROMOS
          ================================================================= */}
          {currentPage === 'coupons' && (
            <div className="space-y-4">
              <div className="border-b border-[#c3c4c7] pb-3">
                <h1 className="text-2xl font-bold text-[#1d2327]">Coupons & Discounts</h1>
                <p className="text-xs text-[#646970]">
                  Configure promo codes, percentage/flat discounts, and minimum order rules.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Add Coupon Form */}
                <div className="md:col-span-4 bg-white border border-[#c3c4c7] p-4 rounded-sm shadow-xs space-y-3 text-xs">
                  <div className="font-bold text-sm text-[#1d2327]">Create New Coupon</div>
                  <div>
                    <label className="block font-semibold text-[#646970] mb-1">Coupon Code *</label>
                    <input
                      type="text"
                      placeholder="e.g. FIT20"
                      value={newCoupon.code}
                      onChange={(e) =>
                        setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })
                      }
                      className="w-full px-3 py-1.5 border border-[#8c8f94] rounded-sm font-mono font-bold uppercase"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#646970] mb-1">Discount Type</label>
                    <select
                      value={newCoupon.discountType}
                      onChange={(e) =>
                        setNewCoupon({ ...newCoupon, discountType: e.target.value as any })
                      }
                      className="w-full px-3 py-1.5 border border-[#8c8f94] rounded-sm bg-white"
                    >
                      <option value="PERCENT">Percentage Discount (%)</option>
                      <option value="FLAT">Flat Discount (₹)</option>
                      <option value="FREE_SHIPPING">Free Shipping</option>
                      <option value="B2G1">Buy 2 Get 1 FREE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-[#646970] mb-1">Discount Value</label>
                    <input
                      type="number"
                      value={newCoupon.discountValue}
                      onChange={(e) =>
                        setNewCoupon({ ...newCoupon, discountValue: Number(e.target.value) })
                      }
                      className="w-full px-3 py-1.5 border border-[#8c8f94] rounded-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#646970] mb-1">Min Order Amount (₹)</label>
                    <input
                      type="number"
                      value={newCoupon.minOrderAmount}
                      onChange={(e) =>
                        setNewCoupon({ ...newCoupon, minOrderAmount: Number(e.target.value) })
                      }
                      className="w-full px-3 py-1.5 border border-[#8c8f94] rounded-sm font-mono"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (!newCoupon.code) return;
                      const next = [...coupons, newCoupon];
                      adminPost('/api/admin/coupons/save', { coupons: next }, `Saved coupon ${newCoupon.code}`);
                      setNewCoupon({
                        code: '',
                        description: '',
                        discountType: 'PERCENT',
                        discountValue: 15,
                        minOrderAmount: 499,
                        maxDiscount: 500,
                        freeGiftName: '',
                        usageLimit: 500,
                        usedCount: 0,
                        isActive: true,
                        expiresAt: '2027-12-31',
                      });
                    }}
                    className="w-full py-2 bg-[#2271b1] hover:bg-[#135e96] text-white font-semibold rounded-sm cursor-pointer shadow-xs"
                  >
                    Add Coupon
                  </button>
                </div>

                {/* Coupons Table */}
                <div className="md:col-span-8 bg-white border border-[#c3c4c7] rounded-sm shadow-xs overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#f6f7f7] border-b border-[#c3c4c7] text-[11px] font-bold text-[#2c3338] uppercase">
                        <th className="py-2.5 px-3">Code</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Value</th>
                        <th className="py-2.5 px-3">Min Order</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0f0f1]">
                      {coupons.map((cp) => (
                        <tr key={cp.code} className="hover:bg-[#fcfcfc]">
                          <td className="py-2.5 px-3 font-mono font-bold text-[#1d2327]">{cp.code}</td>
                          <td className="py-2.5 px-3 font-semibold text-[#646970]">{cp.discountType}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                            {cp.discountType === 'PERCENT' ? `${cp.discountValue}%` : `₹${cp.discountValue}`}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[#646970]">₹{cp.minOrderAmount}</td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => {
                                const next = coupons.filter((item) => item.code !== cp.code);
                                adminPost('/api/admin/coupons/save', { coupons: next }, `Deleted coupon ${cp.code}`);
                              }}
                              className="text-[#d63638] font-semibold hover:underline cursor-pointer"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              PAGE: FLASH SALES
          ================================================================= */}
          {currentPage === 'flash-sales' && (
            <div className="space-y-4">
              <div className="border-b border-[#c3c4c7] pb-3">
                <h1 className="text-2xl font-bold text-[#1d2327]">Flash Sales & Campaign Banners</h1>
                <p className="text-xs text-[#646970]">
                  Time-bound marketing deals, countdown timers, and discount callouts.
                </p>
              </div>

              <div className="space-y-4">
                {flashSales.map((fs, idx) => (
                  <div
                    key={fs.id || idx}
                    className="bg-white border border-[#c3c4c7] p-5 rounded-sm shadow-xs space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#1d2327]">{fs.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#eaf4ec] text-[#00632d]">
                        {fs.bannerText || 'FLASH SALE'}
                      </span>
                    </div>
                    <div className="text-[#646970]">Ends: {fs.endsAt}</div>
                    <div className="font-mono text-[11px] text-[#2271b1]">
                      Discount: {fs.discountPercent}% OFF · Category: {fs.categoryFilter}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =================================================================
              PAGES: STOREFRONT CMS SECTIONS
          ================================================================= */}
          {currentPage === 'cms-hero' && (
            <div className="space-y-4">
              <div className="border-b border-[#c3c4c7] pb-3">
                <h1 className="text-2xl font-bold text-[#1d2327]">Hero Banner & Top Announcement</h1>
                <p className="text-xs text-[#646970]">
                  Changes reflect instantaneously on the live homepage hero and top bar.
                </p>
              </div>

              <div className="bg-white border border-[#c3c4c7] p-6 rounded-sm shadow-xs space-y-4 text-xs max-w-3xl">
                <div>
                  <label className="block font-bold text-[#2c3338] mb-1">
                    Top Announcement Bar Message
                  </label>
                  <input
                    type="text"
                    value={settings.topBar.text}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        topBar: { ...settings.topBar, text: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-[#2c3338] mb-1">Promo Coupon Code</label>
                    <input
                      type="text"
                      value={settings.topBar.couponCode}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          topBar: { ...settings.topBar, couponCode: e.target.value.toUpperCase() },
                        })
                      }
                      className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm font-mono uppercase font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#2c3338] mb-1">Hero Badge Text</label>
                    <input
                      type="text"
                      value={settings.hero.highlightBadge}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          hero: { ...settings.hero, highlightBadge: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-[#2c3338] mb-1">Headline Prefix</label>
                    <input
                      type="text"
                      value={settings.hero.headlinePrefix}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          hero: { ...settings.hero, headlinePrefix: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#2c3338] mb-1">Headline Highlight</label>
                    <input
                      type="text"
                      value={settings.hero.headlineHighlight}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          hero: { ...settings.hero, headlineHighlight: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#2c3338] mb-1">Hero Subheadline</label>
                  <textarea
                    rows={2}
                    value={settings.hero.subheadline}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        hero: { ...settings.hero, subheadline: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#2c3338] mb-1">Hero Highlight Product Image URL</label>
                  <input
                    type="text"
                    value={settings.hero.highlightImage}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        hero: { ...settings.hero, highlightImage: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm font-mono"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={() =>
                      adminPost(
                        '/api/admin/cms/hero',
                        { topBar: settings.topBar, hero: settings.hero },
                        'Saved Hero & Top Bar to MySQL!'
                      )
                    }
                    className="px-5 py-2 bg-[#2271b1] hover:bg-[#135e96] text-white font-semibold rounded-sm cursor-pointer shadow-xs"
                  >
                    Save Changes to Storefront
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentPage === 'cms-comparison' && (
            <div className="space-y-4">
              <div className="border-b border-[#c3c4c7] pb-3">
                <h1 className="text-2xl font-bold text-[#1d2327]">Comparison Matrix</h1>
                <p className="text-xs text-[#646970]">
                  Configure &quot;Theproteino vs The Rest&quot; comparison matrix rows.
                </p>
              </div>

              <div className="bg-white border border-[#c3c4c7] rounded-sm shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#f6f7f7] border-b border-[#c3c4c7] text-[11px] font-bold text-[#2c3338] uppercase">
                      <th className="py-2.5 px-3">Feature</th>
                      <th className="py-2.5 px-3 text-[#00632d]">Theproteino</th>
                      <th className="py-2.5 px-3 text-[#646970]">Ghar Ka Khaana</th>
                      <th className="py-2.5 px-3 text-rose-700">Junk / Ultra-Processed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f0f1]">
                    {comparisonRows.map((r) => (
                      <tr key={r.id}>
                        <td className="py-2.5 px-3 font-semibold text-[#1d2327]">{r.metric}</td>
                        <td className="py-2.5 px-3 font-bold text-[#00632d]">{r.theproteino}</td>
                        <td className="py-2.5 px-3 text-[#646970]">{r.gharKaKhaana}</td>
                        <td className="py-2.5 px-3 text-rose-700">{r.junkFood}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {currentPage === 'cms-counters' && (
            <div className="space-y-4">
              <div className="border-b border-[#c3c4c7] pb-3">
                <h1 className="text-2xl font-bold text-[#1d2327]">Live Milestone Counters</h1>
                <p className="text-xs text-[#646970]">
                  Real-time verified milestones (Protein delivered, Jars roasted, Happy customers).
                </p>
              </div>

              <div className="bg-white border border-[#c3c4c7] p-6 rounded-sm shadow-xs space-y-4 text-xs max-w-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-[#2c3338] mb-1">Headline Line 1</label>
                    <input
                      type="text"
                      value={settings.liveCounter.headlineLine1}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          liveCounter: { ...settings.liveCounter, headlineLine1: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#2c3338] mb-1">Headline Line 2</label>
                    <input
                      type="text"
                      value={settings.liveCounter.headlineLine2}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          liveCounter: { ...settings.liveCounter, headlineLine2: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block font-bold text-[#2c3338] mb-1">Stat 1 Label</label>
                    <input
                      type="text"
                      value={settings.liveCounter.stat1Label}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          liveCounter: { ...settings.liveCounter, stat1Label: e.target.value },
                        })
                      }
                      className="w-full px-2.5 py-1.5 border border-[#8c8f94] rounded-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#2c3338] mb-1">Stat 2 (Jars)</label>
                    <input
                      type="text"
                      value={settings.liveCounter.stat2Value}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          liveCounter: { ...settings.liveCounter, stat2Value: e.target.value },
                        })
                      }
                      className="w-full px-2.5 py-1.5 border border-[#8c8f94] rounded-sm font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#2c3338] mb-1">Stat 3 (Rating)</label>
                    <input
                      type="text"
                      value={settings.liveCounter.stat3Value}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          liveCounter: { ...settings.liveCounter, stat3Value: e.target.value },
                        })
                      }
                      className="w-full px-2.5 py-1.5 border border-[#8c8f94] rounded-sm font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() =>
                      adminPost(
                        '/api/admin/cms/counters',
                        { liveCounter: settings.liveCounter },
                        'Saved Milestone Counters to MySQL!'
                      )
                    }
                    className="px-5 py-2 bg-[#2271b1] hover:bg-[#135e96] text-white font-semibold rounded-sm cursor-pointer shadow-xs"
                  >
                    Save Counters
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentPage === 'cms-reels' && (
            <div className="space-y-4">
              <div className="border-b border-[#c3c4c7] pb-3">
                <h1 className="text-2xl font-bold text-[#1d2327]">Watch & Shop Vertical Video Reels</h1>
                <p className="text-xs text-[#646970]">
                  Manage community customer video reels linked directly to products.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {reels.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white border border-[#c3c4c7] rounded-sm p-3 shadow-xs space-y-2 text-xs"
                  >
                    <img
                      src={r.image}
                      alt={r.caption}
                      className="w-full aspect-[9/16] object-cover rounded border border-[#c3c4c7]"
                    />
                    <div className="font-bold text-[#1d2327] truncate">{r.caption}</div>
                    <div className="text-[11px] text-[#646970]">{r.creatorName} ({r.handle})</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentPage === 'cms-brand' && (
            <div className="space-y-4">
              <div className="border-b border-[#c3c4c7] pb-3">
                <h1 className="text-2xl font-bold text-[#1d2327]">Brand Story & Mission</h1>
                <p className="text-xs text-[#646970]">
                  Edit the homepage wave banner and roastery brand story copy.
                </p>
              </div>

              <div className="bg-white border border-[#c3c4c7] p-6 rounded-sm shadow-xs space-y-4 text-xs max-w-2xl">
                <div>
                  <label className="block font-bold text-[#2c3338] mb-1">Highlight Tag</label>
                  <input
                    type="text"
                    value={settings.brandStory.highlightTag}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        brandStory: { ...settings.brandStory, highlightTag: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#2c3338] mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={settings.brandStory.descriptionBefore}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        brandStory: { ...settings.brandStory, descriptionBefore: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm"
                  />
                </div>
                <button
                  onClick={() =>
                    adminPost(
                      '/api/admin/cms/brand-story',
                      { brandStory: settings.brandStory },
                      'Saved Brand Story to MySQL!'
                    )
                  }
                  className="px-5 py-2 bg-[#2271b1] hover:bg-[#135e96] text-white font-semibold rounded-sm cursor-pointer shadow-xs"
                >
                  Save Brand Story
                </button>
              </div>
            </div>
          )}

          {currentPage === 'cms-faqs' && (
            <div className="space-y-4">
              <div className="border-b border-[#c3c4c7] pb-3">
                <h1 className="text-2xl font-bold text-[#1d2327]">Frequently Asked Questions (FAQs)</h1>
                <p className="text-xs text-[#646970]">
                  Manage questions & answers displayed on storefront product and policy pages.
                </p>
              </div>

              <div className="space-y-3">
                {faqs.map((f) => (
                  <div
                    key={f.id}
                    className="bg-white border border-[#c3c4c7] p-4 rounded-sm shadow-xs space-y-1 text-xs"
                  >
                    <div className="font-bold text-[#1d2327]">{f.question}</div>
                    <div className="text-[#646970]">{f.answer}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentPage === 'cms-policies' && (
            <div className="space-y-4">
              <div className="border-b border-[#c3c4c7] pb-3">
                <h1 className="text-2xl font-bold text-[#1d2327]">Legal & Policy Pages</h1>
                <p className="text-xs text-[#646970]">
                  Edit Privacy Policy, Terms of Service, Refund Policy & Shipping Policy.
                </p>
              </div>

              <div className="space-y-3">
                {cmsPages.map((cp) => (
                  <div
                    key={cp.slug}
                    className="bg-white border border-[#c3c4c7] p-4 rounded-sm shadow-xs flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-[#1d2327] text-sm">{cp.title}</div>
                      <div className="text-[11px] text-[#646970] font-mono">/pages/{cp.slug}</div>
                    </div>
                    <span className="text-xs text-emerald-700 font-semibold">Active & Live</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentPage === 'cms-footer' && (
            <div className="space-y-4">
              <div className="border-b border-[#c3c4c7] pb-3">
                <h1 className="text-2xl font-bold text-[#1d2327]">Footer Configuration</h1>
                <p className="text-xs text-[#646970]">
                  Configure bio, newsletter callout, certificates, and copyright text.
                </p>
              </div>

              <div className="bg-white border border-[#c3c4c7] p-6 rounded-sm shadow-xs space-y-4 text-xs max-w-2xl">
                <div>
                  <label className="block font-bold text-[#2c3338] mb-1">Brand Bio</label>
                  <textarea
                    rows={2}
                    value={settings.footerConfig.brandBio}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        footerConfig: { ...settings.footerConfig, brandBio: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#2c3338] mb-1">Copyright Line</label>
                  <input
                    type="text"
                    value={settings.footerConfig.copyrightText}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        footerConfig: { ...settings.footerConfig, copyrightText: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm"
                  />
                </div>
                <button
                  onClick={() =>
                    adminPost(
                      '/api/admin/cms/footer',
                      { footerConfig: settings.footerConfig },
                      'Saved Footer Config to MySQL!'
                    )
                  }
                  className="px-5 py-2 bg-[#2271b1] hover:bg-[#135e96] text-white font-semibold rounded-sm cursor-pointer shadow-xs"
                >
                  Save Footer Config
                </button>
              </div>
            </div>
          )}

          {/* =================================================================
              PAGES: SETTINGS & OPERATIONS
          ================================================================= */}
          {currentPage === 'settings-shipping' && (
            <div className="space-y-4">
              <div className="border-b border-[#c3c4c7] pb-3">
                <h1 className="text-2xl font-bold text-[#1d2327]">Shipping & Delivery Rules</h1>
                <p className="text-xs text-[#646970]">
                  Configure free shipping thresholds, standard and express charges.
                </p>
              </div>

              <div className="bg-white border border-[#c3c4c7] p-6 rounded-sm shadow-xs space-y-4 text-xs max-w-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-[#2c3338] mb-1">
                      Free Shipping Threshold (₹)
                    </label>
                    <input
                      type="number"
                      value={settings.shippingAndTax.freeShippingThreshold}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          shippingAndTax: {
                            ...settings.shippingAndTax,
                            freeShippingThreshold: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#2c3338] mb-1">
                      Standard Shipping Fee (₹)
                    </label>
                    <input
                      type="number"
                      value={settings.shippingAndTax.standardShippingFee}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          shippingAndTax: {
                            ...settings.shippingAndTax,
                            standardShippingFee: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm font-mono font-bold"
                    />
                  </div>
                </div>

                <button
                  onClick={() =>
                    adminPost(
                      '/api/admin/settings/shipping-tax',
                      { shippingAndTax: settings.shippingAndTax },
                      'Saved Shipping Rules to MySQL!'
                    )
                  }
                  className="px-5 py-2 bg-[#2271b1] hover:bg-[#135e96] text-white font-semibold rounded-sm cursor-pointer shadow-xs"
                >
                  Save Shipping Rules
                </button>
              </div>
            </div>
          )}

          {currentPage === 'settings-tax' && (
            <div className="space-y-4">
              <div className="border-b border-[#c3c4c7] pb-3">
                <h1 className="text-2xl font-bold text-[#1d2327]">Tax & Legal Compliance</h1>
                <p className="text-xs text-[#646970]">
                  GSTIN, FSSAI Central License & Company Details for Tax Invoices.
                </p>
              </div>

              <div className="bg-white border border-[#c3c4c7] p-6 rounded-sm shadow-xs space-y-4 text-xs max-w-2xl">
                <div>
                  <label className="block font-bold text-[#2c3338] mb-1">Company Registered Name</label>
                  <input
                    type="text"
                    value={settings.shippingAndTax.companyName}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        shippingAndTax: {
                          ...settings.shippingAndTax,
                          companyName: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-[#2c3338] mb-1">GSTIN Number</label>
                    <input
                      type="text"
                      value={settings.shippingAndTax.gstIn}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          shippingAndTax: { ...settings.shippingAndTax, gstIn: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#2c3338] mb-1">FSSAI License</label>
                    <input
                      type="text"
                      value={settings.shippingAndTax.fssaiLicense}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          shippingAndTax: {
                            ...settings.shippingAndTax,
                            fssaiLicense: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm font-mono"
                    />
                  </div>
                </div>

                <button
                  onClick={() =>
                    adminPost(
                      '/api/admin/settings/shipping-tax',
                      { shippingAndTax: settings.shippingAndTax },
                      'Saved Tax & Compliance to MySQL!'
                    )
                  }
                  className="px-5 py-2 bg-[#2271b1] hover:bg-[#135e96] text-white font-semibold rounded-sm cursor-pointer shadow-xs"
                >
                  Save Tax Details
                </button>
              </div>
            </div>
          )}

          {currentPage === 'settings-payments' && (
            <div className="space-y-4">
              <div className="border-b border-[#c3c4c7] pb-3">
                <h1 className="text-2xl font-bold text-[#1d2327]">Payment Gateway Toggles</h1>
                <p className="text-xs text-[#646970]">
                  Enable or disable payment options available at checkout.
                </p>
              </div>

              <div className="bg-white border border-[#c3c4c7] p-6 rounded-sm shadow-xs space-y-4 text-xs max-w-xl">
                {[
                  { key: 'enableUPI', label: 'UPI Instant (GPay / PhonePe / Paytm)' },
                  { key: 'enableCards', label: 'Credit & Debit Cards (Visa / Mastercard / RuPay)' },
                  { key: 'enableNetBanking', label: 'Net Banking (All Indian Banks)' },
                  { key: 'enableCOD', label: 'Cash on Delivery (COD)' },
                ].map((m) => (
                  <label
                    key={m.key}
                    className="flex items-center justify-between p-3 bg-[#f6f7f7] border border-[#c3c4c7] rounded-sm cursor-pointer"
                  >
                    <span className="font-bold text-[#1d2327]">{m.label}</span>
                    <input
                      type="checkbox"
                      checked={(settings.paymentConfig as any)[m.key]}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          paymentConfig: {
                            ...settings.paymentConfig,
                            [m.key]: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 text-[#2271b1] rounded-sm"
                    />
                  </label>
                ))}

                <button
                  onClick={() =>
                    adminPost(
                      '/api/admin/settings/payments',
                      { paymentConfig: settings.paymentConfig },
                      'Saved Payment Gateways to MySQL!'
                    )
                  }
                  className="px-5 py-2 bg-[#2271b1] hover:bg-[#135e96] text-white font-semibold rounded-sm cursor-pointer shadow-xs"
                >
                  Save Payment Gateways
                </button>
              </div>
            </div>
          )}

          {currentPage === 'settings-seo' && (
            <div className="space-y-4">
              <div className="border-b border-[#c3c4c7] pb-3">
                <h1 className="text-2xl font-bold text-[#1d2327]">SEO & Metadata</h1>
                <p className="text-xs text-[#646970]">
                  Configure global OpenGraph, meta description, and search engine title tags.
                </p>
              </div>

              <div className="bg-white border border-[#c3c4c7] p-6 rounded-sm shadow-xs space-y-4 text-xs max-w-2xl">
                <div>
                  <label className="block font-bold text-[#2c3338] mb-1">Global Meta Site Title</label>
                  <input
                    type="text"
                    value={settings.seoConfig.siteTitle}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        seoConfig: { ...settings.seoConfig, siteTitle: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#2c3338] mb-1">Meta Description</label>
                  <textarea
                    rows={3}
                    value={settings.seoConfig.metaDescription}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        seoConfig: { ...settings.seoConfig, metaDescription: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm"
                  />
                </div>
                <button
                  onClick={() =>
                    adminPost(
                      '/api/admin/settings/seo',
                      { seoConfig: settings.seoConfig },
                      'Saved SEO & Meta to MySQL!'
                    )
                  }
                  className="px-5 py-2 bg-[#2271b1] hover:bg-[#135e96] text-white font-semibold rounded-sm cursor-pointer shadow-xs"
                >
                  Save SEO Metadata
                </button>
              </div>
            </div>
          )}

          {/* =================================================================
              PAGES: TOOLS & MYSQL DATABASE
          ================================================================= */}
          {currentPage === 'db-schema' && (
            <div className="space-y-4">
              <div className="border-b border-[#c3c4c7] pb-3">
                <h1 className="text-2xl font-bold text-[#1d2327]">24 MySQL Tables Schema Inspector</h1>
                <p className="text-xs text-[#646970]">
                  Comprehensive relational enterprise architecture running with existing MySQL connection.
                </p>
              </div>

              <div className="bg-white border border-[#c3c4c7] rounded-sm shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#f6f7f7] border-b border-[#c3c4c7] text-[11px] font-bold text-[#2c3338] uppercase">
                      <th className="py-2.5 px-3">Table Name</th>
                      <th className="py-2.5 px-3">Subsystem</th>
                      <th className="py-2.5 px-3">Purpose & Description</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f0f1]">
                    {MYSQL_SCHEMA_TABLES.map((t) => (
                      <tr key={t.name} className="hover:bg-[#fcfcfc]">
                        <td className="py-2 px-3 font-mono font-bold text-[#2271b1]">{t.name}</td>
                        <td className="py-2 px-3 font-semibold text-[#646970]">{t.group}</td>
                        <td className="py-2 px-3 text-[#2c3338]">{t.desc}</td>
                        <td className="py-2 px-3 text-right">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                            ONLINE
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {currentPage === 'db-audit' && (
            <div className="space-y-4">
              <div className="border-b border-[#c3c4c7] pb-3">
                <h1 className="text-2xl font-bold text-[#1d2327]">Admin Audit Logs</h1>
                <p className="text-xs text-[#646970]">
                  Immutable ledger of every admin mutation, stock adjust, and configuration change.
                </p>
              </div>

              <div className="bg-white border border-[#c3c4c7] rounded-sm shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#f6f7f7] border-b border-[#c3c4c7] text-[11px] font-bold text-[#2c3338] uppercase">
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">Admin</th>
                      <th className="py-2.5 px-3">Action</th>
                      <th className="py-2.5 px-3">Entity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f0f1]">
                    {auditLogs.map((l) => (
                      <tr key={l.id}>
                        <td className="py-2.5 px-3 font-mono text-[#646970]">{l.createdAt}</td>
                        <td className="py-2.5 px-3 font-bold text-[#1d2327]">{l.actor}</td>
                        <td className="py-2.5 px-3 font-mono text-[#2271b1]">{l.actionType}</td>
                        <td className="py-2.5 px-3 text-[#2c3338]">{l.summary || l.entityId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {currentPage === 'db-deploy' && (
            <div className="space-y-4">
              <div className="border-b border-[#c3c4c7] pb-3">
                <h1 className="text-2xl font-bold text-[#1d2327]">VPS 1-Click Deployment Trigger</h1>
                <p className="text-xs text-[#646970]">
                  Executes the root deploy.sh script directly from the admin panel.
                </p>
              </div>

              <div className="bg-white border border-[#c3c4c7] p-6 rounded-sm shadow-xs space-y-4 text-xs max-w-2xl">
                <div className="bg-[#f6f7f7] border-l-4 border-[#2271b1] p-3 text-xs text-[#2c3338]">
                  Clicking deploy triggers git pull origin main, builds the application, and restarts the process.
                </div>

                <button
                  onClick={async () => {
                    setIsSaving(true);
                    setDeployOutput('Triggering auto-deploy at /update...');
                    try {
                      const res = await fetch('/api/admin/deploy-trigger', {
                        method: 'POST',
                        headers: { 'x-admin-pin': pin },
                      });
                      const data = await res.json();
                      setDeployOutput(data.output || data.message || 'Deploy script initiated');
                      showToast('Deployment initiated');
                    } catch {
                      setDeployOutput('Deploy request failed');
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  className="px-5 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-sm cursor-pointer shadow-xs flex items-center gap-2"
                >
                  <Rocket className="w-4 h-4" />
                  <span>Execute deploy.sh Now</span>
                </button>

                {deployOutput && (
                  <pre className="p-3 bg-[#1d2327] text-emerald-400 font-mono text-xs rounded overflow-x-auto whitespace-pre-wrap">
                    {deployOutput}
                  </pre>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
