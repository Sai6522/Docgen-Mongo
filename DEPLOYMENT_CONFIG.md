# 🚀 DocGen-Mongo Deployment Configuration

## 🗄️ Database Configuration (READY)

Your MongoDB Atlas cluster is configured and ready for deployment:

### ✅ Connection Details
- **Cluster**: cluster0.kx342cg.mongodb.net
- **Username**: Gendoc-Mongo
- **Database**: docgen_mongo
- **Status**: ✅ Connection tested successfully
- **Data**: ✅ Seeded with default users and templates

### 🔐 Environment Variables for Deployment

#### For Railway (Backend):
```bash
MONGODB_URI=mongodb+srv://Gendoc-Mongo:Sai65227239%24@cluster0.kx342cg.mongodb.net/docgen_mongo?retryWrites=true&w=majority
JWT_SECRET=docgen-mongo-super-secret-jwt-key-2024-production-ready-min-32-chars
NODE_ENV=production
PORT=5000
```

#### For Vercel (Frontend):
```bash
REACT_APP_API_URL=https://your-railway-backend-url.railway.app
```

## 🚀 Ready to Deploy Commands

### Option 1: Full Automated Deployment
```bash
./deploy-full.sh
```

### Option 2: Step-by-Step Deployment

#### Deploy Backend to Railway:
```bash
./deploy-railway.sh
```
Then set these environment variables in Railway dashboard:
- `MONGODB_URI`: `mongodb+srv://Gendoc-Mongo:Sai65227239%24@cluster0.kx342cg.mongodb.net/docgen_mongo?retryWrites=true&w=majority`
- `JWT_SECRET`: `docgen-mongo-super-secret-jwt-key-2024-production-ready-min-32-chars`
- `NODE_ENV`: `production`

#### Deploy Frontend to Vercel:
```bash
./deploy-vercel.sh
```
Then set this environment variable in Vercel dashboard:
- `REACT_APP_API_URL`: `https://your-railway-backend-url.railway.app`

## 👥 Default Users (Already Created)

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **👑 Admin** | admin@docgen.com | admin123 | Full system access |
| **👔 HR** | hr@docgen.com | hr123 | Templates, documents, bulk ops, audit |
| **👤 Staff** | staff@docgen.com | staff123 | Basic document generation |

## 📋 Sample Templates (Already Created)

✅ **Job Offer Letter** - Complete offer letter template
✅ **Appointment Letter** - Official appointment letter template  
✅ **Experience Certificate** - Employee experience certificate template
✅ **Training Certificate** - Training completion certificate template

## 🔍 Connection String Notes

⚠️ **Important**: Your password contains a special character (`$`) which has been URL-encoded to `%24` in the connection string.

- **Original Password**: `Sai65227239$`
- **URL-Encoded**: `Sai65227239%24`
- **Why**: MongoDB connection strings require URL encoding for special characters

## ✅ Pre-Deployment Checklist

- [x] MongoDB Atlas cluster created
- [x] Database user configured
- [x] IP whitelist configured (0.0.0.0/0)
- [x] Connection string tested
- [x] Database seeded with default data
- [x] Environment variables prepared
- [x] Deployment scripts ready

## 🎯 Next Steps

1. **Deploy Backend**: Run `./deploy-railway.sh`
2. **Set Environment Variables**: Add the MongoDB URI and JWT secret to Railway
3. **Deploy Frontend**: Run `./deploy-vercel.sh`
4. **Set API URL**: Add the Railway backend URL to Vercel
5. **Test Application**: Verify all functionality works

## 🌐 Expected URLs After Deployment

- **Frontend**: `https://docgen-mongo-[random].vercel.app`
- **Backend**: `https://docgen-mongo-[random].railway.app`
- **Database**: `cluster0.kx342cg.mongodb.net` (already configured)

## 🆘 Troubleshooting

If you encounter connection issues:

1. **Check IP Whitelist**: Ensure `0.0.0.0/0` is whitelisted in MongoDB Atlas
2. **Verify Credentials**: Username `Gendoc-Mongo` and password are correct
3. **URL Encoding**: Ensure `$` is encoded as `%24` in connection strings
4. **Network Access**: Check if your network allows MongoDB connections

---

**Your DocGen-Mongo application is ready for deployment! 🚀**
