"use client";
import { useEffect, useState } from "react";
import { WallpaperCard } from "@/components/wallpaperCard/WallpaperCard";
import { Heart, RefreshCw, Sparkles, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

// Floating Doodle Component
const FloatingDoodle = ({ children, className, delay = 0 }) => {
  return (
    <div 
      className={`absolute animate-bounce text-6xl select-none pointer-events-none opacity-50 ${className}`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: '3s'
      }}
    >
      {children}
    </div>
  );
};

// Login Popup Component (placeholder - replace with your actual component)
const LoginPopup = ({ isVisible, onClose, actionType }) => {
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <h3 className="text-lg font-bold mb-4">Login Required</h3>
        <p className="text-gray-600 mb-4">Please log in to {actionType}</p>
        <button 
          onClick={onClose}
          className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default function FavoritesPage() {
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [loginActionType, setLoginActionType] = useState('');
  const router = useRouter();

  const fetchFavorites = async () => {
    try {
      setError(null);
      const res = await fetch("/api/like", { method: "GET" });
      const data = await res.json();
      if (data.success) {
        setWallpapers(data.wallpapers || []);
      } else {
        setError(data.message || "Failed to load favorites");
      }
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFavorites();
  };

  const handleBackNavigation = () => {
    router.back();
  };

  const handleUnauthorizedAction = (actionType) => {
    setLoginActionType(actionType);
    setShowLoginPopup(true);
  };

  const handleWallpaperRemoved = (removedWallpaperId) => {
    setWallpapers(prev => prev.filter(w => w._id !== removedWallpaperId));
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Background Doodles - Heart/Love themed */}
      <FloatingDoodle className="top-20 left-10 text-gray-300" delay={0}>❤️</FloatingDoodle>
      <FloatingDoodle className="top-32 right-16 text-gray-300" delay={0.5}>💕</FloatingDoodle>
      <FloatingDoodle className="top-60 left-1/4 text-gray-300" delay={1}>💖</FloatingDoodle>
      <FloatingDoodle className="bottom-40 right-20 text-gray-300" delay={1.5}>💗</FloatingDoodle>
      <FloatingDoodle className="bottom-20 left-1/3 text-gray-300" delay={2}>💝</FloatingDoodle>
      <FloatingDoodle className="top-1/2 right-1/3 text-gray-300" delay={2.5}>✨</FloatingDoodle>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <header className=" min-h-[40vh] sm:min-h-[45vh] md:min-h-[50vh] lg:h-[60vh] relative overflow-hidden mb-12">
          {/* Animated Background Elements */}
          <div className="absolute inset-0" aria-hidden="true">
            <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-gray-200/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-64 sm:w-96 h-64 sm:h-96 bg-gray-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 w-56 sm:w-80 h-56 sm:h-80 bg-gray-200/25 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>

          <div className="relative z-10 max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 pt-8 sm:pt-12 md:pt-16 pb-4 sm:pb-6 md:pb-8 h-full flex flex-col justify-center">
            {/* Navigation */}
            <div className="absolute top-6 left-6">
              <button 
                onClick={handleBackNavigation}
                className="group p-3 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors duration-300" />
              </button>
            </div>

            {/* Refresh Button */}
            <div className="absolute top-6 right-6">
              <button 
                onClick={handleRefresh}
                disabled={refreshing || loading}
                className="group p-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Refresh favorites"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors duration-300 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Title with Enhanced Animation */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
                <div className="relative" aria-hidden="true">
                  {/* <Heart className="w-6 sm:w-8 md:w-12 h-6 sm:h-8 md:h-12 text-red-400  fill-red-400" /> */}
                  <div className="absolute inset-0 w-6 sm:w-8 md:w-12 h-6 sm:h-8 md:h-12 bg-red-400/20 rounded-full blur-xl animate-pulse"></div>
                </div>
                <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black bg-gradient-to-r from-pink-500 via-orange-500 to-pink-800 bg-clip-text text-transparent drop-shadow-2xl leading-tight">
                  My Favorite Wallpapers
                </h1>
                <div className="relative" aria-hidden="true">
                  <Sparkles className="w-6 sm:w-8 md:w-12 h-6 sm:h-8 md:h-12 text-pink-400 " />
                  <div className="absolute inset-0 w-6 sm:w-8 md:w-12 h-6 sm:h-8 md:h-12 bg-pink-400/20 rounded-full blur-xl animate-pulse"></div>
                </div>
              </div>
              
              <div className="relative mb-8">
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl mx-auto font-light leading-relaxed px-4">
                  {loading ? (
                    "Loading your favorite wallpapers..."
                  ) : (
                    <>
                      Your personal collection of {wallpapers.length} beautiful wallpapers that captured your heart
                      {wallpapers.length > 0 && <span className="text-red-400 ml-2">❤️</span>}
                    </>
                  )}
                </p>
              </div>

              {/* Stats with Enhanced Design */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-12 text-gray-700">
                <div className="flex items-center gap-2 sm:gap-3 bg-white/60 backdrop-blur-2xl px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200">
                  <Heart className="w-4 sm:w-5 h-4 sm:h-5 text-red-400 fill-red-400" aria-hidden="true" />
                  <span className="font-semibold text-sm sm:text-base">{wallpapers.length} Loved</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 bg-white/60 backdrop-blur-2xl px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200">
                  <Sparkles className="w-4 sm:w-5 h-4 sm:h-5 text-pink-400" aria-hidden="true" />
                  <span className="font-semibold text-sm sm:text-base">Curated Collection</span>
                </div>
              </div>
            </div>


          </div>
        </header>

        {/* Content Section */}
        <main>
          {/* Loading State */}
          {loading && (
            <div className="text-center py-20">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-pink-200 rounded-2xl flex items-center justify-center mx-auto">
                  <Heart className="w-12 h-12 text-red-400 animate-pulse fill-red-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Loading Your Favorites</h3>
              <p className="text-gray-600">Fetching your loved wallpapers...</p>
              <div className="flex justify-center mt-4">
                <div className="w-8 h-8 border-2 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-20">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center mx-auto">
                  <span className="text-4xl">💔</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something Went Wrong</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <Heart className="w-12 h-12 text-gray-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-400 text-xl">💔</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Favorites Yet</h3>
              <p className="text-gray-600 mb-6">
                Start exploring wallpapers and tap the heart icon to add them to your favorites! ❤️
              </p>
              <button 
                onClick={() => router.push('/')}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-full hover:from-gray-900 hover:to-black transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl group"
              >
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                <span className="font-semibold text-lg">Explore More Wallpapers</span>
                <div className="w-6 h-6 border-2 border-white/60 border-l-0 border-b-0 transform rotate-45 group-hover:translate-x-1 transition-transform duration-300"></div>
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
                      <div className="w-6 h-6 border-2 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                      <span className="text-gray-700 font-medium">Refreshing your favorites...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Wallpapers Grid with enhanced styling */}
              <div className="relative">
                <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-3 gap-3 space-y-3 mx-auto px-4 w-full py-6">
                  {wallpapers.map((wallpaper, index) => (
                    <WallpaperCard
                      key={`${wallpaper._id}-${index}`}
                      wallpaper={wallpaper}
                      index={index}
                      onUnauthorizedAction={handleUnauthorizedAction}
                      onWallpaperRemoved={handleWallpaperRemoved}
                      showUserInfo={true}
                    />
                  ))}
                </div>
              </div>

              {/* Bottom CTA */}
              {wallpapers.length > 0 && (
                <div className="text-center mt-12 py-8">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-500/10 to-gray-600/10 backdrop-blur-xl px-6 py-3 rounded-full border border-gray-300/30">
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                    <span className="text-gray-700 font-medium">
                      You've got great taste in wallpapers!
                    </span>
                    <Sparkles className="w-4 h-4 text-pink-400" />
                  </div>
                </div>
              )}
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