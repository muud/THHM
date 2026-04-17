import React, { useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  date_joined: string;
}

export default function SystemAccessControl() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // New User Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('admin');
  
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const csrftoken = document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1];
      const res = await fetch('/api/core/users/', {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken || '',
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');
    
    try {
      const csrftoken = document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1];
      const res = await fetch('/api/core/users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken || '',
        },
        body: JSON.stringify({
          username: newUsername,
          email: newEmail,
          password: newPassword,
          role: newRole,
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setActionSuccess('User created successfully');
        setShowAddForm(false);
        setNewUsername('');
        setNewEmail('');
        setNewPassword('');
        setNewRole('admin');
        fetchUsers();
      } else {
        setActionError(data.error || 'Failed to create user');
      }
    } catch (err) {
      setActionError('Network error while creating user');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    setActionError('');
    setActionSuccess('');
    
    try {
      const csrftoken = document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1];
      const res = await fetch(`/api/core/users/${id}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken || '',
        }
      });
      
      const data = await res.json();
      if (res.ok) {
        setActionSuccess('User deleted successfully');
        fetchUsers();
      } else {
        setActionError(data.error || 'Failed to delete user');
      }
    } catch (err) {
      setActionError('Network error while deleting user');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center bg-white/10 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white/20">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-600">
            System Access Control
          </h1>
          <p className="text-gray-500 mt-2">Manage Administrator and Staff Accounts</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all outline-none"
        >
          {showAddForm ? 'Cancel' : '+ Add New Entry'}
        </button>
      </div>

      {actionError && (
        <div className="p-4 bg-red-100 text-red-700 border border-red-200 rounded-xl shadow-sm">
          {actionError}
        </div>
      )}
      {actionSuccess && (
        <div className="p-4 bg-green-100 text-green-700 border border-green-200 rounded-xl shadow-sm">
          {actionSuccess}
        </div>
      )}

      {/* Add User Form Modal / Card */}
      {showAddForm && (
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/40 mb-8 animate-fade-in-up">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Create New Security Entry</h2>
          <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                required
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                placeholder="system.admin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                placeholder="admin@thhm.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">System Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm bg-white"
              >
                <option value="admin">Administrator</option>
                <option value="manager">Manager</option>
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
                <option value="pharmacist">Pharmacist</option>
                <option value="lab_tech">Lab Technician</option>
                <option value="radiologist">Radiologist</option>
                <option value="receptionist">Receptionist</option>
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end mt-4">
              <button
                type="submit"
                className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-800 transition-all outline-none flex items-center space-x-2"
              >
                <span>Authorize & Create Entry</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Data Grid */}
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
        {loading ? (
          <div className="p-12 pl-6 pb-6 text-center text-gray-500 animate-pulse">Loading secure entries...</div>
        ) : error ? (
          <div className="p-12 text-center text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Username</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Email</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Role Designation</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Access Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => {
                  const isProtected = user.username === 'mohaabi' || user.role === 'er_developer';
                  
                  return (
                    <tr key={user.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-inner ${isProtected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <span className={`font-medium ${isProtected ? 'text-indigo-700' : 'text-gray-800'}`}>
                            {user.username}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {user.email || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-3 py-1 rounded-full border ${
                          isProtected ? 'bg-indigo-100 text-indigo-700 border-indigo-200 font-bold' :
                          user.role === 'admin' ? 'bg-red-50 text-red-600 border-red-100' : 
                          'bg-green-50 text-green-600 border-green-100'
                        }`}>
                          {user.role === 'er_developer' ? 'ER DEVELOPER' : user.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className={user.is_active ? 'text-green-700' : 'text-red-700'}>
                            {user.is_active ? 'Active' : 'Suspended'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {isProtected ? (
                          <span className="text-xs font-semibold px-3 py-1 bg-gray-100 text-gray-500 rounded flex items-center justify-end space-x-1 uppercase tracking-wider">
                            <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                            <span>Protected Core Sys</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-500 hover:text-red-700 font-medium px-4 py-2 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 outline-none"
                          >
                            Revoke Access
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {users.length === 0 && !loading && !error && (
              <div className="p-12 text-center text-gray-500">No staff entries found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
