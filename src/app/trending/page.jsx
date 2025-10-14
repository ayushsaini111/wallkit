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
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [loginActionType, setLoginActionType] = useState('general');
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Refs
  const bottomObserverRef = useRef(null);
  const loadedWallpaperIds = useRef(new Set());
  const isLoadingRef = useRef(false);

  // Constants
  const LOAD_LIMIT = 50; // Load 50 wallpapers at a time

  // Skeleton heights for varied loading cards
  const skeletonHeights = [240, 280, 320, 260, 300, 350, 270, 310, 290, 330, 250, 370];

  const handleUnauthorizedAction = useCallback((actionType = 'general') => {
    setLoginActionType(actionType);
    setShowLoginPopup(true);
  }, []);

  // Load more wallpapers (next page)
  const loadMoreWallpapers = useCallback(async () => {
    if (isLoadingRef.current || !hasMore || loading) return;
    
    console.log(`Loading more wallpapers - Page ${currentPage + 1}`);
    
    isLoadingRef.current = true;
    
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
      console.log(`Loaded ${newWallpapers.length} new wallpapers for page ${nextPage}`);
      
      if (newWallpapers.length > 0) {
        // Filter duplicates
        const uniqueNew = newWallpapers.filter(w => {
          if (loadedWallpaperIds.current.has(w._id)) {
            return false;
          }
          loadedWallpaperIds.current.add(w._id);
          return true;
        });
        
        console.log(`Adding ${uniqueNew.length} unique wallpapers`);
        
        if (uniqueNew.length > 0) {
          setTrending(prev => {
            const updated = [...prev, ...uniqueNew];
            console.log(`Total wallpapers now: ${updated.length}`);
            return updated;
          });
          setCurrentPage(nextPage);
        }
        
        // Update pagination state
        const hasMoreWallpapers = data.pagination?.hasMore ?? false;
        setHasMore(hasMoreWallpapers);
        setTotalPages(data.pagination?.totalPages ?? 0);
        setTotalCount(data.pagination?.totalCount ?? 0);
        
        console.log(`Has more: ${hasMoreWallpapers}, Total pages: ${data.pagination?.totalPages}`);
      } else {
        console.log('No more wallpapers to load');
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more wallpapers:', err);
      setError(`Failed to load more wallpapers: ${err.message}`);
    } finally {
      setLoadingMore(false);
      isLoadingRef.current = false;
    }
  }, [hasMore, loading, currentPage]);

  // Intersection Observer - triggers only when user reaches the very end
  useEffect(() => {
    if (!bottomObserverRef.current || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoadingRef.current) {
          console.log('User reached end of current wallpapers - loading next 50');
          loadMoreWallpapers();
        }
      },
      { 
        root: null,
        rootMargin: '0px', // No early trigger - load exactly when user reaches the end
        threshold: 0.1
      }
    );

    observer.observe(bottomObserverRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loading, loadMoreWallpapers]);

  // Initial fetch - Load first 50 wallpapers
  useEffect(() => {
    const fetchInitialTrending = async () => {
      try {
        console.log('Fetching initial trending wallpapers...');
        setLoading(true);
        setCurrentPage(1);
        setTrending([]);
        loadedWallpaperIds.current.clear();
        setHasMore(true);
        setError(null);
        isLoadingRef.current = false;

        const response = await fetch(`/api/trending?page=1&limit=${LOAD_LIMIT}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
          const fetched = data.wallpapers || [];
          console.log(`Initial fetch: ${fetched.length} wallpapers loaded`);
          
          // Track loaded wallpaper IDs
          fetched.forEach(w => loadedWallpaperIds.current.add(w._id));
          
          setTrending(fetched);
          
          // Update pagination state
          setHasMore(data.pagination?.hasMore ?? false);
          setTotalPages(data.pagination?.totalPages ?? 0);
          setTotalCount(data.pagination?.totalCount ?? 0);
          
          console.log(`Has more after initial: ${data.pagination?.hasMore}, Total: ${data.pagination?.totalCount}`);
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

    fetchInitialTrending();
  }, []);

  // Loading Skeleton Component
  const LoadingSkeleton = () => (
    <div className="columns-2 gap-2 space-y-1 sm:columns-2 md:columns-3 lg:columns-3 lg:gap-2 xl:columns-3 mx-auto px-2 sm:px-4 w-full" aria-label="Loading trending wallpapers">
      {[...Array(12)].map((_, i) => (
        <div 
          key={i} 
          className="relative bg-gradient-to-br from-white/100 via-orange-50/50 to-pink-50/50 rounded-2xl sm:rounded-3xl border border-gray-100/50 shadow-lg break-inside-avoid mb-3 overflow-hidden backdrop-blur-sm"
          style={{ 
            height: `${skeletonHeights[i % skeletonHeights.length]}px`,
            animationDelay: `${i * 150}ms`
          }}
        >
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          <div className="p-3 sm:p-4 h-full flex flex-col justify-between">
            <div className="space-y-2 sm:space-y-3">
              <div className="h-3 sm:h-4 bg-gray-200/60 rounded-full w-3/4 animate-pulse"></div>
              <div className="h-2.5 sm:h-3 bg-gray-200/40 rounded-full w-1/2 animate-pulse"></div>
            </div>
            <div className="flex justify-between items-center mt-3 sm:mt-4">
              <div className="h-6 sm:h-8 w-6 sm:w-8 bg-gray-200/60 rounded-full animate-pulse"></div>
              <div className="h-5 sm:h-6 bg-gray-200/40 rounded-full w-12 sm:w-16 animate-pulse"></div>
            </div>
          </div>
          <div className="absolute top-2 right-2">
            <p className='bg-gradient-to-r font-extrabold opacity-30 to-orange-500 from-pink-500 text-transparent bg-clip-text text-xs'>WallPickr</p>
          </div>
        </div>
      ))}
    </div>
  );

  // Loading skeleton for initial load
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

          <LoadingSkeleton />
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
            {/* Wallpapers Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2 lg:gap-3 xl:gap-4 px-1 md:px-3 sm:px-4 w-full">
              {trending.map((wallpaper, index) => (
                <WallpaperCard 
                  key={wallpaper._id} 
                  wallpaper={wallpaper} 
                  index={index}
                  onUnauthorizedAction={handleUnauthorizedAction}
                />
              ))}
            </div>

            {/* Loading More Indicator */}
            {loadingMore && (
              <div className="flex items-center justify-center py-8 sm:py-12">
                <div className="flex items-center gap-3 sm:gap-4 bg-white/90 backdrop-blur-xl rounded-xl sm:rounded-2xl px-6 sm:px-8 py-3 sm:py-4 shadow-xl border border-gray-200">
                  <div className="w-5 sm:w-6 h-5 sm:h-6 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin" aria-hidden="true"></div>
                  <span className="text-gray-700 font-medium text-base sm:text-lg">
                    Loading next 50 wallpapers<span className="loading-dots"></span>
                  </span>
                </div>
              </div>
            )}

            {/* Intersection Observer Target - positioned at the very end */}
            {hasMore && !loadingMore && (
              <div 
                ref={bottomObserverRef} 
                className="w-full h-4 flex justify-center items-center mt-8"
              >
                <div className="bg-gradient-to-r from-orange-200 to-pink-200 rounded-full px-4 py-2 text-xs text-gray-600 font-medium">
                  End of current 50 - scroll to load more 🔥
                </div>
              </div>
            )}
            
            {/* End Message */}
            {!hasMore && trending.length > 0 && (
              <div className="text-center py-12 mt-16">
                <div className="bg-gradient-to-r from-orange-50 to-pink-50 backdrop-blur-xl rounded-2xl p-8 max-w-lg mx-auto border border-gray-200 shadow-lg">
                  <div className="text-5xl mb-4 animate-bounce">🎉</div>
                  <p className="text-gray-700 text-xl font-bold mb-2">
                    You've seen all trending wallpapers!
                  </p>
                  <p className="text-gray-600 text-lg mb-4">
                    Come back later for fresh trending content
                  </p>
                  <button 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-xl hover:from-orange-600 hover:to-pink-700 transition-all duration-300 shadow-xl font-semibold"
                  >
                    Back to Top
                  </button>
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

        .loading-dots::after {
          content: '';
          animation: loading-dots 1.5s infinite;
        }

        @keyframes loading-dots {
          0%, 20% { content: ''; }
          40% { content: '.'; }
          60% { content: '..'; }
          80%, 100% { content: '...'; }
        }
      `}</style>
    </div>
  );
}