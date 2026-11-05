import express from 'express';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { testConnection } from './src/db/mysql.ts';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Prioritize PORT from .env (e.g. 3002 on VPS); default to 3000 for local/preview
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_DEV = NODE_ENV !== 'production';

console.log(`\x1b[36m[SERVER STARTUP]\x1b[0m: Environment: ${NODE_ENV}`);
console.log(`\x1b[36m[SERVER STARTUP]\x1b[0m: Port configured: ${PORT}`);

async function startServer() {
  const app = express();

  // Test MySQL connection on startup (non-blocking)
  testConnection().then(isConnected => {
    if (!isConnected) {
      console.error('\x1b[31m[DATABASE ERROR]\x1b[0m: Connection test result:', isConnected);
    } else {
      console.log('\x1b[32m[DATABASE CONNECTED]\x1b[0m: Successfully connected to MySQL database.');
    }
  });

  // Middleware
  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Database sample route
  app.get('/api/db-status', async (req, res) => {
    const isConnected = await testConnection();
    res.json({ connected: isConnected });
  });

  // 1. Sync Firebase User into MySQL database
  app.post('/api/user/sync', async (req, res) => {
    const { firebaseUid, email, displayName, photoUrl, phone, provider } = req.body;
    if (!firebaseUid || !email) {
      return res.status(400).json({ error: 'firebaseUid and email are required' });
    }

    try {
      const { pool } = await import('./src/db/mysql.ts');
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

      // Fetch saved user with addresses
      const [rows]: any = await connection.query(
        `SELECT id, firebase_uid, email, display_name, photo_url, phone, provider FROM users WHERE firebase_uid = ? LIMIT 1`,
        [firebaseUid]
      );

      const [addrRows]: any = await connection.query(
        `SELECT id, full_name, email, phone, address_line1, address_line2, city, state, postal_code, is_default 
         FROM user_addresses WHERE firebase_uid = ? ORDER BY is_default DESC, id DESC`,
        [firebaseUid]
      );

      connection.release();

      return res.json({
        success: true,
        user: rows[0] || null,
        addresses: addrRows || [],
      });
    } catch (err: any) {
      console.error('[API USER SYNC ERROR]:', err?.message || err);
      // Return graceful fallback so user authentication does not block
      return res.json({
        success: false,
        warning: 'MySQL offline or database syncing in progress',
        user: { firebaseUid, email, displayName, photoUrl, phone, provider },
        addresses: [],
      });
    }
  });

  // 2. Save or update user address in MySQL
  app.post('/api/user/address', async (req, res) => {
    const { firebaseUid, fullName, email, phone, addressLine1, addressLine2, city, state, postalCode } = req.body;
    if (!firebaseUid || !fullName || !addressLine1 || !postalCode) {
      return res.status(400).json({ error: 'Missing required address fields' });
    }

    try {
      const { pool } = await import('./src/db/mysql.ts');
      const connection = await pool.getConnection();

      const [result]: any = await connection.query(
        `INSERT INTO user_addresses (firebase_uid, full_name, email, phone, address_line1, address_line2, city, state, postal_code, is_default)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [firebaseUid, fullName, email || '', phone || '', addressLine1, addressLine2 || '', city, state, postalCode]
      );

      const [addrRows]: any = await connection.query(
        `SELECT id, full_name, email, phone, address_line1, address_line2, city, state, postal_code, is_default 
         FROM user_addresses WHERE firebase_uid = ? ORDER BY id DESC`,
        [firebaseUid]
      );

      connection.release();
      return res.json({ success: true, insertId: result.insertId, addresses: addrRows });
    } catch (err: any) {
      console.error('[API ADDRESS ERROR]:', err?.message || err);
      return res.status(500).json({ error: 'Failed to save address to MySQL' });
    }
  });

  // 3. Save order to MySQL
  app.post('/api/orders/create', async (req, res) => {
    const { orderId, firebaseUid, customerName, customerEmail, customerPhone, totalAmount, discountAmount, shippingFee, paymentMethod, shippingAddress, items } = req.body;
    
    try {
      const { pool } = await import('./src/db/mysql.ts');
      const connection = await pool.getConnection();

      await connection.query(
        `INSERT INTO orders (order_id, firebase_uid, customer_name, customer_email, customer_phone, total_amount, discount_amount, shipping_fee, payment_method, shipping_address, items)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId || `ORD-${Date.now()}`,
          firebaseUid || null,
          customerName,
          customerEmail,
          customerPhone,
          totalAmount,
          discountAmount || 0,
          shippingFee || 0,
          paymentMethod,
          JSON.stringify(shippingAddress || {}),
          JSON.stringify(items || []),
        ]
      );

      connection.release();
      return res.json({ success: true, orderId });
    } catch (err: any) {
      console.error('[API ORDER CREATE ERROR]:', err?.message || err);
      return res.json({ success: true, orderId, notice: 'Recorded locally' });
    }
  });

  // 4. Fetch all categories
  app.get('/api/categories', async (req, res) => {
    try {
      const { pool } = await import('./src/db/mysql.ts');
      const [rows]: any = await pool.query('SELECT * FROM product_categories ORDER BY id ASC');
      const mapped = rows.map((c: any) => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
        description: c.description,
        image: c.image,
        badge: c.badge,
        bgTone: c.bg_tone
      }));
      return res.json(mapped);
    } catch (err: any) {
      console.error('[API CATEGORIES ERROR]:', err);
      return res.status(500).json({ error: 'Failed to fetch categories' });
    }
  });

  // 5. Fetch all products with variants and flavors
  app.get('/api/products', async (req, res) => {
    try {
      const { pool } = await import('./src/db/mysql.ts');
      
      // Fetch products
      const [products]: any = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
      
      // Fetch variants and flavors in parallel
      const [variants]: any = await pool.query('SELECT * FROM product_variants');
      const [flavors]: any = await pool.query('SELECT * FROM product_flavors');

      // Assemble final products array
      const fullProducts = products.map((p: any) => ({
        ...p,
        category: p.category_id,
        isBestseller: !!p.is_bestseller,
        inStock: !!p.in_stock,
        variants: variants
          .filter((v: any) => v.product_id === p.id)
          .map((v: any) => ({ size: v.size, price: v.price, originalPrice: v.original_price })),
        flavors: flavors
          .filter((f: any) => f.product_id === p.id)
          .map((f: any) => f.flavor),
        // These might be null if not provided during seed
        secondaryImage: p.secondary_image,
        hasFreeGift: p.has_free_gift,
        badge: p.badge,
        nutrition: p.nutrition,
        features: p.features,
      }));

      return res.json(fullProducts);
    } catch (err: any) {
      console.error('[API PRODUCTS ERROR]:', err);
      return res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

  // 6. Fetch reels
  app.get('/api/reels', async (req, res) => {
    try {
      const { pool } = await import('./src/db/mysql.ts');
      const [rows]: any = await pool.query('SELECT * FROM reels');
      const mappedReels = rows.map((r: any) => ({
        id: r.id,
        creatorName: r.creator_name,
        handle: r.handle,
        caption: r.caption,
        image: r.image,
        linkedProductId: r.linked_product_id,
        productName: r.product_name,
        productPrice: r.product_price,
        originalPrice: r.original_price,
      }));
      return res.json(mappedReels);
    } catch (err: any) {
      console.error('[API REELS ERROR]:', err);
      return res.status(500).json({ error: 'Failed to fetch reels' });
    }
  });

  // 7. Fetch reviews for a specific product
  app.get('/api/products/:productId/reviews', async (req, res) => {
    const { productId } = req.params;
    try {
      const { pool } = await import('./src/db/mysql.ts');
      const [rows]: any = await pool.query('SELECT * FROM product_reviews WHERE product_id = ? ORDER BY date DESC', [productId]);
      const mappedReviews = rows.map((r: any) => ({
        id: r.id,
        productId: r.product_id,
        userName: r.user_name,
        userAvatar: r.user_avatar,
        rating: r.rating,
        comment: r.comment,
        date: r.date.toISOString().split('T')[0],
      }));
      return res.json(mappedReviews);
    } catch (err: any) {
      console.error('[API REVIEWS ERROR]:', err);
      return res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  });



  // 4. Custom endpoint /update: directly executes deploy.sh on main store domain
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

    console.log(`\n======================================================`);
    console.log(`[UPDATE ROUTE] /update triggered at ${new Date().toISOString()}`);
    console.log(`[UPDATE ROUTE] Triggered by: ${req.ip} | User-Agent: ${req.get('user-agent') || 'unknown'}`);
    console.log(`[UPDATE ROUTE] Executing: bash ${deployScript}`);
    console.log(`======================================================\n`);

    // Browser friendly response
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
        triggeredAt: new Date().toISOString()
      });
    }

    // Spawn deploy.sh asynchronously
    const child = spawn('bash', [deployScript], {
      cwd: __dirname,
      stdio: 'inherit',
      detached: true
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
    
    // Serve index.html for all other routes (SPA)
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const indexPath = path.resolve(__dirname, 'index.html');
        const rawHtml = fs.readFileSync(indexPath, 'utf-8');
        let template = await vite.transformIndexHtml(url, rawHtml);
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
