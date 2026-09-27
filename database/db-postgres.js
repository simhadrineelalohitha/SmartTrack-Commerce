const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err);
  } else {
    console.log('Connected to PostgreSQL database');
    initializeDatabase();
  }
});

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(500) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        discount DECIMAL(10,2) DEFAULT 0,
        brand VARCHAR(200),
        image_url TEXT,
        stock INTEGER DEFAULT 0,
        category VARCHAR(100),
        subcategory VARCHAR(100),
        rating DECIMAL(3,2) DEFAULT 0,
        specifications TEXT,
        active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(100) DEFAULT 'Order Placed',
        estimated_delivery VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id),
        product_id INTEGER NOT NULL REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS order_status_history (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id),
        status VARCHAR(100) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_audit_log (
        id SERIAL PRIMARY KEY,
        admin_id INTEGER NOT NULL REFERENCES users(id),
        action TEXT NOT NULL,
        details TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS wishlist (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        product_id INTEGER NOT NULL REFERENCES products(id),
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS product_reviews (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
        review_text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(product_id, user_id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS recently_viewed (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        product_id INTEGER NOT NULL REFERENCES products(id),
        viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✓ Database tables initialized');
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    client.release();
  }
}

// Helper function to convert SQLite placeholders (?) to PostgreSQL placeholders ($1, $2, etc.)
function convertPlaceholders(sql) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

// Compatibility layer to match SQLite API
module.exports = {
  get: (sql, params, callback) => {
    const convertedSql = convertPlaceholders(sql);
    pool.query(convertedSql, params, (err, result) => {
      if (err) return callback(err);
      callback(null, result.rows[0]);
    });
  },
  all: (sql, params, callback) => {
    const convertedSql = convertPlaceholders(sql);
    pool.query(convertedSql, params, (err, result) => {
      if (err) return callback(err);
      callback(null, result.rows);
    });
  },
  run: (sql, params, callback) => {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    let convertedSql = convertPlaceholders(sql);
    
    // Add RETURNING id for INSERT statements to get lastID
    if (/^\s*INSERT/i.test(sql) && !/RETURNING/i.test(sql)) {
      convertedSql += ' RETURNING id';
    }
    
    pool.query(convertedSql, params, (err, result) => {
      if (callback) {
        if (err) return callback.call({ lastID: null, changes: 0 }, err);
        const lastID = result.rows && result.rows[0] ? result.rows[0].id : null;
        const changes = result.rowCount || 0;
        callback.call({ lastID, changes }, null);
      }
    });
  },
  prepare: (sql) => {
    let convertedSql = convertPlaceholders(sql);
    
    // Add RETURNING id for INSERT statements
    if (/^\s*INSERT/i.test(sql) && !/RETURNING/i.test(sql)) {
      convertedSql += ' RETURNING id';
    }
    
    return {
      run: (params, callback) => {
        const paramArray = Array.isArray(params) ? params : [params];
        pool.query(convertedSql, paramArray, (err, result) => {
          if (callback) {
            if (err) return callback.call({ lastID: null, changes: 0 }, err);
            const lastID = result.rows && result.rows[0] ? result.rows[0].id : null;
            const changes = result.rowCount || 0;
            callback.call({ lastID, changes }, null);
          }
        });
      },
      finalize: (callback) => {
        if (callback) callback();
      }
    };
  }
};
