const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./database/db');
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
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
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

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Import products on first run (checks if products table is empty)
function importProductsIfNeeded() {
  db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
    if (err) {
      console.error('Error checking products:', err);
      return;
    }
    
    // Only import if we have less than 50 products (meaning we need the full catalog)
    if (row.count < 50) {
      console.log(`Found ${row.count} products. Importing full product catalog...`);
      
      const products = [
        ['iPhone 14 Pro Max', 'Latest Apple iPhone with A16 Bionic chip, 48MP camera, Dynamic Island, 6.7" Super Retina XDR display', 1099.00, 'https://via.placeholder.com/300x300?text=iPhone+14+Pro', 45, 'Electronics'],
        ['Samsung Galaxy S23 Ultra', '200MP camera, 6.8" Dynamic AMOLED display, Snapdragon 8 Gen 2, S Pen included', 1199.00, 'https://via.placeholder.com/300x300?text=Samsung+S23', 38, 'Electronics'],
        ['Google Pixel 8 Pro', 'Google Tensor G3 chip, Best AI camera, 6.7" LTPO OLED display, 5000mAh battery', 899.00, 'https://via.placeholder.com/300x300?text=Pixel+8', 52, 'Electronics'],
        ['OnePlus 11 5G', 'Snapdragon 8 Gen 2, 100W fast charging, Hasselblad camera, 120Hz display', 699.00, 'https://via.placeholder.com/300x300?text=OnePlus+11', 60, 'Electronics'],
        ['iPad Air 5th Gen', 'M1 chip, 10.9" Liquid Retina display, Apple Pencil support, 256GB storage', 749.00, 'https://via.placeholder.com/300x300?text=iPad+Air', 35, 'Electronics'],
        ['Samsung Galaxy Tab S9', 'Snapdragon 8 Gen 2, 11" AMOLED display, S Pen included, IP68 water resistant', 649.00, 'https://via.placeholder.com/300x300?text=Galaxy+Tab', 42, 'Electronics'],
        ['Xiaomi 13 Pro', 'Leica camera system, Snapdragon 8 Gen 2, 120W fast charging, AMOLED display', 599.00, 'https://via.placeholder.com/300x300?text=Xiaomi+13', 55, 'Electronics'],
        ['Nothing Phone 2', 'Unique Glyph interface, Snapdragon 8+ Gen 1, 120Hz OLED display, 45W charging', 549.00, 'https://via.placeholder.com/300x300?text=Nothing+Phone', 48, 'Electronics'],
        ['Motorola Edge 40 Pro', 'Snapdragon 8 Gen 2, 165Hz display, 125W fast charging, curved OLED screen', 499.00, 'https://via.placeholder.com/300x300?text=Moto+Edge', 65, 'Electronics'],
        ['Realme GT 3', '240W fast charging, Snapdragon 8+ Gen 1, 144Hz AMOLED display, RGB lighting', 449.00, 'https://via.placeholder.com/300x300?text=Realme+GT3', 70, 'Electronics'],
        ['MacBook Pro 16" M3 Max', 'M3 Max chip, 48GB RAM, 1TB SSD, Liquid Retina XDR display, 22-hour battery', 2999.00, 'https://via.placeholder.com/300x300?text=MacBook+Pro', 25, 'Electronics'],
        ['Dell XPS 15', 'Intel i9-13900H, NVIDIA RTX 4070, 32GB RAM, 1TB SSD, 15.6" 4K OLED', 2499.00, 'https://via.placeholder.com/300x300?text=Dell+XPS', 30, 'Electronics'],
        ['HP Spectre x360', 'Intel i7-1355U, 16GB RAM, 512GB SSD, 13.5" 3K2K touchscreen, 360° hinge', 1599.00, 'https://via.placeholder.com/300x300?text=HP+Spectre', 40, 'Electronics'],
        ['Lenovo ThinkPad X1', 'Intel i7-1365U, 16GB RAM, 512GB SSD, 14" 2.8K display, MIL-STD tested', 1799.00, 'https://via.placeholder.com/300x300?text=ThinkPad', 35, 'Electronics'],
        ['ASUS ROG Zephyrus G14', 'AMD Ryzen 9 7940HS, RTX 4060, 16GB RAM, 1TB SSD, 14" QHD+ 165Hz', 1899.00, 'https://via.placeholder.com/300x300?text=ROG+G14', 28, 'Electronics'],
        ['Microsoft Surface Laptop 5', 'Intel i7-1265U, 16GB RAM, 512GB SSD, 13.5" PixelSense touchscreen', 1499.00, 'https://via.placeholder.com/300x300?text=Surface+L5', 45, 'Electronics'],
        ['Acer Swift 3', 'Intel i5-1335U, 16GB RAM, 512GB SSD, 14" FHD IPS, lightweight 2.65 lbs', 899.00, 'https://via.placeholder.com/300x300?text=Acer+Swift', 60, 'Electronics'],
        ['MacBook Air M2', 'M2 chip, 8GB RAM, 256GB SSD, 13.6" Liquid Retina, fanless design', 1199.00, 'https://via.placeholder.com/300x300?text=MacBook+Air', 55, 'Electronics'],
        ['Sony WH-1000XM5', 'Industry-leading noise cancellation, 30-hour battery, LDAC codec, premium comfort', 399.00, 'https://via.placeholder.com/300x300?text=Sony+XM5', 80, 'Electronics'],
        ['Apple AirPods Pro 2', 'Active noise cancellation, Adaptive Audio, H2 chip, USB-C charging, Find My', 249.00, 'https://via.placeholder.com/300x300?text=AirPods+Pro', 120, 'Electronics'],
        ['Bose QuietComfort 45', 'Noise cancelling headphones, 24-hour battery, TriPort technology, premium audio', 329.00, 'https://via.placeholder.com/300x300?text=Bose+QC45', 65, 'Electronics'],
        ['JBL Flip 6', 'Portable Bluetooth speaker, IP67 waterproof, 12-hour playtime, PartyBoost', 129.00, 'https://via.placeholder.com/300x300?text=JBL+Flip6', 150, 'Electronics'],
        ['Sennheiser Momentum 4', 'Adaptive ANC, 60-hour battery, audiophile sound, smart controls', 379.00, 'https://via.placeholder.com/300x300?text=Sennheiser', 50, 'Electronics'],
        ['Nike Air Zoom Pegasus 40', 'Responsive cushioning, breathable mesh upper, durable outsole, neutral support', 139.00, 'https://via.placeholder.com/300x300?text=Nike+Pegasus', 200, 'Sports'],
        ['Adidas Ultraboost 23', 'BOOST cushioning, Primeknit+ upper, Continental rubber outsole, energy return', 189.00, 'https://via.placeholder.com/300x300?text=Ultraboost', 180, 'Sports'],
        ['Puma Deviate Nitro 2', 'NITRO foam, carbon fiber plate, lightweight design, race-day performance', 159.00, 'https://via.placeholder.com/300x300?text=Puma+Deviate', 120, 'Sports'],
        ['Under Armour HOVR Phantom 3', 'UA HOVR cushioning, compression mesh, connected tracking, energy return', 149.00, 'https://via.placeholder.com/300x300?text=UA+HOVR', 140, 'Sports'],
        ['Manduka PRO Yoga Mat', 'Premium 6mm thickness, lifetime guarantee, closed-cell surface, eco-friendly', 119.00, 'https://via.placeholder.com/300x300?text=Manduka+Mat', 90, 'Sports'],
        ['Liforme Yoga Mat', 'Planet-friendly materials, AlignForMe system, 4.2mm grip, biodegradable', 139.00, 'https://via.placeholder.com/300x300?text=Liforme+Mat', 75, 'Sports'],
        ['Bowflex SelectTech 552', 'Adjustable dumbbells 5-52.5 lbs, space-saving, 15 weight settings, durable', 399.00, 'https://via.placeholder.com/300x300?text=Bowflex+552', 45, 'Sports'],
        ['Resistance Bands Set', '5-piece set with handles, door anchor, ankle straps, portable gym', 29.99, 'https://via.placeholder.com/300x300?text=Resistance', 300, 'Sports'],
        ['Fitbit Charge 6', 'Heart rate monitor, GPS, sleep tracking, 7-day battery, Google integration', 159.00, 'https://via.placeholder.com/300x300?text=Fitbit+C6', 110, 'Sports'],
        ['Garmin Forerunner 265', 'AMOLED display, advanced running metrics, training readiness, music storage', 449.00, 'https://via.placeholder.com/300x300?text=Garmin+265', 65, 'Sports'],
        ['Levis 501 Original Jeans', 'Classic straight fit, button fly, shrink-to-fit denim, timeless style', 79.99, 'https://via.placeholder.com/300x300?text=Levis+501', 250, 'Fashion'],
        ['Nike Tech Fleece Hoodie', 'Premium cotton blend, thermal construction, modern fit, iconic comfort', 109.00, 'https://via.placeholder.com/300x300?text=Nike+Tech', 180, 'Fashion'],
        ['Adidas Trefoil Hoodie', 'Cotton fleece, kangaroo pocket, ribbed cuffs, iconic 3-stripes', 64.99, 'https://via.placeholder.com/300x300?text=Adidas+Hoodie', 220, 'Fashion'],
        ['Ralph Lauren Polo Shirt', 'Classic fit, soft cotton mesh, signature pony logo, timeless design', 89.99, 'https://via.placeholder.com/300x300?text=Ralph+Lauren', 200, 'Fashion'],
        ['Zara Linen Shirt', '100% linen, relaxed fit, breathable fabric, summer essential', 49.99, 'https://via.placeholder.com/300x300?text=Zara+Linen', 160, 'Fashion'],
        ['Ninja Air Fryer Pro', '5-in-1 functionality, 5-quart capacity, crisp technology, easy clean basket', 119.00, 'https://via.placeholder.com/300x300?text=Ninja+Fryer', 85, 'Home'],
        ['Instant Pot Duo Plus', '9-in-1 pressure cooker, 6-quart, 15 smart programs, stainless steel', 99.99, 'https://via.placeholder.com/300x300?text=Instant+Pot', 95, 'Home'],
        ['Keurig K-Elite', 'Single-serve K-Cup pods, iced coffee setting, 75oz reservoir, strong brew', 169.00, 'https://via.placeholder.com/300x300?text=Keurig+Elite', 70, 'Home'],
        ['Breville Barista Express', 'Espresso machine with grinder, 15-bar Italian pump, milk frother', 699.00, 'https://via.placeholder.com/300x300?text=Breville', 35, 'Home'],
        ['KitchenAid Stand Mixer', '5-quart bowl, 10-speed, tilt-head design, includes 3 attachments', 379.00, 'https://via.placeholder.com/300x300?text=KitchenAid', 55, 'Home'],
        ['Dyson V15 Detect', 'Cordless vacuum, laser dust detection, 60-minute runtime, HEPA filtration', 649.00, 'https://via.placeholder.com/300x300?text=Dyson+V15', 40, 'Home'],
        ['iRobot Roomba j7+', 'Self-emptying robot vacuum, AI obstacle avoidance, smart mapping, WiFi', 799.00, 'https://via.placeholder.com/300x300?text=Roomba+j7', 30, 'Home'],
        ['Philips Hue Starter Kit', '4 LED bulbs, smart hub included, 16 million colors, voice control', 199.00, 'https://via.placeholder.com/300x300?text=Philips+Hue', 120, 'Home'],
        ['Nest Learning Thermostat', 'Smart temperature control, energy saving, WiFi enabled, auto-schedule', 249.00, 'https://via.placeholder.com/300x300?text=Nest+Thermo', 75, 'Home'],
        ['Ring Video Doorbell Pro 2', 'HD+ video, 3D motion detection, Alexa compatible, night vision', 269.00, 'https://via.placeholder.com/300x300?text=Ring+Bell', 90, 'Home'],
        ['Olaplex Hair Treatment', 'No. 3 Hair Perfector, strengthens and repairs, salon-quality, cruelty-free', 29.99, 'https://via.placeholder.com/300x300?text=Olaplex', 200, 'Beauty'],
        ['Dyson Airwrap Complete', 'Multi-styler, curls, waves, and dries with no extreme heat, 6 attachments', 599.00, 'https://via.placeholder.com/300x300?text=Dyson+Airwrap', 25, 'Beauty'],
        ['The Ordinary Niacinamide', '10% niacinamide + 1% zinc, reduces blemishes, balances oil, vegan', 5.99, 'https://via.placeholder.com/300x300?text=The+Ordinary', 300, 'Beauty'],
        ['CeraVe Hydrating Cleanser', 'Gentle formula, hyaluronic acid, ceramides, fragrance-free, dermatologist recommended', 14.99, 'https://via.placeholder.com/300x300?text=CeraVe', 250, 'Beauty'],
        ['Neutrogena Hydro Boost', 'Oil-free moisturizer, hyaluronic acid, non-comedogenic, 24-hour hydration', 18.99, 'https://via.placeholder.com/300x300?text=Hydro+Boost', 220, 'Beauty'],
        ['Maybelline Sky High Mascara', 'Volumizing and lengthening, bamboo extract, flex tower brush, waterproof', 11.99, 'https://via.placeholder.com/300x300?text=Sky+High', 280, 'Beauty'],
        ['Fenty Beauty Foundation', '50 shades, soft matte finish, buildable coverage, long-wear formula', 39.00, 'https://via.placeholder.com/300x300?text=Fenty+Found', 150, 'Beauty'],
        ['Ray-Ban Aviator Classic', 'Iconic design, 100% UV protection, metal frame, multiple lens colors', 153.00, 'https://via.placeholder.com/300x300?text=RayBan', 180, 'Accessories'],
        ['Michael Kors Jet Set Tote', 'Saffiano leather, multiple pockets, laptop compatible, signature hardware', 298.00, 'https://via.placeholder.com/300x300?text=MK+Tote', 95, 'Accessories'],
        ['Fossil Gen 6 Smartwatch', 'Wear OS, heart rate tracking, GPS, customizable watch faces, fast charging', 299.00, 'https://via.placeholder.com/300x300?text=Fossil+Gen6', 70, 'Accessories'],
        ['Apple Watch Series 9', 'Always-on Retina display, S9 chip, fitness tracking, cellular, ECG app', 429.00, 'https://via.placeholder.com/300x300?text=Watch+S9', 85, 'Accessories'],
        ['Bellroy Slim Sleeve Wallet', 'Premium leather, RFID protection, holds 4-12 cards, compact design', 99.00, 'https://via.placeholder.com/300x300?text=Bellroy', 150, 'Accessories'],
        ['Anker PowerCore 20000mAh', 'High-capacity portable charger, fast charging, dual USB ports, compact', 49.99, 'https://via.placeholder.com/300x300?text=Anker+Power', 200, 'Accessories'],
        ['Samsonite Winfield 3 Luggage', '20" hardside spinner, scratch-resistant, TSA lock, lightweight', 179.00, 'https://via.placeholder.com/300x300?text=Samsonite', 65, 'Accessories'],
        ['Herschel Little America Backpack', '25L capacity, laptop sleeve, magnetic strap, water-resistant, classic design', 109.99, 'https://via.placeholder.com/300x300?text=Herschel', 140, 'Accessories'],
        ['YETI Rambler 30oz', 'Stainless steel, double-wall vacuum insulation, MagSlider lid, keeps drinks cold/hot', 35.00, 'https://via.placeholder.com/300x300?text=YETI+Rambler', 250, 'Accessories'],
        ['Hydro Flask 32oz Wide Mouth', 'TempShield insulation, BPA-free, powder-coated finish, lifetime warranty', 44.95, 'https://via.placeholder.com/300x300?text=Hydro+Flask', 220, 'Accessories']
      ];
      
      const stmt = db.prepare('INSERT INTO products (name, description, price, image_url, stock, category) VALUES (?, ?, ?, ?, ?, ?)');
      
      let completed = 0;
      let errors = 0;
      
      products.forEach((product) => {
        stmt.run(product, (err) => {
          if (err) {
            errors++;
          }
          completed++;
          
          if (completed === products.length) {
            stmt.finalize();
            console.log(`✅ Product import complete! Added ${completed - errors} products.`);
            if (errors > 0) {
              console.log(`⚠️  ${errors} products failed to import.`);
            }
          }
        });
      });
    } else {
      console.log(`✓ Database already has ${row.count} products.`);
    }
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`SmartTrack Commerce server running on http://localhost:${PORT}`);
  // Import products after server starts
  importProductsIfNeeded();
});
