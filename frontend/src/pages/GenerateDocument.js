import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { Icon } from '../components/icons/IconSystem';

const GenerateDocument = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preselectedTemplate = searchParams.get('template');

  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    templateId: preselectedTemplate || '',
    recipientName: '',
    recipientEmail: '',
    placeholderValues: {},
    fileType: 'pdf',
    sendEmail: false
  });
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (formData.templateId) {
      const template = templates.find(t => t._id === formData.templateId);
      console.log('🔄 Template selection changed:', formData.templateId);
      console.log('📄 Found template:', template);
      
      setSelectedTemplate(template);
      
      if (template && template.placeholders) {
        // Initialize placeholder values
        const initialValues = {};
        template.placeholders.forEach(placeholder => {
          initialValues[placeholder.name] = formData.placeholderValues[placeholder.name] || '';
        });
        console.log('🔧 Initializing placeholder values:', initialValues);
        
        setFormData(prev => ({
          ...prev,
          placeholderValues: initialValues
        }));
      }
    } else {
      setSelectedTemplate(null);
      setFormData(prev => ({
        ...prev,
        placeholderValues: {}
      }));
    }
  }, [formData.templateId, templates]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/templates?active=true');
      setTemplates(response.data.templates);
      
      if (preselectedTemplate) {
        setFormData(prev => ({ ...prev, templateId: preselectedTemplate }));
      }
    } catch (error) {
      console.error('Templates fetch error:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePlaceholderChange = (placeholderName, value) => {
    setFormData(prev => ({
      ...prev,
      placeholderValues: {
        ...prev.placeholderValues,
        [placeholderName]: value
      }
    }));
  };

  const generatePreview = () => {
    if (!selectedTemplate) return;

    let content = selectedTemplate.content;
    Object.entries(formData.placeholderValues).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
      content = content.replace(regex, value || `[${key}]`);
    });

    setPreview(content);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🚀 Form submission started');
    console.log('📋 Form data:', formData);
    console.log('📄 Selected template:', selectedTemplate);
    
    if (!formData.templateId) {
      toast.error('Please select a template');
      return;
    }

    if (!selectedTemplate) {
      toast.error('Template not loaded. Please refresh and try again.');
      return;
    }

    if (!formData.recipientName.trim()) {
      toast.error('Recipient name is required');
      return;
    }

    if (formData.sendEmail && !formData.recipientEmail.trim()) {
      toast.error('Recipient email is required when sending email');
      return;
    }

    // Validate required placeholders
    console.log('🔍 Validating placeholders...');
    console.log('📝 Template placeholders:', selectedTemplate.placeholders);
    console.log('💾 Form placeholder values:', formData.placeholderValues);
    
    const missingPlaceholders = selectedTemplate.placeholders
      .filter(p => p.required && !formData.placeholderValues[p.name]?.trim())
      .map(p => p.name);

    console.log('❌ Missing placeholders:', missingPlaceholders);

    if (missingPlaceholders.length > 0) {
      toast.error(`Missing required fields: ${missingPlaceholders.join(', ')}`);
      return;
    }

    try {
      setGenerating(true);
      console.log('📤 Sending API request...');
      
      // Prepare the request data, excluding empty optional fields
      const requestData = {
        templateId: formData.templateId,
        recipientName: formData.recipientName.trim(),
        placeholderValues: formData.placeholderValues,
        fileType: formData.fileType,
        sendEmail: formData.sendEmail
      };
      
      // Only include recipientEmail if it's not empty or if sendEmail is true
      if (formData.recipientEmail.trim() || formData.sendEmail) {
        requestData.recipientEmail = formData.recipientEmail.trim();
      }
      
      console.log('📋 Request data:', requestData);
      
      const response = await api.post('/docs/generate', requestData);
      console.log('✅ API response:', response.data);
      
      toast.success('Document generated successfully!');
      
      if (formData.sendEmail && response.data.emailResult?.success) {
        toast.success('Document sent via email!');
      } else if (formData.sendEmail && !response.data.emailResult?.success) {
        toast.warning('Document generated but email sending failed');
      }

      // Download the generated document with proper authentication
      await downloadDocument(response.data.document.id, response.data.document.fileName);

      // Reset form
      setFormData({
        templateId: '',
        recipientName: '',
        recipientEmail: '',
        placeholderValues: {},
        fileType: 'pdf',
        sendEmail: false
      });
      setSelectedTemplate(null);
      setPreview('');

    } catch (error) {
      console.error('❌ Document generation error:', error);
      console.error('❌ Error response:', error.response?.data);
      
      // Show specific error message from backend
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(err => err.message || err).join(', ');
        toast.error(`Validation errors: ${errorMessages}`);
      } else {
        toast.error('Failed to generate document. Please try again.');
      }
    } finally {
      setGenerating(false);
    }
  };

  // Function to download document with authentication
  const downloadDocument = async (documentId, documentName) => {
    try {
      console.log('📥 Downloading document:', documentId);
      
      const response = await api.get(`/docs/${documentId}/download`, {
        responseType: 'blob'
      });
      
      // Determine file type from filename extension
      const fileExtension = documentName.split('.').pop().toLowerCase();
      let mimeType = 'application/octet-stream'; // Default fallback
      
      if (fileExtension === 'pdf') {
        mimeType = 'application/pdf';
      } else if (fileExtension === 'docx') {
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      }
      
      console.log('📄 File type detected:', fileExtension, 'MIME type:', mimeType);
      
      // Create blob with correct MIME type
      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      
      // Create temporary link and trigger download with original filename
      const link = document.createElement('a');
      link.href = url;
      link.download = documentName || `document-${documentId}`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Document downloaded successfully:', documentName);
      
    } catch (error) {
      console.error('❌ Document download error:', error);
      toast.error('Failed to download document. Please try again.');
    }
  };

  const getInputType = (placeholderType) => {
    switch (placeholderType) {
      case 'email':
        return 'email';
      case 'number':
        return 'number';
      case 'date':
        return 'date';
      default:
        return 'text';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Generate Document</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create a new document from a template
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Document Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="templateId" className="block text-sm font-medium text-gray-700">
                    Template *
                  </label>
                  <select
                    name="templateId"
                    id="templateId"
                    required
                    className="input-field mt-1"
                    value={formData.templateId}
                    onChange={handleChange}
                  >
                    <option value="">Select a template</option>
                    {templates.map(template => (
                      <option key={template._id} value={template._id}>
                        {template.name} ({template.type.replace('_', ' ')})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700">
                    Recipient Name *
                  </label>
                  <input
                    type="text"
                    name="recipientName"
                    id="recipientName"
                    required
                    className="input-field mt-1"
                    value={formData.recipientName}
                    onChange={handleChange}
                    placeholder="Enter recipient's full name"
                  />
                </div>

                <div>
                  <label htmlFor="recipientEmail" className="block text-sm font-medium text-gray-700">
                    Recipient Email
                  </label>
                  <input
                    type="email"
                    name="recipientEmail"
                    id="recipientEmail"
                    className="input-field mt-1"
                    value={formData.recipientEmail}
                    onChange={handleChange}
                    placeholder="Enter recipient's email (optional)"
                  />
                </div>

                <div>
                  <label htmlFor="fileType" className="block text-sm font-medium text-gray-700">
                    File Type
                  </label>
                  <select
                    name="fileType"
                    id="fileType"
                    className="input-field mt-1"
                    value={formData.fileType}
                    onChange={handleChange}
                  >
                    <option value="pdf">PDF</option>
                    <option value="docx">DOCX</option>
                  </select>
                </div>

                <div>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="sendEmail"
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      checked={formData.sendEmail}
                      onChange={handleChange}
                    />
                    <span className="ml-2 text-sm text-gray-700">Send document via email</span>
                  </label>
                </div>
              </div>
            </div>

            {selectedTemplate && selectedTemplate.placeholders.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Template Fields</h2>
                
                <div className="space-y-4">
                  {selectedTemplate.placeholders.map((placeholder) => (
                    <div key={placeholder.name}>
                      <label className="block text-sm font-medium text-gray-700">
                        {placeholder.name.charAt(0).toUpperCase() + placeholder.name.slice(1).replace('_', ' ')}
                        {placeholder.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {placeholder.description && (
                        <p className="text-xs text-gray-500 mt-1">{placeholder.description}</p>
                      )}
                      <input
                        type={getInputType(placeholder.type)}
                        required={placeholder.required}
                        className="input-field mt-1"
                        value={formData.placeholderValues[placeholder.name] || ''}
                        onChange={(e) => handlePlaceholderChange(placeholder.name, e.target.value)}
                        placeholder={`Enter ${placeholder.name.replace('_', ' ')}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button
                type="button"
                onClick={generatePreview}
                disabled={!selectedTemplate}
                className="btn-secondary inline-flex items-center"
              >
                <Icon name="view" size="md" theme="default" className="mr-2" />
                Preview
              </button>

              <button
                type="submit"
                disabled={generating || !selectedTemplate}
                className="btn-primary inline-flex items-center"
              >
                {generating ? (
                  <div className="spinner mr-2"></div>
                ) : (
                  <Icon name="download" size="md" theme="default" className="mr-2" />
                )}
                Generate Document
              </button>
            </div>
          </form>
        </div>

        {/* Preview */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Preview</h2>
          
          {preview ? (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-900 font-mono">
                {preview}
              </pre>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Icon name="view" size="3xl" theme="default" className="mx-auto text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No preview available</h3>
              <p className="mt-1 text-sm text-gray-500">
                Select a template and click "Preview" to see the document content.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateDocument;
