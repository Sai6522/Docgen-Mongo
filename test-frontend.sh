#!/bin/bash

echo "🎨 FRONTEND FUNCTIONALITY TESTING SCRIPT"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:5000"

echo -e "\n${BLUE}1. Testing Frontend Accessibility${NC}"
echo "================================="

FRONTEND_RESPONSE=$(curl -s "$FRONTEND_URL" 2>/dev/null)
if echo "$FRONTEND_RESPONSE" | grep -q "DocGen-Mongo\|React"; then
    echo -e "${GREEN}✅ Frontend: ACCESSIBLE${NC}"
    echo "Frontend is serving the application"
else
    echo -e "${RED}❌ Frontend: NOT ACCESSIBLE${NC}"
    echo "Frontend is not responding. Please start the frontend server."
    exit 1
fi

echo -e "\n${BLUE}2. Testing Frontend Build Status${NC}"
echo "================================"

# Check if frontend is compiled without errors
if ps aux | grep "react-scripts" | grep -v grep > /dev/null; then
    echo -e "${GREEN}✅ Frontend Process: RUNNING${NC}"
    
    # Check for compilation errors in logs
    if [ -f "/home/sai/DocGen-Mongo/frontend/frontend.log" ]; then
        if grep -q "Compiled successfully\|webpack compiled" "/home/sai/DocGen-Mongo/frontend/frontend.log"; then
            echo -e "${GREEN}✅ Frontend Compilation: SUCCESS${NC}"
        elif grep -q "Failed to compile\|ERROR" "/home/sai/DocGen-Mongo/frontend/frontend.log"; then
            echo -e "${RED}❌ Frontend Compilation: ERRORS FOUND${NC}"
            echo "Recent errors:"
            tail -10 "/home/sai/DocGen-Mongo/frontend/frontend.log" | grep -E "ERROR|Failed"
        else
            echo -e "${YELLOW}⚠️  Frontend Compilation: STATUS UNKNOWN${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Frontend Log: NOT FOUND${NC}"
    fi
else
    echo -e "${RED}❌ Frontend Process: NOT RUNNING${NC}"
fi

echo -e "\n${BLUE}3. Testing API Configuration${NC}"
echo "============================"

# Check if frontend can reach backend
API_TEST=$(curl -s "$FRONTEND_URL/static/js/main.*.js" 2>/dev/null | head -c 1000)
if echo "$API_TEST" | grep -q "localhost:5000\|api"; then
    echo -e "${GREEN}✅ API Configuration: FOUND${NC}"
else
    echo -e "${YELLOW}⚠️  API Configuration: CHECK NEEDED${NC}"
fi

echo -e "\n${BLUE}4. Testing Authentication Flow${NC}"
echo "============================="

# Test if backend authentication works (prerequisite for frontend)
AUTH_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@docgen.com","password":"admin123"}')

TOKEN=$(echo "$AUTH_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$TOKEN" ]; then
    echo -e "${GREEN}✅ Backend Authentication: WORKING${NC}"
    echo "Token generated successfully"
else
    echo -e "${RED}❌ Backend Authentication: FAILED${NC}"
    echo "Frontend login will not work"
fi

echo -e "\n${BLUE}5. Testing Template Creation Endpoint${NC}"
echo "====================================="

if [ ! -z "$TOKEN" ]; then
    # Test template creation endpoint that frontend uses
    TEMPLATE_CREATE_TEST=$(curl -s -X POST "$BACKEND_URL/api/templates" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Frontend Test Template",
            "description": "Test template for frontend",
            "type": "certificate",
            "content": "Test content with {{name}} placeholder",
            "placeholders": [{"name": "name", "description": "Name", "required": true, "type": "text"}],
            "isActive": true
        }')
    
    if echo "$TEMPLATE_CREATE_TEST" | grep -q "successfully\|created\|Template"; then
        echo -e "${GREEN}✅ Template Creation API: WORKING${NC}"
        TEMPLATE_ID=$(echo "$TEMPLATE_CREATE_TEST" | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)
    else
        echo -e "${RED}❌ Template Creation API: FAILED${NC}"
        echo "Response: $TEMPLATE_CREATE_TEST"
    fi
else
    echo -e "${YELLOW}⚠️  Template Creation: SKIPPED (No auth token)${NC}"
fi

echo -e "\n${BLUE}6. Testing Document Generation Endpoint${NC}"
echo "======================================"

if [ ! -z "$TOKEN" ] && [ ! -z "$TEMPLATE_ID" ]; then
    DOC_GEN_TEST=$(curl -s -X POST "$BACKEND_URL/api/docs/generate" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "templateId": "'$TEMPLATE_ID'",
            "recipientName": "Frontend Test User",
            "placeholderValues": {"name": "Frontend Test User"}
        }')
    
    if echo "$DOC_GEN_TEST" | grep -q "successfully\|generated"; then
        echo -e "${GREEN}✅ Document Generation API: WORKING${NC}"
    else
        echo -e "${RED}❌ Document Generation API: FAILED${NC}"
        echo "Response: $DOC_GEN_TEST"
    fi
else
    echo -e "${YELLOW}⚠️  Document Generation: SKIPPED (No auth token or template)${NC}"
fi

echo -e "\n${BLUE}7. Testing Bulk Generation Endpoint${NC}"
echo "=================================="

if [ ! -z "$TOKEN" ] && [ ! -z "$TEMPLATE_ID" ]; then
    # Create test CSV
    CSV_CONTENT="name
Frontend Test 1
Frontend Test 2"
    
    BULK_GEN_TEST=$(curl -s -X POST "$BACKEND_URL/api/docs/bulk-generate" \
        -H "Authorization: Bearer $TOKEN" \
        -F "templateId=$TEMPLATE_ID" \
        -F "csvFile=@-;filename=test.csv;type=text/csv" \
        <<< "$CSV_CONTENT")
    
    if echo "$BULK_GEN_TEST" | grep -q "successfully\|generated\|bulk"; then
        echo -e "${GREEN}✅ Bulk Generation API: WORKING${NC}"
    else
        echo -e "${RED}❌ Bulk Generation API: FAILED${NC}"
        echo "Response: $BULK_GEN_TEST"
    fi
else
    echo -e "${YELLOW}⚠️  Bulk Generation: SKIPPED (No auth token or template)${NC}"
fi

echo -e "\n${BLUE}8. Testing Frontend Routes${NC}"
echo "========================="

# Test if main routes are accessible
ROUTES=("/templates" "/generate" "/bulk-generate" "/documents" "/audit" "/profile")

for route in "${ROUTES[@]}"; do
    ROUTE_TEST=$(curl -s "$FRONTEND_URL$route" 2>/dev/null)
    if echo "$ROUTE_TEST" | grep -q "DocGen-Mongo\|React"; then
        echo -e "${GREEN}✅ Route $route: ACCESSIBLE${NC}"
    else
        echo -e "${RED}❌ Route $route: NOT ACCESSIBLE${NC}"
    fi
done

echo -e "\n${BLUE}9. Checking Frontend JavaScript Errors${NC}"
echo "======================================"

# Check for common JavaScript errors in the built files
if [ -d "/home/sai/DocGen-Mongo/frontend/build" ]; then
    echo -e "${GREEN}✅ Frontend Build: EXISTS${NC}"
    
    # Check for common error patterns in built JS
    if find "/home/sai/DocGen-Mongo/frontend/build" -name "*.js" -exec grep -l "undefined\|null" {} \; > /dev/null; then
        echo -e "${YELLOW}⚠️  JavaScript: Potential null/undefined references found${NC}"
    else
        echo -e "${GREEN}✅ JavaScript: No obvious errors in build${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Frontend Build: NOT FOUND (Development mode)${NC}"
fi

echo -e "\n${BLUE}10. Testing API Integration${NC}"
echo "=========================="

# Test if frontend API calls work
if [ ! -z "$TOKEN" ]; then
    # Test templates API (used by frontend)
    TEMPLATES_API=$(curl -s "$BACKEND_URL/api/templates" -H "Authorization: Bearer $TOKEN")
    if echo "$TEMPLATES_API" | grep -q "templates"; then
        echo -e "${GREEN}✅ Templates API Integration: WORKING${NC}"
    else
        echo -e "${RED}❌ Templates API Integration: FAILED${NC}"
    fi
    
    # Test documents API (used by frontend)
    DOCS_API=$(curl -s "$BACKEND_URL/api/documents" -H "Authorization: Bearer $TOKEN")
    if echo "$DOCS_API" | grep -q "documents"; then
        echo -e "${GREEN}✅ Documents API Integration: WORKING${NC}"
    else
        echo -e "${RED}❌ Documents API Integration: FAILED${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  API Integration: SKIPPED (No auth token)${NC}"
fi

echo -e "\n${BLUE}🎯 FRONTEND TEST SUMMARY${NC}"
echo "========================"
echo -e "${GREEN}✅ Frontend Accessibility${NC}"
echo "📋 Frontend Compilation: Check above results"
echo "📋 Authentication Flow: Check above results"
echo "📋 Template Creation: Check above results"
echo "📋 Document Generation: Check above results"
echo "📋 Bulk Generation: Check above results"
echo "📋 Route Accessibility: Check above results"
echo "📋 API Integration: Check above results"

echo -e "\n${BLUE}🌐 Frontend Status: READY FOR TESTING${NC}"
echo "====================================="

echo -e "\n${BLUE}📋 MANUAL TESTING CHECKLIST${NC}"
echo "============================"
echo "1. Open http://localhost:3000"
echo "2. Login with admin@docgen.com / admin123"
echo "3. Go to Templates page → Click 'New Template'"
echo "4. Fill form and submit → Check if template is created"
echo "5. Go to Generate Document page → Select template and generate"
echo "6. Go to Bulk Generate page → Upload CSV and generate"
echo "7. Check browser console for JavaScript errors"
echo "8. Check network tab for failed API calls"

echo -e "\n${YELLOW}⚠️  If issues persist, check:${NC}"
echo "- Browser console for JavaScript errors"
echo "- Network tab for failed API requests"
echo "- Authentication token in localStorage"
echo "- CORS settings in backend"
