/**
 * Production Test Script for SmartTrack Commerce
 * Tests all critical endpoints and functionality
 */

const BASE_URL = process.env.TEST_URL || 'https://smarttrack-commerce.onrender.com';

async function testEndpoint(name, url, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${url}`, options);
    const data = await response.json();
    
    console.log(`✅ ${name}: ${response.status}`);
    if (url === '/api/products') {
      console.log(`   Products count: ${data.length}`);
    }
    if (url === '/api/health') {
      console.log(`   Health: ${JSON.stringify(data, null, 2)}`);
    }
    return { success: true, status: response.status, data };
  } catch (error) {
    console.error(`❌ ${name}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Testing SmartTrack Commerce Production');
  console.log(`📍 URL: ${BASE_URL}\n`);
  
  // Test health endpoint
  await testEndpoint('Health Check', '/api/health');
  
  // Test products API
  await testEndpoint('Products API', '/api/products');
  
  // Test categories API
  await testEndpoint('Categories API', '/api/products/categories/list');
  
  // Test single product
  await testEndpoint('Single Product', '/api/products/1');
  
  // Test search
  await testEndpoint('Search Products', '/api/products?search=iphone');
  
  // Test filtering
  await testEndpoint('Filter by Category', '/api/products?category=Electronics');
  
  // Test authentication endpoint
  await testEndpoint('Auth Status', '/api/auth/me');
  
  console.log('\n✅ Tests completed!');
}

runTests().catch(console.error);
