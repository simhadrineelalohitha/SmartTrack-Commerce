// Load home page content
async function loadHomePage() {
  loadFeaturedProducts();
  loadHomeCategories();
  updateHomeStats();
}

// Load featured products (first 4 products)
async function loadFeaturedProducts() {
  const featuredGrid = document.getElementById('featured-products');
  const featuredLoading = document.getElementById('featured-loading');

  if (!featuredGrid || !featuredLoading) return;

  try {
    const products = await apiRequest('/api/products');
    
    // Get first 4 products as featured
    const featured = products.slice(0, 4);
    
    featuredLoading.style.display = 'none';
    featuredGrid.style.display = 'grid';
    
    featuredGrid.innerHTML = featured.map(product => {
      const stockStatus = getStockStatus(product.stock);
      
      return `
        <div class="product-card">
          <img 
            src="${product.image_url}" 
            alt="${escapeHtml(product.name)}" 
            class="product-image"
            onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'"
          >
          <div class="product-info">
            <div class="product-category">${escapeHtml(product.category)}</div>
            <h3 class="product-name">${escapeHtml(product.name)}</h3>
            <p class="product-description">${escapeHtml(product.description || '')}</p>
            <div class="product-footer">
              <span class="product-price">$${parseFloat(product.price).toFixed(2)}</span>
              <span class="stock-badge ${stockStatus.class}">${stockStatus.text}</span>
            </div>
            <div class="product-actions">
              <button class="btn btn-view" onclick="viewProduct(${product.id})">
                View Details
              </button>
              <button 
                class="btn btn-add-cart" 
                onclick="quickAddToCart(${product.id})"
                ${product.stock === 0 ? 'disabled' : ''}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading featured products:', error);
    featuredLoading.innerHTML = '<p class="error-message">Failed to load featured products</p>';
  }
}

// Load categories for home page
async function loadHomeCategories() {
  const categoriesGrid = document.getElementById('categories-grid');
  
  if (!categoriesGrid) return;

  try {
    const categories = await apiRequest('/api/products/categories/list');
    
    // Category icons mapping
    const categoryIcons = {
      'Electronics': '📱',
      'Sports': '⚽',
      'Home': '🏠',
      'Accessories': '🎒',
      'Fashion': '👕',
      'Books': '📚',
      'Toys': '🎮',
      'Beauty': '💄'
    };

    // Get product counts per category
    const allProducts = await apiRequest('/api/products');
    
    categoriesGrid.innerHTML = categories.map(category => {
      const count = allProducts.filter(p => p.category === category).length;
      const icon = categoryIcons[category] || '📦';
      
      return `
        <div class="category-card" onclick="browseCategory('${category}')">
          <div class="category-icon">${icon}</div>
          <div class="category-name">${category}</div>
          <div class="category-count">${count} products</div>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading categories:', error);
    categoriesGrid.innerHTML = '<p class="error-message">Failed to load categories</p>';
  }
}

// Browse products by category
function browseCategory(category) {
  const categoryFilter = document.getElementById('category-filter');
  if (categoryFilter) {
    categoryFilter.value = category;
  }
  currentCategory = category;
  showPage('products');
  loadProducts(category);
}

// Update home page statistics
async function updateHomeStats() {
  try {
    const products = await apiRequest('/api/products');
    const categories = await apiRequest('/api/products/categories/list');
    
    const totalProductsEl = document.getElementById('total-products');
    const totalCategoriesEl = document.getElementById('total-categories');
    
    if (totalProductsEl) {
      animateNumber(totalProductsEl, products.length);
    }
    
    if (totalCategoriesEl) {
      animateNumber(totalCategoriesEl, categories.length);
    }
  } catch (error) {
    console.error('Error updating stats:', error);
  }
}

// Animate number counting
function animateNumber(element, target) {
  const duration = 1000;
  const start = 0;
  const increment = target / (duration / 16);
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current);
    }
  }, 16);
}

// Scroll to featured section
function scrollToFeatured() {
  const featuredSection = document.getElementById('featured-section');
  if (featuredSection) {
    featuredSection.scrollIntoView({ behavior: 'smooth' });
  }
}
