import React, { useState, useEffect } from 'react';
import { Icon, IconButton } from '../icons/IconSystem';
import { LoadingIcon, StatusIndicator } from '../icons/InteractiveIcons';

/**
 * Enhanced Search Component with autocomplete and filters
 */
export const SearchComponent = ({
  placeholder = "Search...",
  onSearch,
  suggestions = [],
  filters = [],
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);

  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
    onSearch && onSearch(searchQuery, selectedFilters);
  };

  const handleFilterToggle = (filter) => {
    const newFilters = selectedFilters.includes(filter)
      ? selectedFilters.filter(f => f !== filter)
      : [...selectedFilters, filter];
    
    setSelectedFilters(newFilters);
    onSearch && onSearch(query, newFilters);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Icon name="search" size="sm" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          className="input-field pl-10 pr-4"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        {query && (
          <button
            onClick={() => handleSearch('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <Icon name="close" size="sm" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
              onClick={() => {
                handleSearch(suggestion);
                setShowSuggestions(false);
              }}
            >
              <Icon name="search" size="sm" className="mr-2 text-gray-400" />
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Filters */}
      {filters.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => handleFilterToggle(filter)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                selectedFilters.includes(filter)
                  ? 'bg-primary-100 text-primary-800 border border-primary-200'
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Enhanced Data Table with sorting, filtering, and pagination
 */
export const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  sortable = true,
  selectable = false,
  onSort,
  onSelect,
  onRowClick,
  className = ""
}) => {
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedRows, setSelectedRows] = useState([]);

  const handleSort = (column) => {
    if (!sortable || !column.sortable) return;

    const newOrder = sortBy === column.key && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(column.key);
    setSortOrder(newOrder);
    onSort && onSort(column.key, newOrder);
  };

  const handleSelectRow = (rowId) => {
    const newSelected = selectedRows.includes(rowId)
      ? selectedRows.filter(id => id !== rowId)
      : [...selectedRows, rowId];
    
    setSelectedRows(newSelected);
    onSelect && onSelect(newSelected);
  };

  const handleSelectAll = () => {
    const allIds = data.map(row => row.id);
    const newSelected = selectedRows.length === data.length ? [] : allIds;
    setSelectedRows(newSelected);
    onSelect && onSelect(newSelected);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <LoadingIcon type="spin" size="lg" theme="primary" />
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {selectable && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === data.length && data.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    sortable && column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {sortable && column.sortable && (
                      <Icon
                        name={
                          sortBy === column.key
                            ? sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'
                            : 'arrow-up'
                        }
                        size="sm"
                        className={`${
                          sortBy === column.key ? 'text-primary-600' : 'text-gray-400'
                        }`}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr
                key={row.id || index}
                className={`hover:bg-gray-50 transition-colors duration-200 ${
                  onRowClick ? 'cursor-pointer' : ''
                } ${selectedRows.includes(row.id) ? 'bg-primary-50' : ''}`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {selectable && (
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(row.id)}
                      onChange={() => handleSelectRow(row.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {data.length === 0 && (
        <div className="text-center py-12">
          <Icon name="table" size="3xl" className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No data available</p>
        </div>
      )}
    </div>
  );
};

/**
 * Enhanced Modal Component with animations
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  className = ""
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div
          className={`inline-block w-full ${sizeClasses[size]} p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg ${className}`}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between mb-4">
              {title && (
                <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              )}
              {showCloseButton && (
                <IconButton
                  icon="close"
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                />
              )}
            </div>
          )}

          {/* Content */}
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
};

/**
 * Enhanced Progress Bar Component
 */
export const ProgressBar = ({
  value = 0,
  max = 100,
  label,
  showPercentage = true,
  color = 'primary',
  size = 'md',
  animated = false,
  className = ""
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const colorClasses = {
    primary: 'bg-primary-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600',
    info: 'bg-blue-600'
  };

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  return (
    <div className={className}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          {showPercentage && (
            <span className="text-sm text-gray-500">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]}`}>
        <div
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-300 ${
            animated ? 'animate-pulse' : ''
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

/**
 * Enhanced Card Component
 */
export const Card = ({
  title,
  subtitle,
  children,
  actions,
  hoverable = false,
  className = ""
}) => {
  return (
    <div
      className={`bg-white rounded-lg shadow border border-gray-200 ${
        hoverable ? 'hover:shadow-lg transition-shadow duration-200' : ''
      } ${className}`}
    >
      {(title || subtitle || actions) && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
              {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center space-x-2">{actions}</div>}
          </div>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};

/**
 * Enhanced Notification Toast Component
 */
export const NotificationToast = ({
  type = 'info',
  title,
  message,
  onClose,
  autoClose = true,
  duration = 5000
}) => {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const typeConfig = {
    success: { icon: 'success', bgColor: 'bg-green-50', textColor: 'text-green-800', borderColor: 'border-green-200' },
    error: { icon: 'error', bgColor: 'bg-red-50', textColor: 'text-red-800', borderColor: 'border-red-200' },
    warning: { icon: 'warning', bgColor: 'bg-yellow-50', textColor: 'text-yellow-800', borderColor: 'border-yellow-200' },
    info: { icon: 'info', bgColor: 'bg-blue-50', textColor: 'text-blue-800', borderColor: 'border-blue-200' }
  };

  const config = typeConfig[type];

  return (
    <div className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor} ${config.textColor}`}>
      <div className="flex items-start">
        <StatusIndicator status={type} showIcon showText={false} className="mt-0.5" />
        <div className="ml-3 flex-1">
          {title && <h4 className="font-medium">{title}</h4>}
          {message && <p className={`text-sm ${title ? 'mt-1' : ''}`}>{message}</p>}
        </div>
        <IconButton
          icon="close"
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="ml-2"
        />
      </div>
    </div>
  );
};

export {
  SearchComponent,
  DataTable,
  Modal,
  ProgressBar,
  Card,
  NotificationToast
};
