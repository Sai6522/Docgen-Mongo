const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['offer_letter', 'appointment_letter', 'experience_letter', 'certificate'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  placeholders: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    type: {
      type: String,
      enum: ['text', 'number', 'date', 'email'],
      default: 'text'
    },
    required: {
      type: Boolean,
      default: true
    }
  }],
  fileUrl: {
    type: String // For uploaded DOCX/PDF templates
  },
  fileName: {
    type: String
  },
  fileType: {
    type: String,
    enum: ['docx', 'pdf', 'html']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  accessRoles: [{
    type: String,
    enum: ['admin', 'hr', 'staff']
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for better search performance
templateSchema.index({ name: 'text', description: 'text' });
templateSchema.index({ type: 1, isActive: 1 });

module.exports = mongoose.model('Template', templateSchema);
