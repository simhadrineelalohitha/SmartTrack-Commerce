# Simple E-Commerce Website

A complete full-stack e-commerce website built with vanilla JavaScript, Node.js, Express, and SQLite. Features product browsing, shopping cart, user authentication, and full checkout/order processing.

## ✨ Features

- 🛍️ Product listings with category filtering and search
- 🔍 Product detail pages with stock information
- 🛒 Shopping cart with localStorage persistence
- 👤 User registration and login with session management
- 💳 **Complete checkout system with customer information form**
- 📦 **Order processing with validation and stock management**
- 📋 **Order history and order details pages**
- 🔒 Authentication and authorization
- 📱 Responsive design for all devices
- ✅ Form validation (client and server)
- 🗄️ SQLite database for data persistence

## 🚀 Quick Start

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

### Quick Test Flow

1. **Register**: http://localhost:3000/register.html
2. **Browse Products**: Click "Products" in navigation
3. **Add to Cart**: Select products and add them
4. **Checkout**: Click cart, then "Proceed to Checkout"
5. **Place Order**: Fill form and click "Place Order"
6. **View Orders**: Click "My Orders" to see order history

📖 **Detailed Testing Guide**: See `QUICK_START_CHECKOUT.md`

## 🏗️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js + Express.js
- **Database**: SQLite3
- **Authentication**: express-session with httpOnly cookies
- **Password Security**: Crypto (SHA-256 hashing)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## 📁 Project Structure

```
.
├── database/
│   ├── db.js              # Database connection and initialization
│   └── ecommerce.db       # SQLite database (auto-created)
├── routes/
│   ├── auth.js            # Authentication routes (register/login/logout)
│   ├── products.js        # Product routes (list/details/categories)
│   ├── cart.js            # Cart validation routes
│   └── orders.js          # Order routes (create/list/details) ⭐ NEW
├── public/
│   ├── css/
│   │   └── styles.css     # All styles (including checkout/orders)
│   ├── js/
│   │   ├── app.js         # Main app logic and state management
│   │   ├── auth.js        # Authentication logic
│   │   ├── products.js    # Product display logic
│   │   ├── cart.js        # Cart management logic
│   │   └── home.js        # Homepage logic
│   ├── index.html         # Main SPA file
│   ├── register.html      # Registration page
│   ├── login.html         # Login page
│   ├── checkout.html      # Checkout page ⭐ NEW
│   ├── order-confirmation.html  # Order confirmation ⭐ NEW
│   └── orders.html        # Order history page ⭐ NEW
├── server.js              # Express server with session middleware
├── package.json           # Dependencies
├── README.md              # This file
├── QUICK_START_CHECKOUT.md       # Quick testing guide ⭐
├── CHECKOUT_TEST_GUIDE.md        # Comprehensive test guide ⭐
└── CHECKOUT_IMPLEMENTATION_SUMMARY.md  # Implementation details ⭐
```

## 🗄️ Database Schema

### users
- `id` (PRIMARY KEY, AUTO INCREMENT)
- `email` (UNIQUE, NOT NULL)
- `password` (HASHED, NOT NULL)
- `name` (NOT NULL)
- `created_at` (TIMESTAMP)

### products
- `id` (PRIMARY KEY, AUTO INCREMENT)
- `name` (NOT NULL)
- `description` (TEXT)
- `price` (REAL, NOT NULL)
- `image_url` (TEXT)
- `stock` (INTEGER, DEFAULT 0)
- `category` (TEXT)
- `created_at` (TIMESTAMP)

### orders ⭐
- `id` (PRIMARY KEY, AUTO INCREMENT)
- `user_id` (FOREIGN KEY → users.id)
- `total_amount` (REAL, NOT NULL)
- `status` (TEXT, DEFAULT 'Pending')
- `created_at` (TIMESTAMP)

### order_items ⭐
- `id` (PRIMARY KEY, AUTO INCREMENT)
- `order_id` (FOREIGN KEY → orders.id)
- `product_id` (FOREIGN KEY → products.id)
- `quantity` (INTEGER, NOT NULL)
- `price` (REAL, NOT NULL) - Price at time of order
- `created_at` (TIMESTAMP)

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user (creates session)
- `POST /api/auth/logout` - Logout user (destroys session)
- `GET /api/auth/me` - Get current user info

### Products
- `GET /api/products` - Get all products (supports `?category=` and `?search=`)
- `GET /api/products/:id` - Get single product details
- `GET /api/products/categories/list` - Get all available categories

### Cart
- `POST /api/cart/validate` - Validate cart items against stock

### Orders ⭐
- `POST /api/orders` - Create new order (requires authentication)
  - Validates cart items
  - Verifies stock availability
  - Calculates total on server
  - Creates order and order items
  - Reduces product stock
  - Returns order confirmation
  
- `GET /api/orders` - Get logged-in user's orders (requires authentication)
  - Returns list of orders with item counts
  - Sorted by date (newest first)
  
- `GET /api/orders/:orderId` - Get order details (requires authentication)
  - Returns order with all items
  - Includes product information
  - Authorization: user can only view own orders

## 📦 Sample Products

The application comes with 8 sample products across 4 categories:

**Electronics**
- Wireless Headphones - $89.99 (Stock: 50)
- Smart Watch - $199.99 (Stock: 30)

**Sports**
- Running Shoes - $79.99 (Stock: 100)
- Yoga Mat - $29.99 (Stock: 75)

**Home**
- Coffee Maker - $69.99 (Stock: 40)
- Desk Lamp - $34.99 (Stock: 60)

**Accessories**
- Backpack - $49.99 (Stock: 80)
- Water Bottle - $24.99 (Stock: 120)

## 💡 Usage Flow

### For Customers:

1. **Browse Products**
   - View all products on homepage
   - Filter by category
   - Search by name/description
   - Click product for details

2. **Shopping Cart**
   - Add products to cart
   - Update quantities
   - Remove items
   - Cart persists in localStorage

3. **Checkout** ⭐
   - Click "Proceed to Checkout"
   - Login if not authenticated
   - Fill shipping information
   - Review order summary
   - Place order

4. **Order Confirmation** ⭐
   - View order details
   - See order ID and status
   - Check ordered items
   - View total amount

5. **Order History** ⭐
   - View all past orders
   - Click for order details
   - Track order status

## 🔒 Security Features

- ✅ Password hashing (SHA-256)
- ✅ Session-based authentication
- ✅ HttpOnly cookies
- ✅ Authorization checks (users can only view own orders)
- ✅ Server-side total calculation (never trust client)
- ✅ Server-side validation for all inputs
- ✅ SQL injection prevention (parameterized queries)
- ✅ Stock validation to prevent overselling
- ✅ Product ID validation

## ✅ Validation & Error Handling

### Client-Side Validation:
- Email format validation
- Password length (minimum 6 characters)
- Phone number format (10 digits)
- Pincode format (6 digits)
- All required fields checked
- Quantity limits (min 1, max available stock)

### Server-Side Validation:
- User authentication verification
- Cart item validation
- Product existence check
- Stock availability check
- Customer information completeness
- Data format validation
- Authorization checks

### Error Messages:
- Clear, user-friendly error messages
- Specific errors for stock issues
- Validation feedback for form fields
- Network error handling
- Database error handling

## 📚 Documentation

- **README.md** - This file (overview and setup)
- **QUICK_START_CHECKOUT.md** - 5-minute testing guide
- **CHECKOUT_TEST_GUIDE.md** - Comprehensive testing procedures
- **CHECKOUT_IMPLEMENTATION_SUMMARY.md** - Technical implementation details

## 📝 Notes

- **Educational Project**: Built for learning full-stack development
- **No Deployment**: Focus is on local development, no production config
- **No Payment Gateway**: Simple order placement without real payments
- **localStorage**: Cart data persists across browser sessions
- **Session-based Auth**: Uses express-session with httpOnly cookies
- **Crypto Hashing**: Passwords hashed with SHA-256
- **Placeholder Images**: Uses placeholder service for product images
- **Responsive Design**: Mobile-friendly layout
- **No TypeScript**: Pure JavaScript for simplicity
- **No Framework**: Vanilla JS for learning fundamentals

## 🚧 Future Enhancements (Not Implemented)

- Admin panel for order management
- Order status updates (Processing, Shipped, Delivered)
- Email notifications
- Payment gateway integration
- Product reviews and ratings
- Wishlist functionality
- Order cancellation
- Multiple shipping addresses
- Invoice generation
- Advanced search and filters
- Product recommendations

## 🐛 Troubleshooting

### Server won't start
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <process_id> /F

# Restart
npm start
```

### Cart not updating
- Check browser console for errors
- Clear localStorage: Open DevTools → Application → Local Storage → Clear
- Refresh the page

### Orders not showing
- Verify you're logged in
- Check that you're viewing as the correct user
- Check server console for errors

### Database issues
- Delete `database/ecommerce.db` file
- Restart server (will recreate with sample data)

## 🤝 Contributing

This is a student project for learning purposes. Feel free to:
- Fork and experiment
- Add new features
- Improve the code
- Report issues
- Share feedback

## 📄 License

This project is open source and available for educational purposes.

## 🎓 Learning Outcomes

This project demonstrates:
- ✅ Full-stack web development
- ✅ RESTful API design
- ✅ Database design and operations
- ✅ User authentication and authorization
- ✅ Session management
- ✅ Form handling and validation
- ✅ Error handling
- ✅ State management (client-side)
- ✅ Responsive web design
- ✅ Security best practices

---

**Status**: ✅ Complete and Ready for Testing  
**Last Updated**: Current  
**Test Guide**: See `QUICK_START_CHECKOUT.md` for quick testing

🎉 **Start testing now**: `npm start` then visit http://localhost:3000
