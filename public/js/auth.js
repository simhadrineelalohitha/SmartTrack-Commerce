// ========================================
// AUTHENTICATION FUNCTIONS
// ========================================

// Check authentication status on page load
async function checkAuthStatus() {
  try {
    const response = await fetch('/api/auth/me');
    if (response.ok) {
      const data = await response.json();
      state.currentUser = data.user;
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      updateAuthUI();
      return true;
    } else {
      state.currentUser = null;
      localStorage.removeItem('currentUser');
      updateAuthUI();
      return false;
    }
  } catch (error) {
    console.error('Auth check error:', error);
    state.currentUser = null;
    localStorage.removeItem('currentUser');
    updateAuthUI();
    return false;
  }
}

// Handle login (from index.html)
async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    state.currentUser = data.user;
    localStorage.setItem('currentUser', JSON.stringify(data.user));
    
    updateAuthUI();
    showMessage('Login successful!', 'success');
    showPage('home');
    
    document.getElementById('login-form').reset();
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

// Handle registration (from index.html)
async function handleRegister(event) {
  event.preventDefault();

  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const confirmPassword = document.getElementById('register-confirm-password') 
    ? document.getElementById('register-confirm-password').value 
    : password;

  if (password.length < 6) {
    showMessage('Password must be at least 6 characters', 'error');
    return;
  }

  if (password !== confirmPassword) {
    showMessage('Passwords do not match', 'error');
    return;
  }

  try {
    const data = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, confirmPassword })
    });

    state.currentUser = data.user;
    localStorage.setItem('currentUser', JSON.stringify(data.user));
    
    updateAuthUI();
    showMessage('Registration successful! Welcome!', 'success');
    showPage('home');
    
    document.getElementById('register-form').reset();
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

// Handle logout
async function handleLogout() {
  if (!confirm('Are you sure you want to logout?')) {
    return;
  }

  try {
    await apiRequest('/api/auth/logout', {
      method: 'POST'
    });

    state.currentUser = null;
    localStorage.removeItem('currentUser');
    
    // Clear cart on logout (optional)
    // state.cart = [];
    // localStorage.removeItem('cart');
    
    updateAuthUI();
    showMessage('Logged out successfully', 'success');
    showPage('home');
  } catch (error) {
    showMessage('Error logging out', 'error');
  }
}

// Navigate to login page
function goToLogin() {
  window.location.href = 'login.html';
}

// Navigate to register page
function goToRegister() {
  window.location.href = 'register.html';
}

