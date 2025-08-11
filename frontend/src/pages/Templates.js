import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  Icon, 
  IconButton, 
  StatusIcon,
  AnimatedIcon 
} from '../components/icons/IconSystem';
import {
  StatusIndicator,
  LoadingIcon,
  ActionIconGroup,
  FileTypeIcon,
  SortableIcon,
  ToggleIcon
} from '../components/icons/InteractiveIcons';
import TemplatePreview from '../components/TemplatePreview';

const Templates = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedTemplates, setSelectedTemplates] = useState([]);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filters, setFilters] = useState({
    type: 'all',
    search: '',
    recipientEmail: '',
    isActive: 'all',
    limit: 12,
    page: 1
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, [filters, sortBy, sortOrder]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.type !== 'all') {
        params.append('type', filters.type);
      }
      if (filters.search.trim() !== '') {
        params.append('search', filters.search);
      }
      if (filters.recipientEmail.trim() !== '') {
        params.append('recipientEmail', filters.recipientEmail);
      }
      if (filters.isActive !== 'all') {
        params.append('active', filters.isActive);
      }
      params.append('limit', filters.limit);
      params.append('page', filters.page);
      
      const response = await api.get(`/templates?${params.toString()}`);
      setTemplates(response.data.templates || []);
      setPagination(response.data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0
      });
    } catch (error) {
      console.error('Templates fetch error:', error);
      // Only show error if it's not a 401/403 (authentication/authorization error)
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        toast.error('Could not load templates');
      }
      setTemplates([]); // Set empty array on error
      setPagination({ currentPage: 1, totalPages: 1, totalItems: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleDelete = async (templateId, hardDelete = false) => {
    const deleteType = hardDelete ? 'permanently delete' : 'delete';
    const confirmMessage = hardDelete 
      ? 'Are you sure you want to PERMANENTLY delete this template? This action cannot be undone and will remove the template completely from the database.'
      : 'Are you sure you want to delete this template? It will be marked as inactive but can be recovered later.';
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const url = hardDelete 
        ? `/templates/${templateId}?hard=true`
        : `/templates/${templateId}`;
      
      await api.delete(url);
      
      const successMessage = hardDelete 
        ? 'Template permanently deleted successfully'
        : 'Template deleted successfully';
      
      toast.success(successMessage);
      fetchTemplates();
    } catch (error) {
      console.error('Template deletion error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete template';
      toast.error(errorMessage);
    }
  };

  const downloadSampleCSV = async (templateId) => {
    try {
      const response = await api.get(`/templates/${templateId}/sample-csv`, {
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

  const templateTypes = [
    { value: 'all', label: 'All Templates' },
    { value: 'offer_letter', label: 'Offer Letters' },
    { value: 'appointment_letter', label: 'Appointment Letters' },
    { value: 'experience_letter', label: 'Experience Letters' },
    { value: 'certificate', label: 'Certificates' }
  ];

  const getTypeColor = (type) => {
    const colors = {
      offer_letter: 'bg-blue-100 text-blue-800',
      appointment_letter: 'bg-green-100 text-green-800',
      experience_letter: 'bg-purple-100 text-purple-800',
      certificate: 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const formatType = (type) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const canEdit = (template) => {
    // Admin can edit all templates, HR can edit their own templates
    if (user.role === 'admin') return true;
    if (user.role === 'hr' && template.createdBy._id === user.id) return true;
    return false;
  };

  const canDelete = () => {
    // Only admin can delete templates
    return user.role === 'admin';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage document templates for generation
          </p>
        </div>
        {(user.role === 'admin' || user.role === 'hr') && (
          <div className="mt-4 sm:mt-0">
            <Link
              to="/templates/new"
              className="btn-primary inline-flex items-center"
            >
              <Icon name="plus" size="md" theme="white" className="mr-2" />
              New Template
            </Link>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Template
            </label>
            <select
              name="type"
              id="type"
              className="input-field mt-1"
              value={filters.type}
              onChange={handleFilterChange}
            >
              <option value="all">All Templates</option>
              {templateTypes.filter(type => type.value !== 'all').map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Search
            </label>
            <input
              type="text"
              name="search"
              id="search"
              className="input-field mt-1"
              placeholder="Search templates..."
              value={filters.search}
              onChange={handleFilterChange}
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
              placeholder="mike.johnson@example.com"
              value={filters.recipientEmail}
              onChange={handleFilterChange}
            />
          </div>

          <div>
            <label htmlFor="isActive" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              name="isActive"
              id="isActive"
              className="input-field mt-1"
              value={filters.isActive}
              onChange={handleFilterChange}
            >
              <option value="all">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div>
            <label htmlFor="limit" className="block text-sm font-medium text-gray-700">
              Items per page
            </label>
            <select
              name="limit"
              id="limit"
              className="input-field mt-1"
              value={filters.limit}
              onChange={handleFilterChange}
            >
              <option value="6">6</option>
              <option value="12">12</option>
              <option value="24">24</option>
              <option value="48">48</option>
            </select>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      {templates.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <div key={template._id} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(template.type)}`}>
                      {formatType(template.type)}
                    </span>
                    <div className="flex items-center space-x-2">
                      {template.isActive ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {template.name}
                  </h3>
                  
                  {template.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {template.description}
                    </p>
                  )}

                  <div className="text-sm text-gray-500 mb-4">
                    <p>Placeholders: {template.placeholders.length}</p>
                    <p>Created by: {template.createdBy.name}</p>
                    <p>Created: {new Date(template.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/generate?template=${template._id}`}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
                      >
                        <Icon name="document-duplicate" size="sm" theme="primary" className="mr-1" />
                        Use
                      </Link>
                      
                      <button
                        onClick={() => downloadSampleCSV(template._id)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        title="Download Sample CSV"
                      >
                        <Icon name="download" size="sm" theme="default" />
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      {canEdit(template) && (
                        <Link
                          to={`/templates/${template._id}/edit`}
                          className="text-gray-400 hover:text-gray-600"
                          title="Edit Template"
                        >
                          <Icon name="edit" size="md" theme="default" />
                        </Link>
                      )}
                      
                      {canDelete() && (
                        <div className="relative group">
                          <button
                            onClick={() => handleDelete(template._id, false)}
                            className="text-gray-400 hover:text-red-600 mr-2"
                            title="Delete Template (Soft Delete)"
                          >
                            <Icon name="delete" size="md" theme="default" />
                          </button>
                          <button
                            onClick={() => handleDelete(template._id, true)}
                            className="text-gray-400 hover:text-red-800 text-xs"
                            title="Permanently Delete Template (Hard Delete)"
                          >
                            ⚠️
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">
                      {(pagination.currentPage - 1) * filters.limit + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.currentPage * filters.limit, pagination.totalItems)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">{pagination.totalItems}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {[...Array(pagination.totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageNumber === pagination.currentPage
                              ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <Icon name="document" size="3xl" theme="default" className="mx-auto text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No templates</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new template.
          </p>
          {(user.role === 'admin' || user.role === 'hr') && (
            <div className="mt-6">
              <Link
                to="/templates/new"
                className="btn-primary inline-flex items-center"
              >
                <Icon name="plus" size="md" theme="white" className="mr-2" />
                New Template
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Templates;
