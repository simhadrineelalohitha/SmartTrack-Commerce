/**
 * Export Current Products from SQLite Database
 * Generates SQL INSERT statements for migration to production
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'ecommerce.db'));

console.log('📤 Exporting Products from SQLite Database\n');

db.all('SELECT * FROM products ORDER BY id', [], (err, products) => {
  if (err) {
    console.error('❌ Error reading products:', err);
    db.close();
    return;
  }

  console.log(`Found ${products.length} products to export\n`);

  // Generate SQL file
  const sqlStatements = [];
  sqlStatements.push('-- Product Export');
  sqlStatements.push(`-- Generated: ${new Date().toISOString()}`);
  sqlStatements.push(`-- Total Products: ${products.length}`);
  sqlStatements.push('');
  sqlStatements.push('-- Insert Products');

  products.forEach(product => {
    const values = [
      escapeSQL(product.name),
      escapeSQL(product.brand),
      escapeSQL(product.description),
      product.price,
      product.discount || 0,
      escapeSQL(product.image_url),
      product.stock,
      escapeSQL(product.category),
      escapeSQL(product.subcategory),
      product.rating || 0,
      escapeSQL(product.specifications),
      product.active !== undefined ? product.active : 1
    ];

    sqlStatements.push(
      `INSERT INTO products (name, brand, description, price, discount, image_url, stock, category, subcategory, rating, specifications, active) ` +
      `VALUES (${values.join(', ')});`
    );
  });

  const sqlContent = sqlStatements.join('\n');
  const sqlFilePath = path.join(__dirname, 'exported-products.sql');
  
  fs.writeFileSync(sqlFilePath, sqlContent, 'utf8');
  console.log(`✅ SQL export saved to: ${sqlFilePath}\n`);

  // Generate JavaScript seed file
  const jsProducts = products.map(p => [
    p.name,
    p.brand || '',
    p.description || '',
    p.price,
    p.discount || 0,
    p.image_url || '',
    p.stock || 0,
    p.category || '',
    p.subcategory || '',
    p.rating || 0,
    p.specifications || '{}'
  ]);

  const jsContent = `/**
 * Exported Products - Generated from local database
 * Date: ${new Date().toISOString()}
 * Total Products: ${products.length}
 */

module.exports = function() {
  return ${JSON.stringify(jsProducts, null, 2)};
};
`;

  const jsFilePath = path.join(__dirname, 'exported-products-data.js');
  fs.writeFileSync(jsFilePath, jsContent, 'utf8');
  console.log(`✅ JavaScript export saved to: ${jsFilePath}\n`);

  // Generate CSV for spreadsheet viewing
  const csvRows = [];
  csvRows.push('id,name,brand,category,subcategory,price,discount,stock,rating,image_url');
  
  products.forEach(p => {
    csvRows.push([
      p.id,
      escapeCSV(p.name),
      escapeCSV(p.brand || ''),
      escapeCSV(p.category || ''),
      escapeCSV(p.subcategory || ''),
      p.price,
      p.discount || 0,
      p.stock || 0,
      p.rating || 0,
      escapeCSV(p.image_url || '')
    ].join(','));
  });

  const csvContent = csvRows.join('\n');
  const csvFilePath = path.join(__dirname, 'exported-products.csv');
  fs.writeFileSync(csvFilePath, csvContent, 'utf8');
  console.log(`✅ CSV export saved to: ${csvFilePath}\n`);

  // Summary
  const categories = {};
  products.forEach(p => {
    categories[p.category] = (categories[p.category] || 0) + 1;
  });

  console.log('📊 Export Summary:');
  console.log('═══════════════════════════════════════');
  Object.keys(categories).sort().forEach(cat => {
    console.log(`  ${cat}: ${categories[cat]} products`);
  });
  console.log('═══════════════════════════════════════');
  console.log('');
  console.log('✅ Export complete! You can now:');
  console.log('   1. Review exported-products.csv in spreadsheet');
  console.log('   2. Use exported-products.sql for PostgreSQL import');
  console.log('   3. Replace seed-marketplace-data.js with exported-products-data.js');
  console.log('');

  db.close();
});

function escapeSQL(value) {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  if (typeof value === 'number') {
    return value;
  }
  return `'${String(value).replace(/'/g, "''")}'`;
}

function escapeCSV(value) {
  if (value === null || value === undefined) {
    return '';
  }
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
