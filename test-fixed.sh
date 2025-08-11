#!/bin/bash

echo "🔧 COMPREHENSIVE BACKEND TESTING WITH PROPER JSON"
echo "================================================="

BACKEND_URL="http://localhost:5000"

# Test authentication
echo "🔐 Testing Authentication..."
AUTH_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@docgen.com","password":"admin123"}')

TOKEN=$(echo "$AUTH_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$TOKEN" ]; then
  echo "✅ Authentication: SUCCESS"
  
  # Test template creation with proper JSON
  echo -e "\n📝 Testing Template Creation..."
  
  # Create a temporary JSON file to avoid shell escaping issues
  cat > /tmp/template.json << 'EOF'
{
  "name": "Fixed Test Template",
  "description": "Template with proper JSON formatting",
  "type": "certificate",
  "content": "Certificate awarded to {{participant_name}}",
  "placeholders": [
    {
      "name": "participant_name",
      "description": "Name of participant",
      "required": true,
      "type": "text"
    }
  ],
  "isActive": true
}
EOF

  TEMPLATE_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/templates" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d @/tmp/template.json)
  
  if echo "$TEMPLATE_RESPONSE" | grep -q "successfully\|created"; then
    echo "✅ Template Creation: SUCCESS"
    TEMPLATE_ID=$(echo "$TEMPLATE_RESPONSE" | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)
    echo "Template ID: $TEMPLATE_ID"
    
    # Test document generation with proper JSON
    echo -e "\n📄 Testing Document Generation..."
    
    cat > /tmp/document.json << EOF
{
  "templateId": "$TEMPLATE_ID",
  "recipientName": "Test User",
  "placeholderValues": {
    "participant_name": "Test User"
  }
}
EOF

    DOC_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/docs/generate" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d @/tmp/document.json)
    
    if echo "$DOC_RESPONSE" | grep -q "successfully\|generated"; then
      echo "✅ Document Generation: SUCCESS"
    else
      echo "❌ Document Generation: FAILED"
      echo "Response: $(echo "$DOC_RESPONSE" | head -c 300)"
    fi
    
    # Test bulk generation
    echo -e "\n📋 Testing Bulk Generation..."
    
    # Create CSV file
    cat > /tmp/test.csv << 'EOF'
participant_name
John Doe
Jane Smith
Bob Johnson
EOF

    BULK_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/docs/bulk-generate" \
      -H "Authorization: Bearer $TOKEN" \
      -F "templateId=$TEMPLATE_ID" \
      -F "csvFile=@/tmp/test.csv")
    
    if echo "$BULK_RESPONSE" | grep -q "successfully\|completed"; then
      echo "✅ Bulk Generation: SUCCESS"
      BULK_COUNT=$(echo "$BULK_RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
      echo "Documents generated: $BULK_COUNT"
    else
      echo "❌ Bulk Generation: FAILED"
      echo "Response: $(echo "$BULK_RESPONSE" | head -c 300)"
    fi
    
  else
    echo "❌ Template Creation: FAILED"
    echo "Response: $(echo "$TEMPLATE_RESPONSE" | head -c 300)"
  fi
  
  # Test other endpoints
  echo -e "\n📊 Testing Other Endpoints..."
  
  # Documents
  DOCS_RESPONSE=$(curl -s "$BACKEND_URL/api/documents" -H "Authorization: Bearer $TOKEN")
  if echo "$DOCS_RESPONSE" | grep -q "documents"; then
    echo "✅ Documents endpoint: SUCCESS"
  else
    echo "❌ Documents endpoint: FAILED"
  fi
  
  # Audit logs
  AUDIT_RESPONSE=$(curl -s "$BACKEND_URL/api/audit" -H "Authorization: Bearer $TOKEN")
  if echo "$AUDIT_RESPONSE" | grep -q "auditLogs"; then
    echo "✅ Audit logs endpoint: SUCCESS"
  else
    echo "❌ Audit logs endpoint: FAILED"
  fi
  
  # Audit statistics
  STATS_RESPONSE=$(curl -s "$BACKEND_URL/api/audit/stats" -H "Authorization: Bearer $TOKEN")
  if echo "$STATS_RESPONSE" | grep -q "totalActions"; then
    echo "✅ Audit statistics endpoint: SUCCESS"
  else
    echo "❌ Audit statistics endpoint: FAILED"
  fi
  
  # Clean up temp files
  rm -f /tmp/template.json /tmp/document.json /tmp/test.csv
  
else
  echo "❌ Authentication: FAILED"
  echo "Response: $AUTH_RESPONSE"
fi

echo -e "\n🎯 BACKEND TESTING COMPLETE"
echo "=========================="
