const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'ecommerce.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'customer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Error creating users table:', err.message);
  });

  // Create products table with enhanced fields
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      discount REAL DEFAULT 0,
      brand TEXT,
      image_url TEXT,
      stock INTEGER DEFAULT 0,
      category TEXT,
      subcategory TEXT,
      rating REAL DEFAULT 0,
      specifications TEXT,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating products table:', err.message);
    } else {
      // Add new columns if they don't exist
      db.run(`ALTER TABLE products ADD COLUMN discount REAL DEFAULT 0`, () => {});
      db.run(`ALTER TABLE products ADD COLUMN brand TEXT`, () => {});
      db.run(`ALTER TABLE products ADD COLUMN subcategory TEXT`, () => {});
      db.run(`ALTER TABLE products ADD COLUMN rating REAL DEFAULT 0`, () => {});
      db.run(`ALTER TABLE products ADD COLUMN specifications TEXT`, () => {});
      insertSampleProducts();
    }
  });

  // Create orders table
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'Order Placed',
      estimated_delivery TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) console.error('Error creating orders table:', err.message);
  });

  // Create order_items table
  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `, (err) => {
    if (err) console.error('Error creating order_items table:', err.message);
  });

  // Create order_status_history table for tracking
  db.run(`
    CREATE TABLE IF NOT EXISTS order_status_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id)
    )
  `, (err) => {
    if (err) console.error('Error creating order_status_history table:', err.message);
  });

  // Create admin_audit_log table
  db.run(`
    CREATE TABLE IF NOT EXISTS admin_audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      details TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) console.error('Error creating admin_audit_log table:', err.message);
  });

  // Create wishlist table
  db.run(`
    CREATE TABLE IF NOT EXISTS wishlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id),
      UNIQUE(user_id, product_id)
    )
  `, (err) => {
    if (err) console.error('Error creating wishlist table:', err.message);
  });

  // Create product_reviews table
  db.run(`
    CREATE TABLE IF NOT EXISTS product_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      review_text TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(product_id, user_id)
    )
  `, (err) => {
    if (err) console.error('Error creating product_reviews table:', err.message);
  });

  // Create recently_viewed table
  db.run(`
    CREATE TABLE IF NOT EXISTS recently_viewed (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `, (err) => {
    if (err) console.error('Error creating recently_viewed table:', err.message);
  });
}

function insertSampleProducts() {
  db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
    if (err) {
      console.error('Error checking products:', err.message);
      return;
    }

    if (row.count === 0) {
      const sampleProducts = [
        {
          name: 'Wireless Headphones',
          description: 'High-quality wireless headphones with noise cancellation',
          price: 89.99,
          image_url: 'https://via.placeholder.com/300x300?text=Wireless+Headphones',
          stock: 50,
          category: 'Electronics'
        },
        {
          name: 'Smart Watch',
          description: 'Fitness tracker with heart rate monitor and GPS',
          price: 199.99,
          image_url: 'https://via.placeholder.com/300x300?text=Smart+Watch',
          stock: 30,
          category: 'Electronics'
        },
        {
          name: 'Running Shoes',
          description: 'Comfortable running shoes with excellent cushioning',
          price: 79.99,
          image_url: 'https://via.placeholder.com/300x300?text=Running+Shoes',
          stock: 100,
          category: 'Sports'
        },
        {
          name: 'Yoga Mat',
          description: 'Non-slip yoga mat perfect for all types of exercises',
          price: 29.99,
          image_url: 'https://via.placeholder.com/300x300?text=Yoga+Mat',
          stock: 75,
          category: 'Sports'
        },
        {
          name: 'Coffee Maker',
          description: 'Programmable coffee maker with thermal carafe',
          price: 69.99,
          image_url: 'https://via.placeholder.com/300x300?text=Coffee+Maker',
          stock: 40,
          category: 'Home'
        },
        {
          name: 'Desk Lamp',
          description: 'LED desk lamp with adjustable brightness',
          price: 34.99,
          image_url: 'https://via.placeholder.com/300x300?text=Desk+Lamp',
          stock: 60,
          category: 'Home'
        },
        {
          name: 'Backpack',
          description: 'Durable laptop backpack with multiple compartments',
          price: 49.99,
          image_url: 'https://via.placeholder.com/300x300?text=Backpack',
          stock: 80,
          category: 'Accessories'
        },
        {
          name: 'Water Bottle',
          description: 'Insulated stainless steel water bottle',
          price: 24.99,
          image_url: 'https://via.placeholder.com/300x300?text=Water+Bottle',
          stock: 120,
          category: 'Accessories'
        }
      ];

      const stmt = db.prepare(`
        INSERT INTO products (name, description, price, image_url, stock, category)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      sampleProducts.forEach(product => {
        stmt.run(
          product.name,
          product.description,
          product.price,
          product.image_url,
          product.stock,
          product.category,
          (err) => {
            if (err) console.error('Error inserting product:', err.message);
          }
        );
      });

      stmt.finalize(() => {
        console.log('Sample products inserted successfully');
      });
    }
  });
}

module.exports = db;
