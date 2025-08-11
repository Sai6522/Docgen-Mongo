#!/bin/bash

echo "🧪 BACKEND API TESTING SCRIPT"
echo "============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
BACKEND_URL="http://localhost:5000"
ADMIN_EMAIL="admin@docgen.com"
ADMIN_PASSWORD="admin123"

echo -e "\n${BLUE}1. Testing Backend Health${NC}"
echo "========================="

HEALTH_CHECK=$(curl -s "$BACKEND_URL/health" 2>/dev/null)
if echo "$HEALTH_CHECK" | grep -q "OK"; then
    echo -e "${GREEN}✅ Backend Health: OK${NC}"
else
    echo -e "${RED}❌ Backend Health: FAILED${NC}"
    echo "Backend is not responding. Please start the backend server."
    exit 1
fi

echo -e "\n${BLUE}2. Testing Authentication${NC}"
echo "========================="

AUTH_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

TOKEN=$(echo "$AUTH_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$TOKEN" ]; then
    echo -e "${GREEN}✅ Authentication: SUCCESS${NC}"
    echo "Token: ${TOKEN:0:20}..."
else
    echo -e "${RED}❌ Authentication: FAILED${NC}"
    echo "Response: $AUTH_RESPONSE"
    exit 1
fi

echo -e "\n${BLUE}3. Testing Template Creation${NC}"
echo "============================"

# Test template creation
TEMPLATE_DATA='{
    "name": "Test Backend Template",
    "description": "Template created via backend test",
    "type": "certificate",
    "content": "This is a test template with {{participant_name}} placeholder.",
    "placeholders": [
        {
            "name": "participant_name",
            "description": "Name of the participant",
            "required": true,
            "type": "text"
        }
    ],
    "isActive": true
}'

CREATE_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/templates" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$TEMPLATE_DATA")

if echo "$CREATE_RESPONSE" | grep -q "successfully\|created\|Template"; then
    echo -e "${GREEN}✅ Template Creation: SUCCESS${NC}"
    TEMPLATE_ID=$(echo "$CREATE_RESPONSE" | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)
    echo "Template ID: $TEMPLATE_ID"
else
    echo -e "${RED}❌ Template Creation: FAILED${NC}"
    echo "Response: $CREATE_RESPONSE"
fi

echo -e "\n${BLUE}4. Testing Template Retrieval${NC}"
echo "============================="

TEMPLATES_RESPONSE=$(curl -s "$BACKEND_URL/api/templates" \
    -H "Authorization: Bearer $TOKEN")

if echo "$TEMPLATES_RESPONSE" | grep -q "templates"; then
    echo -e "${GREEN}✅ Template Retrieval: SUCCESS${NC}"
    TEMPLATE_COUNT=$(echo "$TEMPLATES_RESPONSE" | grep -o '"_id"' | wc -l)
    echo "Templates found: $TEMPLATE_COUNT"
    
    # Get first template ID for document generation test
    if [ -z "$TEMPLATE_ID" ]; then
        TEMPLATE_ID=$(echo "$TEMPLATES_RESPONSE" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
    fi
else
    echo -e "${RED}❌ Template Retrieval: FAILED${NC}"
    echo "Response: $TEMPLATES_RESPONSE"
fi

echo -e "\n${BLUE}5. Testing Document Generation${NC}"
echo "=============================="

if [ ! -z "$TEMPLATE_ID" ]; then
    DOC_DATA="{
        \"templateId\": \"$TEMPLATE_ID\",
        \"recipientName\": \"Backend Test User\",
        \"placeholderValues\": {
            \"participant_name\": \"Backend Test User\"
        }
    }"
    
    DOC_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/docs/generate" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "$DOC_DATA")
    
    if echo "$DOC_RESPONSE" | grep -q "successfully\|generated\|document"; then
        echo -e "${GREEN}✅ Document Generation: SUCCESS${NC}"
        DOC_ID=$(echo "$DOC_RESPONSE" | grep -o '"documentId":"[^"]*"' | cut -d'"' -f4)
        echo "Document ID: $DOC_ID"
    else
        echo -e "${RED}❌ Document Generation: FAILED${NC}"
        echo "Response: $DOC_RESPONSE"
    fi
else
    echo -e "${YELLOW}⚠️  Document Generation: SKIPPED (No template ID)${NC}"
fi

echo -e "\n${BLUE}6. Testing Bulk Generation${NC}"
echo "=========================="

# Create test CSV content
CSV_CONTENT="participant_name
John Doe Backend Test
Jane Smith Backend Test
Bob Johnson Backend Test"

# Test bulk generation
if [ ! -z "$TEMPLATE_ID" ]; then
    BULK_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/docs/bulk-generate" \
        -H "Authorization: Bearer $TOKEN" \
        -F "templateId=$TEMPLATE_ID" \
        -F "csvFile=@-;filename=test.csv;type=text/csv" \
        <<< "$CSV_CONTENT")
    
    if echo "$BULK_RESPONSE" | grep -q "successfully\|generated\|bulk"; then
        echo -e "${GREEN}✅ Bulk Generation: SUCCESS${NC}"
        BULK_COUNT=$(echo "$BULK_RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
        echo "Documents generated: $BULK_COUNT"
    else
        echo -e "${RED}❌ Bulk Generation: FAILED${NC}"
        echo "Response: $BULK_RESPONSE"
    fi
else
    echo -e "${YELLOW}⚠️  Bulk Generation: SKIPPED (No template ID)${NC}"
fi

echo -e "\n${BLUE}7. Testing Documents Retrieval${NC}"
echo "=============================="

DOCS_RESPONSE=$(curl -s "$BACKEND_URL/api/documents" \
    -H "Authorization: Bearer $TOKEN")

if echo "$DOCS_RESPONSE" | grep -q "documents"; then
    echo -e "${GREEN}✅ Documents Retrieval: SUCCESS${NC}"
    DOC_COUNT=$(echo "$DOCS_RESPONSE" | grep -o '"_id"' | wc -l)
    echo "Documents found: $DOC_COUNT"
else
    echo -e "${RED}❌ Documents Retrieval: FAILED${NC}"
    echo "Response: $DOCS_RESPONSE"
fi

echo -e "\n${BLUE}8. Testing Audit Logs${NC}"
echo "===================="

AUDIT_RESPONSE=$(curl -s "$BACKEND_URL/api/audit" \
    -H "Authorization: Bearer $TOKEN")

if echo "$AUDIT_RESPONSE" | grep -q "auditLogs"; then
    echo -e "${GREEN}✅ Audit Logs: SUCCESS${NC}"
    AUDIT_COUNT=$(echo "$AUDIT_RESPONSE" | grep -o '"_id"' | wc -l)
    echo "Audit entries found: $AUDIT_COUNT"
else
    echo -e "${RED}❌ Audit Logs: FAILED${NC}"
    echo "Response: $AUDIT_RESPONSE"
fi

echo -e "\n${BLUE}9. Testing Profile Update${NC}"
echo "========================"

PROFILE_DATA='{
    "name": "Backend Test Admin",
    "email": "admin@docgen.com"
}'

PROFILE_RESPONSE=$(curl -s -X PUT "$BACKEND_URL/api/auth/profile" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$PROFILE_DATA")

if echo "$PROFILE_RESPONSE" | grep -q "successfully\|updated"; then
    echo -e "${GREEN}✅ Profile Update: SUCCESS${NC}"
else
    echo -e "${RED}❌ Profile Update: FAILED${NC}"
    echo "Response: $PROFILE_RESPONSE"
fi

echo -e "\n${BLUE}🎯 BACKEND TEST SUMMARY${NC}"
echo "======================="
echo -e "${GREEN}✅ Backend Health Check${NC}"
echo -e "${GREEN}✅ Authentication${NC}"
echo "📋 Template Creation: Check above results"
echo "📋 Document Generation: Check above results"
echo "📋 Bulk Generation: Check above results"
echo "📋 Data Retrieval: Check above results"
echo "📋 Profile Management: Check above results"

echo -e "\n${BLUE}🌐 Backend API Status: READY${NC}"
echo "=============================="
