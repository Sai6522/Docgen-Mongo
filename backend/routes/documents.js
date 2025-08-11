const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Template = require('../models/Template');
const Document = require('../models/Document');
const { auth, authorize } = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');
const { validate, documentGenerationSchema, bulkGenerationSchema } = require('../utils/validation');
const { uploadBulkData } = require('../utils/fileUpload');
const documentGenerator = require('../utils/documentGenerator');
const emailService = require('../utils/emailService');
const dataParser = require('../utils/dataParser');
const path = require('path');
const fs = require('fs');

const router = express.Router();

/**
 * @swagger
 * /api/docs/generate:
 *   post:
 *     summary: Generate single document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - templateId
 *               - recipientName
 *               - placeholderValues
 *             properties:
 *               templateId:
 *                 type: string
 *               recipientName:
 *                 type: string
 *               recipientEmail:
 *                 type: string
 *                 format: email
 *               placeholderValues:
 *                 type: object
 *               fileType:
 *                 type: string
 *                 enum: [pdf, docx]
 *               sendEmail:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Document generated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Template not found
 */
router.post('/generate', 
  auth,
  validate(documentGenerationSchema),
  auditLogger('document_generated'),
  async (req, res) => {
    try {
      const {
        templateId,
        recipientName,
        recipientEmail,
        placeholderValues,
        fileType = 'pdf',
        sendEmail = false
      } = req.body;

      // Get template
      const template = await Template.findById(templateId);
      if (!template || !template.isActive) {
        return res.status(404).json({ message: 'Template not found or inactive' });
      }

      // Check access permissions
      if (req.user.role === 'staff' && !template.accessRoles.includes('staff')) {
        return res.status(403).json({ message: 'Access denied to this template' });
      }

      // Validate required placeholders
      const missingPlaceholders = template.placeholders
        .filter(p => p.required && !placeholderValues[p.name])
        .map(p => p.name);

      if (missingPlaceholders.length > 0) {
        return res.status(400).json({
          message: 'Missing required placeholders',
          missingPlaceholders
        });
      }

      // Generate document
      const documentInfo = await documentGenerator.generateDocument(
        template,
        placeholderValues,
        recipientName,
        fileType
      );

      // Save document record
      const document = new Document({
        templateId,
        recipientName,
        recipientEmail,
        placeholderValues: new Map(Object.entries(placeholderValues)),
        fileUrl: documentInfo.fileUrl,
        fileName: documentInfo.fileName,
        fileType,
        generatedBy: req.user._id
      });

      await document.save();

      // Send email if requested
      let emailResult = null;
      if (sendEmail && recipientEmail) {
        try {
          emailResult = await emailService.sendDocument(
            recipientEmail,
            recipientName,
            documentInfo,
            template.name,
            req.user.name
          );

          document.emailSent = true;
          document.emailSentAt = new Date();
          document.status = 'sent';
          await document.save();

        } catch (emailError) {
          console.error('Email sending failed:', emailError);
          emailResult = { success: false, error: emailError.message };
        }
      }

      res.status(201).json({
        message: 'Document generated successfully',
        document: {
          id: document._id,
          fileName: document.fileName,
          fileUrl: document.fileUrl,
          recipientName: document.recipientName,
          recipientEmail: document.recipientEmail,
          fileType: document.fileType,
          createdAt: document.createdAt
        },
        emailResult
      });

    } catch (error) {
      console.error('Document generation error:', error);
      res.status(500).json({ message: 'Server error generating document' });
    }
  }
);

/**
 * @swagger
 * /api/docs/bulk-generate:
 *   post:
 *     summary: Generate multiple documents from CSV/Excel
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               templateId:
 *                 type: string
 *               fileType:
 *                 type: string
 *                 enum: [pdf, docx]
 *               sendEmail:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Bulk documents generated successfully
 *       400:
 *         description: Validation error
 */
router.post('/bulk-generate',
  auth,
  authorize('admin', 'hr'),
  uploadBulkData.single('file'),
  auditLogger('bulk_generation'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const {
        templateId,
        fileType = 'pdf',
        sendEmail = false
      } = req.body;

      if (!templateId) {
        return res.status(400).json({ message: 'Template ID is required' });
      }

      // Get template
      const template = await Template.findById(templateId);
      if (!template || !template.isActive) {
        dataParser.cleanupFile(req.file.path);
        return res.status(404).json({ message: 'Template not found or inactive' });
      }

      // Parse uploaded file
      let records;
      try {
        records = await dataParser.parseFile(req.file.path);
      } catch (parseError) {
        dataParser.cleanupFile(req.file.path);
        return res.status(400).json({ message: parseError.message });
      }

      // Validate data
      const validation = dataParser.validateData(records, template.placeholders);
      if (!validation.isValid) {
        dataParser.cleanupFile(req.file.path);
        return res.status(400).json({
          message: 'Data validation failed',
          errors: validation.errors
        });
      }

      // Generate batch ID for tracking
      const batchId = uuidv4();
      req.batchId = batchId;

      const results = {
        batchId,
        totalRecords: records.length,
        successCount: 0,
        failureCount: 0,
        documents: [],
        errors: [],
        emailResults: []
      };

      // Process each record
      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        
        try {
          // Extract recipient info
          const recipientName = record.name || record.recipientName || `Recipient_${i + 1}`;
          const recipientEmail = record.email || record.recipientEmail;

          // Generate document
          const documentInfo = await documentGenerator.generateDocument(
            template,
            record,
            recipientName,
            fileType
          );

          // Save document record
          const document = new Document({
            templateId,
            recipientName,
            recipientEmail,
            placeholderValues: new Map(Object.entries(record)),
            fileUrl: documentInfo.fileUrl,
            fileName: documentInfo.fileName,
            fileType,
            generatedBy: req.user._id,
            batchId
          });

          await document.save();

          results.documents.push({
            id: document._id,
            recipientName,
            recipientEmail,
            fileName: document.fileName,
            fileUrl: document.fileUrl
          });

          results.successCount++;

          // Send email if requested and email is provided
          if (sendEmail && recipientEmail) {
            try {
              const emailResult = await emailService.sendDocument(
                recipientEmail,
                recipientName,
                documentInfo,
                template.name,
                req.user.name
              );

              document.emailSent = true;
              document.emailSentAt = new Date();
              document.status = 'sent';
              await document.save();

              results.emailResults.push({
                recipientEmail,
                success: true,
                messageId: emailResult.messageId
              });

            } catch (emailError) {
              results.emailResults.push({
                recipientEmail,
                success: false,
                error: emailError.message
              });
            }
          }

        } catch (error) {
          console.error(`Error processing record ${i + 1}:`, error);
          results.failureCount++;
          results.errors.push({
            recordIndex: i + 1,
            recipientName: record.name || record.recipientName || `Recipient_${i + 1}`,
            error: error.message
          });
        }
      }

      // Cleanup uploaded file
      dataParser.cleanupFile(req.file.path);

      res.status(201).json({
        message: 'Bulk generation completed',
        results
      });

    } catch (error) {
      console.error('Bulk generation error:', error);
      if (req.file) {
        dataParser.cleanupFile(req.file.path);
      }
      res.status(500).json({ message: 'Server error during bulk generation' });
    }
  }
);

/**
 * @swagger
 * /api/docs:
 *   get:
 *     summary: Get generated documents
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: templateId
 *         schema:
 *           type: string
 *         description: Filter by template ID
 *     responses:
 *       200:
 *         description: Documents retrieved successfully
 */
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      templateId,
      batchId,
      recipientEmail
    } = req.query;

    const query = {};

    // Filter by user role
    if (req.user.role !== 'admin') {
      query.generatedBy = req.user._id;
    }

    if (templateId) query.templateId = templateId;
    if (batchId) query.batchId = batchId;
    if (recipientEmail) query.recipientEmail = new RegExp(recipientEmail, 'i');

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const documents = await Document.find(query)
      .populate('templateId', 'name type')
      .populate('generatedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Document.countDocuments(query);

    res.json({
      documents,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Documents fetch error:', error);
    res.status(500).json({ message: 'Server error fetching documents' });
  }
});

/**
 * @swagger
 * /api/docs/{id}:
 *   get:
 *     summary: Get document by ID
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document retrieved successfully
 *       404:
 *         description: Document not found
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const query = { _id: req.params.id };

    // Non-admin users can only see their own documents
    if (req.user.role !== 'admin') {
      query.generatedBy = req.user._id;
    }

    const document = await Document.findOne(query)
      .populate('templateId', 'name type description')
      .populate('generatedBy', 'name email');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json({ document });

  } catch (error) {
    console.error('Document fetch error:', error);
    res.status(500).json({ message: 'Server error fetching document' });
  }
});

/**
 * @swagger
 * /api/docs/{id}/download:
 *   get:
 *     summary: Download document file
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File downloaded successfully
 *       404:
 *         description: Document or file not found
 */
router.get('/:id/download', auth, async (req, res) => {
  try {
    const query = { _id: req.params.id };

    // Non-admin users can only download their own documents
    if (req.user.role !== 'admin') {
      query.generatedBy = req.user._id;
    }

    const document = await Document.findOne(query);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const filePath = path.join(__dirname, '..', document.fileUrl);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    // Set proper Content-Type based on file extension
    const fileExtension = document.fileName.split('.').pop().toLowerCase();
    let contentType = 'application/octet-stream'; // Default fallback
    
    if (fileExtension === 'pdf') {
      contentType = 'application/pdf';
    } else if (fileExtension === 'docx') {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }

    // Set headers for proper file handling
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${document.fileName}"`);
    
    console.log(`📥 Downloading ${document.fileName} (${contentType})`);
    
    res.download(filePath, document.fileName);

  } catch (error) {
    console.error('Document download error:', error);
    res.status(500).json({ message: 'Server error downloading document' });
  }
});

/**
 * @swagger
 * /api/docs/{id}/send-email:
 *   post:
 *     summary: Send document via email
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipientEmail:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Email sent successfully
 *       404:
 *         description: Document not found
 */
router.post('/:id/send-email', auth, async (req, res) => {
  try {
    const { recipientEmail } = req.body;

    if (!recipientEmail) {
      return res.status(400).json({ message: 'Recipient email is required' });
    }

    const query = { _id: req.params.id };

    // Non-admin users can only send their own documents
    if (req.user.role !== 'admin') {
      query.generatedBy = req.user._id;
    }

    const document = await Document.findOne(query)
      .populate('templateId', 'name type');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const filePath = path.join(__dirname, '..', document.fileUrl);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    // Send email
    const emailResult = await emailService.sendDocument(
      recipientEmail,
      document.recipientName,
      {
        fileName: document.fileName,
        filePath: filePath
      },
      document.templateId.name,
      req.user.name
    );

    // Update document record
    document.recipientEmail = recipientEmail;
    document.emailSent = true;
    document.emailSentAt = new Date();
    document.status = 'sent';
    await document.save();

    res.json({
      message: 'Email sent successfully',
      messageId: emailResult.messageId
    });

  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ message: 'Server error sending email' });
  }
});

/**
 * @swagger
 * /api/docs/preview/{id}:
 *   get:
 *     summary: Preview document content
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document preview generated
 *       404:
 *         description: Document not found
 */
router.get('/preview/:id', auth, async (req, res) => {
  try {
    const query = { _id: req.params.id };

    // Non-admin users can only preview their own documents
    if (req.user.role !== 'admin') {
      query.generatedBy = req.user._id;
    }

    const document = await Document.findOne(query)
      .populate('templateId', 'name type content');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Generate preview content
    const placeholderValues = Object.fromEntries(document.placeholderValues);
    const previewContent = documentGenerator.replacePlaceholders(
      document.templateId.content,
      placeholderValues
    );

    res.json({
      preview: {
        templateName: document.templateId.name,
        recipientName: document.recipientName,
        content: previewContent,
        placeholderValues
      }
    });

  } catch (error) {
    console.error('Document preview error:', error);
    res.status(500).json({ message: 'Server error generating preview' });
  }
});

module.exports = router;
