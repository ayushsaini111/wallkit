'use client';
import { useMemo } from 'react';

export const SearchSuggestions = ({ 
  showSuggestions, 
  suggestions = [], 
  searchTerm, 
  wallpapers = [], 
  onSuggestionClick,
  selectedIndex = -1,
  onMouseEnter,
  onKeyboardSelect 
}) => {
  // Category icons mapping
  const categoryIcons = {
    'Nature': '🌿',
    'Abstract': '🎨',
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
    'Vintage': '📻',
    'Sports': '🏅',
    'Other': '📦'
  };

  const generatedSuggestions = useMemo(() => {
    if (!searchTerm || searchTerm.length === 0) return [];

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

    // Title matches with wallpaper preview
    wallpapers.forEach(wp => {
      if (wp.title) {
        const lowerTitle = wp.title.toLowerCase();
        if (lowerTitle === lowerSearchTerm) {
          addSuggestion({ 
            type: 'title', 
            value: wp.title, 
            icon: wp.imageUrl,
            wallpaper: wp 
          }, 100);
        } else if (lowerTitle.startsWith(lowerSearchTerm)) {
          addSuggestion({ 
            type: 'title', 
            value: wp.title, 
            icon: wp.imageUrl,
            wallpaper: wp 
          }, 90);
        } else if (lowerTitle.includes(lowerSearchTerm)) {
          addSuggestion({ 
            type: 'title', 
            value: wp.title, 
            icon: wp.imageUrl,
            wallpaper: wp 
          }, 70);
        }
      }
    });

    // Tag matches with wallpaper preview
    const tagMap = new Map();
    wallpapers.forEach(wp => {
      wp.tags?.forEach(tag => {
        const lowerTag = tag.toLowerCase();
        if (lowerTag.includes(lowerSearchTerm)) {
          if (!tagMap.has(tag)) {
            tagMap.set(tag, wp); // Store first wallpaper with this tag
          }
        }
      });
    });

    tagMap.forEach((wp, tag) => {
      const lowerTag = tag.toLowerCase();
      if (lowerTag === lowerSearchTerm) {
        addSuggestion({ 
          type: 'tag', 
          value: tag, 
          icon: wp.imageUrl,
          wallpaper: wp 
        }, 80);
      } else if (lowerTag.includes(lowerSearchTerm)) {
        addSuggestion({ 
          type: 'tag', 
          value: tag, 
          icon: wp.imageUrl,
          wallpaper: wp 
        }, 60);
      }
    });

    // Enhanced category matching with fuzzy search
    const categories = Object.keys(categoryIcons);
    const categorySynonyms = {
      "car": "Cars & Vehicles",
      "cars": "Cars & Vehicles",
      "vehicle": "Cars & Vehicles",
      "vehicles": "Cars & Vehicles",
      "auto": "Cars & Vehicles",
      "automobile": "Cars & Vehicles",
      "architecture": "Architecture",
      "building": "Architecture",
      "buildings": "Architecture",
      "construction": "Architecture",
      "city": "Cityscape",
      "urban": "Cityscape",
      "skyline": "Cityscape",
      "downtown": "Cityscape",
      "space": "Space",
      "galaxy": "Space",
      "stars": "Space",
      "universe": "Space",
      "cosmos": "Space",
      "planet": "Space",
      "animal": "Animals",
      "animals": "Animals",
      "pet": "Animals",
      "pets": "Animals",
      "dog": "Animals",
      "dogs": "Animals",
      "cat": "Animals",
      "cats": "Animals",
      "wildlife": "Animals",
      "nature": "Nature",
      "forest": "Nature",
      "tree": "Nature",
      "trees": "Nature",
      "mountain": "Nature",
      "mountains": "Nature",
      "beach": "Nature",
      "ocean": "Nature",
      "landscape": "Nature",
      "flower": "Nature",
      "flowers": "Nature",
      "minimal": "Minimalist",
      "simple": "Minimalist",
      "clean": "Minimalist",
      "tech": "Technology",
      "computer": "Technology",
      "digital": "Technology",
      "person": "People",
      "human": "People",
      "portrait": "People",
      "food": "Food & Drinks",
      "drink": "Food & Drinks",
      "beverage": "Food & Drinks",
      "meal": "Food & Drinks",
      "art": "Art & Illustration",
      "drawing": "Art & Illustration",
      "painting": "Art & Illustration",
      "illustration": "Art & Illustration",
      "3d": "3D Renders",
      "render": "3D Renders",
      "type": "Typography",
      "text": "Typography",
      "font": "Typography",
      "letter": "Typography",
      "pattern": "Textures & Patterns",
      "texture": "Textures & Patterns",
      "sport": "Sports",
      "game": "Sports",
      "fitness": "Sports",
      "old": "Vintage",
      "retro": "Vintage",
      "classic": "Vintage"
    };

    // Direct category matches
    categories.forEach(category => {
      const lowerCategory = category.toLowerCase();
      const categoryWords = lowerCategory.split(/[\s&]+/);
      
      // Exact match
      if (lowerCategory === lowerSearchTerm) {
        addSuggestion({ 
          type: 'category', 
          value: category, 
          icon: categoryIcons[category] 
        }, 95);
      }
      // Partial match in category name
      else if (lowerCategory.includes(lowerSearchTerm) || 
               categoryWords.some(word => word.includes(lowerSearchTerm))) {
        addSuggestion({ 
          type: 'category', 
          value: category, 
          icon: categoryIcons[category] 
        }, 85);
      }
      // Word boundary match (e.g., "car" matches "Cars & Vehicles")
      else if (categoryWords.some(word => word.startsWith(lowerSearchTerm))) {
        addSuggestion({ 
          type: 'category', 
          value: category, 
          icon: categoryIcons[category] 
        }, 75);
      }
    });

    // Synonym matches
    Object.entries(categorySynonyms).forEach(([synonym, category]) => {
      const lowerSynonym = synonym.toLowerCase();
      if (lowerSynonym === lowerSearchTerm || 
          lowerSynonym.includes(lowerSearchTerm) || 
          lowerSearchTerm.includes(lowerSynonym)) {
        addSuggestion({ 
          type: 'category', 
          value: category, 
          icon: categoryIcons[category] 
        }, 70);
      }
    });

    // Popular search terms
    const popularTerms = [
      '4k wallpapers', 'hd wallpapers', 'dark themes', 'light themes', 
      'mobile wallpapers', 'desktop wallpapers', 'landscape', 'portrait'
    ];
    popularTerms.forEach(term => {
      const lowerTerm = term.toLowerCase();
      if (lowerTerm.includes(lowerSearchTerm) || lowerSearchTerm.includes(lowerTerm.split(' ')[0])) {
        addSuggestion({ 
          type: 'popular', 
          value: term, 
          icon: '🔥' 
        }, 30);
      }
    });

    // Sort by score and limit results
    return allSuggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [searchTerm, wallpapers]);

  const displaySuggestions = suggestions.length > 0 ? suggestions : generatedSuggestions;

  if (!showSuggestions || displaySuggestions.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-2xl rounded-3xl border-2 border-white/30 shadow-2xl z-[9999] overflow-hidden animate-fadeIn">
      {displaySuggestions.map((suggestion, index) => (
        <button
          key={`${suggestion.type}-${suggestion.value}-${index}`}
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onMouseEnter={() => onMouseEnter?.(index)}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSuggestionClick?.(suggestion);
          }}
          className={`w-full px-6 py-2 lg:py-4 text-left rounded-2xl transition-all duration-300 flex items-center gap-4 text-gray-700 mb-2 last:mb-0 group cursor-pointer ${
            selectedIndex === index 
              ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-gray-900 scale-[1.02]' 
              : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-gray-900'
          }`}
        >
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden flex-shrink-0">
            {suggestion.type === 'title' || suggestion.type === 'tag' ? (
              <img 
                src={suggestion.icon} 
                alt={suggestion.value} 
                className="w-12 h-12 object-cover rounded-2xl"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            {(suggestion.type === 'title' || suggestion.type === 'tag') && (
              <span className="text-lg hidden items-center justify-center w-12 h-12">
                {suggestion.type === 'title' ? '🖼️' : '🏷️'}
              </span>
            )}
            {suggestion.type !== 'title' && suggestion.type !== 'tag' && (
              <span className="text-lg">{suggestion.icon}</span>
            )}
          </div>
          
          <div className="flex-1  min-w-45 lg:min-w-0">
            <div className=" text-sm truncate">{suggestion.value}</div>
            {/* <div className="text-sm text-gray-500 capitalize flex items-center gap-1">
              {suggestion.type === 'category' && (
                <span className="inline-flex items-center gap-1">
                  📂 Category
                </span>
              )}
              {suggestion.type === 'tag' && (
                <span className="inline-flex items-center gap-1">
                  🏷️ Tag
                </span>
              )}
              {suggestion.type === 'title' && (
                <span className="inline-flex items-center gap-1">
                  🖼️ Wallpaper
                </span>
              )}
              {suggestion.type === 'popular' && (
                <span className="inline-flex items-center gap-1">
                  🔥 Popular
                </span>
              )}
            </div> */}
          </div>
          
          <div className={`transition-opacity ${
            selectedIndex === index ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold">→</span>
            </div>
          </div>
        </button>
      ))}
      
      <div className="px-6 py-2 text-xs text-gray-400 bg-gray-50/50 border-t border-gray-200/50">
        Use ↑↓ to navigate, Enter to select
      </div>
    </div>
  );
};