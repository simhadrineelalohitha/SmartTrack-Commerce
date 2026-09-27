/**
 * Comprehensive API Endpoint Testing
 * Tests all product, cart, wishlist, and order endpoints
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
const results = {
  passed: [],
  failed: [],
  warnings: []
};

function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : null;
          resolve({ status: res.statusCode, headers: res.headers, body: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testEndpoint(name, method, path, expectedStatus = 200, validateResponse = null) {
  try {
    const response = await makeRequest(method, path);
    
    if (response.status === expectedStatus) {
      if (validateResponse && !validateResponse(response.body)) {
        results.warnings.push(`${name}: Response validation failed`);
        console.log(`⚠️  ${name} - Status OK but validation failed`);
      } else {
        results.passed.push(name);
        console.log(`✅ ${name}`);
      }
    } else {
      results.failed.push(`${name}: Expected ${expectedStatus}, got ${response.status}`);
      console.log(`❌ ${name} - Expected ${expectedStatus}, got ${response.status}`);
    }
    
    return response;
  } catch (error) {
    results.failed.push(`${name}: ${error.message}`);
    console.log(`❌ ${name} - ${error.message}`);
    return null;
  }
}

async function runTests() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('   API ENDPOINT VERIFICATION - SmartTrack Commerce');
  console.log('═══════════════════════════════════════════════════════\n');

  // ============================================================
  // 1. HEALTH CHECK & SYSTEM STATUS
  // ============================================================
  console.log('📊 1. SYSTEM HEALTH CHECK\n');
  
  const health = await testEndpoint(
    'GET /api/health',
    'GET',
    '/api/health',
    200,
    (body) => body && body.status === 'ok' && body.products >= 0
  );
  
  if (health && health.body) {
    console.log(`   Database: ${health.body.database}`);
    console.log(`   Products: ${health.body.products}`);
    console.log(`   Environment: ${health.body.environment}\n`);
  }

  // ============================================================
  // 2. PRODUCT ENDPOINTS
  // ============================================================
  console.log('📦 2. PRODUCT API ENDPOINTS\n');
  
  const products = await testEndpoint(
    'GET /api/products (all products)',
    'GET',
    '/api/products',
    200,
    (body) => Array.isArray(body) && body.length > 0
  );
  
  if (products && products.body && products.body.length > 0) {
    console.log(`   Total products returned: ${products.body.length}\n`);
    
    // Test single product
    const firstProduct = products.body[0];
    await testEndpoint(
      `GET /api/products/${firstProduct.id} (single product)`,
      'GET',
      `/api/products/${firstProduct.id}`,
      200,
      (body) => body && body.id === firstProduct.id
    );
    
    // Test related products
    await testEndpoint(
      `GET /api/products/${firstProduct.id}/related`,
      'GET',
      `/api/products/${firstProduct.id}/related`,
      200,
      (body) => Array.isArray(body)
    );
    
    // Test product reviews
    await testEndpoint(
      `GET /api/products/${firstProduct.id}/reviews`,
      'GET',
      `/api/products/${firstProduct.id}/reviews`,
      200,
      (body) => Array.isArray(body)
    );
  }
  
  // Test categories
  await testEndpoint(
    'GET /api/products/categories/list',
    'GET',
    '/api/products/categories/list',
    200,
    (body) => Array.isArray(body) && body.length > 0
  );
  
  // Test search suggestions
  await testEndpoint(
    'GET /api/products/search/suggestions?q=phone',
    'GET',
    '/api/products/search/suggestions?q=phone',
    200,
    (body) => Array.isArray(body)
  );
  
  // Test filtering by category
  await testEndpoint(
    'GET /api/products?category=Electronics',
    'GET',
    '/api/products?category=Electronics',
    200,
    (body) => Array.isArray(body) && body.length > 0
  );
  
  // Test search
  await testEndpoint(
    'GET /api/products?search=phone',
    'GET',
    '/api/products?search=phone',
    200,
    (body) => Array.isArray(body)
  );
  
  // Test price filtering
  await testEndpoint(
    'GET /api/products?minPrice=100&maxPrice=500',
    'GET',
    '/api/products?minPrice=100&maxPrice=500',
    200,
    (body) => Array.isArray(body)
  );
  
  // Test sorting
  await testEndpoint(
    'GET /api/products?sort=price_asc',
    'GET',
    '/api/products?sort=price_asc',
    200,
    (body) => Array.isArray(body)
  );
  
  // Test in-stock filter
  await testEndpoint(
    'GET /api/products?inStock=true',
    'GET',
    '/api/products?inStock=true',
    200,
    (body) => Array.isArray(body)
  );

  console.log('');

  // ============================================================
  // 3. AUTHENTICATION ENDPOINTS (No auth required to test)
  // ============================================================
  console.log('🔐 3. AUTHENTICATION ENDPOINTS\n');
  
  // Test registration endpoint structure (expect 400 for missing data)
  await testEndpoint(
    'POST /api/auth/register (structure check)',
    'POST',
    '/api/auth/register',
    400  // Expect 400 because we're not sending data
  );
  
  // Test login endpoint structure
  await testEndpoint(
    'POST /api/auth/login (structure check)',
    'POST',
    '/api/auth/login',
    400  // Expect 400 because we're not sending data
  );
  
  // Test logout endpoint
  await testEndpoint(
    'POST /api/auth/logout',
    'POST',
    '/api/auth/logout',
    200  // Should work even without session
  );

  console.log('');

  // ============================================================
  // 4. CART ENDPOINTS (Client-side cart with server validation)
  // ============================================================
  console.log('🛒 4. CART API ENDPOINTS\n');
  
  // Cart is client-side (localStorage), only validation endpoint exists
  await testEndpoint(
    'POST /api/cart/validate (cart validation)',
    'POST',
    '/api/cart/validate',
    400  // Expect 400 for missing data
  );

  console.log('');

  // ============================================================
  // 5. WISHLIST ENDPOINTS (Require auth - expect 401)
  // ============================================================
  console.log('❤️  5. WISHLIST API ENDPOINTS\n');
  
  await testEndpoint(
    'GET /api/wishlist (requires auth)',
    'GET',
    '/api/wishlist',
    401
  );

  console.log('');

  // ============================================================
  // 6. ORDER ENDPOINTS (Require auth - expect 401)
  // ============================================================
  console.log('📋 6. ORDER API ENDPOINTS\n');
  
  await testEndpoint(
    'GET /api/orders (requires auth)',
    'GET',
    '/api/orders',
    401
  );

  console.log('');

  // ============================================================
  // 7. ADMIN ENDPOINTS (Require admin auth - expect 401)
  // ============================================================
  console.log('👤 7. ADMIN API ENDPOINTS\n');
  
  await testEndpoint(
    'GET /api/admin/products (requires admin)',
    'GET',
    '/api/admin/products',
    401
  );

  console.log('');

  // ============================================================
  // 8. STATIC PAGE ROUTES
  // ============================================================
  console.log('🌐 8. FRONTEND ROUTES\n');
  
  await testEndpoint(
    'GET / (homepage)',
    'GET',
    '/',
    200,
    (body) => typeof body === 'string' && body.includes('html')
  );
  
  await testEndpoint(
    'GET /products (SPA route)',
    'GET',
    '/products',
    200,
    (body) => typeof body === 'string' && body.includes('html')
  );
  
  await testEndpoint(
    'GET /cart (SPA route)',
    'GET',
    '/cart',
    200,
    (body) => typeof body === 'string' && body.includes('html')
  );

  console.log('');

  // ============================================================
  // 9. 404 HANDLING
  // ============================================================
  console.log('🔍 9. ERROR HANDLING\n');
  
  await testEndpoint(
    'GET /api/nonexistent (should 404)',
    'GET',
    '/api/nonexistent',
    404
  );

  console.log('');

  // ============================================================
  // SUMMARY
  // ============================================================
  console.log('═══════════════════════════════════════════════════════');
  console.log('   TEST RESULTS SUMMARY');
  console.log('═══════════════════════════════════════════════════════\n');
  
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`⚠️  Warnings: ${results.warnings.length}\n`);
  
  if (results.failed.length > 0) {
    console.log('Failed Tests:');
    results.failed.forEach(test => console.log(`  - ${test}`));
    console.log('');
  }
  
  if (results.warnings.length > 0) {
    console.log('Warnings:');
    results.warnings.forEach(test => console.log(`  - ${test}`));
    console.log('');
  }
  
  const totalTests = results.passed.length + results.failed.length + results.warnings.length;
  const successRate = ((results.passed.length / totalTests) * 100).toFixed(1);
  
  console.log(`Success Rate: ${successRate}% (${results.passed.length}/${totalTests})`);
  console.log('═══════════════════════════════════════════════════════\n');
  
  if (results.failed.length === 0) {
    console.log('🎉 All critical API endpoints working correctly!\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some endpoints failed - review above for details.\n');
    process.exit(1);
  }
}

// Run tests
runTests().catch(err => {
  console.error('❌ Test execution failed:', err);
  process.exit(1);
});
