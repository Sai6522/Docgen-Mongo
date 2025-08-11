# 🚀 DocGen-Mongo Deployment Guide

This guide covers multiple deployment options for your DocGen-Mongo application (React frontend + Node.js backend + MongoDB).

## 📋 Table of Contents

1. [Quick Deployment Options](#quick-deployment-options)
2. [Vercel + Railway Deployment](#vercel--railway-deployment)
3. [Netlify + Render Deployment](#netlify--render-deployment)
4. [Heroku Full-Stack Deployment](#heroku-full-stack-deployment)
5. [Docker Deployment](#docker-deployment)
6. [AWS Deployment](#aws-deployment)
7. [Environment Variables](#environment-variables)
8. [Database Setup](#database-setup)

## 🎯 Quick Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend) - **RECOMMENDED**
- **Frontend**: Vercel (Free tier, excellent for React)
- **Backend**: Railway (Free tier, great for Node.js + MongoDB)
- **Database**: MongoDB Atlas (Free tier)

### Option 2: Netlify (Frontend) + Render (Backend)
- **Frontend**: Netlify (Free tier)
- **Backend**: Render (Free tier)
- **Database**: MongoDB Atlas (Free tier)

### Option 3: Heroku (Full-Stack)
- **Both**: Heroku (Free tier discontinued, paid plans available)
- **Database**: MongoDB Atlas or Heroku MongoDB add-on

## 🌟 Vercel + Railway Deployment (RECOMMENDED)

### Step 1: Deploy Backend to Railway

1. **Create Railway Account**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login to Railway
   railway login
   ```

2. **Prepare Backend for Deployment**
   ```bash
   cd backend
   
   # Create railway.json
   cat > railway.json << 'EOF'
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "node server.js",
       "healthcheckPath": "/health"
     }
   }
   EOF
   
   # Update package.json
   npm pkg set scripts.start="node server.js"
   ```

3. **Deploy to Railway**
   ```bash
   # Initialize Railway project
   railway init
   
   # Deploy
   railway up
   
   # Add environment variables
   railway variables set MONGODB_URI="your-mongodb-atlas-connection-string"
   railway variables set JWT_SECRET="your-jwt-secret-key"
   railway variables set NODE_ENV="production"
   ```

### Step 2: Deploy Frontend to Vercel

1. **Prepare Frontend**
   ```bash
   cd frontend
   
   # Update API base URL in src/services/api.js
   # Replace localhost:5000 with your Railway backend URL
   ```

2. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Login and deploy
   vercel login
   vercel --prod
   ```

## 🎨 Netlify + Render Deployment

### Step 1: Deploy Backend to Render

1. **Create render.yaml**
   ```yaml
   services:
     - type: web
       name: docgen-mongo-backend
       env: node
       buildCommand: npm install
       startCommand: node server.js
       envVars:
         - key: NODE_ENV
           value: production
         - key: MONGODB_URI
           fromDatabase:
             name: docgen-mongo-db
             property: connectionString
         - key: JWT_SECRET
           generateValue: true
   
   databases:
     - name: docgen-mongo-db
       databaseName: docgen_mongo
       user: docgen_user
   ```

2. **Deploy Steps**
   - Push code to GitHub
   - Connect GitHub repo to Render
   - Set environment variables
   - Deploy

### Step 2: Deploy Frontend to Netlify

1. **Create netlify.toml**
   ```toml
   [build]
     publish = "build"
     command = "npm run build"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   
   [build.environment]
     REACT_APP_API_URL = "https://your-render-backend-url.onrender.com"
   ```

2. **Deploy Steps**
   - Connect GitHub repo to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `build`
   - Deploy

## 🔥 Heroku Full-Stack Deployment

### Option A: Separate Apps

1. **Deploy Backend**
   ```bash
   # Create Heroku app for backend
   heroku create docgen-mongo-api
   
   # Add MongoDB addon
   heroku addons:create mongolab:sandbox
   
   # Set environment variables
   heroku config:set JWT_SECRET=your-secret-key
   heroku config:set NODE_ENV=production
   
   # Deploy
   git subtree push --prefix backend heroku main
   ```

2. **Deploy Frontend**
   ```bash
   # Create Heroku app for frontend
   heroku create docgen-mongo-app
   
   # Add buildpack
   heroku buildpacks:set mars/create-react-app
   
   # Set API URL
   heroku config:set REACT_APP_API_URL=https://docgen-mongo-api.herokuapp.com
   
   # Deploy
   git subtree push --prefix frontend heroku main
   ```

### Option B: Monorepo Deployment

1. **Create Heroku Configuration**
   ```json
   // package.json (root)
   {
     "scripts": {
       "heroku-postbuild": "cd frontend && npm install && npm run build",
       "start": "cd backend && npm start"
     },
     "engines": {
       "node": "18.x"
     }
   }
   ```

2. **Deploy**
   ```bash
   heroku create docgen-mongo-fullstack
   heroku config:set JWT_SECRET=your-secret-key
   heroku config:set MONGODB_URI=your-mongodb-connection-string
   git push heroku main
   ```

## 🐳 Docker Deployment

### Using Docker Compose (Local/VPS)

1. **Update docker-compose.yml for Production**
   ```yaml
   version: '3.8'
   services:
     frontend:
       build: ./frontend
       ports:
         - "80:80"
       environment:
         - REACT_APP_API_URL=http://your-domain.com:5000
       depends_on:
         - backend
   
     backend:
       build: ./backend
       ports:
         - "5000:5000"
       environment:
         - MONGODB_URI=mongodb://mongo:27017/docgen_mongo
         - JWT_SECRET=${JWT_SECRET}
         - NODE_ENV=production
       depends_on:
         - mongo
   
     mongo:
       image: mongo:6
       ports:
         - "27017:27017"
       volumes:
         - mongo_data:/data/db
   
   volumes:
     mongo_data:
   ```

2. **Deploy**
   ```bash
   # Set environment variables
   export JWT_SECRET=your-secret-key
   
   # Deploy
   docker-compose up -d --build
   ```

### Using Docker Hub

1. **Build and Push Images**
   ```bash
   # Build backend image
   cd backend
   docker build -t yourusername/docgen-mongo-backend .
   docker push yourusername/docgen-mongo-backend
   
   # Build frontend image
   cd ../frontend
   docker build -t yourusername/docgen-mongo-frontend .
   docker push yourusername/docgen-mongo-frontend
   ```

## ☁️ AWS Deployment

### Using AWS Elastic Beanstalk

1. **Backend Deployment**
   ```bash
   # Install EB CLI
   pip install awsebcli
   
   # Initialize and deploy backend
   cd backend
   eb init docgen-mongo-api
   eb create production
   eb deploy
   ```

2. **Frontend Deployment (S3 + CloudFront)**
   ```bash
   # Build frontend
   cd frontend
   npm run build
   
   # Upload to S3
   aws s3 sync build/ s3://your-bucket-name --delete
   
   # Invalidate CloudFront
   aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
   ```

## 🔧 Environment Variables

### Backend Environment Variables
```bash
# Required
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/docgen_mongo
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
NODE_ENV=production

# Optional
PORT=5000
CORS_ORIGIN=https://your-frontend-domain.com
```

### Frontend Environment Variables
```bash
# Required
REACT_APP_API_URL=https://your-backend-domain.com

# Optional
REACT_APP_APP_NAME=DocGen-Mongo
REACT_APP_VERSION=1.0.0
```

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)

1. **Create Cluster**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Create free cluster
   - Create database user
   - Whitelist IP addresses (0.0.0.0/0 for all)

2. **Get Connection String**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/docgen_mongo?retryWrites=true&w=majority
   ```

3. **Seed Database**
   ```bash
   # Update connection string in backend/.env
   cd backend
   node seed/seedData.js
   ```

## 🚀 Quick Deploy Scripts

### Create deployment scripts in your project root:

**deploy-vercel-railway.sh**
```bash
#!/bin/bash
echo "🚀 Deploying DocGen-Mongo to Vercel + Railway"

# Deploy backend to Railway
cd backend
railway up
cd ..

# Deploy frontend to Vercel
cd frontend
vercel --prod
cd ..

echo "✅ Deployment complete!"
```

**deploy-netlify-render.sh**
```bash
#!/bin/bash
echo "🚀 Deploying DocGen-Mongo to Netlify + Render"

# Build frontend
cd frontend
npm run build
cd ..

# Deploy via git push (assuming connected repos)
git add .
git commit -m "🚀 Deploy to production"
git push origin main

echo "✅ Deployment triggered!"
```

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Update API URLs in frontend
- [ ] Set up MongoDB Atlas database
- [ ] Configure environment variables
- [ ] Test application locally
- [ ] Update CORS settings for production domains

### Post-Deployment
- [ ] Test all functionality
- [ ] Verify database connections
- [ ] Check authentication flows
- [ ] Test file uploads (if applicable)
- [ ] Monitor application logs
- [ ] Set up domain names (optional)
- [ ] Configure SSL certificates
- [ ] Set up monitoring and alerts

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**
   ```javascript
   // backend/server.js
   app.use(cors({
     origin: ['https://your-frontend-domain.com', 'http://localhost:3000'],
     credentials: true
   }));
   ```

2. **Environment Variables Not Loading**
   ```javascript
   // Ensure dotenv is configured
   require('dotenv').config();
   ```

3. **Database Connection Issues**
   ```javascript
   // Add connection options
   mongoose.connect(process.env.MONGODB_URI, {
     useNewUrlParser: true,
     useUnifiedTopology: true,
   });
   ```

## 🎯 Recommended Deployment Strategy

For **DocGen-Mongo**, I recommend:

1. **Frontend**: Vercel (excellent React support, fast CDN)
2. **Backend**: Railway (easy Node.js deployment, good free tier)
3. **Database**: MongoDB Atlas (managed MongoDB, reliable)

This combination provides:
- ✅ Free tiers available
- ✅ Easy deployment process
- ✅ Good performance
- ✅ Automatic SSL certificates
- ✅ Easy scaling options

## 📞 Support

If you encounter issues during deployment:
1. Check the platform-specific documentation
2. Verify environment variables
3. Check application logs
4. Test database connectivity
5. Ensure all dependencies are installed

---

**Happy Deploying! 🚀**
