import express from 'express';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { testConnection, pool } from './src/db/mysql.ts';
import { storeState, syncFromMySQL, logAdminAction } from './src/db/storeRepository.ts';
import { OrderRecord, InventoryLogRecord } from './src/types/store.ts';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Prioritize PORT from .env (e.g. 3002 on VPS); default to 3000 for local/preview
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_DEV = NODE_ENV !== 'production';

console.log(`\x1b[36m[SERVER STARTUP]\x1b[0m: Environment: ${NODE_ENV}`);
console.log(`\x1b[36m[SERVER STARTUP]\x1b[0m: Port configured: ${PORT}`);

let mysqlConnected = false;

async function startServer() {
  const app = express();

  // Test MySQL connection on startup and hydrate storeState (non-blocking)
  testConnection().then(async (isConnected) => {
    mysqlConnected = isConnected;
    if (!isConnected) {
      console.error('\x1b[31m[DATABASE ERROR]\x1b[0m: Connection test result:', isConnected);
    } else {
      console.log('\x1b[32m[DATABASE CONNECTED]\x1b[0m: Successfully connected to MySQL database.');
      await syncFromMySQL();
    }
  });

  // Middleware
  app.use(express.json({ limit: '10mb' }));

  // Admin PIN Authentication helper
  const verifyPin = (req: express.Request): boolean => {
    const pinHeader = req.headers['x-admin-pin'] as string;
    const pinBody = req.body?.pin as string;
    const provided = (pinHeader || pinBody || '').trim();
    const activePin = storeState.settings.adminPin || '9890';
    return provided === activePin || provided === '9890';
  };

  // ============================================================================
  // PUBLIC STOREFRONT & HEALTH ROUTES
  // ============================================================================

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', mysqlConnected, timestamp: new Date().toISOString() });
  });

  app.get('/api/db-status', async (req, res) => {
    const isConnected = await testConnection();
    mysqlConnected = isConnected;
    res.json({ connected: isConnected });
  });

  // Live Storefront Bootstrap — returns all CMS, Catalog, Coupons & Settings
  app.get('/api/storefront/bootstrap', (req, res) => {
    res.json({
      mysqlConnected,
      settings: storeState.settings,
      categories: storeState.categories,
      products: storeState.products,
      bundles: storeState.bundles,
      reels: storeState.reels,
      reviews: storeState.reviews.filter((r) => r.status !== 'hidden'),
      comparisonRows: storeState.comparisonRows,
      coupons: storeState.coupons.filter((c) => c.isActive),
      flashSales: storeState.flashSales.filter((f) => f.isActive),
      faqs: storeState.faqs.filter((f) => f.isActive),
      cmsPages: storeState.cmsPages,
    });
  });

  // 1. Sync Firebase User into MySQL database
  app.post('/api/user/sync', async (req, res) => {
    const { firebaseUid, email, displayName, photoUrl, phone, provider } = req.body;
    if (!firebaseUid || !email) {
      return res.status(400).json({ error: 'firebaseUid and email are required' });
    }

    // Update in-memory storeState
    let existingCustomer = storeState.customers.find((c) => c.firebaseUid === firebaseUid);
    if (!existingCustomer) {
      existingCustomer = {
        id: storeState.customers.length + 1,
        firebaseUid,
        email,
        displayName: displayName || email.split('@')[0],
        photoUrl: photoUrl || undefined,
        phone: phone || '',
        provider: provider || 'password',
        loyaltyPoints: 150,
        totalSpent: 0,
        status: 'active',
        createdAt: new Date().toISOString().slice(0, 10),
        addresses: [],
      };
      storeState.customers.unshift(existingCustomer);
    } else {
      existingCustomer.email = email;
      if (displayName) existingCustomer.displayName = displayName;
      if (photoUrl) existingCustomer.photoUrl = photoUrl;
      if (phone) existingCustomer.phone = phone;
    }

    try {
      const connection = await pool.getConnection();
      await connection.query(
        `INSERT INTO users (firebase_uid, email, display_name, photo_url, phone, provider)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           email = VALUES(email),
           display_name = COALESCE(VALUES(display_name), display_name),
           photo_url = COALESCE(VALUES(photo_url), photo_url),
           phone = COALESCE(VALUES(phone), phone),
           provider = VALUES(provider)`,
        [firebaseUid, email, displayName || null, photoUrl || null, phone || null, provider || 'password']
      );

      const [rows]: any = await connection.query(
        `SELECT id, firebase_uid, email, display_name, photo_url, phone, provider, loyalty_points, total_spent, status FROM users WHERE firebase_uid = ? LIMIT 1`,
        [firebaseUid]
      );

      const [addrRows]: any = await connection.query(
        `SELECT id, full_name as fullName, email, phone, address_line1 as addressLine1, address_line2 as addressLine2, city, state, postal_code as postalCode, is_default as isDefault 
         FROM user_addresses WHERE firebase_uid = ? ORDER BY is_default DESC, id DESC`,
        [firebaseUid]
      );

      connection.release();
      return res.json({
        success: true,
        user: rows[0] || existingCustomer,
        addresses: addrRows && addrRows.length > 0 ? addrRows : existingCustomer.addresses || [],
      });
    } catch (err: any) {
      console.error('[API USER SYNC ERROR]:', err?.message || err);
      return res.json({
        success: true,
        user: existingCustomer,
        addresses: existingCustomer.addresses || [],
      });
    }
  });

  // 2. Save or update user address in MySQL
  app.post('/api/user/address', async (req, res) => {
    const { firebaseUid, fullName, email, phone, addressLine1, addressLine2, city, state, postalCode } = req.body;
    if (!firebaseUid || !fullName || !addressLine1 || !postalCode) {
      return res.status(400).json({ error: 'Missing required address fields' });
    }

    const newAddr = {
      id: Date.now(),
      fullName,
      email: email || '',
      phone: phone || '',
      addressLine1,
      addressLine2: addressLine2 || '',
      city,
      state,
      postalCode,
      isDefault: true,
    };

    const cust = storeState.customers.find((c) => c.firebaseUid === firebaseUid);
    if (cust) {
      cust.addresses = [newAddr, ...(cust.addresses || [])];
      if (phone) cust.phone = phone;
    }

    try {
      const connection = await pool.getConnection();
      const [result]: any = await connection.query(
        `INSERT INTO user_addresses (firebase_uid, full_name, email, phone, address_line1, address_line2, city, state, postal_code, is_default)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [firebaseUid, fullName, email || '', phone || '', addressLine1, addressLine2 || '', city, state, postalCode]
      );

      const [addrRows]: any = await connection.query(
        `SELECT id, full_name as fullName, email, phone, address_line1 as addressLine1, address_line2 as addressLine2, city, state, postal_code as postalCode, is_default as isDefault 
         FROM user_addresses WHERE firebase_uid = ? ORDER BY id DESC`,
        [firebaseUid]
      );

      connection.release();
      return res.json({ success: true, insertId: result.insertId, addresses: addrRows });
    } catch (err: any) {
      console.error('[API ADDRESS ERROR]:', err?.message || err);
      return res.json({ success: true, insertId: newAddr.id, addresses: cust?.addresses || [newAddr] });
    }
  });

  // 3. Save order to MySQL & decrement inventory
  app.post('/api/orders/create', async (req, res) => {
    const {
      orderId,
      firebaseUid,
      customerName,
      customerEmail,
      customerPhone,
      subtotal,
      totalAmount,
      discountAmount,
      shippingFee,
      couponCode,
      paymentMethod,
      shippingAddress,
      items,
    } = req.body;

    const finalOrderId = orderId || `PROT-${Math.floor(100000 + Math.random() * 900000)}`;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const newOrderRecord = {
      orderId: finalOrderId,
      firebaseUid: firebaseUid || null,
      customerName: customerName || shippingAddress?.fullName || 'Guest Customer',
      customerEmail: customerEmail || shippingAddress?.email || '',
      customerPhone: customerPhone || shippingAddress?.phone || '',
      subtotal: Number(subtotal || totalAmount),
      totalAmount: Number(totalAmount || 0),
      discountAmount: Number(discountAmount || 0),
      shippingFee: Number(shippingFee || 0),
      couponCode: couponCode || undefined,
      paymentMethod: paymentMethod || 'UPI',
      orderStatus: 'confirmed' as const,
      trackingNumber: '',
      courierName: ' Gujarat Roastery Dispatch',
      estimatedDelivery: '3-4 Business Days',
      shippingAddress: shippingAddress || {},
      items: items || [],
      createdAt: nowStr,
    };

    storeState.orders.unshift(newOrderRecord);

    // Increment coupon usage if coupon was applied
    if (couponCode) {
      const foundCoupon = storeState.coupons.find((c) => c.code.toUpperCase() === String(couponCode).toUpperCase());
      if (foundCoupon) foundCoupon.usedCount += 1;
    }

    // Update stock quantities & customer spend
    if (Array.isArray(items)) {
      for (const it of items) {
        const prod = storeState.products.find((p) => p.id === it.product?.id);
        if (prod) {
          const qty = Number(it.quantity || 1);
          prod.stockQuantity = Math.max(0, (prod.stockQuantity ?? 100) - qty);
        }
      }
    }

    if (firebaseUid) {
      const cust = storeState.customers.find((c) => c.firebaseUid === firebaseUid);
      if (cust) {
        cust.totalSpent = (cust.totalSpent || 0) + Number(totalAmount || 0);
        cust.loyaltyPoints = (cust.loyaltyPoints || 0) + Math.round(Number(totalAmount || 0) * 0.05);
      }
    }

    try {
      const connection = await pool.getConnection();
      await connection.query(
        `INSERT INTO orders (order_id, firebase_uid, customer_name, customer_email, customer_phone, total_amount, discount_amount, shipping_fee, coupon_code, payment_method, order_status, shipping_address, items)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, ?)`,
        [
          finalOrderId,
          firebaseUid || null,
          newOrderRecord.customerName,
          newOrderRecord.customerEmail,
          newOrderRecord.customerPhone,
          newOrderRecord.totalAmount,
          newOrderRecord.discountAmount,
          newOrderRecord.shippingFee,
          couponCode || null,
          newOrderRecord.paymentMethod,
          JSON.stringify(shippingAddress || {}),
          JSON.stringify(items || []),
        ]
      );

      if (couponCode) {
        await connection.query('UPDATE coupons SET used_count = used_count + 1 WHERE code = ?', [couponCode]);
      }

      connection.release();
      return res.json({ success: true, orderId: finalOrderId, order: newOrderRecord });
    } catch (err: any) {
      console.error('[API ORDER CREATE ERROR]:', err?.message || err);
      return res.json({ success: true, orderId: finalOrderId, order: newOrderRecord, notice: 'Synced to active store state' });
    }
  });

  // 4. Customer Contact / Support Ticket Submission
  app.post('/api/contact/submit', async (req, res) => {
    const { name, email, phone, orderId, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    const ticketCode = `SUP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket = {
      id: `tk-${Date.now()}`,
      ticketCode,
      name,
      email,
      phone: phone || '',
      orderId: orderId || '',
      subject: subject || 'General Support Inquiry',
      message,
      status: 'open' as const,
      adminReply: '',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    storeState.supportTickets.unshift(newTicket);

    try {
      const conn = await pool.getConnection();
      await conn.query(
        `INSERT INTO support_tickets (id, ticket_code, name, email, phone, order_id, subject, message, status, admin_reply, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open', '', ?)`,
        [newTicket.id, newTicket.ticketCode, newTicket.name, newTicket.email, newTicket.phone, newTicket.orderId, newTicket.subject, newTicket.message, newTicket.createdAt]
      );
      conn.release();
    } catch {}

    return res.json({ success: true, ticketCode, ticket: newTicket });
  });

  // 5. Newsletter Subscription
  app.post('/api/newsletter/subscribe', async (req, res) => {
    const { email, phone, source } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const newSub = {
      id: `sub-${Date.now()}`,
      email,
      phone: phone || '',
      source: source || 'Footer Newsletter',
      createdAt: new Date().toISOString().slice(0, 10),
    };

    if (!storeState.subscribers.some((s) => s.email.toLowerCase() === email.toLowerCase())) {
      storeState.subscribers.unshift(newSub);
      try {
        const conn = await pool.getConnection();
        await conn.query(
          `INSERT INTO newsletter_subscribers (id, email, phone, source, created_at) VALUES (?, ?, ?, ?, ?)`,
          [newSub.id, newSub.email, newSub.phone, newSub.source, newSub.createdAt]
        );
        conn.release();
      } catch {}
    }

    return res.json({ success: true, subscriber: newSub });
  });

  // 6. Submit Product Review
  app.post('/api/reviews/create', async (req, res) => {
    const { productId, userName, rating, comment } = req.body;
    if (!productId || !userName || !comment) {
      return res.status(400).json({ error: 'productId, userName, and comment required' });
    }

    const newRev = {
      id: Date.now(),
      productId,
      userName,
      rating: Number(rating || 5),
      comment,
      date: new Date().toISOString().slice(0, 10),
      status: 'approved' as const,
      isPinned: false,
      adminReply: '',
    };

    storeState.reviews.unshift(newRev);

    try {
      const conn = await pool.getConnection();
      await conn.query(
        `INSERT INTO product_reviews (product_id, user_name, rating, comment, date, status) VALUES (?, ?, ?, ?, ?, 'approved')`,
        [newRev.productId, newRev.userName, newRev.rating, newRev.comment, newRev.date]
      );
      conn.release();
    } catch {}

    return res.json({ success: true, review: newRev });
  });

  // 7. Get Product Reviews (for ProductDetailPage & QuickViewModal)
  app.get('/api/products/:productId/reviews', async (req, res) => {
    const { productId } = req.params;
    let reviews = storeState.reviews.filter(
      (r) => r.productId === productId && r.status !== 'hidden'
    );

    try {
      const conn = await pool.getConnection();
      const [rows]: any = await conn.query(
        `SELECT id, product_id, user_name, user_avatar, rating, comment, date, status, is_pinned, admin_reply
         FROM product_reviews 
         WHERE product_id = ? AND (status = 'approved' OR status IS NULL)
         ORDER BY is_pinned DESC, id DESC`,
        [productId]
      );
      conn.release();
      if (rows && rows.length > 0) {
        reviews = rows.map((r: any) => ({
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
    } catch {}

    const formatted = reviews.map((r) => ({
      id: r.id,
      name: r.userName,
      userName: r.userName,
      rating: r.rating,
      date: r.date,
      verified: true,
      title: r.rating >= 5 ? 'Exceptional Quality' : 'Verified Buyer Review',
      comment: r.comment,
      helpfulCount: 3,
      isPinned: r.isPinned,
      adminReply: r.adminReply,
    }));

    return res.json(formatted);
  });

  // ============================================================================
  // ADMIN PANEL API ROUTES (PROTECTED BY PIN '9890')
  // ============================================================================

  // Verify PIN & unlock Admin Console
  app.post('/api/admin/verify-pin', async (req, res) => {
    if (!verifyPin(req)) {
      return res.status(401).json({ success: false, error: 'Invalid Admin PIN. Enter 9890 to unlock.' });
    }
    await logAdminAction('ADMIN_LOGIN', 'Admin Console', 'session', 'Unlocked /admin console with PIN');
    return res.json({
      success: true,
      mysqlConnected,
      state: storeState,
    });
  });

  // Fetch complete Admin Dashboard state
  app.get('/api/admin/dashboard', async (req, res) => {
    if (!verifyPin(req)) {
      return res.status(401).json({ error: 'Unauthorized: Invalid Admin PIN' });
    }
    return res.json({
      mysqlConnected,
      state: storeState,
    });
  });

  // Sync / Refresh from MySQL
  app.post('/api/admin/sync-mysql', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const connected = await testConnection();
    mysqlConnected = connected;
    if (connected) {
      await syncFromMySQL();
    }
    await logAdminAction('MYSQL_SYNC', 'Database', '24-tables', `Tested MySQL connection (${connected ? 'Online' : 'Fallback Mode'})`);
    return res.json({ success: true, mysqlConnected: connected, state: storeState });
  });

  // Update Global Store Settings (Hero, TopBar, LiveCounter, BrandStory, Shipping, Tax, Payment, SEO, Footer, PIN)
  app.post('/api/admin/settings', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { settings, sectionName } = req.body;
    if (!settings) return res.status(400).json({ error: 'Missing settings payload' });

    storeState.settings = {
      ...storeState.settings,
      ...settings,
    };

    try {
      const conn = await pool.getConnection();
      await conn.query(
        `INSERT INTO store_settings (setting_key, setting_value) VALUES ('global_settings', ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [JSON.stringify(storeState.settings)]
      );
      conn.release();
    } catch (err) {
      console.warn('[ADMIN SETTINGS MYSQL NOTICE]:', (err as any)?.message);
    }

    await logAdminAction('UPDATE_SETTINGS', 'StoreSettings', sectionName || 'global', `Updated ${sectionName || 'global storefront'} configuration`);
    return res.json({ success: true, settings: storeState.settings });
  });

  // Upsert Product (Create or Edit Product + Variants + Flavors)
  app.post('/api/admin/products/upsert', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { product } = req.body;
    if (!product || !product.id || !product.name) {
      return res.status(400).json({ error: 'Invalid product payload' });
    }

    const discountPercent =
      product.originalPrice > product.price
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    const normalized: any = {
      ...product,
      price: Number(product.price),
      originalPrice: Number(product.originalPrice || product.price),
      discountPercent,
      rating: Number(product.rating || 4.9),
      reviewCount: Number(product.reviewCount || 100),
      stockQuantity: Number(product.stockQuantity ?? 150),
      lowStockThreshold: Number(product.lowStockThreshold ?? 20),
      skuCode: product.skuCode || `SKU-${product.id.toUpperCase()}`,
      variants:
        Array.isArray(product.variants) && product.variants.length > 0
          ? product.variants.map((v: any) => ({
              size: v.size,
              price: Number(v.price),
              originalPrice: Number(v.originalPrice || v.price),
              stockQuantity: Number(v.stockQuantity ?? 100),
            }))
          : [{ size: '1 kg', price: Number(product.price), originalPrice: Number(product.originalPrice || product.price), stockQuantity: 100 }],
    };

    const existingIdx = storeState.products.findIndex((p) => p.id === normalized.id);
    if (existingIdx > -1) {
      storeState.products[existingIdx] = normalized;
    } else {
      storeState.products.unshift(normalized);
    }

    try {
      const conn = await pool.getConnection();
      await conn.query(
        `INSERT INTO products (
          id, name, tagline, category_id, price, original_price, discount_percent,
          rating, review_count, image, secondary_image, badge, is_bestseller,
          has_free_gift, sku_code, stock_quantity, low_stock_threshold,
          nutrition, features, ingredients, description, in_stock
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          tagline = VALUES(tagline),
          category_id = VALUES(category_id),
          price = VALUES(price),
          original_price = VALUES(original_price),
          discount_percent = VALUES(discount_percent),
          rating = VALUES(rating),
          review_count = VALUES(review_count),
          image = VALUES(image),
          secondary_image = VALUES(secondary_image),
          badge = VALUES(badge),
          is_bestseller = VALUES(is_bestseller),
          has_free_gift = VALUES(has_free_gift),
          sku_code = VALUES(sku_code),
          stock_quantity = VALUES(stock_quantity),
          low_stock_threshold = VALUES(low_stock_threshold),
          nutrition = VALUES(nutrition),
          features = VALUES(features),
          ingredients = VALUES(ingredients),
          description = VALUES(description),
          in_stock = VALUES(in_stock)`,
        [
          normalized.id,
          normalized.name,
          normalized.tagline,
          normalized.category,
          normalized.price,
          normalized.originalPrice,
          normalized.discountPercent,
          normalized.rating,
          normalized.reviewCount,
          normalized.image,
          normalized.secondaryImage || null,
          normalized.badge || null,
          normalized.isBestseller ? 1 : 0,
          normalized.hasFreeGift || null,
          normalized.skuCode,
          normalized.stockQuantity,
          normalized.lowStockThreshold,
          JSON.stringify(normalized.nutrition || {}),
          JSON.stringify(normalized.features || []),
          normalized.ingredients || '',
          normalized.description || '',
          normalized.inStock ? 1 : 0,
        ]
      );

      await conn.query('DELETE FROM product_variants WHERE product_id = ?', [normalized.id]);
      for (const v of normalized.variants) {
        await conn.query(
          'INSERT INTO product_variants (product_id, size, price, original_price, stock_quantity) VALUES (?, ?, ?, ?, ?)',
          [normalized.id, v.size, v.price, v.originalPrice, v.stockQuantity ?? 100]
        );
      }

      await conn.query('DELETE FROM product_flavors WHERE product_id = ?', [normalized.id]);
      if (Array.isArray(normalized.flavors)) {
        for (const f of normalized.flavors) {
          if (f && f.trim()) {
            await conn.query('INSERT INTO product_flavors (product_id, flavor) VALUES (?, ?)', [normalized.id, f.trim()]);
          }
        }
      }

      conn.release();
    } catch (err) {
      console.warn('[ADMIN PRODUCT UPSERT MYSQL NOTICE]:', (err as any)?.message);
    }

    await logAdminAction(
      existingIdx > -1 ? 'UPDATE_PRODUCT' : 'CREATE_PRODUCT',
      'Product',
      normalized.id,
      `${existingIdx > -1 ? 'Updated' : 'Created'} product "${normalized.name}" (₹${normalized.price})`
    );

    return res.json({ success: true, products: storeState.products });
  });

  // Delete Product
  app.post('/api/admin/products/delete', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { productId } = req.body;
    storeState.products = storeState.products.filter((p) => p.id !== productId);

    try {
      const conn = await pool.getConnection();
      await conn.query('DELETE FROM products WHERE id = ?', [productId]);
      await conn.query('DELETE FROM product_variants WHERE product_id = ?', [productId]);
      await conn.query('DELETE FROM product_flavors WHERE product_id = ?', [productId]);
      conn.release();
    } catch {}

    await logAdminAction('DELETE_PRODUCT', 'Product', productId, `Deleted product ID ${productId}`);
    return res.json({ success: true, products: storeState.products });
  });

  // Batch Stock & Price Update
  app.post('/api/admin/products/batch-stock', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { updates, reason } = req.body; // Array of { id, price, originalPrice, stockQuantity, inStock }
    if (!Array.isArray(updates)) return res.status(400).json({ error: 'Invalid updates array' });

    for (const u of updates) {
      const prod = storeState.products.find((p) => p.id === u.id);
      if (prod) {
        const oldStock = prod.stockQuantity ?? 100;
        const newStock = u.stockQuantity !== undefined ? Number(u.stockQuantity) : oldStock;
        if (u.price !== undefined) prod.price = Number(u.price);
        if (u.originalPrice !== undefined) prod.originalPrice = Number(u.originalPrice);
        if (prod.originalPrice > prod.price) {
          prod.discountPercent = Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100);
        }
        prod.stockQuantity = newStock;
        if (u.inStock !== undefined) prod.inStock = Boolean(u.inStock);
        if (prod.variants && prod.variants.length > 0) {
          prod.variants[0].price = prod.price;
          prod.variants[0].originalPrice = prod.originalPrice;
        }

        if (newStock !== oldStock) {
          const logEntry = {
            id: `inv-${Date.now()}-${Math.floor(Math.random() * 999)}`,
            productId: prod.id,
            productName: prod.name,
            variantSize: prod.variants[0]?.size || 'Default',
            changeAmount: newStock - oldStock,
            newStock,
            reason: reason || 'Admin Batch Inventory Update',
            createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
          };
          storeState.inventoryLogs.unshift(logEntry);
        }
      }
    }

    try {
      const conn = await pool.getConnection();
      for (const u of updates) {
        const prod = storeState.products.find((p) => p.id === u.id);
        if (prod) {
          await conn.query(
            'UPDATE products SET price = ?, original_price = ?, discount_percent = ?, stock_quantity = ?, in_stock = ? WHERE id = ?',
            [prod.price, prod.originalPrice, prod.discountPercent, prod.stockQuantity, prod.inStock ? 1 : 0, prod.id]
          );
        }
      }
      conn.release();
    } catch {}

    await logAdminAction('BATCH_INVENTORY', 'Products', 'batch', `Executed batch stock/price update for ${updates.length} SKUs`);
    return res.json({ success: true, products: storeState.products, inventoryLogs: storeState.inventoryLogs });
  });

  // Categories Upsert & Delete
  app.post('/api/admin/categories/upsert', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { category } = req.body;
    if (!category || !category.id || !category.name) return res.status(400).json({ error: 'Invalid category' });

    const idx = storeState.categories.findIndex((c) => c.id === category.id);
    if (idx > -1) {
      storeState.categories[idx] = { ...storeState.categories[idx], ...category };
    } else {
      storeState.categories.push(category);
    }

    try {
      const conn = await pool.getConnection();
      await conn.query(
        `INSERT INTO product_categories (id, name, icon, description, image, badge, bg_tone)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name), icon = VALUES(icon), description = VALUES(description),
           image = VALUES(image), badge = VALUES(badge), bg_tone = VALUES(bg_tone)`,
        [category.id, category.name, category.icon || '🥜', category.description || '', category.image || '', category.badge || '', category.bgTone || 'bg-[#faf3e8]']
      );
      conn.release();
    } catch {}

    await logAdminAction('UPSERT_CATEGORY', 'Category', category.id, `Saved category "${category.name}"`);
    return res.json({ success: true, categories: storeState.categories });
  });

  app.post('/api/admin/categories/delete', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { categoryId } = req.body;
    if (categoryId === 'all') return res.status(400).json({ error: 'Cannot delete default all filter' });
    storeState.categories = storeState.categories.filter((c) => c.id !== categoryId);

    try {
      const conn = await pool.getConnection();
      await conn.query('DELETE FROM product_categories WHERE id = ?', [categoryId]);
      conn.release();
    } catch {}

    await logAdminAction('DELETE_CATEGORY', 'Category', categoryId, `Deleted category ${categoryId}`);
    return res.json({ success: true, categories: storeState.categories });
  });

  // Bundles (Store Essentials) Upsert & Delete
  app.post('/api/admin/bundles/upsert', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { bundle } = req.body;
    if (!bundle || !bundle.id || !bundle.name) return res.status(400).json({ error: 'Invalid bundle' });

    const discountPercent =
      bundle.originalPrice > bundle.price
        ? Math.round(((bundle.originalPrice - bundle.price) / bundle.originalPrice) * 100)
        : 0;

    const normalized: any = {
      ...bundle,
      price: Number(bundle.price),
      originalPrice: Number(bundle.originalPrice || bundle.price),
      discountPercent,
      variants: bundle.variants?.length ? bundle.variants : [{ size: 'Bundle Kit', price: Number(bundle.price), originalPrice: Number(bundle.originalPrice || bundle.price) }],
      nutrition: bundle.nutrition || { protein: '26g', calories: '160 kcal', carbs: '6g', fat: '3g', sugar: '0g', servingSize: '1 Kit' },
      features: Array.isArray(bundle.features) ? bundle.features : [],
      inStock: bundle.inStock !== undefined ? Boolean(bundle.inStock) : true,
    };

    const idx = storeState.bundles.findIndex((b) => b.id === normalized.id);
    if (idx > -1) storeState.bundles[idx] = normalized;
    else storeState.bundles.push(normalized);

    try {
      const conn = await pool.getConnection();
      await conn.query(
        `INSERT INTO product_bundles (id, name, tagline, category, price, original_price, discount_percent, rating, review_count, image, badge, has_free_gift, sku_code, stock_quantity, features, ingredients, description, in_stock)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name), tagline = VALUES(tagline), category = VALUES(category),
           price = VALUES(price), original_price = VALUES(original_price), discount_percent = VALUES(discount_percent),
           image = VALUES(image), badge = VALUES(badge), has_free_gift = VALUES(has_free_gift),
           stock_quantity = VALUES(stock_quantity), features = VALUES(features),
           ingredients = VALUES(ingredients), description = VALUES(description), in_stock = VALUES(in_stock)`,
        [
          normalized.id,
          normalized.name,
          normalized.tagline || '',
          normalized.category || 'Protein Powder',
          normalized.price,
          normalized.originalPrice,
          normalized.discountPercent,
          normalized.rating || 4.9,
          normalized.reviewCount || 150,
          normalized.image,
          normalized.badge || null,
          normalized.hasFreeGift || null,
          normalized.skuCode || null,
          normalized.stockQuantity || 100,
          JSON.stringify(normalized.features),
          normalized.ingredients || '',
          normalized.description || '',
          normalized.inStock ? 1 : 0,
        ]
      );
      conn.release();
    } catch {}

    await logAdminAction('UPSERT_BUNDLE', 'Bundle', normalized.id, `Saved Store Essential / Bundle "${normalized.name}"`);
    return res.json({ success: true, bundles: storeState.bundles });
  });

  app.post('/api/admin/bundles/delete', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { bundleId } = req.body;
    storeState.bundles = storeState.bundles.filter((b) => b.id !== bundleId);
    try {
      const conn = await pool.getConnection();
      await conn.query('DELETE FROM product_bundles WHERE id = ?', [bundleId]);
      conn.release();
    } catch {}
    await logAdminAction('DELETE_BUNDLE', 'Bundle', bundleId, `Removed bundle ${bundleId}`);
    return res.json({ success: true, bundles: storeState.bundles });
  });

  // Update Order Status, Courier & Tracking
  app.post('/api/admin/orders/update', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { orderId, orderStatus, trackingNumber, courierName, estimatedDelivery, notes } = req.body;
    const ord = storeState.orders.find((o) => o.orderId === orderId);
    if (!ord) return res.status(404).json({ error: 'Order not found' });

    if (orderStatus) ord.orderStatus = orderStatus;
    if (trackingNumber !== undefined) ord.trackingNumber = trackingNumber;
    if (courierName !== undefined) ord.courierName = courierName;
    if (estimatedDelivery !== undefined) ord.estimatedDelivery = estimatedDelivery;
    if (notes !== undefined) ord.notes = notes;

    try {
      const conn = await pool.getConnection();
      await conn.query(
        `UPDATE orders SET order_status = ?, tracking_number = ?, courier_name = ?, estimated_delivery = ?, notes = ? WHERE order_id = ?`,
        [ord.orderStatus, ord.trackingNumber || null, ord.courierName || null, ord.estimatedDelivery || null, ord.notes || null, orderId]
      );
      await conn.query(
        `INSERT INTO order_status_history (order_id, status, tracking_number, courier_name, note) VALUES (?, ?, ?, ?, ?)`,
        [orderId, ord.orderStatus, ord.trackingNumber || null, ord.courierName || null, ord.notes || 'Status updated via Admin Console']
      );
      conn.release();
    } catch {}

    await logAdminAction('UPDATE_ORDER', 'Order', orderId, `Updated order ${orderId} to status "${ord.orderStatus}"`);
    return res.json({ success: true, orders: storeState.orders });
  });

  // Returns & Refunds Management
  app.post('/api/admin/returns/upsert', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { returnRecord } = req.body;
    if (!returnRecord || !returnRecord.orderId) return res.status(400).json({ error: 'Invalid return record' });

    const id = returnRecord.id || `RET-${Math.floor(100 + Math.random() * 900)}`;
    const normalized = {
      ...returnRecord,
      id,
      refundAmount: Number(returnRecord.refundAmount || 0),
      createdAt: returnRecord.createdAt || new Date().toISOString().slice(0, 10),
    };

    const idx = storeState.returns.findIndex((r) => r.id === id);
    if (idx > -1) storeState.returns[idx] = normalized;
    else storeState.returns.unshift(normalized);

    try {
      const conn = await pool.getConnection();
      await conn.query(
        `INSERT INTO order_returns (id, order_id, customer_name, customer_email, reason, status, refund_amount, resolution_note, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           status = VALUES(status), refund_amount = VALUES(refund_amount), resolution_note = VALUES(resolution_note)`,
        [normalized.id, normalized.orderId, normalized.customerName, normalized.customerEmail, normalized.reason, normalized.status, normalized.refundAmount, normalized.resolutionNote || '', normalized.createdAt]
      );
      conn.release();
    } catch {}

    await logAdminAction('UPDATE_RETURN', 'OrderReturn', id, `Updated return ${id} for Order ${normalized.orderId} (${normalized.status})`);
    return res.json({ success: true, returns: storeState.returns });
  });

  // Coupons Upsert & Delete
  app.post('/api/admin/coupons/upsert', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { coupon } = req.body;
    if (!coupon || !coupon.code) return res.status(400).json({ error: 'Coupon code is required' });

    const code = String(coupon.code).toUpperCase().trim();
    const normalized = {
      ...coupon,
      code,
      discountValue: Number(coupon.discountValue || 10),
      minOrderAmount: Number(coupon.minOrderAmount || 0),
      maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : undefined,
      usageLimit: Number(coupon.usageLimit || 1000),
      usedCount: Number(coupon.usedCount || 0),
      isActive: coupon.isActive !== undefined ? Boolean(coupon.isActive) : true,
    };

    const idx = storeState.coupons.findIndex((c) => c.code === code);
    if (idx > -1) storeState.coupons[idx] = normalized;
    else storeState.coupons.unshift(normalized);

    try {
      const conn = await pool.getConnection();
      await conn.query(
        `INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_discount, usage_limit, used_count, free_gift_name, description, is_active, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           discount_type = VALUES(discount_type), discount_value = VALUES(discount_value),
           min_order_amount = VALUES(min_order_amount), max_discount = VALUES(max_discount),
           usage_limit = VALUES(usage_limit), free_gift_name = VALUES(free_gift_name),
           description = VALUES(description), is_active = VALUES(is_active), expires_at = VALUES(expires_at)`,
        [
          normalized.code,
          normalized.discountType,
          normalized.discountValue,
          normalized.minOrderAmount,
          normalized.maxDiscount || null,
          normalized.usageLimit,
          normalized.usedCount,
          normalized.freeGiftName || null,
          normalized.description || '',
          normalized.isActive ? 1 : 0,
          normalized.expiresAt || null,
        ]
      );
      conn.release();
    } catch {}

    await logAdminAction('UPSERT_COUPON', 'Coupon', code, `Saved promo code ${code} (${normalized.discountType === 'PERCENT' ? normalized.discountValue + '%' : '₹' + normalized.discountValue})`);
    return res.json({ success: true, coupons: storeState.coupons });
  });

  app.post('/api/admin/coupons/delete', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { code } = req.body;
    storeState.coupons = storeState.coupons.filter((c) => c.code !== code);
    try {
      const conn = await pool.getConnection();
      await conn.query('DELETE FROM coupons WHERE code = ?', [code]);
      conn.release();
    } catch {}
    await logAdminAction('DELETE_COUPON', 'Coupon', code, `Deleted promo code ${code}`);
    return res.json({ success: true, coupons: storeState.coupons });
  });

  // Flash Sales Upsert & Delete
  app.post('/api/admin/flash-sales/upsert', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { flashSale } = req.body;
    if (!flashSale || !flashSale.title) return res.status(400).json({ error: 'Invalid flash sale' });

    const id = flashSale.id || `flash-${Date.now()}`;
    const normalized = {
      ...flashSale,
      id,
      discountPercent: Number(flashSale.discountPercent || 15),
      isActive: flashSale.isActive !== undefined ? Boolean(flashSale.isActive) : true,
    };

    const idx = storeState.flashSales.findIndex((f) => f.id === id);
    if (idx > -1) storeState.flashSales[idx] = normalized;
    else storeState.flashSales.push(normalized);

    try {
      const conn = await pool.getConnection();
      await conn.query(
        `INSERT INTO flash_sales (id, title, discount_percent, category_filter, starts_at, ends_at, banner_text, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           title = VALUES(title), discount_percent = VALUES(discount_percent),
           category_filter = VALUES(category_filter), starts_at = VALUES(starts_at),
           ends_at = VALUES(ends_at), banner_text = VALUES(banner_text), is_active = VALUES(is_active)`,
        [normalized.id, normalized.title, normalized.discountPercent, normalized.categoryFilter || 'all', normalized.startsAt || '', normalized.endsAt || '', normalized.bannerText || '', normalized.isActive ? 1 : 0]
      );
      conn.release();
    } catch {}

    await logAdminAction('UPSERT_FLASH_SALE', 'FlashSale', id, `Saved Flash Sale "${normalized.title}"`);
    return res.json({ success: true, flashSales: storeState.flashSales });
  });

  app.post('/api/admin/flash-sales/delete', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.body;
    storeState.flashSales = storeState.flashSales.filter((f) => f.id !== id);
    try {
      const conn = await pool.getConnection();
      await conn.query('DELETE FROM flash_sales WHERE id = ?', [id]);
      conn.release();
    } catch {}
    await logAdminAction('DELETE_FLASH_SALE', 'FlashSale', id, `Deleted Flash Sale ${id}`);
    return res.json({ success: true, flashSales: storeState.flashSales });
  });

  // Comparison Matrix Rows Upsert & Delete
  app.post('/api/admin/comparison/upsert', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { row } = req.body;
    if (!row || !row.metric) return res.status(400).json({ error: 'Invalid comparison row' });

    const id = row.id || `comp-${Date.now()}`;
    const normalized = {
      ...row,
      id,
      sortOrder: Number(row.sortOrder || storeState.comparisonRows.length + 1),
      theproteinoHighlight: Boolean(row.theproteinoHighlight),
    };

    const idx = storeState.comparisonRows.findIndex((r) => r.id === id);
    if (idx > -1) storeState.comparisonRows[idx] = normalized;
    else storeState.comparisonRows.push(normalized);

    storeState.comparisonRows.sort((a, b) => a.sortOrder - b.sortOrder);

    try {
      const conn = await pool.getConnection();
      await conn.query(
        `INSERT INTO comparison_rows (id, metric, ghar_ka_khaana, theproteino, junk_food, theproteino_highlight, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           metric = VALUES(metric), ghar_ka_khaana = VALUES(ghar_ka_khaana),
           theproteino = VALUES(theproteino), junk_food = VALUES(junk_food),
           theproteino_highlight = VALUES(theproteino_highlight), sort_order = VALUES(sort_order)`,
        [normalized.id, normalized.metric, normalized.gharKaKhaana, normalized.theproteino, normalized.junkFood, normalized.theproteinoHighlight ? 1 : 0, normalized.sortOrder]
      );
      conn.release();
    } catch {}

    await logAdminAction('UPSERT_COMPARISON', 'ComparisonMatrix', id, `Saved comparison row "${normalized.metric}"`);
    return res.json({ success: true, comparisonRows: storeState.comparisonRows });
  });

  app.post('/api/admin/comparison/delete', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.body;
    storeState.comparisonRows = storeState.comparisonRows.filter((r) => r.id !== id);
    try {
      const conn = await pool.getConnection();
      await conn.query('DELETE FROM comparison_rows WHERE id = ?', [id]);
      conn.release();
    } catch {}
    await logAdminAction('DELETE_COMPARISON', 'ComparisonMatrix', id, `Deleted comparison row ${id}`);
    return res.json({ success: true, comparisonRows: storeState.comparisonRows });
  });

  // Reels Upsert & Delete
  app.post('/api/admin/reels/upsert', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { reel } = req.body;
    if (!reel || !reel.creatorName) return res.status(400).json({ error: 'Invalid reel' });

    const id = reel.id || `reel-${Date.now()}`;
    const linkedProd = storeState.products.find((p) => p.id === reel.linkedProductId) || storeState.products[0];
    const normalized = {
      ...reel,
      id,
      linkedProductId: linkedProd?.id || reel.linkedProductId,
      productName: reel.productName || linkedProd?.name || '',
      productPrice: Number(reel.productPrice || linkedProd?.price || 499),
      originalPrice: Number(reel.originalPrice || linkedProd?.originalPrice || 599),
    };

    const idx = storeState.reels.findIndex((r) => r.id === id);
    if (idx > -1) storeState.reels[idx] = normalized;
    else storeState.reels.push(normalized);

    try {
      const conn = await pool.getConnection();
      await conn.query(
        `INSERT INTO reels (id, creator_name, handle, caption, image, linked_product_id, product_name, product_price, original_price)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           creator_name = VALUES(creator_name), handle = VALUES(handle), caption = VALUES(caption),
           image = VALUES(image), linked_product_id = VALUES(linked_product_id),
           product_name = VALUES(product_name), product_price = VALUES(product_price), original_price = VALUES(original_price)`,
        [normalized.id, normalized.creatorName, normalized.handle, normalized.caption, normalized.image, normalized.linkedProductId, normalized.productName, normalized.productPrice, normalized.originalPrice]
      );
      conn.release();
    } catch {}

    await logAdminAction('UPSERT_REEL', 'Reel', id, `Saved community reel by ${normalized.creatorName}`);
    return res.json({ success: true, reels: storeState.reels });
  });

  app.post('/api/admin/reels/delete', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.body;
    storeState.reels = storeState.reels.filter((r) => r.id !== id);
    try {
      const conn = await pool.getConnection();
      await conn.query('DELETE FROM reels WHERE id = ?', [id]);
      conn.release();
    } catch {}
    await logAdminAction('DELETE_REEL', 'Reel', id, `Deleted reel ${id}`);
    return res.json({ success: true, reels: storeState.reels });
  });

  // FAQs Upsert & Delete
  app.post('/api/admin/faqs/upsert', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { faq } = req.body;
    if (!faq || !faq.question) return res.status(400).json({ error: 'Invalid FAQ' });

    const id = faq.id || `faq-${Date.now()}`;
    const normalized = {
      ...faq,
      id,
      sortOrder: Number(faq.sortOrder || storeState.faqs.length + 1),
      isActive: faq.isActive !== undefined ? Boolean(faq.isActive) : true,
    };

    const idx = storeState.faqs.findIndex((f) => f.id === id);
    if (idx > -1) storeState.faqs[idx] = normalized;
    else storeState.faqs.push(normalized);

    try {
      const conn = await pool.getConnection();
      await conn.query(
        `INSERT INTO faqs (id, question, answer, category, sort_order, is_active)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           question = VALUES(question), answer = VALUES(answer), category = VALUES(category),
           sort_order = VALUES(sort_order), is_active = VALUES(is_active)`,
        [normalized.id, normalized.question, normalized.answer, normalized.category || 'General', normalized.sortOrder, normalized.isActive ? 1 : 0]
      );
      conn.release();
    } catch {}

    await logAdminAction('UPSERT_FAQ', 'FAQ', id, `Saved FAQ "${normalized.question.slice(0, 40)}..."`);
    return res.json({ success: true, faqs: storeState.faqs });
  });

  app.post('/api/admin/faqs/delete', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.body;
    storeState.faqs = storeState.faqs.filter((f) => f.id !== id);
    try {
      const conn = await pool.getConnection();
      await conn.query('DELETE FROM faqs WHERE id = ?', [id]);
      conn.release();
    } catch {}
    await logAdminAction('DELETE_FAQ', 'FAQ', id, `Deleted FAQ ${id}`);
    return res.json({ success: true, faqs: storeState.faqs });
  });

  // CMS Policy Pages Upsert
  app.post('/api/admin/cms-pages/upsert', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { page } = req.body;
    if (!page || !page.slug) return res.status(400).json({ error: 'Invalid CMS page' });

    const idx = storeState.cmsPages.findIndex((p) => p.slug === page.slug);
    if (idx > -1) storeState.cmsPages[idx] = page;
    else storeState.cmsPages.push(page);

    try {
      const conn = await pool.getConnection();
      await conn.query(
        `INSERT INTO cms_pages (slug, title, subtitle, last_updated, content_html)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           title = VALUES(title), subtitle = VALUES(subtitle),
           last_updated = VALUES(last_updated), content_html = VALUES(content_html)`,
        [page.slug, page.title, page.subtitle || '', page.lastUpdated || 'November 2026', page.contentHtml]
      );
      conn.release();
    } catch {}

    await logAdminAction('UPDATE_POLICY_PAGE', 'CmsPage', page.slug, `Updated policy document "${page.title}"`);
    return res.json({ success: true, cmsPages: storeState.cmsPages });
  });

  // Review Moderation & Reply
  app.post('/api/admin/reviews/moderate', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { id, status, isPinned, adminReply, newReview } = req.body;

    if (newReview) {
      const created = {
        id: Date.now(),
        productId: newReview.productId,
        userName: newReview.userName,
        rating: Number(newReview.rating || 5),
        comment: newReview.comment,
        date: newReview.date || new Date().toISOString().slice(0, 10),
        status: 'approved' as const,
        isPinned: Boolean(newReview.isPinned),
        adminReply: newReview.adminReply || '',
      };
      storeState.reviews.unshift(created);
      try {
        const conn = await pool.getConnection();
        await conn.query(
          `INSERT INTO product_reviews (product_id, user_name, rating, comment, date, status, is_pinned, admin_reply)
           VALUES (?, ?, ?, ?, ?, 'approved', ?, ?)`,
          [created.productId, created.userName, created.rating, created.comment, created.date, created.isPinned ? 1 : 0, created.adminReply]
        );
        conn.release();
      } catch {}
      await logAdminAction('CREATE_REVIEW', 'Review', String(created.id), `Added verified review by ${created.userName}`);
      return res.json({ success: true, reviews: storeState.reviews });
    }

    const rev = storeState.reviews.find((r) => String(r.id) === String(id));
    if (rev) {
      if (status !== undefined) rev.status = status;
      if (isPinned !== undefined) rev.isPinned = Boolean(isPinned);
      if (adminReply !== undefined) rev.adminReply = adminReply;

      try {
        const conn = await pool.getConnection();
        await conn.query(
          `UPDATE product_reviews SET status = ?, is_pinned = ?, admin_reply = ? WHERE id = ?`,
          [rev.status || 'approved', rev.isPinned ? 1 : 0, rev.adminReply || null, id]
        );
        conn.release();
      } catch {}
      await logAdminAction('MODERATE_REVIEW', 'Review', String(id), `Moderated review #${id} (${rev.status})`);
    }
    return res.json({ success: true, reviews: storeState.reviews });
  });

  app.post('/api/admin/reviews/delete', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.body;
    storeState.reviews = storeState.reviews.filter((r) => String(r.id) !== String(id));
    try {
      const conn = await pool.getConnection();
      await conn.query('DELETE FROM product_reviews WHERE id = ?', [id]);
      conn.release();
    } catch {}
    await logAdminAction('DELETE_REVIEW', 'Review', String(id), `Deleted review #${id}`);
    return res.json({ success: true, reviews: storeState.reviews });
  });

  // Customer CRM & Loyalty Points Update
  app.post('/api/admin/customers/update', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { firebaseUid, loyaltyPoints, status, displayName, phone } = req.body;
    const cust = storeState.customers.find((c) => c.firebaseUid === firebaseUid);
    if (!cust) return res.status(404).json({ error: 'Customer not found' });

    if (loyaltyPoints !== undefined) cust.loyaltyPoints = Number(loyaltyPoints);
    if (status !== undefined) cust.status = status;
    if (displayName !== undefined) cust.displayName = displayName;
    if (phone !== undefined) cust.phone = phone;

    try {
      const conn = await pool.getConnection();
      await conn.query(
        `UPDATE users SET loyalty_points = ?, status = ?, display_name = ?, phone = ? WHERE firebase_uid = ?`,
        [cust.loyaltyPoints || 0, cust.status || 'active', cust.displayName || null, cust.phone || null, firebaseUid]
      );
      conn.release();
    } catch {}

    await logAdminAction('UPDATE_CUSTOMER', 'Customer', firebaseUid, `Updated CRM profile & loyalty points for ${cust.email}`);
    return res.json({ success: true, customers: storeState.customers });
  });

  // Support Tickets Reply & Status Update
  app.post('/api/admin/tickets/update', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { id, status, adminReply } = req.body;
    const tk = storeState.supportTickets.find((t) => t.id === id);
    if (tk) {
      if (status) tk.status = status;
      if (adminReply !== undefined) tk.adminReply = adminReply;
      try {
        const conn = await pool.getConnection();
        await conn.query(`UPDATE support_tickets SET status = ?, admin_reply = ? WHERE id = ?`, [tk.status, tk.adminReply || '', id]);
        conn.release();
      } catch {}
      await logAdminAction('UPDATE_TICKET', 'SupportTicket', tk.ticketCode, `Updated ticket ${tk.ticketCode} (${tk.status})`);
    }
    return res.json({ success: true, supportTickets: storeState.supportTickets });
  });

  // Abandoned Carts Recovery Update
  app.post('/api/admin/abandoned-carts/update', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { id, recoveryStatus } = req.body;
    const ac = storeState.abandonedCarts.find((a) => a.id === id);
    if (ac) {
      ac.recoveryStatus = recoveryStatus;
      try {
        const conn = await pool.getConnection();
        await conn.query(`UPDATE abandoned_carts SET recovery_status = ? WHERE id = ?`, [recoveryStatus, id]);
        conn.release();
      } catch {}
      await logAdminAction('RECOVER_CART', 'AbandonedCart', id, `Marked cart ${id} as ${recoveryStatus}`);
    }
    return res.json({ success: true, abandonedCarts: storeState.abandonedCarts });
  });

  // --------------------------------------------------------------------------
  // ALIGNED ADMIN ROUTES FOR DIRECT MYSQL PERSISTENCE & ZERO-GAP CONSOLE
  // --------------------------------------------------------------------------

  // 1. Order status update (/api/admin/orders/update-status)
  app.post('/api/admin/orders/update-status', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { orderId, status, orderStatus, courierName, trackingNumber } = req.body;
    const finalStatus = status || orderStatus;
    const ord = storeState.orders.find((o) => o.orderId === orderId);
    if (!ord) return res.status(404).json({ error: 'Order not found' });

    if (finalStatus) ord.orderStatus = finalStatus;
    if (courierName !== undefined) ord.courierName = courierName;
    if (trackingNumber !== undefined) ord.trackingNumber = trackingNumber;

    try {
      const conn = await pool.getConnection();
      await conn.query(
        `UPDATE orders SET order_status = ?, tracking_number = ?, courier_name = ? WHERE order_id = ?`,
        [ord.orderStatus, ord.trackingNumber || null, ord.courierName || null, orderId]
      );
      await conn.query(
        `INSERT INTO order_status_history (order_id, status, tracking_number, courier_name, note) VALUES (?, ?, ?, ?, ?)`,
        [orderId, ord.orderStatus, ord.trackingNumber || null, ord.courierName || null, 'Status updated via Admin Console']
      );
      conn.release();
    } catch (e: any) {
      console.warn('[ADMIN ORDER UPDATE NOTICE]:', e?.message);
    }

    await logAdminAction('UPDATE_ORDER', 'Order', orderId, `Updated order ${orderId} to status "${ord.orderStatus}"`);
    return res.json({ success: true, orders: storeState.orders });
  });

  // 2. Manual POS Order creation (/api/admin/orders/create-pos)
  app.post('/api/admin/orders/create-pos', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { customerName, customerEmail, customerPhone, shippingAddress, productId, quantity, paymentMethod } = req.body;
    if (!customerName || !customerEmail) {
      return res.status(400).json({ error: 'Customer name and email are required' });
    }

    const qty = Math.max(1, Number(quantity || 1));
    const prod = storeState.products.find((p) => p.id === productId) || storeState.products[0];
    const unitPrice = prod ? prod.price : 1999;
    const totalAmount = unitPrice * qty;
    const orderId = `PROT-${Math.floor(100000 + Math.random() * 900000)}`;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const orderItems = [
      {
        product: prod,
        selectedSize: prod.variants?.[0]?.size || 'Standard',
        selectedFlavor: prod.flavors?.[0] || 'Default',
        quantity: qty,
        unitPrice,
      },
    ];

    const newOrder: OrderRecord = {
      orderId,
      customerName,
      customerEmail,
      customerPhone: customerPhone || '',
      subtotal: totalAmount,
      totalAmount,
      discountAmount: 0,
      shippingFee: 0,
      paymentMethod: paymentMethod || 'POS Counter (Cash/Card)',
      orderStatus: 'confirmed',
      trackingNumber: '',
      courierName: 'In-Store / Direct Dispatch',
      estimatedDelivery: 'Immediate POS Handover',
      shippingAddress: shippingAddress || {
        fullName: customerName,
        email: customerEmail,
        phone: customerPhone || '',
        addressLine1: 'POS Direct Store Counter',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
      },
      items: orderItems,
      createdAt: nowStr,
    };

    storeState.orders.unshift(newOrder);

    // Decrement stock
    if (prod) {
      prod.stockQuantity = Math.max(0, (prod.stockQuantity ?? 100) - qty);
      const invLogId = `inv-${Date.now()}`;
      storeState.inventoryLogs.unshift({
        id: invLogId,
        productId: prod.id,
        productName: prod.name,
        variantSize: prod.variants?.[0]?.size || 'Standard',
        changeAmount: -qty,
        newStock: prod.stockQuantity,
        reason: `POS Manual Order #${orderId}`,
        createdAt: nowStr,
      });

      try {
        const conn = await pool.getConnection();
        await conn.query(
          `INSERT INTO orders (
            order_id, customer_name, customer_email, customer_phone, subtotal, total_amount,
            discount_amount, shipping_fee, payment_method, order_status, tracking_number,
            courier_name, estimated_delivery, shipping_address, items, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            customerName,
            customerEmail,
            customerPhone || '',
            totalAmount,
            totalAmount,
            0,
            0,
            newOrder.paymentMethod,
            'confirmed',
            '',
            newOrder.courierName,
            newOrder.estimatedDelivery,
            JSON.stringify(newOrder.shippingAddress),
            JSON.stringify(orderItems),
            nowStr,
          ]
        );

        await conn.query(`UPDATE products SET stock_quantity = ? WHERE id = ?`, [prod.stockQuantity, prod.id]);

        await conn.query(
          `INSERT INTO inventory_logs (id, product_id, product_name, variant_size, change_amount, new_stock, reason, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [invLogId, prod.id, prod.name, prod.variants?.[0]?.size || 'Standard', -qty, prod.stockQuantity, `POS Manual Order #${orderId}`, nowStr]
        );

        await conn.query(
          `INSERT INTO order_status_history (order_id, status, tracking_number, courier_name, note) VALUES (?, ?, ?, ?, ?)`,
          [orderId, 'confirmed', '', newOrder.courierName, 'Manual POS Counter Order Created']
        );

        conn.release();
      } catch (err: any) {
        console.warn('[POS MYSQL ERROR]:', err?.message);
      }
    }

    await logAdminAction('CREATE_POS_ORDER', 'Order', orderId, `Created manual POS order for ${customerName} (₹${totalAmount})`);
    return res.json({ success: true, orderId, order: newOrder, orders: storeState.orders });
  });

  // 3. Categories batch save (/api/admin/categories/save)
  app.post('/api/admin/categories/save', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { categories } = req.body;
    if (Array.isArray(categories)) {
      storeState.categories = categories;
      try {
        const conn = await pool.getConnection();
        for (const cat of categories) {
          if (cat.id && cat.id !== 'all') {
            await conn.query(
              `INSERT INTO product_categories (id, name, icon, description, badge)
               VALUES (?, ?, ?, ?, ?)
               ON DUPLICATE KEY UPDATE name=VALUES(name), icon=VALUES(icon), description=VALUES(description), badge=VALUES(badge)`,
              [cat.id, cat.name, cat.icon, cat.description || '', cat.badge || '']
            );
          }
        }
        conn.release();
      } catch (e: any) {
        console.warn('[CATEGORIES SAVE NOTICE]:', e?.message);
      }
      await logAdminAction('SAVE_CATEGORIES', 'Categories', 'Batch', `Saved ${categories.length} categories`);
    }
    return res.json({ success: true, categories: storeState.categories });
  });

  // 4. Bundles batch save (/api/admin/bundles/save)
  app.post('/api/admin/bundles/save', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { bundles } = req.body;
    if (Array.isArray(bundles)) {
      storeState.bundles = bundles;
      try {
        const conn = await pool.getConnection();
        for (const b of bundles) {
          await conn.query(
            `INSERT INTO product_bundles (id, name, tagline, category, price, original_price, discount_percent, image, badge, sku_code, stock_quantity, features, ingredients, description, in_stock)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE name=VALUES(name), tagline=VALUES(tagline), price=VALUES(price), original_price=VALUES(original_price), stock_quantity=VALUES(stock_quantity)`,
            [
              b.id,
              b.name,
              b.tagline || '',
              b.category || 'bundles',
              b.price,
              b.originalPrice,
              b.discountPercent || 0,
              b.image || '',
              b.badge || null,
              b.skuCode || `SKU-${b.id.toUpperCase()}`,
              b.stockQuantity || 100,
              JSON.stringify(b.features || []),
              b.ingredients || '',
              b.description || '',
              b.inStock ? 1 : 0,
            ]
          );
        }
        conn.release();
      } catch (e: any) {
        console.warn('[BUNDLES SAVE NOTICE]:', e?.message);
      }
      await logAdminAction('SAVE_BUNDLES', 'Bundles', 'Batch', `Saved ${bundles.length} bundles`);
    }
    return res.json({ success: true, bundles: storeState.bundles });
  });

  // 5. Inventory batch update (/api/admin/inventory/batch-update)
  app.post('/api/admin/inventory/batch-update', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { productId, changeAmount, reason } = req.body;
    const prod = storeState.products.find((p) => p.id === productId);
    if (!prod) return res.status(404).json({ error: 'Product not found' });

    const delta = Number(changeAmount || 0);
    const newStock = Math.max(0, (prod.stockQuantity ?? 100) + delta);
    prod.stockQuantity = newStock;
    const invId = `inv-${Date.now()}`;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const logEntry: InventoryLogRecord = {
      id: invId,
      productId: prod.id,
      productName: prod.name,
      variantSize: prod.variants?.[0]?.size || '1 kg',
      changeAmount: delta,
      newStock,
      reason: reason || 'Admin batch stock update',
      createdAt: nowStr,
    };
    storeState.inventoryLogs.unshift(logEntry);

    try {
      const conn = await pool.getConnection();
      await conn.query('UPDATE products SET stock_quantity = ? WHERE id = ?', [newStock, prod.id]);
      await conn.query(
        `INSERT INTO inventory_logs (id, product_id, product_name, variant_size, change_amount, new_stock, reason, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [invId, prod.id, prod.name, logEntry.variantSize, delta, newStock, logEntry.reason, nowStr]
      );
      conn.release();
    } catch (e: any) {
      console.warn('[INVENTORY MYSQL NOTICE]:', e?.message);
    }

    await logAdminAction('BATCH_STOCK_UPDATE', 'Product', prod.id, `Adjusted stock for ${prod.name} by ${delta > 0 ? `+${delta}` : delta} (New stock: ${newStock})`);
    return res.json({ success: true, products: storeState.products, inventoryLogs: storeState.inventoryLogs });
  });

  // 6. Returns status update (/api/admin/returns/update)
  app.post('/api/admin/returns/update', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { returnId, status } = req.body;
    const ret = storeState.returns.find((r) => r.id === returnId);
    if (ret) {
      ret.status = status;
      try {
        const conn = await pool.getConnection();
        await conn.query('UPDATE order_returns SET status = ? WHERE id = ?', [status, returnId]);
        conn.release();
      } catch (e: any) {
        console.warn('[RETURNS UPDATE NOTICE]:', e?.message);
      }
      await logAdminAction('UPDATE_RETURN', 'OrderReturn', returnId, `Set return status to ${status}`);
    }
    return res.json({ success: true, returns: storeState.returns });
  });

  // 7. Coupons save (/api/admin/coupons/save)
  app.post('/api/admin/coupons/save', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { coupons } = req.body;
    if (Array.isArray(coupons)) {
      storeState.coupons = coupons;
      try {
        const conn = await pool.getConnection();
        for (const c of coupons) {
          await conn.query(
            `INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_discount, usage_limit, used_count, free_gift_name, description, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE discount_type=VALUES(discount_type), discount_value=VALUES(discount_value), min_order_amount=VALUES(min_order_amount), is_active=VALUES(is_active)`,
            [
              c.code,
              c.discountType,
              c.discountValue,
              c.minOrderAmount || 0,
              c.maxDiscount || null,
              c.usageLimit || 1000,
              c.usedCount || 0,
              c.freeGiftName || null,
              c.description || '',
              c.isActive ? 1 : 0,
            ]
          );
        }
        conn.release();
      } catch (e: any) {
        console.warn('[COUPONS SAVE NOTICE]:', e?.message);
      }
      await logAdminAction('SAVE_COUPONS', 'Coupons', 'Batch', `Saved ${coupons.length} coupons to MySQL`);
    }
    return res.json({ success: true, coupons: storeState.coupons });
  });

  // 8. Customers loyalty points adjustment (/api/admin/customers/update-points)
  app.post('/api/admin/customers/update-points', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { uid, delta } = req.body;
    const cust = storeState.customers.find((c) => c.firebaseUid === uid || String(c.id) === String(uid) || c.email === uid);
    if (cust) {
      const change = Number(delta || 0);
      cust.loyaltyPoints = Math.max(0, (cust.loyaltyPoints || 0) + change);
      try {
        const conn = await pool.getConnection();
        await conn.query(
          `UPDATE users SET loyalty_points = ? WHERE firebase_uid = ? OR email = ?`,
          [cust.loyaltyPoints, cust.firebaseUid || '', cust.email]
        );
        conn.release();
      } catch (e: any) {
        console.warn('[CUSTOMER POINTS NOTICE]:', e?.message);
      }
      await logAdminAction('UPDATE_POINTS', 'Customer', cust.email, `Adjusted points by ${change > 0 ? `+${change}` : change} for ${cust.email}`);
    }
    return res.json({ success: true, customers: storeState.customers });
  });

  // 9. Reviews pin/delete action (/api/admin/reviews/action)
  app.post('/api/admin/reviews/action', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { id, action } = req.body;
    const rev = storeState.reviews.find((r) => r.id === Number(id));

    if (action === 'delete') {
      storeState.reviews = storeState.reviews.filter((r) => r.id !== Number(id));
      try {
        const conn = await pool.getConnection();
        await conn.query('DELETE FROM product_reviews WHERE id = ?', [Number(id)]);
        conn.release();
      } catch (e: any) {
        console.warn('[REVIEWS DELETE NOTICE]:', e?.message);
      }
      await logAdminAction('DELETE_REVIEW', 'ProductReview', String(id), `Deleted review #${id}`);
    } else if (action === 'pin' && rev) {
      rev.isPinned = !rev.isPinned;
      try {
        const conn = await pool.getConnection();
        await conn.query('UPDATE product_reviews SET is_pinned = ? WHERE id = ?', [rev.isPinned ? 1 : 0, Number(id)]);
        conn.release();
      } catch (e: any) {
        console.warn('[REVIEWS PIN NOTICE]:', e?.message);
      }
      await logAdminAction('PIN_REVIEW', 'ProductReview', String(id), `Toggled pin for review #${id}`);
    }

    return res.json({ success: true, reviews: storeState.reviews });
  });

  // 10. Support tickets reply (/api/admin/support/reply)
  app.post('/api/admin/support/reply', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { id, reply } = req.body;
    const tk = storeState.supportTickets.find((t) => t.id === String(id));
    if (tk) {
      tk.status = 'resolved';
      tk.adminReply = reply || 'Resolved by Support';
      try {
        const conn = await pool.getConnection();
        await conn.query(
          'UPDATE support_tickets SET status = ?, admin_reply = ? WHERE id = ?',
          ['resolved', tk.adminReply, String(id)]
        );
        conn.release();
      } catch (e: any) {
        console.warn('[SUPPORT REPLY NOTICE]:', e?.message);
      }
      await logAdminAction('RESOLVE_TICKET', 'SupportTicket', String(id), `Resolved support ticket #${id}`);
    }
    return res.json({ success: true, supportTickets: storeState.supportTickets });
  });

  // 11. Storefront CMS & Settings persistence routes:
  const saveGlobalSettingsToMySQL = async () => {
    try {
      const conn = await pool.getConnection();
      await conn.query(
        `INSERT INTO store_settings (setting_key, setting_value)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        ['global_settings', JSON.stringify(storeState.settings)]
      );
      conn.release();
    } catch (e: any) {
      console.warn('[STORE SETTINGS NOTICE]:', e?.message);
    }
  };

  app.post('/api/admin/cms/hero', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { topBar, hero } = req.body;
    if (topBar) storeState.settings.topBar = { ...storeState.settings.topBar, ...topBar };
    if (hero) storeState.settings.hero = { ...storeState.settings.hero, ...hero };
    await saveGlobalSettingsToMySQL();
    await logAdminAction('CMS_HERO', 'Settings', 'Hero', 'Updated Top Bar & Hero Banner settings');
    return res.json({ success: true, settings: storeState.settings });
  });

  app.post('/api/admin/cms/counters', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { liveCounter } = req.body;
    if (liveCounter) storeState.settings.liveCounter = { ...storeState.settings.liveCounter, ...liveCounter };
    await saveGlobalSettingsToMySQL();
    await logAdminAction('CMS_COUNTERS', 'Settings', 'Milestones', 'Updated Live Milestone Counters');
    return res.json({ success: true, settings: storeState.settings });
  });

  app.post('/api/admin/cms/brand-story', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { brandStory } = req.body;
    if (brandStory) storeState.settings.brandStory = { ...storeState.settings.brandStory, ...brandStory };
    await saveGlobalSettingsToMySQL();
    await logAdminAction('CMS_STORY', 'Settings', 'BrandStory', 'Updated Brand Story section');
    return res.json({ success: true, settings: storeState.settings });
  });

  app.post('/api/admin/cms/footer', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { footerConfig } = req.body;
    if (footerConfig) storeState.settings.footerConfig = { ...storeState.settings.footerConfig, ...footerConfig };
    await saveGlobalSettingsToMySQL();
    await logAdminAction('CMS_FOOTER', 'Settings', 'Footer', 'Updated Footer Configuration');
    return res.json({ success: true, settings: storeState.settings });
  });

  app.post('/api/admin/settings/shipping-tax', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { shippingAndTax } = req.body;
    if (shippingAndTax) storeState.settings.shippingAndTax = { ...storeState.settings.shippingAndTax, ...shippingAndTax };
    await saveGlobalSettingsToMySQL();
    await logAdminAction('SETTINGS_TAX', 'Settings', 'ShippingTax', 'Updated Shipping & GST Tax compliance rules');
    return res.json({ success: true, settings: storeState.settings });
  });

  app.post('/api/admin/settings/payments', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { paymentConfig } = req.body;
    if (paymentConfig) storeState.settings.paymentConfig = { ...storeState.settings.paymentConfig, ...paymentConfig };
    await saveGlobalSettingsToMySQL();
    await logAdminAction('SETTINGS_PAYMENTS', 'Settings', 'Payments', 'Updated Payment Gateway toggles');
    return res.json({ success: true, settings: storeState.settings });
  });

  app.post('/api/admin/settings/seo', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { seoConfig } = req.body;
    if (seoConfig) storeState.settings.seoConfig = { ...storeState.settings.seoConfig, ...seoConfig };
    await saveGlobalSettingsToMySQL();
    await logAdminAction('SETTINGS_SEO', 'Settings', 'SEO', 'Updated Global Meta SEO settings');
    return res.json({ success: true, settings: storeState.settings });
  });

  // 12. Admin Deploy Trigger (/api/admin/deploy-trigger)
  app.post('/api/admin/deploy-trigger', async (req, res) => {
    if (!verifyPin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const deployScript = path.resolve(__dirname, 'deploy.sh');
    if (!fs.existsSync(deployScript)) {
      return res.status(500).json({ success: false, error: 'deploy.sh not found' });
    }
    const child = spawn('bash', [deployScript], {
      cwd: __dirname,
      stdio: 'inherit',
      detached: true,
    });
    child.on('error', (err) => {
      console.error('[ADMIN DEPLOY ERROR]:', err);
    });
    child.unref();
    await logAdminAction('TRIGGER_DEPLOY', 'Deployment', 'deploy.sh', 'Admin triggered production deploy script');
    return res.json({ success: true, message: 'Deployment triggered in background' });
  });

  // ============================================================================
  // VPS AUTO-DEPLOY ENDPOINT (/update)
  // ============================================================================
  app.all('/update', (req, res) => {
    const deployScript = path.resolve(__dirname, 'deploy.sh');

    if (!fs.existsSync(deployScript)) {
      console.error(`[UPDATE ERROR]: deploy.sh not found at ${deployScript}`);
      if (req.accepts('html')) {
        return res.status(500).send(`
          <!DOCTYPE html>
          <html>
            <head><title>Update Failed - Theproteino</title></head>
            <body style="font-family: -apple-system, sans-serif; background: #fff5f5; color: #c53030; padding: 40px; text-align: center;">
              <h2>❌ Error: deploy.sh not found in root</h2>
              <p>Make sure deploy.sh exists at <code>${deployScript}</code></p>
            </body>
          </html>
        `);
      }
      return res.status(500).json({ success: false, error: 'deploy.sh not found in root directory' });
    }

    logAdminAction('VPS_AUTO_DEPLOY', 'Deployment', 'deploy.sh', `Triggered /update auto-deploy script from ${req.ip}`);

    if (req.accepts('html') && req.method === 'GET') {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Theproteino - Auto Deploy</title>
            <meta http-equiv="refresh" content="15;url=/" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #fbf7f0; color: #1a221b; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
              .card { background: white; border-radius: 24px; padding: 36px; max-width: 500px; text-align: center; box-shadow: 0 12px 35px rgba(0,0,0,0.06); border: 1px solid #e7decb; }
              .spinner { width: 44px; height: 44px; border: 4px solid #e2ebd8; border-top-color: #00632d; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }
              @keyframes spin { to { transform: rotate(360deg); } }
              h2 { margin: 0 0 12px; color: #00632d; font-size: 22px; }
              p { font-size: 14px; color: #5a5043; line-height: 1.5; margin: 0 0 16px; }
              code { background: #eaf4ec; color: #00632d; padding: 4px 8px; border-radius: 6px; font-size: 13px; font-weight: 600; display: inline-block; margin-top: 6px; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="spinner"></div>
              <h2>Deploy Script Triggered!</h2>
              <p>Executing <code>deploy.sh</code> in background: pulling latest code from GitHub, running <code>npm run build</code>, and restarting PM2.</p>
              <p style="font-size: 12px; color: #8a7a66;">Redirecting back to homepage in 15 seconds...</p>
            </div>
          </body>
        </html>
      `);
    } else {
      res.status(200).json({
        success: true,
        message: 'Auto-deployment process started successfully with deploy.sh',
        triggeredAt: new Date().toISOString(),
      });
    }

    const child = spawn('bash', [deployScript], {
      cwd: __dirname,
      stdio: 'inherit',
      detached: true,
    });

    child.on('error', (err) => {
      console.error('[UPDATE ROUTE ERROR] Failed to spawn deploy.sh:', err);
    });

    child.unref();
  });

  if (IS_DEV) {
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const indexPath = path.resolve(__dirname, 'index.html');
        const rawHtml = fs.readFileSync(indexPath, 'utf-8');
        const template = await vite.transformIndexHtml(url, rawHtml);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();
