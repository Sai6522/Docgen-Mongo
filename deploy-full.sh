#!/bin/bash

echo "🚀 DOCGEN-MONGO FULL DEPLOYMENT SCRIPT"
echo "======================================"
echo ""
echo "This script will deploy:"
echo "📱 Frontend → Vercel"
echo "🖥️  Backend → Railway" 
echo "🗄️  Database → MongoDB Atlas (manual setup required)"
echo ""

read -p "🤔 Do you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

echo "🎯 Starting full deployment..."
echo ""

# Step 1: Deploy Backend to Railway
echo "📍 STEP 1: Deploying Backend to Railway"
echo "======================================="
./deploy-railway.sh

if [ $? -eq 0 ]; then
    echo "✅ Backend deployment completed"
else
    echo "❌ Backend deployment failed"
    exit 1
fi

echo ""
echo "⏳ Please complete the following before continuing:"
echo "1. Set environment variables in Railway dashboard"
echo "2. Copy your Railway backend URL"
echo ""
read -p "✋ Press Enter when Railway setup is complete..."

# Get Railway backend URL
echo ""
read -p "🔗 Enter your Railway backend URL (e.g., https://your-app.railway.app): " BACKEND_URL

if [ -z "$BACKEND_URL" ]; then
    echo "❌ Backend URL is required"
    exit 1
fi

# Update frontend API URL
echo "🔧 Updating frontend API configuration..."
cd frontend/src/services
sed -i "s|http://localhost:5000|$BACKEND_URL|g" api.js
cd ../../..

# Step 2: Deploy Frontend to Vercel
echo ""
echo "📍 STEP 2: Deploying Frontend to Vercel"
echo "======================================="
./deploy-vercel.sh

if [ $? -eq 0 ]; then
    echo "✅ Frontend deployment completed"
else
    echo "❌ Frontend deployment failed"
    exit 1
fi

echo ""
echo "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "===================================="
echo ""
echo "🌐 Your DocGen-Mongo application is now live!"
echo ""
echo "📋 DEPLOYMENT SUMMARY:"
echo "• Backend: Deployed to Railway"
echo "• Frontend: Deployed to Vercel"
echo "• Database: MongoDB Atlas (ensure it's configured)"
echo ""
echo "🔧 POST-DEPLOYMENT CHECKLIST:"
echo "□ Verify environment variables in Railway"
echo "□ Test backend API endpoints"
echo "□ Test frontend application"
echo "□ Verify database connectivity"
echo "□ Test user authentication"
echo "□ Test document generation"
echo ""
echo "📞 If you encounter issues:"
echo "1. Check Railway logs: railway logs"
echo "2. Check Vercel deployment logs"
echo "3. Verify MongoDB Atlas connection"
echo "4. Ensure CORS is configured for your frontend domain"
echo ""
echo "✨ Happy deploying!"
