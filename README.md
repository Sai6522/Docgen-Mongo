# DocGen-Mongo - Document Generation System

A full-stack document generation system that automates the creation of offer letters, appointment letters, experience letters, and certificates using MongoDB for storage and template management.

## 🚀 Features

- **Template Management**: Store and manage document templates with placeholders
- **Document Generation**: Single and bulk document generation from templates
- **Role-based Access**: Admin, HR, and Staff roles with different permissions
- **Audit Trail**: Complete logging of document generation activities
- **Email Integration**: Send generated documents via email
- **Preview**: Browser-based document preview before download
- **Multiple Formats**: Support for PDF and DOCX output
- **Bulk Processing**: Generate multiple documents from CSV/Excel files
- **API Documentation**: Swagger UI for API exploration

## 🛠 Tech Stack

- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Frontend**: React with TailwindCSS
- **Authentication**: JWT-based with role-based access control
- **PDF Generation**: pdfkit
- **DOCX Generation**: docx-templater
- **File Processing**: multer, papaparse, xlsx
- **Email**: nodemailer

## 📋 Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- MongoDB (if running locally)

## 🚀 Quick Start

### Using Docker (Recommended)

1. **Clone the repository**:
```bash
git clone <repository-url>
cd DocGen-Mongo
```

2. **Set up environment variables**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start with Docker Compose**:
```bash
docker-compose up --build
```

4. **Access the application**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api-docs

### Local Development

#### Backend Setup
```bash
cd backend
npm install
npm run seed  # Initialize database with sample data
npm run dev   # Start development server
```

#### Frontend Setup
```bash
cd frontend
npm install
npm start     # Start development server
```

#### MongoDB Setup
Make sure MongoDB is running on `mongodb://localhost:27017/docgen`

## 👥 Default Users

The system comes with pre-configured users for testing:

| Role  | Email              | Password | Permissions                    |
|-------|-------------------|----------|--------------------------------|
| Admin | admin@docgen.com  | admin123 | Full system access             |
| HR    | hr@docgen.com     | hr123    | Template & document management |
| Staff | staff@docgen.com  | staff123 | Document generation only       |

## 📁 Project Structure

```
DocGen-Mongo/
├── backend/                 # Node.js Express backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utility functions
│   ├── seed/               # Database seeding
│   └── server.js           # Main server file
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   └── services/       # API services
│   └── public/             # Static files
├── sample-data/            # Sample CSV files for testing
├── docker-compose.yml      # Docker composition
├── .env.example           # Environment variables template
└── README.md              # This file
```

## 🔧 Configuration

### Environment Variables

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://mongo:27017/docgen
JWT_SECRET=your-jwt-secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:3000
```

### Email Configuration

For email functionality, you need to configure SMTP settings:

1. **Gmail Setup**:
   - Enable 2-factor authentication
   - Generate an app-specific password
   - Use the app password in `EMAIL_PASS`

2. **Other SMTP Providers**:
   - Update the nodemailer configuration in `backend/utils/emailService.js`

## 📚 API Documentation

The API is fully documented with Swagger UI. After starting the backend, visit:
http://localhost:5000/api-docs

### Key API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration (Admin only)
- `GET /api/auth/profile` - Get user profile

#### Templates
- `GET /api/templates` - Get all templates
- `POST /api/templates` - Create new template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template

#### Document Generation
- `POST /api/docs/generate` - Generate single document
- `POST /api/docs/bulk-generate` - Generate multiple documents
- `GET /api/docs` - Get generated documents
- `GET /api/docs/:id/download` - Download document

#### Audit
- `GET /api/audit` - Get audit logs
- `GET /api/audit/stats` - Get audit statistics

## 📄 Template System

### Template Placeholders

Templates support dynamic placeholders in the format `{{placeholder_name}}`. Common placeholders include:

- `{{name}}` - Recipient name
- `{{position}}` - Job position
- `{{company}}` - Company name
- `{{date}}` - Current date
- `{{salary}}` - Salary amount

### Sample Templates

The system includes pre-configured templates for:

1. **Offer Letters** - Job offer documents
2. **Appointment Letters** - Official appointment documents
3. **Experience Letters** - Employment experience certificates
4. **Training Certificates** - Course completion certificates

## 📊 Bulk Generation

### CSV Format

For bulk generation, prepare a CSV file with columns matching your template placeholders:

```csv
name,position,company,salary,start_date
John Doe,Software Engineer,TechCorp,$75000,2024-02-01
Jane Smith,Product Manager,TechCorp,$85000,2024-02-15
```

### Process

1. Select a template
2. Download the sample CSV to see required format
3. Prepare your data file
4. Upload and generate documents
5. Download individual or all documents

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Role-based Access Control** - Different permissions for different roles
- **Input Validation** - Joi schema validation for all inputs
- **Rate Limiting** - API rate limiting to prevent abuse
- **Audit Logging** - Complete activity tracking
- **File Upload Security** - File type and size validation

## 🧪 Testing

### Sample Data

The `sample-data/` directory contains CSV files for testing bulk generation:

- `offer_letter_sample.csv` - Sample offer letter data
- `appointment_letter_sample.csv` - Sample appointment letter data
- `experience_letter_sample.csv` - Sample experience letter data
- `certificate_sample.csv` - Sample certificate data

### Testing Workflow

1. **Login** with any of the default users
2. **Create Templates** or use existing ones
3. **Generate Single Document**:
   - Go to "Generate Document"
   - Select template and fill details
   - Generate and download
4. **Bulk Generation**:
   - Go to "Bulk Generate"
   - Select template
   - Download sample CSV
   - Upload your data file
   - Generate multiple documents
5. **Email Testing**:
   - Configure email settings
   - Enable "Send Email" option
   - Verify email delivery

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:
   - Ensure MongoDB is running
   - Check connection string in .env

2. **Email Not Sending**:
   - Verify email credentials
   - Check SMTP settings
   - Ensure app-specific password for Gmail

3. **File Upload Issues**:
   - Check file size limits
   - Verify file format (CSV, XLSX, DOCX, PDF)

4. **Docker Issues**:
   - Ensure Docker is running
   - Check port availability (3000, 5000, 27017)

### Logs

Check application logs for detailed error information:

```bash
# Docker logs
docker-compose logs backend
docker-compose logs frontend

# Local development
# Backend logs appear in terminal
# Frontend logs in browser console
```

## 🔄 Development

### Adding New Template Types

1. Update the `type` enum in `backend/models/Template.js`
2. Add the new type to validation schemas
3. Update frontend template type options
4. Create sample templates and data

### Adding New Placeholder Types

1. Update placeholder type enum in models
2. Add validation logic in `backend/utils/dataParser.js`
3. Update frontend input type mapping
4. Test with sample data

### Customizing Email Templates

Edit `backend/utils/emailService.js` to customize email templates and styling.

## 📈 Performance Considerations

- **Database Indexing**: Indexes are configured for optimal query performance
- **File Storage**: Generated documents are stored locally (consider cloud storage for production)
- **Memory Usage**: Large bulk operations may require memory optimization
- **Rate Limiting**: Configured to prevent API abuse

## 🚀 Production Deployment

### Environment Setup

1. **Database**: Use MongoDB Atlas or dedicated MongoDB instance
2. **File Storage**: Consider AWS S3 or similar for document storage
3. **Email**: Use dedicated SMTP service (SendGrid, AWS SES)
4. **Security**: Update JWT secrets, enable HTTPS
5. **Monitoring**: Add logging and monitoring solutions

### Docker Production

```bash
# Build production images
docker-compose -f docker-compose.prod.yml up --build

# Or use individual services
docker build -t docgen-backend ./backend
docker build -t docgen-frontend ./frontend
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

1. Check the troubleshooting section
2. Review API documentation
3. Check existing issues
4. Create a new issue with detailed information

## 🎯 Roadmap

- [ ] Cloud storage integration (AWS S3, Google Cloud)
- [ ] Advanced template editor with WYSIWYG
- [ ] Digital signature support
- [ ] Multi-language template support
- [ ] Advanced analytics and reporting
- [ ] Mobile app for document generation
- [ ] Integration with HR systems (Workday, BambooHR)
- [ ] Automated document workflows
- [ ] Template versioning and approval process

---

**Built with ❤️ for efficient document generation**
