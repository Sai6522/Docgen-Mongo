#!/bin/bash

# DocGen-Mongo Development Mode Script
# This script starts the application in development mode with live reloading

echo "🔧 Starting DocGen-Mongo in Development Mode"
echo "============================================="

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
echo -e "\n${BLUE}1. Checking MongoDB${NC}"
if pgrep mongod > /dev/null; then
    print_status "MongoDB is running"
else
    print_warning "Starting MongoDB..."
    sudo systemctl start mongod 2>/dev/null || sudo systemctl start mongodb 2>/dev/null
    sleep 3
    if pgrep mongod > /dev/null; then
        print_status "MongoDB started"
    else
        print_error "Failed to start MongoDB"
        exit 1
    fi
fi

# Clean up existing processes
echo -e "\n${BLUE}2. Cleaning up existing processes${NC}"
pkill -f "working-server" 2>/dev/null
pkill -f "react-scripts" 2>/dev/null
pkill -f "nodemon" 2>/dev/null
lsof -ti:5000 2>/dev/null | xargs kill -9 2>/dev/null
lsof -ti:3000 2>/dev/null | xargs kill -9 2>/dev/null
sleep 3

# Check if nodemon is installed
echo -e "\n${BLUE}3. Checking development dependencies${NC}"
cd backend

if ! command -v nodemon &> /dev/null; then
    print_warning "nodemon not found, installing globally..."
    npm install -g nodemon
fi

# Start Backend in Development Mode
echo -e "\n${BLUE}4. Starting Backend in Development Mode${NC}"
print_info "Backend will restart automatically on file changes"

# Start backend with nodemon for auto-restart
nodemon working-server.js &
BACKEND_PID=$!

print_info "Backend starting with nodemon (PID: $BACKEND_PID)"
sleep 8

if ps -p $BACKEND_PID > /dev/null 2>&1; then
    print_status "Backend development server started"
else
    print_error "Backend failed to start"
    exit 1
fi

# Start Frontend in Development Mode
echo -e "\n${BLUE}5. Starting Frontend in Development Mode${NC}"
cd ../frontend

print_info "Frontend will reload automatically on file changes"
print_info "Starting React development server..."

# Start frontend (it already has hot reloading built-in)
BROWSER=none npm start &
FRONTEND_PID=$!

print_info "Frontend starting (PID: $FRONTEND_PID)"
sleep 15

if ps aux | grep "react-scripts" | grep -v grep > /dev/null; then
    print_status "Frontend development server started"
else
    print_warning "Frontend may still be starting..."
fi

# Development Information
echo -e "\n${GREEN}🔧 Development Mode Active!${NC}"
echo "============================"

echo -e "\n${BLUE}📊 Development Features:${NC}"
echo "✅ Backend: Auto-restart on file changes (nodemon)"
echo "✅ Frontend: Hot reloading on file changes"
echo "✅ Source maps: Enabled for debugging"
echo "✅ Error overlay: Enabled in browser"

echo -e "\n${BLUE}🌐 Development URLs:${NC}"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:5000"
echo "Health:   http://localhost:5000/health"

echo -e "\n${BLUE}📁 Project Structure:${NC}"
echo "Backend:  ./backend/ (Node.js/Express)"
echo "Frontend: ./frontend/ (React)"
echo "Database: MongoDB (localhost:27017)"

echo -e "\n${BLUE}🔐 Test Credentials:${NC}"
echo "Admin: admin@docgen.com / admin123"
echo "HR:    hr@docgen.com / hr123456"
echo "Staff: staff@docgen.com / staff123456"

echo -e "\n${BLUE}📋 Development Commands:${NC}"
echo "Backend logs:  tail -f backend/backend.log"
echo "Frontend logs: tail -f frontend/frontend.log"
echo "Stop servers:  ./stop.sh"
echo "Check status:  ./status.sh"

echo -e "\n${BLUE}🛠️  Development Tips:${NC}"
echo "• Edit backend files in ./backend/ - server will auto-restart"
echo "• Edit frontend files in ./frontend/src/ - browser will auto-reload"
echo "• Check browser console for frontend errors"
echo "• Check terminal for backend errors"
echo "• Use browser dev tools for debugging"

echo -e "\n${GREEN}✨ Happy Coding!${NC}"
echo "================"
echo "Your DocGen-Mongo development environment is ready!"
echo "Open http://localhost:3000 to see your application."

# Keep script running to show logs
echo -e "\n${BLUE}📊 Live Status (Press Ctrl+C to exit):${NC}"
echo "======================================"

# Function to show live status
show_live_status() {
    while true; do
        sleep 10
        BACKEND_STATUS=$(ps aux | grep "nodemon\|working-server" | grep -v grep | wc -l)
        FRONTEND_STATUS=$(ps aux | grep "react-scripts" | grep -v grep | wc -l)
        
        echo -e "\r${BLUE}[$(date '+%H:%M:%S')] Backend: $BACKEND_STATUS | Frontend: $FRONTEND_STATUS${NC}"
    done
}

# Trap Ctrl+C to clean exit
trap 'echo -e "\n\n${YELLOW}Development mode stopped. Servers are still running.${NC}"; echo "Use ./stop.sh to stop all servers."; exit 0' INT

# Show live status
show_live_status
