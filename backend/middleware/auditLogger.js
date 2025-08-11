const Audit = require('../models/Audit');

const auditLogger = (action, targetType = null) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log the audit after response is sent
      setImmediate(async () => {
        try {
          // Only create audit log if user is available
          if (!req.user || !req.user._id || !req.user.role) {
            console.warn('⚠️ Audit log skipped - missing user information');
            return;
          }

          const auditData = {
            action,
            userId: req.user._id,
            userRole: req.user.role,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            success: res.statusCode < 400
          };

          // Add target information if available
          if (targetType && req.params.id) {
            auditData.targetId = req.params.id;
            auditData.targetType = targetType;
          }

          // Add additional details based on action
          const details = {};
          
          if (action === 'document_generated' && req.body) {
            details.templateId = req.body.templateId;
            details.recipientName = req.body.recipientName;
            details.recipientEmail = req.body.recipientEmail;
            auditData.recipientEmail = req.body.recipientEmail;
          }

          if (action === 'bulk_generation' && req.body) {
            details.templateId = req.body.templateId;
            details.recordCount = req.body.records?.length || 0;
            auditData.batchId = req.batchId;
          }

          if (action === 'template_created' && req.body) {
            details.templateName = req.body.name;
            details.templateType = req.body.type;
          }

          if (action === 'user_login' && req.body) {
            details.email = req.body.email;
          }

          if (Object.keys(details).length > 0) {
            auditData.details = details;
          }

          // Add error message if request failed
          if (res.statusCode >= 400) {
            try {
              const responseData = JSON.parse(data);
              auditData.errorMessage = responseData.message || 'Unknown error';
            } catch (e) {
              auditData.errorMessage = 'Error parsing response';
            }
          }

          await Audit.create(auditData);
        } catch (error) {
          console.error('Audit logging error:', error);
        }
      });

      originalSend.call(this, data);
    };

    next();
  };
};

module.exports = auditLogger;
