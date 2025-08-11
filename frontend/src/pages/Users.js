import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { Icon } from '../components/icons/IconSystem';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    isActive: true
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/users');
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Users fetch error:', error);
      // Only show error if it's not a 401/403 (authentication/authorization error)
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        toast.error('Could not load users');
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const openModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        isActive: user.isActive
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'staff',
        isActive: true
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'staff',
      isActive: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    if (!editingUser && !formData.password.trim()) {
      toast.error('Password is required for new users');
      return;
    }

    try {
      if (editingUser) {
        // Update user
        const updateData = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          isActive: formData.isActive
        };
        
        await api.put(`/auth/users/${editingUser._id}`, updateData);
        toast.success('User updated successfully');
      } else {
        // Create user
        await api.post('/auth/register', formData);
        toast.success('User created successfully');
      }
      
      fetchUsers();
      closeModal();
    } catch (error) {
      console.error('User save error:', error);
      toast.error(error.response?.data?.message || 'Failed to save user');
    }
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

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      hr: 'bg-blue-100 text-blue-800',
      staff: 'bg-green-100 text-green-800'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[role]}`}>
        {role.toUpperCase()}
      </span>
    );
  };

  const getStatusBadge = (isActive) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
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
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage system users and their roles
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => openModal()}
            className="btn-primary inline-flex items-center"
          >
            <Icon name="plus" size="md" theme="white" className="mr-2" />
            Add User
          </button>
        </div>
      </div>

      {/* Users Table */}
      {users.length > 0 ? (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <Icon name="user" size="2xl" theme="default" className="text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.isActive)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                      {user.createdBy && (
                        <div className="text-xs text-gray-400">
                          by {typeof user.createdBy === 'object' ? user.createdBy.name || user.createdBy.email || 'Unknown' : user.createdBy}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openModal(user)}
                        className="text-primary-600 hover:text-primary-900"
                        title="Edit User"
                      >
                        <Icon name="edit" size="md" theme="default" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Icon name="user" size="3xl" theme="default" className="mx-auto text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding a new user to the system.
          </p>
          <div className="mt-6">
            <button
              onClick={() => openModal()}
              className="btn-primary inline-flex items-center"
            >
              <Icon name="plus" size="md" theme="white" className="mr-2" />
              Add User
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={closeModal}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        {editingUser ? 'Edit User' : 'Add New User'}
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            className="input-field mt-1"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter full name"
                          />
                        </div>

                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            required
                            className="input-field mt-1"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter email address"
                          />
                        </div>

                        {!editingUser && (
                          <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                              Password *
                            </label>
                            <input
                              type="password"
                              name="password"
                              id="password"
                              required={!editingUser}
                              className="input-field mt-1"
                              value={formData.password}
                              onChange={handleChange}
                              placeholder="Enter password"
                              minLength="6"
                            />
                          </div>
                        )}

                        <div>
                          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                            Role *
                          </label>
                          <select
                            name="role"
                            id="role"
                            required
                            className="input-field mt-1"
                            value={formData.role}
                            onChange={handleChange}
                          >
                            <option value="staff">Staff</option>
                            <option value="hr">HR</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>

                        <div>
                          <label className="inline-flex items-center">
                            <input
                              type="checkbox"
                              name="isActive"
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                              checked={formData.isActive}
                              onChange={handleChange}
                            />
                            <span className="ml-2 text-sm text-gray-700">Active User</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {editingUser ? 'Update User' : 'Create User'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
