# 🚀 DocGen-Mongo - Professional Document Generation Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-green.svg)](https://mongodb.com/)

A comprehensive, production-ready document generation platform built with modern web technologies. Generate professional documents from templates with dynamic data, manage users with role-based access control, and monitor system activity with comprehensive audit logging.

![DocGen-Mongo Dashboard](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=DocGen-Mongo+Dashboard)

## ✨ Features

### 🎯 Core Functionality
- **📄 Advanced Template Management** - Create, edit, delete, and preview document templates
- **📋 Document Generation** - Generate single documents or bulk process from CSV files
- **📁 Document Management** - Organize, filter, and manage generated documents
- **👥 User Management** - Role-based access control with Admin, HR, and Staff roles
- **📊 Audit Logging** - Comprehensive activity tracking and monitoring
- **🔔 Real-time Notifications** - Live notification system with badge counts

### 🎨 Enhanced User Experience
- **📱 Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **🎭 Interactive Dashboard** - Real-time statistics and quick action shortcuts
- **🎨 Scalable Icon System** - 80+ professional icons with consistent theming
- **✨ Smooth Animations** - Professional UI with hover effects and transitions
- **🌙 Modern Design** - Clean, professional interface with Tailwind CSS

### 🔒 Security & Performance
- **🔐 JWT Authentication** - Secure token-based authentication
- **🛡️ Role-based Authorization** - Granular permission system
- **🔒 Password Security** - Bcrypt hashing with 12 salt rounds
- **⚡ Optimized Performance** - Fast loading and responsive interactions

## 🏗️ Tech Stack

### Frontend
- **React 18+** - Modern React with hooks and context
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Toastify** - Toast notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling

### DevOps & Tools
- **Docker** - Containerization support
- **Docker Compose** - Multi-container orchestration
- **Git** - Version control
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB running locally or connection string
- Git for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/DocGen-Mongo.git
   cd DocGen-Mongo
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend && npm install
   
   # Install frontend dependencies
   cd ../frontend && npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy example environment file
   cp .env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

4. **Initialize the database**
   ```bash
   # Seed the database with sample data
   cd backend && node seed/seedData.js
   ```

5. **Start the application**
   ```bash
   # From the root directory
   ./start.sh
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🔐 Default Users

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **👑 Admin** | admin@docgen.com | admin123 | Full system access |
| **👔 HR** | hr@docgen.com | hr123 | Templates, documents, bulk ops, audit |
| **👤 Staff** | staff@docgen.com | staff123 | Basic document generation |

## 📁 Project Structure

```
DocGen-Mongo/
├── 📁 backend/                 # Node.js backend
│   ├── 📁 middleware/          # Authentication, logging, error handling
│   ├── 📁 models/              # MongoDB schemas
│   ├── 📁 routes/              # API endpoints
│   ├── 📁 utils/               # Utility functions
│   ├── 📁 seed/                # Database seeding
│   └── 📄 server.js            # Main server file
├── 📁 frontend/                # React frontend
│   ├── 📁 src/
│   │   ├── 📁 components/      # Reusable components
│   │   ├── 📁 pages/           # Page components
│   │   ├── 📁 contexts/        # React contexts
│   │   ├── 📁 services/        # API services
│   │   └── 📄 App.js           # Main app component
│   └── 📁 public/              # Static assets
├── 📁 sample-data/             # Sample CSV files
├── 📄 docker-compose.yml       # Docker configuration
├── 📄 start.sh                 # Application startup script
├── 📄 stop.sh                  # Application stop script
└── 📄 README.md                # This file
```

## 🎯 Usage Guide

### Creating Templates
1. Login as Admin or HR user
2. Navigate to Templates page
3. Click "New Template" button
4. Define template content with placeholders (e.g., `{{name}}`, `{{position}}`)
5. Configure placeholder types and validation
6. Save and activate template

### Generating Documents
1. Go to Generate Document page
2. Select a template
3. Fill in the required data
4. Preview the document
5. Generate and download

### Bulk Generation
1. Navigate to Bulk Generate page
2. Select a template
3. Upload CSV file with data
4. Map CSV columns to template placeholders
5. Generate multiple documents at once

## 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔧 Development

### Running in Development Mode
```bash
# Start backend in development mode
cd backend && npm run dev

# Start frontend in development mode
cd frontend && npm start
```

### Available Scripts
- `./start.sh` - Start both frontend and backend
- `./stop.sh` - Stop all services
- `./status.sh` - Check service status
- `./test-setup.sh` - Run setup tests

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Template Endpoints
- `GET /api/templates` - Get all templates
- `POST /api/templates` - Create new template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template

### Document Endpoints
- `GET /api/documents` - Get all documents
- `POST /api/documents/generate` - Generate single document
- `POST /api/documents/bulk` - Bulk generate documents

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by professional document management needs
- Designed for scalability and maintainability

## 📞 Support

For support, email support@docgen-mongo.com or create an issue on GitHub.

---

**Made with ❤️ by the DocGen-Mongo Team**
