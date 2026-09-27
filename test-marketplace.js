const http = require('http');

console.log('🧪 Testing SmartTrack Commerce Marketplace\n');
console.log('='.repeat(50) + '\n');

const tests = [
  {
    name: 'Homepage loads',
    path: '/',
    method: 'GET'
  },
  {
    name: 'Products page loads',
    path: '/products.html',
    method: 'GET'
  },
  {
    name: 'Get all products',
    path: '/api/products',
    method: 'GET',
    validate: (data) => {
      const products = JSON.parse(data);
      return products.length > 0 && products[0].brand && products[0].specifications;
    }
  },
  {
    name: 'Get categories',
    path: '/api/products/categories/list',
    method: 'GET',
    validate: (data) => {
      const categories = JSON.parse(data);
      return Array.isArray(categories) && categories.length >= 5;
    }
  },
  {
    name: 'Filter by category (Electronics)',
    path: '/api/products?category=Electronics',
    method: 'GET',
    validate: (data) => {
      const products = JSON.parse(data);
      return products.every(p => p.category === 'Electronics');
    }
  },
  {
    name: 'Search products',
    path: '/api/products?search=phone',
    method: 'GET',
    validate: (data) => {
      const products = JSON.parse(data);
      return products.length > 0;
    }
  },
  {
    name: 'Search suggestions',
    path: '/api/products/search/suggestions?q=sam',
    method: 'GET',
    validate: (data) => {
      const suggestions = JSON.parse(data);
      return Array.isArray(suggestions);
    }
  },
  {
    name: 'Sort by price (low to high)',
    path: '/api/products?sort=price_asc',
    method: 'GET',
    validate: (data) => {
      const products = JSON.parse(data);
      return products.length > 1 && products[0].price <= products[1].price;
    }
  },
  {
    name: 'Filter by price range',
    path: '/api/products?minPrice=100&maxPrice=500',
    method: 'GET',
    validate: (data) => {
      const products = JSON.parse(data);
      return products.every(p => p.price >= 100 && p.price <= 500);
    }
  },
  {
    name: 'Wishlist page loads',
    path: '/wishlist.html',
    method: 'GET'
  },
  {
    name: 'Comparison page loads',
    path: '/comparison.html',
    method: 'GET'
  },
  {
    name: 'Cart page loads',
    path: '/cart.html',
    method: 'GET'
  },
  {
    name: 'Orders page loads',
    path: '/orders.html',
    method: 'GET'
  },
  {
    name: 'Checkout page loads',
    path: '/checkout.html',
    method: 'GET'
  },
  {
    name: 'Track order page loads',
    path: '/track-order.html',
    method: 'GET'
  },
  {
    name: 'Help/FAQ page loads',
    path: '/help.html',
    method: 'GET'
  }
];

let passed = 0;
let failed = 0;

function runTest(test) {
  return new Promise((resolve) => {
    const options = {
      hostname: '127.0.0.1',
      port: 3000,
      path: test.path,
      method: test.method
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        let success = res.statusCode === 200;
        
        if (success && test.validate) {
          try {
            success = test.validate(data);
          } catch (error) {
            success = false;
          }
        }

        if (success) {
          console.log(`✅ ${test.name}`);
          passed++;
        } else {
          console.log(`❌ ${test.name} (Status: ${res.statusCode})`);
          failed++;
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log(`❌ ${test.name} (Error: ${error.message})`);
      failed++;
      resolve();
    });

    req.setTimeout(5000, () => {
      req.destroy();
      console.log(`❌ ${test.name} (Timeout)`);
      failed++;
      resolve();
    });

    req.end();
  });
}

async function runAllTests() {
  for (const test of tests) {
    await runTest(test);
  }

  console.log('\n' + '='.repeat(50));
  console.log(`\nTest Results: ${passed} passed, ${failed} failed`);
  console.log(`Success Rate: ${Math.round(passed/(passed+failed)*100)}%\n`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed! Marketplace is fully functional.\n');
  } else {
    console.log('⚠️  Some tests failed. Check the output above.\n');
  }
}

runAllTests();
