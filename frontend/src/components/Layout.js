import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Icon, IconButton } from './icons/IconSystem';
import NotificationPanel from './NotificationPanel';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'home', roles: ['admin', 'hr', 'staff'] },
    { name: 'Templates', href: '/templates', icon: 'document', roles: ['admin', 'hr', 'staff'] },
    { name: 'Generate Document', href: '/generate', icon: 'document-duplicate', roles: ['admin', 'hr', 'staff'] },
    { name: 'Bulk Generate', href: '/bulk-generate', icon: 'clipboard', roles: ['admin', 'hr'] },
    { name: 'Documents', href: '/documents', icon: 'clipboard-check', roles: ['admin', 'hr', 'staff'] },
    { name: 'Audit Logs', href: '/audit', icon: 'list', roles: ['admin', 'hr'] },
    { name: 'User Management', href: '/users', icon: 'users', roles: ['admin'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role)
  );

  const isActive = (href) => location.pathname === href;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-gray-900 flex items-center">
              <Icon name="document" size="lg" theme="primary" className="mr-2" />
              DocGen-Mongo
            </h1>
            <IconButton
              icon="close"
              variant="ghost"
              onClick={() => setSidebarOpen(false)}
              size="sm"
            />
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-primary-100 text-primary-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon 
                  name={item.icon} 
                  size="md" 
                  theme={isActive(item.href) ? 'primary' : 'default'}
                  className="mr-3 flex-shrink-0" 
                />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white shadow">
          <div className="flex h-16 flex-shrink-0 items-center px-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900 flex items-center">
              <Icon name="document" size="lg" theme="primary" className="mr-2" />
              DocGen-Mongo
            </h1>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto">
            <nav className="flex-1 space-y-1 px-2 py-4">
              {filteredNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon 
                    name={item.icon} 
                    size="md" 
                    theme={isActive(item.href) ? 'primary' : 'default'}
                    className="mr-3 flex-shrink-0" 
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
          <button
            type="button"
            className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Icon name="menu" size="lg" />
          </button>
          
          <div className="flex flex-1 justify-between px-4">
            <div className="flex flex-1">
              {/* Search could go here */}
            </div>
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              {/* Notification Panel */}
              <NotificationPanel />
              
              {/* Profile dropdown */}
              <div className="relative ml-3">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name}
                  </span>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  >
                    <Icon name="user" size="lg" />
                  </Link>
                  <IconButton
                    icon="logout"
                    variant="ghost"
                    onClick={handleLogout}
                    title="Logout"
                    size="md"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
