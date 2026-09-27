/**
 * Frontend Pages Verification
 * Tests all HTML pages load correctly
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
const results = {
  passed: [],
  failed: []
};

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    
    http.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, body: body, headers: res.headers });
      });
    }).on('error', reject);
  });
}

async function testPage(name, path, checkContent = null) {
  try {
    const response = await makeRequest(path);
    
    if (response.status === 200) {
      // Verify it's HTML
      if (!response.body.includes('<!DOCTYPE html>') && !response.body.includes('<html')) {
        results.failed.push(`${name}: Not HTML content`);
        console.log(`❌ ${name} - Not HTML`);
        return;
      }
      
      // Optional content check
      if (checkContent && !response.body.includes(checkContent)) {
        results.failed.push(`${name}: Missing expected content`);
        console.log(`⚠️  ${name} - Missing content check`);
        return;
      }
      
      results.passed.push(name);
      console.log(`✅ ${name}`);
    } else {
      results.failed.push(`${name}: Status ${response.status}`);
      console.log(`❌ ${name} - Status ${response.status}`);
    }
  } catch (error) {
    results.failed.push(`${name}: ${error.message}`);
    console.log(`❌ ${name} - ${error.message}`);
  }
}

async function runTests() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('   FRONTEND PAGES VERIFICATION');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('📄 Testing HTML Pages:\n');

  // Main pages
  await testPage('Homepage (index.html)', '/');
  await testPage('Products page', '/products.html');
  await testPage('Cart page', '/cart.html');
  await testPage('Checkout page', '/checkout.html');
  await testPage('Order confirmation', '/order-confirmation.html');
  await testPage('Track order', '/track-order.html');
  await testPage('Orders page', '/orders.html');
  await testPage('Wishlist page', '/wishlist.html');
  await testPage('Product comparison', '/comparison.html');
  await testPage('Login page', '/login.html');
  await testPage('Register page', '/register.html');
  await testPage('Admin dashboard', '/admin.html');
  await testPage('Dashboard page', '/dashboard.html');
  await testPage('Help page', '/help.html');
  await testPage('Product detail page', '/product.html');

  console.log('\n🔀 Testing SPA Routes (should all serve index.html):\n');

  // SPA routes (should all serve index.html)
  await testPage('SPA: /products', '/products');
  await testPage('SPA: /cart', '/cart');
  await testPage('SPA: /orders', '/orders');
  await testPage('SPA: /wishlist', '/wishlist');

  console.log('\n📦 Testing Static Assets:\n');

  // CSS files
  const cssResponse = await makeRequest('/css/styles.css');
  if (cssResponse.status === 200 && cssResponse.headers['content-type'].includes('text/css')) {
    results.passed.push('CSS: styles.css');
    console.log('✅ CSS: styles.css');
  } else {
    results.failed.push('CSS: styles.css - Not found or wrong content-type');
    console.log('❌ CSS: styles.css - Not found');
  }

  // JavaScript files
  const jsFiles = [
    'app.js',
    'auth.js',
    'cart.js',
    'products.js',
    'orders.js',
    'wishlist.js',
    'ui-components.js',
    'home.js',
    'assistant.js'
  ];

  for (const jsFile of jsFiles) {
    const jsResponse = await makeRequest(`/js/${jsFile}`);
    if (jsResponse.status === 200) {
      results.passed.push(`JS: ${jsFile}`);
      console.log(`✅ JS: ${jsFile}`);
    } else {
      results.failed.push(`JS: ${jsFile} - Not found`);
      console.log(`❌ JS: ${jsFile} - Not found`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('   RESULTS SUMMARY');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}\n`);

  if (results.failed.length > 0) {
    console.log('Failed Tests:');
    results.failed.forEach(test => console.log(`  - ${test}`));
    console.log('');
  }

  const total = results.passed.length + results.failed.length;
  const successRate = ((results.passed.length / total) * 100).toFixed(1);

  console.log(`Success Rate: ${successRate}% (${results.passed.length}/${total})`);
  console.log('═══════════════════════════════════════════════════════\n');

  if (results.failed.length === 0) {
    console.log('🎉 All frontend pages and assets loading correctly!\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some pages failed to load.\n');
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('❌ Test execution failed:', err);
  process.exit(1);
});
