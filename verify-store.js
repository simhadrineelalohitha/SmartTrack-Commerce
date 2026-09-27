const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database/ecommerce.db');

console.log('\n🔍 SmartTrack Commerce - Store Verification\n');
console.log('='.repeat(50));

// Check products
db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
    if (err) {
        console.error('❌ Error:', err.message);
        db.close();
        return;
    }
    
    console.log(`\n✅ Total Products: ${row.count}`);
    
    // Category breakdown
    db.all('SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY count DESC', (err, rows) => {
        if (err) {
            console.error('❌ Error:', err.message);
            db.close();
            return;
        }
        
        console.log('\n📦 Products by Category:');
        console.log('-'.repeat(50));
        rows.forEach(row => {
            console.log(`   ${row.category.padEnd(20)} : ${row.count} products`);
        });
        
        // Price range
        db.get('SELECT MIN(price) as min, MAX(price) as max, AVG(price) as avg FROM products', (err, row) => {
            if (err) {
                console.error('❌ Error:', err.message);
                db.close();
                return;
            }
            
            console.log('\n💰 Price Range:');
            console.log('-'.repeat(50));
            console.log(`   Lowest Price  : $${row.min.toFixed(2)}`);
            console.log(`   Highest Price : $${row.max.toFixed(2)}`);
            console.log(`   Average Price : $${row.avg.toFixed(2)}`);
            
            // Sample products from each category
            db.all(`
                SELECT name, price, category, stock 
                FROM products 
                ORDER BY category, price DESC
            `, (err, rows) => {
                if (err) {
                    console.error('❌ Error:', err.message);
                    db.close();
                    return;
                }
                
                console.log('\n📋 Sample Products:');
                console.log('-'.repeat(50));
                
                let currentCategory = '';
                let shown = 0;
                const maxPerCategory = 3;
                
                rows.forEach(product => {
                    if (product.category !== currentCategory) {
                        currentCategory = product.category;
                        shown = 0;
                        console.log(`\n${currentCategory}:`);
                    }
                    
                    if (shown < maxPerCategory) {
                        console.log(`   • ${product.name}`);
                        console.log(`     Price: $${product.price} | Stock: ${product.stock}`);
                        shown++;
                    }
                });
                
                console.log('\n' + '='.repeat(50));
                console.log('\n✅ Store Verification Complete!');
                console.log('🌐 Your store is ready at: http://localhost:3000\n');
                
                db.close();
            });
        });
    });
});
