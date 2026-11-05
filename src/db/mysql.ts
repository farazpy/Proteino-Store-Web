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

    // 4. Product Categories table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_categories (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        icon VARCHAR(16) NOT NULL,
        description TEXT NULL,
        image TEXT NULL,
        badge VARCHAR(64) NULL,
        bg_tone VARCHAR(64) NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. Products table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        tagline TEXT NOT NULL,
        category_id VARCHAR(64) NOT NULL,
        price INT NOT NULL,
        original_price INT NOT NULL,
        discount_percent INT NOT NULL,
        rating DECIMAL(3, 2) NOT NULL,
        review_count INT NOT NULL,
        image TEXT NOT NULL,
        secondary_image TEXT NULL,
        badge VARCHAR(64) NULL,
        is_bestseller TINYINT(1) DEFAULT 0,
        has_free_gift TEXT NULL,
        nutrition JSON NULL,
        features JSON NULL,
        ingredients TEXT NULL,
        description TEXT NULL,
        in_stock TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_prod_cat (category_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. Product Variants table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_variants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(64) NOT NULL,
        size VARCHAR(64) NOT NULL,
        price INT NOT NULL,
        original_price INT NOT NULL,
        INDEX idx_var_prod (product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 7. Product Flavors table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_flavors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(64) NOT NULL,
        flavor VARCHAR(128) NOT NULL,
        INDEX idx_flav_prod (product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 8. Reels table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS reels (
        id VARCHAR(64) PRIMARY KEY,
        creator_name VARCHAR(255) NOT NULL,
        handle VARCHAR(255) NOT NULL,
        caption TEXT NOT NULL,
        image TEXT NOT NULL,
        linked_product_id VARCHAR(64) NULL,
        product_name VARCHAR(255) NULL,
        product_price INT NULL,
        original_price INT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Seeding logic (only if empty)
    const [catCount]: any = await connection.query('SELECT COUNT(*) as count FROM product_categories');
    if (catCount[0].count === 0) {
      console.log('[DATABASE SEED]: Seeding initial product data...');
      
      const { CATEGORIES, PRODUCTS, REELS_DATA } = await import('../data/products.ts');

      // Seed Categories
      const uiCategories = [
        { id: 'Protein Powder', description: '26g Cold Brew Arabica', image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=300&q=80', badge: '26g Protein', bgTone: 'bg-[#faf3e8]' },
        { id: 'Protein Oats', description: 'Dark Choco & Super Seeds', image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=300&q=80', badge: '27g Protein', bgTone: 'bg-[#f4ecdf]' },
        { id: 'Masala Oats', description: '2-Min Desi Tadka Oats', image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=300&q=80', badge: '2 Min Meal', bgTone: 'bg-[#fbf1e4]' },
        { id: 'Peanut Butter', description: '100% Bold Roasted Peanuts', image: 'https://images.unsplash.com/photo-1588791174744-7e9bf4378277?auto=format&fit=crop&w=300&q=80', badge: '100% Peanuts', bgTone: 'bg-[#faefe1]' },
        { id: 'Super Bar', description: '15g Clean On-the-Go Fuel', image: '/images/super-bar-card.png', badge: '15g Clean Fuel', bgTone: 'bg-[#f3ebe1]' },
        { id: 'Super Muesli', description: '40% Nuts & Berries', image: 'https://images.unsplash.com/photo-1517456793572-1d8efd6dc135?auto=format&fit=crop&w=300&q=80', badge: '40% Nuts & Berries', bgTone: 'bg-[#f8f1ea]' },
      ];

      for (const cat of CATEGORIES) {
        if (cat.id === 'all') continue;
        const ui = uiCategories.find(u => u.id === cat.id);
        await connection.query(
          'INSERT INTO product_categories (id, name, icon, description, image, badge, bg_tone) VALUES (?, ?, ?, ?, ?, ?, ?)', 
          [cat.id, cat.name, cat.icon, ui?.description || null, ui?.image || null, ui?.badge || null, ui?.bgTone || null]
        );
      }

      // Seed Products
      for (const prod of PRODUCTS) {
        await connection.query(`
          INSERT INTO products (
            id, name, tagline, category_id, price, original_price, discount_percent, 
            rating, review_count, image, secondary_image, badge, is_bestseller, 
            has_free_gift, nutrition, features, ingredients, description, in_stock
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          prod.id, prod.name, prod.tagline, prod.category, prod.price, prod.originalPrice, prod.discountPercent,
          prod.rating, prod.reviewCount, prod.image, prod.secondaryImage || null, prod.badge || null, prod.isBestseller ? 1 : 0,
          prod.hasFreeGift || null, JSON.stringify(prod.nutrition), JSON.stringify(prod.features), prod.ingredients, prod.description, prod.inStock ? 1 : 0
        ]);

        // Seed Variants
        for (const v of prod.variants) {
          await connection.query('INSERT INTO product_variants (product_id, size, price, original_price) VALUES (?, ?, ?, ?)', [prod.id, v.size, v.price, v.originalPrice]);
        }

        // Seed Flavors
        if (prod.flavors) {
          for (const f of prod.flavors) {
            await connection.query('INSERT INTO product_flavors (product_id, flavor) VALUES (?, ?)', [prod.id, f]);
          }
        }
      }

      // Seed Reels
      for (const r of REELS_DATA) {
        await connection.query(`
          INSERT INTO reels (id, creator_name, handle, caption, image, linked_product_id, product_name, product_price, original_price)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [r.id, r.creatorName, r.handle, r.caption, r.image, r.linkedProductId || null, r.productName || null, r.productPrice || null, r.originalPrice || null]);
      }
      
      console.log('[DATABASE SEED]: Seeding completed.');
    }

    connection.release();
    console.log('[DATABASE SCHEMA]: All tables verified/initialized.');
  } catch (err) {
    console.warn('[DATABASE SCHEMA ERROR]:', err);
  }
}
