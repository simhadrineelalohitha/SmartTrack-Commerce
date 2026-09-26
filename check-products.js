const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database/ecommerce.db');

console.log('📊 Product Catalog Summary\n');

// Total count
db.get('SELECT COUNT(*) as total FROM products', (err, row) => {
  if (err) {
    console.error('Error:', err);
    db.close();
    return;
  }
  
  console.log(`Total Products: ${row.total}\n`);
  
  // Count by category
  db.all('SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY count DESC', (err, rows) => {
    if (err) {
      console.error('Error:', err);
      db.close();
      return;
    }
    
    console.log('Products by Category:');
    rows.forEach(row => {
      console.log(`  ${row.category}: ${row.count} products`);
    });
    
    console.log('\n📦 Sample Products:\n');
    
    // Show a few sample products from each category
    db.all('SELECT name, price, category FROM products ORDER BY category, price DESC LIMIT 15', (err, rows) => {
      if (err) {
        console.error('Error:', err);
        db.close();
        return;
      }
      
      let currentCategory = '';
      rows.forEach(row => {
        if (row.category !== currentCategory) {
          currentCategory = row.category;
          console.log(`\n${currentCategory}:`);
        }
        console.log(`  - ${row.name} - $${row.price}`);
      });
      
      console.log('\n✅ Your store is now fully stocked!');
      console.log('🌐 Visit http://localhost:3000 to see all products');
      db.close();
    });
  });
});
