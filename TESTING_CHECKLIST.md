# Testing Checklist - E-Commerce Website

## Server Status
✅ Server running on: http://localhost:3000

## Test Flow

### 1. Home Page (/)
- [ ] Page loads without errors
- [ ] Hero section displays
- [ ] Featured products load
- [ ] Categories display
- [ ] Navigation works
- [ ] Cart badge shows 0
- [ ] Login link visible

### 2. Registration (/register.html)
- [ ] Page loads
- [ ] Form has all fields (name, email, password, confirm)
- [ ] Client-side validation works
- [ ] Submit creates user
- [ ] Redirects to home after success
- [ ] Shows error for duplicate email

Test User:
- Name: Test User
- Email: test@example.com  
- Password: test123

### 3. Login (/login.html)
- [ ] Page loads
- [ ] Form has email and password fields
- [ ] Invalid credentials show error
- [ ] Valid credentials log in
- [ ] Redirects to home after success
- [ ] Navigation updates (shows username)

### 4. Products Page (/?page=products)
- [ ] All products display
- [ ] Category filter works
- [ ] Search works (Enter key)
- [ ] Search button works
- [ ] Product count updates
- [ ] Empty state shows if no results

### 5. Product Details (Click any product)
- [ ] Product details load
- [ ] Image displays
- [ ] Price, stock, description show
- [ ] Quantity selector works
- [ ] Add to Cart button works
- [ ] Cart badge updates
- [ ] Out of stock products disabled

### 6. Shopping Cart (/?page=cart)
- [ ] Cart items display correctly
- [ ] Quantities can be increased
- [ ] Quantities can be decreased
- [ ] Remove button works
- [ ] Clear cart works
- [ ] Subtotal calculates correctly
- [ ] Proceed to Checkout button visible
- [ ] Empty state shows when cart empty

### 7. Checkout (/checkout.html)
- [ ] Redirects to login if not authenticated
- [ ] Form loads with pre-filled data (email, name)
- [ ] Order summary shows cart items
- [ ] Subtotal and total display
- [ ] All form fields present
- [ ] Client validation works (phone 10 digits, pincode 6 digits)
- [ ] Place Order button works
- [ ] Shows loading spinner during processing

### 8. Order Confirmation (/order-confirmation.html?orderId=X)
- [ ] Order details display
- [ ] Order ID shown
- [ ] Date and time shown
- [ ] Status shows "Pending"
- [ ] All items listed with quantities
- [ ] Total amount correct
- [ ] "View All Orders" button works
- [ ] "Continue Shopping" button works

### 9. Order History (/orders.html)
- [ ] Requires authentication
- [ ] Lists all user orders
- [ ] Shows order ID, date, status, total
- [ ] Shows items in each order
- [ ] "View Details" button works
- [ ] Empty state for no orders

### 10. Logout
- [ ] Logout confirmation dialog appears
- [ ] Logs out successfully
- [ ] Navigation updates (shows Login)
- [ ] Cart persists after logout
- [ ] Cannot access orders page when logged out

### 11. Authorization Tests
- [ ] Cannot view checkout without login
- [ ] Cannot view orders without login
- [ ] Cannot view another user's order
- [ ] Order API returns 401 when not authenticated

### 12. Database Tests
- [ ] User created in database
- [ ] Order created in database
- [ ] Order items created
- [ ] Product stock reduced after order
- [ ] Foreign keys work correctly

### 13. Responsive Design
- [ ] Desktop view works (>1024px)
- [ ] Tablet view works (768px-1024px)
- [ ] Mobile view works (<768px)
- [ ] Navigation responsive
- [ ] Forms responsive
- [ ] Product grid responsive

### 14. Error Handling
- [ ] Empty cart checkout shows error
- [ ] Out of stock prevents order
- [ ] Invalid form data shows errors
- [ ] Network errors handled gracefully
- [ ] Database errors don't crash server

### 15. Security Tests
- [ ] Passwords are hashed (check database)
- [ ] Total calculated on server (not client)
- [ ] Stock validated on server
- [ ] Product IDs validated
- [ ] Users can only access own orders
- [ ] Session cookies are httpOnly

## Browser Console Checks
- [ ] No JavaScript errors
- [ ] No network 404 errors
- [ ] No CORS errors
- [ ] API calls complete successfully

## Performance Checks
- [ ] Pages load quickly (<2s)
- [ ] Images load properly
- [ ] No memory leaks (check DevTools)

## Final Verification
- [ ] Complete flow: Register → Login → Browse → Add to Cart → Checkout → Order → History
- [ ] Stock decreases after order
- [ ] Cart clears after order
- [ ] Multiple orders work correctly
- [ ] Logout and login works multiple times

## Known Limitations
- Uses placeholder images
- No email notifications
- No payment gateway
- Single-user local testing
- No admin panel

## Test Results
- Date Tested: __________
- Tested By: __________
- Browser: __________
- Status: PASS / FAIL
- Notes: __________
