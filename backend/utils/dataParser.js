const Papa = require('papaparse');
const XLSX = require('xlsx');
const fs = require('fs');

class DataParser {
  // Parse CSV file
  parseCSV(filePath) {
    return new Promise((resolve, reject) => {
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        Papa.parse(fileContent, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.trim(),
          transform: (value) => value.trim(),
          complete: (results) => {
            if (results.errors.length > 0) {
              reject(new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`));
            } else {
              resolve(results.data);
            }
          },
          error: (error) => {
            reject(new Error(`CSV parsing failed: ${error.message}`));
          }
        });
      } catch (error) {
        reject(new Error(`Failed to read CSV file: ${error.message}`));
      }
    });
  }

  // Parse Excel file
  parseExcel(filePath) {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0]; // Use first sheet
      const worksheet = workbook.Sheets[sheetName];
      
      const data = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: ''
      });

      if (data.length === 0) {
        throw new Error('Excel file is empty');
      }

      // Convert to object array with headers
      const headers = data[0].map(header => String(header).trim());
      const rows = data.slice(1);

      const result = rows.map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = String(row[index] || '').trim();
        });
        return obj;
      }).filter(row => {
        // Filter out completely empty rows
        return Object.values(row).some(value => value !== '');
      });

      return result;

    } catch (error) {
      throw new Error(`Excel parsing failed: ${error.message}`);
    }
  }

  // Parse file based on extension
  async parseFile(filePath) {
    const extension = filePath.toLowerCase().split('.').pop();
    
    switch (extension) {
      case 'csv':
        return await this.parseCSV(filePath);
      case 'xlsx':
      case 'xls':
        return this.parseExcel(filePath);
      default:
        throw new Error(`Unsupported file format: ${extension}`);
    }
  }

  // Validate parsed data against template placeholders
  validateData(data, templatePlaceholders) {
    const errors = [];
    const requiredFields = templatePlaceholders
      .filter(p => p.required)
      .map(p => p.name);

    // Check if data is empty
    if (!data || data.length === 0) {
      errors.push('No data found in file');
      return { isValid: false, errors };
    }

    // Get available columns from data
    const availableColumns = Object.keys(data[0] || {});
    
    // Check for missing required columns
    const missingColumns = requiredFields.filter(field => 
      !availableColumns.includes(field)
    );

    if (missingColumns.length > 0) {
      errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    // Validate each row
    data.forEach((row, index) => {
      const rowNumber = index + 1;
      
      // Check required fields
      requiredFields.forEach(field => {
        if (!row[field] || row[field].trim() === '') {
          errors.push(`Row ${rowNumber}: Missing value for required field '${field}'`);
        }
      });

      // Validate email fields
      templatePlaceholders
        .filter(p => p.type === 'email')
        .forEach(placeholder => {
          const value = row[placeholder.name];
          if (value && !this.isValidEmail(value)) {
            errors.push(`Row ${rowNumber}: Invalid email format for '${placeholder.name}': ${value}`);
          }
        });

      // Validate date fields
      templatePlaceholders
        .filter(p => p.type === 'date')
        .forEach(placeholder => {
          const value = row[placeholder.name];
          if (value && !this.isValidDate(value)) {
            errors.push(`Row ${rowNumber}: Invalid date format for '${placeholder.name}': ${value}`);
          }
        });

      // Validate number fields
      templatePlaceholders
        .filter(p => p.type === 'number')
        .forEach(placeholder => {
          const value = row[placeholder.name];
          if (value && isNaN(Number(value))) {
            errors.push(`Row ${rowNumber}: Invalid number format for '${placeholder.name}': ${value}`);
          }
        });
    });

    return {
      isValid: errors.length === 0,
      errors,
      validRowCount: data.length,
      availableColumns
    };
  }

  // Email validation helper
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Date validation helper
  isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }

  // Generate sample CSV for template
  generateSampleCSV(templatePlaceholders) {
    const headers = templatePlaceholders.map(p => p.name);
    const sampleRow = templatePlaceholders.map(p => {
      switch (p.type) {
        case 'email':
          return 'example@company.com';
        case 'date':
          return '2024-01-01';
        case 'number':
          return '123';
        default:
          return `Sample ${p.name}`;
      }
    });

    const csvContent = [headers, sampleRow]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }

  // Clean up uploaded file
  cleanupFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('File cleanup error:', error);
    }
  }
}

module.exports = new DataParser();
