import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Icon } from '../components/icons/IconSystem';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!profileData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (!profileData.email.trim()) {
      toast.error('Email is required');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const response = await api.put('/auth/profile', profileData);
      
      // Update the user context with new data
      if (updateUser) {
        updateUser(response.data.user);
      }
      
      toast.success('Profile updated successfully');
      
    } catch (error) {
      console.error('Profile update error:', error);
      if (error.response?.status === 409) {
        toast.error('This email is already taken by another user');
      } else {
        toast.error(error.response?.data?.message || 'Failed to update profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('All password fields are required');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    if (passwordData.newPassword === passwordData.currentPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    // Password strength validation
    const hasUpperCase = /[A-Z]/.test(passwordData.newPassword);
    const hasLowerCase = /[a-z]/.test(passwordData.newPassword);
    const hasNumbers = /\d/.test(passwordData.newPassword);
    
    if (passwordData.newPassword.length >= 8 && (!hasUpperCase || !hasLowerCase || !hasNumbers)) {
      toast.warning('For better security, use a mix of uppercase, lowercase, and numbers');
    }

    try {
      setLoading(true);
      await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      toast.success('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
    } catch (error) {
      console.error('Password change error:', error);
      if (error.response?.status === 400) {
        toast.error('Current password is incorrect');
      } else {
        toast.error(error.response?.data?.message || 'Failed to change password');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      hr: 'bg-blue-100 text-blue-800',
      staff: 'bg-green-100 text-green-800'
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors[role]}`}>
        {role.toUpperCase()}
      </span>
    );
  };

  const tabs = [
    { id: 'profile', name: 'Profile Information', icon: 'user' },
    { id: 'password', name: 'Change Password', icon: 'key' }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        {/* Profile Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Icon name="user" size="3xl" theme="default" className="text-gray-400" />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <div className="mt-2 flex items-center space-x-4">
                {getRoleBadge(user?.role)}
                <span className="text-sm text-gray-500">
                  Member since {user?.createdAt ? formatDate(user.createdAt) : 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon 
                    name={tab.icon} 
                    size="md" 
                    theme={activeTab === tab.id ? 'primary' : 'default'} 
                    className="mr-2" 
                  />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
              
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      className="input-field mt-1"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className="input-field mt-1"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      placeholder="Enter your email address"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Make sure to use a valid email address for notifications.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <div className="mt-1">
                      {getRoleBadge(user?.role)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Last Login
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {user?.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? (
                      <div className="spinner mr-2"></div>
                    ) : null}
                    Update Profile
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'password' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    id="currentPassword"
                    required
                    className="input-field mt-1"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter your current password"
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      id="newPassword"
                      required
                      minLength="6"
                      className="input-field mt-1"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Password must be at least 6 characters long
                    </p>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      required
                      minLength="6"
                      className="input-field mt-1"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Icon name="key" size="md" theme="warning" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Password Security Tips
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>Use a combination of letters, numbers, and special characters</li>
                          <li>Avoid using personal information or common words</li>
                          <li>Make it at least 8 characters long for better security</li>
                          <li>Don't reuse passwords from other accounts</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? (
                      <div className="spinner mr-2"></div>
                    ) : null}
                    Change Password
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
