import React from 'react';

const TemplatePreview = ({ template, placeholderValues = {} }) => {
  // Replace placeholders in content
  const processContent = (content) => {
    let processedContent = content;
    Object.entries(placeholderValues).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
      processedContent = processedContent.replace(regex, value || `[${key}]`);
    });
    return processedContent;
  };

  // Get template-specific CSS classes
  const getTemplateClasses = (type) => {
    const baseClasses = "template-preview p-6 border rounded-lg shadow-sm bg-white";
    
    switch (type) {
      case 'certificate':
        return `${baseClasses} certificate-template`;
      case 'offer_letter':
        return `${baseClasses} offer-letter-template`;
      case 'appointment_letter':
        return `${baseClasses} appointment-letter-template`;
      case 'experience_letter':
        return `${baseClasses} experience-letter-template`;
      default:
        return `${baseClasses} default-template`;
    }
  };

  const processedContent = processContent(template.content);

  return (
    <div className="template-preview-container">
      <style jsx>{`
        /* Certificate Template Styles */
        .certificate-template {
          border: 4px solid #2c5aa0 !important;
          background: linear-gradient(135deg, #fefefe 0%, #f8f9fa 100%);
          text-align: center;
          font-family: Georgia, serif;
        }
        .certificate-template .template-title {
          color: #2c5aa0;
          font-size: 2rem;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 1.5rem;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }
        .certificate-template .template-content {
          font-size: 1.1rem;
          line-height: 1.8;
          color: #333;
          margin: 2rem 0;
        }

        /* Offer Letter Template Styles */
        .offer-letter-template {
          border-left: 4px solid #0066cc !important;
          font-family: Arial, sans-serif;
        }
        .offer-letter-template .template-title {
          color: #0066cc;
          font-size: 1.5rem;
          font-weight: bold;
          border-bottom: 2px solid #0066cc;
          padding-bottom: 0.5rem;
          margin-bottom: 1.5rem;
        }
        .offer-letter-template .template-content {
          font-size: 0.95rem;
          line-height: 1.6;
          color: #333;
          text-align: left;
        }

        /* Appointment Letter Template Styles */
        .appointment-letter-template {
          border: 2px solid #8B4513 !important;
          font-family: 'Times New Roman', serif;
        }
        .appointment-letter-template .template-title {
          color: #8B4513;
          font-size: 1.75rem;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
          text-align: center;
          border-bottom: 2px solid #8B4513;
          padding-bottom: 1rem;
          margin-bottom: 1.5rem;
        }
        .appointment-letter-template .template-content {
          font-size: 1rem;
          line-height: 1.7;
          color: #333;
          text-align: justify;
        }

        /* Experience Letter Template Styles */
        .experience-letter-template {
          border-top: 4px solid #4a90a4 !important;
          font-family: Calibri, sans-serif;
        }
        .experience-letter-template .template-title {
          color: #4a90a4;
          font-size: 1.6rem;
          font-weight: bold;
          text-align: center;
          border-bottom: 2px solid #4a90a4;
          padding-bottom: 0.75rem;
          margin-bottom: 1.5rem;
        }
        .experience-letter-template .template-content {
          font-size: 0.95rem;
          line-height: 1.6;
          color: #333;
          text-align: left;
        }

        /* Default Template Styles */
        .default-template .template-title {
          color: #333;
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }
        .default-template .template-content {
          font-size: 1rem;
          line-height: 1.6;
          color: #333;
        }

        /* Common styles */
        .template-preview {
          max-width: 800px;
          margin: 0 auto;
          min-height: 400px;
        }
        .template-footer {
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid #ddd;
          font-size: 0.8rem;
          color: #666;
          text-align: right;
        }
      `}</style>
      
      <div className={getTemplateClasses(template.type)}>
        <h1 className="template-title">{template.name}</h1>
        <div className="template-content">
          {processedContent.split('\n').map((line, index) => (
            <p key={index} className="mb-2">
              {line || '\u00A0'}
            </p>
          ))}
        </div>
        <div className="template-footer">
          <small>Generated on: {new Date().toLocaleDateString()}</small>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview;
