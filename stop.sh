#!/bin/bash

# DocGen-Mongo Project Stop Script
# This script stops both frontend and backend servers

echo "🛑 Stopping DocGen-Mongo Application"
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

# Check current running processes
echo -e "\n${BLUE}1. Checking running processes${NC}"

BACKEND_PROCS=$(ps aux | grep "working-server" | grep -v grep | wc -l)
FRONTEND_PROCS=$(ps aux | grep "react-scripts" | grep -v grep | wc -l)

echo "Backend processes: $BACKEND_PROCS"
echo "Frontend processes: $FRONTEND_PROCS"

# Stop Backend Server
echo -e "\n${BLUE}2. Stopping Backend Server${NC}"
if [ $BACKEND_PROCS -gt 0 ]; then
    print_info "Stopping backend processes..."
    pkill -f "working-server"
    sleep 3
    
    # Check if stopped
    if ps aux | grep "working-server" | grep -v grep > /dev/null; then
        print_warning "Some backend processes still running, force killing..."
        pkill -9 -f "working-server"
        sleep 2
    fi
    
    if ps aux | grep "working-server" | grep -v grep > /dev/null; then
        print_error "Failed to stop all backend processes"
    else
        print_status "Backend server stopped successfully"
    fi
else
    print_info "No backend processes to stop"
fi

# Stop Frontend Server
echo -e "\n${BLUE}3. Stopping Frontend Server${NC}"
if [ $FRONTEND_PROCS -gt 0 ]; then
    print_info "Stopping frontend processes..."
    pkill -f "react-scripts"
    pkill -f "npm.*start"
    sleep 3
    
    # Check if stopped
    if ps aux | grep -E "(react-scripts|npm.*start)" | grep -v grep > /dev/null; then
        print_warning "Some frontend processes still running, force killing..."
        pkill -9 -f "react-scripts"
        pkill -9 -f "npm.*start"
        sleep 2
    fi
    
    if ps aux | grep -E "(react-scripts|npm.*start)" | grep -v grep > /dev/null; then
        print_error "Failed to stop all frontend processes"
    else
        print_status "Frontend server stopped successfully"
    fi
else
    print_info "No frontend processes to stop"
fi

# Free up ports
echo -e "\n${BLUE}4. Freeing up ports${NC}"

# Kill any processes using port 5000
PORT_5000_PIDS=$(lsof -ti:5000 2>/dev/null)
if [ ! -z "$PORT_5000_PIDS" ]; then
    print_info "Freeing port 5000..."
    echo $PORT_5000_PIDS | xargs kill -9 2>/dev/null
    print_status "Port 5000 freed"
else
    print_info "Port 5000 is already free"
fi

# Kill any processes using port 3000
PORT_3000_PIDS=$(lsof -ti:3000 2>/dev/null)
if [ ! -z "$PORT_3000_PIDS" ]; then
    print_info "Freeing port 3000..."
    echo $PORT_3000_PIDS | xargs kill -9 2>/dev/null
    print_status "Port 3000 freed"
else
    print_info "Port 3000 is already free"
fi

# Final verification
echo -e "\n${BLUE}5. Final verification${NC}"
sleep 2

FINAL_BACKEND=$(ps aux | grep "working-server" | grep -v grep | wc -l)
FINAL_FRONTEND=$(ps aux | grep -E "(react-scripts|npm.*start)" | grep -v grep | wc -l)
PORT_5000_STATUS=$(netstat -tlnp 2>/dev/null | grep :5000 | wc -l)
PORT_3000_STATUS=$(netstat -tlnp 2>/dev/null | grep :3000 | wc -l)

echo "Backend processes: $FINAL_BACKEND"
echo "Frontend processes: $FINAL_FRONTEND"
echo "Port 5000 listeners: $PORT_5000_STATUS"
echo "Port 3000 listeners: $PORT_3000_STATUS"

# Summary
echo -e "\n${GREEN}🎯 Stop Operation Complete!${NC}"
echo "============================"

if [ $FINAL_BACKEND -eq 0 ] && [ $FINAL_FRONTEND -eq 0 ]; then
    print_status "All DocGen-Mongo processes stopped successfully"
    print_status "Ports 3000 and 5000 are now free"
    print_status "Application is completely stopped"
else
    print_warning "Some processes may still be running"
    echo "You can check with: ps aux | grep -E '(working-server|react-scripts)'"
fi

echo -e "\n${BLUE}📋 Log Files (preserved):${NC}"
echo "Backend Log: ./backend/backend.log"
echo "Frontend Log: ./frontend/frontend.log"

echo -e "\n${BLUE}🚀 To Start Again:${NC}"
echo "Run: ./start.sh"

echo -e "\n${GREEN}✨ DocGen-Mongo application stopped!${NC}"
