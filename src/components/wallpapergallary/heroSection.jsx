'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Search, Sparkles, TrendingUp, Zap, Star, ArrowDown } from 'lucide-react';
import { SearchSuggestions } from './searchSuggestion';

const HeroSection = ({ 
  searchTerm, 
  onSearchChange, 
  suggestions = [], 
  onSuggestionClick,
  wallpapers = [],
  onSearchSubmit
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [generatedSuggestions, setGeneratedSuggestions] = useState([]);
  const [bestMatchPreview, setBestMatchPreview] = useState(null);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Generate suggestions and find best match for preview
  useEffect(() => {
    if (searchTerm.length > 0 && wallpapers.length > 0) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const allSuggestions = [];
      const added = new Set();

      const addSuggestion = (s, score) => {
        const key = `${s.type}-${s.value.toLowerCase()}`;
        if (!added.has(key)) {
          allSuggestions.push({ ...s, score });
          added.add(key);
        }
      };

      // Category icons
      const categoryIcons = {
        'Nature': '🌿',
        'Abstract': '🎨',
        'Anime': '🎨',
        'Superheroes': '🎨',
        'Minimalist': '⚪',
        'Animals': '🐾',
        'Cityscape': '🏙️',
        'Space': '🚀',
        'Technology': '💻',
        'Fantasy': '🪄',
        'Textures & Patterns': '🔳',
        'Food & Drinks': '🍔',
        'People': '🧑',
        'Architecture': '🏛️',
        'Cars & Vehicles': '🚗',
        'Art & Illustration': '🖌️',
        '3D Renders': '🖥️',
        'Typography': '🔠',
        'Dark': '🌙',
        'Light': '☀️',
        'Cartoon': '☀️',
        'Vintage': '📻',
        'Sports': '🏅',
        'Other': '📦'
      };

      // Title suggestions with wallpaper preview
      wallpapers.forEach(wp => {
        if (wp.title?.toLowerCase().includes(lowerSearchTerm)) {
          const score = wp.title.toLowerCase().startsWith(lowerSearchTerm) ? 90 : 70;
          addSuggestion({ 
            type: 'title', 
            value: wp.title, 
            icon: wp.compressedUrl || wp.imageUrl,
            wallpaper: wp 
          }, score);
        }
      });
      
      // Tag suggestions with wallpaper preview
      const tagMap = new Map();
      wallpapers.forEach(wp => {
        if (wp.tags) {
          wp.tags.forEach(tag => {
            if (tag.toLowerCase().includes(lowerSearchTerm) && !tagMap.has(tag.toLowerCase())) {
              tagMap.set(tag.toLowerCase(), { tag, wallpaper: wp });
            }
          });
        }
      });
      
      tagMap.forEach(({ tag, wallpaper }) => {
        const score = tag.toLowerCase().startsWith(lowerSearchTerm) ? 80 : 60;
        addSuggestion({ 
          type: 'tag', 
          value: tag, 
          icon: wallpaper.compressedUrl || wallpaper.imageUrl,
          wallpaper: wallpaper 
        }, score);
      });

      // Enhanced category matching
      const categories = Object.keys(categoryIcons);
      const categorySynonyms = {
        "car": "Cars & Vehicles",
        "cars": "Cars & Vehicles",
        "vehicle": "Cars & Vehicles",
        "vehicles": "Cars & Vehicles",
        "auto": "Cars & Vehicles",
        "city": "Cityscape",
        "urban": "Cityscape",
        "space": "Space",
        "galaxy": "Space",
        "stars": "Space",
        "animal": "Animals",
        "animals": "Animals",
        "pet": "Animals",
        "pets": "Animals",
        "nature": "Nature",
        "forest": "Nature",
        "mountain": "Nature",
        "tech": "Technology",
        "computer": "Technology",
        "minimal": "Minimalist",
        "simple": "Minimalist",
        "art": "Art & Illustration",
        "drawing": "Art & Illustration",
        "3d": "3D Renders",
        "render": "3D Renders"
      };

      // Category matching with fuzzy search
      categories.forEach(category => {
        const lowerCategory = category.toLowerCase();
        const categoryWords = lowerCategory.split(/[\s&]+/);
        
        let score = 0;
        if (lowerCategory === lowerSearchTerm) {
          score = 95;
        } else if (categoryWords.some(word => word === lowerSearchTerm)) {
          score = 85;
        } else if (lowerCategory.includes(lowerSearchTerm)) {
          score = 75;
        } else if (categoryWords.some(word => word.includes(lowerSearchTerm))) {
          score = 65;
        }
        
        if (score > 0) {
          addSuggestion({ 
            type: 'category', 
            value: category, 
            icon: categoryIcons[category] 
          }, score);
        }
      });

      // Synonym matches
      Object.entries(categorySynonyms).forEach(([synonym, category]) => {
        if (synonym.includes(lowerSearchTerm) || lowerSearchTerm.includes(synonym)) {
          addSuggestion({ 
            type: 'category', 
            value: category, 
            icon: categoryIcons[category] 
          }, 70);
        }
      });
      
      const sortedSuggestions = allSuggestions
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);
      
      setGeneratedSuggestions(sortedSuggestions);
      
      // Set best match for preview (highest scoring suggestion with wallpaper)
      const bestMatch = sortedSuggestions.find(s => s.wallpaper);
      setBestMatchPreview(bestMatch);
      
      setShowSuggestions(sortedSuggestions.length > 0);
    } else {
      setGeneratedSuggestions([]);
      setBestMatchPreview(null);
      setShowSuggestions(false);
    }
  }, [searchTerm, wallpapers]);

  // Handle suggestion click - MOVED BEFORE handleKeyDown
  const handleSuggestionClick = useCallback((suggestion) => {
    onSuggestionClick?.(suggestion);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    
    // Smooth scroll to content area
    setTimeout(() => {
      const contentArea = document.querySelector('main');
      if (contentArea) {
        contentArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }, [onSuggestionClick]);

  // Handle search submit - MOVED BEFORE handleKeyDown
  const handleSearchSubmit = useCallback(() => {
    if (searchTerm.trim()) {
      // Hide mobile keyboard
      if (searchRef.current && searchRef.current.blur) {
        searchRef.current.blur();
      }
      
      onSearchSubmit?.(searchTerm.trim());
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
      
      // Smooth scroll to content area
      const contentArea = document.querySelector('main');
      if (contentArea) {
        contentArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [searchTerm, onSearchSubmit]);

  // Handle keyboard navigation - NOW AFTER the functions it uses
  const handleKeyDown = useCallback((e) => {
    const currentSuggestions = suggestions.length > 0 ? suggestions : generatedSuggestions;
    
    switch(e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (showSuggestions && currentSuggestions.length > 0) {
          setSelectedSuggestionIndex(prev => 
            prev < currentSuggestions.length - 1 ? prev + 1 : 0
          );
        }
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        if (showSuggestions && currentSuggestions.length > 0) {
          setSelectedSuggestionIndex(prev => 
            prev > 0 ? prev - 1 : currentSuggestions.length - 1
          );
        }
        break;
        
      case 'Enter':
        e.preventDefault();
        
        // Hide mobile keyboard on Enter
        if (searchRef.current && searchRef.current.blur) {
          searchRef.current.blur();
        }
        
        // If there are suggestions and one is selected
        if (showSuggestions && currentSuggestions.length > 0 && selectedSuggestionIndex >= 0) {
          const selectedSuggestion = currentSuggestions[selectedSuggestionIndex];
          handleSuggestionClick(selectedSuggestion);
          return;
        }
        
        // If there are suggestions but none selected, check for exact matches
        if (showSuggestions && currentSuggestions.length > 0 && selectedSuggestionIndex === -1) {
          const exactMatch = currentSuggestions.find(s => 
            s.value.toLowerCase() === searchTerm.toLowerCase()
          );
          
          if (exactMatch) {
            handleSuggestionClick(exactMatch);
            return;
          }
        }
        
        // Default: perform search
        handleSearchSubmit();
        break;
        
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        if (searchRef.current) {
          searchRef.current.blur();
        }
        break;
    }
  }, [showSuggestions, generatedSuggestions, suggestions, selectedSuggestionIndex, searchTerm, handleSearchSubmit, handleSuggestionClick]);

  // Handle search input blur with delay for suggestion clicks
  const handleSearchBlur = useCallback((e) => {
    // Don't close if clicking on suggestions
    if (suggestionsRef.current && suggestionsRef.current.contains(e.relatedTarget)) {
      return;
    }
    
    // Longer delay to ensure click events fire before blur
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }, 200);
  }, []);

  const handleSearchFocus = useCallback(() => {
    if (searchTerm.length > 0 && generatedSuggestions.length > 0) {
      setShowSuggestions(true);
      setSelectedSuggestionIndex(-1);
    }
  }, [searchTerm, generatedSuggestions]);

  const handleMouseEnterSuggestion = useCallback((index) => {
    setSelectedSuggestionIndex(index);
  }, []);

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target) &&
          suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-[url('/heroGradient.png')] bg-cover bg-center bg-no-repeat min-h-[30vh] sm:min-h-[45vh] md:min-h-[50vh] lg:min-h-[45vh] relative overflow-visible -mt-14 sm:-mt-16 lg:-mt-20 pt-14 sm:pt-16 lg:pt-10">
      <div className="relative max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 pt-8 sm:pt-12 md:pt-16 pb-4 sm:pb-6 md:pb-8">
        {/* Title with Enhanced Animation */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
            <h1 className="text-[8vw] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black bg-gradient-to-b from-white via-white to-white bg-clip-text text-transparent drop-shadow-2xl leading-tight">
              Design Your Display
            </h1>
          </div>
          
          {/* Enhanced Search with Preview and Search Button */}
          <div className="relative max-w-[80vw] sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto mb-6 sm:mb-8 px-4 sm:px-0">
            <div className="relative group">
              <label htmlFor="wallpaper-search" className="sr-only">Search wallpapers</label>
              
              {/* Best Match Preview */}
              {bestMatchPreview && bestMatchPreview.wallpaper && (
                <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden border-2 border-white/30 shadow-lg z-10">
                  <img 
                    src={bestMatchPreview.icon} 
                    alt={bestMatchPreview.value}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <input
                ref={searchRef}
                id="wallpaper-search"
                type="search"
                inputMode="search" 
                placeholder="Search wallpapers, categories, tags..."
                className={`w-full ${bestMatchPreview?.wallpaper ? 'pl-14 sm:pl-16' : 'pl-4 sm:pl-6'} pr-14 sm:pr-16 py-2 sm:py-4 md:py-3 bg-white/95 backdrop-blur-xl border-2 border-white/20 rounded-2xl sm:rounded-3xl text-gray-700 placeholder-gray-500 focus:bg-white focus:ring-4 focus:ring-blue-100/50 transition-all duration-500 text-sm sm:text-base md:text-lg focus:outline-none shadow-2xl hover:shadow-3xl group-focus-within:scale-[1.02] relative`}
                value={searchTerm}
                onChange={(e) => onSearchChange?.(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                autoComplete="off"
                role="combobox"
                aria-expanded={showSuggestions}
                aria-autocomplete="list"
                aria-activedescendant={selectedSuggestionIndex >= 0 ? `suggestion-${selectedSuggestionIndex}` : undefined}
              />
              
              {/* Search Button */}
              <button
                type="button"
                className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2  text-gray-700 p-2 sm:p-2.5 rounded-xl sm:rounded-xl   hover:scale-105 z-10"
                aria-label="Search wallpapers"
                onClick={handleSearchSubmit}
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            
            {/* Enhanced Search Suggestions with Keyboard Navigation */}
            <div 
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-2 z-[60]"
            >
              <SearchSuggestions
                showSuggestions={showSuggestions}
                suggestions={suggestions.length > 0 ? suggestions : generatedSuggestions}
                searchTerm={searchTerm}
                wallpapers={wallpapers}
                onSuggestionClick={handleSuggestionClick}
                selectedIndex={selectedSuggestionIndex}
                onMouseEnter={handleMouseEnterSuggestion}
              />
            </div>
          </div>
          
          <div className="relative">
            <p className="text-base max-w-[70vw] sm:text-lg md:text-xl lg:text-2xl text-white/90 sm:max-w-md md:max-w-2xl lg:max-w-3xl mx-auto font-light leading-relaxed px-4">
              Discover stunning wallpapers from our complete collection
            </p>
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