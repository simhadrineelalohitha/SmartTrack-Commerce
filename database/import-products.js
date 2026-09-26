const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'ecommerce.db');
const sqlPath = path.join(__dirname, 'add-products.sql');

const db = new sqlite3.Database(dbPath);

// Read the SQL file
const sql = fs.readFileSync(sqlPath, 'utf8');

// Split by semicolon and execute each statement
const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);

console.log(`Executing ${statements.length} SQL statements...`);

db.serialize(() => {
    statements.forEach((statement, index) => {
        db.run(statement.trim(), (err) => {
            if (err) {
                console.error(`Error executing statement ${index + 1}:`, err.message);
            }
        });
    });

    // Verify the count
    db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
        if (err) {
            console.error('Error counting products:', err.message);
        } else {
            console.log(`\n✅ Success! Total products in database: ${row.count}`);
        }
        db.close();
    });
});
