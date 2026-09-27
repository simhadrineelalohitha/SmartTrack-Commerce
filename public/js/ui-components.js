// Modern UI Components and Utilities for SmartTrack Commerce

// Toast Notifications
const Toast = {
  show(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon">${this.getIcon(type)}</span>
        <span class="toast-message">${message}</span>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('toast-show'), 10);
    
    setTimeout(() => {
      toast.classList.remove('toast-show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },
  
  getIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] || icons.info;
  },
  
  success(message) { this.show(message, 'success'); },
  error(message) { this.show(message, 'error'); },
  warning(message) { this.show(message, 'warning'); },
  info(message) { this.show(message, 'info'); }
};

// Loading Spinner
const Loading = {
  show(container) {
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    spinner.innerHTML = '<div class="spinner"></div><p>Loading...</p>';
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    if (container) {
      container.innerHTML = '';
      container.appendChild(spinner);
    }
  },
  
  hide(container) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    const spinner = container?.querySelector('.loading-spinner');
    if (spinner) spinner.remove();
  }
};

// Empty State
const EmptyState = {
  show(container, options = {}) {
    const { icon = '📦', title = 'Nothing here', message = '', action } = options;
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'empty-state';
    emptyDiv.innerHTML = `
      <div class="empty-icon">${icon}</div>
      <h3>${title}</h3>
      ${message ? `<p>${message}</p>` : ''}
      ${action ? `<button class="btn btn-primary" onclick="${action.onclick}">${action.text}</button>` : ''}
    `;
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    if (container) {
      container.innerHTML = '';
      container.appendChild(emptyDiv);
    }
  }
};

// Modal Dialog
class Modal {
  constructor(options = {}) {
    this.title = options.title || '';
    this.content = options.content || '';
    this.onConfirm = options.onConfirm;
    this.onCancel = options.onCancel;
    this.confirmText = options.confirmText || 'Confirm';
    this.cancelText = options.cancelText || 'Cancel';
    this.create();
  }
  
  create() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    
    this.modal = document.createElement('div');
    this.modal.className = 'modal-dialog';
    this.modal.innerHTML = `
      <div class="modal-header">
        <h3>${this.title}</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">${this.content}</div>
      <div class="modal-footer">
        <button class="btn btn-secondary modal-cancel">${this.cancelText}</button>
        <button class="btn btn-primary modal-confirm">${this.confirmText}</button>
      </div>
    `;
    
    this.overlay.appendChild(this.modal);
    document.body.appendChild(this.overlay);
    
    // Event listeners
    this.modal.querySelector('.modal-close').addEventListener('click', () => this.close());
    this.modal.querySelector('.modal-cancel').addEventListener('click', () => {
      if (this.onCancel) this.onCancel();
      this.close();
    });
    this.modal.querySelector('.modal-confirm').addEventListener('click', () => {
      if (this.onConfirm) this.onConfirm();
      this.close();
    });
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });
    
    setTimeout(() => this.overlay.classList.add('modal-show'), 10);
  }
  
  close() {
    this.overlay.classList.remove('modal-show');
    setTimeout(() => this.overlay.remove(), 300);
  }
  
  static confirm(title, message, onConfirm) {
    return new Modal({
      title,
      content: `<p>${message}</p>`,
      onConfirm,
      confirmText: 'Yes',
      cancelText: 'No'
    });
  }
}

// Product Card Component
function createProductCard(product) {
  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const finalPrice = hasDiscount ? product.discount_price : product.price;
  const rating = product.avg_rating || 0;
  const reviewCount = product.review_count || 0;
  
  return `
    <div class="product-card" data-product-id="${product.id}">
      <div class="product-image-wrapper">
        <img src="${product.image_url || 'https://via.placeholder.com/300'}" 
             alt="${product.name}" 
             class="product-image"
             onerror="this.src='https://via.placeholder.com/300?text=${encodeURIComponent(product.name)}'">
        ${product.stock === 0 ? '<div class="product-badge badge-out-of-stock">Out of Stock</div>' : ''}
        ${hasDiscount ? '<div class="product-badge badge-discount">Sale</div>' : ''}
        <button class="btn-wishlist" onclick="toggleWishlist(${product.id}, event)" title="Add to wishlist">
          <span class="wishlist-icon">♡</span>
        </button>
      </div>
      <div class="product-info">
        <div class="product-category">${product.category}</div>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${product.description.substring(0, 80)}...</p>
        ${rating > 0 ? `
          <div class="product-rating">
            <span class="stars">${'★'.repeat(Math.round(rating))}${'☆'.repeat(5 - Math.round(rating))}</span>
            <span class="rating-count">(${reviewCount})</span>
          </div>
        ` : ''}
        <div class="product-price">
          ${hasDiscount ? `<span class="price-original">$${parseFloat(product.price).toFixed(2)}</span>` : ''}
          <span class="price-current">$${parseFloat(finalPrice).toFixed(2)}</span>
        </div>
        <div class="product-actions">
          <button class="btn btn-primary ${product.stock === 0 ? 'btn-disabled' : ''}" 
                  onclick="viewProduct(${product.id})"
                  ${product.stock === 0 ? 'disabled' : ''}>
            View Details
          </button>
        </div>
      </div>
    </div>
  `;
}

// Star Rating Component
function createStarRating(rating, interactive = false, onChange = null) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
  
  if (!interactive) {
    return `
      <div class="star-rating">
        ${'<span class="star star-full">★</span>'.repeat(fullStars)}
        ${hasHalf ? '<span class="star star-half">★</span>' : ''}
        ${'<span class="star star-empty">☆</span>'.repeat(emptyStars)}
      </div>
    `;
  }
  
  // Interactive rating
  let html = '<div class="star-rating star-rating-interactive">';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="star ${i <= rating ? 'star-full' : 'star-empty'}" data-rating="${i}" onclick="${onChange}(${i})">★</span>`;
  }
  html += '</div>';
  return html;
}

// Format currency
function formatCurrency(amount) {
  return `$${parseFloat(amount).toFixed(2)}`;
}

// Format date
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

// Debounce function for search
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Local Storage helpers
const LocalStorage = {
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('LocalStorage set error:', e);
    }
  },
  
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error('LocalStorage get error:', e);
      return defaultValue;
    }
  },
  
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('LocalStorage remove error:', e);
    }
  }
};

// Recently Viewed Products Manager
const RecentlyViewed = {
  key: 'st_recently_viewed',
  maxItems: 10,
  
  add(productId) {
    let items = this.get();
    items = items.filter(id => id !== productId);
    items.unshift(productId);
    items = items.slice(0, this.maxItems);
    LocalStorage.set(this.key, items);
  },
  
  get() {
    return LocalStorage.get(this.key, []);
  },
  
  clear() {
    LocalStorage.remove(this.key);
  }
};

// Comparison Manager
const ComparisonManager = {
  key: 'st_comparison',
  maxItems: 3,
  
  add(product) {
    let items = this.get();
    if (items.find(p => p.id === product.id)) {
      Toast.info('Product already in comparison');
      return false;
    }
    if (items.length >= this.maxItems) {
      Toast.warning(`You can compare up to ${this.maxItems} products`);
      return false;
    }
    items.push(product);
    LocalStorage.set(this.key, items);
    Toast.success('Product added to comparison');
    this.updateUI();
    return true;
  },
  
  remove(productId) {
    let items = this.get();
    items = items.filter(p => p.id !== productId);
    LocalStorage.set(this.key, items);
    this.updateUI();
  },
  
  get() {
    return LocalStorage.get(this.key, []);
  },
  
  clear() {
    LocalStorage.remove(this.key);
    this.updateUI();
  },
  
  count() {
    return this.get().length;
  },
  
  updateUI() {
    const badge = document.querySelector('.comparison-badge');
    const count = this.count();
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
  }
};

// Initialize comparison badge on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ComparisonManager.updateUI());
} else {
  ComparisonManager.updateUI();
}


// HTML Escape function for security
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

// Get stock status
function getStockStatus(stock) {
  if (stock === 0) {
    return { class: 'stock-out', text: 'Out of Stock' };
  } else if (stock < 10) {
    return { class: 'stock-low', text: `Only ${stock} left` };
  } else {
    return { class: 'stock-in', text: 'In Stock' };
  }
}

// Quick add to cart from product cards
function quickAddToCart(productId) {
  return addToCartValidated(productId, 1);
}
