#!/bin/bash

echo "🚀 Testing DocGen-Mongo Setup"
echo "================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please create it from .env.example"
    exit 1
fi

echo "✅ Environment file found"

# Check project structure
echo "📁 Checking project structure..."

required_dirs=("backend" "frontend" "sample-data")
for dir in "${required_dirs[@]}"; do
    if [ ! -d "$dir" ]; then
        echo "❌ Directory $dir not found"
        exit 1
    fi
done

required_files=(
    "docker-compose.yml"
    "backend/package.json"
    "backend/server.js"
    "frontend/package.json"
    "frontend/src/App.js"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ File $file not found"
        exit 1
    fi
done

echo "✅ Project structure is correct"

# Test Docker Compose configuration
echo "🔧 Testing Docker Compose configuration..."
if docker-compose config > /dev/null 2>&1; then
    echo "✅ Docker Compose configuration is valid"
else
    echo "❌ Docker Compose configuration has errors"
    exit 1
fi

echo ""
echo "🎉 Setup verification completed successfully!"
echo ""
echo "To start the application:"
echo "1. Run: docker-compose up --build"
echo "2. Wait for all services to start"
echo "3. Access the application at http://localhost:3000"
echo "4. API documentation at http://localhost:5000/api-docs"
echo ""
echo "Default login credentials:"
echo "- Admin: admin@docgen.com / admin123"
echo "- HR: hr@docgen.com / hr123"
echo "- Staff: staff@docgen.com / staff123"
