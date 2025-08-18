'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import Avatar from '../Avatar';
import NotificationDropdown from './notificaionDropDown';
import {
  Search,
  Menu,
  X,
  Upload,
  ShieldQuestionMark,
  Compass,
  User,
  LogOut,
  Settings,
  Bell,
  Heart,
  Bookmark,
  Home,
  Sparkles,
  Zap,
  Star,
  Crown,
  TrendingUp,
  Grid3X3,
  Plus,
  ChevronDown
} from 'lucide-react';

const Navbar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch unread count when user is available
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }
  }, [user]);

  // Fetch unread count function
  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) return;

      const data = await response.json();
      if (data.success) {
        const unreadNotifications = data.notifications.filter(notification => !notification.isRead);
        setUnreadCount(unreadNotifications.length);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
    setIsNotificationDropdownOpen(false);
  }, [pathname]);

  const isActive = (path) => pathname === path;

  const navLinks = [
    { href: '/', label: 'Explore', icon: Compass },
    { href: '/trending', label: 'Trending', icon: TrendingUp },
    { href: '/collections', label: 'Collections', icon: Grid3X3, authRequired: true },
    { href: '/upload', label: 'Upload', icon: Upload, authRequired: true },
    { href: '/about', label: 'About Us', icon: ShieldQuestionMark },
  ];

  const NavLink = ({ href, children, className = '', icon: Icon, mobile = false }) => (
    <Link
      href={href}
      className={`group relative flex items-center gap-3 px-4 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
        isActive(href)
          ? 'text-white bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 shadow-lg shadow-orange-500/30'
          : mobile
          ? 'text-black hover:text-gray-900 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50'
          : 'text-black hover:text-gray-900 hover:bg-white/90'
      } ${className}`}
      prefetch={!mobile}
    >
      <div className="relative">
        {Icon && (
          <Icon className={`w-5 h-5 ${isActive(href) ? 'text-white' : ''}`} />
        )}
      </div>
      <span className="font-medium">{children}</span>

      {!mobile && isActive(href) && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-orange-400 to-red-400 rounded-full transition-all duration-300" />
      )}
    </Link>
  );

  return (
    <>
      <nav className={`fixed top-0 left-0 z-[70] right-0  transition-all duration-500 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-xl border-b border-gray-200/50'
          : 'bg-gradient-to-b from-black/50 via-black/10 to-transparent backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-all duration-500 shadow-lg shadow-orange-500/30">
                  <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 animate-bounce flex items-center justify-center">
                  <Zap className="w-2 h-2 lg:w-2.5 lg:h-2.5 text-white" />
                </div>
              </div>

              <div className="hidden sm:flex flex-col">
                <span className="text-xl lg:text-2xl font-black bg-gradient-to-r from-orange-600 via-red-600 to-pink-700 bg-clip-text text-transparent group-hover:from-orange-500 group-hover:via-red-500 group-hover:to-pink-600 transition-all duration-300">
                  WallKit
                </span>
                <span className={`text-xs font-medium transition-all duration-300 ${
                  isScrolled ? 'text-gray-600' : 'text-white/80'
                }`}>
                  Premium Gallery
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className={`hidden lg:flex items-center gap-3 rounded-xl p-1.5 transition-all duration-300 ${
              isScrolled
                ? 'bg-gray-100/90 backdrop-blur-sm border border-gray-200/50'
                : 'bg-gray-100/90 backdrop-blur-md border border-white/30'
            }`}>
              {navLinks.map((link) => {
                if (link.authRequired && !user) return null;
                return (
                  <NavLink key={link.href} href={link.href} icon={link.icon}>
                    {link.label}
                  </NavLink>
                );
              })}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2 lg:gap-3">
              {/* User Section */}
              {user ? (
                <div className="flex items-center gap-2">
                  {/* Notifications */}
                  <div className="relative" ref={notificationRef}>
                    <button
                      onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
                      className={`relative p-2 lg:p-2.5 rounded-xl transition-all duration-300 hover:scale-105 group ${
                        isScrolled
                          ? 'backdrop-blur-sm shadow-md hover:shadow-lg hover:bg-white/90'
                          : 'backdrop-blur-md hover:shadow-lg hover:bg-white/30'
                      }`}
                    >
                      <Bell className={`w-5 h-5 lg:w-6 lg:h-6 transition-all duration-300 ${
                        isScrolled ? 'text-gray-700' : 'text-white'
                      } ${isNotificationDropdownOpen ? 'text-orange-500' : 'group-hover:text-orange-500'}`} />

                      {/* Notification Count Badge */}
                      {unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 min-w-[18px] h-4.5 lg:min-w-[20px] lg:h-5 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                          <span className="text-xs text-white font-bold px-1">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        </div>
                      )}
                    </button>

                    {/* Single Notification Dropdown - works for both mobile and desktop */}
                    <NotificationDropdown 
                      isOpen={isNotificationDropdownOpen}
                      onClose={() => setIsNotificationDropdownOpen(false)}
                      triggerRef={notificationRef}
                      isMobile={isMobile}
                    />
                  </div>

                  {/* Profile Dropdown - Desktop Only */}
                  <div className="hidden lg:block relative" ref={profileRef}>
                    <button
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className={`flex items-center gap-3 py-1 px-2 rounded-xl transition-all duration-300 hover:scale-105 group ${
                        isScrolled
                          ? 'backdrop-blur-sm shadow-md hover:shadow-lg'
                          : 'backdrop-blur-md hover:shadow-lg'
                      }`}
                    >
                      <div className="flex flex-col text-right">
                        <p className={`text-sm font-bold transition-colors group-hover:text-orange-600 ${
                          isScrolled ? 'text-gray-900' : 'text-white'
                        }`}>{user.username}</p>
                        <div className="flex items-center gap-1.5 justify-end">
                          <Crown className="w-3 h-3 text-yellow-500" />
                          <span className={`text-xs font-medium ${
                            isScrolled ? 'text-gray-600' : 'text-white/80'
                          }`}>Pro Creator</span>
                        </div>
                      </div>

                      <div className="relative">
                        <Avatar
                          src={user.avatar}
                          alt={user.username}
                          className="w-10 h-10 ring-2 ring-white/60 shadow-lg group-hover:ring-orange-300 transition-all duration-300"
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 border-2 border-white rounded-full shadow-sm" />
                      </div>

                      <ChevronDown className={`w-4 h-4 transition-all duration-300 ${
                        isScrolled ? 'text-gray-500' : 'text-white/70'
                      } ${isProfileDropdownOpen ? 'rotate-180 !text-orange-500' : ''}`} />
                    </button>

                    {/* Profile Dropdown Menu */}
                    {isProfileDropdownOpen && (
                      <div className="absolute top-full right-0 mt-3 w-72 bg-white/98 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200/50 py-4 z-50 animate-fadeIn">
                        {/* User Header */}
                        <div className="px-4 pb-4 border-b border-gray-200/50">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar src={user.avatar} alt={user.username} className="w-12 h-12 ring-2 ring-orange-200 shadow-lg" />
                              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
                                <Star className="w-2.5 h-2.5 text-white" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-gray-900">{user.username}</h3>
                              <p className="text-sm text-gray-600 mb-2">{user.email}</p>
                              <div className="flex items-center gap-1.5">
                                <div className="px-2.5 py-1 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg">
                                  <span className="text-xs text-white font-bold flex items-center gap-1">
                                    <Crown className="w-3 h-3" />
                                    Pro
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          <Link
                            href={`/profile/${user.username}`}
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-800 hover:text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-300 group"
                          >
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                              <User className="w-4 h-4 text-orange-600" />
                            </div>
                            <div>
                              <span className="font-semibold">My Profile</span>
                              <p className="text-sm text-gray-500">View and edit profile</p>
                            </div>
                          </Link>

                          <Link
                            href="/favorites"
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-800 hover:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-300 group"
                          >
                            <div className="w-8 h-8 bg-gradient-to-br from-red-100 to-pink-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Heart className="w-4 h-4 text-red-600" />
                            </div>
                            <div>
                              <span className="font-semibold">Favorites</span>
                              <p className="text-sm text-gray-500">Liked wallpapers</p>
                            </div>
                          </Link>

                          <Link
                            href="/collections"
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-800 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all duration-300 group"
                          >
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Bookmark className="w-4 h-4 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <span className="font-semibold">Collections</span>
                              <p className="text-sm text-gray-500">Saved collections</p>
                            </div>
                          </Link>

                          <Link
                            href="/settings"
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-800 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50 transition-all duration-300 group"
                          >
                            <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-slate-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Settings className="w-4 h-4 text-gray-700" />
                            </div>
                            <div>
                              <span className="font-semibold">Settings</span>
                              <p className="text-sm text-gray-500">Account preferences</p>
                            </div>
                          </Link>
                        </div>

                        {/* Logout Section */}
                        <div className="border-t border-gray-200/50 pt-2 mt-2">
                          <button
                            onClick={logout}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-red-600 hover:text-red-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-300 group"
                          >
                            <div className="w-8 h-8 bg-gradient-to-br from-red-100 to-pink-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                              <LogOut className="w-4 h-4 text-red-600" />
                            </div>
                            <div>
                              <span className="font-semibold">Logout</span>
                              <p className="text-sm text-red-400">Sign out of account</p>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    href="/auth/signin"
                    className={`px-3 lg:px-4 py-2 lg:py-2.5 font-semibold rounded-lg transition-all duration-300 hover:scale-105 ${
                      isScrolled
                        ? 'text-gray-800 hover:text-gray-900 hover:bg-white/90 shadow-md hover:shadow-lg'
                        : 'text-white hover:text-white hover:bg-white/30 backdrop-blur-md'
                    }`}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-3 lg:px-5 py-2 lg:py-2.5 bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 hover:from-orange-600 hover:via-red-600 hover:to-pink-700 text-white font-bold rounded-lg shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transform hover:scale-105 transition-all duration-300 relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center gap-2 text-sm lg:text-base">
                      <Plus className="w-4 h-4" />
                      Sign Up
                    </span>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`lg:hidden p-2 rounded-lg transition-all duration-300 hover:scale-110 group ${
                  isScrolled
                    ? 'text-gray-700 hover:text-gray-900 hover:bg-white/90 shadow-md hover:shadow-lg'
                    : 'text-white hover:text-white hover:bg-white/30 backdrop-blur-md'
                }`}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                ) : (
                  <Menu className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white/98 backdrop-blur-xl border-t border-gray-200/30 shadow-xl animate-fadeIn">
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Navigation Links */}
              <div className="space-y-2">
                {navLinks.map((link) => {
                  if (link.authRequired && !user) return null;
                  return (
                    <NavLink key={link.href} href={link.href} icon={link.icon} mobile>
                      {link.label}
                    </NavLink>
                  );
                })}
              </div>

              {/* Mobile User Section */}
              {user ? (
                <div className="pt-4 border-t border-gray-200/50 space-y-4">
                  {/* Mobile User Profile Card */}
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100">
                    <div className="relative">
                      <Avatar src={user.avatar} alt={user.username} className="w-12 h-12 ring-2 ring-white shadow-md" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 border-2 border-white rounded-full" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{user.username}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Crown className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs text-gray-600 font-medium">Pro Creator</span>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Profile Links */}
                  <div className="space-y-1">
                    <Link
                      href={`/profile/${user.username}`}
                      className="flex items-center gap-3 p-3 text-gray-800 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-300"
                    >
                      <User className="w-5 h-5" />
                      <span className="font-medium">Profile</span>
                    </Link>
                    <Link
                      href="/favorites"
                      className="flex items-center gap-3 p-3 text-gray-800 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
                    >
                      <Heart className="w-5 h-5" />
                      <span className="font-medium">Favorites</span>
                    </Link>
                    <Link
                      href="/collections"
                      className="flex items-center gap-3 p-3 text-gray-800 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-300"
                    >
                      <Bookmark className="w-5 h-5" />
                      <span className="font-medium">Collections</span>
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 p-3 text-gray-800 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-300"
                    >
                      <Settings className="w-5 h-5" />
                      <span className="font-medium">Settings</span>
                    </Link>
                    <button
                      onClick={logout}
                      className="flex items-center gap-3 w-full p-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-300"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Mobile Auth Buttons */
                <div className="pt-4 space-y-3 border-t border-gray-200/50">
                  <Link
                    href="/auth/signin"
                    className="flex items-center justify-center w-full px-4 py-3 text-gray-800 font-semibold border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-300"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    <Plus className="w-4 h-4" />
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16 lg:h-20" />

      {/* Backdrop */}
      {(isMobileMenuOpen || isProfileDropdownOpen) && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fadeIn"
          onClick={() => {
            setIsMobileMenuOpen(false);
            setIsProfileDropdownOpen(false);
          }}
        />
      )}

      {/* Custom Styles */}
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
        
        @media (prefers-reduced-motion: reduce) {
          .animate-pulse,
          .animate-bounce,
          .animate-fadeIn {
            animation: none;
          }
          
          .transition-all,
          .transition-colors,
          .transition-transform {
            transition: none;
          }
        }

        @media (max-width: 640px) {
          .max-w-7xl {
            max-width: 100%;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;