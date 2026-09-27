const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./database/db-factory');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const wishlistRoutes = require('./routes/wishlist');
const assistantRoutes = require('./routes/assistant');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'smarttrack-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'  // Changed from 'none' to 'lax' for better compatibility
  }
}));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/assistant', assistantRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  db.all('SELECT COUNT(*) as count FROM products', [], (err, rows) => {
    const productCount = rows && rows[0] ? rows[0].count : 0;
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: err ? 'error' : 'connected',
      products: productCount,
      environment: process.env.NODE_ENV || 'development'
    });
  });
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// SPA fallback - serve index.html for all non-API, non-file routes
app.get('*', (req, res, next) => {
  // Skip API routes - let them 404 properly
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // For HTML pages, serve index.html (SPA routing)
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Import products on first run - comprehensive 54-product marketplace
function importProductsIfNeeded() {
  console.log('📦 Checking product inventory...');
  
  db.all('SELECT COUNT(*) as count FROM products', [], (err, rows) => {
    if (err) {
      console.error('❌ Error checking products:', err);
      return;
    }
    
    const currentCount = rows && rows[0] ? rows[0].count : 0;
    console.log(`Current products in database: ${currentCount}`);
    
    // Only seed if database is completely empty (safer for production)
    // Changed from < 50 to === 0 to prevent overwriting manual changes
    if (currentCount === 0) {
      console.log('📦 Database empty. Importing full product catalog (54 products)...');
      
      const products = require('./database/seed-marketplace-data')();
      
      const stmt = db.prepare('INSERT INTO products (name, brand, description, price, discount, image_url, stock, category, subcategory, rating, specifications) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
      
      let completed = 0;
      let errors = 0;
      
      products.forEach((product) => {
        stmt.run(product, (err) => {
          if (err) {
            console.error(`❌ Error inserting product:`, err.message);
            errors++;
          }
          completed++;
          
          if (completed === products.length) {
            stmt.finalize(() => {
              console.log(`✅ Product import complete! Added ${products.length - errors} products.`);
              if (errors > 0) {
                console.log(`⚠️  ${errors} products failed to import.`);
              }
            });
          }
        });
      });
    } else {
      console.log(`✓ Database already has ${currentCount} products. Skipping auto-seed.`);
      console.log(`   (Use admin panel to add/modify products in production)`);
    }
  });
}

// Start server - bind to 0.0.0.0 for Render compatibility
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ SmartTrack Commerce server running on http://0.0.0.0:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Delay product import to ensure database is fully initialized
  setTimeout(() => {
    importProductsIfNeeded();
  }, 2000);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
