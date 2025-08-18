"use client"
import React, { useState, useEffect } from 'react';
import { Bell, Trash2, X, AlertTriangle, Check, RefreshCw } from 'lucide-react';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteAllAlert, setShowDeleteAllAlert] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const [deletingIds, setDeletingIds] = useState(new Set());

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/notifications');
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.notifications);
      } else {
        setError(data.error || 'Failed to fetch notifications');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Load notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Delete individual notification
  const deleteNotification = async (notificationId) => {
    try {
      setDeletingIds(prev => new Set(prev).add(notificationId));
      
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      } else {
        console.error('Delete failed:', data.error);
        alert('Failed to delete notification');
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
      alert('Failed to delete notification');
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  // Delete all notifications
  const deleteAllNotifications = async () => {
    try {
      setDeletingAll(true);
      
      const response = await fetch('/api/notifications', {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNotifications([]);
        setShowDeleteAllAlert(false);
      } else {
        console.error('Delete all failed:', data.error);
        alert('Failed to delete all notifications');
      }
    } catch (err) {
      console.error('Error deleting all notifications:', err);
      alert('Failed to delete all notifications');
    } finally {
      setDeletingAll(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNotifications(prev => prev.map(notif => 
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        ));
      }
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  // Get notification message based on type
  const getNotificationMessage = (notification) => {
    const { type, sender, wallpaper } = notification;
    
    switch (type) {
      case 'like':
        return (
          <span>
            <span className="font-medium">{sender.username}</span> liked your wallpaper 
            {wallpaper && <span className="font-medium text-blue-600"> "{wallpaper.title}"</span>}
          </span>
        );
      case 'follow':
        return (
          <span>
            <span className="font-medium">{sender.username}</span> started following you
          </span>
        );
      case 'comment':
        return (
          <span>
            <span className="font-medium">{sender.username}</span> commented on your wallpaper 
            {wallpaper && <span className="font-medium text-blue-600"> "{wallpaper.title}"</span>}
          </span>
        );
      case 'download':
        return (
          <span>
            <span className="font-medium">{sender.username}</span> downloaded your wallpaper 
            {wallpaper && <span className="font-medium text-blue-600"> "{wallpaper.title}"</span>}
          </span>
        );
      default:
        return (
          <span>
            You have a new notification from <span className="font-medium">{sender.username}</span>
          </span>
        );
    }
  };

  // Format time ago
  const formatTimeAgo = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffInSeconds = Math.floor((now - notifDate) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return notifDate.toLocaleDateString();
  };

  // Get notification icon color based on type
  const getNotificationColor = (type) => {
    switch (type) {
      case 'like': return 'text-red-500';
      case 'follow': return 'text-blue-500';
      case 'comment': return 'text-green-500';
      case 'download': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Page Title */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
              <span className="text-gray-700 text-lg">Loading notifications...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Page Title */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Notifications</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchNotifications}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Title */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600 text-sm">
                  {notifications.length === 0 ? 'No notifications' : 
                   `${notifications.filter(n => !n.isRead).length} unread of ${notifications.length} total`}
                </p>
              </div>
            </div>

            {notifications.length > 0 && (
              <button
                onClick={() => setShowDeleteAllAlert(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                Delete All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Delete All Confirmation Modal */}
      {showDeleteAllAlert && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete All Notifications</h3>
                <p className="text-gray-500 text-sm">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete all {notifications.length} notifications? 
              This will permanently remove all your notifications.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteAllAlert(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg transition-colors"
                disabled={deletingAll}
              >
                Cancel
              </button>
              <button
                onClick={deleteAllNotifications}
                disabled={deletingAll}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletingAll ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete All
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">No notifications yet</h2>
            <p className="text-gray-500">When you get notifications, they'll appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`bg-white border border-gray-200 rounded-xl p-5 transition-all hover:shadow-md ${
                  !notification.isRead ? 'ring-2 ring-blue-100 border-blue-200 bg-blue-50/30' : ''
                } shadow-sm`}
                onClick={() => !notification.isRead && markAsRead(notification._id)}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={notification.sender.avatar}
                      alt={notification.sender.username}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                    />
                    {!notification.isRead && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="text-gray-800 text-sm leading-relaxed">
                          {getNotificationMessage(notification)}
                        </div>
                        <p className="text-gray-500 text-xs mt-1">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                      {/* Wallpaper thumbnail (if applicable) */}
                      {notification.wallpaper && (
                        <img
                        src={notification.wallpaper.imageUrl}
                        alt={notification.wallpaper.title}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-gray-200"
                        />
                      )}
                    </div>
                    <div className='text-gray-700 text-sm'>{notification.wallpaper.title}</div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification._id);
                    }}
                    disabled={deletingIds.has(notification._id)}
                    className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    {deletingIds.has(notification._id) ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Notification type indicator */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <div className={`w-2 h-2 rounded-full ${getNotificationColor(notification.type)}`}></div>
                  <span className="text-xs text-gray-500 capitalize">{notification.type}</span>
                  {!notification.isRead && (
                    <span className="text-xs text-blue-600 ml-auto font-medium">New</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;