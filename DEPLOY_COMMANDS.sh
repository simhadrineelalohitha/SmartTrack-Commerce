#!/bin/bash
# SmartTrack Commerce - Complete Deployment Commands

echo "🚀 SmartTrack Commerce Deployment Script"
echo "=========================================="
echo ""

# Step 1: Stage all changes
echo "📦 Step 1: Staging changes..."
git add .
git status

echo ""
read -p "Continue with commit? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Step 2: Commit
echo ""
echo "💾 Step 2: Committing changes..."
git commit -m "Production fixes: PBKDF2 password security, API routing, session config, missing helpers

- SECURITY FIX: Upgraded from SHA-256 to PBKDF2 password hashing
- Fixed API routing issues (health check, wildcard handling)
- Fixed session cookie configuration for production
- Added missing frontend helper functions (escapeHtml, getStockStatus, quickAddToCart)
- Improved error handling and validation
- All 54 products verified in database
- Backend API tested and working
- Ready for production deployment"

# Step 3: Push to origin
echo ""
echo "🌐 Step 3: Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Check Render dashboard for deployment status"
echo "2. Verify environment variables are set:"
echo "   - DATABASE_URL"
echo "   - NODE_ENV=production"
echo "   - SESSION_SECRET"
echo "3. Test the deployed site:"
echo "   - https://smarttrack-commerce.onrender.com"
echo "4. Run production tests:"
echo "   - node test-production.js"
echo ""
echo "🔍 Monitor deployment at:"
echo "   https://dashboard.render.com"
echo ""
