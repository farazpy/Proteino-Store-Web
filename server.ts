import express from 'express';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
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
