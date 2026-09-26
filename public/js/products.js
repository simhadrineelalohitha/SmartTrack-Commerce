// Enhanced Products Script with Modern Features

// Load all products with filters and sorting
async function loadProducts(category = '', search = '') {
  const grid = document.getElementById('products-grid');
  if (!grid) {
    console.log('Products grid not found on this page');
    return;
  }

  const categoryFilter = document.getElementById('category-filter');
  const minPrice = document.getElementById('price-min');
  const maxPrice = document.getElementById('price-max');
  const inStockFilter = document.getElementById('in-stock-filter');
  const sortFilter = document.getElementById('sort-filter');
  
  const params = new URLSearchParams();
  
  if (categoryFilter && categoryFilter.value) params.append('category', categoryFilter.value);
  if (search) params.append('search', search);
  if (minPrice && minPrice.value) params.append('minPrice', minPrice.value);
  if (maxPrice && maxPrice.value) params.append('maxPrice', maxPrice.value);
  if (inStockFilter && inStockFilter.checked) params.append('inStock', 'true');
  if (sortFilter && sortFilter.value) params.append('sort', sortFilter.value);

  const url = '/api/products' + (params.toString() ? '?' + params.toString() : '');

  try {
    // Show loading
    grid.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading products...</p></div>';
    
    const response = await fetch(url);
    const products = await response.json();
    
    state.products = products;
    renderProducts(products);
    
    const productsCount = document.getElementById('products-count');
    if (productsCount) productsCount.textContent = products.length;
  } catch (error) {
    console.error('Error loading products:', error);
    grid.innerHTML = '<div class="error-state"><p>Failed to load products. Please try again.</p></div>';
  }
}

// Render products using modern UI components
function renderProducts(products) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  if (products.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📦</div>
        <h3>No products found</h3>
        <p>Try adjusting your filters or search query</p>
        <button class="btn btn-primary" onclick="clearFilters()">Clear Filters</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = products.map(p => createProductCard(p)).join('');
  
  // Check wishlist status for all products
  if (typeof checkWishlistStatus === 'function') {
    checkWishlistStatus(products.map(p => p.id));
  }
}

// Filter products
function filterProducts() {
  loadProducts();
}

// Clear filters
function clearFilters() {
  document.getElementById('category-filter').value = '';
  if (document.getElementById('price-min')) document.getElementById('price-min').value = '';
  if (document.getElementById('price-max')) document.getElementById('price-max').value = '';
  if (document.getElementById('in-stock-filter')) document.getElementById('in-stock-filter').checked = false;
  if (document.getElementById('sort-filter')) document.getElementById('sort-filter').value = '';
  loadProducts();
}

// Handle search
function handleSearch(event) {
  if (event.key === 'Enter') {
    performSearch();
  } else {
    debouncedSearch();
  }
}

const debouncedSearch = debounce(() => {
  const input = document.getElementById('search-input');
  if (input && input.value.length >= 2) {
    showSearchSuggestions(input.value);
  }
}, 300);

// Show search suggestions
async function showSearchSuggestions(query) {
  try {
    const response = await fetch(`/api/products/search/suggestions?q=${encodeURIComponent(query)}`);
    const suggestions = await response.json();
    
    // TODO: Display suggestions dropdown
    console.log('Suggestions:', suggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
  }
}

// Perform search
function performSearch() {
  const searchInput = document.getElementById('search-input');
  const query = searchInput ? searchInput.value.trim() : '';
  
  searchQuery = query; // Store in global variable
  showPage('products');
  loadProducts('', query);
}

// View product
function viewProduct(productId) {
  window.location.href = `product.html?id=${productId}`;
}

// Load categories
async function loadCategories() {
  try {
    const categories = await fetch('/api/products/categories/list').then(r => r.json());
    const select = document.getElementById('category-filter');
    
    if (select) {
      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Error loading categories:', error);
  }
}
