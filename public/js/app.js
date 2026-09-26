// Global state
const state = {
  currentUser: JSON.parse(localStorage.getItem('currentUser')) || null,
  cart: JSON.parse(localStorage.getItem('cart')) || [],
  products: [],
  categories: []
};

// Global search and filter state
let currentCategory = '';
let searchQuery = '';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

async function initializeApp() {
  // Check authentication status first
  await checkAuthStatus();
  
  updateCartCount();
  
  // Check URL parameters for page navigation
  const urlParams = new URLSearchParams(window.location.search);
  const pageParam = urlParams.get('page');
  
  // Load appropriate page
  if (pageParam) {
    showPage(pageParam);
  } else {
    const currentPage = getCurrentPage();
    if (currentPage === 'home' || !currentPage) {
      loadHomePage();
    } else if (currentPage === 'products') {
      loadProducts();
    }
  }
  
  loadCategories();
}

// Get current active page
function getCurrentPage() {
  const activePage = document.querySelector('.page.active');
  if (activePage) {
    return activePage.id.replace('-page', '');
  }
  return 'home';
}

// Page navigation
function showPage(pageName) {
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => page.classList.remove('active'));

  const targetPage = document.getElementById(`${pageName}-page`);
  if (targetPage) {
    targetPage.classList.add('active');

    // Load page-specific content
    if (pageName === 'home') {
      loadHomePage();
    } else if (pageName === 'products') {
      loadProducts(currentCategory || '', searchQuery || '');
    } else if (pageName === 'cart') {
      renderCart();
    } else if (pageName === 'orders') {
      if (state.currentUser) {
        loadUserOrders();
      } else {
        showMessage('Please login to view your orders', 'error');
        showPage('login');
      }
    } else if (pageName === 'product-detail') {
      // Product detail loads its own content
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Update authentication UI
function updateAuthUI() {
  const authLink = document.getElementById('auth-link');
  const navLinks = document.querySelector('.nav-links');
  
  // Remove existing orders link if present
  const existingOrdersLink = document.getElementById('orders-link');
  if (existingOrdersLink) {
    existingOrdersLink.remove();
  }

  // Remove existing logout link if present
  const existingLogoutLink = document.getElementById('logout-link');
  if (existingLogoutLink) {
    existingLogoutLink.remove();
  }
  
  if (state.currentUser) {
    // User is logged in
    authLink.textContent = `👤 ${state.currentUser.name}`;
    authLink.onclick = null;
    authLink.style.cursor = 'default';
    authLink.style.pointerEvents = 'none';
    
    // Add Orders link
    const ordersLink = document.createElement('a');
    ordersLink.href = '#';
    ordersLink.className = 'nav-link';
    ordersLink.id = 'orders-link';
    ordersLink.textContent = 'My Orders';
    ordersLink.onclick = (e) => {
      e.preventDefault();
      showPage('orders');
    };
    navLinks.insertBefore(ordersLink, authLink);
    
    // Add Logout link
    const logoutLink = document.createElement('a');
    logoutLink.href = '#';
    logoutLink.className = 'nav-link';
    logoutLink.id = 'logout-link';
    logoutLink.textContent = 'Logout';
    logoutLink.onclick = (e) => {
      e.preventDefault();
      handleLogout();
    };
    navLinks.appendChild(logoutLink);
  } else {
    // User is logged out
    authLink.textContent = 'Login';
    authLink.style.cursor = 'pointer';
    authLink.style.pointerEvents = 'auto';
    authLink.onclick = (e) => {
      e.preventDefault();
      goToLogin();
    };
    
    // Add Register link if not present
    let registerLink = document.getElementById('register-link');
    if (!registerLink) {
      registerLink = document.createElement('a');
      registerLink.href = '#';
      registerLink.className = 'nav-link';
      registerLink.id = 'register-link';
      registerLink.textContent = 'Register';
      registerLink.onclick = (e) => {
        e.preventDefault();
        goToRegister();
      };
      navLinks.insertBefore(registerLink, authLink);
    }
  }
}

// Logout (deprecated - use handleLogout from auth.js)
function logout() {
  handleLogout();
}

// Update cart count badge
function updateCartCount() {
  const cartCount = document.getElementById('cart-count');
  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(state.cart));
  updateCartCount();
}

// Show message
function showMessage(message, type = 'success') {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = message;

  const main = document.querySelector('main');
  main.insertBefore(messageDiv, main.firstChild);

  setTimeout(() => {
    messageDiv.remove();
  }, 3000);
}

// API helper
async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
