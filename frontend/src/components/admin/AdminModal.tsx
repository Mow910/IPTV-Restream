import React, { useState, useContext, useEffect } from 'react';
import { X, Shield, ShieldOff, Lock } from 'lucide-react';
import { ToastContext } from '../notifications/ToastContext';
import { useAdmin } from './AdminContext';
import apiService from '../../services/ApiService';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function AdminModal({ isOpen, onClose }: AdminModalProps) {
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // First visit: ask for username
  const [isFirstTime, setIsFirstTime] = useState(() => {
    return localStorage.getItem('admin_username') === null;
  });
  const { isAdmin, setIsAdmin } = useAdmin();
  const { addToast } = useContext(ToastContext);

  if (!isOpen) return null;

  const handleFirstTimeSetup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      addToast({
        type: 'error',
        title: 'Username is required',
        duration: 3000,
      });
      return;
    }

    if (username.length < 3 || username.length > 50) {
      addToast({
        type: 'error',
        title: 'Username must be between 3 and 50 characters',
        duration: 3000,
      });
      return;
    }

    // Save username to localStorage
    localStorage.setItem('admin_username', username);
    setIsFirstTime(false);
    setUsername('');
    addToast({
      type: 'success',
      title: 'Username set!',
      message: 'Now enter your admin password',
      duration: 3000,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      addToast({
        type: 'error',
        title: 'Password is required',
        duration: 3000,
      });
      return;
    }

    try {
      const response = await apiService.request<{ success: boolean; token?: string }>(
        '/auth/admin-login',
        'POST',
        undefined,
        { password }
      );

      if (response.success && response.token) {
        // Store JWT token in localStorage
        localStorage.setItem('admin_token', response.token);

        setIsAdmin(true);
        setPassword('');
        addToast({
          type: 'success',
          title: 'Admin mode enabled',
          duration: 3000,
        });
        onClose();
      } else {
        addToast({
          type: 'error',
          title: 'Invalid password',
          duration: 3000,
        });
        setPassword('');
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Authentication failed',
        message: 'Please try again',
        duration: 3000,
      });
      setPassword('');
    }
  };

  const handleLogout = () => {
    // Remove JWT token from localStorage
    localStorage.removeItem('admin_token');

    setIsAdmin(false);
    setPassword('');
    addToast({
      type: 'info',
      title: 'Admin mode disabled',
      duration: 3000,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-md border border-gray-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            {isAdmin ? (
              <Shield className="w-5 h-5 text-green-500" />
            ) : (
              <ShieldOff className="w-5 h-5 text-blue-500" />
            )}
            <h2 className="text-xl font-semibold">Admin Mode</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {isAdmin ? (
            // Admin logged in
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-green-500 bg-opacity-10 rounded-lg border border-green-500 border-opacity-30">
                <Shield className="w-5 h-5 text-green-500 mr-2" />
                <p className="text-green-400">You are currently in admin mode.</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full p-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Logout from Admin Mode
              </button>
            </div>
          ) : isFirstTime ? (
            // First time: ask for username
            <form onSubmit={handleFirstTimeSetup} className="space-y-4">
              <div className="flex items-center p-3 bg-blue-500 bg-opacity-10 rounded-lg border border-blue-500 border-opacity-30 mb-4">
                <Lock className="w-5 h-5 text-blue-400 mr-2" />
                <p className="text-sm text-blue-300">Welcome! Set your username first</p>
              </div>
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-1">
                  Choose a username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  placeholder="Enter your username"
                  required
                  maxLength={50}
                />
                <p className="text-xs text-gray-400 mt-1">3-50 characters</p>
              </div>

              <button
                type="submit"
                className="w-full p-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Continue
              </button>
            </form>
          ) : (
            // Login form
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="adminPassword" className="block text-sm font-medium mb-1">
                  Admin Password
                </label>
                <input
                  type="password"
                  id="adminPassword"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  placeholder="Enter admin password"
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="w-full p-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Login
              </button>

              <button
                type="button"
                onClick={() => setIsFirstTime(true)}
                className="w-full text-sm text-gray-400 hover:text-gray-300 p-2"
              >
                Reset username
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminModal;
