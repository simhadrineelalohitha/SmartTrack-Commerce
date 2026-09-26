// Database migration script to add missing columns
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'ecommerce.db');
const db = new sqlite3.Database(dbPath);

console.log('Starting database migration...');

// Check if active column exists in products table
db.all("PRAGMA table_info(products)", (err, columns) => {
  if (err) {
    console.error('Error checking table schema:', err);
    return;
  }

  const hasActiveColumn = columns.some(col => col.name === 'active');

  if (!hasActiveColumn) {
    console.log('Adding active column to products table...');
    db.run('ALTER TABLE products ADD COLUMN active INTEGER DEFAULT 1', (err) => {
      if (err) {
        console.error('Error adding active column:', err);
      } else {
        console.log('✅ Added active column to products');
      }
      checkComplete();
    });
  } else {
    console.log('✅ active column already exists in products');
    checkComplete();
  }
});

let checksComplete = 0;
function checkComplete() {
  checksComplete++;
  if (checksComplete >= 1) {
    console.log('\n✅ Migration complete!');
    db.close();
    process.exit(0);
  }
}
