const PDFDocument = require('pdfkit');
const Docxtemplater = require('docxtemplater');
const PizZip = require('pizzip');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');
const fs = require('fs');
const path = require('path');
const { ensureDirectoryExists } = require('./fileUpload');
const { wrapContentWithTemplate, templateStyles } = require('./templateStyles');

class DocumentGenerator {
  constructor() {
    this.outputDir = 'uploads/generated';
    ensureDirectoryExists(this.outputDir);
  }

  // Replace placeholders in text content
  replacePlaceholders(content, placeholderValues) {
    let processedContent = content;
    
    // Replace placeholders in format {{placeholder}}
    Object.entries(placeholderValues).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
      processedContent = processedContent.replace(regex, value || '');
    });

    return processedContent;
  }

  // Generate PDF document with template-specific styling
  async generatePDF(template, placeholderValues, recipientName) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          margin: 50,
          size: 'A4'
        });

        const fileName = `${recipientName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;
        const filePath = path.join(this.outputDir, fileName);
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // Process content
        const processedContent = this.replacePlaceholders(template.content, placeholderValues);

        // Apply template-specific styling
        this.applyPDFTemplateStyle(doc, template, processedContent);

        doc.end();

        stream.on('finish', () => {
          resolve({
            fileName,
            filePath,
            fileUrl: `/uploads/generated/${fileName}`
          });
        });

        stream.on('error', reject);

      } catch (error) {
        reject(error);
      }
    });
  }

  // Apply template-specific styling to PDF
  applyPDFTemplateStyle(doc, template, content) {
    const templateType = template.type;

    switch (templateType) {
      case 'certificate':
        this.applyCertificateStyle(doc, template, content);
        break;
      case 'offer_letter':
        this.applyOfferLetterStyle(doc, template, content);
        break;
      case 'appointment_letter':
        this.applyAppointmentLetterStyle(doc, template, content);
        break;
      case 'experience_letter':
        this.applyExperienceLetterStyle(doc, template, content);
        break;
      default:
        this.applyDefaultStyle(doc, template, content);
    }
  }

  // Certificate style - Elegant and formal
  applyCertificateStyle(doc, template, content) {
    // Add decorative border
    doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
       .lineWidth(3)
       .strokeColor('#2c5aa0')
       .stroke();

    doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80)
       .lineWidth(1)
       .strokeColor('#2c5aa0')
       .stroke();

    // Title
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .fillColor('#2c5aa0')
       .text(template.name.toUpperCase(), { align: 'center' })
       .moveDown(2);

    // Content
    doc.fontSize(14)
       .font('Helvetica')
       .fillColor('#333333')
       .text(content, {
         align: 'center',
         lineGap: 8
       })
       .moveDown(3);

    // Footer
    doc.fontSize(10)
       .fillColor('gray')
       .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
  }

  // Offer Letter style - Professional and corporate
  applyOfferLetterStyle(doc, template, content) {
    // Header with blue line
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .fillColor('#0066cc')
       .text(template.name, { align: 'center' })
       .moveDown(0.5);

    doc.moveTo(50, doc.y)
       .lineTo(doc.page.width - 50, doc.y)
       .lineWidth(2)
       .strokeColor('#0066cc')
       .stroke()
       .moveDown(2);

    // Content
    doc.fontSize(12)
       .font('Helvetica')
       .fillColor('#333333')
       .text(content, {
         align: 'justify',
         lineGap: 6
       })
       .moveDown(2);

    // Footer
    doc.moveTo(50, doc.y)
       .lineTo(doc.page.width - 50, doc.y)
       .lineWidth(1)
       .strokeColor('#cccccc')
       .stroke()
       .moveDown(1);

    doc.fontSize(10)
       .fillColor('gray')
       .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'right' });
  }

  // Appointment Letter style - Official and formal
  applyAppointmentLetterStyle(doc, template, content) {
    // Header with brown theme
    doc.fontSize(22)
       .font('Times-Bold')
       .fillColor('#8B4513')
       .text(template.name.toUpperCase(), { align: 'center' })
       .moveDown(1);

    doc.moveTo(50, doc.y)
       .lineTo(doc.page.width - 50, doc.y)
       .lineWidth(2)
       .strokeColor('#8B4513')
       .stroke()
       .moveDown(2);

    // Content
    doc.fontSize(13)
       .font('Times-Roman')
       .fillColor('#333333')
       .text(content, {
         align: 'justify',
         lineGap: 7
       })
       .moveDown(3);

    // Footer
    doc.fontSize(10)
       .fillColor('gray')
       .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
  }

  // Experience Letter style - Clean and professional
  applyExperienceLetterStyle(doc, template, content) {
    // Header with teal theme
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .fillColor('#4a90a4')
       .text(template.name, { align: 'center' })
       .moveDown(1);

    doc.moveTo(50, doc.y)
       .lineTo(doc.page.width - 50, doc.y)
       .lineWidth(2)
       .strokeColor('#4a90a4')
       .stroke()
       .moveDown(2);

    // Content
    doc.fontSize(12)
       .font('Helvetica')
       .fillColor('#333333')
       .text(content, {
         align: 'left',
         lineGap: 6
       })
       .moveDown(2);

    // Footer
    doc.moveTo(50, doc.y)
       .lineTo(doc.page.width - 50, doc.y)
       .lineWidth(1)
       .strokeColor('#4a90a4')
       .stroke()
       .moveDown(1);

    doc.fontSize(10)
       .fillColor('gray')
       .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'right' });
  }

  // Default style for unknown template types
  applyDefaultStyle(doc, template, content) {
    // Simple header
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text(template.name, { align: 'center' })
       .moveDown(2);

    // Content
    doc.fontSize(12)
       .font('Helvetica')
       .text(content, {
         align: 'justify',
         lineGap: 5
       });

    // Footer
    doc.moveDown(3)
       .fontSize(10)
       .fillColor('gray')
       .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'right' });
  }

  // Generate DOCX document from template
  async generateDOCX(template, placeholderValues, recipientName) {
    try {
      let templateBuffer;

      if (template.fileUrl && fs.existsSync(template.fileUrl)) {
        // Use uploaded DOCX template
        templateBuffer = fs.readFileSync(template.fileUrl);
      } else {
        // Create a simple DOCX from HTML content
        return this.generateDOCXFromHTML(template, placeholderValues, recipientName);
      }

      const zip = new PizZip(templateBuffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      // Set the template variables
      doc.setData(placeholderValues);

      try {
        doc.render();
      } catch (error) {
        console.error('Template rendering error:', error);
        throw new Error('Failed to render template: ' + error.message);
      }

      const buffer = doc.getZip().generate({ type: 'nodebuffer' });

      const fileName = `${recipientName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.docx`;
      const filePath = path.join(this.outputDir, fileName);

      fs.writeFileSync(filePath, buffer);

      return {
        fileName,
        filePath,
        fileUrl: `/uploads/generated/${fileName}`
      };

    } catch (error) {
      console.error('DOCX generation error:', error);
      throw error;
    }
  }

  // Generate DOCX from HTML content (fallback)
  async generateDOCXFromHTML(template, placeholderValues, recipientName) {
    try {
      // Process content with placeholders
      const processedContent = this.replacePlaceholders(template.content, placeholderValues);
      
      // Get template-specific styling
      const styling = this.getDOCXTemplateStyle(template.type);
      
      // Split content into paragraphs
      const contentLines = processedContent.split('\n').filter(line => line.trim() !== '');
      
      // Create document sections
      const children = [];
      
      // Add title with template-specific styling
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: template.name,
              bold: true,
              size: styling.title.size,
              color: styling.title.color,
            }),
          ],
          heading: HeadingLevel.TITLE,
          alignment: styling.title.alignment,
          spacing: {
            after: 400,
          },
        })
      );
      
      // Add content paragraphs with template-specific styling
      contentLines.forEach(line => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line,
                size: styling.content.size,
                color: styling.content.color,
              }),
            ],
            alignment: styling.content.alignment,
            spacing: {
              after: 200,
            },
          })
        );
      });
      
      // Add generation date
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Generated on: ${new Date().toLocaleDateString()}`,
              size: 20,
              italics: true,
              color: "666666",
            }),
          ],
          alignment: styling.footer.alignment,
          spacing: {
            before: 400,
          },
        })
      );

      // Create the document with template-specific properties
      const doc = new Document({
        sections: [
          {
            properties: styling.section,
            children: children,
          },
        ],
      });

      // Generate buffer
      const buffer = await Packer.toBuffer(doc);

      const fileName = `${recipientName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.docx`;
      const filePath = path.join(this.outputDir, fileName);

      fs.writeFileSync(filePath, buffer);

      return {
        fileName,
        filePath,
        fileUrl: `/uploads/generated/${fileName}`
      };

    } catch (error) {
      console.error('DOCX generation error:', error);
      throw error;
    }
  }

  // Get DOCX template-specific styling
  getDOCXTemplateStyle(templateType) {
    const styles = {
      certificate: {
        title: {
          size: 32,
          color: '2c5aa0',
          alignment: AlignmentType.CENTER
        },
        content: {
          size: 24,
          color: '333333',
          alignment: AlignmentType.CENTER
        },
        footer: {
          alignment: AlignmentType.CENTER
        },
        section: {
          margins: {
            top: 1440, // 1 inch
            right: 1440,
            bottom: 1440,
            left: 1440,
          }
        }
      },
      offer_letter: {
        title: {
          size: 28,
          color: '0066cc',
          alignment: AlignmentType.CENTER
        },
        content: {
          size: 22,
          color: '333333',
          alignment: AlignmentType.JUSTIFIED
        },
        footer: {
          alignment: AlignmentType.RIGHT
        },
        section: {
          margins: {
            top: 1440,
            right: 1440,
            bottom: 1440,
            left: 1440,
          }
        }
      },
      appointment_letter: {
        title: {
          size: 30,
          color: '8B4513',
          alignment: AlignmentType.CENTER
        },
        content: {
          size: 24,
          color: '333333',
          alignment: AlignmentType.JUSTIFIED
        },
        footer: {
          alignment: AlignmentType.CENTER
        },
        section: {
          margins: {
            top: 1440,
            right: 1440,
            bottom: 1440,
            left: 1440,
          }
        }
      },
      experience_letter: {
        title: {
          size: 26,
          color: '4a90a4',
          alignment: AlignmentType.CENTER
        },
        content: {
          size: 22,
          color: '333333',
          alignment: AlignmentType.LEFT
        },
        footer: {
          alignment: AlignmentType.RIGHT
        },
        section: {
          margins: {
            top: 1440,
            right: 1440,
            bottom: 1440,
            left: 1440,
          }
        }
      }
    };

    // Return specific style or default
    return styles[templateType] || styles.certificate;
  }

  // Generate document based on type
  async generateDocument(template, placeholderValues, recipientName, fileType = 'pdf') {
    try {
      if (fileType === 'pdf') {
        return await this.generatePDF(template, placeholderValues, recipientName);
      } else if (fileType === 'docx') {
        return await this.generateDOCX(template, placeholderValues, recipientName);
      } else {
        throw new Error('Unsupported file type');
      }
    } catch (error) {
      console.error('Document generation error:', error);
      throw error;
    }
  }

  // Clean up old generated files (optional utility)
  cleanupOldFiles(daysOld = 7) {
    try {
      const files = fs.readdirSync(this.outputDir);
      const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);

      files.forEach(file => {
        const filePath = path.join(this.outputDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime.getTime() < cutoffTime) {
          fs.unlinkSync(filePath);
          console.log(`Cleaned up old file: ${file}`);
        }
      });
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
}

module.exports = new DocumentGenerator();
