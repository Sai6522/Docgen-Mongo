/**
 * Template-specific CSS styles for different document types
 */

const templateStyles = {
  // Certificate styles - Elegant and formal
  certificate: {
    container: {
      fontFamily: 'Georgia, serif',
      backgroundColor: '#fefefe',
      border: '8px solid #2c5aa0',
      borderRadius: '15px',
      padding: '60px 40px',
      margin: '20px auto',
      maxWidth: '800px',
      textAlign: 'center',
      boxShadow: '0 0 20px rgba(0,0,0,0.1)',
      background: 'linear-gradient(135deg, #fefefe 0%, #f8f9fa 100%)'
    },
    title: {
      fontSize: '36px',
      fontWeight: 'bold',
      color: '#2c5aa0',
      marginBottom: '30px',
      textTransform: 'uppercase',
      letterSpacing: '3px',
      textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
    },
    subtitle: {
      fontSize: '18px',
      color: '#666',
      marginBottom: '40px',
      fontStyle: 'italic'
    },
    content: {
      fontSize: '16px',
      lineHeight: '1.8',
      color: '#333',
      marginBottom: '40px',
      textAlign: 'justify'
    },
    signature: {
      marginTop: '50px',
      borderTop: '2px solid #2c5aa0',
      paddingTop: '20px'
    },
    decorative: {
      border: '3px double #2c5aa0',
      borderRadius: '10px',
      padding: '20px',
      margin: '20px 0'
    }
  },

  // Offer Letter styles - Professional and corporate
  offer_letter: {
    container: {
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#ffffff',
      padding: '40px',
      margin: '20px auto',
      maxWidth: '700px',
      border: '1px solid #ddd',
      borderRadius: '5px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    header: {
      borderBottom: '3px solid #0066cc',
      paddingBottom: '20px',
      marginBottom: '30px',
      textAlign: 'center'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#0066cc',
      marginBottom: '10px'
    },
    content: {
      fontSize: '14px',
      lineHeight: '1.6',
      color: '#333',
      textAlign: 'left'
    },
    section: {
      marginBottom: '25px',
      padding: '15px',
      backgroundColor: '#f8f9fa',
      borderLeft: '4px solid #0066cc',
      borderRadius: '0 5px 5px 0'
    },
    footer: {
      marginTop: '40px',
      paddingTop: '20px',
      borderTop: '1px solid #ddd',
      fontSize: '12px',
      color: '#666'
    }
  },

  // Appointment Letter styles - Official and formal
  appointment_letter: {
    container: {
      fontFamily: 'Times New Roman, serif',
      backgroundColor: '#ffffff',
      padding: '50px',
      margin: '20px auto',
      maxWidth: '750px',
      border: '2px solid #8B4513',
      borderRadius: '8px'
    },
    header: {
      textAlign: 'center',
      borderBottom: '2px solid #8B4513',
      paddingBottom: '25px',
      marginBottom: '35px'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#8B4513',
      marginBottom: '15px',
      textTransform: 'uppercase',
      letterSpacing: '2px'
    },
    content: {
      fontSize: '15px',
      lineHeight: '1.7',
      color: '#333',
      textAlign: 'justify'
    },
    terms: {
      backgroundColor: '#f5f5f0',
      border: '1px solid #8B4513',
      borderRadius: '5px',
      padding: '20px',
      margin: '25px 0'
    },
    signature: {
      marginTop: '50px',
      display: 'flex',
      justifyContent: 'space-between'
    }
  },

  // Experience Letter styles - Clean and professional
  experience_letter: {
    container: {
      fontFamily: 'Calibri, sans-serif',
      backgroundColor: '#ffffff',
      padding: '45px',
      margin: '20px auto',
      maxWidth: '720px',
      border: '1px solid #4a90a4',
      borderRadius: '10px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
    },
    header: {
      textAlign: 'center',
      marginBottom: '40px',
      paddingBottom: '20px',
      borderBottom: '2px solid #4a90a4'
    },
    title: {
      fontSize: '26px',
      fontWeight: 'bold',
      color: '#4a90a4',
      marginBottom: '10px'
    },
    content: {
      fontSize: '14px',
      lineHeight: '1.6',
      color: '#333',
      textAlign: 'left'
    },
    highlight: {
      backgroundColor: '#e8f4f8',
      border: '1px solid #4a90a4',
      borderRadius: '5px',
      padding: '15px',
      margin: '20px 0'
    },
    footer: {
      marginTop: '40px',
      textAlign: 'right',
      paddingTop: '20px',
      borderTop: '1px solid #4a90a4'
    }
  }
};

/**
 * Generate CSS string for a specific template type
 */
function generateTemplateCSS(templateType) {
  const styles = templateStyles[templateType];
  if (!styles) {
    return ''; // Return empty string for unknown template types
  }

  let css = `
    <style>
      .document-container {
        font-family: ${styles.container.fontFamily};
        background-color: ${styles.container.backgroundColor};
        padding: ${styles.container.padding};
        margin: ${styles.container.margin};
        max-width: ${styles.container.maxWidth};
        border: ${styles.container.border};
        border-radius: ${styles.container.borderRadius};
        ${styles.container.boxShadow ? `box-shadow: ${styles.container.boxShadow};` : ''}
        ${styles.container.background ? `background: ${styles.container.background};` : ''}
        ${styles.container.textAlign ? `text-align: ${styles.container.textAlign};` : ''}
      }
      
      .document-title {
        font-size: ${styles.title.fontSize};
        font-weight: ${styles.title.fontWeight};
        color: ${styles.title.color};
        margin-bottom: ${styles.title.marginBottom};
        ${styles.title.textTransform ? `text-transform: ${styles.title.textTransform};` : ''}
        ${styles.title.letterSpacing ? `letter-spacing: ${styles.title.letterSpacing};` : ''}
        ${styles.title.textShadow ? `text-shadow: ${styles.title.textShadow};` : ''}
      }
      
      .document-content {
        font-size: ${styles.content.fontSize};
        line-height: ${styles.content.lineHeight};
        color: ${styles.content.color};
        ${styles.content.textAlign ? `text-align: ${styles.content.textAlign};` : ''}
        ${styles.content.marginBottom ? `margin-bottom: ${styles.content.marginBottom};` : ''}
      }
  `;

  // Add template-specific styles
  if (templateType === 'certificate') {
    css += `
      .document-header {
        border-bottom: 3px solid #2c5aa0;
        padding-bottom: 20px;
        margin-bottom: 30px;
      }
      .decorative-border {
        border: 3px double #2c5aa0;
        border-radius: 10px;
        padding: 20px;
        margin: 20px 0;
      }
      .signature-section {
        margin-top: 50px;
        border-top: 2px solid #2c5aa0;
        padding-top: 20px;
      }
    `;
  } else if (templateType === 'offer_letter') {
    css += `
      .document-header {
        border-bottom: 3px solid #0066cc;
        padding-bottom: 20px;
        margin-bottom: 30px;
        text-align: center;
      }
      .content-section {
        margin-bottom: 25px;
        padding: 15px;
        background-color: #f8f9fa;
        border-left: 4px solid #0066cc;
        border-radius: 0 5px 5px 0;
      }
      .document-footer {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid #ddd;
        font-size: 12px;
        color: #666;
      }
    `;
  } else if (templateType === 'appointment_letter') {
    css += `
      .document-header {
        text-align: center;
        border-bottom: 2px solid #8B4513;
        padding-bottom: 25px;
        margin-bottom: 35px;
      }
      .terms-section {
        background-color: #f5f5f0;
        border: 1px solid #8B4513;
        border-radius: 5px;
        padding: 20px;
        margin: 25px 0;
      }
      .signature-section {
        margin-top: 50px;
        display: flex;
        justify-content: space-between;
      }
    `;
  } else if (templateType === 'experience_letter') {
    css += `
      .document-header {
        text-align: center;
        margin-bottom: 40px;
        padding-bottom: 20px;
        border-bottom: 2px solid #4a90a4;
      }
      .highlight-section {
        background-color: #e8f4f8;
        border: 1px solid #4a90a4;
        border-radius: 5px;
        padding: 15px;
        margin: 20px 0;
      }
      .document-footer {
        margin-top: 40px;
        text-align: right;
        padding-top: 20px;
        border-top: 1px solid #4a90a4;
      }
    `;
  }

  css += `
    </style>
  `;

  return css;
}

/**
 * Wrap content with template-specific HTML structure
 */
function wrapContentWithTemplate(content, templateName, templateType) {
  const css = generateTemplateCSS(templateType);
  
  let wrappedContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${templateName}</title>
      ${css}
    </head>
    <body>
      <div class="document-container">
        <div class="document-header">
          <h1 class="document-title">${templateName}</h1>
        </div>
        <div class="document-content">
          ${content.replace(/\n/g, '<br>')}
        </div>
        <div class="document-footer">
          <p><small>Generated on: ${new Date().toLocaleDateString()}</small></p>
        </div>
      </div>
    </body>
    </html>
  `;

  return wrappedContent;
}

module.exports = {
  templateStyles,
  generateTemplateCSS,
  wrapContentWithTemplate
};
