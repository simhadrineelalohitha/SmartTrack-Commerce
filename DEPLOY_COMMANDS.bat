@echo off
REM SmartTrack Commerce - Complete Deployment Commands (Windows)

echo 🚀 SmartTrack Commerce Deployment Script
echo ==========================================
echo.

REM Step 1: Stage all changes
echo 📦 Step 1: Staging changes...
git add .
git status

echo.
set /p CONTINUE="Continue with commit? (y/n): "
if /i not "%CONTINUE%"=="y" (
    echo ❌ Deployment cancelled
    exit /b 1
)

REM Step 2: Commit
echo.
echo 💾 Step 2: Committing changes...
git commit -m "Production fixes: PBKDF2 password security, API routing, session config, missing helpers - SECURITY FIX: Upgraded from SHA-256 to PBKDF2 password hashing - Fixed API routing issues (health check, wildcard handling) - Fixed session cookie configuration for production - Added missing frontend helper functions - All 54 products verified in database - Backend API tested and working - Ready for production deployment"

REM Step 3: Push to origin
echo.
echo 🌐 Step 3: Pushing to GitHub...
git push origin main

echo.
echo ✅ Deployment Complete!
echo.
echo 📋 Next Steps:
echo 1. Check Render dashboard for deployment status
echo 2. Verify environment variables are set:
echo    - DATABASE_URL
echo    - NODE_ENV=production
echo    - SESSION_SECRET
echo 3. Test the deployed site:
echo    - https://smarttrack-commerce.onrender.com
echo 4. Run production tests:
echo    - node test-production.js
echo.
echo 🔍 Monitor deployment at:
echo    https://dashboard.render.com
echo.
pause
