import React, { useState, useEffect } from 'react';
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
  ToggleIcon,
  NotificationIcon
} from '../components/icons/InteractiveIcons';

const Documents = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    dateRange: 'all',
    type: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [sortBy, sortOrder, filters]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.search.trim()) {
        params.append('search', filters.search);
      }
      if (filters.status !== 'all') {
        params.append('status', filters.status);
      }
      if (filters.type !== 'all') {
        params.append('type', filters.type);
      }
      
      params.append('sort', `${sortOrder === 'desc' ? '-' : ''}${sortBy}`);
      
      const response = await api.get(`/docs?${params.toString()}`);
      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error('Documents fetch error:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDocuments();
    toast.success('Documents refreshed');
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleSelectDoc = (docId) => {
    setSelectedDocs(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDocs.length === documents.length) {
      setSelectedDocs([]);
    } else {
      setSelectedDocs(documents.map(doc => doc._id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDocs.length === 0) return;
    
    if (!window.confirm(`Delete ${selectedDocs.length} selected documents?`)) {
      return;
    }

    try {
      await Promise.all(
        selectedDocs.map(docId => api.delete(`/docs/${docId}`))
      );
      toast.success(`${selectedDocs.length} documents deleted`);
      setSelectedDocs([]);
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to delete documents');
    }
  };

  const handleDownload = async (docId, docName) => {
    try {
      const response = await api.get(`/docs/${docId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', docName || 'document.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Document downloaded');
    } catch (error) {
      toast.error('Failed to download document');
    }
  };

  const getDocumentActions = (doc) => [
    {
      icon: 'view',
      title: 'Preview',
      onClick: () => window.open(`/api/docs/${doc._id}/download`, '_blank')
    },
    {
      icon: 'download',
      title: 'Download',
      onClick: () => handleDownload(doc._id, doc.name)
    },
    {
      icon: 'share',
      title: 'Share',
      onClick: () => {
        navigator.clipboard.writeText(`${window.location.origin}/api/docs/${doc._id}/download`);
        toast.success('Share link copied to clipboard');
      }
    }
  ];

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'warning';
      case 'failed': return 'error';
      default: return 'info';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <LoadingIcon type="spin" size="xl" theme="primary" />
          <p className="mt-4 text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Icon name="clipboard-check" size="lg" theme="primary" className="mr-3" />
            Documents
            {documents.length > 0 && (
              <span className="ml-3 text-sm font-normal text-gray-500">
                ({documents.length} total)
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and download your generated documents
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          {selectedDocs.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedDocs.length} selected
              </span>
              <IconButton
                icon="delete"
                variant="error"
                size="sm"
                onClick={handleBulkDelete}
                title="Delete selected"
              />
            </div>
          )}
          <ToggleIcon
            activeIcon="list"
            inactiveIcon="table"
            isActive={viewMode === 'list'}
            onToggle={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            size="lg"
            title="Toggle view mode"
          />
          <IconButton
            icon="filter"
            variant="ghost"
            onClick={() => setShowFilters(!showFilters)}
            title="Toggle filters"
          />
          <IconButton
            icon={refreshing ? 'clock' : 'arrow-up'}
            variant="ghost"
            onClick={handleRefresh}
            loading={refreshing}
            title="Refresh"
          />
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Icon name="search" size="sm" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  className="input-field pl-10"
                  placeholder="Search documents..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                className="input-field"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                className="input-field"
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
              >
                <option value="all">All Types</option>
                <option value="certificate">Certificate</option>
                <option value="letter">Letter</option>
                <option value="report">Report</option>
                <option value="invoice">Invoice</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                className="input-field"
                value={filters.dateRange}
                onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Sort Controls */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleSort('name')}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
              >
                <span>Name</span>
                <SortableIcon
                  sortState={sortBy === 'name' ? sortOrder : 'none'}
                  size="sm"
                />
              </button>
              <button
                onClick={() => handleSort('createdAt')}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
              >
                <span>Date</span>
                <SortableIcon
                  sortState={sortBy === 'createdAt' ? sortOrder : 'none'}
                  size="sm"
                />
              </button>
              <button
                onClick={() => handleSort('size')}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
              >
                <span>Size</span>
                <SortableIcon
                  sortState={sortBy === 'size' ? sortOrder : 'none'}
                  size="sm"
                />
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedDocs.length === documents.length && documents.length > 0}
              onChange={handleSelectAll}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-600">Select All</span>
          </div>
        </div>
      </div>

      {/* Documents Grid/List */}
      {documents.length > 0 ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {documents.map((doc) => (
            <div
              key={doc._id}
              className={`bg-white rounded-lg shadow hover:shadow-lg transition-all duration-200 ${
                selectedDocs.includes(doc._id) ? 'ring-2 ring-primary-500' : ''
              } ${viewMode === 'list' ? 'flex items-center p-4' : 'p-6'}`}
            >
              {viewMode === 'grid' ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <input
                      type="checkbox"
                      checked={selectedDocs.includes(doc._id)}
                      onChange={() => handleSelectDoc(doc._id)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <StatusIndicator 
                      status={getStatusColor(doc.status || 'completed')} 
                      showIcon 
                      showText={false}
                    />
                  </div>
                  <div className="text-center mb-4">
                    <FileTypeIcon fileName={doc.name} size="3xl" className="mx-auto mb-3" />
                    <h3 className="font-medium text-gray-900 truncate" title={doc.name}>
                      {doc.name || 'Untitled Document'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                    {doc.size && (
                      <p className="text-xs text-gray-400 mt-1">
                        {formatFileSize(doc.size)}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-center">
                    <ActionIconGroup
                      actions={getDocumentActions(doc)}
                      size="sm"
                    />
                  </div>
                </>
              ) : (
                <>
                  <input
                    type="checkbox"
                    checked={selectedDocs.includes(doc._id)}
                    onChange={() => handleSelectDoc(doc._id)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-4"
                  />
                  <FileTypeIcon fileName={doc.name} size="lg" className="mr-4" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {doc.name || 'Untitled Document'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(doc.createdAt).toLocaleDateString()}
                      {doc.size && ` • ${formatFileSize(doc.size)}`}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <StatusIndicator 
                      status={getStatusColor(doc.status || 'completed')} 
                      showIcon 
                      showText={false}
                    />
                    <ActionIconGroup
                      actions={getDocumentActions(doc)}
                      size="sm"
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Icon name="document" size="3xl" theme="default" className="mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-600 mb-6">
            {filters.search || filters.status !== 'all' || filters.type !== 'all'
              ? 'Try adjusting your filters or search terms'
              : 'Generate your first document to get started'
            }
          </p>
          <div className="flex justify-center space-x-4">
            {(filters.search || filters.status !== 'all' || filters.type !== 'all') && (
              <IconButton
                icon="close"
                variant="secondary"
                onClick={() => setFilters({search: '', status: 'all', dateRange: 'all', type: 'all'})}
              >
                Clear Filters
              </IconButton>
            )}
            <IconButton
              icon="plus"
              variant="primary"
              onClick={() => window.location.href = '/generate'}
            >
              Generate Document
            </IconButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
