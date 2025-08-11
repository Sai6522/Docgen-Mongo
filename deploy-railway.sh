#!/bin/bash

echo "🚂 DEPLOYING BACKEND TO RAILWAY"
echo "==============================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Navigate to backend directory
cd backend

echo "🔧 Preparing backend for deployment..."

# Create railway.json configuration
cat > railway.json << 'EOF'
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server.js",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF

echo "📝 Created railway.json configuration"

# Update package.json to ensure start script
npm pkg set scripts.start="node server.js"
npm pkg set engines.node=">=18.0.0"

echo "📦 Installing dependencies..."
npm install

# Login to Railway (if not already logged in)
echo "🔐 Checking Railway authentication..."
railway whoami || railway login

# Initialize Railway project
echo "🚂 Initializing Railway project..."
railway init

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Backend deployed to Railway successfully!"
echo ""
echo "📋 IMPORTANT: Set these environment variables in Railway dashboard:"
echo "1. MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/docgen_mongo"
echo "2. JWT_SECRET=your-super-secret-jwt-key-min-32-characters"
echo "3. NODE_ENV=production"
echo "4. PORT=5000 (Railway will set this automatically)"
echo ""
echo "🌐 Your API will be available at the Railway URL shown above"
echo "📝 Copy this URL to use in your frontend REACT_APP_API_URL"

cd ..
