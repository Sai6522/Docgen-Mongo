#!/bin/bash

# DocGen-Mongo Project Status Script
# This script checks the status of all components

echo "📊 DocGen-Mongo Application Status"
echo "=================================="

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

# Check MongoDB Status
echo -e "\n${BLUE}1. MongoDB Database${NC}"
if pgrep mongod > /dev/null; then
    print_status "MongoDB is running"
    echo "   PID: $(pgrep mongod)"
    if netstat -tlnp 2>/dev/null | grep :27017 > /dev/null; then
        print_status "MongoDB port 27017 is listening"
    else
        print_warning "MongoDB port 27017 not found"
    fi
else
    print_error "MongoDB is not running"
fi

# Check Backend Status
echo -e "\n${BLUE}2. Backend Server (Port 5000)${NC}"
BACKEND_PROCS=$(ps aux | grep "working-server" | grep -v grep)
if [ ! -z "$BACKEND_PROCS" ]; then
    print_status "Backend server is running"
    echo "$BACKEND_PROCS" | while read line; do
        PID=$(echo $line | awk '{print $2}')
        echo "   PID: $PID"
    done
    
    # Test backend health
    if curl -s http://localhost:5000/health > /dev/null 2>&1; then
        HEALTH_STATUS=$(curl -s http://localhost:5000/health | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
        print_status "Backend health: $HEALTH_STATUS"
    else
        print_warning "Backend health check failed"
    fi
    
    # Check port
    if netstat -tlnp 2>/dev/null | grep :5000 > /dev/null; then
        print_status "Backend port 5000 is listening"
    else
        print_warning "Backend port 5000 not found"
    fi
else
    print_error "Backend server is not running"
fi

# Check Frontend Status
echo -e "\n${BLUE}3. Frontend Server (Port 3000)${NC}"
FRONTEND_PROCS=$(ps aux | grep "react-scripts" | grep -v grep)
if [ ! -z "$FRONTEND_PROCS" ]; then
    print_status "Frontend server is running"
    echo "$FRONTEND_PROCS" | while read line; do
        PID=$(echo $line | awk '{print $2}')
        echo "   PID: $PID"
    done
    
    # Test frontend response
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        if curl -s http://localhost:3000 | grep -q "DocGen-Mongo"; then
            print_status "Frontend is serving the application"
        else
            print_warning "Frontend is responding but may still be compiling"
        fi
    else
        print_warning "Frontend is not responding"
    fi
    
    # Check port
    if netstat -tlnp 2>/dev/null | grep :3000 > /dev/null; then
        print_status "Frontend port 3000 is listening"
    else
        print_warning "Frontend port 3000 not found"
    fi
else
    print_error "Frontend server is not running"
fi

# Check Authentication
echo -e "\n${BLUE}4. Authentication System${NC}"
if curl -s http://localhost:5000/health > /dev/null 2>&1; then
    AUTH_TEST=$(curl -s -X POST http://localhost:5000/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"admin@docgen.com","password":"admin123"}' 2>/dev/null)
    
    if echo "$AUTH_TEST" | grep -q '"token"'; then
        print_status "Authentication system is working"
        print_status "JWT tokens are being generated"
    else
        print_warning "Authentication system may have issues"
    fi
else
    print_error "Cannot test authentication - backend not responding"
fi

# Check Email Configuration
echo -e "\n${BLUE}5. Email Configuration${NC}"
if [ -f "backend/.env" ]; then
    EMAIL_USER=$(grep "EMAIL_USER" backend/.env | cut -d'=' -f2)
    if [ ! -z "$EMAIL_USER" ]; then
        print_status "Email configuration found: $EMAIL_USER"
    else
        print_warning "Email user not configured"
    fi
    
    EMAIL_PASS=$(grep "EMAIL_PASS" backend/.env | cut -d'=' -f2)
    if [ ! -z "$EMAIL_PASS" ]; then
        print_status "Email password configured"
    else
        print_warning "Email password not configured"
    fi
else
    print_error "Backend .env file not found"
fi

# Port Summary
echo -e "\n${BLUE}6. Port Summary${NC}"
echo "Port 27017 (MongoDB): $(netstat -tlnp 2>/dev/null | grep :27017 | wc -l) listener(s)"
echo "Port 5000 (Backend):  $(netstat -tlnp 2>/dev/null | grep :5000 | wc -l) listener(s)"
echo "Port 3000 (Frontend): $(netstat -tlnp 2>/dev/null | grep :3000 | wc -l) listener(s)"

# Log Files
echo -e "\n${BLUE}7. Log Files${NC}"
if [ -f "backend/backend.log" ]; then
    BACKEND_LOG_SIZE=$(du -h backend/backend.log | cut -f1)
    print_info "Backend log: backend/backend.log ($BACKEND_LOG_SIZE)"
else
    print_warning "Backend log file not found"
fi

if [ -f "frontend/frontend.log" ]; then
    FRONTEND_LOG_SIZE=$(du -h frontend/frontend.log | cut -f1)
    print_info "Frontend log: frontend/frontend.log ($FRONTEND_LOG_SIZE)"
else
    print_warning "Frontend log file not found"
fi

# Overall Status
echo -e "\n${GREEN}🎯 Overall Status${NC}"
echo "================="

MONGODB_OK=$(pgrep mongod > /dev/null && echo "1" || echo "0")
BACKEND_OK=$(ps aux | grep "working-server" | grep -v grep > /dev/null && echo "1" || echo "0")
FRONTEND_OK=$(ps aux | grep "react-scripts" | grep -v grep > /dev/null && echo "1" || echo "0")

if [ "$MONGODB_OK" = "1" ] && [ "$BACKEND_OK" = "1" ] && [ "$FRONTEND_OK" = "1" ]; then
    print_status "All systems operational!"
    echo -e "\n${GREEN}🌐 Access Your Application:${NC}"
    echo "Frontend: http://localhost:3000"
    echo "Backend:  http://localhost:5000"
elif [ "$BACKEND_OK" = "1" ] || [ "$FRONTEND_OK" = "1" ]; then
    print_warning "Partial system operational"
    echo "Some components may need attention"
else
    print_error "System is not running"
    echo "Run ./start.sh to start the application"
fi

echo -e "\n${BLUE}📋 Available Commands:${NC}"
echo "./start.sh  - Start the application"
echo "./stop.sh   - Stop the application"
echo "./status.sh - Check application status"
