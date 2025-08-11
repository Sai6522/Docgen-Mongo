const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'document_generated',
      'document_sent',
      'template_created',
      'template_updated',
      'template_deleted',
      'user_login',
      'user_created',
      'bulk_generation'
    ]
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userRole: {
    type: String,
    enum: ['admin', 'hr', 'staff'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId // Can reference Template, Document, or User
  },
  targetType: {
    type: String,
    enum: ['template', 'document', 'user']
  },
  details: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  success: {
    type: Boolean,
    default: true
  },
  errorMessage: {
    type: String
  },
  batchId: {
    type: String // For bulk operations
  },
  recipientEmail: {
    type: String // For document generation tracking
  }
}, {
  timestamps: true
});

// Index for better query performance
auditSchema.index({ userId: 1, createdAt: -1 });
auditSchema.index({ action: 1, createdAt: -1 });
auditSchema.index({ batchId: 1 });
auditSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Audit', auditSchema);
