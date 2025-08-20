'use client';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Sparkles } from 'lucide-react';

// Import separated components
import HeroSection from '@/components/wallpapergallary/heroSection';
import EnhancedStyles from '@/components/wallpapergallary/enhancedstyle';
import { WallpaperCard } from '@/components/wallpaperCard/WallpaperCard';
import { LoginPopup } from '../loginpopup';

const WallpaperGallery = ({ initialCategory = 'all' }) => {
  // State management
  const [wallpapers, setWallpapers] = useState([]);
  const [allWallpapers, setAllWallpapers] = useState([]); // Store all wallpapers for global search
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [suggestions, setSuggestions] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [loginActionType, setLoginActionType] = useState('general');
  const [isSearchMode, setIsSearchMode] = useState(false); // Track if we're in search mode
  const [searchResults, setSearchResults] = useState([]); // Store search results
  const [allWallpapersLoaded, setAllWallpapersLoaded] = useState(false);
  
  const skeletonHeights = [240, 280, 320, 260, 300, 350, 270, 310, 290, 330, 250, 370];

  // Refs
  const observerRef = useRef(null);
  const searchTimeoutRef = useRef(null);

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

  // Update selected category when initialCategory changes
  useEffect(() => {
    if (initialCategory !== selectedCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  // Simple Levenshtein distance function for fuzzy matching
  const levenshteinDistance = (str1, str2) => {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  };

  // Client-side search with enhanced matching
  const performClientSideSearch = useCallback((query) => {
    const lowerQuery = query.toLowerCase().trim();
    const searchWords = lowerQuery.split(/\s+/);
    
    const results = allWallpapers.filter(wallpaper => {
      if (wallpaper.isPrivate) return false;

      // Calculate relevance score
      let score = 0;
      const title = wallpaper.title?.toLowerCase() || '';
      const category = wallpaper.category?.toLowerCase() || '';
      const tags = wallpaper.tags?.map(tag => tag.toLowerCase()) || [];
      const description = wallpaper.description?.toLowerCase() || '';

      // Exact matches get highest score
      if (title === lowerQuery) score += 100;
      if (category === lowerQuery) score += 90;
      if (tags.includes(lowerQuery)) score += 85;

      // Partial matches
      if (title.includes(lowerQuery)) score += 80;
      if (category.includes(lowerQuery)) score += 70;
      if (description.includes(lowerQuery)) score += 60;

      // Tag partial matches
      tags.forEach(tag => {
        if (tag.includes(lowerQuery)) score += 50;
      });

      // Word-by-word matching
      searchWords.forEach(word => {
        if (title.includes(word)) score += 30;
        if (category.includes(word)) score += 25;
        if (tags.some(tag => tag.includes(word))) score += 20;
        if (description.includes(word)) score += 15;
      });

      // Fuzzy matching for typos (simplified)
      const fuzzyMatch = (str, target) => {
        const distance = levenshteinDistance(str, target);
        return distance <= Math.max(1, Math.floor(target.length * 0.2));
      };

      // Check for fuzzy matches
      if (fuzzyMatch(lowerQuery, title)) score += 40;
      if (fuzzyMatch(lowerQuery, category)) score += 35;
      tags.forEach(tag => {
        if (fuzzyMatch(lowerQuery, tag)) score += 30;
      });

      wallpaper._searchScore = score;
      return score > 0;
    });

    // Sort by relevance score
    const sortedResults = results
      .sort((a, b) => (b._searchScore || 0) - (a._searchScore || 0))
      .slice(0, 100); // Limit results

    setSearchResults(sortedResults);
  }, [allWallpapers]);

  // Enhanced search function with fuzzy matching
  const performGlobalSearch = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      setIsSearchMode(false);
      return;
    }

    setIsSearchMode(true);

    try {
      // First try API search
      const response = await fetch(`/api/wallpapers/search?q=${encodeURIComponent(query)}&limit=50`);
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.wallpapers || []);
      } else {
        // Fallback to client-side search if API fails
        performClientSideSearch(query);
      }
    } catch (error) {
      console.error('Search API failed, falling back to client-side search:', error);
      performClientSideSearch(query);
    }
  }, [performClientSideSearch]);

  // Load all wallpapers for search functionality - Run once on mount
  useEffect(() => {
    const loadAllWallpapers = async () => {
      if (allWallpapersLoaded) return; // Prevent multiple loads
      
      try {
        console.log('Loading all wallpapers for global search...');
        // Try multiple endpoints to get all wallpapers
        const endpoints = [
          // Primary endpoint for all wallpapers
          '/api/wallpapers?limit=1000', // Fallback with high limit
          '/api/search/all' // Alternative search endpoint
        ];
        
        let allWallpapersData = [];
        
        for (const endpoint of endpoints) {
          try {
            const response = await fetch(endpoint);
            if (response.ok) {
              const data = await response.json();
              allWallpapersData = data.wallpapers || data.results || data || [];
              console.log(`Loaded ${allWallpapersData.length} wallpapers from ${endpoint}`);
              break; // Success, exit loop
            }
          } catch (err) {
            console.log(`Failed to fetch from ${endpoint}:`, err);
            continue; // Try next endpoint
          }
        }
        
        // If API endpoints fail, we'll use category-based loading
        if (allWallpapersData.length === 0) {
          console.log('API endpoints failed, loading wallpapers by categories...');
          const categoryPromises = categories.slice(1).map(async (category) => { // Skip 'All'
            try {
              const response = await fetch(`/api/wallpapers/category?name=${category.name.toLowerCase()}&limit=100`);
              if (response.ok) {
                const data = await response.json();
                return data.wallpapers || [];
              }
            } catch (err) {
              console.error(`Failed to load ${category.name} wallpapers:`, err);
            }
            return [];
          });
          
          const categoryResults = await Promise.allSettled(categoryPromises);
          allWallpapersData = categoryResults
            .filter(result => result.status === 'fulfilled')
            .flatMap(result => result.value)
            .filter((wallpaper, index, self) => 
              // Remove duplicates based on _id
              index === self.findIndex(w => w._id === wallpaper._id)
            );
        }
        
        console.log(`Total wallpapers loaded for search: ${allWallpapersData.length}`);
        setAllWallpapers(allWallpapersData);
        setAllWallpapersLoaded(true);
      } catch (error) {
        console.error('Failed to load wallpapers for search:', error);
        // Don't set error state as search can still work with limited data
      }
    };

    loadAllWallpapers();
  }, [categories]); // Run once on mount

  // Handle unauthorized actions with action type
  const handleUnauthorizedAction = useCallback((actionType = 'general') => {
    console.log('Unauthorized action triggered:', actionType);
    setLoginActionType(actionType);
    setShowLoginPopup(true);
  }, []);

  // Enhanced search change handler with debouncing - Global search across all wallpapers
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If search term is empty, exit search mode
    if (!value.trim()) {
      setIsSearchMode(false);
      setSearchResults([]);
      return;
    }

    // Debounce search for better performance
    searchTimeoutRef.current = setTimeout(() => {
      if (value.trim().length >= 2) {
        performGlobalSearch(value.trim());
      } else if (value.trim().length === 0) {
        setIsSearchMode(false);
        setSearchResults([]);
      }
    }, 300);
  }, [performGlobalSearch]);

  // Handle search submission
  const handleSearchSubmit = useCallback((query) => {
    if (query && query.length >= 2) {
      performGlobalSearch(query);
    }
  }, [performGlobalSearch]);

  // Handle suggestion click - Routes to category URL for category suggestions
  const handleSuggestionClick = useCallback((suggestion) => {
    if (suggestion.type === 'category') {
      // Route to category URL
      const categoryName = suggestion.value.toLowerCase();
      window.location.href = `/?category=${categoryName}`;
    } else {
      // For title, tag, or other suggestions - perform global search
      setSearchTerm(suggestion.value);
      performGlobalSearch(suggestion.value);
    }
  }, [performGlobalSearch]);

  // Handle category selection
  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category.toLowerCase());
    setSearchTerm(''); // Clear search when category changes
    setIsSearchMode(false); // Exit search mode
    setSearchResults([]);
  }, []);

  // Load more wallpapers function
  const loadMoreWallpapers = useCallback(async () => {
    if (loadingMore || !hasMore || isSearchMode) return;
    
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
  }, [loadingMore, hasMore, page, selectedCategory, isSearchMode]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading && !loadingMore && !isSearchMode) {
          loadMoreWallpapers();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, loadMoreWallpapers, isSearchMode]);

  // Initial fetch wallpapers with error handling - Reset when category changes
  useEffect(() => {
    const getWallpapers = async () => {
      if (isSearchMode) return; // Don't fetch when in search mode
      
      try {
        setLoading(true);
        setPage(1);
        setWallpapers([]);
        setHasMore(true);
        setError(null);
        
        const endpoint = selectedCategory === 'all' || selectedCategory === 'All'
          ? '/api/wallpapers'
          : `/api/wallpapers/category?name=${selectedCategory}`;
        
        console.log('Fetching from endpoint:', endpoint);
        const res = await fetch(endpoint);
        
        if (res.status === 401) {
          console.log('User not authenticated - some features may be limited');
        }
        
        const data = await res.json();
        const fetched = data.wallpapers || [];
        console.log("Fetched wallpapers for category:", selectedCategory, fetched.length);
        
        setWallpapers(fetched);
        setHasMore(fetched.length === 20);
      } catch (err) {
        console.error('Error loading wallpapers:', err);
        setError('Failed to load wallpapers. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    getWallpapers();
  }, [selectedCategory, isSearchMode]);

  // Filter wallpapers - Use search results when in search mode, otherwise use regular wallpapers
  const filteredWallpapers = useMemo(() => {
    if (isSearchMode) {
      return searchResults;
    }
    
    if (!searchTerm) return wallpapers;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return wallpapers.filter(wp =>
      wp.title?.toLowerCase().includes(lowerSearchTerm) ||
      wp.tags?.some(t => t.toLowerCase().includes(lowerSearchTerm)) ||
      wp.category?.toLowerCase()?.includes(lowerSearchTerm)
    );
  }, [wallpapers, searchResults, searchTerm, isSearchMode]);

  // Enhanced Loading Skeleton Component
  const LoadingSkeleton = () => (
    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-3 xl:columns-3 gap-3 space-y-3 mx-auto px-3 sm:px-4 w-full" aria-label="Loading wallpapers">
      {[...Array(12)].map((_, i) => (
        <div 
          key={i} 
          className="relative bg-gradient-to-br from-white/100 via-blue-50/50 to-purple-50/50 rounded-2xl sm:rounded-3xl border border-gray-100/50 shadow-lg break-inside-avoid mb-3 overflow-hidden backdrop-blur-sm"
          style={{ 
            height: `${skeletonHeights[i % skeletonHeights.length]}px`,
            animationDelay: `${i * 150}ms`
          }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          
          {/* Content skeleton */}
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
          
          {/* Floating sparkles */}
          <div className="absolute top-2 right-2">
            <Sparkles className="w-3 sm:w-4 h-3 sm:h-4 text-purple-300 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Enhanced Styles Component */}
      <EnhancedStyles />
      
      <HeroSection className=""
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        suggestions={suggestions}
        onSuggestionClick={handleSuggestionClick}
        wallpapers={allWallpapers.length > 0 ? allWallpapers : wallpapers} // Use all wallpapers for suggestions if available
      />
     
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 relative z-10">
        <div className="space-y-6 sm:space-y-8">
          {/* Categories Navigation */}
          <nav aria-label="Wallpaper categories">
            <div className="flex items-center justify-center">
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide max-w-full" role="tablist">
                {categories.map(category => (
                  <button
                    key={category.name}
                    onClick={() => handleCategorySelect(category.name)}
                    className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 mt-1 ml-1 rounded-2xl sm:rounded-3xl font-semibold transition-all duration-200 whitespace-nowrap text-sm sm:text-base group ${
                      selectedCategory === category.name.toLowerCase() || (selectedCategory === 'all' && category.name === 'All')
                        ? ' bg-orange-500  text-white scale-105 ring-2 ring-orange-200'
                        : 'bg-white/80 text-gray-700 hover:bg-white shadow-sm hover:scale-105 hover:shadow-lg'
                    }`}
                    role="tab"
                    aria-selected={selectedCategory === category.name.toLowerCase() || (selectedCategory === 'all' && category.name === 'All')}
                  >
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </nav>

          {/* Gallery Section */}
          <section aria-label="Wallpaper gallery">
            {error ? (
              <div className="text-center py-16 sm:py-20" role="alert">
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-8 sm:p-12 shadow-2xl max-w-sm sm:max-w-md mx-auto border border-gray-100 animate-slideUp">
                  <div className="text-6xl sm:text-8xl mb-4 sm:mb-6" aria-hidden="true">😕</div>
                  <p className="text-red-600 mb-6 sm:mb-8 text-lg sm:text-xl font-semibold">{error}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl sm:rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-xl font-semibold text-base sm:text-lg hover-lift"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : loading ? (
              <LoadingSkeleton />
            ) : filteredWallpapers.length === 0 ? (
              <div className="text-center py-20 sm:py-24">
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-12 sm:p-16 max-w-md sm:max-w-lg mx-auto shadow-2xl border border-gray-100 animate-scaleIn">
                  <div className="text-6xl sm:text-8xl mb-4 sm:mb-6" aria-hidden="true">🔍</div>
                  <p className="text-gray-700 text-xl sm:text-2xl font-bold mb-2 sm:mb-3">No wallpapers found</p>
                  <p className="text-gray-500 text-base sm:text-lg mb-6 sm:mb-8">Try adjusting your search or category</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                      setIsSearchMode(false);
                      setSearchResults([]);
                    }}
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl sm:rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-xl font-semibold text-base sm:text-lg hover-lift"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="columns-2 gap-2 space-y-2 sm:columns-2 md:columns-3 lg:columns-3 xl:columns-3 xl:gap-3 xl:space-y-3 mx-auto px-3 sm:px-4 w-full">
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
                
                {/* Loading More Indicator - Only show if not in search mode */}
                {!isSearchMode && loadingMore && (
                  <div className="flex items-center justify-center py-8 sm:py-12">
                    <div className="flex items-center gap-3 sm:gap-4 glass rounded-xl sm:rounded-2xl px-6 sm:px-8 py-3 sm:py-4 shadow-xl border border-gray-200 animate-slideUp">
                      <div className="w-5 sm:w-6 h-5 sm:h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" aria-hidden="true"></div>
                      <span className="text-gray-700 font-medium text-base sm:text-lg">Loading more wallpapers<span className="loading-dots"></span></span>
                    </div>
                  </div>
                )}
                
                {/* Infinite Scroll Trigger - Only if not in search mode */}
                {!isSearchMode && hasMore && !loadingMore && (
                  <div ref={observerRef} className="h-10" aria-hidden="true"></div>
                )}
                
                {/* End of Results */}
                {!isSearchMode && !hasMore && filteredWallpapers.length > 0 && (
                  <div className="text-center py-8 sm:py-12">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-sm sm:max-w-md mx-auto border border-gray-200 shadow-lg animate-fadeIn">
                      <div className="text-4xl sm:text-6xl mb-3 sm:mb-4 animate-bounce" aria-hidden="true">🎉</div>
                      <p className="text-gray-700 text-lg sm:text-xl font-semibold">You've seen it all!</p>
                      <p className="text-gray-500 text-base sm:text-lg">That's all the wallpapers for now</p>
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

export { WallpaperGallery };