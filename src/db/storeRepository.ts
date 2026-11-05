import { pool } from './mysql.ts';
import { PRODUCTS, CATEGORIES, REELS_DATA, REVIEWS_DATA } from '../data/products.ts';
import {
  DEFAULT_STORE_SETTINGS,
  DEFAULT_COMPARISON_ROWS,
  DEFAULT_COUPONS,
  DEFAULT_FLASH_SALES,
  DEFAULT_FAQS,
  DEFAULT_ESSENTIALS_BUNDLES,
  DEFAULT_CMS_PAGES,
  DEFAULT_SAMPLE_ORDERS,
  DEFAULT_CUSTOMERS,
  DEFAULT_RETURNS,
  DEFAULT_SUPPORT_TICKETS,
  DEFAULT_ABANDONED_CARTS,
  DEFAULT_SUBSCRIBERS,
  DEFAULT_INVENTORY_LOGS,
  DEFAULT_AUDIT_LOGS,
} from '../data/defaultStoreData.ts';
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
} from '../types/store.ts';

export interface FullStoreState {
  settings: StoreSettings;
  categories: CategoryItem[];
  products: Product[];
  bundles: Product[];
  reels: ReelItem[];
  reviews: ProductReview[];
  comparisonRows: ComparisonRow[];
  coupons: CouponItem[];
  flashSales: FlashSaleItem[];
  faqs: FaqItem[];
  cmsPages: CmsPageItem[];
  orders: OrderRecord[];
  customers: UserProfile[];
  returns: OrderReturnRecord[];
  supportTickets: SupportTicketRecord[];
  abandonedCarts: AbandonedCartRecord[];
  subscribers: NewsletterSubscriber[];
  inventoryLogs: InventoryLogRecord[];
  auditLogs: AuditLogRecord[];
}

// Initial state hydrated with defaults, then synced with MySQL
export const storeState: FullStoreState = {
  settings: JSON.parse(JSON.stringify(DEFAULT_STORE_SETTINGS)),
  categories: JSON.parse(JSON.stringify(CATEGORIES)),
  products: PRODUCTS.map((p) => ({
    ...p,
    skuCode: p.skuCode || `SKU-${p.id.toUpperCase()}`,
    stockQuantity: p.stockQuantity ?? 145,
    lowStockThreshold: p.lowStockThreshold ?? 20,
    variants: p.variants.map((v) => ({ ...v, stockQuantity: v.stockQuantity ?? 100 })),
  })),
  bundles: JSON.parse(JSON.stringify(DEFAULT_ESSENTIALS_BUNDLES)),
  reels: JSON.parse(JSON.stringify(REELS_DATA)),
  reviews: REVIEWS_DATA.map((r, idx) => ({
    id: idx + 1,
    productId: r.productId,
    userName: r.userName,
    rating: r.rating,
    comment: r.comment,
    date: r.date,
    status: 'approved',
    isPinned: idx === 0,
    adminReply: '',
  })),
  comparisonRows: JSON.parse(JSON.stringify(DEFAULT_COMPARISON_ROWS)),
  coupons: JSON.parse(JSON.stringify(DEFAULT_COUPONS)),
  flashSales: JSON.parse(JSON.stringify(DEFAULT_FLASH_SALES)),
  faqs: JSON.parse(JSON.stringify(DEFAULT_FAQS)),
  cmsPages: JSON.parse(JSON.stringify(DEFAULT_CMS_PAGES)),
  orders: JSON.parse(JSON.stringify(DEFAULT_SAMPLE_ORDERS)),
  customers: JSON.parse(JSON.stringify(DEFAULT_CUSTOMERS)),
  returns: JSON.parse(JSON.stringify(DEFAULT_RETURNS)),
  supportTickets: JSON.parse(JSON.stringify(DEFAULT_SUPPORT_TICKETS)),
  abandonedCarts: JSON.parse(JSON.stringify(DEFAULT_ABANDONED_CARTS)),
  subscribers: JSON.parse(JSON.stringify(DEFAULT_SUBSCRIBERS)),
  inventoryLogs: JSON.parse(JSON.stringify(DEFAULT_INVENTORY_LOGS)),
  auditLogs: JSON.parse(JSON.stringify(DEFAULT_AUDIT_LOGS)),
};

/**
 * Helper to record an Admin Audit Log in both memory and MySQL
 */
export async function logAdminAction(
  actionType: string,
  entityName: string,
  entityId: string,
  summary: string,
  actor = 'Admin (PIN 9890)'
) {
  const newLog: AuditLogRecord = {
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    actionType,
    entityName,
    entityId,
    summary,
    actor,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  };
  storeState.auditLogs.unshift(newLog);

  try {
    const conn = await pool.getConnection();
    await conn.query(
      `INSERT INTO admin_audit_logs (id, action_type, entity_name, entity_id, summary, actor, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [newLog.id, newLog.actionType, newLog.entityName, newLog.entityId, newLog.summary, newLog.actor, newLog.createdAt]
    );
    conn.release();
  } catch {
    // Non-blocking fallback
  }
}

/**
 * Hydrate storeState from MySQL database on startup or on demand
 */
export async function syncFromMySQL(): Promise<boolean> {
  try {
    const conn = await pool.getConnection();

    // 1. Settings
    const [setRows]: any = await conn.query(
      "SELECT setting_value FROM store_settings WHERE setting_key = 'global_settings' LIMIT 1"
    );
    if (setRows && setRows.length > 0) {
      const parsed =
        typeof setRows[0].setting_value === 'string'
          ? JSON.parse(setRows[0].setting_value)
          : setRows[0].setting_value;
      storeState.settings = { ...storeState.settings, ...parsed };
    }

    // 2. Categories
    const [catRows]: any = await conn.query('SELECT * FROM product_categories');
    if (catRows && catRows.length > 0) {
      storeState.categories = [
        { id: 'all', name: 'All Products', icon: '✨' },
        ...catRows.map((c: any) => ({
          id: c.id,
          name: c.name,
          icon: c.icon,
          description: c.description || '',
          image: c.image || '',
          badge: c.badge || '',
          bgTone: c.bg_tone || 'bg-[#faf3e8]',
        })),
      ];
    }

    // 3. Products + Variants + Flavors
    const [prodRows]: any = await conn.query('SELECT * FROM products ORDER BY created_at ASC');
    const [varRows]: any = await conn.query('SELECT * FROM product_variants');
    const [flavRows]: any = await conn.query('SELECT * FROM product_flavors');

    if (prodRows && prodRows.length > 0) {
      storeState.products = prodRows.map((p: any) => {
        const variants = varRows
          .filter((v: any) => v.product_id === p.id)
          .map((v: any) => ({
            size: v.size,
            price: Number(v.price),
            originalPrice: Number(v.original_price),
            stockQuantity: v.stock_quantity !== undefined ? Number(v.stock_quantity) : 100,
          }));
        const flavors = flavRows
          .filter((f: any) => f.product_id === p.id)
          .map((f: any) => f.flavor);

        const nutrition =
          typeof p.nutrition === 'string' ? JSON.parse(p.nutrition) : p.nutrition || {};
        const features =
          typeof p.features === 'string' ? JSON.parse(p.features) : p.features || [];

        return {
          id: p.id,
          name: p.name,
          tagline: p.tagline,
          category: p.category_id,
          price: Number(p.price),
          originalPrice: Number(p.original_price),
          discountPercent: Number(p.discount_percent),
          rating: Number(p.rating),
          reviewCount: Number(p.review_count),
          image: p.image,
          secondaryImage: p.secondary_image || undefined,
          badge: p.badge || undefined,
          isBestseller: Boolean(p.is_bestseller),
          hasFreeGift: p.has_free_gift || undefined,
          skuCode: p.sku_code || `SKU-${p.id.toUpperCase()}`,
          stockQuantity: p.stock_quantity !== undefined ? Number(p.stock_quantity) : 145,
          lowStockThreshold: p.low_stock_threshold !== undefined ? Number(p.low_stock_threshold) : 20,
          variants: variants.length > 0 ? variants : [{ size: '1 kg', price: Number(p.price), originalPrice: Number(p.original_price), stockQuantity: 100 }],
          flavors: flavors.length > 0 ? flavors : undefined,
          nutrition,
          features,
          ingredients: p.ingredients || '',
          description: p.description || '',
          inStock: Boolean(p.in_stock),
        };
      });
    }

    // 4. Bundles
    const [bunRows]: any = await conn.query('SELECT * FROM product_bundles');
    if (bunRows && bunRows.length > 0) {
      storeState.bundles = bunRows.map((b: any) => ({
        id: b.id,
        name: b.name,
        tagline: b.tagline,
        category: b.category,
        price: Number(b.price),
        originalPrice: Number(b.original_price),
        discountPercent: Number(b.discount_percent),
        rating: Number(b.rating || 4.9),
        reviewCount: Number(b.review_count || 100),
        image: b.image,
        badge: b.badge || undefined,
        hasFreeGift: b.has_free_gift || undefined,
        skuCode: b.sku_code || `SKU-${b.id.toUpperCase()}`,
        stockQuantity: Number(b.stock_quantity ?? 100),
        variants: [{ size: 'Standard Pack', price: Number(b.price), originalPrice: Number(b.original_price) }],
        nutrition: { protein: '26g', calories: '160 kcal', carbs: '6g', fat: '3g', sugar: '0g', servingSize: '1 Pack' },
        features: typeof b.features === 'string' ? JSON.parse(b.features) : b.features || [],
        ingredients: b.ingredients || '',
        description: b.description || '',
        inStock: Boolean(b.in_stock),
      }));
    }

    // 5. Reels
    const [reelRows]: any = await conn.query('SELECT * FROM reels');
    if (reelRows && reelRows.length > 0) {
      storeState.reels = reelRows.map((r: any) => ({
        id: r.id,
        creatorName: r.creator_name,
        handle: r.handle,
        caption: r.caption,
        image: r.image,
        linkedProductId: r.linked_product_id || '',
        productName: r.product_name || '',
        productPrice: Number(r.product_price || 0),
        originalPrice: Number(r.original_price || 0),
      }));
    }

    // 6. Reviews
    const [revRows]: any = await conn.query('SELECT * FROM product_reviews ORDER BY id DESC');
    if (revRows && revRows.length > 0) {
      storeState.reviews = revRows.map((r: any) => ({
        id: r.id,
        productId: r.product_id,
        userName: r.user_name,
        userAvatar: r.user_avatar || undefined,
        rating: Number(r.rating),
        comment: r.comment,
        date: r.date instanceof Date ? r.date.toISOString().slice(0, 10) : String(r.date).slice(0, 10),
        status: r.status || 'approved',
        isPinned: Boolean(r.is_pinned),
        adminReply: r.admin_reply || '',
      }));
    }

    // 7. Comparison Rows
    const [compRows]: any = await conn.query('SELECT * FROM comparison_rows ORDER BY sort_order ASC');
    if (compRows && compRows.length > 0) {
      storeState.comparisonRows = compRows.map((r: any) => ({
        id: r.id,
        metric: r.metric,
        gharKaKhaana: r.ghar_ka_khaana,
        theproteino: r.theproteino,
        junkFood: r.junk_food,
        theproteinoHighlight: Boolean(r.theproteino_highlight),
        sortOrder: Number(r.sort_order),
      }));
    }

    // 8. Coupons
    const [coupRows]: any = await conn.query('SELECT * FROM coupons');
    if (coupRows && coupRows.length > 0) {
      storeState.coupons = coupRows.map((c: any) => ({
        code: c.code,
        discountType: c.discount_type,
        discountValue: Number(c.discount_value),
        minOrderAmount: Number(c.min_order_amount || 0),
        maxDiscount: c.max_discount ? Number(c.max_discount) : undefined,
        usageLimit: Number(c.usage_limit || 1000),
        usedCount: Number(c.used_count || 0),
        freeGiftName: c.free_gift_name || undefined,
        description: c.description || '',
        isActive: Boolean(c.is_active),
        expiresAt: c.expires_at || undefined,
      }));
    }

    // 9. Flash Sales
    const [fsRows]: any = await conn.query('SELECT * FROM flash_sales');
    if (fsRows && fsRows.length > 0) {
      storeState.flashSales = fsRows.map((f: any) => ({
        id: f.id,
        title: f.title,
        discountPercent: Number(f.discount_percent),
        categoryFilter: f.category_filter,
        startsAt: f.starts_at || '',
        endsAt: f.ends_at || '',
        bannerText: f.banner_text || '',
        isActive: Boolean(f.is_active),
      }));
    }

    // 10. FAQs
    const [faqRows]: any = await conn.query('SELECT * FROM faqs ORDER BY sort_order ASC');
    if (faqRows && faqRows.length > 0) {
      storeState.faqs = faqRows.map((f: any) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
        category: f.category || 'General',
        sortOrder: Number(f.sort_order || 1),
        isActive: Boolean(f.is_active),
      }));
    }

    // 11. CMS Pages
    const [pageRows]: any = await conn.query('SELECT * FROM cms_pages');
    if (pageRows && pageRows.length > 0) {
      storeState.cmsPages = pageRows.map((p: any) => ({
        slug: p.slug,
        title: p.title,
        subtitle: p.subtitle || '',
        lastUpdated: p.last_updated || 'November 2026',
        contentHtml: p.content_html,
      }));
    }

    // 12. Orders
    const [ordRows]: any = await conn.query('SELECT * FROM orders ORDER BY created_at DESC');
    storeState.orders = (ordRows || []).map((o: any) => ({
      id: o.id,
      orderId: o.order_id,
      firebaseUid: o.firebase_uid,
      customerName: o.customer_name,
      customerEmail: o.customer_email,
      customerPhone: o.customer_phone,
      totalAmount: Number(o.total_amount),
      discountAmount: Number(o.discount_amount || 0),
      shippingFee: Number(o.shipping_fee || 0),
      couponCode: o.coupon_code || undefined,
      paymentMethod: o.payment_method,
      orderStatus: o.order_status || 'confirmed',
      trackingNumber: o.tracking_number || '',
      courierName: o.courier_name || '',
      estimatedDelivery: o.estimated_delivery || '3-4 Business Days',
      shippingAddress:
        typeof o.shipping_address === 'string'
          ? JSON.parse(o.shipping_address)
          : o.shipping_address || {},
      items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items || [],
      notes: o.notes || '',
      createdAt:
        o.created_at instanceof Date
          ? o.created_at.toISOString().replace('T', ' ').slice(0, 19)
          : String(o.created_at),
    }));

    // 13. Users & Addresses
    const [usrRows]: any = await conn.query('SELECT * FROM users ORDER BY id DESC');
    const [addrRows]: any = await conn.query('SELECT * FROM user_addresses ORDER BY is_default DESC, id DESC');
    storeState.customers = (usrRows || []).map((u: any) => ({
      id: u.id,
      firebaseUid: u.firebase_uid,
      email: u.email,
      displayName: u.display_name || u.email.split('@')[0],
      photoUrl: u.photo_url || undefined,
      phone: u.phone || '',
      provider: u.provider || 'password',
      loyaltyPoints: Number(u.loyalty_points ?? 100),
      totalSpent: Number(u.total_spent ?? 0),
      status: u.status || 'active',
      createdAt:
        u.created_at instanceof Date
          ? u.created_at.toISOString().slice(0, 10)
          : String(u.created_at).slice(0, 10),
      addresses: (addrRows || [])
        .filter((a: any) => a.firebase_uid === u.firebase_uid)
        .map((a: any) => ({
          id: a.id,
          fullName: a.full_name,
          email: a.email,
          phone: a.phone,
          addressLine1: a.address_line1,
          addressLine2: a.address_line2 || '',
          city: a.city,
          state: a.state,
          postalCode: a.postal_code,
          isDefault: Boolean(a.is_default),
        })),
    }));

    // 14. Returns, Tickets, Abandoned Carts, Subscribers, Inventory & Audit Logs
    const [retRows]: any = await conn.query('SELECT * FROM order_returns ORDER BY created_at DESC');
    storeState.returns = (retRows || []).map((r: any) => ({
      id: r.id,
      orderId: r.order_id,
      customerName: r.customer_name,
      customerEmail: r.customer_email,
      reason: r.reason,
      status: r.status,
      refundAmount: Number(r.refund_amount),
      resolutionNote: r.resolution_note || '',
      createdAt: r.created_at,
    }));

    const [tkRows]: any = await conn.query('SELECT * FROM support_tickets ORDER BY created_at DESC');
    storeState.supportTickets = (tkRows || []).map((t: any) => ({
      id: t.id,
      ticketCode: t.ticket_code,
      name: t.name,
      email: t.email,
      phone: t.phone || '',
      orderId: t.order_id || '',
      subject: t.subject,
      message: t.message,
      status: t.status,
      adminReply: t.admin_reply || '',
      createdAt: t.created_at,
    }));

    const [acRows]: any = await conn.query('SELECT * FROM abandoned_carts ORDER BY updated_at DESC');
    storeState.abandonedCarts = (acRows || []).map((a: any) => ({
      id: a.id,
      sessionId: a.session_id,
      customerName: a.customer_name || 'Guest Shopper',
      customerEmail: a.customer_email || '',
      customerPhone: a.customer_phone || '',
      items: typeof a.items === 'string' ? JSON.parse(a.items) : a.items || [],
      subtotal: Number(a.subtotal),
      recoveryStatus: a.recovery_status || 'active',
      updatedAt: a.updated_at,
    }));

    const [subRows]: any = await conn.query('SELECT * FROM newsletter_subscribers ORDER BY created_at DESC');
    storeState.subscribers = (subRows || []).map((s: any) => ({
      id: s.id,
      email: s.email,
      phone: s.phone || '',
      source: s.source || 'Footer Newsletter',
      createdAt: s.created_at,
    }));

    const [invRows]: any = await conn.query('SELECT * FROM inventory_logs ORDER BY created_at DESC LIMIT 100');
    storeState.inventoryLogs = (invRows || []).map((i: any) => ({
      id: i.id,
      productId: i.product_id,
      productName: i.product_name,
      variantSize: i.variant_size,
      changeAmount: Number(i.change_amount),
      newStock: Number(i.new_stock),
      reason: i.reason || '',
      createdAt:
        i.created_at instanceof Date
          ? i.created_at.toISOString().replace('T', ' ').slice(0, 19)
          : String(i.created_at),
    }));

    const [audRows]: any = await conn.query('SELECT * FROM admin_audit_logs ORDER BY created_at DESC LIMIT 150');
    storeState.auditLogs = (audRows || []).map((a: any) => ({
      id: a.id,
      actionType: a.action_type,
      entityName: a.entity_name,
      entityId: a.entity_id,
      summary: a.summary,
      actor: a.actor,
      createdAt: a.created_at,
    }));

    conn.release();
    return true;
  } catch (err) {
    console.warn('[STORE REPOSITORY]: MySQL sync notice (using write-through memory state):', (err as any)?.message || err);
    return false;
  }
}
