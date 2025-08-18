'use client';
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { WallpaperCard } from "@/components/wallpapercard/WallpaperCard";
import { LoginPopup } from "@/components/loginpopup";
import {
  ArrowLeft,
  Image,
  RefreshCw
} from 'lucide-react';

// Floating Doodle Component
const FloatingDoodle = ({ children, className = "", delay = 0 }) => (
  <div
    className={`absolute opacity-10 text-6xl ${className}`}
    style={{
      animation: `float 6s ease-in-out infinite alternate`,
      animationDelay: `${delay}s`
    }}
  >
    {children}
    <style jsx>{`
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(5deg); }
      }
    `}</style>
  </div>
);

export default function CollectionDetailPage() {
  const { name } = useParams();
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [loginActionType, setLoginActionType] = useState('general');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Handle unauthorized actions with action type
  const handleUnauthorizedAction = useCallback((actionType = 'general') => {
    console.log('Unauthorized action triggered:', actionType);
    setLoginActionType(actionType);
    setShowLoginPopup(true);
  }, []);

  // FIXED: Improved fetch function with better error handling
  const fetchWallpapers = useCallback(async () => {
    if (!name) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Decode the collection name properly
      const decodedName = decodeURIComponent(name);
      console.log('Fetching wallpapers for collection:', decodedName);
      
      const res = await fetch(`/api/collecion/add-wallpaper?name=${encodeURIComponent(decodedName)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await res.json();
      console.log('API Response:', data);
      
      if (!res.ok) {
        if (res.status === 401) {
          handleUnauthorizedAction('general');
          return;
        }
        throw new Error(data.message || `HTTP error! status: ${res.status}`);
      }
      
      if (data.success) {
        const wallpaperData = Array.isArray(data.wallpapers) ? data.wallpapers : [];
        console.log(`[WALLPAPERS FETCHED] Count: ${wallpaperData.length}`);
        setWallpapers(wallpaperData);
      } else {
        console.error("API returned success: false", data);
        setError(data.message || "Failed to fetch wallpapers");
        setWallpapers([]);
      }
    } catch (err) {
      console.error("Failed to fetch wallpapers:", err);
      setError(err.message || "Failed to fetch wallpapers");
      setWallpapers([]);
    } finally {
      setLoading(false);
    }
  }, [name, handleUnauthorizedAction]);

  // FIXED: Optimized wallpaper removal handler
  const handleWallpaperRemoved = useCallback((wallpaperId) => {
    console.log("Removing wallpaper from UI:", wallpaperId);
    
    // Instantly remove from UI for better UX
    setWallpapers(prev => {
      const updated = prev.filter(wallpaper => wallpaper._id !== wallpaperId);
      console.log(`Wallpapers updated: ${prev.length} -> ${updated.length}`);
      return updated;
    });
    
    // Optional: Refresh after delay to ensure data consistency
    // Commenting this out to reduce API calls and improve performance
    // setTimeout(() => {
    //   fetchWallpapers();
    // }, 2000);
  }, []);

  // FIXED: Improved refresh function
  const handleRefresh = useCallback(async () => {
    if (refreshing) return; // Prevent multiple simultaneous refreshes
    
    setRefreshing(true);
    try {
      await fetchWallpapers();
    } finally {
      setRefreshing(false);
    }
  }, [fetchWallpapers, refreshing]);

  // Initial fetch
  useEffect(() => {
    fetchWallpapers();
  }, [fetchWallpapers]);

  // Handle back navigation properly
  const handleBackNavigation = useCallback(() => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/collections';
    }
  }, []);

  // Loading state
  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your collection...</p>
        </div>
      </div>
    );
  }

  // Handle decoding properly with error handling
  let decodedName;
  try {
    decodedName = decodeURIComponent(name || '');
  } catch (err) {
    console.error("Failed to decode collection name:", err);
    decodedName = name || "Unknown Collection";
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background Doodles */}
      <FloatingDoodle className="top-20 left-10 text-purple-200" delay={0}>🖼️</FloatingDoodle>
      <FloatingDoodle className="top-32 right-16 text-pink-200" delay={0.5}>✨</FloatingDoodle>
      <FloatingDoodle className="top-60 left-1/4 text-blue-200" delay={1}>🎨</FloatingDoodle>
      <FloatingDoodle className="bottom-40 right-20 text-indigo-200" delay={1.5}>💫</FloatingDoodle>
      <FloatingDoodle className="bottom-20 left-1/3 text-green-200" delay={2}>📁</FloatingDoodle>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <header className="mb-8">
          {/* Navigation and Collection Name */}
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={handleBackNavigation}
              className="group p-3 bg-white/70 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/90 hover:shadow-lg transition-all duration-300"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-purple-600 transition-colors duration-300" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800">{decodedName}</h1>
              <p className="text-gray-600 mt-1">
                {wallpapers.length} {wallpapers.length === 1 ? 'wallpaper' : 'wallpapers'}
              </p>
            </div>
            {/* FIXED: Refresh button */}
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="group p-3 bg-white/70 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/90 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Refresh collection"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 group-hover:text-purple-600 transition-colors duration-300 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* Content Section */}
        <main>
          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-20">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center mx-auto">
                  <span className="text-4xl">⚠️</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Collection</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-2xl hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Retrying...' : 'Try Again'}
              </button>
            </div>
          )}

          {/* Empty State */}
          {!error && wallpapers.length === 0 && !loading && (
            <div className="text-center py-20">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto">
                  <Image className="w-12 h-12 text-gray-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Wallpapers Yet</h3>
              <p className="text-gray-600 mb-4">This collection is empty. Add some wallpapers to get started!</p>
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-2xl hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh Collection'}
              </button>
            </div>
          )}

          {/* Wallpapers Grid */}
          {!error && wallpapers.length > 0 && (
            <>
              {/* Loading overlay for refresh */}
              {refreshing && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 flex items-center justify-center">
                  <div className="bg-white rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                      <span className="text-gray-700 font-medium">Refreshing collection...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* PRESERVED: Original grid layout as requested */}
              <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-3 gap-3 space-y-3 mx-auto px-4 w-full">
                {wallpapers.map((wallpaper, index) => (
                  <WallpaperCard
                    key={`${wallpaper._id}-${index}`} // More stable key
                    wallpaper={wallpaper}
                    index={index}
                    onUnauthorizedAction={handleUnauthorizedAction}
                    onWallpaperRemoved={handleWallpaperRemoved}
                    showUserInfo={true}
                  />
                ))}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Login Popup */}
      <LoginPopup
        isVisible={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        actionType={loginActionType}
      />
    </div>
  );
}