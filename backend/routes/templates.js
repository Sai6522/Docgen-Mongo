const express = require('express');
const Template = require('../models/Template');
const { auth, authorize } = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');
const { validate, templateSchema } = require('../utils/validation');
const { uploadTemplate } = require('../utils/fileUpload');
const dataParser = require('../utils/dataParser');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Template:
 *       type: object
 *       required:
 *         - name
 *         - type
 *         - content
 *       properties:
 *         name:
 *           type: string
 *           description: Template name
 *         description:
 *           type: string
 *           description: Template description
 *         type:
 *           type: string
 *           enum: [offer_letter, appointment_letter, experience_letter, certificate]
 *         content:
 *           type: string
 *           description: Template content with placeholders
 *         placeholders:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [text, number, date, email]
 *               required:
 *                 type: boolean
 */

/**
 * @swagger
 * /api/templates:
 *   get:
 *     summary: Get all templates
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by template type
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Templates retrieved successfully
 */
router.get('/', auth, async (req, res) => {
  try {
    const { type, active } = req.query;
    const query = {};

    // Build query based on user role
    if (req.user.role === 'staff') {
      query.accessRoles = { $in: ['staff'] };
    }

    if (type) query.type = type;
    if (active !== undefined) query.isActive = active === 'true';

    const templates = await Template.find(query)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ templates });

  } catch (error) {
    console.error('Templates fetch error:', error);
    res.status(500).json({ message: 'Server error fetching templates' });
  }
});

/**
 * @swagger
 * /api/templates/{id}:
 *   get:
 *     summary: Get template by ID
 *     tags: [Templates]
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
 *         description: Template retrieved successfully
 *       404:
 *         description: Template not found
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const template = await Template.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Check access permissions
    if (req.user.role === 'staff' && !template.accessRoles.includes('staff')) {
      return res.status(403).json({ message: 'Access denied to this template' });
    }

    res.json({ template });

  } catch (error) {
    console.error('Template fetch error:', error);
    res.status(500).json({ message: 'Server error fetching template' });
  }
});

/**
 * @swagger
 * /api/templates:
 *   post:
 *     summary: Create new template
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Template'
 *     responses:
 *       201:
 *         description: Template created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Unauthorized
 */
router.post('/', 
  auth, 
  authorize('admin', 'hr'),
  validate(templateSchema),
  auditLogger('template_created'),
  async (req, res) => {
    try {
      const {
        name,
        description,
        type,
        content,
        placeholders,
        accessRoles,
        isActive
      } = req.body;

      // Set default access roles based on user role
      let finalAccessRoles = accessRoles || [];
      if (req.user.role === 'hr' && !finalAccessRoles.length) {
        finalAccessRoles = ['hr', 'staff'];
      } else if (req.user.role === 'admin' && !finalAccessRoles.length) {
        finalAccessRoles = ['admin', 'hr', 'staff'];
      }

      const template = new Template({
        name,
        description,
        type,
        content,
        placeholders: placeholders || [],
        accessRoles: finalAccessRoles,
        isActive: isActive !== undefined ? isActive : true,
        createdBy: req.user._id
      });

      await template.save();
      await template.populate('createdBy', 'name email');

      res.status(201).json({
        message: 'Template created successfully',
        template
      });

    } catch (error) {
      console.error('Template creation error:', error);
      res.status(500).json({ message: 'Server error creating template' });
    }
  }
);

/**
 * @swagger
 * /api/templates/{id}:
 *   put:
 *     summary: Update template
 *     tags: [Templates]
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
 *         description: Template updated successfully
 *       404:
 *         description: Template not found
 *       403:
 *         description: Unauthorized
 */
router.put('/:id', 
  auth, 
  authorize('admin', 'hr'),
  auditLogger('template_updated', 'template'),
  async (req, res) => {
    try {
      const template = await Template.findById(req.params.id);
      
      if (!template) {
        return res.status(404).json({ message: 'Template not found' });
      }

      // Check if HR user can edit this template
      if (req.user.role === 'hr' && template.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You can only edit templates you created' });
      }

      const {
        name,
        description,
        type,
        content,
        placeholders,
        accessRoles,
        isActive
      } = req.body;

      // Update fields
      if (name) template.name = name;
      if (description !== undefined) template.description = description;
      if (type) template.type = type;
      if (content) template.content = content;
      if (placeholders) template.placeholders = placeholders;
      if (accessRoles) template.accessRoles = accessRoles;
      if (isActive !== undefined) template.isActive = isActive;
      
      template.updatedBy = req.user._id;

      await template.save();
      await template.populate(['createdBy', 'updatedBy'], 'name email');

      res.json({
        message: 'Template updated successfully',
        template
      });

    } catch (error) {
      console.error('Template update error:', error);
      res.status(500).json({ message: 'Server error updating template' });
    }
  }
);

/**
 * @swagger
 * /api/templates/{id}:
 *   delete:
 *     summary: Delete template
 *     tags: [Templates]
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
 *         description: Template deleted successfully
 *       404:
 *         description: Template not found
 *       403:
 *         description: Unauthorized
 */
router.delete('/:id', 
  auth, 
  authorize('admin'),
  auditLogger('template_deleted', 'template'),
  async (req, res) => {
    try {
      const template = await Template.findById(req.params.id);
      
      if (!template) {
        return res.status(404).json({ message: 'Template not found' });
      }

      if (!template) {
        return res.status(404).json({ message: 'Template not found' });
      }

      // Check query parameter for delete type
      const hardDelete = req.query.hard === 'true';

      if (hardDelete) {
        // Check if template is being used in any documents
        const Document = require('../models/Document');
        const documentsUsingTemplate = await Document.countDocuments({ templateId: req.params.id });
        
        if (documentsUsingTemplate > 0) {
          return res.status(400).json({ 
            message: `Cannot permanently delete template. It is being used by ${documentsUsingTemplate} document(s).` 
          });
        }

        // Hard delete - permanently remove from database
        await Template.findByIdAndDelete(req.params.id);
        res.json({ message: 'Template permanently deleted successfully' });
      } else {
        // Soft delete - just mark as inactive (default behavior)
        template.isActive = false;
        template.updatedBy = req.user._id;
        await template.save();
        res.json({ message: 'Template deleted successfully (marked as inactive)' });
      }

    } catch (error) {
      console.error('Template deletion error:', error);
      res.status(500).json({ message: 'Server error deleting template' });
    }
  }
);

/**
 * @swagger
 * /api/templates/upload:
 *   post:
 *     summary: Upload template file
 *     tags: [Templates]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       201:
 *         description: Template uploaded successfully
 *       400:
 *         description: File upload error
 */
router.post('/upload', 
  auth, 
  authorize('admin', 'hr'),
  uploadTemplate.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const { name, description, type, placeholders, accessRoles } = req.body;

      if (!name || !type) {
        return res.status(400).json({ message: 'Name and type are required' });
      }

      // Parse placeholders if provided as string
      let parsedPlaceholders = [];
      if (placeholders) {
        try {
          parsedPlaceholders = JSON.parse(placeholders);
        } catch (e) {
          return res.status(400).json({ message: 'Invalid placeholders format' });
        }
      }

      // Parse access roles if provided as string
      let parsedAccessRoles = ['admin', 'hr', 'staff'];
      if (accessRoles) {
        try {
          parsedAccessRoles = JSON.parse(accessRoles);
        } catch (e) {
          return res.status(400).json({ message: 'Invalid access roles format' });
        }
      }

      const template = new Template({
        name,
        description,
        type,
        content: `Uploaded template file: ${req.file.originalname}`,
        placeholders: parsedPlaceholders,
        fileUrl: req.file.path,
        fileName: req.file.originalname,
        fileType: req.file.originalname.split('.').pop().toLowerCase(),
        accessRoles: parsedAccessRoles,
        createdBy: req.user._id
      });

      await template.save();
      await template.populate('createdBy', 'name email');

      res.status(201).json({
        message: 'Template uploaded successfully',
        template
      });

    } catch (error) {
      console.error('Template upload error:', error);
      res.status(500).json({ message: 'Server error uploading template' });
    }
  }
);

/**
 * @swagger
 * /api/templates/{id}/sample-csv:
 *   get:
 *     summary: Generate sample CSV for template
 *     tags: [Templates]
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
 *         description: Sample CSV generated successfully
 *       404:
 *         description: Template not found
 */
router.get('/:id/sample-csv', auth, async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Check access permissions
    if (req.user.role === 'staff' && !template.accessRoles.includes('staff')) {
      return res.status(403).json({ message: 'Access denied to this template' });
    }

    const csvContent = dataParser.generateSampleCSV(template.placeholders);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${template.name}_sample.csv"`);
    res.send(csvContent);

  } catch (error) {
    console.error('Sample CSV generation error:', error);
    res.status(500).json({ message: 'Server error generating sample CSV' });
  }
});

module.exports = router;
