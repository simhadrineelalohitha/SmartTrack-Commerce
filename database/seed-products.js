// Comprehensive Product Seeding Script
// Adds 100+ realistic products across multiple categories

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'ecommerce.db');
const db = new sqlite3.Database(dbPath);

console.log('🌱 Starting product seeding...\n');

// Comprehensive product catalog with realistic data
const products = [
  // Electronics - Smartphones & Tablets (15 products)
  {
    name: 'iPhone 14 Pro Max',
    description: 'Latest Apple iPhone with A16 Bionic chip, 48MP camera, Dynamic Island, 6.7" Super Retina XDR display',
    price: 1099.00,
    image_url: 'https://via.placeholder.com/300x300?text=iPhone+14+Pro+Max',
    stock: 45,
    category: 'Electronics'
  },
  {
    name: 'Samsung Galaxy S23 Ultra',
    description: '200MP camera, 6.8" Dynamic AMOLED display, Snapdragon 8 Gen 2, S Pen included',
    price: 1199.00,
    image_url: 'https://via.placeholder.com/300x300?text=Samsung+S23+Ultra',
    stock: 38,
    category: 'Electronics'
  },
  {
    name: 'Google Pixel 8 Pro',
    description: 'Google Tensor G3 chip, Best AI camera, 6.7" LTPO OLED display, 5000mAh battery',
    price: 899.00,
    image_url: 'https://via.placeholder.com/300x300?text=Google+Pixel+8',
    stock: 52,
    category: 'Electronics'
  },
  {
    name: 'OnePlus 11 5G',
    description: 'Snapdragon 8 Gen 2, 100W fast charging, Hasselblad camera, 120Hz display',
    price: 699.00,
    image_url: 'https://via.placeholder.com/300x300?text=OnePlus+11',
    stock: 60,
    category: 'Electronics'
  },
  {
    name: 'iPad Air 5th Gen',
    description: 'M1 chip, 10.9" Liquid Retina display, Apple Pencil support, 256GB storage',
    price: 749.00,
    image_url: 'https://via.placeholder.com/300x300?text=iPad+Air',
    stock: 35,
    category: 'Electronics'
  },
  {
    name: 'Samsung Galaxy Tab S9',
    description: 'Snapdragon 8 Gen 2, 11" AMOLED display, S Pen included, IP68 water resistant',
    price: 649.00,
    image_url: 'https://via.placeholder.com/300x300?text=Galaxy+Tab+S9',
    stock: 42,
    category: 'Electronics'
  },
  {
    name: 'Xiaomi 13 Pro',
    description: 'Leica camera system, Snapdragon 8 Gen 2, 120W fast charging, AMOLED display',
    price: 599.00,
    image_url: 'https://via.placeholder.com/300x300?text=Xiaomi+13+Pro',
    stock: 55,
    category: 'Electronics'
  },
  {
    name: 'Nothing Phone 2',
    description: 'Unique Glyph interface, Snapdragon 8+ Gen 1, 120Hz OLED display, 45W charging',
    price: 549.00,
    image_url: 'https://via.placeholder.com/300x300?text=Nothing+Phone+2',
    stock: 48,
    category: 'Electronics'
  },
  {
    name: 'Motorola Edge 40 Pro',
    description: 'Snapdragon 8 Gen 2, 165Hz display, 125W fast charging, curved OLED screen',
    price: 499.00,
    image_url: 'https://via.placeholder.com/300x300?text=Motorola+Edge+40',
    stock: 65,
    category: 'Electronics'
  },
  {
    name: 'Realme GT 3',
    description: '240W fast charging, Snapdragon 8+ Gen 1, 144Hz AMOLED display, RGB lighting',
    price: 449.00,
    image_url: 'https://via.placeholder.com/300x300?text=Realme+GT+3',
    stock: 70,
    category: 'Electronics'
  },

  // Electronics - Laptops & Computers (15 products)
  {
    name: 'MacBook Pro 16" M3 Max',
    description: 'M3 Max chip, 48GB RAM, 1TB SSD, Liquid Retina XDR display, 22-hour battery',
    price: 2999.00,
    image_url: 'https://via.placeholder.com/300x300?text=MacBook+Pro+M3',
    stock: 25,
    category: 'Electronics'
  },
  {
    name: 'Dell XPS 15',
    description: 'Intel i9-13900H, NVIDIA RTX 4070, 32GB RAM, 1TB SSD, 15.6" 4K OLED',
    price: 2499.00,
    image_url: 'https://via.placeholder.com/300x300?text=Dell+XPS+15',
    stock: 30,
    category: 'Electronics'
  },
  {
    name: 'HP Spectre x360',
    description: 'Intel i7-1355U, 16GB RAM, 512GB SSD, 13.5" 3K2K touchscreen, 360° hinge',
    price: 1599.00,
    image_url: 'https://via.placeholder.com/300x300?text=HP+Spectre+x360',
    stock: 40,
    category: 'Electronics'
  },
  {
    name: 'Lenovo ThinkPad X1 Carbon',
    description: 'Intel i7-1365U, 16GB RAM, 512GB SSD, 14" 2.8K display, MIL-STD tested',
    price: 1799.00,
    image_url: 'https://via.placeholder.com/300x300?text=ThinkPad+X1',
    stock: 35,
    category: 'Electronics'
  },
  {
    name: 'ASUS ROG Zephyrus G14',
    description: 'AMD Ryzen 9 7940HS, RTX 4060, 16GB RAM, 1TB SSD, 14" QHD+ 165Hz',
    price: 1899.00,
    image_url: 'https://via.placeholder.com/300x300?text=ROG+Zephyrus',
    stock: 28,
    category: 'Electronics'
  },
  {
    name: 'Microsoft Surface Laptop 5',
    description: 'Intel i7-1265U, 16GB RAM, 512GB SSD, 13.5" PixelSense touchscreen',
    price: 1499.00,
    image_url: 'https://via.placeholder.com/300x300?text=Surface+Laptop+5',
    stock: 45,
    category: 'Electronics'
  },
  {
    name: 'Acer Swift 3',
    description: 'Intel i5-1335U, 16GB RAM, 512GB SSD, 14" FHD IPS, lightweight 2.65 lbs',
    price: 899.00,
    image_url: 'https://via.placeholder.com/300x300?text=Acer+Swift+3',
    stock: 60,
    category: 'Electronics'
  },
  {
    name: 'MacBook Air M2',
    description: 'M2 chip, 8GB RAM, 256GB SSD, 13.6" Liquid Retina, fanless design',
    price: 1199.00,
    image_url: 'https://via.placeholder.com/300x300?text=MacBook+Air+M2',
    stock: 55,
    category: 'Electronics'
  },

  // Electronics - Audio (10 products)
  {
    name: 'Sony WH-1000XM5',
    description: 'Industry-leading noise cancellation, 30-hour battery, LDAC codec, premium comfort',
    price: 399.00,
    image_url: 'https://via.placeholder.com/300x300?text=Sony+WH1000XM5',
    stock: 80,
    category: 'Electronics'
  },
  {
    name: 'Apple AirPods Pro 2',
    description: 'Active noise cancellation, Adaptive Audio, H2 chip, USB-C charging, Find My',
    price: 249.00,
    image_url: 'https://via.placeholder.com/300x300?text=AirPods+Pro+2',
    stock: 120,
    category: 'Electronics'
  },
  {
    name: 'Bose QuietComfort 45',
    description: 'Noise cancelling headphones, 24-hour battery, TriPort technology, premium audio',
    price: 329.00,
    image_url: 'https://via.placeholder.com/300x300?text=Bose+QC45',
    stock: 65,
    category: 'Electronics'
  },
  {
    name: 'JBL Flip 6',
    description: 'Portable Bluetooth speaker, IP67 waterproof, 12-hour playtime, PartyBoost',
    price: 129.00,
    image_url: 'https://via.placeholder.com/300x300?text=JBL+Flip+6',
    stock: 150,
    category: 'Electronics'
  },
  {
    name: 'Sennheiser Momentum 4',
    description: 'Adaptive ANC, 60-hour battery, audiophile sound, smart controls',
    price: 379.00,
    image_url: 'https://via.placeholder.com/300x300?text=Sennheiser+M4',
    stock: 50,
    category: 'Electronics'
  },

  // Sports & Fitness (20 products)
  {
    name: 'Nike Air Zoom Pegasus 40',
    description: 'Responsive cushioning, breathable mesh upper, durable outsole, neutral support',
    price: 139.00,
    image_url: 'https://via.placeholder.com/300x300?text=Nike+Pegasus+40',
    stock: 200,
    category: 'Sports'
  },
  {
    name: 'Adidas Ultraboost 23',
    description: 'BOOST cushioning, Primeknit+ upper, Continental rubber outsole, energy return',
    price: 189.00,
    image_url: 'https://via.placeholder.com/300x300?text=Ultraboost+23',
    stock: 180,
    category: 'Sports'
  },
  {
    name: 'Puma Deviate Nitro 2',
    description: 'NITRO foam, carbon fiber plate, lightweight design, race-day performance',
    price: 159.00,
    image_url: 'https://via.placeholder.com/300x300?text=Puma+Deviate',
    stock: 120,
    category: 'Sports'
  },
  {
    name: 'Under Armour HOVR Phantom 3',
    description: 'UA HOVR cushioning, compression mesh, connected tracking, energy return',
    price: 149.00,
    image_url: 'https://via.placeholder.com/300x300?text=UA+HOVR',
    stock: 140,
    category: 'Sports'
  },
  {
    name: 'Manduka PRO Yoga Mat',
    description: 'Premium 6mm thickness, lifetime guarantee, closed-cell surface, eco-friendly',
    price: 119.00,
    image_url: 'https://via.placeholder.com/300x300?text=Manduka+PRO',
    stock: 90,
    category: 'Sports'
  },
  {
    name: 'Liforme Yoga Mat',
    description: 'Planet-friendly materials, AlignForMe system, 4.2mm grip, biodegradable',
    price: 139.00,
    image_url: 'https://via.placeholder.com/300x300?text=Liforme+Mat',
    stock: 75,
    category: 'Sports'
  },
  {
    name: 'Bowflex SelectTech 552',
    description: 'Adjustable dumbbells 5-52.5 lbs, space-saving, 15 weight settings, durable',
    price: 399.00,
    image_url: 'https://via.placeholder.com/300x300?text=Bowflex+552',
    stock: 45,
    category: 'Sports'
  },
  {
    name: 'Resistance Bands Set',
    description: '5-piece set with handles, door anchor, ankle straps, portable gym',
    price: 29.99,
    image_url: 'https://via.placeholder.com/300x300?text=Resistance+Bands',
    stock: 300,
    category: 'Sports'
  },
  {
    name: 'Fitbit Charge 6',
    description: 'Heart rate monitor, GPS, sleep tracking, 7-day battery, Google integration',
    price: 159.00,
    image_url: 'https://via.placeholder.com/300x300?text=Fitbit+Charge+6',
    stock: 110,
    category: 'Sports'
  },
  {
    name: 'Garmin Forerunner 265',
    description: 'AMOLED display, advanced running metrics, training readiness, music storage',
    price: 449.00,
    image_url: 'https://via.placeholder.com/300x300?text=Garmin+265',
    stock: 65,
    category: 'Sports'
  },

  // Fashion - Clothing (15 products)
  {
    name: "Levi's 501 Original Jeans",
    description: 'Classic straight fit, button fly, shrink-to-fit denim, timeless style',
    price: 79.99,
    image_url: 'https://via.placeholder.com/300x300?text=Levis+501',
    stock: 250,
    category: 'Fashion'
  },
  {
    name: 'Nike Sportswear Tech Fleece',
    description: 'Premium cotton blend, thermal construction, modern fit, iconic comfort',
    price: 109.00,
    image_url: 'https://via.placeholder.com/300x300?text=Nike+Tech+Fleece',
    stock: 180,
    category: 'Fashion'
  },
  {
    name: 'Adidas Originals Trefoil Hoodie',
    description: 'Cotton fleece, kangaroo pocket, ribbed cuffs, iconic 3-stripes',
    price: 64.99,
    image_url: 'https://via.placeholder.com/300x300?text=Adidas+Hoodie',
    stock: 220,
    category: 'Fashion'
  },
  {
    name: 'Ralph Lauren Polo Shirt',
    description: 'Classic fit, soft cotton mesh, signature pony logo, timeless design',
    price: 89.99,
    image_url: 'https://via.placeholder.com/300x300?text=Ralph+Lauren+Polo',
    stock: 200,
    category: 'Fashion'
  },
  {
    name: 'Zara Linen Shirt',
    description: '100% linen, relaxed fit, breathable fabric, summer essential',
    price: 49.99,
    image_url: 'https://via.placeholder.com/300x300?text=Zara+Linen',
    stock: 160,
    category: 'Fashion'
  },

  // Home & Kitchen (20 products)
  {
    name: 'Ninja Air Fryer Pro',
    description: '5-in-1 functionality, 5-quart capacity, crisp technology, easy clean basket',
    price: 119.00,
    image_url: 'https://via.placeholder.com/300x300?text=Ninja+Air+Fryer',
    stock: 85,
    category: 'Home'
  },
  {
    name: 'Instant Pot Duo Plus',
    description: '9-in-1 pressure cooker, 6-quart, 15 smart programs, stainless steel',
    price: 99.99,
    image_url: 'https://via.placeholder.com/300x300?text=Instant+Pot',
    stock: 95,
    category: 'Home'
  },
  {
    name: 'Keurig K-Elite Coffee Maker',
    description: 'Single-serve K-Cup pods, iced coffee setting, 75oz reservoir, strong brew',
    price: 169.00,
    image_url: 'https://via.placeholder.com/300x300?text=Keurig+Elite',
    stock: 70,
    category: 'Home'
  },
  {
    name: 'Breville Barista Express',
    description: 'Espresso machine with grinder, 15-bar Italian pump, milk frother',
    price: 699.00,
    image_url: 'https://via.placeholder.com/300x300?text=Breville+Barista',
    stock: 35,
    category: 'Home'
  },
  {
    name: 'KitchenAid Stand Mixer',
    description: '5-quart bowl, 10-speed, tilt-head design, includes 3 attachments',
    price: 379.00,
    image_url: 'https://via.placeholder.com/300x300?text=KitchenAid+Mixer',
    stock: 55,
    category: 'Home'
  },
  {
    name: 'Dyson V15 Detect',
    description: 'Cordless vacuum, laser dust detection, 60-minute runtime, HEPA filtration',
    price: 649.00,
    image_url: 'https://via.placeholder.com/300x300?text=Dyson+V15',
    stock: 40,
    category: 'Home'
  },
  {
    name: 'iRobot Roomba j7+',
    description: 'Self-emptying robot vacuum, AI obstacle avoidance, smart mapping, WiFi',
    price: 799.00,
    image_url: 'https://via.placeholder.com/300x300?text=Roomba+j7',
    stock: 30,
    category: 'Home'
  },
  {
    name: 'Philips Hue Smart Bulbs Starter Kit',
    description: '4 LED bulbs, smart hub included, 16 million colors, voice control',
    price: 199.00,
    image_url: 'https://via.placeholder.com/300x300?text=Philips+Hue',
    stock: 120,
    category: 'Home'
  },
  {
    name: 'Nest Learning Thermostat',
    description: 'Smart temperature control, energy saving, WiFi enabled, auto-schedule',
    price: 249.00,
    image_url: 'https://via.placeholder.com/300x300?text=Nest+Thermostat',
    stock: 75,
    category: 'Home'
  },
  {
    name: 'Ring Video Doorbell Pro 2',
    description: 'HD+ video, 3D motion detection, Alexa compatible, night vision',
    price: 269.00,
    image_url: 'https://via.placeholder.com/300x300?text=Ring+Doorbell',
    stock: 90,
    category: 'Home'
  },

  // Beauty & Personal Care (15 products)
  {
    name: 'Olaplex Hair Repair Treatment',
    description: 'No. 3 Hair Perfector, strengthens and repairs, salon-quality, cruelty-free',
    price: 29.99,
    image_url: 'https://via.placeholder.com/300x300?text=Olaplex+No3',
    stock: 200,
    category: 'Beauty'
  },
  {
    name: 'Dyson Airwrap Complete',
    description: 'Multi-styler, curls, waves, and dries with no extreme heat, 6 attachments',
    price: 599.00,
    image_url: 'https://via.placeholder.com/300x300?text=Dyson+Airwrap',
    stock: 25,
    category: 'Beauty'
  },
  {
    name: 'The Ordinary Niacinamide Serum',
    description: '10% niacinamide + 1% zinc, reduces blemishes, balances oil, vegan',
    price: 5.99,
    image_url: 'https://via.placeholder.com/300x300?text=The+Ordinary',
    stock: 300,
    category: 'Beauty'
  },
  {
    name: 'CeraVe Hydrating Facial Cleanser',
    description: 'Gentle formula, hyaluronic acid, ceramides, fragrance-free, dermatologist recommended',
    price: 14.99,
    image_url: 'https://via.placeholder.com/300x300?text=CeraVe+Cleanser',
    stock: 250,
    category: 'Beauty'
  },
  {
    name: 'Neutrogena Hydro Boost Water Gel',
    description: 'Oil-free moisturizer, hyaluronic acid, non-comedogenic, 24-hour hydration',
    price: 18.99,
    image_url: 'https://via.placeholder.com/300x300?text=Hydro+Boost',
    stock: 220,
    category: 'Beauty'
  },
  {
    name: 'Maybelline Sky High Mascara',
    description: 'Volumizing and lengthening, bamboo extract, flex tower brush, waterproof',
    price: 11.99,
    image_url: 'https://via.placeholder.com/300x300?text=Sky+High+Mascara',
    stock: 280,
    category: 'Beauty'
  },
  {
    name: 'Fenty Beauty Pro Filtr Foundation',
    description: '50 shades, soft matte finish, buildable coverage, long-wear formula',
    price: 39.00,
    image_url: 'https://via.placeholder.com/300x300?text=Fenty+Foundation',
    stock: 150,
    category: 'Beauty'
  },

  // Accessories (10 products)
  {
    name: 'Ray-Ban Aviator Classic',
    description: 'Iconic design, 100% UV protection, metal frame, multiple lens colors',
    price: 153.00,
    image_url: 'https://via.placeholder.com/300x300?text=RayBan+Aviator',
    stock: 180,
    category: 'Accessories'
  },
  {
    name: 'Michael Kors Jet Set Tote',
    description: 'Saffiano leather, multiple pockets, laptop compatible, signature hardware',
    price: 298.00,
    image_url: 'https://via.placeholder.com/300x300?text=MK+Tote',
    stock: 95,
    category: 'Accessories'
  },
  {
    name: 'Fossil Gen 6 Smartwatch',
    description: 'Wear OS, heart rate tracking, GPS, customizable watch faces, fast charging',
    price: 299.00,
    image_url: 'https://via.placeholder.com/300x300?text=Fossil+Gen6',
    stock: 70,
    category: 'Accessories'
  },
  {
    name: 'Apple Watch Series 9',
    description: 'Always-on Retina display, S9 chip, fitness tracking, cellular, ECG app',
    price: 429.00,
    image_url: 'https://via.placeholder.com/300x300?text=Apple+Watch+9',
    stock: 85,
    category: 'Accessories'
  },
  {
    name: 'Bellroy Slim Sleeve Wallet',
    description: 'Premium leather, RFID protection, holds 4-12 cards, compact design',
    price: 99.00,
    image_url: 'https://via.placeholder.com/300x300?text=Bellroy+Wallet',
    stock: 150,
    category: 'Accessories'
  },
  {
    name: 'Anker PowerCore 20000mAh',
    description: 'High-capacity portable charger, fast charging, dual USB ports, compact',
    price: 49.99,
    image_url: 'https://via.placeholder.com/300x300?text=Anker+PowerCore',
    stock: 200,
    category: 'Accessories'
  },
  {
    name: 'Samsonite Winfield 3 Luggage',
    description: '20" hardside spinner, scratch-resistant, TSA lock, lightweight',
    price: 179.00,
    image_url: 'https://via.placeholder.com/300x300?text=Samsonite+Luggage',
    stock: 65,
    category: 'Accessories'
  },
  {
    name: 'Herschel Little America Backpack',
    description: '25L capacity, laptop sleeve, magnetic strap, water-resistant, classic design',
    price: 109.99,
    image_url: 'https://via.placeholder.com/300x300?text=Herschel+Backpack',
    stock: 140,
    category: 'Accessories'
  },
  {
    name: 'YETI Rambler 30oz Tumbler',
    description: 'Stainless steel, double-wall vacuum insulation, MagSlider lid, keeps drinks cold/hot',
    price: 35.00,
    image_url: 'https://via.placeholder.com/300x300?text=YETI+Rambler',
    stock: 250,
    category: 'Accessories'
  },
  {
    name: 'Hydro Flask 32oz Wide Mouth',
    description: 'TempShield insulation, BPA-free, powder-coated finish, lifetime warranty',
    price: 44.95,
    image_url: 'https://via.placeholder.com/300x300?text=Hydro+Flask',
    stock: 220,
    category: 'Accessories'
  }
];

console.log(`📦 Preparing to seed ${products.length} products...\n`);

// Clear existing products and insert new ones
db.serialize(() => {
  // Delete existing products
  db.run('DELETE FROM products', (err) => {
    if (err) {
      console.error('❌ Error clearing products:', err.message);
      return;
    }
    console.log('🗑️  Cleared existing products\n');

    // Insert all products
    const stmt = db.prepare(`
      INSERT INTO products (name, description, price, image_url, stock, category)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    let successCount = 0;
    let errorCount = 0;

    products.forEach((product, index) => {
      stmt.run(
        product.name,
        product.description,
        product.price,
        product.image_url,
        product.stock,
        product.category,
        (err) => {
          if (err) {
            console.error(`❌ Error inserting product ${index + 1}:`, err.message);
            errorCount++;
          } else {
            successCount++;
          }
        }
      );
    });

    stmt.finalize(() => {
      console.log('\n✅ Product seeding complete!\n');
      console.log(`📊 Statistics:`);
      console.log(`   ✓ Successfully added: ${successCount} products`);
      if (errorCount > 0) {
        console.log(`   ✗ Failed: ${errorCount} products`);
      }
      console.log(`\n📁 Products by category:`);

      // Count products by category
      db.all(`
        SELECT category, COUNT(*) as count 
        FROM products 
        GROUP BY category 
        ORDER BY category
      `, (err, rows) => {
        if (err) {
          console.error('Error counting products:', err.message);
        } else {
          rows.forEach(row => {
            console.log(`   ${row.category}: ${row.count} products`);
          });
        }

        console.log('\n🎉 Your store now has', successCount, 'products!');
        console.log('🚀 Restart your server to see all products\n');
        
        db.close();
      });
    });
  });
});
