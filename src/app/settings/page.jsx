'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Camera, User, Lock, FileText, Eye, EyeOff, Save, Upload, Trash2, AlertTriangle, Mail, Shield, Calendar, Globe, Star } from 'lucide-react';

const SettingsPage = () => {
  const { user, setUser, updateUser, refreshUser } = useAuth(); // Use the updateUser function
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    avatar: null,
  });

  const [previewUrl, setPreviewUrl] = useState('');

  // Get current user from either context or session
  const currentUser = user || session?.user;

  // Initialize form data when user data is available
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        username: currentUser.username || currentUser.name?.replace(/\s/g, '').toLowerCase() || '',
        email: currentUser.email || '',
        bio: currentUser.bio || '',
      }));
      setPreviewUrl(currentUser.avatar || currentUser.image || '');
      setEmailNotifications(currentUser.emailNotifications !== false);
    }
  }, [currentUser]);

  // 🔥 Listen for user updates from other tabs/components
  useEffect(() => {
    const handleUserUpdate = (event) => {
      console.log('🔔 Settings: User update event received', event.detail);
      // The AuthContext will handle the actual update
    };

    const handleStorageUpdate = (event) => {
      if (event.detail?.key === 'user-updated') {
        console.log('🔔 Settings: Storage update event received');
        // Optionally refresh the page or trigger a re-render
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    };

    window.addEventListener('userUpdated', handleUserUpdate);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      window.removeEventListener('userUpdated', handleUserUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        showMessage('File size must be less than 5MB', 'error');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        showMessage('Please select a valid image file', 'error');
        return;
      }

      setFormData(prev => ({
        ...prev,
        avatar: file
      }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate passwords if changing
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          showMessage('New passwords do not match', 'error');
          setLoading(false);
          return;
        }

        if (formData.newPassword.length < 6) {
          showMessage('New password must be at least 6 characters', 'error');
          setLoading(false);
          return;
        }

        // For local users, current password is required when changing password
        if (currentUser?.provider !== 'google' && !formData.currentPassword) {
          showMessage('Current password is required to set a new password', 'error');
          setLoading(false);
          return;
        }
      }

      // Validate username length
      if (formData.username.trim().length < 3) {
        showMessage('Username must be at least 3 characters long', 'error');
        setLoading(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        showMessage('Please enter a valid email address', 'error');
        setLoading(false);
        return;
      }

      // Prepare form data
      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.username.trim());
      formDataToSend.append('email', formData.email.trim());
      formDataToSend.append('bio', formData.bio.trim());
      formDataToSend.append('emailNotifications', emailNotifications.toString());
      
      if (formData.currentPassword) {
        formDataToSend.append('currentPassword', formData.currentPassword);
      }
      
      if (formData.newPassword) {
        formDataToSend.append('newPassword', formData.newPassword);
      }
      
      if (formData.avatar) {
        formDataToSend.append('avatar', formData.avatar);
      }

      console.log('📤 Sending update request...');
      const response = await fetch('/api/user', {
        method: 'PATCH',
        body: formDataToSend,
      });

      const result = await response.json();
      console.log('📥 Server response:', result);

      if (result.success) {
        const updatedUser = result.user;
        
        // 🔥 CRITICAL: Update user data using the AuthContext updateUser function
        // This ensures all pages get the updated data instantly
        console.log('🔄 Updating user via AuthContext...');
        const contextUpdateSuccess = await updateUser(updatedUser);
        
        if (!contextUpdateSuccess) {
          console.error('Failed to update user in context');
        }

        // 🔥 ADDITIONAL: Force session update with multiple attempts
        if (session && updateSession) {
          console.log('🔄 Force updating NextAuth session...');
          
          try {
            // Method 1: Direct session update with data
            await updateSession({
              ...updatedUser,
              image: updatedUser.avatar, // NextAuth uses 'image' field
              avatar: updatedUser.avatar, // Keep both for compatibility
            });
            console.log('✅ Session updated via method 1');

            // Method 2: Trigger session refresh after a delay
            setTimeout(async () => {
              try {
                await updateSession();
                console.log('✅ Session refreshed via method 2');
              } catch (e) {
                console.warn('⚠️ Session refresh method 2 failed:', e);
              }
            }, 1000);

            // Method 3: Force a complete session re-validation
            setTimeout(async () => {
              try {
                // This forces NextAuth to re-fetch user data from JWT
                const refreshedSession = await updateSession({});
                console.log('✅ Session re-validated via method 3:', refreshedSession);
              } catch (e) {
                console.warn('⚠️ Session re-validation method 3 failed:', e);
              }
            }, 2000);

          } catch (sessionError) {
            console.error('❌ Session update error:', sessionError);
          }
        }

        // 🔥 Additional: Force refresh user data from AuthContext
        setTimeout(async () => {
          const refreshSuccess = await refreshUser();
          console.log('🔄 Force refresh result:', refreshSuccess);
        }, 1500);

        // Update local form state
        setFormData(prev => ({
          ...prev,
          username: updatedUser.username || prev.username,
          email: updatedUser.email || prev.email,
          bio: updatedUser.bio || prev.bio,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));

        // Update preview URL
        if (updatedUser.avatar) {
          setPreviewUrl(updatedUser.avatar);
        }

        // Update email notifications
        setEmailNotifications(updatedUser.emailNotifications !== false);

        showMessage('Profile updated successfully! ✨', 'success');

        // 🔥 NUCLEAR OPTION: Force page refresh after successful update
        // Uncomment this if other methods don't work
        setTimeout(() => {
          console.log('🔄 Force page refresh...');
          window.location.reload();
        }, 3000);

      } else {
        showMessage(result.error || 'Failed to update profile', 'error');
      }
    } catch (error) {
      console.error('❌ Update error:', error);
      showMessage('An error occurred while updating profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      const response = await fetch('/api/user', {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        // Clear all user data before signing out
        if (setUser) {
          setUser(null);
        }
        
        // Sign out and redirect
        await signOut({ callbackUrl: '/' });
        showMessage('Account deleted successfully', 'success');
      } else {
        showMessage(result.error || 'Failed to delete account', 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showMessage('An error occurred while deleting account', 'error');
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  const isGoogleUser = currentUser?.provider === 'google';

  // Format date properly
  const formatDate = (dateString) => {
    if (!dateString) return 'Recently joined';
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      return 'Recently joined';
    }
  };

  const getAccountType = () => {
    if (isGoogleUser) return 'Google Account';
    return 'Local Account';
  };

  const getAccountTypeIcon = () => {
    if (isGoogleUser) {
      return (
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <Globe className="w-5 h-5 text-blue-600" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
        <Shield className="w-5 h-5 text-green-600" />
      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg">
              <User className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4">
              Account Settings
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Personalize your WallKit experience and manage your account preferences
            </p>
          </div>

          {/* Message Alert */}
          {message && (
            <div className={`mb-8 p-6 rounded-2xl shadow-lg backdrop-blur-sm ${
              messageType === 'success' 
                ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-800 border-2 border-emerald-200' 
                : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-800 border-2 border-red-200'
            }`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {messageType === 'success' ? (
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <p className="font-semibold text-lg">{message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Account Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Account Type */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8">
              <div className="flex items-center mb-6">
                {getAccountTypeIcon()}
                <div className="ml-4">
                  <h2 className="text-2xl font-bold text-gray-900">Account Type</h2>
                  <p className="text-lg text-gray-600 font-medium">{getAccountType()}</p>
                </div>
              </div>
              
              {isGoogleUser && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <p className="text-blue-800 text-sm">
                    <strong>Google Integration:</strong> Your account is linked with Google. Some settings are managed through your Google account.
                  </p>
                </div>
              )}
            </div>

            {/* Member Since */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h2 className="text-2xl font-bold text-gray-900">Member Since</h2>
                  <p className="text-lg text-gray-600 font-medium">
                    {formatDate(currentUser?.createdAt)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-gray-600">Thank you for being part of WallKit!</span>
              </div>
            </div>
          </div>

          {/* Main Settings Form */}
          <form onSubmit={handleSubmit}>
            <div className="bg-white/80 backdrop-blur-xl text-gray-800 rounded-3xl shadow-2xl border border-white/50 overflow-hidden mb-8">
              <div className="p-8 sm:p-12">
                {/* Profile Picture Section */}
                <div className="mb-12">
                  <div className="flex items-center mb-8">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-4">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Profile Picture</h2>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-10">
                    <div className="relative group">
                      <div className="w-40 h-40 rounded-3xl bg-gradient-to-br from-gray-100 via-blue-50 to-indigo-100 overflow-hidden shadow-xl border-4 border-white">
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt="Profile"
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-16 h-16 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                    </div>
                    <div className="text-center sm:text-left">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-2xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                      >
                        <Upload className="w-5 h-5 mr-3" />
                        Choose New Photo
                      </button>
                      <div className="mt-4 text-sm text-gray-600 space-y-1">
                        <p className="font-medium">Supported formats: JPG, PNG, GIF</p>
                        <p>Recommended: 400×400 pixels</p>
                      </div>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>

                {/* Basic Information */}
                <div className="mb-12">
                  <div className="flex items-center mb-8">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-4">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Personal Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                        Username
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-gray-900 bg-white/50 backdrop-blur-sm font-medium text-lg"
                        placeholder="Enter your username (min 3 characters)"
                        minLength={3}
                        required
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-5 top-1/3 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={isGoogleUser}
                          className={`w-full pl-16 pr-6 py-4 border-2 rounded-2xl transition-all duration-300 font-medium text-lg ${
                            isGoogleUser 
                              ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed' 
                              : 'border-gray-200 bg-white/50 backdrop-blur-sm text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500'
                          }`}
                          placeholder="Enter your email"
                          required
                        />
                        {isGoogleUser && (
                          <p className="text-sm text-gray-500 mt-2">
                            Email cannot be changed for Google accounts
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">
                      Bio
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-5 top-5 w-6 h-6 text-gray-400" />
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows="4"
                        className="w-full pl-16 pr-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 resize-none text-gray-900 bg-white/50 backdrop-blur-sm font-medium text-lg"
                        placeholder="Tell the world about yourself..."
                      />
                    </div>
                  </div>
                </div>

                {/* Password Section - Only for local users */}
                {!isGoogleUser && (
                  <div className="mb-12">
                    <div className="flex items-center mb-8">
                      <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center mr-4">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900">Security Settings</h2>
                    </div>
                    
                    <div className="space-y-8">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">
                          Current Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            className="w-full pl-16 pr-16 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm font-medium text-lg"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">
                            New Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                            <input
                              type={showNewPassword ? 'text' : 'password'}
                              name="newPassword"
                              value={formData.newPassword}
                              onChange={handleInputChange}
                              className="w-full pl-16 pr-16 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm font-medium text-lg"
                              placeholder="Enter new password (min 6 characters)"
                              minLength={6}
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {showNewPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">
                            Confirm Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                            <input
                              type="password"
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              className="w-full pl-16 pr-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm font-medium text-lg"
                              placeholder="Confirm new password"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preferences Section */}
                <div className="mb-12">
                  <div className="flex items-center mb-8">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-4">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Preferences</h2>
                  </div>
                  
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Email Notifications</h3>
                        <p className="text-gray-600 mt-2">Get notified about new wallpapers and updates</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={emailNotifications}
                          onChange={(e) => setEmailNotifications(e.target.checked)}
                          className="sr-only peer" 
                        />
                        <div className="w-16 h-9 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/50 rounded-full peer transition-all duration-300 peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-indigo-500 shadow-lg"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save className="w-6 h-6 mr-3" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Danger Zone */}
          <div className="bg-gradient-to-r from-red-50 to-rose-50 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-red-200 p-8">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-rose-500 rounded-lg flex items-center justify-center mr-4">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-red-800">Danger Zone</h2>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Account</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                </div>
                <button 
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:from-red-600 hover:to-rose-600 transition-all duration-300 font-bold shadow-lg hover:shadow-xl whitespace-nowrap"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 transform transition-all">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete Account</h3>
              <p className="text-gray-600 leading-relaxed">
                Are you absolutely sure? This action cannot be undone and will permanently delete your account and all associated data.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 transition-colors font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:from-red-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-bold flex items-center justify-center"
              >
                {deleteLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5 mr-2" />
                    Delete Forever
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsPage;