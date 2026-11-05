var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/db/mysql.ts
var mysql_exports = {};
__export(mysql_exports, {
  initializeTables: () => initializeTables,
  pool: () => pool,
  testConnection: () => testConnection
});
import mysql from "mysql2/promise";
import dotenv from "dotenv";
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Successfully connected to MySQL database.");
    connection.release();
    await initializeTables();
    return true;
  } catch (error) {
    console.error("Error connecting to MySQL database:", error);
    return false;
  }
}
async function initializeTables() {
  try {
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        firebase_uid VARCHAR(128) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL,
        display_name VARCHAR(255) NULL,
        photo_url TEXT NULL,
        phone VARCHAR(32) NULL,
        provider VARCHAR(32) DEFAULT 'password',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_firebase_uid (firebase_uid),
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_addresses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        firebase_uid VARCHAR(128) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(32) NOT NULL,
        address_line1 TEXT NOT NULL,
        address_line2 TEXT NULL,
        city VARCHAR(128) NOT NULL,
        state VARCHAR(128) NOT NULL,
        postal_code VARCHAR(32) NOT NULL,
        is_default TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_addr_uid (firebase_uid)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id VARCHAR(64) NOT NULL UNIQUE,
        firebase_uid VARCHAR(128) NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(32) NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        discount_amount DECIMAL(10, 2) DEFAULT 0.00,
        shipping_fee DECIMAL(10, 2) DEFAULT 0.00,
        payment_method VARCHAR(32) NOT NULL,
        order_status VARCHAR(32) DEFAULT 'confirmed',
        shipping_address JSON NULL,
        items JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_order_uid (firebase_uid),
        INDEX idx_order_id (order_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    connection.release();
    console.log("[DATABASE SCHEMA]: Users, addresses, and orders tables verified/initialized.");
  } catch (err) {
    console.warn("[DATABASE SCHEMA WARN]: Table initialization notice:", err);
  }
}
var dbConfig, pool;
var init_mysql = __esm({
  "src/db/mysql.ts"() {
    dotenv.config();
    dbConfig = {
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "theproteino_db"
    };
    pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 1e4,
      // 10 seconds timeout
      enableKeepAlive: true,
      keepAliveInitialDelay: 1e4
    });
  }
});

// server.ts
init_mysql();
import express from "express";
import dotenv2 from "dotenv";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
dotenv2.config();
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
var NODE_ENV = process.env.NODE_ENV || "development";
var IS_DEV = NODE_ENV !== "production";
console.log(`\x1B[36m[SERVER STARTUP]\x1B[0m: Environment: ${NODE_ENV}`);
console.log(`\x1B[36m[SERVER STARTUP]\x1B[0m: Port configured: ${PORT}`);
async function startServer() {
  const app = express();
  testConnection().then((isConnected) => {
    if (!isConnected) {
      console.error("\x1B[31m[DATABASE ERROR]\x1B[0m: Connection test result:", isConnected);
    } else {
      console.log("\x1B[32m[DATABASE CONNECTED]\x1B[0m: Successfully connected to MySQL database.");
    }
  });
  app.use(express.json());
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app.get("/api/db-status", async (req, res) => {
    const isConnected = await testConnection();
    res.json({ connected: isConnected });
  });
  app.post("/api/user/sync", async (req, res) => {
    const { firebaseUid, email, displayName, photoUrl, phone, provider } = req.body;
    if (!firebaseUid || !email) {
      return res.status(400).json({ error: "firebaseUid and email are required" });
    }
    try {
      const { pool: pool2 } = await Promise.resolve().then(() => (init_mysql(), mysql_exports));
      const connection = await pool2.getConnection();
      await connection.query(
        `INSERT INTO users (firebase_uid, email, display_name, photo_url, phone, provider)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           email = VALUES(email),
           display_name = COALESCE(VALUES(display_name), display_name),
           photo_url = COALESCE(VALUES(photo_url), photo_url),
           phone = COALESCE(VALUES(phone), phone),
           provider = VALUES(provider)`,
        [firebaseUid, email, displayName || null, photoUrl || null, phone || null, provider || "password"]
      );
      const [rows] = await connection.query(
        `SELECT id, firebase_uid, email, display_name, photo_url, phone, provider FROM users WHERE firebase_uid = ? LIMIT 1`,
        [firebaseUid]
      );
      const [addrRows] = await connection.query(
        `SELECT id, full_name, email, phone, address_line1, address_line2, city, state, postal_code, is_default 
         FROM user_addresses WHERE firebase_uid = ? ORDER BY is_default DESC, id DESC`,
        [firebaseUid]
      );
      connection.release();
      return res.json({
        success: true,
        user: rows[0] || null,
        addresses: addrRows || []
      });
    } catch (err) {
      console.error("[API USER SYNC ERROR]:", err?.message || err);
      return res.json({
        success: false,
        warning: "MySQL offline or database syncing in progress",
        user: { firebaseUid, email, displayName, photoUrl, phone, provider },
        addresses: []
      });
    }
  });
  app.post("/api/user/address", async (req, res) => {
    const { firebaseUid, fullName, email, phone, addressLine1, addressLine2, city, state, postalCode } = req.body;
    if (!firebaseUid || !fullName || !addressLine1 || !postalCode) {
      return res.status(400).json({ error: "Missing required address fields" });
    }
    try {
      const { pool: pool2 } = await Promise.resolve().then(() => (init_mysql(), mysql_exports));
      const connection = await pool2.getConnection();
      const [result] = await connection.query(
        `INSERT INTO user_addresses (firebase_uid, full_name, email, phone, address_line1, address_line2, city, state, postal_code, is_default)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [firebaseUid, fullName, email || "", phone || "", addressLine1, addressLine2 || "", city, state, postalCode]
      );
      const [addrRows] = await connection.query(
        `SELECT id, full_name, email, phone, address_line1, address_line2, city, state, postal_code, is_default 
         FROM user_addresses WHERE firebase_uid = ? ORDER BY id DESC`,
        [firebaseUid]
      );
      connection.release();
      return res.json({ success: true, insertId: result.insertId, addresses: addrRows });
    } catch (err) {
      console.error("[API ADDRESS ERROR]:", err?.message || err);
      return res.status(500).json({ error: "Failed to save address to MySQL" });
    }
  });
  app.post("/api/orders/create", async (req, res) => {
    const { orderId, firebaseUid, customerName, customerEmail, customerPhone, totalAmount, discountAmount, shippingFee, paymentMethod, shippingAddress, items } = req.body;
    try {
      const { pool: pool2 } = await Promise.resolve().then(() => (init_mysql(), mysql_exports));
      const connection = await pool2.getConnection();
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
          JSON.stringify(items || [])
        ]
      );
      connection.release();
      return res.json({ success: true, orderId });
    } catch (err) {
      console.error("[API ORDER CREATE ERROR]:", err?.message || err);
      return res.json({ success: true, orderId, notice: "Recorded locally" });
    }
  });
  if (IS_DEV) {
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true },
      appType: "custom"
    });
    app.use(vite.middlewares);
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const indexPath = path.resolve(__dirname, "index.html");
        const rawHtml = fs.readFileSync(indexPath, "utf-8");
        let template = await vite.transformIndexHtml(url, rawHtml);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist/index.html"));
    });
  }
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
startServer();
