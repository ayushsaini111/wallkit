'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Search, Sparkles, TrendingUp, Zap, Star, ArrowDown } from 'lucide-react';
import { SearchSuggestions } from './searchSuggestion';

const HeroSection = ({ 
  searchTerm, 
  onSearchChange, 
  suggestions = [], 
  onSuggestionClick,
  wallpapers = [] 
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  // Generate suggestions based on wallpapers
  useEffect(() => {
    if (searchTerm.length > 0 && wallpapers.length > 0) {
      const allSuggestions = [];
      const lowerSearchTerm = searchTerm.toLowerCase();
      
      // Title suggestions
      wallpapers.forEach(wp => {
        if (wp.title?.toLowerCase().includes(lowerSearchTerm)) {
          allSuggestions.push({ type: 'title', value: wp.title, icon: '🖼️' });
        }
      });
      
      // Tag suggestions
      const uniqueTags = new Set();
      wallpapers.forEach(wp => {
        if (wp.tags) {
          wp.tags.forEach(tag => {
            if (tag.toLowerCase().includes(lowerSearchTerm) && !uniqueTags.has(tag.toLowerCase())) {
              uniqueTags.add(tag.toLowerCase());
              allSuggestions.push({ type: 'tag', value: tag, icon: '🏷️' });
            }
          });
        }
      });
      
      const limitedSuggestions = allSuggestions.slice(0, 6);
      setShowSuggestions(limitedSuggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [searchTerm, wallpapers]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion) => {
    onSuggestionClick?.(suggestion);
    setShowSuggestions(false);
    if (searchRef.current) {
      searchRef.current.focus();
    }
  }, [onSuggestionClick]);

  // Handle search input blur with delay for suggestion clicks
  const handleSearchBlur = useCallback(() => {
    setTimeout(() => setShowSuggestions(false), 150);
  }, []);

  const handleSearchFocus = useCallback(() => {
    if (searchTerm.length > 0) {
      setShowSuggestions(true);
    }
  }, [searchTerm]);

  return (
    <header className="bg-gradient-to-b from-black via-gray-600 to-black min-h-[40vh] sm:min-h-[45vh] md:min-h-[50vh] lg:h-[50vh] relative overflow-visible">
      {/* Animated Background Elements */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-64 sm:w-96 h-64 sm:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-56 sm:w-80 h-56 sm:h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative  max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 pt-8 sm:pt-12 md:pt-16 pb-4 sm:pb-6 md:pb-8">
        {/* Title with Enhanced Animation */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
            <div className="relative" aria-hidden="true">
              <Sparkles className="w-6 sm:w-8 md:w-10 h-6 sm:h-8 md:h-10 text-blue-400 animate-spin" />
              <div className="absolute inset-0 w-6 sm:w-8 md:w-10 h-6 sm:h-8 md:h-10 bg-blue-400/20 rounded-full blur-xl animate-pulse"></div>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent drop-shadow-2xl leading-tight">
              Design Your Display
            </h1>
            <div className="relative" aria-hidden="true">
              <Zap className="w-6 sm:w-8 md:w-10 h-6 sm:h-8 md:h-10 text-purple-400 animate-bounce" />
              <div className="absolute inset-0 w-6 sm:w-8 md:w-10 h-6 sm:h-8 md:h-10 bg-purple-400/20 rounded-full blur-xl animate-pulse"></div>
            </div>
          </div>
          
          {/* Enhanced Search with FIXED z-index */}
          <div className="relative max-w-sm z-50 sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto mb-6 sm:mb-8 px-4 sm:px-0" style={{ zIndex: 9999 }}>
            <div className="relative group">
              <label htmlFor="wallpaper-search" className="sr-only">Search wallpapers</label>
              <Search className="absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 sm:w-6 h-5 sm:h-6 group-focus-within:text-blue-500 transition-colors" aria-hidden="true" />
              <input
                ref={searchRef}
                id="wallpaper-search"
                type="search"
                placeholder="Search wallpapers, tags..."
                className="w-full pl-12 sm:pl-16 pr-6 sm:pr-8 py-3 sm:py-4 md:py-3 bg-white/95 backdrop-blur-xl border-2 border-white/20 rounded-2xl sm:rounded-3xl text-gray-700 placeholder-gray-500 focus:bg-white focus:border-blue-400/50 focus:ring-4 focus:ring-blue-100/50 transition-all duration-500 text-sm sm:text-base md:text-lg focus:outline-none shadow-2xl hover:shadow-3xl group-focus-within:scale-[1.02] relative"
                style={{ zIndex: 9999 }}
                value={searchTerm}
                onChange={(e) => onSearchChange?.(e.target.value)}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                autoComplete="off"
              />
            </div>
            
            {/* Search Suggestions Component with FIXED z-index */}
            <div className="absolute top-full left-0 right-0 mt-2" style={{ zIndex: 9999 }}>
              <SearchSuggestions
                showSuggestions={showSuggestions}
                suggestions={suggestions}
                searchTerm={searchTerm}
                wallpapers={wallpapers}
                onSuggestionClick={handleSuggestionClick}
              />
            </div>
          </div>
          
          <div className="relative">
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl mx-auto font-light leading-relaxed px-4">
              Discover stunning wallpapers in our wallkit gallery
            </p>
          </div>
        </div>

        {/* Stats with Enhanced Design */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-12 text-white/90">
          <div className="flex items-center gap-2 sm:gap-3 bg-white/10 backdrop-blur-xl px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-xl border border-white/20">
            <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5" aria-hidden="true" />
            <span className="font-semibold text-sm sm:text-base">10M+ Downloads</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 bg-white/10 backdrop-blur-xl px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-xl border border-white/20">
            <Star className="w-4 sm:w-5 h-4 sm:h-5" aria-hidden="true" />
            <span className="font-semibold text-sm sm:text-base">50K+ Creators</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-3 sm:bottom-6 left-1/2 transform -translate-x-1/2 animate-bounce" aria-hidden="true">
        <ArrowDown className="w-5 sm:w-6 h-5 sm:h-6 text-white/60" />
      </div>
    </header>
  );
};

export default HeroSection;