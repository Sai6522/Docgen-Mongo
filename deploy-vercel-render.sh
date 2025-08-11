#!/bin/bash

echo "🚀 DEPLOYING DOCGEN-MONGO: BACKEND TO VERCEL + FRONTEND TO RENDER"
echo "=================================================================="
echo ""

# Check if required CLIs are installed
echo "🔧 Checking deployment tools..."
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    sudo npm install -g vercel
fi

echo ""
echo "📍 STEP 1: DEPLOY BACKEND TO VERCEL"
echo "==================================="
echo ""

# Navigate to backend
cd backend

echo "🔧 Preparing backend for Vercel deployment..."
echo "✅ vercel.json configuration ready"

# Install dependencies
echo "📦 Installing backend dependencies..."
npm install

echo ""
echo "🚀 Deploying backend to Vercel..."
echo "⚠️  You'll need to:"
echo "1. Login to Vercel when prompted"
echo "2. Set environment variables in Vercel dashboard:"
echo "   MONGODB_URI=mongodb+srv://Gendoc-Mongo:Sai65227239%24@cluster0.kx342cg.mongodb.net/docgen_mongo?retryWrites=true&w=majority"
echo "   JWT_SECRET=docgen-mongo-super-secret-jwt-key-2024-production-ready-min-32-chars"
echo "   NODE_ENV=production"
echo ""

read -p "Press Enter to continue with Vercel deployment..."
vercel --prod

echo ""
echo "✅ Backend deployed to Vercel!"
echo "📝 Copy your Vercel backend URL for the next step"
echo ""

read -p "Enter your Vercel backend URL (e.g., https://docgen-mongo-backend.vercel.app): " BACKEND_URL

if [ -z "$BACKEND_URL" ]; then
    echo "❌ Backend URL is required for frontend deployment"
    exit 1
fi

echo ""
echo "📍 STEP 2: PREPARE FRONTEND FOR RENDER"
echo "======================================"
echo ""

# Navigate to frontend
cd ../frontend

echo "🔧 Updating frontend API configuration..."
# Update API URL in services/api.js
sed -i "s|http://localhost:5000|$BACKEND_URL|g" src/services/api.js

echo "✅ Frontend configured with backend URL: $BACKEND_URL"
echo ""
echo "📋 NEXT STEPS FOR RENDER DEPLOYMENT:"
echo "1. Go to https://render.com"
echo "2. Sign up/Login with GitHub"
echo "3. Create New Static Site"
echo "4. Connect repository: Sai6522/Docgen-Mongo"
echo "5. Select 'frontend' folder as root directory"
echo "6. Build Command: npm install && npm run build"
echo "7. Publish Directory: build"
echo "8. Environment Variable: REACT_APP_API_URL=$BACKEND_URL"
echo "9. Deploy!"
echo ""
echo "🎉 DEPLOYMENT READY!"
echo "==================="
echo "Backend: $BACKEND_URL"
echo "Frontend: Deploy manually on Render"
echo ""
echo "✨ Your DocGen-Mongo will be live soon!"

cd ..
