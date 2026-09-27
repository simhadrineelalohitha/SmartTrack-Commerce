# SmartTrack Commerce - Render Deployment Guide

## ✅ Fixes Applied

### Problems Identified & Solved:

1. **8 Products Instead of 54**
   - ❌ **Root Cause:** Database not committed to Git + conflicting sample product insertion
   - ✅ **Solution:** PostgreSQL database + automatic product seeding on deployment

2. **Missing Images**
   - ❌ **Root Cause:** Using via.placeholder.com (unreliable on Render)
   - ✅ **Solution:** Switched to placehold.co (more reliable placeholder service)

3. **Server Binding**
   - ❌ **Root Cause:** Not binding to 0.0.0.0
   - ✅ **Solution:** Server now binds to `0.0.0.0:${PORT}`

4. **Database Persistence**
   - ❌ **Root Cause:** SQLite on ephemeral filesystem
   - ✅ **Solution:** PostgreSQL for production, SQLite for local development

---

## 🚀 Deployment Steps

### 1. Set Up PostgreSQL Database on Render

1. Go to your Render Dashboard
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name:** `smarttrack-commerce-db`
   - **Database:** `smarttrack_commerce`
   - **User:** (auto-generated)
   - **Region:** Same as your web service
   - **Plan:** **Free** (1GB storage)
4. Click **"Create Database"**
5. **Copy the Internal Database URL** (starts with `postgres://`)

### 2. Configure Your Web Service

1. Go to your Web Service on Render
2. Go to **Environment** tab
3. Add environment variables:
   ```
   NODE_ENV=production
   DATABASE_URL=<paste-your-internal-database-url-here>
   SESSION_SECRET=<generate-a-random-secret-key>
   ```

### 3. Deploy the Updated Code

Run these Git commands:

```bash
# Stage all changes
git add .

# Commit changes
git commit -m "Fix Render deployment: PostgreSQL + 54 products + image URLs"

# Push to trigger deployment
git push origin main
```

### 4. Verify Deployment

After deployment completes (5-10 minutes):

1. **Check Logs:** Look for:
   ```
   🔵 Using PostgreSQL database
   Connected to PostgreSQL database
   ✓ Database tables initialized
   📦 Importing full product catalog (54 products)...
   ✅ Product import complete! Added 54 products.
   ```

2. **Test the Site:**
   - Visit your Render URL
   - Go to Products page
   - Verify 54 products are displayed
   - Confirm images load correctly

---

## 📋 What Changed

### New Files:
- `database/db-factory.js` - Switches between SQLite/PostgreSQL
- `database/db-postgres.js` - PostgreSQL adapter
- `database/db-sqlite.js` - SQLite module (local dev)
- `database/seed-marketplace-data.js` - 54 product dataset
- `database/seed-products.js` - Product seeder wrapper

### Modified Files:
- `server.js` - Uses db-factory, binds to 0.0.0.0, improved seeding
- `package.json` - Added `pg` dependency

### Removed:
- 8-product sample seed from `db-sqlite.js`

---

## 🔧 How It Works

### Local Development (SQLite):
```
No DATABASE_URL → Uses SQLite (database/ecommerce.db)
Your existing 54 products remain intact
```

### Production (Render + PostgreSQL):
```
DATABASE_URL set → Uses PostgreSQL
Creates tables automatically
Seeds 54 products on first run
```

---

## 🖼️ Image Strategy

**Using:** `placehold.co` - Reliable placeholder image service
- ✅ Works on Render
- ✅ No rate limiting
- ✅ Fast CDN delivery
- ✅ Color-coded by category

**Format:** `https://placehold.co/400x400/COLOR/white?text=Product+Name`

**Future:** Replace with real product images by:
1. Uploading images to a CDN (Cloudinary, AWS S3, etc.)
2. Updating image_url in database

---

## 🧪 Testing

### Locally:
```bash
npm start
# Visit http://localhost:3000
```

### On Render:
```
https://your-app-name.onrender.com
```

---

## ⚠️ Important Notes

1. **First Deployment:** Takes 2-3 minutes for product seeding
2. **Database Backups:** Render Free tier doesn't include backups - upgrade if needed
3. **Environment Variables:** Never commit DATABASE_URL to Git
4. **Session Secret:** Generate a strong random string for production

---

## 🎯 Success Checklist

- ✅ PostgreSQL database created on Render
- ✅ DATABASE_URL environment variable set
- ✅ Code pushed to Git
- ✅ Deployment successful (no errors in logs)
- ✅ 54 products visible on website
- ✅ Product images loading correctly
- ✅ All features working (cart, wishlist, checkout, etc.)

---

## 🆘 Troubleshooting

### "Only 8 products showing"
- Check Render logs for product import messages
- Verify DATABASE_URL is set correctly
- Redeploy: Settings → Manual Deploy

### "Images not loading"
- Check browser console for errors
- Verify URLs start with `https://placehold.co/`
- Try different browser/incognito mode

### "Database connection failed"
- Verify DATABASE_URL format: `postgres://user:pass@host:port/db`
- Check PostgreSQL database is running
- Use Internal Database URL (not External)

### "SQLITE_ERROR"
- This error should NOT appear with PostgreSQL
- If it does, DATABASE_URL is not set correctly

---

## 📞 Need Help?

1. Check Render logs: Dashboard → Your Service → Logs
2. Verify environment variables are set
3. Ensure PostgreSQL database is active
4. Check this file for troubleshooting steps
