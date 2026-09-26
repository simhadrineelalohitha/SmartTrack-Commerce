# Quick Start: Testing Checkout & Orders

## 🚀 Quick Test (5 Minutes)

Follow these steps to test the complete checkout flow:

### Step 1: Start the Server
```bash
npm start
```
✓ Server should show: "Server is running on http://localhost:3000"

### Step 2: Register a User
1. Go to: http://localhost:3000/register.html
2. Fill in:
   - Name: **John Doe**
   - Email: **john@test.com**
   - Password: **test123**
   - Confirm: **test123**
3. Click **Create Account**
4. ✓ Should redirect to home page

### Step 3: Add Products to Cart
1. Click **Products** in navigation
2. Click on "**Wireless Headphones**"
3. Change quantity to **2**
4. Click **Add to Cart**
5. Go back and add "**Smart Watch**" (quantity 1)
6. ✓ Cart badge should show **3**

### Step 4: View Cart
1. Click **Cart** in navigation
2. ✓ Should see both products
3. ✓ Total should be: **$379.97** (89.99×2 + 199.99×1)

### Step 5: Checkout
1. Click **Proceed to Checkout** button
2. ✓ Should load checkout page at `/checkout.html`
3. Fill in shipping info:
   - Name: **John Doe** (pre-filled)
   - Email: **john@test.com** (pre-filled)
   - Phone: **1234567890**
   - Address: **123 Main Street**
   - City: **New York**
   - State: **NY**
   - Pincode: **100001**
4. Click **Place Order**
5. ✓ Should show loading spinner
6. ✓ Should redirect to confirmation page

### Step 6: Order Confirmation
1. ✓ Should see green checkmark
2. ✓ Should show "Order Confirmed!"
3. ✓ Should show Order ID: **#1**
4. ✓ Should show both products
5. ✓ Should show total: **$379.97**
6. ✓ Cart badge should show **0** (cart cleared)

### Step 7: View Order History
1. Click **View All Orders**
2. ✓ Should see your order in the list
3. ✓ Order shows correct date, status (Pending), and total
4. Click **View Details**
5. ✓ Should return to order confirmation page

### Step 8: Verify Stock Reduction
1. Go to **Products** page
2. Check **Wireless Headphones**
3. ✓ Stock should be **48** (was 50, ordered 2)
4. Check **Smart Watch**
5. ✓ Stock should be **29** (was 30, ordered 1)

## ✅ Test Complete!

If all steps worked, your checkout system is fully functional! 🎉

---

## 🧪 Additional Tests

### Test Empty Cart
1. Make sure cart is empty
2. Go to: http://localhost:3000/checkout.html
3. ✓ Should show "Your cart is empty" message

### Test Login Redirect
1. Log out
2. Try to access: http://localhost:3000/checkout.html
3. ✓ Should redirect to login page
4. Log in
5. ✓ Should redirect back to checkout

### Test Form Validation
1. Go to checkout with items in cart
2. Try invalid phone: **123** (too short)
3. ✓ Should show error
4. Try invalid pincode: **12** (too short)
5. ✓ Should show error

### Test Multiple Orders
1. Add different products to cart
2. Complete checkout again
3. Go to orders page
4. ✓ Should see multiple orders
5. ✓ Newest order should be first

### Test Authorization
1. Copy order URL: `http://localhost:3000/order-confirmation.html?orderId=1`
2. Log out
3. Try to access the URL
4. ✓ Should redirect to login
5. Try logging in as a **different user**
6. Try accessing the order URL again
7. ✓ Should show "Order not found or access denied"

---

## 🔍 What to Look For

### ✅ Success Indicators:
- Cart badge updates correctly
- Products show in cart with correct prices
- Checkout form pre-fills user data
- Order confirmation shows all details
- Orders page lists all user orders
- Stock decreases after order
- Cart clears after successful order

### ❌ Common Issues:
- **"Cart is empty"** → Add products first
- **Redirect loop** → Clear cookies and localStorage
- **"Authentication required"** → Make sure you're logged in
- **"Insufficient stock"** → Product out of stock, choose another
- **Form validation errors** → Fill all fields correctly

---

## 📊 Expected Data

### Sample Order Data:
- **Order #1**
  - User: john@test.com
  - Items: 2 × Wireless Headphones, 1 × Smart Watch
  - Total: $379.97
  - Status: Pending
  - Date: Today

### Stock After First Order:
- Wireless Headphones: 48 (reduced from 50)
- Smart Watch: 29 (reduced from 30)
- Other products: Unchanged

---

## 💡 Pro Tips

1. **Open Browser DevTools** (F12) to see network requests
2. **Check Console** for any error messages
3. **Use SQLite Browser** to inspect the database directly
4. **Test on Mobile** view (responsive design)
5. **Try Different Browsers** (Chrome, Firefox, Edge)

---

## 🆘 Troubleshooting

### Server Not Starting?
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill process if needed
taskkill /PID <process_id> /F

# Restart server
npm start
```

### Cart Not Updating?
- Check browser console for errors
- Clear localStorage: `localStorage.clear()`
- Refresh the page

### Orders Not Showing?
- Make sure you're logged in as the correct user
- Check server console for errors
- Verify order was created (check database)

### Database Issues?
- Delete `database/ecommerce.db` file
- Restart server (will recreate with sample data)

---

## 📚 Files Reference

- **Checkout**: `/public/checkout.html`
- **Confirmation**: `/public/order-confirmation.html`
- **Orders List**: `/public/orders.html`
- **API Routes**: `/routes/orders.js`
- **Database**: `/database/ecommerce.db`

---

## 🎯 Success Criteria

Your implementation is working correctly if:

✅ Users can complete full order flow
✅ Authentication is required for checkout
✅ All validations work (client and server)
✅ Orders are saved to database
✅ Stock is reduced correctly
✅ Users can view their order history
✅ Users cannot view others' orders
✅ Cart clears after successful order
✅ UI is responsive and user-friendly
✅ Error messages are clear and helpful

---

**Ready to test? Start with Step 1 above!** 🚀
