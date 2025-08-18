'use client';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { LayoutGrid, X, Sparkles } from 'lucide-react';

// Import separated components
import HeroSection from '@/components/wallpapergallary/heroSection';
import EnhancedStyles from '@/components/wallpapergallary/enhancedstyle';
import { WallpaperCard } from '@/components/wallpaperCard/WallpaperCard';
import { LoginPopup } from '../loginpopup';

const WallpaperGallery = () => {
  // State management
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [suggestions, setSuggestions] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [loginActionType, setLoginActionType] = useState('general');
  const skeletonHeights = [240, 280, 320, 260, 300, 350, 270, 310, 290, 330, 250, 370];

  // Refs
  const observerRef = useRef(null);

  // Categories - Optimized for performance
  const categories = useMemo(() => [
    { name: 'All', icon: '🌟' },
    { name: 'Nature', icon: '🌿' },
    { name: 'Abstract', icon: '🎨' },
    { name: 'Minimalist', icon: '⚪' },
    { name: 'Animals', icon: '🐾' },
    { name: 'Cityscape', icon: '🏙️' },
    { name: 'Space', icon: '🚀' },
    { name: 'Technology', icon: '💻' },
    { name: 'Fantasy', icon: '🪄' },
    { name: 'Textures & Patterns', icon: '🔳' },
    { name: 'Food & Drinks', icon: '🍔' },
    { name: 'People', icon: '🧑' },
    { name: 'Architecture', icon: '🏛️' },
    { name: 'Cars & Vehicles', icon: '🚗' },
    { name: 'Art & Illustration', icon: '🖌️' },
    { name: '3D Renders', icon: '🖥️' },
    { name: 'Typography', icon: '🔠' },
    { name: 'Dark', icon: '🌙' },
    { name: 'Light', icon: '☀️' },
    { name: 'Vintage', icon: '📻' },
    { name: 'Sports', icon: '🏅' },
    { name: 'Other', icon: '📦' }
  ], []);

  // Handle unauthorized actions with action type
  const handleUnauthorizedAction = useCallback((actionType = 'general') => {
    console.log('Unauthorized action triggered:', actionType);
    setLoginActionType(actionType);
    setShowLoginPopup(true);
  }, []);

  // Handle search change
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion) => {
    setSearchTerm(suggestion.value);
  }, []);

  // Load more wallpapers function
  const loadMoreWallpapers = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      
      const endpoint = selectedCategory === 'all' || selectedCategory === 'All'
        ? `/api/wallpapers?page=${nextPage}`
        : `/api/wallpapers/category?name=${selectedCategory}&page=${nextPage}`;
      
      const res = await fetch(endpoint);
      const data = await res.json();
      const newWallpapers = data.wallpapers || [];
      
      if (newWallpapers.length > 0) {
        setWallpapers(prev => [...prev, ...newWallpapers]);
        setPage(nextPage);
        setHasMore(newWallpapers.length === 20);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more wallpapers:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, selectedCategory]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading && !loadingMore) {
          loadMoreWallpapers();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, loadMoreWallpapers]);

  // Initial fetch wallpapers with error handling
  useEffect(() => {
    const getWallpapers = async () => {
      try {
        setLoading(true);
        setPage(1);
        setWallpapers([]);
        setHasMore(true);
        
        const endpoint = selectedCategory === 'all' || selectedCategory === 'All'
          ? '/api/wallpapers'
          : `/api/wallpapers/category?name=${selectedCategory}`;
        
        const res = await fetch(endpoint);
        
        if (res.status === 401) {
          console.log('User not authenticated - some features may be limited');
        }
        
        const data = await res.json();
        const fetched = data.wallpapers || [];
        console.log("Response:", fetched);
        setWallpapers(fetched);
        
        setError(null);
        setHasMore(fetched.length === 20);
      } catch (err) {
        console.error('Error loading wallpapers:', err);
        setError('Failed to load wallpapers. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    getWallpapers();
  }, [selectedCategory]);

  // Filter wallpapers - Optimized
  const filteredWallpapers = useMemo(() => {
    if (!searchTerm) return wallpapers;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return wallpapers.filter(wp =>
      wp.title?.toLowerCase().includes(lowerSearchTerm) ||
      wp.tags?.some(t => t.toLowerCase().includes(lowerSearchTerm))
    );
  }, [wallpapers, searchTerm]);

  // Enhanced Loading Skeleton Component
  const LoadingSkeleton = () => (
    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-3 gap-3 space-y-3 mx-auto px-4 w-full" aria-label="Loading wallpapers">
      {[...Array(12)].map((_, i) => (
         <div 
    key={i} 
    className="relative bg-gradient-to-br from-white/100 via-blue-50/50 to-purple-50/50 rounded-3xl border border-gray-100/50 shadow-lg break-inside-avoid mb-3 overflow-hidden backdrop-blur-sm"
    style={{ 
      height: `${skeletonHeights[i % skeletonHeights.length]}px`,
      animationDelay: `${i * 150}ms`
    }}
  >
          {/* Shimmer effect */}
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          
          {/* Content skeleton */}
          <div className="p-4 h-full flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-4 bg-gray-200/60 rounded-full w-3/4 animate-pulse"></div>
              <div className="h-3 bg-gray-200/40 rounded-full w-1/2 animate-pulse"></div>
            </div>
            <div className="flex justify-between items-center mt-4">
              <div className="h-8 w-8 bg-gray-200/60 rounded-full animate-pulse"></div>
              <div className="h-6 bg-gray-200/40 rounded-full w-16 animate-pulse"></div>
            </div>
          </div>
          
          {/* Floating sparkles */}
          <div className="absolute top-2 right-2">
            <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Enhanced Styles Component */}
      <EnhancedStyles />
      
      {/* Custom CSS for shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-shimmer { 
          animation: shimmer 2s infinite; 
        }
      `}</style>
      
      {/* Hero Section Component */}
      <HeroSection 
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        suggestions={suggestions}
        onSuggestionClick={handleSuggestionClick}
        wallpapers={wallpapers}
      />

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 relative z-10">
        <div className="space-y-8">
          {/* Categories Navigation */}
          <nav aria-label="Wallpaper categories">
            <div className="flex items-center justify-center">
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" role="tablist">
                {categories.map(category => (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name.toLowerCase())}
                    className={`flex items-center gap-3 px-6 py-3 mt-1 rounded-3xl font-semibold transition-all duration-500 whitespace-nowrap text-base group ${
                      selectedCategory === category.name.toLowerCase() || (selectedCategory === 'all' && category.name === 'All')
                        ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow-xl scale-105 ring-2 ring-blue-200'
                        : 'bg-white/80 text-gray-700 hover:bg-white shadow-lg hover:scale-105 hover:shadow-xl'
                    }`}
                    role="tab"
                    aria-selected={selectedCategory === category.name.toLowerCase() || (selectedCategory === 'all' && category.name === 'All')}
                  >
                    <span className="text-xl hover:animate-pulse" aria-hidden="true">{category.icon}</span>
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </nav>

          {/* Design Elements Above Cards */}
          <div className="relative">
            <div className="flex items-center justify-center py-2" aria-hidden="true">
              <div className="flex items-center gap-4">
                <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                <div className="p-3 bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg">
                  <LayoutGrid className="w-6 h-6 text-purple-600" />
                </div>
                <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Gallery Section */}
          <section aria-label="Wallpaper gallery">
            {error ? (
              <div className="text-center py-20" role="alert">
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-12 shadow-2xl max-w-md mx-auto border border-gray-100 animate-slideUp">
                  <div className="text-8xl mb-6" aria-hidden="true">😕</div>
                  <p className="text-red-600 mb-8 text-xl font-semibold">{error}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-xl font-semibold text-lg hover-lift"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : loading ? (
              <LoadingSkeleton />
            ) : filteredWallpapers.length === 0 ? (
              <div className="text-center py-24">
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-16 max-w-lg mx-auto shadow-2xl border border-gray-100 animate-scaleIn">
                  <div className="text-8xl mb-6" aria-hidden="true">🔍</div>
                  <p className="text-gray-700 text-2xl font-bold mb-3">No wallpapers found</p>
                  <p className="text-gray-500 text-lg mb-8">Try adjusting your search or category</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-xl font-semibold text-lg hover-lift"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-3 gap-3 space-y-3 mx-auto px-4 w-full">
                  {filteredWallpapers.map((wallpaper, index) =>
                    !wallpaper.isPrivate && (
                      <WallpaperCard
                        key={wallpaper._id}
                        wallpaper={wallpaper}
                        index={index}
                        onUnauthorizedAction={handleUnauthorizedAction}
                      />
                    )
                  )}
                </div>
                
                {/* Loading More Indicator */}
                {loadingMore && (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-4 glass rounded-2xl px-8 py-4 shadow-xl border border-gray-200 animate-slideUp">
                      <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" aria-hidden="true"></div>
                      <span className="text-gray-700 font-medium text-lg">Loading more wallpapers<span className="loading-dots"></span></span>
                    </div>
                  </div>
                )}
                
                {/* Infinite Scroll Trigger */}
                {hasMore && !loadingMore && (
                  <div ref={observerRef} className="h-10" aria-hidden="true"></div>
                )}
                
                {/* End of Results */}
                {!hasMore && filteredWallpapers.length > 0 && (
                  <div className="text-center py-12">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 backdrop-blur-xl rounded-3xl p-8 max-w-md mx-auto border border-gray-200 shadow-lg animate-fadeIn">
                      <div className="text-6xl mb-4 animate-bounce" aria-hidden="true">🎉</div>
                      <p className="text-gray-700 text-xl font-semibold">You've seen it all!</p>
                      <p className="text-gray-500 text-lg">That's all the wallpapers for now</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      {/* Enhanced Login Popup */}
      <LoginPopup 
        isVisible={showLoginPopup} 
        onClose={() => setShowLoginPopup(false)} 
        actionType={loginActionType}
      />
    </div>
  );
};

export default WallpaperGallery;