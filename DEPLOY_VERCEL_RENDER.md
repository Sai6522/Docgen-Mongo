# 🚀 Deploy DocGen-Mongo: Backend on Vercel + Frontend on Render

## 🎯 Deployment Strategy

- **Backend (Node.js API)** → **Vercel** (Serverless functions)
- **Frontend (React App)** → **Render** (Static site hosting)
- **Database** → **MongoDB Atlas** (Already configured)

---

## 📍 STEP 1: Deploy Backend to Vercel (5 minutes)

### 1️⃣ Prepare Backend for Vercel

First, let's configure the backend for Vercel's serverless environment:

```bash
cd /home/sai/DocGen-Mongo/backend
```

Create `vercel.json` configuration:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ],
  "env": {
    "MONGODB_URI": "@mongodb_uri",
    "JWT_SECRET": "@jwt_secret",
    "NODE_ENV": "production"
  }
}
```

### 2️⃣ Deploy to Vercel

1. **Go to Vercel**
   - Visit: https://vercel.com
   - Click "Login" → "Continue with GitHub"

2. **Import Project**
   - Click "New Project"
   - Find and import: `Sai6522/Docgen-Mongo`
   - Select **"backend"** folder as root directory

3. **Configure Build Settings**
   - Framework Preset: Other (Vercel will detect Node.js)
   - Build Command: `npm install`
   - Output Directory: Leave empty
   - Install Command: `npm install`

4. **Set Environment Variables**
   Before deploying, add these environment variables:
   ```
   MONGODB_URI=mongodb+srv://Gendoc-Mongo:Sai65227239%24@cluster0.kx342cg.mongodb.net/docgen_mongo?retryWrites=true&w=majority
   JWT_SECRET=docgen-mongo-super-secret-jwt-key-2024-production-ready-min-32-chars
   NODE_ENV=production
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Copy your backend URL (e.g., `https://docgen-mongo-backend.vercel.app`)

### 3️⃣ Test Backend Deployment

Visit these URLs to verify:
- Health check: `https://your-backend.vercel.app/health`
- API docs: `https://your-backend.vercel.app/api-docs`

---

## 📍 STEP 2: Deploy Frontend to Render (5 minutes)

### 1️⃣ Prepare Frontend for Render

Update the API URL in your frontend:

```bash
cd /home/sai/DocGen-Mongo/frontend/src/services
```

Edit `api.js` to use your Vercel backend URL:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-backend.vercel.app';
```

### 2️⃣ Deploy to Render

1. **Go to Render**
   - Visit: https://render.com
   - Click "Get Started" → "Sign up with GitHub"

2. **Create New Static Site**
   - Click "New" → "Static Site"
   - Connect your GitHub repository: `Sai6522/Docgen-Mongo`
   - Select **"frontend"** folder as root directory

3. **Configure Build Settings**
   - Name: `docgen-mongo-frontend`
   - Branch: `main`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`

4. **Set Environment Variables**
   - Click "Environment" tab
   - Add environment variable:
   ```
   REACT_APP_API_URL=https://your-backend.vercel.app
   ```
   (Replace with your actual Vercel backend URL from Step 1)

5. **Deploy**
   - Click "Create Static Site"
   - Wait for deployment to complete
   - Copy your frontend URL (e.g., `https://docgen-mongo-frontend.onrender.com`)

---

## 📍 STEP 3: Configure CORS for Cross-Origin Requests

Since your frontend and backend are on different domains, update CORS settings:

### Update Backend CORS Configuration

In your backend `server.js`, update the CORS configuration:

```javascript
// Update CORS to allow your Render frontend
app.use(cors({
  origin: [
    'http://localhost:3000', // For development
    'https://your-frontend.onrender.com', // Your Render frontend URL
    'https://docgen-mongo-frontend.onrender.com' // Example
  ],
  credentials: true
}));
```

Redeploy your backend to Vercel after this change.

---

## 🔧 Environment Variables Summary

### Backend (Vercel)
```bash
MONGODB_URI=mongodb+srv://Gendoc-Mongo:Sai65227239%24@cluster0.kx342cg.mongodb.net/docgen_mongo?retryWrites=true&w=majority
JWT_SECRET=docgen-mongo-super-secret-jwt-key-2024-production-ready-min-32-chars
NODE_ENV=production
```

### Frontend (Render)
```bash
REACT_APP_API_URL=https://your-backend.vercel.app
```

---

## 📋 Deployment Scripts

### Create Vercel Backend Configuration

Create `backend/vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ]
}
```

### Create Render Frontend Configuration

Create `frontend/render.yaml`:
```yaml
services:
  - type: web
    name: docgen-mongo-frontend
    env: static
    buildCommand: npm install && npm run build
    staticPublishPath: ./build
    envVars:
      - key: REACT_APP_API_URL
        value: https://your-backend.vercel.app
```

---

## 🧪 Testing Your Deployment

### 1️⃣ Test Backend (Vercel)
```bash
# Health check
curl https://your-backend.vercel.app/health

# Test authentication
curl -X POST https://your-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@docgen.com","password":"admin123"}'
```

### 2️⃣ Test Frontend (Render)
1. Visit your Render frontend URL
2. Login with: `admin@docgen.com` / `admin123`
3. Test all features:
   - Dashboard loads
   - Templates page works
   - Document generation functions
   - User management accessible

---

## 🆘 Troubleshooting

### Common Issues

**❌ CORS Error**
```javascript
// In backend/server.js, update CORS:
app.use(cors({
  origin: ['https://your-frontend.onrender.com'],
  credentials: true
}));
```

**❌ API Not Found (404)**
- Verify `vercel.json` routes configuration
- Check if API endpoints start with `/api/`
- Ensure `server.js` is the main entry point

**❌ Build Failed on Render**
- Check Node.js version compatibility
- Verify build command: `npm install && npm run build`
- Ensure `build` directory is published

**❌ Environment Variables Not Working**
- Redeploy after setting environment variables
- Check variable names match exactly
- Verify values don't have extra spaces

### Platform-Specific Notes

**Vercel Backend:**
- Serverless functions have 10-second timeout
- Each API route becomes a serverless function
- Cold starts may cause initial delays

**Render Frontend:**
- Static site hosting with CDN
- Automatic SSL certificates
- Git-based deployments

---

## 🎯 Expected Results

### ✅ Backend (Vercel)
- **URL**: `https://docgen-mongo-backend.vercel.app`
- **Health**: `https://your-url.vercel.app/health`
- **API Docs**: `https://your-url.vercel.app/api-docs`
- **Performance**: Serverless, auto-scaling

### ✅ Frontend (Render)
- **URL**: `https://docgen-mongo-frontend.onrender.com`
- **Features**: All functionality working
- **Performance**: Fast static site with CDN

### ✅ Database (MongoDB Atlas)
- **Status**: Connected and operational
- **Data**: Default users and templates available

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] MongoDB Atlas configured and tested
- [ ] Backend `vercel.json` created
- [ ] Frontend API URL updated
- [ ] Environment variables prepared

### Backend Deployment (Vercel)
- [ ] Project imported from GitHub
- [ ] Environment variables set
- [ ] Deployment successful
- [ ] Health endpoint accessible
- [ ] API endpoints working

### Frontend Deployment (Render)
- [ ] Static site created
- [ ] Build settings configured
- [ ] Environment variables set
- [ ] Deployment successful
- [ ] Application loads correctly

### Post-Deployment
- [ ] CORS configured correctly
- [ ] Authentication working
- [ ] Document generation functional
- [ ] All features tested
- [ ] Performance optimized

---

## 💡 Advantages of This Setup

### Vercel Backend Benefits:
- ✅ **Serverless** - Auto-scaling, pay-per-use
- ✅ **Fast Deployments** - Git-based deployments
- ✅ **Global Edge Network** - Low latency worldwide
- ✅ **Automatic HTTPS** - SSL certificates included
- ✅ **Environment Variables** - Secure configuration

### Render Frontend Benefits:
- ✅ **Static Site Hosting** - Fast and reliable
- ✅ **CDN Included** - Global content delivery
- ✅ **Automatic Builds** - Git-based deployments
- ✅ **Free SSL** - HTTPS certificates included
- ✅ **Custom Domains** - Easy domain configuration

---

## 🎉 Success!

After following these steps, you'll have:

- **Professional Document Generation Platform**
- **Serverless Backend** on Vercel
- **Fast Frontend** on Render
- **Scalable Database** on MongoDB Atlas
- **Global Performance** with CDN
- **Automatic HTTPS** on both platforms
- **Production-Ready** infrastructure

**Your DocGen-Mongo application will be live and accessible worldwide! 🌐✨**

---

## 📞 Support

If you encounter issues:

1. **Check Platform Status**
   - Vercel: https://vercel.com/status
   - Render: https://status.render.com

2. **Review Deployment Logs**
   - Vercel: Project dashboard → Functions → Logs
   - Render: Project dashboard → Logs

3. **Verify Configuration**
   - Environment variables set correctly
   - CORS configuration updated
   - API URLs pointing to correct endpoints

**Happy Deploying! 🚀**
