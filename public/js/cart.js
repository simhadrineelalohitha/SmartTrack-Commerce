// ========================================
// CART MANAGEMENT FUNCTIONS
// ========================================

// Render cart page
function renderCart() {
  const cartEmpty = document.getElementById('cart-empty');
  const cartContent = document.getElementById('cart-content');
  const cartSubtitle = document.getElementById('cart-subtitle');

  // Check if cart is empty
  if (state.cart.length === 0) {
    if (cartEmpty) cartEmpty.style.display = 'block';
    if (cartContent) cartContent.style.display = 'none';
    if (cartSubtitle) cartSubtitle.textContent = 'Your cart is currently empty';
    return;
  }

  // Show cart content
  if (cartEmpty) cartEmpty.style.display = 'none';
  if (cartContent) cartContent.style.display = 'block';
  if (cartSubtitle) cartSubtitle.textContent = 'Review your items and proceed to checkout';

  // Render cart items
  renderCartItems();
  
  // Update cart summary
  updateCartSummary();
}

// Render individual cart items
function renderCartItems() {
  const cartItemsContainer = document.getElementById('cart-items');
  
  if (!cartItemsContainer) return;

  cartItemsContainer.innerHTML = state.cart.map((item, index) => {
    const itemTotal = item.price * item.quantity;
    const product = state.products.find(p => p.id === item.productId);
    const maxStock = product ? product.stock : item.quantity;
    const isLowStock = maxStock <= 5;
    
    return `
      <div class="cart-item-card" data-index="${index}">
        <div class="cart-item-image-container">
          <img 
            src="${item.image_url}" 
            alt="${escapeHtml(item.name)}" 
            class="cart-item-image"
            onerror="this.src='https://via.placeholder.com/100x100?text=No+Image'"
          >
        </div>
        
        <div class="cart-item-details">
          <h4 class="cart-item-name">${escapeHtml(item.name)}</h4>
          <p class="cart-item-unit-price">Unit Price: $${parseFloat(item.price).toFixed(2)}</p>
          ${isLowStock ? `<p class="cart-item-stock-warning">⚠️ Only ${maxStock} left in stock</p>` : ''}
        </div>

        <div class="cart-item-quantity-controls">
          <label class="quantity-label">Quantity:</label>
          <div class="quantity-control-group">
            <button 
              class="qty-btn qty-decrease" 
              onclick="updateCartQuantity(${index}, -1)"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <input 
              type="number" 
              class="qty-input" 
              value="${item.quantity}" 
              min="1" 
              max="${maxStock}"
              readonly
              aria-label="Quantity"
            >
            <button 
              class="qty-btn qty-increase" 
              onclick="updateCartQuantity(${index}, 1)"
              ${item.quantity >= maxStock ? 'disabled' : ''}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        <div class="cart-item-total">
          <span class="item-total-label">Item Total:</span>
          <span class="item-total-price">$${itemTotal.toFixed(2)}</span>
        </div>

        <div class="cart-item-actions">
          <button 
            class="btn-remove" 
            onclick="removeFromCart(${index})"
            aria-label="Remove item"
          >
            🗑️ Remove
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Update item count
  const cartItemCount = document.getElementById('cart-item-count');
  if (cartItemCount) {
    cartItemCount.textContent = state.cart.length;
  }
}

// Update cart summary
function updateCartSummary() {
  const totalQuantity = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Update summary values
  const summaryItemCount = document.getElementById('summary-item-count');
  const summarySubtotal = document.getElementById('summary-subtotal');
  const summaryTotal = document.getElementById('summary-total');
  
  if (summaryItemCount) summaryItemCount.textContent = totalQuantity;
  if (summarySubtotal) summarySubtotal.textContent = subtotal.toFixed(2);
  if (summaryTotal) summaryTotal.textContent = subtotal.toFixed(2);
}

// Update cart item quantity
function updateCartQuantity(index, delta) {
  const item = state.cart[index];
  
  if (!item) {
    showMessage('Item not found in cart', 'error');
    return;
  }

  const newQuantity = item.quantity + delta;

  // Prevent quantity below 1
  if (newQuantity < 1) {
    showMessage('Quantity cannot be less than 1', 'error');
    return;
  }

  // Check stock availability
  const product = state.products.find(p => p.id === item.productId);
  
  if (product) {
    // Prevent quantity above available stock
    if (newQuantity > product.stock) {
      showMessage(`Only ${product.stock} items available in stock`, 'error');
      return;
    }
  } else {
    // Product not in state, fetch it
    fetchProductStock(item.productId).then(stock => {
      if (newQuantity > stock) {
        showMessage(`Only ${stock} items available in stock`, 'error');
        return;
      }
      updateItemQuantity(index, newQuantity);
    });
    return;
  }

  // Update quantity
  updateItemQuantity(index, newQuantity);
}

// Helper function to update item quantity
function updateItemQuantity(index, newQuantity) {
  state.cart[index].quantity = newQuantity;
  saveCart();
  renderCart();
  showMessage('Quantity updated', 'success');
}

// Fetch product stock from API
async function fetchProductStock(productId) {
  try {
    const product = await apiRequest(`/api/products/${productId}`);
    
    // Update product in state
    const existingIndex = state.products.findIndex(p => p.id === productId);
    if (existingIndex === -1) {
      state.products.push(product);
    } else {
      state.products[existingIndex] = product;
    }
    
    return product.stock;
  } catch (error) {
    console.error('Error fetching product stock:', error);
    return 999; // Return large number to avoid blocking
  }
}

// Remove item from cart
function removeFromCart(index) {
  const item = state.cart[index];
  
  if (!item) {
    showMessage('Item not found in cart', 'error');
    return;
  }
  
  if (confirm(`Remove "${item.name}" from cart?`)) {
    state.cart.splice(index, 1);
    saveCart();
    renderCart();
    showMessage('Item removed from cart', 'success');
  }
}

// Clear entire cart
function clearCart() {
  if (state.cart.length === 0) {
    showMessage('Cart is already empty', 'error');
    return;
  }

  if (confirm(`Are you sure you want to clear your cart? This will remove all ${state.cart.length} item(s).`)) {
    state.cart = [];
    saveCart();
    renderCart();
    showMessage('Cart cleared successfully', 'success');
  }
}

// Add product to cart (with validation)
function addToCartValidated(productId, quantity = 1) {
  // Validate quantity
  if (quantity < 1) {
    showMessage('Quantity must be at least 1', 'error');
    return false;
  }

  // Find product
  const product = state.products.find(p => p.id === productId);
  
  if (!product) {
    showMessage('Product not found', 'error');
    return false;
  }

  // Check if product is valid
  if (!product.id || !product.name || !product.price) {
    showMessage('Invalid product data', 'error');
    return false;
  }

  // Check stock availability
  const existingItem = state.cart.find(item => item.productId === productId);
  const currentCartQuantity = existingItem ? existingItem.quantity : 0;
  const totalQuantity = currentCartQuantity + quantity;

  if (totalQuantity > product.stock) {
    showMessage(`Cannot add ${quantity} items. Only ${product.stock - currentCartQuantity} more available`, 'error');
    return false;
  }

  // Add or update cart item
  if (existingItem) {
    existingItem.quantity = totalQuantity;
  } else {
    state.cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity: quantity
    });
  }

  saveCart();
  showMessage(`${product.name} added to cart!`, 'success');
  return true;
}

// Checkout - redirect to checkout page
async function checkout() {
  if (state.cart.length === 0) {
    showMessage('Your cart is empty', 'error');
    return;
  }

  // Redirect to checkout page
  window.location.href = '/checkout.html';
}

// Refresh cart stock information
async function refreshCartStock() {
  const productIds = state.cart.map(item => item.productId);
  
  for (const productId of productIds) {
    await fetchProductStock(productId);
  }
  
  renderCart();
}

// Get cart total quantity
function getCartTotalQuantity() {
  return state.cart.reduce((sum, item) => sum + item.quantity, 0);
}

// Get cart total price
function getCartTotalPrice() {
  return state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Check if product is in cart
function isProductInCart(productId) {
  return state.cart.some(item => item.productId === productId);
}

// Get product quantity in cart
function getProductCartQuantity(productId) {
  const item = state.cart.find(item => item.productId === productId);
  return item ? item.quantity : 0;
}
