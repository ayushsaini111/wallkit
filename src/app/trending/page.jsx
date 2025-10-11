'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { WallpaperCard } from '@/components/wallpaperCard/WallpaperCard';
import { LoginPopup } from '@/components/loginpopup';

// Floating Doodle Component
const FloatingDoodle = ({ children, className = "", delay = 0 }) => (
  <div
    className={`absolute opacity-10 text-6xl animate-float ${className}`}
    style={{
      animationDelay: `${delay}s`,
      animationDuration: '6s',
      animationIterationCount: 'infinite',
      animationDirection: 'alternate'
    }}
  >
    {children}
  </div>
);

export default function TrendingSection() {
  // State management
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingPrevious, setLoadingPrevious] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [loginActionType, setLoginActionType] = useState('general');
  const [totalPages, setTotalPages] = useState(0);

  // Refs
  const topObserverRef = useRef(null);
  const bottomObserverRef = useRef(null);
  const loadedWallpaperIds = useRef(new Set());

  // Constants
  const LOAD_LIMIT = 50;
  const INITIAL_PAGE = 1;

  const handleUnauthorizedAction = useCallback((actionType = 'general') => {
    setLoginActionType(actionType);
    setShowLoginPopup(true);
  }, []);

  // Load more wallpapers (next page)
  const loadMoreWallpapers = useCallback(async () => {
    if (loadingMore || !hasMore || loadingPrevious) return;
    
    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      
      const response = await fetch(`/api/trending?page=${nextPage}&limit=${LOAD_LIMIT}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch wallpapers');
      }
      
      const newWallpapers = data.wallpapers || [];
      
      if (newWallpapers.length > 0) {
        // Filter duplicates
        const uniqueNew = newWallpapers.filter(w => {
          if (loadedWallpaperIds.current.has(w._id)) {
            return false;
          }
          loadedWallpaperIds.current.add(w._id);
          return true;
        });
        
        if (uniqueNew.length > 0) {
          setTrending(prev => [...prev, ...uniqueNew]);
          setCurrentPage(nextPage);
        }
        
        // Update pagination state
        setHasMore(data.pagination?.hasMore ?? false);
        setTotalPages(data.pagination?.totalPages ?? 0);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more wallpapers:', err);
      setError(`Failed to load more wallpapers: ${err.message}`);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, loadingPrevious, currentPage]);

  // Load previous wallpapers (previous page)
  const loadPreviousWallpapers = useCallback(async () => {
    if (loadingPrevious || !hasPrevious || loadingMore) return;
    
    try {
      setLoadingPrevious(true);
      const prevPage = currentPage - 1;
      
      const response = await fetch(`/api/trending?page=${prevPage}&limit=${LOAD_LIMIT}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch wallpapers');
      }
      
      const previousWallpapers = data.wallpapers || [];
      
      if (previousWallpapers.length > 0) {
        // Filter duplicates
        const uniquePrevious = previousWallpapers.filter(w => {
          if (loadedWallpaperIds.current.has(w._id)) {
            return false;
          }
          loadedWallpaperIds.current.add(w._id);
          return true;
        });
        
        if (uniquePrevious.length > 0) {
          setTrending(prev => [...uniquePrevious, ...prev]);
          setCurrentPage(prevPage);
        }
        
        // Update pagination state
        setHasPrevious(data.pagination?.hasPrevious ?? false);
        setTotalPages(data.pagination?.totalPages ?? 0);
      } else {
        setHasPrevious(false);
      }
    } catch (err) {
      console.error('Error loading previous wallpapers:', err);
      setError(`Failed to load previous wallpapers: ${err.message}`);
    } finally {
      setLoadingPrevious(false);
    }
  }, [loadingPrevious, hasPrevious, loadingMore, currentPage]);

  // Bottom Intersection Observer (for loading more)
  useEffect(() => {
    if (!bottomObserverRef.current || !hasMore || loadingMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          loadMoreWallpapers();
        }
      },
      { 
        root: null,
        rootMargin: '100px',
        threshold: 0.1
      }
    );

    observer.observe(bottomObserverRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loadingMore, loading, loadMoreWallpapers]);

  // Top Intersection Observer (for loading previous)
  useEffect(() => {
    if (!topObserverRef.current || !hasPrevious || loadingPrevious || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          loadPreviousWallpapers();
        }
      },
      { 
        root: null,
        rootMargin: '100px',
        threshold: 0.1
      }
    );

    observer.observe(topObserverRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasPrevious, loadingPrevious, loading, loadPreviousWallpapers]);

  // Initial fetch - Start from middle page for bi-directional scrolling
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        setCurrentPage(INITIAL_PAGE);
        setTrending([]);
        loadedWallpaperIds.current.clear();
        setHasMore(true);
        setHasPrevious(false);
        setError(null);

        const response = await fetch(`/api/trending?page=${INITIAL_PAGE}&limit=${LOAD_LIMIT}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
          const fetched = data.wallpapers || [];
          
          // Track loaded wallpaper IDs
          fetched.forEach(w => loadedWallpaperIds.current.add(w._id));
          
          setTrending(fetched);
          
          // Update pagination state
          setHasMore(data.pagination?.hasMore ?? false);
          setHasPrevious(data.pagination?.hasPrevious ?? false);
          setTotalPages(data.pagination?.totalPages ?? 0);
        } else {
          throw new Error(data.message || 'Failed to fetch trending wallpapers');
        }
      } catch (err) {
        console.error('Initial fetch error:', err);
        setError(`Failed to load trending wallpapers: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 relative overflow-hidden">
        {/* Background Doodles */}
        <FloatingDoodle className="top-20 left-10 text-orange-200" delay={0}>🔥</FloatingDoodle>
        <FloatingDoodle className="top-32 right-16 text-pink-200" delay={0.5}>✨</FloatingDoodle>
        <FloatingDoodle className="top-60 left-1/4 text-purple-200" delay={1}>📈</FloatingDoodle>

        <div className="relative z-10 container mx-auto px-1 py-12 max-w-7xl">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-orange-600 via-pink-600 to-purple-500 bg-clip-text text-transparent">
                Trending
              </span>
              <br />
              <span className="bg-gradient-to-r from-pink-600 via-purple-500 to-orange-600 bg-clip-text text-transparent">
                Wallpapers
              </span>
            </h1>
          </div>

          {/* Loading Skeleton */}
          <div className="columns-2 gap-2 space-y-1 sm:columns-2 md:columns-3 lg:columns-3 lg:gap-2 xl:columns-3 mx-auto px-2 sm:px-4 w-full">
            {[...Array(12)].map((_, i) => (
              <div 
                key={i} 
                className="relative bg-gradient-to-br from-white/100 via-orange-50/50 to-pink-50/50 rounded-2xl sm:rounded-3xl border border-gray-100/50 shadow-lg break-inside-avoid mb-3 overflow-hidden backdrop-blur-sm"
                style={{ height: `${240 + (i % 4) * 80}px` }}
              >
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                <div className="p-3 sm:p-4 h-full flex flex-col justify-between opacity-70">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="h-3 sm:h-4 bg-gray-200/60 rounded-full w-3/4 animate-pulse"></div>
                    <div className="h-2.5 sm:h-3 bg-gray-200/40 rounded-full w-1/2 animate-pulse"></div>
                  </div>
                  <div className="flex justify-between items-center mt-3 sm:mt-4">
                    <div className="h-6 sm:h-8 w-6 sm:w-8 bg-gray-200/60 rounded-full animate-pulse"></div>
                    <div className="h-5 sm:h-6 bg-gray-200/40 rounded-full w-12 sm:w-16 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Background Doodles */}
      <FloatingDoodle className="top-20 left-10 text-orange-200" delay={0}>🔥</FloatingDoodle>
      <FloatingDoodle className="top-32 right-16 text-pink-200" delay={0.5}>✨</FloatingDoodle>
      <FloatingDoodle className="top-60 left-1/4 text-purple-200" delay={1}>📈</FloatingDoodle>
      <FloatingDoodle className="top-80 right-1/3 text-orange-200" delay={1.5}>🎨</FloatingDoodle>
      <FloatingDoodle className="bottom-40 left-16 text-pink-200" delay={2}>🌟</FloatingDoodle>
      <FloatingDoodle className="bottom-60 right-20 text-purple-200" delay={2.5}>🎭</FloatingDoodle>
      <FloatingDoodle className="bottom-20 left-1/3 text-orange-200" delay={3}>⚡</FloatingDoodle>

      <div className="relative z-10 container mx-auto px-1 py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-orange-600 via-pink-600 to-purple-500 bg-clip-text text-transparent">
              Trending
            </span>
            <br />
            <span className="bg-gradient-to-r from-pink-600 via-purple-500 to-orange-600 bg-clip-text text-transparent">
              Wallpapers
            </span>
          </h1>

          <p className="text-lg md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed font-light">
            Discover the most popular and stunning wallpapers
            <span className="font-medium text-orange-600"> loved by our community</span>
          </p>
        </div>

        {/* Content */}
        {error ? (
          <div className="text-center py-16">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-8 shadow-2xl max-w-md mx-auto border border-gray-100">
              <div className="text-6xl mb-4">😕</div>
              <p className="text-red-600 mb-6 text-lg font-semibold">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-xl hover:from-orange-600 hover:to-pink-700 transition-all duration-300 shadow-xl font-semibold"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : trending.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-12 max-w-lg mx-auto border border-gray-100">
              <div className="text-6xl mb-4">📈</div>
              <p className="text-gray-700 text-xl font-bold mb-2">No trending wallpapers found</p>
              <p className="text-gray-500 text-lg mb-6">Check back later for the latest trending content</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all duration-300 font-semibold"
              >
                Refresh
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Top Loading Previous Indicator */}
            {loadingPrevious && (
              <div className="text-center mb-8">
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-4 max-w-md mx-auto border border-gray-100 shadow-lg">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-700 font-medium">Loading previous wallpapers...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Top Intersection Observer Target */}
            {hasPrevious && !loadingPrevious && (
              <div 
                ref={topObserverRef} 
                className="w-full mb-8 h-1"
                style={{ minHeight: '1px' }}
              />
            )}

            {/* Wallpapers Grid */}
            <div className="columns-2 gap-1 space-y-1 sm:columns-2 md:columns-3 lg:columns-3 xl:columns-3 xl:gap-3 xl:space-y-3 px-1 md:px-3 sm:px-4 w-full">
              {trending.map((wallpaper, index) => (
                <WallpaperCard 
                  key={wallpaper._id} 
                  wallpaper={wallpaper} 
                  index={index}
                  onUnauthorizedAction={handleUnauthorizedAction}
                />
              ))}
            </div>

            {/* Bottom Intersection Observer Target */}
            {hasMore && !loadingMore && (
              <div 
                ref={bottomObserverRef} 
                className="w-full mt-8 h-1"
                style={{ minHeight: '1px' }}
              />
            )}

            {/* Bottom Loading More Indicator */}
            {loadingMore && (
              <div className="text-center mt-8">
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-4 max-w-md mx-auto border border-gray-100 shadow-lg">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-700 font-medium">Loading more wallpapers...</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* End Message */}
            {!hasMore && !hasPrevious && trending.length > 0 && (
              <div className="text-center py-8 mt-8">
                <div className="bg-gradient-to-r from-orange-50 to-pink-50 backdrop-blur-xl rounded-2xl p-6 max-w-md mx-auto border border-gray-200 shadow-lg">
                  <div className="text-4xl mb-3 animate-bounce">🎉</div>
                  <p className="text-gray-700 text-lg font-semibold">All trending wallpapers loaded!</p>
                  
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <LoginPopup 
        isVisible={showLoginPopup} 
        onClose={() => setShowLoginPopup(false)} 
        actionType={loginActionType}
      />

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-shimmer {
          animation: shimmer 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}