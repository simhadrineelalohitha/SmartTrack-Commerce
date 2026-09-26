# Checkout and Order Processing Test Guide

## Overview
This guide will walk you through testing the complete checkout and order processing system.

## Test Flow

### 1. Register a New User
1. Navigate to http://localhost:3000/register.html
2. Fill in the registration form:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Confirm Password: password123
3. Click "Create Account"
4. Should redirect to home page after successful registration

### 2. Browse and Add Products to Cart
1. Go to http://localhost:3000
2. Click on "Products" in the navigation
3. Click on any product to view details
4. Add 2-3 different products to cart with different quantities
5. Verify the cart badge updates with the total item count

### 3. View Cart
1. Click on "Cart" in the navigation
2. Verify all added products are displayed correctly
3. Test quantity changes:
   - Increase quantity of an item
   - Decrease quantity of an item
   - Verify total updates correctly
4. Test remove item functionality
5. Add items back if you removed them

### 4. Proceed to Checkout (Not Logged In)
1. If you log out, try accessing http://localhost:3000/checkout.html
2. Should redirect to login page with `?redirect=checkout` parameter
3. After login, should redirect back to checkout page

### 5. Checkout Page (Logged In)
1. Navigate to http://localhost:3000/checkout.html
2. Verify:
   - Order summary shows all cart items correctly
   - Subtotal and Total are calculated correctly
   - Email field is pre-filled with user's email
   - Name field is pre-filled with user's name

### 6. Fill Customer Information
Fill in the shipping information form:
- Full Name: Test User
- Email: test@example.com (pre-filled)
- Phone: 1234567890
- Address: 123 Test Street
- City: Test City
- State: Test State
- Pincode: 123456

### 7. Test Validation
Try invalid inputs to test validation:
- Phone with less than 10 digits → Should show error
- Pincode with less than 6 digits → Should show error
- Empty required fields → Browser validation should trigger

### 8. Place Order
1. Click "Place Order" button
2. Should show loading overlay with spinner
3. After successful order:
   - Should redirect to order confirmation page
   - URL should include `?orderId=X`
   - Cart should be cleared (cart badge shows 0)

### 9. Order Confirmation Page
On the confirmation page, verify:
- ✓ Success icon is displayed
- Order ID is shown (e.g., #1)
- Order date and time are displayed
- Order status shows "Pending"
- All ordered items are listed with correct quantities and prices
- Total amount matches the cart total
- "View All Orders" button is visible
- "Continue Shopping" button is visible

### 10. View All Orders
1. Click "View All Orders" or navigate to http://localhost:3000/orders.html
2. Verify:
   - Your new order appears at the top
   - Order card shows: Order ID, Date, Status, Total
   - All order items are displayed with images and prices
   - "View Details" button is present

### 11. View Order Details
1. Click "View Details" on an order
2. Should redirect to order confirmation page for that specific order
3. Verify all order details are correct

### 12. Test Authorization
1. Copy an order URL (e.g., http://localhost:3000/order-confirmation.html?orderId=1)
2. Log out
3. Try accessing the order URL
4. Should redirect to login page
5. After login, should redirect back to the order page

### 13. Test Stock Reduction
1. Check product stock before order (go to products page, check stock display)
2. Add product to cart and complete checkout
3. Go back to products page
4. Verify product stock has decreased by the ordered quantity

### 14. Test Empty Cart Checkout
1. Clear your cart (remove all items)
2. Try accessing http://localhost:3000/checkout.html
3. Should show "Your cart is empty" message with link to browse products

### 15. Test Out-of-Stock Prevention
1. Find a product with low stock (or add a lot of one product to cart)
2. In the database, manually set the product stock to less than your cart quantity
3. Try to checkout
4. Should show error message about insufficient stock

### 16. Test Multiple Orders
1. Create 2-3 more orders with different products
2. Visit the orders page
3. Verify all orders are listed in reverse chronological order (newest first)
4. Verify each order shows correct items and totals

## Expected Behaviors

### Cart Persistence
- Cart should persist across page refreshes (localStorage)
- Cart should be cleared after successful order

### Authentication
- Checkout page requires authentication
- Orders page requires authentication
- Order details page requires authentication
- Users can only view their own orders

### Validation
- Client-side validation for form fields
- Server-side validation for cart items, stock, and customer info
- Phone number must be 10 digits
- Pincode must be 6 digits
- All customer information fields are required

### Database Operations
- Orders are created with status "Pending"
- Order items are linked to the order
- Product stock is reduced after successful order
- If any step fails, order should not be created (transaction-like behavior)

### Error Handling
- Empty cart → Show error message
- Out of stock → Show specific error with product name
- Invalid product IDs → Show error message
- Database errors → Show generic error message
- Network errors → Show error message

## Common Issues and Solutions

### Issue: "Cart is empty" on checkout
**Solution:** Add products to cart from the products page first

### Issue: Redirect loop on checkout page
**Solution:** Clear browser cookies and localStorage, then login again

### Issue: Order not showing in orders list
**Solution:** 
- Check if you're logged in as the correct user
- Check browser console for errors
- Verify the order was created (check database or server logs)

### Issue: Stock not reducing
**Solution:** Check server logs for errors during order creation

### Issue: Total amount incorrect
**Solution:** 
- Total is calculated on the server, not the client
- Check if product prices in database match displayed prices

## Security Features Verified

✓ Authentication required for checkout
✓ Authentication required for viewing orders
✓ Users can only view their own orders (authorization check)
✓ Total amount calculated on server (not trusted from client)
✓ Stock validation happens on server
✓ Product IDs validated against database
✓ Customer information validated on both client and server

## Database Verification

To verify orders in the database, you can use SQLite browser or run:

```sql
-- View all orders
SELECT * FROM orders;

-- View order items for a specific order
SELECT oi.*, p.name 
FROM order_items oi 
JOIN products p ON oi.product_id = p.id 
WHERE oi.order_id = 1;

-- Check product stock
SELECT id, name, stock FROM products;

-- View all users
SELECT id, email, name FROM users;
```

## Success Criteria

✅ User can complete the full flow: Register → Browse → Add to Cart → Checkout → Place Order → View Orders
✅ Cart persists and clears correctly
✅ Authentication and authorization work properly
✅ Order is created in database with correct data
✅ Product stock is reduced after order
✅ User can view their order history
✅ User can view individual order details
✅ All validations work (client and server)
✅ Error messages are clear and helpful
✅ UI is responsive and user-friendly

## Test Complete!

If all the above tests pass, your checkout and order processing system is working correctly! 🎉
