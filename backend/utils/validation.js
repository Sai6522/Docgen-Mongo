const Joi = require('joi');

const userRegistrationSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'hr', 'staff').default('staff')
});

const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const templateSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500),
  type: Joi.string().valid('offer_letter', 'appointment_letter', 'experience_letter', 'certificate').required(),
  content: Joi.string().required(),
  placeholders: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      description: Joi.string(),
      type: Joi.string().valid('text', 'number', 'date', 'email').default('text'),
      required: Joi.boolean().default(true)
    })
  ),
  accessRoles: Joi.array().items(Joi.string().valid('admin', 'hr', 'staff')),
  isActive: Joi.boolean().default(true)
});

const documentGenerationSchema = Joi.object({
  templateId: Joi.string().required(),
  recipientName: Joi.string().min(2).max(100).required(),
  recipientEmail: Joi.string().email().allow('').optional(),
  placeholderValues: Joi.object().required(),
  fileType: Joi.string().valid('pdf', 'docx').default('pdf'),
  sendEmail: Joi.boolean().default(false)
});

const bulkGenerationSchema = Joi.object({
  templateId: Joi.string().required(),
  records: Joi.array().items(Joi.object()).min(1).required(),
  fileType: Joi.string().valid('pdf', 'docx').default('pdf'),
  sendEmail: Joi.boolean().default(false)
});

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation Error',
        errors: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

module.exports = {
  validate,
  userRegistrationSchema,
  userLoginSchema,
  templateSchema,
  documentGenerationSchema,
  bulkGenerationSchema
};
