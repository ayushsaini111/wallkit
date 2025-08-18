'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Avatar from '../Avatar';
import {
  Bell,
  Clock,
  Heart,
  User,
  Grid3X3,
  X
} from 'lucide-react';

const NotificationDropdown = ({ 
  isOpen, 
  onClose, 
  triggerRef,
  isMobile = false 
}) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Fetch notifications function
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();

      if (data.success) {
        setNotifications(data.notifications);
        const unreadNotifications = data.notifications.filter(notification => !notification.isRead);
        setUnreadCount(unreadNotifications.length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Handle individual notification click
  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await markAsRead(notification._id);
        
        setNotifications(prevNotifications =>
          prevNotifications.map(n =>
            n._id === notification._id ? { ...n, isRead: true } : n
          )
        );
        
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      if (notification.link) {
        window.location.href = notification.link;
      }

      if (!isMobile) {
        onClose();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark single notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      const result = await response.json();
      return result.notification;
    } catch (error) {
      console.error('Error updating notification:', error);
      throw error;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      if (unreadNotifications.length === 0) return;

      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }

      setNotifications(prevNotifications =>
        prevNotifications.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationMessage = (notification) => {
    const senderName = notification.sender?.username || 
                      notification.sender?.name ||
                      notification.senderDetails?.username || 
                      notification.senderDetails?.name || 
                      'Someone';

    switch (notification.type) {
      case 'like':
        return (
          <span>
            <span className="font-medium">{senderName}</span> liked your wallpaper
            {notification.wallpaper && (
              <span className="font-medium text-blue-600"> "{notification.wallpaper.title}"</span>
            )}
          </span>
        );
      case 'comment':
        return (
          <span>
            <span className="font-medium">{senderName}</span> commented on your wallpaper
            {notification.wallpaper && (
              <span className="font-medium text-blue-600"> "{notification.wallpaper.title}"</span>
            )}
          </span>
        );
      case 'follow':
        return (
          <span>
            <span className="font-medium">{senderName}</span> started following you
          </span>
        );
      case 'download':
        return (
          <span>
            <span className="font-medium">{senderName}</span> downloaded your wallpaper
            {notification.wallpaper && (
              <span className="font-medium text-blue-600"> "{notification.wallpaper.title}"</span>
            )}
          </span>
        );
      default:
        return (
          <span>
            You have a new notification from <span className="font-medium">{senderName}</span>
          </span>
        );
    }
  };

  const formatNotificationTime = (createdAt) => {
    const now = new Date();
    const notificationTime = new Date(createdAt);
    const diffInMs = now - notificationTime;
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return notificationTime.toLocaleDateString();
  };

  if (!isOpen) return null;

  // Mobile fullscreen overlay
  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl mt-20 max-h-[80vh] overflow-hidden">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-600 rounded-lg flex items-center justify-center">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-semibold">No notifications yet</p>
                <p className="text-sm text-gray-500 mt-1">We'll notify you when something happens</p>
              </div>
            ) : (
              <div className="py-2">
                {notifications.slice(0, 10).map((notification, index) => (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${
                      !notification.isRead ? 'border-blue-500 bg-blue-50/30' : 'border-transparent'
                    } ${index !== notifications.length - 1 ? 'border-b border-gray-100' : ''}`}
                  >
                    <div className="flex-shrink-0 relative">
                      <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white shadow-sm">
                        <Avatar
                          src={notification.sender?.avatar || notification.senderDetails?.avatar}
                          alt={notification.sender?.username || 'User'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {!notification.isRead && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className={`text-sm leading-relaxed mb-1 ${
                        !notification.isRead ? 'text-gray-900 font-medium' : 'text-gray-700'
                      }`}>
                        {getNotificationMessage(notification)}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatNotificationTime(notification.createdAt)}
                        </p>
                        
                        <div className="flex items-center gap-1">
                          {notification.type === 'like' && <Heart className="w-3 h-3 text-red-500" />}
                          {notification.type === 'follow' && <User className="w-3 h-3 text-blue-500" />}
                          {!notification.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-200 p-4 space-y-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="w-full px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium hover:bg-blue-50 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
                >
                  Mark all as read ({unreadCount})
                </button>
              )}
              
              <Link
                href="/notifications"
                onClick={onClose}
                className="block w-full px-4 py-2.5 text-center text-sm text-white font-semibold bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 rounded-lg transition-colors shadow-lg"
              >
                View All Notifications
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop dropdown
  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full right-0 mt-3 w-96 bg-white/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden z-50 animate-fadeIn"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Bell className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
          </div>
          {unreadCount > 0 && (
            <span className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-pink-600 text-white text-xs font-bold rounded-full shadow-lg">
              {unreadCount} new
            </span>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-semibold text-lg mb-1">No notifications yet</p>
            <p className="text-sm text-gray-500">We'll notify you when something happens</p>
          </div>
        ) : (
          <div className="py-2">
            {notifications.slice(0, 10).map((notification, index) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`group relative flex items-start gap-4 px-6 py-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 cursor-pointer border-l-4 ${
                  !notification.isRead 
                    ? 'border-blue-500 bg-gradient-to-r from-blue-50/60 to-indigo-50/30' 
                    : 'border-transparent hover:border-blue-200'
                } ${index !== notifications.length - 1 ? 'border-b border-gray-100/50' : ''}`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0 relative">
                  <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white shadow-lg group-hover:ring-blue-200 transition-all duration-300">
                    <Avatar
                      src={notification.sender?.avatar || notification.senderDetails?.avatar}
                      alt={notification.sender?.username || notification.sender?.name || 'User'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {!notification.isRead && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-600 border-2 border-white rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className={`text-sm leading-relaxed transition-colors duration-200 mb-2 ${
                    !notification.isRead ? 'text-gray-900 font-semibold' : 'text-gray-700'
                  }`}>
                    {getNotificationMessage(notification)}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {formatNotificationTime(notification.createdAt)}
                    </p>
                    
                    <div className="flex items-center gap-1">
                      {notification.type === 'like' && <Heart className="w-3 h-3 text-red-500" />}
                      {notification.type === 'comment' && <div className="w-3 h-3 bg-green-500 rounded-full" />}
                      {notification.type === 'follow' && <User className="w-3 h-3 text-blue-500" />}
                      {!notification.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full ml-2" />}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-gray-200/50 bg-gray-50/50 p-4">
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-3 py-2 text-xs text-blue-600 hover:text-blue-700 font-semibold hover:bg-blue-50 rounded-lg border border-blue-200 hover:border-blue-300 transition-all duration-200"
              >
                Mark all read
              </button>
            )}
            
            <Link
              href="/notifications"
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-white font-semibold bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-600 hover:to-pink-700 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Grid3X3 className="w-4 h-4" />
              View All Notifications
            </Link>
          </div>
          
          {/* Stats */}
          <div className="mt-3 pt-3 border-t border-gray-200/30">
            <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                {unreadCount} unread
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-300 rounded-full" />
                {notifications.length - unreadCount} read
              </span>
              <span className="flex items-center gap-1">
                <Bell className="w-3 h-3" />
                {notifications.length} total
              </span>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default NotificationDropdown;