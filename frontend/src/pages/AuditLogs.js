import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Icon } from '../components/icons/IconSystem';

const AuditLogs = () => {
  const { user } = useAuth();
  const [auditLogs, setAuditLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });
  const [filters, setFilters] = useState({
    action: '',
    userId: '',
    startDate: '',
    endDate: '',
    success: '',
    page: 1,
    limit: 20
  });
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    fetchAuditLogs();
  }, [filters]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      const response = await api.get(`/audit?${params.toString()}`);
      setAuditLogs(response.data.auditLogs || []);
      setPagination(response.data.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 });
    } catch (error) {
      console.error('Audit logs fetch error:', error);
      // Only show error if it's not a 401/403 (authentication/authorization error)
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        toast.error('Could not load audit logs');
      }
      setAuditLogs([]);
      setPagination({ currentPage: 1, totalPages: 1, totalItems: 0 });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      setShowStats(false); // Hide any existing stats while loading
      
      const response = await api.get('/audit/stats?period=month');
      
      // Validate response data
      if (response.data) {
        setStats(response.data);
        setShowStats(true);
        toast.success('Statistics loaded successfully');
      } else {
        throw new Error('No statistics data received');
      }
    } catch (error) {
      console.error('Stats fetch error:', error);
      setStats(null);
      setShowStats(false);
      
      if (error.response?.status === 403) {
        toast.error('Access denied. You do not have permission to view statistics.');
      } else if (error.response?.status === 401) {
        toast.error('Authentication required. Please log in again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to load statistics. Please try again.');
      }
    } finally {
      setStatsLoading(false);
    }
  };

  const exportAuditLogs = async () => {
    try {
      const params = new URLSearchParams();
      
      // Pass all current filter values to ensure exported data matches displayed data
      if (filters.action && filters.action.trim() !== '') {
        params.append('action', filters.action);
      }
      if (filters.success && filters.success.trim() !== '') {
        params.append('success', filters.success);
      }
      if (filters.startDate && filters.startDate.trim() !== '') {
        params.append('startDate', filters.startDate);
      }
      if (filters.endDate && filters.endDate.trim() !== '') {
        params.append('endDate', filters.endDate);
      }
      if (filters.userId && filters.userId.trim() !== '') {
        params.append('userId', filters.userId);
      }

      const response = await api.get(`/audit/export?${params.toString()}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // The backend now generates a descriptive filename based on filters
      // Extract filename from response headers if available
      const contentDisposition = response.headers['content-disposition'];
      let filename = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      // Show success message with filter info
      let filterInfo = [];
      if (filters.action) filterInfo.push(`Action: ${filters.action}`);
      if (filters.success) filterInfo.push(`Status: ${filters.success === 'true' ? 'Success' : 'Failed'}`);
      if (filters.startDate) filterInfo.push(`From: ${filters.startDate}`);
      if (filters.endDate) filterInfo.push(`To: ${filters.endDate}`);
      
      const message = filterInfo.length > 0 
        ? `Filtered audit logs exported (${filterInfo.join(', ')})`
        : 'All audit logs exported';
      
      toast.success(message);
    } catch (error) {
      console.error('Export error:', error);
      if (error.response?.status === 403) {
        toast.error('Access denied. You do not have permission to export audit logs.');
      } else {
        toast.error('Failed to export audit logs. Please try again.');
      }
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

  const renderDetails = (details) => {
    if (!details) return 'No details available';
    
    if (typeof details === 'string') return details;
    
    if (typeof details === 'object') {
      // Handle Map objects or regular objects
      const detailsObj = details instanceof Map ? Object.fromEntries(details) : details;
      
      return Object.entries(detailsObj)
        .map(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            // Handle nested objects (like user objects)
            if (value.name || value.email) {
              return `${key}: ${value.name || value.email}`;
            }
            return `${key}: ${JSON.stringify(value)}`;
          }
          return `${key}: ${value}`;
        })
        .join(', ');
    }
    
    return String(details);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionIcon = (action) => {
    const icons = {
      document_generated: '📄',
      bulk_generation: '📋',
      template_created: '📝',
      template_updated: '✏️',
      template_deleted: '🗑️',
      user_login: '🔐',
      user_created: '👤',
      document_sent: '📧'
    };
    return icons[action] || '📊';
  };

  const getActionLabel = (action) => {
    return action.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getSuccessColor = (success) => {
    return success ? 'text-green-600' : 'text-red-600';
  };

  const actions = [
    'document_generated',
    'bulk_generation',
    'template_created',
    'template_updated',
    'template_deleted',
    'user_login',
    'user_created',
    'document_sent'
  ];

  if (loading && auditLogs.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track system activities and user actions
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={fetchStats}
            disabled={statsLoading}
            className="btn-secondary inline-flex items-center"
          >
            {statsLoading ? (
              <div className="spinner mr-2"></div>
            ) : (
              <Icon name="chart-bar" size="md" theme="default" className="mr-2" />
            )}
            View Statistics
          </button>
          {(user.role === 'admin' || user.role === 'hr') && (
            <button
              onClick={exportAuditLogs}
              className="btn-primary inline-flex items-center"
            >
              <Icon name="download" size="md" theme="white" className="mr-2" />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Statistics Loading */}
      {statsLoading && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-center py-8">
            <div className="spinner mr-3"></div>
            <span className="text-gray-600">Loading statistics...</span>
          </div>
        </div>
      )}

      {/* Statistics */}
      {showStats && stats && !statsLoading && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              {stats.period === 'month' ? 'Monthly' : 'Weekly'} Statistics
            </h2>
            <span className="text-sm text-gray-500">
              Generated: {stats.generatedAt ? new Date(stats.generatedAt).toLocaleString() : 'Now'}
            </span>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon name="chart-bar" size="xl" theme="info" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-800">Total Actions</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalActions || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon name="download" size="xl" theme="success" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">Unique Users</p>
                  <p className="text-2xl font-bold text-green-900">{stats.uniqueUsers || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon name="clock" size="xl" theme="secondary" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-800">Period</p>
                  <p className="text-lg font-bold text-purple-900 capitalize">{stats.period || 'Month'}</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon name="search" size="xl" theme="warning" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-orange-800">Success Rate</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {stats.successRate || 0}%
                  </p>
                  <p className="text-xs text-orange-600">
                    {stats.successfulActions || 0} successful, {stats.failedActions || 0} failed
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Actions Statistics */}
          {stats.topActions && stats.topActions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-900 mb-3">Top Actions</h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {stats.topActions.map((actionStat, index) => (
                  <div key={actionStat.action || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{getActionIcon(actionStat.action)}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {getActionLabel(actionStat.action)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-600">{actionStat.count || 0}</span>
                      <div className="text-xs text-gray-500">{actionStat.percentage || 0}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Activity */}
          {stats.userActivity && stats.userActivity.length > 0 && (
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-900 mb-3">User Activity</h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {stats.userActivity.map((user, index) => (
                  <div key={user.user || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">👤</span>
                      <span className="text-sm font-medium text-gray-900">{user.user || 'Unknown User'}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-600">{user.actions || 0} actions</span>
                      <div className="text-xs text-gray-500">
                        {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions by Day Chart */}
          {stats.actionsByDay && stats.actionsByDay.length > 0 && (
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-900 mb-3">Activity Over Time</h3>
              <div className="grid grid-cols-7 gap-2">
                {stats.actionsByDay.map((day, index) => {
                  const maxCount = Math.max(...stats.actionsByDay.map(d => d.count || 0));
                  const height = maxCount > 0 ? Math.max(20, ((day.count || 0) / maxCount) * 60) : 20;
                  
                  return (
                    <div key={day.date || index} className="text-center">
                      <div className="text-xs text-gray-500 mb-1">
                        {day.date ? new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }) : `Day ${index + 1}`}
                      </div>
                      <div 
                        className="bg-blue-200 rounded-t mx-auto"
                        style={{ 
                          height: `${height}px`,
                          width: '20px'
                        }}
                      ></div>
                      <div className="text-xs font-medium text-gray-700 mt-1">{day.count || 0}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowStats(false)}
              className="btn-secondary text-sm"
            >
              Hide Statistics
            </button>
            <button
              onClick={fetchStats}
              disabled={statsLoading}
              className="btn-primary text-sm"
            >
              Refresh Statistics
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label htmlFor="action" className="block text-sm font-medium text-gray-700">
              Action
            </label>
            <select
              name="action"
              id="action"
              className="input-field mt-1"
              value={filters.action}
              onChange={handleFilterChange}
            >
              <option value="">All Actions</option>
              {actions.map(action => (
                <option key={action} value={action}>
                  {getActionLabel(action)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="success" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              name="success"
              id="success"
              className="input-field mt-1"
              value={filters.success}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              <option value="true">Success</option>
              <option value="false">Failed</option>
            </select>
          </div>

          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              id="startDate"
              className="input-field mt-1"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              id="endDate"
              className="input-field mt-1"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
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
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      {auditLogs.length > 0 ? (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{getActionIcon(log.action)}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {getActionLabel(log.action)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {log.resource}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {typeof log.userId === 'object' ? log.userId.name || log.userId.email || 'Unknown User' : log.userName || 'Unknown User'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {typeof log.userId === 'object' ? log.userId._id || log.userId.id || 'Unknown ID' : log.userId}
                        </div>
                        <div className="text-xs text-gray-400 capitalize">
                          {log.userRole}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        log.success 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {log.success ? 'Success' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {renderDetails(log.details)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.ipAddress || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(log.createdAt || log.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
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
                      {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">{pagination.totalItems}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                      let page;
                      if (pagination.totalPages <= 5) {
                        page = i + 1;
                      } else if (pagination.currentPage <= 3) {
                        page = i + 1;
                      } else if (pagination.currentPage >= pagination.totalPages - 2) {
                        page = pagination.totalPages - 4 + i;
                      } else {
                        page = pagination.currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === pagination.currentPage
                              ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
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
        </div>
      ) : (
        <div className="text-center py-12">
          <Icon name="chart-bar" size="3xl" theme="default" className="mx-auto text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No audit logs found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {Object.values(filters).some(v => v) 
              ? 'Try adjusting your filters to see more results.'
              : 'Audit logs will appear here as users perform actions.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
