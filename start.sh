#!/bin/bash

# DocGen-Mongo Project Startup Script
# This script starts both frontend and backend servers

echo "🚀 Starting DocGen-Mongo Application"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if MongoDB is running
echo -e "\n${BLUE}1. Checking MongoDB Status${NC}"
if pgrep mongod > /dev/null; then
    print_status "MongoDB is running"
else
    print_warning "MongoDB is not running, attempting to start..."
    sudo systemctl start mongod 2>/dev/null || sudo systemctl start mongodb 2>/dev/null
    sleep 3
    if pgrep mongod > /dev/null; then
        print_status "MongoDB started successfully"
    else
        print_error "Failed to start MongoDB. Please start it manually."
        exit 1
    fi
fi

# Kill any existing processes
echo -e "\n${BLUE}2. Cleaning up existing processes${NC}"
pkill -f "working-server" 2>/dev/null && print_info "Stopped existing backend processes"
pkill -f "react-scripts" 2>/dev/null && print_info "Stopped existing frontend processes"
pkill -f "npm.*start" 2>/dev/null

# Kill processes using ports 3000 and 5000
lsof -ti:5000 2>/dev/null | xargs kill -9 2>/dev/null
lsof -ti:3000 2>/dev/null | xargs kill -9 2>/dev/null

sleep 3

# Start Backend Server
echo -e "\n${BLUE}3. Starting Backend Server (Port 5000)${NC}"
cd backend

if [ ! -f ".env" ]; then
    print_error ".env file not found in backend directory"
    exit 1
fi

if [ ! -f "working-server.js" ]; then
    print_error "working-server.js not found in backend directory"
    exit 1
fi

# Start backend in background
nohup node working-server.js > backend.log 2>&1 &
BACKEND_PID=$!

print_info "Backend starting with PID: $BACKEND_PID"
sleep 8

# Check if backend started successfully
if ps -p $BACKEND_PID > /dev/null 2>&1; then
    print_status "Backend server started successfully"
    
    # Test backend health
    if curl -s http://localhost:5000/health > /dev/null; then
        print_status "Backend health check passed"
    else
        print_warning "Backend health check failed, but process is running"
    fi
else
    print_error "Backend server failed to start"
    exit 1
fi

# Start Frontend Server
echo -e "\n${BLUE}4. Starting Frontend Server (Port 3000)${NC}"
cd ../frontend

if [ ! -f "package.json" ]; then
    print_error "package.json not found in frontend directory"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "node_modules not found, installing dependencies..."
    npm install
fi

# Start frontend in background
BROWSER=none nohup npm start > frontend.log 2>&1 &
FRONTEND_PID=$!

print_info "Frontend starting with PID: $FRONTEND_PID"
print_info "Waiting for frontend to compile (this may take a moment)..."
sleep 20

# Check if frontend started successfully
if ps aux | grep "react-scripts" | grep -v grep > /dev/null; then
    print_status "Frontend server started successfully"
    
    # Test frontend response
    if curl -s http://localhost:3000 | grep -q "DocGen-Mongo"; then
        print_status "Frontend is serving the application"
    else
        print_warning "Frontend is still compiling, please wait..."
    fi
else
    print_error "Frontend server failed to start"
fi

# Final Status Report
echo -e "\n${GREEN}🎉 DocGen-Mongo Application Started!${NC}"
echo "====================================="

echo -e "\n${BLUE}📊 Server Status:${NC}"
echo "Backend:  $(ps aux | grep 'working-server' | grep -v grep | wc -l) process(es) running"
echo "Frontend: $(ps aux | grep 'react-scripts' | grep -v grep | wc -l) process(es) running"

echo -e "\n${BLUE}🌐 Access URLs:${NC}"
echo "Frontend Application: http://localhost:3000"
echo "Backend API:         http://localhost:5000"
echo "Health Check:        http://localhost:5000/health"

echo -e "\n${BLUE}🔐 Login Credentials:${NC}"
echo "Admin: admin@docgen.com / admin123"
echo "HR:    hr@docgen.com / hr123456"
echo "Staff: staff@docgen.com / staff123456"

echo -e "\n${BLUE}📋 Log Files:${NC}"
echo "Backend Log: $(pwd)/../backend/backend.log"
echo "Frontend Log: $(pwd)/frontend.log"

echo -e "\n${BLUE}🛑 To Stop Servers:${NC}"
echo "Run: ./stop.sh"
echo "Or manually: pkill -f 'working-server' && pkill -f 'react-scripts'"

echo -e "\n${GREEN}✨ Application is ready for use!${NC}"
echo "Open http://localhost:3000 in your browser to get started."
