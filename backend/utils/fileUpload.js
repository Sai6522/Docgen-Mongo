const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Template file storage
const templateStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/templates';
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `template-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Generated document storage
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/generated';
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `document-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// CSV/Excel file storage for bulk operations
const bulkDataStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/bulk';
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `bulk-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filter for templates
const templateFileFilter = (req, file, cb) => {
  const allowedTypes = ['.docx', '.pdf'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Only DOCX and PDF files are allowed for templates'), false);
  }
};

// File filter for bulk data
const bulkDataFileFilter = (req, file, cb) => {
  const allowedTypes = ['.csv', '.xlsx', '.xls'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV and Excel files are allowed for bulk data'), false);
  }
};

// Multer configurations
const uploadTemplate = multer({
  storage: templateStorage,
  fileFilter: templateFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

const uploadBulkData = multer({
  storage: bulkDataStorage,
  fileFilter: bulkDataFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Memory storage for temporary file processing
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

module.exports = {
  uploadTemplate,
  uploadBulkData,
  memoryUpload,
  ensureDirectoryExists
};
