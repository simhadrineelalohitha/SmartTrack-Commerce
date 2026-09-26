// Load user orders
async function loadUserOrders() {
  if (!state.currentUser) {
    showMessage('Please login to view orders', 'error');
    showPage('login');
    return;
  }

  try {
    const orders = await apiRequest('/api/orders');
    renderOrders(orders);
  } catch (error) {
    console.error('Error loading orders:', error);
    showMessage('Error loading orders', 'error');
  }
}

// Render orders list
function renderOrders(orders) {
  const ordersContainer = document.getElementById('orders-list');

  if (orders.length === 0) {
    ordersContainer.innerHTML = '<p class="empty-message">You have no orders yet</p>';
    return;
  }

  ordersContainer.innerHTML = orders.map(order => `
    <div class="order-card">
      <div class="order-header">
        <div>
          <div class="order-id">Order #${order.id}</div>
          <div class="order-date">${new Date(order.created_at).toLocaleDateString()}</div>
        </div>
        <div>
          <span class="order-status ${order.status}">${order.status}</span>
        </div>
      </div>
      <div>
        <p><strong>Items:</strong> ${order.item_count}</p>
        <p class="order-total">Total: $${parseFloat(order.total_amount).toFixed(2)}</p>
        <button class="btn btn-secondary" onclick="viewOrderDetails(${order.id})">View Details</button>
      </div>
    </div>
  `).join('');
}

// View order details
async function viewOrderDetails(orderId) {
  try {
    const order = await apiRequest(`/api/orders/${orderId}`);
    
    const details = `
      <div class="order-card">
        <h3>Order #${order.id}</h3>
        <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
        <p><strong>Status:</strong> <span class="order-status ${order.status}">${order.status}</span></p>
        <hr>
        <h4>Items:</h4>
        ${order.items.map(item => `
          <div class="cart-item">
            <img src="${item.image_url}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-info">
              <h4>${item.name}</h4>
              <p>Price: $${parseFloat(item.price).toFixed(2)}</p>
              <p>Quantity: ${item.quantity}</p>
              <p><strong>Subtotal: $${(item.price * item.quantity).toFixed(2)}</strong></p>
            </div>
          </div>
        `).join('')}
        <hr>
        <h3 class="order-total">Total: $${parseFloat(order.total_amount).toFixed(2)}</h3>
      </div>
    `;

    const ordersContainer = document.getElementById('orders-list');
    ordersContainer.innerHTML = `
      <button class="btn btn-secondary" onclick="loadUserOrders()">← Back to Orders</button>
      ${details}
    `;
  } catch (error) {
    showMessage('Error loading order details', 'error');
  }
}
