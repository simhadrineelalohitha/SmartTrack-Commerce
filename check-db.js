const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database/ecommerce.db');

db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log(`Total products in database: ${row.count}`);
  }
  
  db.all('SELECT id, name, category, image_url FROM products LIMIT 5', (err, rows) => {
    if (err) {
      console.error('Error:', err);
    } else {
      console.log('\nSample products:');
      rows.forEach(p => {
        console.log(`  ${p.id}. ${p.name} (${p.category})`);
        console.log(`     Image: ${p.image_url}`);
      });
    }
    db.close();
  });
});
