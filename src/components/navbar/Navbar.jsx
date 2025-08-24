'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import Avatar from '../Avatar';
import NotificationDropdown from './notificaionDropDown';
import {
  Menu, X, Upload, ShieldQuestionMark, Compass, User, LogOut, Settings, Bell, Heart, Bookmark, TrendingUp, Grid3X3, Plus, ChevronDown, Tag
} from 'lucide-react';

const Navbar = ({ onCategorySelect }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  // State management
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isMobileCategoryDropdownOpen, setIsMobileCategoryDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Refs for dropdown management
  const profileRef = useRef(null);
  const categoryRef = useRef(null);
  const notificationRef = useRef(null);

  // Static categories list
  const categories = [
    'Nature', 'Abstract', 'Minimalist', 'Animals', 'Cityscape', 'Space',
    'Technology', 'Fantasy', 'Textures & Patterns', 'Food & Drinks',
    'People', 'Architecture', 'Cars & Vehicles', 'Art & Illustration',
    '3D Renders', 'Typography', 'Dark', 'Light', 'Vintage', 'Sports', 'Other'
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const isMobileScreen = window.innerWidth < 1024;
      setIsMobile(isMobileScreen);
      
      // Close desktop dropdowns on mobile
      if (isMobileScreen) {
        setIsProfileDropdownOpen(false);
        setIsCategoryDropdownOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch notification count when user is available
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }
  }, [user]);

  // API call to fetch unread notifications
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

  // Handle category selection
  const handleCategorySelect = (category) => {
    console.log('Category selected in navbar:', category);
    
    // Close all dropdowns
    setIsCategoryDropdownOpen(false);
    setIsMobileCategoryDropdownOpen(false);
    setIsMobileMenuOpen(false);

    // If we're on the home page, directly select the category
    if (pathname === '/') {
      if (onCategorySelect) {
        onCategorySelect(category.toLowerCase());
      }
    } else {
      // If we're on another page, navigate to home with category parameter
      const categoryParam = category.toLowerCase();
      router.push(`/?category=${categoryParam}`);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationDropdownOpen(false);
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
    setIsCategoryDropdownOpen(false);
    setIsMobileCategoryDropdownOpen(false);
  }, [pathname]);

  // Helper function to check active route
  const isActive = (path) => pathname === path;

  // Navigation links configuration
  const navLinks = [
    { href: '/', label: 'Explore', icon: Compass },
    { href: '/trending', label: 'Trending', icon: TrendingUp },
    { href: '/collections', label: 'Collections', icon: Grid3X3, authRequired: true },
    { href: '/about', label: 'About Us', icon: ShieldQuestionMark },
  ];

  // Reusable navigation link component
  const NavLink = ({ href, children, className = '', icon: Icon, mobile = false }) => (
    <Link
      href={href}
      className={`group relative flex items-center px-4 gap-3 py-2.5 rounded-lg font-semibold  transition-all duration-300 ${isActive(href)
        ? 'text-white bg-orange-500  shadow-lg'
        : mobile
          ? 'text-black hover:text-gray-900 hover:bg-white/70'
          : 'text-black hover:text-gray-900 hover:bg-gray-100'
        } ${className}`}
      prefetch={!mobile}
    >
      <div className="relative">
        {Icon && (
          <Icon className={`w-5 h-5 ${isActive(href) ? 'text-white' : ''}`} />
        )}
      </div>
      <span className="font-medium">{children}</span>

      {/* Active indicator for desktop */}
      {!mobile && isActive(href) && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-orange-400 rounded-full" />
      )}
    </Link>
  );

  // Toggle mobile category dropdown
  const toggleMobileCategoryDropdown = () => {
    setIsMobileCategoryDropdownOpen(!isMobileCategoryDropdownOpen);
  };

  return (
    <>
      {/* Main Navigation */}
      <nav className={`fixed top-0 left-0 z-[70] right-0 transition-all duration-500 ${isScrolled
        ? 'bg-white/30 backdrop-blur-lg shadow-xl border-gray-200/50'
        : "bg-white/80 backdrop-blur-xl"
        }`}>
        <div className="max-w-8xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16 lg:h-20">

            {/* Logo Section */}
            <Link href="/" className="flex items-center justify-center gap-2 group lg:flex-initial">
              <div className="flex flex-col">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-black bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  WallPickr
                </h1>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className={`hidden lg:flex items-center gap-2 xl:gap-3 rounded-xl p-1.5 transition-all duration-300 ${isScrolled
              ? 'bg-white/97 border border-gray-200/50'
              : 'bg-white/99 border border-white/30'
              }`}>
              {navLinks.map((link) => {
                if (link.authRequired && !user) return null;
                return (
                  <NavLink key={link.href} href={link.href} icon={link.icon}>
                    {link.label}
                  </NavLink>
                );
              })}
              
              {/* Categories Dropdown */}
              <div className="relative" ref={categoryRef}>
                <button
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  className="flex items-center gap-2 px-3 xl:px-4 py-2.5 rounded-lg font-semibold transition-all duration-300 text-black hover:text-gray-900 hover:bg-white/90 cursor-pointer"
                >
                  <Tag className="w-5 h-5" />
                  <span className="font-medium">Categories</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Categories Dropdown Menu */}
                {isCategoryDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-80 xl:w-96 bg-white/98 rounded-2xl shadow-2xl border border-gray-200/50 py-4 xl:py-6 z-50 animate-fadeIn">
                    {/* Header */}
                    <div className="px-4 xl:px-6 pb-3 xl:pb-4 border-b border-gray-200/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 xl:w-10 h-8 xl:h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                          <Tag className="w-4 xl:w-5 h-4 xl:h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg xl:text-xl text-gray-900">Browse Categories</h3>
                          <p className="text-xs xl:text-sm text-gray-600">Discover amazing wallpapers by category</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Categories Grid */}
                    <div className="py-3 xl:py-4 max-h-72 xl:max-h-80 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-1 px-3 xl:px-4">
                        {categories.map((category) => (
                          <button
                            key={category}
                            onClick={() => handleCategorySelect(category)}
                            className="group flex items-center gap-2 xl:gap-3 px-3 xl:px-4 py-2 xl:py-3 text-gray-800 hover:text-orange-500 hover:bg-orange-50 transition-all duration-300 rounded-xl text-left"
                          >
                            <div className="w-2.5 xl:w-3 h-2.5 xl:h-3 bg-gradient-to-r from-orange-400 to-red-400 rounded-full opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
                            <span className=" text-xs xl:text-sm group-hover:translate-x-1 transition-transform duration-300">{category}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
              {/* User Actions */}
              {user ? (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {/* Notifications Button */}
                  <div className="relative" ref={notificationRef}>
                    <button
                      onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
                      className="relative p-1.5 sm:p-2 lg:p-2.5 rounded-xl transition-all duration-200 hover:scale-95 group bg-white/90"
                      aria-label="Notifications"
                    >
                      <Bell className={`w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6 transition-all duration-300 text-gray-700 ${isNotificationDropdownOpen ? 'text-orange-500' : 'group-hover:text-orange-500'}`} />

                      {/* Notification Badge */}
                      {unreadCount > 0 && (
                        <div className="absolute -top-0.5 -right-0.5 min-w-[16px] sm:min-w-[18px] lg:min-w-[20px] h-4 sm:h-4.5 lg:h-5 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg ">
                          <span className="text-xs text-white font-bold px-0.5 sm:px-1">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        </div>
                      )}
                    </button>

                    {/* Notification Dropdown */}
                    <NotificationDropdown
                      isOpen={isNotificationDropdownOpen}
                      onClose={() => setIsNotificationDropdownOpen(false)}
                      triggerRef={notificationRef}
                      isMobile={isMobile}
                    />
                  </div>

                  {/* Upload Button */}
                  <Link
                    href="/upload"
                    className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-2.5 rounded-lg md:rounded-xl font-semibold transition-all duration-200 hover:scale-95 text-xs sm:text-sm lg:text-base bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
                    aria-label="Upload wallpaper"
                  >
                    <Upload className="w-3  sm:w-4 lg:w-5 h-3 sm:h-4 lg:h-5" />
                    <span className="hidden sm:inline">Upload</span>
                  </Link>

                  {/* Profile Dropdown - Desktop Only */}
                  <div className="hidden lg:block relative" ref={profileRef}>
                    <button
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className="rounded-full transition-all duration-200 hover:scale-105 cursor-pointer"
                      aria-label="Profile menu"
                    >
                      <Avatar
                        src={user.avatar}
                        alt={user.username}
                        className="w-12 xl:w-12 h-12 xl:h-12 transition-all duration-200"
                      />
                    </button>

                    {/* Profile Dropdown Menu */}
                    {isProfileDropdownOpen && (
                      <div className="absolute top-full right-0 mt-3 w-64 xl:w-72 bg-white/98 rounded-xl shadow-2xl border border-gray-200/50 py-4 z-50 animate-fadeIn">
                        {/* User Header */}
                        <div className="px-4 pb-4 border-b border-gray-200/50">
                          <div className="flex items-center gap-3">
                            <Avatar 
                              src={user.avatar} 
                              alt={user.username} 
                              className="w-10 xl:w-12 h-10 xl:h-12 ring-2 ring-orange-500 shadow-md flex-shrink-0" 
                            />
                            <div className="flex-1 ml-2 min-w-0">
                              <h3 className="font-semibold text-base xl:text-lg text-gray-900 truncate">{user.username}</h3>
                              <p className="text-xs xl:text-sm text-gray-600 truncate">{user.email}</p>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <nav className="py-2" aria-label="Profile menu">
                          <Link
                            href={`/profile/${user.username}`}
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-800 hover:text-orange-600 hover:bg-orange-50 transition-all duration-300 group"
                          >
                            <div className="w-7 xl:w-8 h-7 xl:h-8 bg-orange-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                              <User className="w-3.5 xl:w-4 h-3.5 xl:h-4 text-orange-600" />
                            </div>
                            <div>
                              <span className="font-semibold text-sm xl:text-base">My Profile</span>
                              <p className="text-xs text-gray-500">View profile</p>
                            </div>
                          </Link>

                          <Link
                            href="/favorites"
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-800 hover:text-red-600 hover:bg-red-50 transition-all duration-300 group"
                          >
                            <div className="w-7 xl:w-8 h-7 xl:h-8 bg-red-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Heart className="w-3.5 xl:w-4 h-3.5 xl:h-4 text-red-600" />
                            </div>
                            <div>
                              <span className="font-semibold text-sm xl:text-base">Favorites</span>
                              <p className="text-xs text-gray-500">Liked wallpapers</p>
                            </div>
                          </Link>

                          <Link
                            href="/collections"
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-800 hover:text-purple-600 hover:bg-purple-50 transition-all duration-300 group"
                          >
                            <div className="w-7 xl:w-8 h-7 xl:h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Bookmark className="w-3.5 xl:w-4 h-3.5 xl:h-4 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <span className="font-semibold text-sm xl:text-base">Collections</span>
                              <p className="text-xs text-gray-500">Saved collections</p>
                            </div>
                          </Link>

                          <Link
                            href="/settings"
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-800 hover:text-gray-900 hover:bg-gray-50 transition-all duration-300 group"
                          >
                            <div className="w-7 xl:w-8 h-7 xl:h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Settings className="w-3.5 xl:w-4 h-3.5 xl:h-4 text-gray-700" />
                            </div>
                            <div>
                              <span className="font-semibold text-sm xl:text-base">Settings</span>
                              <p className="text-xs text-gray-500">Account preferences</p>
                            </div>
                          </Link>
                        </nav>

                        {/* Logout Section */}
                        <div className="border-t border-gray-200/50 pt-2 mt-2">
                          <button
                            onClick={logout}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-300 group"
                            aria-label="Logout"
                          >
                            <div className="w-7 xl:w-8 h-7 xl:h-8 bg-red-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                              <LogOut className="w-3.5 xl:w-4 h-3.5 xl:h-4 text-red-600" />
                            </div>
                            <div>
                              <span className="font-semibold text-sm xl:text-base">Logout</span>
                              <p className="text-xs text-red-400">Sign out of account</p>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Guest User Actions */
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    href="/auth/signin"
                    className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-2.5 font-semibold rounded-lg transition-all duration-200 hover:scale-105 text-sm lg:text-base ${isScrolled
                      ? 'text-gray-800 hover:text-gray-900 hover:bg-white/90 shadow-md hover:shadow-lg'
                      : 'text-gray-800 hover:text-gray-900 hover:bg-white/30'
                      }`}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-2 sm:px-3 lg:px-5 py-1.5 sm:py-2 lg:py-2.5 bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 hover:from-orange-600 hover:via-red-600 hover:to-pink-700 text-white font-bold rounded-lg shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transform hover:scale-105 transition-all duration-300 relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm lg:text-base">
                      <Plus className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                      Sign Up
                    </span>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`lg:hidden p-1.5 sm:p-2 rounded-lg transition-all duration-300 hover:scale-110 group ${isScrolled
                  ? 'text-gray-700 hover:text-gray-900 hover:bg-white/90 shadow-md hover:shadow-lg'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-white/30'
                  }`}
                aria-label="Toggle mobile menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 sm:w-6 h-5 sm:h-6 group-hover:rotate-90 transition-transform duration-300" />
                ) : (
                  <Menu className="w-5 sm:w-6 h-5 sm:h-6 group-hover:scale-110 transition-transform duration-300" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - RIGHT SIDEBAR WITH 3/6 WIDTH */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed top-14 sm:top-16 lg:top-20 right-0 w-3/5 h-[calc(100vh-56px)] sm:h-[calc(100vh-64px)] lg:h-[calc(100vh-80px)] bg-white/98 border-l border-gray-200/30 shadow-xl animate-slideInRight px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 overflow-y-auto z-50">
            {/* Mobile Navigation Links */}
            <nav className="space-y-2" aria-label="Mobile navigation">
              <div className="flex flex-col items-stretch space-y-2">
                {navLinks.map((link) => {
                  if (link.authRequired && !user) return null;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`group relative flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base ${isActive(link.href)
                        ? 'text-white bg-gradient-to-r bg-orange-500 shadow-lg shadow-orange-500/30'
                        : 'text-black hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <link.icon className={`w-4 sm:w-5 h-4 sm:h-5 ${isActive(link.href) ? 'text-white' : ''}`} />
                      <span className="font-medium">{link.label}</span>
                    </Link>
                  );
                })}

                {/* Mobile Categories Button */}
                <button
                  onClick={toggleMobileCategoryDropdown}
                  className="group relative flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-semibold transition-all duration-300 text-black hover:text-gray-900 hover:bg-orange-50 text-sm sm:text-base"
                >
                  <Tag className="w-4 sm:w-5 h-4 sm:h-5" />
                  <span className="font-medium">Categories</span>
                  <ChevronDown className={`w-3.5 sm:w-4 h-3.5 sm:h-4 ml-auto transition-transform duration-200 ${isMobileCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Mobile Categories Dropdown */}
                {isMobileCategoryDropdownOpen && (
                  <div className="bg-orange-50 rounded-xl border border-orange-100 p-3 sm:p-4 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 max-h-48 sm:max-h-60 overflow-y-auto">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => handleCategorySelect(category)}
                          className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 hover:text-orange-600 hover:bg-white/70 rounded-lg transition-all duration-300 group text-left w-full"
                        >
                          <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                          <span className="font-medium">{category}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* Mobile User Section */}
            {user ? (
              <div className="pt-3 sm:pt-4 border-t border-gray-200/50 space-y-3 sm:space-y-4">
                {/* Mobile User Profile Card */}
                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <Avatar 
                    src={user.avatar} 
                    alt={user.username} 
                    className="w-12 sm:w-16 h-12 sm:h-16 shadow-md flex-shrink-0" 
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-base sm:text-lg truncate">{user.username}</p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{user.email}</p>
                  </div>
                </div>

                {/* Mobile Profile Action Links */}
                <nav className="space-y-2" aria-label="Profile actions">
                  <Link
                    href={`/profile/${user.username}`}
                    className="flex items-center gap-3 p-3 sm:p-4 text-gray-800 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="w-4 sm:w-5 h-4 sm:h-5" />
                    <span className="font-medium text-sm sm:text-base">Profile</span>
                  </Link>
                  <Link
                    href="/favorites"
                    className="flex items-center gap-3 p-3 sm:p-4 text-gray-800 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Heart className="w-4 sm:w-5 h-4 sm:h-5" />
                    <span className="font-medium text-sm sm:text-base">Favorites</span>
                  </Link>
                  <Link
                    href="/collections"
                    className="flex items-center gap-3 p-3 sm:p-4 text-gray-800 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Bookmark className="w-4 sm:w-5 h-4 sm:h-5" />
                    <span className="font-medium text-sm sm:text-base">Collections</span>
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 p-3 sm:p-4 text-gray-800 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings className="w-4 sm:w-5 h-4 sm:h-5" />
                    <span className="font-medium text-sm sm:text-base">Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full p-3 sm:p-4 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-300"
                    aria-label="Logout"
                  >
                    <LogOut className="w-4 sm:w-5 h-4 sm:h-5" />
                    <span className="font-medium text-sm sm:text-base">Logout</span>
                  </button>
                </nav>
              </div>
            ) : (
              /* Mobile Guest Auth Buttons */
              <div className="pt-3 sm:pt-4 space-y-3 border-t border-gray-200/50">
                <div className="space-y-3">
                  <Link
                    href="/auth/signin"
                    className="flex items-center justify-center w-full px-4 py-2.5 sm:py-3 text-gray-800 font-semibold border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-300 text-sm sm:text-base"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 text-sm sm:text-base"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Plus className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                    Sign Up
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Navigation Spacer */}
      <div className="h-14 sm:h-16 lg:h-20" />

      {/* Backdrop for Mobile Menu - NO BLUR */}
      {(isMobileMenuOpen || isProfileDropdownOpen || isCategoryDropdownOpen || isNotificationDropdownOpen) && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => {
            setIsMobileMenuOpen(false);
            setIsProfileDropdownOpen(false);
            setIsCategoryDropdownOpen(false);
            setIsMobileCategoryDropdownOpen(false);
            setIsNotificationDropdownOpen(false);
          }}
          aria-hidden="true"
        />
      )}

      {/* Simplified Animation Styles */}
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

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .animate-slideInRight {
          animation: slideInRight 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        
        /* Reduce motion for accessibility */
        @media (prefers-reduced-motion: reduce) {
          .animate-pulse,
          .animate-fadeIn,
          .animate-slideInRight {
            animation: none;
          }
          
          .transition-all,
          .transition-colors,
          .transition-transform {
            transition: none;
          }
        }

        /* Simplified scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 3px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 2px;
        }
      `}</style>
    </>
  );
};

export default Navbar;