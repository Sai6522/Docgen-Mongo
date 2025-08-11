# 🚀 Deploy DocGen-Mongo NOW - Step by Step Guide

## 🎯 Quick Deployment Options

### Option 1: Web Interface Deployment (EASIEST)
### Option 2: GitHub Actions (AUTOMATED)
### Option 3: CLI Deployment (ADVANCED)

---

## 🌐 Option 1: Web Interface Deployment (RECOMMENDED)

### 📍 STEP 1: Deploy Backend to Railway (5 minutes)

1. **Go to Railway**
   - Visit: https://railway.app
   - Click "Login" → "Login with GitHub"

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose: `Sai6522/Docgen-Mongo`
   - Select "backend" folder

3. **Configure Deployment**
   - Railway auto-detects Node.js
   - Click "Deploy"
   - Wait for deployment to complete

4. **Set Environment Variables**
   - Go to your project → "Variables" tab
   - Add these variables:
   ```
   MONGODB_URI=mongodb+srv://Gendoc-Mongo:Sai65227239%24@cluster0.kx342cg.mongodb.net/docgen_mongo?retryWrites=true&w=majority
   JWT_SECRET=docgen-mongo-super-secret-jwt-key-2024-production-ready-min-32-chars
   NODE_ENV=production
   ```

5. **Get Backend URL**
   - Copy your Railway app URL (e.g., `https://docgen-mongo-production.railway.app`)

### 📍 STEP 2: Deploy Frontend to Vercel (3 minutes)

1. **Go to Vercel**
   - Visit: https://vercel.com
   - Click "Login" → "Continue with GitHub"

2. **Import Project**
   - Click "New Project"
   - Find and import: `Sai6522/Docgen-Mongo`
   - Select "frontend" folder as root directory

3. **Configure Build Settings**
   - Framework Preset: Create React App (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `build`

4. **Set Environment Variables**
   - Before deploying, click "Environment Variables"
   - Add:
   ```
   REACT_APP_API_URL=https://your-railway-backend-url.railway.app
   ```
   (Replace with your actual Railway URL from Step 1)

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete

### 📍 STEP 3: Test Your Application

1. **Visit Your Frontend**
   - Go to your Vercel URL (e.g., `https://docgen-mongo.vercel.app`)

2. **Login and Test**
   - Email: `admin@docgen.com`
   - Password: `admin123`

3. **Verify Features**
   - ✅ Dashboard loads
   - ✅ Templates page works
   - ✅ Document generation works
   - ✅ User management accessible

---

## 🤖 Option 2: GitHub Actions Deployment (AUTOMATED)

### Prerequisites
You need to set up secrets in your GitHub repository.

### 📍 STEP 1: Set Up GitHub Secrets

1. **Go to Your Repository**
   - Visit: https://github.com/Sai6522/Docgen-Mongo
   - Go to Settings → Secrets and variables → Actions

2. **Add Repository Secrets**
   Click "New repository secret" and add each of these:

   **For Railway:**
   ```
   RAILWAY_TOKEN=your-railway-token
   RAILWAY_PROJECT_ID=your-project-id
   MONGODB_URI=mongodb+srv://Gendoc-Mongo:Sai65227239%24@cluster0.kx342cg.mongodb.net/docgen_mongo?retryWrites=true&w=majority
   JWT_SECRET=docgen-mongo-super-secret-jwt-key-2024-production-ready-min-32-chars
   ```

   **For Vercel:**
   ```
   VERCEL_TOKEN=your-vercel-token
   VERCEL_ORG_ID=your-org-id
   VERCEL_PROJECT_ID=your-project-id
   REACT_APP_API_URL=https://your-railway-backend-url.railway.app
   ```

### 📍 STEP 2: Get Required Tokens

**Railway Token:**
1. Go to https://railway.app/account/tokens
2. Create new token
3. Copy and add to GitHub secrets

**Vercel Token:**
1. Go to https://vercel.com/account/tokens
2. Create new token
3. Copy and add to GitHub secrets

**Project IDs:**
- Create projects first via web interface
- Get IDs from project settings

### 📍 STEP 3: Trigger Deployment

1. **Push to Main Branch**
   ```bash
   git push origin main
   ```

2. **Or Manually Trigger**
   - Go to Actions tab in GitHub
   - Select workflow
   - Click "Run workflow"

---

## 💻 Option 3: CLI Deployment (ADVANCED)

### Prerequisites
- Railway CLI installed
- Vercel CLI installed
- Authenticated with both services

### 📍 Deploy Backend
```bash
cd backend
railway login
railway init
railway up
railway variables set MONGODB_URI="mongodb+srv://Gendoc-Mongo:Sai65227239%24@cluster0.kx342cg.mongodb.net/docgen_mongo?retryWrites=true&w=majority"
railway variables set JWT_SECRET="docgen-mongo-super-secret-jwt-key-2024-production-ready-min-32-chars"
railway variables set NODE_ENV="production"
```

### 📍 Deploy Frontend
```bash
cd frontend
vercel login
vercel --prod
# Set REACT_APP_API_URL in Vercel dashboard
```

---

## 🔧 Environment Variables Reference

### Backend (Railway)
```bash
MONGODB_URI=mongodb+srv://Gendoc-Mongo:Sai65227239%24@cluster0.kx342cg.mongodb.net/docgen_mongo?retryWrites=true&w=majority
JWT_SECRET=docgen-mongo-super-secret-jwt-key-2024-production-ready-min-32-chars
NODE_ENV=production
PORT=5000  # Railway sets this automatically
```

### Frontend (Vercel)
```bash
REACT_APP_API_URL=https://your-railway-backend-url.railway.app
```

---

## 🎯 Expected Results

After successful deployment:

### ✅ Backend (Railway)
- **URL**: `https://docgen-mongo-production.railway.app`
- **Health Check**: `https://your-url.railway.app/health`
- **API Docs**: `https://your-url.railway.app/api-docs`

### ✅ Frontend (Vercel)
- **URL**: `https://docgen-mongo.vercel.app`
- **Features**: All pages and functionality working
- **Performance**: Fast loading with CDN

### ✅ Database (MongoDB Atlas)
- **Status**: Connected and operational
- **Data**: Default users and templates available

---

## 🆘 Troubleshooting

### Common Issues

**❌ CORS Error**
- Ensure frontend URL is added to backend CORS configuration
- Check environment variables are set correctly

**❌ Database Connection Failed**
- Verify MongoDB URI is correct with URL encoding
- Check IP whitelist in MongoDB Atlas (should include 0.0.0.0/0)

**❌ Build Failed**
- Check Node.js version compatibility
- Verify all dependencies are installed
- Check for syntax errors in code

**❌ Environment Variables Not Working**
- Ensure variables are set in platform dashboards
- Redeploy after setting variables
- Check variable names match exactly

### Getting Help

1. **Check Platform Logs**
   - Railway: Project dashboard → Deployments → Logs
   - Vercel: Project dashboard → Functions → Logs

2. **Verify Environment Variables**
   - Railway: Project → Variables tab
   - Vercel: Project → Settings → Environment Variables

3. **Test API Endpoints**
   - Health check: `GET /health`
   - Auth test: `POST /api/auth/login`

---

## 🎉 Success Checklist

After deployment, verify:

- [ ] Backend health endpoint responds
- [ ] Frontend loads without errors
- [ ] User authentication works
- [ ] Database connection is stable
- [ ] Document generation functions
- [ ] All environment variables are set
- [ ] HTTPS certificates are active
- [ ] API endpoints are accessible

---

## 🌟 Your Live Application

Once deployed, you'll have:

- **Professional Document Generation Platform**
- **Global CDN delivery**
- **Automatic HTTPS/SSL**
- **Scalable infrastructure**
- **Real-time monitoring**
- **Production-ready performance**

**🚀 Ready to deploy? Choose your preferred option above and get your DocGen-Mongo live in minutes!**
