const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/docgen-mongo';

// Middleware
app.use(cors());
app.use(express.json());

// In-memory document storage
const generatedDocuments = new Map();

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid token.' });
  }
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Mock user authentication
    if (email === 'admin@docgen.com' && password === 'admin123') {
      const token = jwt.sign(
        { userId: '123', email: email, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({
        message: 'Login successful',
        token: token,
        user: { id: '123', email: email, role: 'admin', name: 'Admin User' }
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Profile endpoint
app.get('/api/auth/profile', authenticateToken, (req, res) => {
  res.json({
    message: 'Profile retrieved successfully',
    user: {
      id: req.user.userId,
      email: req.user.email,
      role: req.user.role,
      name: 'Admin User'
    }
  });
});

// Templates endpoint
app.get('/api/templates', authenticateToken, (req, res) => {
  const mockTemplates = [
    {
      _id: 'template123',
      name: 'Bulk Test Certificate',
      description: 'Test template for bulk generation',
      type: 'certificate',
      content: 'CERTIFICATE OF COMPLETION\n\nThis is to certify that\n\n{{participant_name}}\n\nhas successfully completed the training program on\n\n{{course_name}}\n\nConducted from {{start_date}} to {{end_date}}\n\nDuration: {{duration}} hours\nScore: {{score}}%\nGrade: {{grade}}\n\nIssued on: {{issue_date}}\nLocation: {{location}}\n\nCertificate ID: {{certificate_id}}\n\n_________________________\nTraining Coordinator\n{{organization}}',
      placeholders: [
        { name: 'participant_name', description: 'Name of the participant', required: true, type: 'text' },
        { name: 'course_name', description: 'Name of the course', required: true, type: 'text' },
        { name: 'start_date', description: 'Course start date', required: true, type: 'date' },
        { name: 'end_date', description: 'Course end date', required: true, type: 'date' },
        { name: 'duration', description: 'Course duration in hours', required: true, type: 'number' },
        { name: 'score', description: 'Final score percentage', required: true, type: 'number' },
        { name: 'grade', description: 'Final grade', required: true, type: 'text' },
        { name: 'issue_date', description: 'Certificate issue date', required: true, type: 'date' },
        { name: 'location', description: 'Training location', required: true, type: 'text' },
        { name: 'certificate_id', description: 'Unique certificate ID', required: true, type: 'text' },
        { name: 'organization', description: 'Organization name', required: true, type: 'text' }
      ],
      isActive: true
    }
  ];
  
  res.json({ templates: mockTemplates });
});

// Simple bulk generation endpoint
app.post('/api/docs/bulk-generate', authenticateToken, async (req, res) => {
  const multer = require('multer');
  const csv = require('csv-parser');
  const { Readable } = require('stream');
  
  try {
    const storage = multer.memoryStorage();
    const upload = multer({ storage: storage });
    
    upload.single('csvFile')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: 'File upload error', error: err.message });
      }

      const { templateId } = req.body;

      if (!templateId || !req.file) {
        return res.status(400).json({ message: 'Template ID and CSV file are required' });
      }

      // Mock template
      const template = {
        _id: templateId,
        name: 'Bulk Test Certificate',
        content: 'CERTIFICATE OF COMPLETION\n\nThis is to certify that\n\n{{participant_name}}\n\nhas successfully completed the training program on\n\n{{course_name}}\n\nConducted from {{start_date}} to {{end_date}}\n\nDuration: {{duration}} hours\nScore: {{score}}%\nGrade: {{grade}}\n\nIssued on: {{issue_date}}\nLocation: {{location}}\n\nCertificate ID: {{certificate_id}}\n\n_________________________\nTraining Coordinator\n{{organization}}',
        placeholders: [
          { name: 'participant_name' }, { name: 'course_name' }, { name: 'start_date' },
          { name: 'end_date' }, { name: 'duration' }, { name: 'score' }, { name: 'grade' },
          { name: 'issue_date' }, { name: 'location' }, { name: 'certificate_id' }, { name: 'organization' }
        ]
      };

      // Parse CSV
      const csvData = [];
      const csvString = req.file.buffer.toString('utf8');
      
      const stream = Readable.from([csvString]);
      
      stream
        .pipe(csv())
        .on('data', (row) => {
          csvData.push(row);
        })
        .on('end', () => {
          const documents = [];
          
          csvData.forEach((row, i) => {
            let content = template.content;
            
            // Replace placeholders
            template.placeholders.forEach(placeholder => {
              const value = row[placeholder.name] || `[${placeholder.name}]`;
              const regex = new RegExp(`{{\\s*${placeholder.name}\\s*}}`, 'gi');
              content = content.replace(regex, value);
            });

            const documentId = `${Date.now()}-${i}`;
            const participantName = row.participant_name || `Participant ${i + 1}`;
            
            const document = {
              _id: documentId,
              id: documentId,
              name: `${template.name} - ${participantName}`,
              content: content,
              recipientName: participantName,
              placeholderValues: row
            };

            generatedDocuments.set(documentId, document);
            documents.push(document);
          });

          res.json({
            message: 'Bulk generation completed successfully',
            count: documents.length,
            documents: documents
          });
        })
        .on('error', (error) => {
          res.status(400).json({ message: 'CSV parsing error', error: error.message });
        });
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error during bulk generation', error: error.message });
  }
});

// Document download
app.get('/api/docs/:id/download', authenticateToken, (req, res) => {
  const documentId = req.params.id;
  const document = generatedDocuments.get(documentId);
  
  if (!document) {
    return res.status(404).json({ message: 'Document not found' });
  }
  
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Resources <<
/Font <<
/F1 4 0 R
>>
>>
/Contents 5 0 R
>>
endobj

4 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

5 0 obj
<<
/Length ${document.content.length + 50}
>>
stream
BT
/F1 10 Tf
50 750 Td
(${document.content.replace(/\n/g, ') Tj 0 -15 Td (')}) Tj
ET
endstream
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
0000000173 00000 n 
0000000301 00000 n 
0000000380 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
${500 + document.content.length}
%%EOF`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${document.name}.pdf"`);
  res.send(Buffer.from(pdfContent));
});

// Start server
app.listen(PORT, () => {
  console.log(`Minimal server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
