import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { Icon } from '../components/icons/IconSystem';

const BulkGenerate = () => {
  const [templates, setTemplates] = useState([]);
  const [formData, setFormData] = useState({
    templateId: '',
    fileType: 'pdf',
    sendEmail: false
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/templates?active=true');
      setTemplates(response.data.templates);
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

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const allowedTypes = ['.csv', '.xlsx', '.xls'];
      const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
      
      if (!allowedTypes.includes(fileExtension)) {
        toast.error('Please select a CSV or Excel file');
        e.target.value = '';
        return;
      }
      
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        e.target.value = '';
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const downloadSampleCSV = async () => {
    if (!formData.templateId) {
      toast.error('Please select a template first');
      return;
    }

    try {
      const response = await api.get(`/templates/${formData.templateId}/sample-csv`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sample.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Sample CSV downloaded');
    } catch (error) {
      console.error('CSV download error:', error);
      toast.error('Failed to download sample CSV');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.templateId) {
      toast.error('Please select a template');
      return;
    }

    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      setGenerating(true);
      setResults(null);

      const submitData = new FormData();
      submitData.append('file', file); // Fixed: backend expects 'file', not 'csvFile'
      submitData.append('templateId', formData.templateId);
      submitData.append('fileType', formData.fileType);
      submitData.append('sendEmail', formData.sendEmail);

      const response = await api.post('/docs/bulk-generate', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Handle the response based on the actual backend response structure
      const responseData = response.data;
      console.log('Bulk generation response:', responseData);
      
      if (responseData.documents && responseData.documents.length > 0) {
        setResults({
          documents: responseData.documents,
          successCount: responseData.count || responseData.documents.length,
          errors: responseData.errors || [],
          summary: responseData.summary || {
            total: responseData.documents.length,
            successful: responseData.count || responseData.documents.length,
            failed: responseData.errors ? responseData.errors.length : 0
          }
        });
        
        toast.success(`Bulk generation completed! ${responseData.count || responseData.documents.length} documents generated.`);
      } else {
        toast.warning('Bulk generation completed but no documents were generated.');
      }

      // Reset form
      setFile(null);
      document.getElementById('file-upload').value = '';

    } catch (error) {
      console.error('Bulk generation error:', error);
      toast.error(error.response?.data?.message || 'Failed to generate documents');
    } finally {
      setGenerating(false);
    }
  };

  // Function to download a single document with authentication
  const downloadDocument = async (documentId, documentName) => {
    try {
      console.log('📥 Downloading document:', documentId);
      
      const response = await api.get(`/docs/${documentId}/download`, {
        responseType: 'blob'
      });
      
      // Determine file type from filename extension
      const fileExtension = documentName ? documentName.split('.').pop().toLowerCase() : 'pdf';
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
      toast.error(`Failed to download ${documentName || 'document'}`);
    }
  };

  const downloadAllDocuments = async () => {
    if (!results || !results.documents.length) return;

    toast.info(`Starting download of ${results.documents.length} documents...`);
    
    // Download documents one by one with a small delay
    for (let i = 0; i < results.documents.length; i++) {
      const doc = results.documents[i];
      await downloadDocument(doc._id || doc.id, doc.name);
      
      // Small delay between downloads to avoid overwhelming the browser
      if (i < results.documents.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    toast.success('All documents downloaded successfully!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bulk Document Generation</h1>
        <p className="mt-1 text-sm text-gray-500">
          Generate multiple documents from CSV or Excel file
        </p>
      </div>

      <div className="space-y-6">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Instructions:</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Select a template from the dropdown</li>
            <li>Download the sample CSV to see the required format</li>
            <li>Prepare your data file with the same column headers</li>
            <li>Upload your CSV or Excel file</li>
            <li>Choose file type and email options</li>
            <li>Click "Generate Documents" to process</li>
          </ol>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Generation Settings</h2>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
            </div>

            <div className="mt-6">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="sendEmail"
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  checked={formData.sendEmail}
                  onChange={handleChange}
                />
                <span className="ml-2 text-sm text-gray-700">
                  Send documents via email (requires email column in data)
                </span>
              </label>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={downloadSampleCSV}
                disabled={!formData.templateId}
                className="btn-secondary inline-flex items-center"
              >
                <Icon name="download" size="md" theme="white" className="mr-2" />
                Download Sample CSV
              </button>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Data File</h2>
            
            <div>
              <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
                CSV or Excel File *
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Icon name="upload" size="3xl" theme="default" className="mx-auto text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">CSV, XLSX, XLS up to 5MB</p>
                  {file && (
                    <p className="text-sm text-green-600 font-medium">
                      Selected: {file.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={generating || !formData.templateId || !file}
              className="btn-primary inline-flex items-center"
            >
              {generating ? (
                <>
                  <div className="spinner mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Icon name="download" size="md" theme="white" className="mr-2" />
                  Generate Documents
                </>
              )}
            </button>
          </div>
        </form>

        {/* Results */}
        {results && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Generation Results</h2>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Icon name="success" size="xl" theme="success" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">Successful</p>
                    <p className="text-2xl font-bold text-green-900">{results.successCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Icon name="error" size="xl" theme="error" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">Failed</p>
                    <p className="text-2xl font-bold text-red-900">{results.failureCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Icon name="clock" size="xl" theme="info" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-800">Total</p>
                    <p className="text-2xl font-bold text-blue-900">{results.totalRecords}</p>
                  </div>
                </div>
              </div>
            </div>

            {results.successCount > 0 && (
              <div className="mb-6">
                <button
                  onClick={downloadAllDocuments}
                  className="btn-primary inline-flex items-center"
                >
                  <Icon name="download" size="md" theme="white" className="mr-2" />
                  Download All Documents
                </button>
              </div>
            )}

            {/* Successful Documents */}
            {results.documents.length > 0 && (
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-900 mb-3">Generated Documents</h3>
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Recipient
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          File
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {results.documents.map((doc, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {doc.recipientName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {doc.recipientEmail || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {doc.fileName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => downloadDocument(doc._id || doc.id, doc.name)}
                              className="text-primary-600 hover:text-primary-900 underline cursor-pointer"
                            >
                              Download
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Errors */}
            {results.errors.length > 0 && (
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">Errors</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <ul className="text-sm text-red-800 space-y-1">
                    {results.errors.map((error, index) => (
                      <li key={index}>
                        Row {error.recordIndex} ({error.recipientName}): {error.error}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Email Results */}
            {results.emailResults && results.emailResults.length > 0 && (
              <div className="mt-6">
                <h3 className="text-md font-medium text-gray-900 mb-3">Email Results</h3>
                <div className="space-y-2">
                  {results.emailResults.map((emailResult, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg text-sm ${
                        emailResult.success
                          ? 'bg-green-50 text-green-800'
                          : 'bg-red-50 text-red-800'
                      }`}
                    >
                      {emailResult.recipientEmail}: {
                        emailResult.success ? 'Email sent successfully' : emailResult.error
                      }
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkGenerate;
