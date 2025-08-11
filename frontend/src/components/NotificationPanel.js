import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import { Icon, IconButton } from './icons/IconSystem';
import { StatusIndicator, NotificationIcon } from './icons/InteractiveIcons';

const NotificationPanel = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    getRecentNotifications
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  const recentNotifications = getRecentNotifications(10);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (notification.action && notification.action.href) {
      setIsOpen(false);
      // Navigation will be handled by Link component
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'bell';
    }
  };

  return (
    <div className="relative">
      {/* Notification Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg transition-colors duration-200"
      >
        <NotificationIcon
          count={unreadCount}
          variant="bell"
          size="lg"
          badgeColor="red"
        />
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Icon name="bell" size="md" theme="primary" className="mr-2" />
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Mark all read
                  </button>
                )}
                <IconButton
                  icon="close"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                />
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {recentNotifications.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors duration-200 ${
                      !notification.read ? 'bg-blue-50 border-l-4 border-l-primary-500' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <StatusIndicator
                          status={notification.type || 'info'}
                          showIcon
                          showText={false}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {notification.title && (
                              <p className={`text-sm font-medium ${
                                !notification.read ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </p>
                            )}
                            <p className={`text-sm ${
                              !notification.read ? 'text-gray-800' : 'text-gray-600'
                            } ${notification.title ? 'mt-1' : ''}`}>
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500">
                                {formatTimeAgo(notification.timestamp)}
                              </span>
                              
                              {notification.action && (
                                <Link
                                  to={notification.action.href}
                                  onClick={() => handleNotificationClick(notification)}
                                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                                >
                                  {notification.action.label}
                                </Link>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-1 ml-2">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs text-primary-600 hover:text-primary-700"
                                title="Mark as read"
                              >
                                <Icon name="success" size="sm" />
                              </button>
                            )}
                            <button
                              onClick={() => removeNotification(notification.id)}
                              className="text-xs text-gray-400 hover:text-gray-600"
                              title="Remove notification"
                            >
                              <Icon name="close" size="sm" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Icon name="bell" size="3xl" className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 text-sm">No notifications</p>
                <p className="text-gray-400 text-xs mt-1">
                  You're all caught up!
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {recentNotifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Showing {Math.min(recentNotifications.length, 10)} of {notifications.length}
                </span>
                <div className="flex items-center space-x-3">
                  {notifications.length > 10 && (
                    <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                      View all
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
