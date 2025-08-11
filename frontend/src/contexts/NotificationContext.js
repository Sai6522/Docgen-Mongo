import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Icon } from '../components/icons/IconSystem';
import { StatusIndicator } from '../components/icons/InteractiveIcons';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Add notification
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      read: false,
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Show toast notification
    showToast(newNotification);

    return newNotification.id;
  };

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  // Remove notification
  const removeNotification = (id) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return prev.filter(n => n.id !== id);
    });
  };

  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Show toast notification
  const showToast = (notification) => {
    const toastContent = (
      <div className="flex items-start space-x-3">
        <StatusIndicator 
          status={notification.type || 'info'} 
          showIcon 
          showText={false} 
        />
        <div className="flex-1 min-w-0">
          {notification.title && (
            <p className="font-medium text-gray-900">{notification.title}</p>
          )}
          <p className="text-sm text-gray-600">{notification.message}</p>
        </div>
      </div>
    );

    const toastOptions = {
      position: "top-right",
      autoClose: notification.autoClose !== false ? 5000 : false,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    };

    switch (notification.type) {
      case 'success':
        toast.success(toastContent, toastOptions);
        break;
      case 'error':
        toast.error(toastContent, toastOptions);
        break;
      case 'warning':
        toast.warning(toastContent, toastOptions);
        break;
      case 'info':
      default:
        toast.info(toastContent, toastOptions);
        break;
    }
  };

  // Notification helpers
  const notifySuccess = (message, title = 'Success') => {
    return addNotification({
      type: 'success',
      title,
      message,
      category: 'system'
    });
  };

  const notifyError = (message, title = 'Error') => {
    return addNotification({
      type: 'error',
      title,
      message,
      category: 'system',
      autoClose: false
    });
  };

  const notifyWarning = (message, title = 'Warning') => {
    return addNotification({
      type: 'warning',
      title,
      message,
      category: 'system'
    });
  };

  const notifyInfo = (message, title = 'Information') => {
    return addNotification({
      type: 'info',
      title,
      message,
      category: 'system'
    });
  };

  // Document-specific notifications
  const notifyDocumentGenerated = (documentName) => {
    return addNotification({
      type: 'success',
      title: 'Document Generated',
      message: `${documentName} has been successfully generated and is ready for download.`,
      category: 'document',
      action: {
        label: 'View Documents',
        href: '/documents'
      }
    });
  };

  const notifyTemplateCreated = (templateName) => {
    return addNotification({
      type: 'success',
      title: 'Template Created',
      message: `Template "${templateName}" has been successfully created.`,
      category: 'template',
      action: {
        label: 'View Templates',
        href: '/templates'
      }
    });
  };

  const notifyBulkGenerationComplete = (count) => {
    return addNotification({
      type: 'success',
      title: 'Bulk Generation Complete',
      message: `${count} documents have been successfully generated.`,
      category: 'bulk',
      action: {
        label: 'View Documents',
        href: '/documents'
      }
    });
  };

  const notifyUserActivity = (activity) => {
    return addNotification({
      type: 'info',
      title: 'User Activity',
      message: activity,
      category: 'user'
    });
  };

  // System notifications
  const notifySystemUpdate = (message) => {
    return addNotification({
      type: 'info',
      title: 'System Update',
      message,
      category: 'system',
      autoClose: false
    });
  };

  const notifyMaintenanceMode = (message) => {
    return addNotification({
      type: 'warning',
      title: 'Maintenance Notice',
      message,
      category: 'system',
      autoClose: false
    });
  };

  // Get notifications by category
  const getNotificationsByCategory = (category) => {
    return notifications.filter(n => n.category === category);
  };

  // Get recent notifications
  const getRecentNotifications = (limit = 10) => {
    return notifications.slice(0, limit);
  };

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    
    // Helper methods
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    
    // Document notifications
    notifyDocumentGenerated,
    notifyTemplateCreated,
    notifyBulkGenerationComplete,
    notifyUserActivity,
    
    // System notifications
    notifySystemUpdate,
    notifyMaintenanceMode,
    
    // Getters
    getNotificationsByCategory,
    getRecentNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
