#!/bin/bash

echo "🔍 DocGen-Mongo Project Verification"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

success_count=0
total_checks=0

check_file() {
    total_checks=$((total_checks + 1))
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $1"
        success_count=$((success_count + 1))
    else
        echo -e "${RED}❌${NC} $1"
    fi
}

check_dir() {
    total_checks=$((total_checks + 1))
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅${NC} $1/"
        success_count=$((success_count + 1))
    else
        echo -e "${RED}❌${NC} $1/"
    fi
}

echo -e "${BLUE}📁 Checking Project Structure...${NC}"

# Root files
check_file "README.md"
check_file "docker-compose.yml"
check_file ".env"
check_file ".env.example"

# Directories
check_dir "backend"
check_dir "frontend"
check_dir "sample-data"

echo ""
echo -e "${BLUE}🔧 Checking Backend Files...${NC}"

# Backend files
check_file "backend/package.json"
check_file "backend/server.js"
check_file "backend/Dockerfile"

# Backend models
check_file "backend/models/User.js"
check_file "backend/models/Template.js"
check_file "backend/models/Document.js"
check_file "backend/models/Audit.js"

# Backend routes
check_file "backend/routes/auth.js"
check_file "backend/routes/templates.js"
check_file "backend/routes/documents.js"
check_file "backend/routes/audit.js"

# Backend middleware
check_file "backend/middleware/auth.js"
check_file "backend/middleware/errorHandler.js"
check_file "backend/middleware/auditLogger.js"

# Backend utils
check_file "backend/utils/validation.js"
check_file "backend/utils/fileUpload.js"
check_file "backend/utils/documentGenerator.js"
check_file "backend/utils/emailService.js"
check_file "backend/utils/dataParser.js"

# Backend seed
check_file "backend/seed/seedData.js"

echo ""
echo -e "${BLUE}⚛️  Checking Frontend Files...${NC}"

# Frontend files
check_file "frontend/package.json"
check_file "frontend/Dockerfile"
check_file "frontend/tailwind.config.js"
check_file "frontend/postcss.config.js"

# Frontend src
check_file "frontend/src/App.js"
check_file "frontend/src/index.js"
check_file "frontend/src/index.css"

# Frontend contexts
check_file "frontend/src/contexts/AuthContext.js"

# Frontend services
check_file "frontend/src/services/api.js"

# Frontend components
check_file "frontend/src/components/Layout.js"

# Frontend pages
check_file "frontend/src/pages/Login.js"
check_file "frontend/src/pages/Dashboard.js"
check_file "frontend/src/pages/Templates.js"
check_file "frontend/src/pages/TemplateForm.js"
check_file "frontend/src/pages/GenerateDocument.js"
check_file "frontend/src/pages/BulkGenerate.js"
check_file "frontend/src/pages/Documents.js"
check_file "frontend/src/pages/AuditLogs.js"
check_file "frontend/src/pages/Users.js"
check_file "frontend/src/pages/Profile.js"

# Frontend public
check_file "frontend/public/index.html"

echo ""
echo -e "${BLUE}📊 Checking Sample Data...${NC}"

# Sample data files
check_file "sample-data/offer_letter_sample.csv"
check_file "sample-data/appointment_letter_sample.csv"
check_file "sample-data/experience_letter_sample.csv"
check_file "sample-data/certificate_sample.csv"

echo ""
echo -e "${BLUE}📋 Summary${NC}"
echo "=================================="
echo -e "Total checks: ${BLUE}$total_checks${NC}"
echo -e "Passed: ${GREEN}$success_count${NC}"
echo -e "Failed: ${RED}$((total_checks - success_count))${NC}"

if [ $success_count -eq $total_checks ]; then
    echo ""
    echo -e "${GREEN}🎉 All checks passed! Project structure is complete.${NC}"
    echo ""
    echo -e "${YELLOW}📝 Next Steps:${NC}"
    echo "1. Install Docker and Docker Compose"
    echo "2. Run: docker-compose up --build"
    echo "3. Access frontend at http://localhost:3000"
    echo "4. Access API docs at http://localhost:5000/api-docs"
    echo ""
    echo -e "${YELLOW}🔐 Default Login Credentials:${NC}"
    echo "Admin: admin@docgen.com / admin123"
    echo "HR: hr@docgen.com / hr123"
    echo "Staff: staff@docgen.com / staff123"
else
    echo ""
    echo -e "${RED}❌ Some files are missing. Please check the project structure.${NC}"
fi

echo ""
echo -e "${BLUE}🔧 Technology Stack:${NC}"
echo "Backend: Node.js + Express + MongoDB"
echo "Frontend: React + TailwindCSS"
echo "Authentication: JWT with role-based access"
echo "Document Generation: PDFKit + docx-templater"
echo "Email: Nodemailer"
echo "File Processing: Multer + PapaParse + XLSX"

echo ""
echo -e "${BLUE}✨ Key Features:${NC}"
echo "• Template Management with placeholders"
echo "• Single & Bulk Document Generation"
echo "• Role-based Access Control (Admin/HR/Staff)"
echo "• Email Integration"
echo "• Audit Trail & Logging"
echo "• Document Preview"
echo "• CSV/Excel Bulk Processing"
echo "• Swagger API Documentation"
