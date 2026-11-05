import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'theproteino_db',
};

// Create a connection pool to MySQL
export const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000, // 10 seconds timeout
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

/**
 * Helper to check database connection
 */
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to MySQL database.');
    connection.release();
    // Initialize tables if connected
    await initializeTables();
    return true;
  } catch (error) {
    console.error('Error connecting to MySQL database:', error);
    return false;
  }
}

/**
 * Initialize MySQL tables for users, addresses, and order records
 * strictly non-destructive (only CREATE TABLE IF NOT EXISTS)
 */
export async function initializeTables() {
  try {
    const connection = await pool.getConnection();
    
    // 1. Users table
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

    // 2. User addresses table
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

    // 3. User orders table
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
    console.log('[DATABASE SCHEMA]: Users, addresses, and orders tables verified/initialized.');
  } catch (err) {
    console.warn('[DATABASE SCHEMA WARN]: Table initialization notice:', err);
  }
}
