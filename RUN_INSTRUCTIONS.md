# DocGen-Mongo - Shell Script Usage Guide

This guide explains how to run the DocGen-Mongo project using the provided shell scripts.

## 📋 Available Scripts

### 🚀 `start.sh` - Start the Application
Starts both frontend and backend servers in production mode.

```bash
./start.sh
```

**What it does:**
- ✅ Checks and starts MongoDB if needed
- ✅ Cleans up any existing processes
- ✅ Starts backend server (Port 5000)
- ✅ Starts frontend server (Port 3000)
- ✅ Performs health checks
- ✅ Shows access URLs and credentials

### 🛑 `stop.sh` - Stop the Application
Stops all running servers and frees up ports.

```bash
./stop.sh
```

**What it does:**
- ✅ Stops backend server processes
- ✅ Stops frontend server processes
- ✅ Frees up ports 3000 and 5000
- ✅ Verifies all processes are stopped

### 📊 `status.sh` - Check Application Status
Shows detailed status of all components.

```bash
./status.sh
```

**What it shows:**
- ✅ MongoDB status
- ✅ Backend server status
- ✅ Frontend server status
- ✅ Authentication system status
- ✅ Email configuration status
- ✅ Port usage summary
- ✅ Log file information

### 🔧 `dev.sh` - Development Mode
Starts the application in development mode with auto-reload.

```bash
./dev.sh
```

**Development features:**
- ✅ Backend auto-restart on file changes (nodemon)
- ✅ Frontend hot reloading
- ✅ Source maps for debugging
- ✅ Error overlay in browser
- ✅ Live status monitoring

## 🎯 Quick Start Guide

### 1. First Time Setup
```bash
# Make scripts executable
chmod +x *.sh

# Start the application
./start.sh
```

### 2. Daily Usage
```bash
# Start application
./start.sh

# Check if everything is running
./status.sh

# Stop when done
./stop.sh
```

### 3. Development Work
```bash
# Start in development mode
./dev.sh

# Work on your code (auto-reload enabled)
# Press Ctrl+C to exit monitoring

# Stop servers when done
./stop.sh
```

## 🌐 Access Information

Once started, access your application at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 🔐 Login Credentials

| Role  | Email                | Password   |
|-------|---------------------|------------|
| Admin | admin@docgen.com    | admin123   |
| HR    | hr@docgen.com       | hr123456   |
| Staff | staff@docgen.com    | staff123456|

## 📋 Prerequisites

Before running the scripts, ensure you have:

- ✅ **Node.js** (v14 or higher)
- ✅ **npm** (comes with Node.js)
- ✅ **MongoDB** (installed and configured)
- ✅ **Git** (for cloning the repository)

### Installing Prerequisites (Ubuntu/Debian)

```bash
# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Permission Denied
```bash
chmod +x *.sh
```

#### 2. MongoDB Not Running
```bash
sudo systemctl start mongod
# or
sudo systemctl start mongodb
```

#### 3. Port Already in Use
```bash
./stop.sh  # Stop all processes
./start.sh # Start fresh
```

#### 4. Frontend Not Compiling
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
cd ..
./start.sh
```

#### 5. Backend Database Connection Error
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Check the .env file
cat backend/.env
```

## 📊 Monitoring and Logs

### View Live Logs
```bash
# Backend logs
tail -f backend/backend.log

# Frontend logs
tail -f frontend/frontend.log

# Both logs simultaneously
tail -f backend/backend.log frontend/frontend.log
```

### Check Process Status
```bash
# Check all processes
./status.sh

# Check specific processes
ps aux | grep -E "(working-server|react-scripts)"

# Check ports
netstat -tlnp | grep -E ":(3000|5000)"
```

## 🚀 Production Deployment

For production deployment, consider:

1. **Environment Variables**: Update `.env` files for production
2. **Build Frontend**: Run `npm run build` in frontend directory
3. **Process Manager**: Use PM2 or similar for process management
4. **Reverse Proxy**: Use Nginx or Apache for production serving
5. **SSL Certificate**: Enable HTTPS for production use

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Run `./status.sh` to diagnose problems
3. Check log files for error messages
4. Ensure all prerequisites are installed
5. Verify MongoDB is running and accessible

## ✨ Features Available

Once running, you can use:

- ✅ **User Management** (Admin only)
- ✅ **Template Management** (Create, Edit, Delete)
- ✅ **Document Generation** (Single and Bulk)
- ✅ **Email Integration** (Send documents via email)
- ✅ **Audit Logs** (Admin and HR)
- ✅ **Role-based Access Control**
- ✅ **Dashboard with Statistics**

---

**Happy coding with DocGen-Mongo! 🎉**
