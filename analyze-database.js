const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database/ecommerce.db');

console.log('═══════════════════════════════════════════════════');
console.log('   DATABASE ANALYSIS - SmartTrack Commerce');
console.log('═══════════════════════════════════════════════════\n');

// Get total count
db.get('SELECT COUNT(*) as total FROM products', (err, row) => {
  if (err) {
    console.error('Error:', err);
    db.close();
    return;
  }
  
  console.log(`📊 TOTAL PRODUCTS: ${row.total}\n`);
  
  // Get categories
  db.all('SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY count DESC', (err, rows) => {
    if (err) {
      console.error('Error:', err);
      db.close();
      return;
    }
    
    console.log('📁 PRODUCTS BY CATEGORY:');
    rows.forEach(row => {
      console.log(`   ${row.category.padEnd(20)} ${row.count} products`);
    });
    
    // Get price range
    db.get('SELECT MIN(price) as min_price, MAX(price) as max_price, AVG(price) as avg_price FROM products', (err, row) => {
      if (err) {
        console.error('Error:', err);
        db.close();
        return;
      }
      
      console.log('\n💰 PRICE RANGE:');
      console.log(`   Minimum: $${row.min_price}`);
      console.log(`   Maximum: $${row.max_price}`);
      console.log(`   Average: $${row.avg_price.toFixed(2)}`);
      
      // Get sample products
      console.log('\n📦 SAMPLE PRODUCTS (First 10):');
      db.all('SELECT id, name, price, category, stock FROM products ORDER BY id LIMIT 10', (err, rows) => {
        if (err) {
          console.error('Error:', err);
          db.close();
          return;
        }
        
        rows.forEach(row => {
          console.log(`   [${row.id}] ${row.name.substring(0, 40).padEnd(42)} $${String(row.price).padStart(8)} | ${row.category} | Stock: ${row.stock}`);
        });
        
        // Check for custom products (not in seed data)
        const seedProducts = require('./database/seed-marketplace-data')();
        const seedNames = new Set(seedProducts.map(p => p[0]));
        
        db.all('SELECT name FROM products', (err, rows) => {
          if (err) {
            console.error('Error:', err);
            db.close();
            return;
          }
          
          const currentNames = rows.map(r => r.name);
          const customProducts = currentNames.filter(name => !seedNames.has(name));
          
          console.log('\n🔍 CUSTOM PRODUCTS (Not in seed data):');
          if (customProducts.length === 0) {
            console.log('   ✓ All products match seed data (54 standard products)');
          } else {
            console.log(`   Found ${customProducts.length} custom products:`);
            customProducts.slice(0, 10).forEach(name => {
              console.log(`   - ${name}`);
            });
            if (customProducts.length > 10) {
              console.log(`   ... and ${customProducts.length - 10} more`);
            }
          }
          
          console.log('\n═══════════════════════════════════════════════════');
          console.log('✅ Analysis Complete');
          console.log('═══════════════════════════════════════════════════\n');
          
          db.close();
        });
      });
    });
  });
});
