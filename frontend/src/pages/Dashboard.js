import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import { 
  Icon, 
  IconButton, 
  StatusIcon, 
  AnimatedIcon,
  IconWithBadge 
} from '../components/icons/IconSystem';
import {
  StatusIndicator,
  LoadingIcon,
  ActionIconGroup
} from '../components/icons/InteractiveIcons';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    templates: 0,
    documents: 0,
    users: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [systemHealth, setSystemHealth] = useState('healthy');

  useEffect(() => {
    fetchDashboardData();
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const [templatesRes, documentsRes, usersRes, recentDocsRes] = await Promise.all([
        api.get('/templates'),
        api.get('/docs'),
        user.role === 'admin' ? api.get('/auth/users') : Promise.resolve({ data: { users: [] } }),
        api.get('/docs?limit=5&sort=-createdAt')
      ]);

      setStats({
        templates: templatesRes.data.templates?.length || 0,
        documents: documentsRes.data.documents?.length || 0,
        users: usersRes.data.users?.length || 0,
        recentActivity: []
      });

      setRecentDocuments(recentDocsRes.data.documents || []);
      setSystemHealth('healthy');
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      setSystemHealth('warning');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
    toast.success('Dashboard refreshed');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const quickActions = [
    {
      title: 'Create Template',
      description: 'Design a new document template',
      icon: 'plus',
      href: '/templates/new',
      color: 'primary',
      roles: ['admin', 'hr']
    },
    {
      title: 'Generate Document',
      description: 'Create a document from template',
      icon: 'document-duplicate',
      href: '/generate',
      color: 'success',
      roles: ['admin', 'hr', 'staff']
    },
    {
      title: 'Bulk Generate',
      description: 'Generate multiple documents',
      icon: 'clipboard',
      href: '/bulk-generate',
      color: 'warning',
      roles: ['admin', 'hr']
    },
    {
      title: 'View Documents',
      description: 'Browse generated documents',
      icon: 'folder-open',
      href: '/documents',
      color: 'info',
      roles: ['admin', 'hr', 'staff']
    }
  ];

  const filteredQuickActions = quickActions.filter(action => 
    action.roles.includes(user?.role)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <LoadingIcon type="spin" size="xl" theme="primary" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {getGreeting()}, {user?.name}!
            </h1>
            <p className="mt-2 text-primary-100">
              Welcome to your DocGen-Mongo dashboard
            </p>
            <div className="mt-4 flex items-center space-x-4">
              <div className="flex items-center">
                <Icon name="user" size="sm" theme="white" className="mr-2" />
                <span className="text-sm capitalize">{user?.role}</span>
              </div>
              <div className="flex items-center">
                <StatusIndicator 
                  status={systemHealth === 'healthy' ? 'active' : 'warning'} 
                  showIcon 
                  showText={false}
                />
                <span className="ml-2 text-sm">System Status</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <IconButton
              icon="bell"
              variant="ghost"
              className="text-white hover:bg-primary-500"
              title="Notifications"
            />
            <IconButton
              icon={refreshing ? 'clock' : 'arrow-up'}
              variant="ghost"
              className="text-white hover:bg-primary-500"
              onClick={handleRefresh}
              loading={refreshing}
              title="Refresh Dashboard"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon name="document" size="lg" theme="info" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Templates</p>
              <p className="text-2xl font-bold text-gray-900">{stats.templates}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link 
              to="/templates" 
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all templates →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Icon name="clipboard-check" size="lg" theme="success" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Documents</p>
              <p className="text-2xl font-bold text-gray-900">{stats.documents}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link 
              to="/documents" 
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              View all documents →
            </Link>
          </div>
        </div>

        {user?.role === 'admin' && (
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Icon name="users" size="lg" theme="secondary" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.users}</p>
              </div>
            </div>
            <div className="mt-4">
              <Link 
                to="/users" 
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Manage users →
              </Link>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AnimatedIcon name="clock" animation="pulse" size="lg" theme="warning" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Recent Activity</p>
              <p className="text-2xl font-bold text-gray-900">{recentDocuments.length}</p>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-yellow-600 font-medium">
              Last 24 hours
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Icon name="settings" size="md" theme="primary" className="mr-2" />
            Quick Actions
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredQuickActions.map((action, index) => (
              <Link
                key={index}
                to={action.href}
                className="group p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center mb-3">
                  <div className={`w-10 h-10 bg-${action.color}-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <Icon name={action.icon} size="md" theme={action.color} />
                  </div>
                </div>
                <h3 className="font-medium text-gray-900 group-hover:text-primary-600">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {action.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Documents */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Icon name="clock" size="md" theme="primary" className="mr-2" />
            Recent Documents
          </h2>
          <Link 
            to="/documents" 
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View all →
          </Link>
        </div>
        <div className="p-6">
          {recentDocuments.length > 0 ? (
            <div className="space-y-4">
              {recentDocuments.slice(0, 5).map((doc, index) => (
                <div key={doc._id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <Icon name="document" size="sm" theme="info" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{doc.name || `Document ${index + 1}`}</p>
                      <p className="text-sm text-gray-600">
                        Created {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StatusIndicator 
                      status={doc.status || 'completed'} 
                      showIcon 
                      showText={false}
                    />
                    <ActionIconGroup
                      actions={[
                        {
                          icon: 'view',
                          title: 'View',
                          onClick: () => window.open(`/api/docs/${doc._id}/download`, '_blank')
                        },
                        {
                          icon: 'download',
                          title: 'Download',
                          onClick: () => window.open(`/api/docs/${doc._id}/download`, '_blank')
                        }
                      ]}
                      size="sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon name="document" size="3xl" theme="default" className="mx-auto mb-4 opacity-50" />
              <p className="text-gray-600">No recent documents</p>
              <Link 
                to="/generate" 
                className="inline-flex items-center mt-4 text-primary-600 hover:text-primary-700 font-medium"
              >
                <Icon name="plus" size="sm" className="mr-2" />
                Generate your first document
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Icon name="settings" size="md" theme="primary" className="mr-2" />
            System Status
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <StatusIcon status="success" size="md" />
                <span className="ml-3 font-medium text-green-800">Database</span>
              </div>
              <span className="text-sm text-green-600">Online</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <StatusIcon status="success" size="md" />
                <span className="ml-3 font-medium text-green-800">API Server</span>
              </div>
              <span className="text-sm text-green-600">Running</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <StatusIcon status="success" size="md" />
                <span className="ml-3 font-medium text-green-800">File Storage</span>
              </div>
              <span className="text-sm text-green-600">Available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
