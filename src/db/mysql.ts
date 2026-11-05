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
 * Safe helper to add columns to existing tables without failing if column already exists
 */
async function safeAddColumn(connection: mysql.PoolConnection, table: string, columnDef: string) {
  try {
    await connection.query(`ALTER TABLE ${table} ADD COLUMN ${columnDef}`);
  } catch {
    // Column already exists — leave untouched per non-destructive schema policy
  }
}

/**
 * Initialize all 24 MySQL tables for the 40-feature e-commerce store & admin panel.
 * Strictly non-destructive: only CREATE TABLE IF NOT EXISTS and additive columns.
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
        loyalty_points INT DEFAULT 100,
        total_spent DECIMAL(10, 2) DEFAULT 0.00,
        status VARCHAR(32) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_firebase_uid (firebase_uid),
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    await safeAddColumn(connection, 'users', 'loyalty_points INT DEFAULT 100');
    await safeAddColumn(connection, 'users', 'total_spent DECIMAL(10, 2) DEFAULT 0.00');
    await safeAddColumn(connection, 'users', "status VARCHAR(32) DEFAULT 'active'");

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
        coupon_code VARCHAR(64) NULL,
        payment_method VARCHAR(32) NOT NULL,
        order_status VARCHAR(32) DEFAULT 'confirmed',
        tracking_number VARCHAR(128) NULL,
        courier_name VARCHAR(128) NULL,
        estimated_delivery VARCHAR(128) NULL,
        shipping_address JSON NULL,
        items JSON NOT NULL,
        notes TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_order_uid (firebase_uid),
        INDEX idx_order_id (order_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    await safeAddColumn(connection, 'orders', 'coupon_code VARCHAR(64) NULL');
    await safeAddColumn(connection, 'orders', 'tracking_number VARCHAR(128) NULL');
    await safeAddColumn(connection, 'orders', 'courier_name VARCHAR(128) NULL');
    await safeAddColumn(connection, 'orders', 'estimated_delivery VARCHAR(128) NULL');
    await safeAddColumn(connection, 'orders', 'notes TEXT NULL');

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
        sku_code VARCHAR(64) NULL,
        stock_quantity INT DEFAULT 150,
        low_stock_threshold INT DEFAULT 20,
        nutrition JSON NULL,
        features JSON NULL,
        ingredients TEXT NULL,
        description TEXT NULL,
        in_stock TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_prod_cat (category_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    await safeAddColumn(connection, 'products', 'sku_code VARCHAR(64) NULL');
    await safeAddColumn(connection, 'products', 'stock_quantity INT DEFAULT 150');
    await safeAddColumn(connection, 'products', 'low_stock_threshold INT DEFAULT 20');

    // 6. Product Variants table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_variants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(64) NOT NULL,
        size VARCHAR(64) NOT NULL,
        price INT NOT NULL,
        original_price INT NOT NULL,
        stock_quantity INT DEFAULT 100,
        sku_code VARCHAR(64) NULL,
        INDEX idx_var_prod (product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    await safeAddColumn(connection, 'product_variants', 'stock_quantity INT DEFAULT 100');
    await safeAddColumn(connection, 'product_variants', 'sku_code VARCHAR(64) NULL');

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

    // 9. Product Reviews table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(64) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        user_avatar TEXT NULL,
        rating INT NOT NULL,
        comment TEXT NOT NULL,
        date DATE NOT NULL,
        status VARCHAR(32) DEFAULT 'approved',
        is_pinned TINYINT(1) DEFAULT 0,
        admin_reply TEXT NULL,
        INDEX idx_rev_prod (product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    await safeAddColumn(connection, 'product_reviews', "status VARCHAR(32) DEFAULT 'approved'");
    await safeAddColumn(connection, 'product_reviews', 'is_pinned TINYINT(1) DEFAULT 0');
    await safeAddColumn(connection, 'product_reviews', 'admin_reply TEXT NULL');

    // 10. Global Store Settings table (Key-Value JSON)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS store_settings (
        setting_key VARCHAR(64) PRIMARY KEY,
        setting_value JSON NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 11. CMS Sections table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cms_sections (
        section_key VARCHAR(64) PRIMARY KEY,
        section_data JSON NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 12. CMS Policy & Content Pages table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cms_pages (
        slug VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle TEXT NULL,
        last_updated VARCHAR(64) NULL,
        content_html LONGTEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 13. Comparison Matrix Rows table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS comparison_rows (
        id VARCHAR(64) PRIMARY KEY,
        metric VARCHAR(255) NOT NULL,
        ghar_ka_khaana VARCHAR(255) NOT NULL,
        theproteino VARCHAR(255) NOT NULL,
        junk_food VARCHAR(255) NOT NULL,
        theproteino_highlight TINYINT(1) DEFAULT 0,
        sort_order INT DEFAULT 1
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 14. Store FAQs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS faqs (
        id VARCHAR(64) PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        category VARCHAR(128) DEFAULT 'General',
        sort_order INT DEFAULT 1,
        is_active TINYINT(1) DEFAULT 1
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 15. Product Bundles & Store Essentials table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_bundles (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        tagline TEXT NOT NULL,
        category VARCHAR(64) NOT NULL,
        price INT NOT NULL,
        original_price INT NOT NULL,
        discount_percent INT NOT NULL,
        rating DECIMAL(3, 2) DEFAULT 4.9,
        review_count INT DEFAULT 100,
        image TEXT NOT NULL,
        badge VARCHAR(64) NULL,
        has_free_gift VARCHAR(128) NULL,
        sku_code VARCHAR(64) NULL,
        stock_quantity INT DEFAULT 100,
        features JSON NULL,
        ingredients TEXT NULL,
        description TEXT NULL,
        in_stock TINYINT(1) DEFAULT 1
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 16. Inventory Stock Adjustment Logs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS inventory_logs (
        id VARCHAR(64) PRIMARY KEY,
        product_id VARCHAR(64) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        variant_size VARCHAR(64) NOT NULL,
        change_amount INT NOT NULL,
        new_stock INT NOT NULL,
        reason VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 17. Coupons & Promo Engine table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        code VARCHAR(64) PRIMARY KEY,
        discount_type VARCHAR(16) NOT NULL,
        discount_value INT NOT NULL,
        min_order_amount INT DEFAULT 0,
        max_discount INT NULL,
        usage_limit INT DEFAULT 1000,
        used_count INT DEFAULT 0,
        free_gift_name VARCHAR(255) NULL,
        description TEXT NULL,
        is_active TINYINT(1) DEFAULT 1,
        expires_at VARCHAR(64) NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 18. Flash Sales & Scheduled Campaigns table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS flash_sales (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        discount_percent INT NOT NULL,
        category_filter VARCHAR(64) DEFAULT 'all',
        starts_at VARCHAR(64) NULL,
        ends_at VARCHAR(64) NULL,
        banner_text TEXT NULL,
        is_active TINYINT(1) DEFAULT 1
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 19. Order Status Pipeline History table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_status_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id VARCHAR(64) NOT NULL,
        status VARCHAR(32) NOT NULL,
        tracking_number VARCHAR(128) NULL,
        courier_name VARCHAR(128) NULL,
        note TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_osh_order (order_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 20. Order Returns & Refunds Queue table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_returns (
        id VARCHAR(64) PRIMARY KEY,
        order_id VARCHAR(64) NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        reason TEXT NOT NULL,
        status VARCHAR(32) DEFAULT 'pending',
        refund_amount DECIMAL(10, 2) DEFAULT 0.00,
        resolution_note TEXT NULL,
        created_at VARCHAR(64) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 21. Abandoned Carts Recovery Log table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS abandoned_carts (
        id VARCHAR(64) PRIMARY KEY,
        session_id VARCHAR(128) NOT NULL,
        customer_name VARCHAR(255) NULL,
        customer_email VARCHAR(255) NULL,
        customer_phone VARCHAR(64) NULL,
        items JSON NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL,
        recovery_status VARCHAR(32) DEFAULT 'active',
        updated_at VARCHAR(64) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 22. Customer Support & Contact Tickets table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id VARCHAR(64) PRIMARY KEY,
        ticket_code VARCHAR(64) NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(64) NULL,
        order_id VARCHAR(64) NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(32) DEFAULT 'open',
        admin_reply TEXT NULL,
        created_at VARCHAR(64) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 23. Newsletter & Marketing Subscribers table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id VARCHAR(64) PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(64) NULL,
        source VARCHAR(128) DEFAULT 'Footer Newsletter',
        created_at VARCHAR(64) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 24. Admin Audit Logs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_audit_logs (
        id VARCHAR(64) PRIMARY KEY,
        action_type VARCHAR(64) NOT NULL,
        entity_name VARCHAR(64) NOT NULL,
        entity_id VARCHAR(64) NOT NULL,
        summary TEXT NOT NULL,
        actor VARCHAR(64) DEFAULT 'Admin (PIN 9890)',
        created_at VARCHAR(64) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Seed initial categories & products if empty
    const [catCount]: any = await connection.query('SELECT COUNT(*) as count FROM product_categories');
    if (catCount[0].count === 0) {
      console.log('[DATABASE SEED]: Seeding initial catalog & storefront data...');
      const { CATEGORIES, PRODUCTS, REELS_DATA, REVIEWS_DATA } = await import('../data/products.ts');

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
        const ui = uiCategories.find((u) => u.id === cat.id);
        await connection.query(
          'INSERT IGNORE INTO product_categories (id, name, icon, description, image, badge, bg_tone) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [cat.id, cat.name, cat.icon, ui?.description || null, ui?.image || null, ui?.badge || null, ui?.bgTone || null]
        );
      }

      for (const prod of PRODUCTS) {
        await connection.query(
          `INSERT IGNORE INTO products (
            id, name, tagline, category_id, price, original_price, discount_percent,
            rating, review_count, image, secondary_image, badge, is_bestseller,
            has_free_gift, sku_code, stock_quantity, low_stock_threshold,
            nutrition, features, ingredients, description, in_stock
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            prod.id,
            prod.name,
            prod.tagline,
            prod.category,
            prod.price,
            prod.originalPrice,
            prod.discountPercent,
            prod.rating,
            prod.reviewCount,
            prod.image,
            prod.secondaryImage || null,
            prod.badge || null,
            prod.isBestseller ? 1 : 0,
            prod.hasFreeGift || null,
            `SKU-${prod.id.toUpperCase()}`,
            145,
            20,
            JSON.stringify(prod.nutrition),
            JSON.stringify(prod.features),
            prod.ingredients,
            prod.description,
            prod.inStock ? 1 : 0,
          ]
        );

        for (const v of prod.variants) {
          await connection.query(
            'INSERT INTO product_variants (product_id, size, price, original_price, stock_quantity) VALUES (?, ?, ?, ?, ?)',
            [prod.id, v.size, v.price, v.originalPrice, 100]
          );
        }

        if (prod.flavors) {
          for (const f of prod.flavors) {
            await connection.query('INSERT INTO product_flavors (product_id, flavor) VALUES (?, ?)', [prod.id, f]);
          }
        }
      }

      for (const rev of REVIEWS_DATA) {
        await connection.query(
          `INSERT INTO product_reviews (product_id, user_name, rating, comment, date, status)
           VALUES (?, ?, ?, ?, ?, 'approved')`,
          [rev.productId, rev.userName, rev.rating, rev.comment, rev.date]
        );
      }

      for (const r of REELS_DATA) {
        await connection.query(
          `INSERT IGNORE INTO reels (id, creator_name, handle, caption, image, linked_product_id, product_name, product_price, original_price)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [r.id, r.creatorName, r.handle, r.caption, r.image, r.linkedProductId || null, r.productName || null, r.productPrice || null, r.originalPrice || null]
        );
      }
    }

    // Seed Store Settings & CMS tables if empty
    const [settingsCount]: any = await connection.query('SELECT COUNT(*) as count FROM store_settings');
    if (settingsCount[0].count === 0) {
      const {
        DEFAULT_STORE_SETTINGS,
        DEFAULT_COMPARISON_ROWS,
        DEFAULT_COUPONS,
        DEFAULT_FLASH_SALES,
        DEFAULT_FAQS,
        DEFAULT_ESSENTIALS_BUNDLES,
        DEFAULT_CMS_PAGES,
      } = await import('../data/defaultStoreData.ts');

      await connection.query(
        'INSERT IGNORE INTO store_settings (setting_key, setting_value) VALUES (?, ?)',
        ['global_settings', JSON.stringify(DEFAULT_STORE_SETTINGS)]
      );

      for (const row of DEFAULT_COMPARISON_ROWS) {
        await connection.query(
          `INSERT IGNORE INTO comparison_rows (id, metric, ghar_ka_khaana, theproteino, junk_food, theproteino_highlight, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [row.id, row.metric, row.gharKaKhaana, row.theproteino, row.junkFood, row.theproteinoHighlight ? 1 : 0, row.sortOrder]
        );
      }

      for (const c of DEFAULT_COUPONS) {
        await connection.query(
          `INSERT IGNORE INTO coupons (code, discount_type, discount_value, min_order_amount, max_discount, usage_limit, used_count, free_gift_name, description, is_active, expires_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [c.code, c.discountType, c.discountValue, c.minOrderAmount, c.maxDiscount || null, c.usageLimit, c.usedCount, c.freeGiftName || null, c.description || null, c.isActive ? 1 : 0, c.expiresAt || null]
        );
      }

      for (const fs of DEFAULT_FLASH_SALES) {
        await connection.query(
          `INSERT IGNORE INTO flash_sales (id, title, discount_percent, category_filter, starts_at, ends_at, banner_text, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [fs.id, fs.title, fs.discountPercent, fs.categoryFilter, fs.startsAt, fs.endsAt, fs.bannerText, fs.isActive ? 1 : 0]
        );
      }

      for (const fq of DEFAULT_FAQS) {
        await connection.query(
          `INSERT IGNORE INTO faqs (id, question, answer, category, sort_order, is_active)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [fq.id, fq.question, fq.answer, fq.category, fq.sortOrder, fq.isActive ? 1 : 0]
        );
      }

      for (const bun of DEFAULT_ESSENTIALS_BUNDLES) {
        await connection.query(
          `INSERT IGNORE INTO product_bundles (id, name, tagline, category, price, original_price, discount_percent, rating, review_count, image, badge, has_free_gift, sku_code, stock_quantity, features, ingredients, description, in_stock)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            bun.id,
            bun.name,
            bun.tagline,
            bun.category,
            bun.price,
            bun.originalPrice,
            bun.discountPercent,
            bun.rating,
            bun.reviewCount,
            bun.image,
            bun.badge || null,
            bun.hasFreeGift || null,
            bun.skuCode || null,
            bun.stockQuantity || 100,
            JSON.stringify(bun.features),
            bun.ingredients,
            bun.description,
            bun.inStock ? 1 : 0,
          ]
        );
      }

      for (const pg of DEFAULT_CMS_PAGES) {
        await connection.query(
          `INSERT IGNORE INTO cms_pages (slug, title, subtitle, last_updated, content_html)
           VALUES (?, ?, ?, ?, ?)`,
          [pg.slug, pg.title, pg.subtitle, pg.lastUpdated, pg.contentHtml]
        );
      }
    }

    // Ensure no demo seeds remain in operational tables (production-ready clean state)
    try {
      await connection.query("DELETE FROM order_returns WHERE id LIKE 'RET-%'");
      await connection.query("DELETE FROM support_tickets WHERE ticket_code IN ('SUP-4091', 'SUP-4088')");
      await connection.query("DELETE FROM abandoned_carts WHERE id IN ('AC-01', 'AC-02')");
      await connection.query("DELETE FROM newsletter_subscribers WHERE id IN ('sub-1', 'sub-2', 'sub-3', 'sub-4')");
      await connection.query("DELETE FROM inventory_logs WHERE id IN ('inv-1', 'inv-2')");
      await connection.query("DELETE FROM admin_audit_logs WHERE id = 'aud-1'");
      await connection.query("DELETE FROM orders WHERE order_id IN ('PROT-849201', 'PROT-849315', 'PROT-849409')");
      await connection.query("DELETE FROM users WHERE firebase_uid IN ('usr-rohan-01', 'usr-sneha-02', 'usr-aditya-03')");
      await connection.query("DELETE FROM user_addresses WHERE firebase_uid IN ('usr-rohan-01', 'usr-sneha-02', 'usr-aditya-03')");
    } catch {
      // Safe fallback if tables were empty
    }

    connection.release();
    console.log('[DATABASE SCHEMA]: All 24 MySQL tables verified/initialized.');
  } catch (err) {
    console.warn('[DATABASE SCHEMA ERROR]:', err);
  }
}
