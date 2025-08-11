import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { Icon } from '../components/icons/IconSystem';

const TemplateForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'offer_letter',
    content: '',
    placeholders: [],
    accessRoles: ['admin', 'hr', 'staff'],
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      fetchTemplate();
    }
  }, [id, isEdit]);

  const fetchTemplate = async () => {
    try {
      setFetchLoading(true);
      const response = await api.get(`/templates/${id}`);
      const template = response.data.template;
      
      setFormData({
        name: template.name,
        description: template.description || '',
        type: template.type,
        content: template.content,
        placeholders: template.placeholders || [],
        accessRoles: template.accessRoles || ['admin', 'hr', 'staff'],
        isActive: template.isActive
      });
    } catch (error) {
      console.error('Template fetch error:', error);
      toast.error('Failed to load template');
      navigate('/templates');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAccessRoleChange = (role) => {
    setFormData(prev => ({
      ...prev,
      accessRoles: prev.accessRoles.includes(role)
        ? prev.accessRoles.filter(r => r !== role)
        : [...prev.accessRoles, role]
    }));
  };

  const addPlaceholder = () => {
    setFormData(prev => ({
      ...prev,
      placeholders: [
        ...prev.placeholders,
        { name: '', description: '', type: 'text', required: true }
      ]
    }));
  };

  const updatePlaceholder = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      placeholders: prev.placeholders.map((placeholder, i) =>
        i === index ? { ...placeholder, [field]: value } : placeholder
      )
    }));
  };

  const removePlaceholder = (index) => {
    setFormData(prev => ({
      ...prev,
      placeholders: prev.placeholders.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Template name is required');
      return;
    }

    if (!formData.content.trim()) {
      toast.error('Template content is required');
      return;
    }

    if (formData.accessRoles.length === 0) {
      toast.error('At least one access role must be selected');
      return;
    }

    try {
      setLoading(true);
      
      if (isEdit) {
        await api.put(`/templates/${id}`, formData);
        toast.success('Template updated successfully');
      } else {
        await api.post('/templates', formData);
        toast.success('Template created successfully');
      }
      
      navigate('/templates');
    } catch (error) {
      console.error('Template save error:', error);
      toast.error(error.response?.data?.message || 'Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  const templateTypes = [
    { value: 'offer_letter', label: 'Offer Letter' },
    { value: 'appointment_letter', label: 'Appointment Letter' },
    { value: 'experience_letter', label: 'Experience Letter' },
    { value: 'certificate', label: 'Certificate' }
  ];

  const placeholderTypes = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'email', label: 'Email' }
  ];

  const roles = [
    { value: 'admin', label: 'Admin' },
    { value: 'hr', label: 'HR' },
    { value: 'staff', label: 'Staff' }
  ];

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Template' : 'Create New Template'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {isEdit ? 'Update template details and content' : 'Create a new document template'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Template Name *
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                className="input-field mt-1"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Job Offer Letter"
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Template Type *
              </label>
              <select
                name="type"
                id="type"
                required
                className="input-field mt-1"
                value={formData.type}
                onChange={handleChange}
              >
                {templateTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              id="description"
              rows={3}
              className="input-field mt-1"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the template"
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Access Roles *
            </label>
            <div className="space-y-2">
              {roles.map(role => (
                <label key={role.value} className="inline-flex items-center mr-6">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    checked={formData.accessRoles.includes(role.value)}
                    onChange={() => handleAccessRoleChange(role.value)}
                  />
                  <span className="ml-2 text-sm text-gray-700">{role.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="isActive"
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                checked={formData.isActive}
                onChange={handleChange}
              />
              <span className="ml-2 text-sm text-gray-700">Active Template</span>
            </label>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Template Content</h2>
          
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Content *
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Use placeholders like {`{{name}}`}, {`{{position}}`}, etc. in your content.
            </p>
            <textarea
              name="content"
              id="content"
              rows={12}
              required
              className="input-field mt-1 font-mono text-sm"
              value={formData.content}
              onChange={handleChange}
              placeholder="Enter your template content here..."
            />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Placeholders</h2>
            <button
              type="button"
              onClick={addPlaceholder}
              className="btn-primary inline-flex items-center text-sm"
            >
              <Icon name="plus" size="sm" theme="white" className="mr-1" />
              Add Placeholder
            </button>
          </div>

          {formData.placeholders.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No placeholders defined. Add placeholders to make your template dynamic.
            </p>
          ) : (
            <div className="space-y-4">
              {formData.placeholders.map((placeholder, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Name *
                      </label>
                      <input
                        type="text"
                        className="input-field mt-1"
                        value={placeholder.name}
                        onChange={(e) => updatePlaceholder(index, 'name', e.target.value)}
                        placeholder="e.g., name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Type
                      </label>
                      <select
                        className="input-field mt-1"
                        value={placeholder.type}
                        onChange={(e) => updatePlaceholder(index, 'type', e.target.value)}
                      >
                        {placeholderTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <input
                        type="text"
                        className="input-field mt-1"
                        value={placeholder.description}
                        onChange={(e) => updatePlaceholder(index, 'description', e.target.value)}
                        placeholder="Description of this placeholder"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        checked={placeholder.required}
                        onChange={(e) => updatePlaceholder(index, 'required', e.target.checked)}
                      />
                      <span className="ml-2 text-sm text-gray-700">Required</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => removePlaceholder(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Icon name="delete" size="md" theme="error" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/templates')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (
              <div className="spinner mr-2"></div>
            ) : null}
            {isEdit ? 'Update Template' : 'Create Template'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TemplateForm;
