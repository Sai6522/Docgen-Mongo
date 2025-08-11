const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    required: true
  },
  recipientName: {
    type: String,
    required: true,
    trim: true
  },
  recipientEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  placeholderValues: {
    type: Map,
    of: String,
    required: true
  },
  generatedContent: {
    type: String
  },
  fileUrl: {
    type: String
  },
  fileName: {
    type: String
  },
  fileType: {
    type: String,
    enum: ['pdf', 'docx'],
    required: true
  },
  status: {
    type: String,
    enum: ['generated', 'sent', 'failed'],
    default: 'generated'
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: {
    type: Date
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  batchId: {
    type: String // For bulk generation tracking
  }
}, {
  timestamps: true
});

// Index for better query performance
documentSchema.index({ templateId: 1, generatedBy: 1 });
documentSchema.index({ recipientEmail: 1 });
documentSchema.index({ batchId: 1 });
documentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Document', documentSchema);
