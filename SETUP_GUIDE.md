# Setup Guide for Simple E-Commerce Website

## Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

## Installation Steps

### Step 1: Install Dependencies

Due to PowerShell execution policy restrictions, you may need to run npm commands using one of these methods:

**Method 1: Use Command Prompt (Recommended)**
```cmd
npm install
```

**Method 2: Use PowerShell with Bypass**
```powershell
powershell -ExecutionPolicy Bypass -Command "npm install"
```

**Method 3: Change PowerShell Execution Policy (Admin required)**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
npm install
```

**Method 4: Use the batch file**
Double-click `install.bat` in Windows Explorer

### Step 2: Start the Server

After dependencies are installed, start the server:

```cmd
npm start
```

Or:
```
node server.js
```

### Step 3: Access the Application

Open your web browser and navigate to:
```
http://localhost:3000
```

## Troubleshooting

### PowerShell Script Execution Error

If you see an error about scripts being disabled:
- Use Command Prompt instead of PowerShell
- Or run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

### Port Already in Use

If port 3000 is already in use, you can change it:
1. Open `server.js`
2. Change the PORT value on line 10
3. Restart the server

### Database Issues

If you encounter database errors:
1. Delete `database/ecommerce.db` if it exists
2. Restart the server (it will recreate the database)

## Testing the Application

1. **Browse Products**: Visit the homepage to see all products
2. **Register**: Click "Login" → "Register here" to create an account
3. **Login**: Use your credentials to log in
4. **Add to Cart**: Click on any product and add it to your cart
5. **Checkout**: Go to cart and click "Proceed to Checkout"
6. **View Orders**: Click "My Orders" to see your order history

## Default Features

- 8 sample products pre-loaded
- Product categories: Electronics, Sports, Home, Accessories
- Shopping cart with localStorage persistence
- User authentication with password hashing
- Order processing and history

## Next Steps

- Test all features thoroughly
- Customize the styling in `public/css/styles.css`
- Add more products through the database
- Implement additional features as needed
