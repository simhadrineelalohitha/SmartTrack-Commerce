const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database/ecommerce.db');

console.log('🚀 Seeding marketplace with realistic products...\n');

// Comprehensive product catalog across multiple categories
const products = [
  // Electronics - Smartphones (20 products)
  ['iPhone 15 Pro Max', 'Apple', 'Latest Apple flagship with A17 Pro chip, titanium design, 48MP camera, USB-C, 5G', 1299, 1599, 10, 'https://via.placeholder.com/400x400?text=iPhone+15+Pro', 45, 'Electronics', 'Smartphones', 4.8, '{"display":"6.7 inch","processor":"A17 Pro","ram":"8GB","storage":"256GB","camera":"48MP+12MP+12MP","battery":"4422mAh"}'],
  ['Samsung Galaxy S24 Ultra', 'Samsung', '200MP camera, S Pen, Snapdragon 8 Gen 3, AI features, 6.8" Dynamic AMOLED display', 1199, 1399, 15, 'https://via.placeholder.com/400x400?text=Galaxy+S24', 52, 'Electronics', 'Smartphones', 4.7, '{"display":"6.8 inch","processor":"Snapdragon 8 Gen 3","ram":"12GB","storage":"256GB","camera":"200MP+50MP+12MP+10MP","battery":"5000mAh"}'],
  ['Google Pixel 8 Pro', 'Google', 'Best Android camera, Google Tensor G3, 7 years of updates, AI photo editing', 999, 1099, 12, 'https://via.placeholder.com/400x400?text=Pixel+8+Pro', 38, 'Electronics', 'Smartphones', 4.6, '{"display":"6.7 inch","processor":"Google Tensor G3","ram":"12GB","storage":"128GB","camera":"50MP+48MP+48MP","battery":"5050mAh"}'],
  ['OnePlus 12', 'OnePlus', '100W fast charging, Hasselblad camera, 120Hz AMOLED, Snapdragon 8 Gen 3', 799, 899, 10, 'https://via.placeholder.com/400x400?text=OnePlus+12', 60, 'Electronics', 'Smartphones', 4.5, '{"display":"6.7 inch","processor":"Snapdragon 8 Gen 3","ram":"12GB","storage":"256GB","camera":"50MP+64MP+48MP","battery":"5400mAh"}'],
  ['Xiaomi 14 Pro', 'Xiaomi', 'Leica optics, 120W HyperCharge, Snapdragon 8 Gen 3, premium build', 849, 999, 8, 'https://via.placeholder.com/400x400?text=Xiaomi+14', 48, 'Electronics', 'Smartphones', 4.4, '{"display":"6.73 inch","processor":"Snapdragon 8 Gen 3","ram":"12GB","storage":"256GB","camera":"50MP+50MP+50MP","battery":"4880mAh"}'],
  
  // Electronics - Laptops (15 products)
  ['MacBook Pro 16" M3 Max', 'Apple', 'M3 Max chip, 48GB RAM, 1TB SSD, Liquid Retina XDR, 22-hour battery, professional powerhouse', 2999, 3499, 5, 'https://via.placeholder.com/400x400?text=MacBook+Pro', 28, 'Electronics', 'Laptops', 4.9, '{"processor":"Apple M3 Max","ram":"48GB","storage":"1TB SSD","display":"16.2 inch Liquid Retina XDR","graphics":"Integrated 40-core GPU","battery":"22 hours"}'],
  ['Dell XPS 15', 'Dell', 'Intel i9-13900H, NVIDIA RTX 4070, 32GB RAM, 1TB SSD, 4K OLED touchscreen', 2499, 2899, 8, 'https://via.placeholder.com/400x400?text=Dell+XPS+15', 35, 'Electronics', 'Laptops', 4.7, '{"processor":"Intel i9-13900H","ram":"32GB","storage":"1TB SSD","display":"15.6 inch 4K OLED","graphics":"NVIDIA RTX 4070 8GB","battery":"10 hours"}'],
  ['HP Spectre x360', 'HP', '2-in-1 convertible, Intel i7-1355U, 16GB RAM, 512GB SSD, 3K2K touchscreen', 1599, 1899, 6, 'https://via.placeholder.com/400x400?text=HP+Spectre', 42, 'Electronics', 'Laptops', 4.5, '{"processor":"Intel i7-1355U","ram":"16GB","storage":"512GB SSD","display":"13.5 inch 3K2K touch","graphics":"Intel Iris Xe","battery":"12 hours"}'],
  ['Lenovo ThinkPad X1 Carbon', 'Lenovo', 'Business ultrabook, Intel i7-1365U, 16GB RAM, 512GB SSD, MIL-STD tested durability', 1799, 2099, 7, 'https://via.placeholder.com/400x400?text=ThinkPad', 38, 'Electronics', 'Laptops', 4.6, '{"processor":"Intel i7-1365U","ram":"16GB","storage":"512GB SSD","display":"14 inch 2.8K","graphics":"Intel Iris Xe","battery":"14 hours"}'],
  ['ASUS ROG Zephyrus G14', 'ASUS', 'Gaming laptop, AMD Ryzen 9 7940HS, RTX 4060, 16GB RAM, 1TB SSD, 165Hz display', 1899, 2199, 10, 'https://via.placeholder.com/400x400?text=ROG+G14', 32, 'Electronics', 'Laptops', 4.8, '{"processor":"AMD Ryzen 9 7940HS","ram":"16GB","storage":"1TB SSD","display":"14 inch QHD+ 165Hz","graphics":"NVIDIA RTX 4060 8GB","battery":"8 hours"}'],
  
  // Electronics - Audio (10 products)
  ['Sony WH-1000XM5', 'Sony', 'Industry-leading noise cancellation, 30-hour battery, LDAC codec, premium comfort', 399, 449, 10, 'https://via.placeholder.com/400x400?text=Sony+XM5', 85, 'Electronics', 'Audio', 4.7, '{"type":"Over-ear headphones","connectivity":"Bluetooth 5.2, ANC","battery":"30 hours","drivers":"30mm","features":"LDAC, multipoint, speak-to-chat"}'],
  ['Apple AirPods Pro 2', 'Apple', 'Active ANC, Adaptive Audio, H2 chip, USB-C charging, Find My, spatial audio', 249, 279, 15, 'https://via.placeholder.com/400x400?text=AirPods+Pro', 120, 'Electronics', 'Audio', 4.6, '{"type":"In-ear TWS","connectivity":"Bluetooth 5.3, ANC","battery":"6 hours + 30 hours case","drivers":"Custom","features":"Spatial audio, transparency mode"}'],
  ['Bose QuietComfort 45', 'Bose', 'Legendary comfort, TriPort acoustic, 24-hour battery, premium noise cancellation', 329, 379, 12, 'https://via.placeholder.com/400x400?text=Bose+QC45', 68, 'Electronics', 'Audio', 4.5, '{"type":"Over-ear headphones","connectivity":"Bluetooth 5.1, ANC","battery":"24 hours","drivers":"40mm","features":"TriPort, EQ modes"}'],
  ['JBL Flip 6', 'JBL', 'Portable Bluetooth speaker, IP67 waterproof, 12-hour playtime, PartyBoost feature', 129, 149, 8, 'https://via.placeholder.com/400x400?text=JBL+Flip6', 150, 'Electronics', 'Audio', 4.4, '{"type":"Portable speaker","connectivity":"Bluetooth 5.1","battery":"12 hours","power":"30W","features":"IP67, PartyBoost, USB-C"}'],
  
  // Fashion - Clothing (15 products)
  ['Levi\'s 501 Original Jeans', 'Levi\'s', 'Classic straight fit, button fly, 100% cotton denim, iconic timeless style', 79.99, 99.99, 20, 'https://via.placeholder.com/400x400?text=Levis+501', 250, 'Fashion', 'Clothing', 4.5, '{"material":"100% Cotton denim","fit":"Straight","closure":"Button fly","care":"Machine wash","sizes":"28-42 waist"}'],
  ['Nike Tech Fleece Hoodie', 'Nike', 'Premium cotton blend, thermal construction, modern slim fit, iconic comfort', 109, 129, 15, 'https://via.placeholder.com/400x400?text=Nike+Tech', 180, 'Fashion', 'Clothing', 4.6, '{"material":"66% Cotton, 34% Polyester","fit":"Slim","features":"Zippered pockets, ribbed cuffs","care":"Machine wash","sizes":"S-XXL"}'],
  ['Adidas Trefoil Hoodie', 'Adidas', 'Cotton fleece, kangaroo pocket, ribbed cuffs, iconic 3-stripes branding', 64.99, 79.99, 18, 'https://via.placeholder.com/400x400?text=Adidas+Hoodie', 220, 'Fashion', 'Clothing', 4.4, '{"material":"70% Cotton, 30% Polyester","fit":"Regular","features":"Kangaroo pocket, trefoil logo","care":"Machine wash","sizes":"XS-XXL"}'],
  ['Ralph Lauren Polo Shirt', 'Ralph Lauren', 'Classic fit, soft cotton mesh, signature pony logo, timeless elegance', 89.99, 109.99, 15, 'https://via.placeholder.com/400x400?text=Ralph+Lauren', 200, 'Fashion', 'Clothing', 4.5, '{"material":"100% Cotton pique","fit":"Classic","collar":"Ribbed polo","care":"Machine wash","sizes":"S-XXL"}'],
  ['Zara Linen Shirt', 'Zara', '100% premium linen, relaxed fit, breathable fabric, perfect summer essential', 49.99, 64.99, 20, 'https://via.placeholder.com/400x400?text=Zara+Linen', 160, 'Fashion', 'Clothing', 4.2, '{"material":"100% Linen","fit":"Relaxed","closure":"Button-up","care":"Dry clean recommended","sizes":"S-XXL"}'],
  
  // Fashion - Shoes (15 products)
  ['Nike Air Zoom Pegasus 40', 'Nike', 'Responsive cushioning, breathable mesh, durable outsole, neutral support for runners', 139, 159, 12, 'https://via.placeholder.com/400x400?text=Nike+Pegasus', 200, 'Fashion', 'Shoes', 4.7, '{"type":"Running shoes","material":"Mesh upper, rubber sole","cushioning":"React foam + Air Zoom","weight":"280g","sizes":"US 6-14"}'],
  ['Adidas Ultraboost 23', 'Adidas', 'BOOST cushioning, Primeknit+ upper, Continental rubber, maximum energy return', 189, 219, 10, 'https://via.placeholder.com/400x400?text=Ultraboost', 180, 'Fashion', 'Shoes', 4.6, '{"type":"Running shoes","material":"Primeknit+, Continental rubber","cushioning":"BOOST","weight":"310g","sizes":"US 6-14"}'],
  ['Puma Deviate Nitro 2', 'Puma', 'NITRO foam, carbon fiber plate, lightweight, race-day performance running shoe', 159, 189, 8, 'https://via.placeholder.com/400x400?text=Puma+Deviate', 120, 'Fashion', 'Shoes', 4.5, '{"type":"Running shoes","material":"Engineered mesh, carbon plate","cushioning":"NITRO foam","weight":"245g","sizes":"US 6-13"}'],
  ['Converse Chuck Taylor All Star', 'Converse', 'Iconic canvas sneaker, vulcanized rubber sole, timeless classic design since 1917', 59.99, 74.99, 15, 'https://via.placeholder.com/400x400?text=Converse', 300, 'Fashion', 'Shoes', 4.3, '{"type":"Casual sneakers","material":"Canvas upper, rubber sole","style":"High-top/Low-top","features":"OrthoLite insole","sizes":"US 4-13"}'],
  
  // Beauty - Skincare (15 products)
  ['CeraVe Hydrating Cleanser', 'CeraVe', 'Gentle formula with hyaluronic acid, ceramides, fragrance-free, dermatologist recommended', 14.99, 19.99, 12, 'https://via.placeholder.com/400x400?text=CeraVe', 250, 'Beauty', 'Skincare', 4.7, '{"type":"Face cleanser","volume":"473ml","key_ingredients":"Hyaluronic acid, ceramides, glycerin","skin_type":"All types","features":"Fragrance-free, non-comedogenic"}'],
  ['The Ordinary Niacinamide 10% + Zinc 1%', 'The Ordinary', 'Reduces blemishes and congestion, balances sebum, visibly improves skin texture', 5.99, 7.99, 15, 'https://via.placeholder.com/400x400?text=The+Ordinary', 300, 'Beauty', 'Skincare', 4.5, '{"type":"Serum","volume":"30ml","key_ingredients":"10% Niacinamide, 1% Zinc","skin_type":"Oily, combination","features":"Vegan, cruelty-free"}'],
  ['Neutrogena Hydro Boost', 'Neutrogena', 'Oil-free gel moisturizer, hyaluronic acid, 24-hour hydration, non-comedogenic', 18.99, 24.99, 10, 'https://via.placeholder.com/400x400?text=Hydro+Boost', 220, 'Beauty', 'Skincare', 4.4, '{"type":"Face moisturizer","volume":"50ml","key_ingredients":"Hyaluronic acid","skin_type":"All types","features":"Oil-free, non-comedogenic"}'],
  ['Olaplex Hair Perfector No. 3', 'Olaplex', 'Strengthens and repairs damaged hair, salon-quality treatment, cruelty-free', 29.99, 34.99, 8, 'https://via.placeholder.com/400x400?text=Olaplex', 200, 'Beauty', 'Haircare', 4.8, '{"type":"Hair treatment","volume":"100ml","key_ingredients":"Bis-Aminopropyl Diglycol Dimaleate","hair_type":"All types","features":"Repairs bonds, reduces breakage"}'],
  
  // Beauty - Makeup (10 products)
  ['Fenty Beauty Pro Filt\'r Foundation', 'Fenty Beauty', '50 shades, soft matte finish, buildable medium to full coverage, long-wear formula', 39, 45, 10, 'https://via.placeholder.com/400x400?text=Fenty+Foundation', 150, 'Beauty', 'Makeup', 4.6, '{"type":"Foundation","volume":"32ml","coverage":"Medium to full","finish":"Soft matte","features":"50 shades, long-wear, transfer-resistant"}'],
  ['Maybelline Sky High Mascara', 'Maybelline', 'Volumizing and lengthening, bamboo extract, Flex Tower brush, waterproof option', 11.99, 14.99, 12, 'https://via.placeholder.com/400x400?text=Sky+High', 280, 'Beauty', 'Makeup', 4.5, '{"type":"Mascara","volume":"7.2ml","key_ingredients":"Bamboo extract, fibers","features":"Lengthening, volumizing, waterproof available"}'],
  ['MAC Ruby Woo Lipstick', 'MAC', 'Iconic matte red, retro matte formula, highly pigmented, long-lasting color', 24.99, 29.99, 8, 'https://via.placeholder.com/400x400?text=MAC+Ruby+Woo', 180, 'Beauty', 'Makeup', 4.7, '{"type":"Lipstick","shade":"Ruby Woo (red)","finish":"Matte","features":"Highly pigmented, long-lasting"}'],
  
  // Home - Kitchen (15 products)
  ['Ninja Air Fryer Pro', 'Ninja', '5-in-1 functionality, 5-quart capacity, crisp technology, easy-clean basket', 119, 139, 10, 'https://via.placeholder.com/400x400?text=Ninja+Fryer', 85, 'Home', 'Kitchen', 4.6, '{"capacity":"5 quarts","functions":"Air fry, roast, reheat, dehydrate, bake","power":"1750W","features":"Digital controls, dishwasher-safe parts"}'],
  ['Instant Pot Duo Plus', 'Instant Pot', '9-in-1 pressure cooker, 6-quart, 15 smart programs, stainless steel inner pot', 99.99, 129.99, 12, 'https://via.placeholder.com/400x400?text=Instant+Pot', 95, 'Home', 'Kitchen', 4.7, '{"capacity":"6 quarts","functions":"Pressure cook, slow cook, rice cooker, steamer, saute, yogurt maker, warmer, sous vide, sterilizer","power":"1200W"}'],
  ['KitchenAid Stand Mixer', 'KitchenAid', '5-quart tilt-head, 10-speed, includes 3 attachments, iconic design and performance', 379, 449, 5, 'https://via.placeholder.com/400x400?text=KitchenAid', 55, 'Home', 'Kitchen', 4.8, '{"capacity":"5 quarts","speeds":"10","power":"325W","attachments":"Flat beater, dough hook, wire whip","features":"Tilt-head design"}'],
  ['Breville Barista Express', 'Breville', 'Espresso machine with integrated grinder, 15-bar Italian pump, milk frother', 699, 799, 6, 'https://via.placeholder.com/400x400?text=Breville', 35, 'Home', 'Kitchen', 4.7, '{"type":"Espresso machine","pressure":"15 bar","grinder":"Integrated conical burr","features":"PID temperature control, steam wand, dose control"}'],
  
  // Home - Appliances (10 products)
  ['Dyson V15 Detect', 'Dyson', 'Cordless vacuum, laser dust detection, 60-minute runtime, HEPA filtration', 649, 749, 8, 'https://via.placeholder.com/400x400?text=Dyson+V15', 40, 'Home', 'Appliances', 4.6, '{"type":"Cordless vacuum","runtime":"60 minutes","suction":"230 AW","features":"Laser detection, LCD screen, HEPA filtration","weight":"3kg"}'],
  ['iRobot Roomba j7+', 'iRobot', 'Self-emptying robot vacuum, AI obstacle avoidance, smart mapping, WiFi-enabled', 799, 899, 7, 'https://via.placeholder.com/400x400?text=Roomba+j7', 30, 'Home', 'Appliances', 4.5, '{"type":"Robot vacuum","runtime":"75 minutes","features":"Auto-empty base, PrecisionVision navigation, app control, voice assistant"}'],
  ['Philips Hue Starter Kit', 'Philips', '4 LED smart bulbs with hub, 16 million colors, voice control, app-enabled', 199, 229, 10, 'https://via.placeholder.com/400x400?text=Philips+Hue', 120, 'Home', 'Smart Home', 4.4, '{"bulbs":"4 x A19 E27","colors":"16 million","compatibility":"Alexa, Google, Apple HomeKit","features":"Schedules, scenes, sync with entertainment"}'],
  
  // Sports - Fitness (15 products)
  ['Bowflex SelectTech 552', 'Bowflex', 'Adjustable dumbbells 5-52.5 lbs, space-saving design, 15 weight settings', 399, 499, 6, 'https://via.placeholder.com/400x400?text=Bowflex', 45, 'Sports', 'Fitness', 4.7, '{"type":"Adjustable dumbbells","weight_range":"5 to 52.5 lbs (2.27 to 23.8 kg)","adjustments":"15 settings","features":"Compact, replaces 15 dumbbells"}'],
  ['Manduka PRO Yoga Mat', 'Manduka', 'Premium 6mm thickness, lifetime guarantee, closed-cell surface, eco-friendly', 119, 139, 8, 'https://via.placeholder.com/400x400?text=Manduka+Mat', 90, 'Sports', 'Yoga', 4.6, '{"thickness":"6mm","material":"PVC (eco-friendly)","size":"71 x 26 inches","features":"Dense cushioning, lifetime guarantee, non-slip"}'],
  ['Fitbit Charge 6', 'Fitbit', 'Fitness tracker with heart rate, GPS, sleep tracking, 7-day battery, Google integration', 159, 179, 10, 'https://via.placeholder.com/400x400?text=Fitbit+C6', 110, 'Sports', 'Wearables', 4.5, '{"display":"AMOLED","battery":"7 days","features":"Heart rate, GPS, sleep tracking, stress management, Google apps","water_resistance":"50m"}'],
  ['Garmin Forerunner 265', 'Garmin', 'AMOLED display, advanced running metrics, training readiness, music storage', 449, 499, 8, 'https://via.placeholder.com/400x400?text=Garmin+265', 65, 'Sports', 'Wearables', 4.7, '{"display":"1.3 inch AMOLED","battery":"13 days","features":"GPS, running dynamics, training load, VO2 max, music storage","water_resistance":"5 ATM"}'],
  
  // Books (10 products)
  ['Atomic Habits', 'James Clear', 'Tiny changes, remarkable results - proven framework for improving every day', 16.99, 27.99, 35, 'https://via.placeholder.com/400x400?text=Atomic+Habits', 200, 'Books', 'Self-Help', 4.8, '{"author":"James Clear","pages":"320","publisher":"Avery","language":"English","format":"Hardcover, Paperback, Kindle"}'],
  ['The Psychology of Money', 'Morgan Housel', 'Timeless lessons on wealth, greed, and happiness from financial expert', 14.99, 24.99, 30, 'https://via.placeholder.com/400x400?text=Psychology+Money', 180, 'Books', 'Finance', 4.7, '{"author":"Morgan Housel","pages":"256","publisher":"Harriman House","language":"English","format":"Hardcover, Paperback, Kindle"}'],
  ['Where the Crawdads Sing', 'Delia Owens', 'Bestselling mystery and coming-of-age story set in the marshlands of North Carolina', 15.99, 28.99, 28, 'https://via.placeholder.com/400x400?text=Crawdads+Sing', 160, 'Books', 'Fiction', 4.6, '{"author":"Delia Owens","pages":"384","publisher":"Putnam","language":"English","format":"Hardcover, Paperback, Kindle"}'],
  
  // Grocery (10 products)
  ['Organic Quinoa 2lb', 'Bob\'s Red Mill', 'Premium organic white quinoa, complete protein, gluten-free, ancient grain', 12.99, 15.99, 20, 'https://via.placeholder.com/400x400?text=Quinoa', 300, 'Grocery', 'Grains', 4.5, '{"weight":"2 lbs (907g)","certifications":"Organic, Non-GMO, Gluten-free","protein":"8g per serving","features":"Complete protein, high fiber"}'],
  ['Organic Extra Virgin Olive Oil', 'California Olive Ranch', 'Cold-pressed EVOO, robust flavor, perfect for cooking and dressings', 19.99, 24.99, 15, 'https://via.placeholder.com/400x400?text=Olive+Oil', 250, 'Grocery', 'Oils', 4.6, '{"volume":"25.4 fl oz (750ml)","certifications":"Organic, Non-GMO","type":"Extra virgin, cold-pressed","features":"Rich in antioxidants"}'],
  ['Organic Raw Honey', 'Nature Nate\'s', '100% pure, unfiltered raw honey, no additives, natural sweetener', 9.99, 12.99, 18, 'https://via.placeholder.com/400x400?text=Raw+Honey', 280, 'Grocery', 'Sweeteners', 4.7, '{"weight":"32 oz (907g)","certifications":"Organic, Raw, Unfiltered","features":"Natural enzymes, no additives, sustainably sourced"}'],
  
  // Accessories (15 products)
  ['Ray-Ban Aviator Classic', 'Ray-Ban', 'Iconic metal aviator, 100% UV protection, multiple lens colors, timeless design', 153, 189, 12, 'https://via.placeholder.com/400x400?text=RayBan', 180, 'Accessories', 'Eyewear', 4.5, '{"type":"Sunglasses","frame":"Metal","lens":"Glass/plastic","uv_protection":"100%","features":"Adjustable nose pads, case included"}'],
  ['Apple Watch Series 9', 'Apple', 'Always-on Retina display, S9 chip, fitness tracking, cellular, ECG, crash detection', 429, 499, 10, 'https://via.placeholder.com/400x400?text=Watch+S9', 85, 'Accessories', 'Smartwatches', 4.8, '{"display":"Always-on Retina","chip":"S9","features":"ECG, blood oxygen, crash detection, water resistant 50m","battery":"18 hours"}'],
  ['Fossil Gen 6 Smartwatch', 'Fossil', 'Wear OS, heart rate, GPS, customizable faces, fast charging, classic design', 299, 349, 8, 'https://via.placeholder.com/400x400?text=Fossil+Gen6', 70, 'Accessories', 'Smartwatches', 4.3, '{"os":"Wear OS by Google","features":"Heart rate, GPS, NFC payments, always-on display","battery":"24+ hours","charging":"80% in 30 min"}'],
  ['Bellroy Slim Sleeve Wallet', 'Bellroy', 'Premium leather, RFID protection, holds 4-12 cards, ultra-slim compact design', 99, 119, 10, 'https://via.placeholder.com/400x400?text=Bellroy', 150, 'Accessories', 'Wallets', 4.6, '{"material":"Premium leather","capacity":"4-12 cards + bills","features":"RFID protection, pull tab","dimensions":"3.6 x 2.4 x 0.6 inches"}'],
  ['Samsonite Winfield 3 Luggage', 'Samsonite', '20" hardside spinner, scratch-resistant, TSA lock, lightweight durable polycarbonate', 179, 229, 6, 'https://via.placeholder.com/400x400?text=Samsonite', 65, 'Accessories', 'Luggage', 4.5, '{"size":"20 inch carry-on","material":"Polycarbonate","wheels":"4 spinner wheels","features":"TSA lock, scratch-resistant, lightweight","weight":"6.8 lbs"}'],
  ['Anker PowerCore 20000mAh', 'Anker', 'High-capacity portable charger, fast charging, dual USB ports, compact design', 49.99, 59.99, 12, 'https://via.placeholder.com/400x400?text=Anker+Power', 200, 'Accessories', 'Tech', 4.7, '{"capacity":"20000mAh","ports":"2 USB-A","features":"PowerIQ, fast charging, compact","charges":"iPhone 13: 4x, Galaxy S22: 3.5x"}'],
  ['YETI Rambler 30oz', 'YETI', 'Stainless steel tumbler, double-wall vacuum insulation, MagSlider lid, keeps drinks cold/hot', 35, 44.99, 15, 'https://via.placeholder.com/400x400?text=YETI+Rambler', 250, 'Accessories', 'Drinkware', 4.8, '{"capacity":"30 oz (887ml)","material":"18/8 stainless steel","features":"Double-wall vacuum, MagSlider lid, dishwasher safe","keeps_cold":"24+ hours","keeps_hot":"6+ hours"}']
];

// Clear existing products first
db.run('DELETE FROM products', (err) => {
  if (err) {
    console.error('Error clearing products:', err.message);
    db.close();
    return;
  }
  
  console.log('✓ Cleared existing products\n');
  
  // Insert new products
  const stmt = db.prepare(`
    INSERT INTO products (name, brand, description, price, image_url, discount, stock, category, subcategory, rating, specifications)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  let completed = 0;
  let errors = 0;
  
  products.forEach((product) => {
    // Calculate final price after discount
    const [name, brand, description, finalPrice, originalPrice, discount, imageUrl, stock, category, subcategory, rating, specifications] = product;
    
    stmt.run(name, brand, description, finalPrice, imageUrl, discount, stock, category, subcategory, rating, specifications, (err) => {
      if (err) {
        console.error(`Error inserting ${name}:`, err.message);
        errors++;
      }
      completed++;
      
      if (completed === products.length) {
        stmt.finalize();
        
        // Get category breakdown
        db.all('SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY category', (err, rows) => {
          if (err) {
            console.error('Error getting categories:', err);
          } else {
            console.log('\n📦 Product Catalog Summary:\n');
            console.log(`Total Products: ${completed - errors}`);
            console.log('\nBy Category:');
            rows.forEach(row => {
              console.log(`  ${row.category}: ${row.count} products`);
            });
          }
          
          if (errors > 0) {
            console.log(`\n⚠️  ${errors} products failed to import.`);
          } else {
            console.log('\n✅ All products imported successfully!');
          }
          
          db.close();
        });
      }
    });
  });
});
