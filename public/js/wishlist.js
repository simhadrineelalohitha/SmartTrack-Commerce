// Wishlist functionality for SmartTrack Commerce

let wishlistItems = [];

// Toggle wishlist
async function toggleWishlist(productId, event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }

  try {
    // Check if user is logged in
    const authCheck = await fetch('/api/auth/check');
    const authData = await authCheck.json();
    
    if (!authData.authenticated) {
      Toast.warning('Please login to use wishlist');
      setTimeout(() => window.location.href = 'login.html', 1500);
      return;
    }

    // Check if in wishlist
    const checkResponse = await fetch(`/api/wishlist/check/${productId}`);
    const checkData = await checkResponse.json();

    if (checkData.inWishlist) {
      // Remove from wishlist
      const response = await fetch(`/api/wishlist/${productId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        Toast.success('Removed from wishlist');
        updateWishlistIcon(productId, false);
        if (window.loadWishlist) loadWishlist();
      }
    } else {
      // Add to wishlist
      const response = await fetch(`/api/wishlist/${productId}`, {
        method: 'POST'
      });

      if (response.ok) {
        Toast.success('Added to wishlist');
        updateWishlistIcon(productId, true);
      }
    }
  } catch (error) {
    console.error('Wishlist error:', error);
    Toast.error('Error updating wishlist');
  }
}

// Update wishlist icon for a product
function updateWishlistIcon(productId, inWishlist) {
  const card = document.querySelector(`[data-product-id="${productId}"]`);
  if (card) {
    const icon = card.querySelector('.wishlist-icon');
    if (icon) {
      icon.textContent = inWishlist ? '♥' : '♡';
      icon.parentElement.classList.toggle('in-wishlist', inWishlist);
    }
  }
}

// Load wishlist items
async function loadWishlist() {
  try {
    const response = await fetch('/api/wishlist');
    if (!response.ok) {
      throw new Error('Failed to load wishlist');
    }

    wishlistItems = await response.json();
    displayWishlist();
    return wishlistItems;
  } catch (error) {
    console.error('Error loading wishlist:', error);
    return [];
  }
}

// Display wishlist
function displayWishlist() {
  const container = document.getElementById('wishlist-container');
  if (!container) return;

  if (wishlistItems.length === 0) {
    EmptyState.show(container, {
      icon: '♡',
      title: 'Your wishlist is empty',
      message: 'Save items you love to buy them later',
      action: {
        text: 'Browse Products',
        onclick: 'window.location.href="index.html"'
      }
    });
    return;
  }

  container.innerHTML = `
    <div class="wishlist-header">
      <h2>My Wishlist (${wishlistItems.length})</h2>
      <button class="btn btn-secondary" onclick="clearWishlist()">Clear All</button>
    </div>
    <div class="products-grid">
      ${wishlistItems.map(product => createProductCard(product)).join('')}
    </div>
  `;

  // Update icons
  wishlistItems.forEach(product => {
    updateWishlistIcon(product.id, true);
  });
}

// Clear entire wishlist
async function clearWishlist() {
  Modal.confirm(
    'Clear Wishlist',
    'Are you sure you want to remove all items from your wishlist?',
    async () => {
      try {
        for (const item of wishlistItems) {
          await fetch(`/api/wishlist/${item.id}`, { method: 'DELETE' });
        }
        wishlistItems = [];
        Toast.success('Wishlist cleared');
        if (window.loadWishlist) loadWishlist();
      } catch (error) {
        Toast.error('Error clearing wishlist');
      }
    }
  );
}

// Check wishlist status for multiple products
async function checkWishlistStatus(productIds) {
  try {
    const checks = await Promise.all(
      productIds.map(id => fetch(`/api/wishlist/check/${id}`).then(r => r.json()))
    );
    
    checks.forEach((data, index) => {
      updateWishlistIcon(productIds[index], data.inWishlist);
    });
  } catch (error) {
    console.error('Error checking wishlist status:', error);
  }
}
