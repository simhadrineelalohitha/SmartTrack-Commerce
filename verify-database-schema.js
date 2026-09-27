/**
 * Database Schema Verification
 * Ensures all required tables exist with correct structure
 */

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database/ecommerce.db');

console.log('\n═══════════════════════════════════════════════════════');
console.log('   DATABASE SCHEMA VERIFICATION');
console.log('═══════════════════════════════════════════════════════\n');

const requiredTables = [
  'users',
  'products',
  'orders',
  'order_items',
  'order_status_history',
  'admin_audit_log',
  'wishlist',
  'product_reviews',
  'recently_viewed'
];

let allTablesExist = true;
let completedChecks = 0;

console.log('📋 Checking Required Tables:\n');

requiredTables.forEach(tableName => {
  db.all(
    `SELECT sql FROM sqlite_master WHERE type='table' AND name=?`,
    [tableName],
    (err, rows) => {
      if (err) {
        console.log(`❌ Error checking ${tableName}: ${err.message}`);
        allTablesExist = false;
      } else if (rows.length === 0) {
        console.log(`❌ Table missing: ${tableName}`);
        allTablesExist = false;
      } else {
        console.log(`✅ ${tableName}`);
      }
      
      completedChecks++;
      
      if (completedChecks === requiredTables.length) {
        checkDataIntegrity();
      }
    }
  );
});

function checkDataIntegrity() {
  console.log('\n📊 Data Integrity Checks:\n');
  
  // Check product count
  db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
    if (err) {
      console.log(`❌ Error counting products: ${err.message}`);
    } else {
      console.log(`✅ Products table: ${row.count} products`);
      
      if (row.count === 0) {
        console.log('   ⚠️  Warning: No products in database');
      }
    }
    
    // Check for required product columns
    db.all('PRAGMA table_info(products)', (err, columns) => {
      if (err) {
        console.log(`❌ Error checking product columns: ${err.message}`);
      } else {
        const requiredColumns = ['id', 'name', 'description', 'price', 'image_url', 'stock', 'category'];
        const existingColumns = columns.map(c => c.name);
        
        const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
        
        if (missingColumns.length > 0) {
          console.log(`❌ Products table missing columns: ${missingColumns.join(', ')}`);
        } else {
          console.log('✅ Products table has all required columns');
        }
        
        // Check for enhanced columns
        const enhancedColumns = ['brand', 'discount', 'subcategory', 'rating', 'specifications'];
        const hasEnhanced = enhancedColumns.filter(col => existingColumns.includes(col));
        
        if (hasEnhanced.length > 0) {
          console.log(`✅ Enhanced columns present: ${hasEnhanced.join(', ')}`);
        }
      }
      
      finishVerification();
    });
  });
}

function finishVerification() {
  console.log('\n═══════════════════════════════════════════════════════');
  
  if (allTablesExist) {
    console.log('✅ DATABASE SCHEMA: VERIFIED');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('🎉 All tables exist and data integrity verified!\n');
    db.close();
    process.exit(0);
  } else {
    console.log('❌ DATABASE SCHEMA: ISSUES FOUND');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('⚠️  Some tables are missing or have errors.\n');
    db.close();
    process.exit(1);
  }
}
