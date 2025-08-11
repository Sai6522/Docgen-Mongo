#!/bin/bash

echo "🚀 DEPLOYING FRONTEND TO VERCEL"
echo "==============================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Navigate to frontend directory
cd frontend

echo "🔧 Preparing frontend for deployment..."

# Create vercel.json configuration
cat > vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "headers": {
        "cache-control": "s-maxage=31536000,immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "REACT_APP_API_URL": "@react_app_api_url"
  }
}
EOF

echo "📝 Created vercel.json configuration"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Frontend deployed to Vercel successfully!"
echo "🌐 Your app will be available at the URL shown above"
echo ""
echo "📋 Next steps:"
echo "1. Set REACT_APP_API_URL environment variable in Vercel dashboard"
echo "2. Point it to your backend URL (e.g., Railway, Render, etc.)"
echo "3. Redeploy if needed: vercel --prod"

cd ..
