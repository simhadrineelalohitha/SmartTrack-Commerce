const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database/ecommerce.db');

console.log('🔧 Migrating database for marketplace features...\n');

// Add new columns to products table
const migrations = [
  `ALTER TABLE products ADD COLUMN discount REAL DEFAULT 0`,
  `ALTER TABLE products ADD COLUMN brand TEXT`,
  `ALTER TABLE products ADD COLUMN subcategory TEXT`,
  `ALTER TABLE products ADD COLUMN rating REAL DEFAULT 0`,
  `ALTER TABLE products ADD COLUMN specifications TEXT`
];

let completed = 0;

migrations.forEach((sql, index) => {
  db.run(sql, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.log(`Migration ${index + 1}: ${err.message}`);
    } else {
      console.log(`✓ Migration ${index + 1}: Success`);
    }
    
    completed++;
    if (completed === migrations.length) {
      console.log('\n✅ Database migration complete!');
      console.log('Run: node database/seed-marketplace.js to populate products\n');
      db.close();
    }
  });
});
