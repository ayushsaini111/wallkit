'use client';
import { useMemo } from 'react';

export const SearchSuggestions = ({ 
  showSuggestions, 
  suggestions = [], 
  searchTerm, 
  wallpapers = [], 
  onSuggestionClick 
}) => {
  // Generate suggestions based on search term and wallpapers
  const generatedSuggestions = useMemo(() => {
    if (!searchTerm || searchTerm.length === 0) return [];
    
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
    
    // Category suggestions
    const categories = ['Nature', 'Abstract', 'Minimalist', 'Animals', 'Cityscape', 'Space', 'Technology', 'Fantasy'];
    categories.forEach(category => {
      if (category.toLowerCase().includes(lowerSearchTerm)) {
        allSuggestions.push({ type: 'category', value: category, icon: '📂' });
      }
    });
    
    // Popular search terms
    const popularTerms = ['4k wallpapers', 'dark themes', 'mobile wallpapers', 'landscape', 'portrait'];
    popularTerms.forEach(term => {
      if (term.toLowerCase().includes(lowerSearchTerm)) {
        allSuggestions.push({ type: 'popular', value: term, icon: '🔥' });
      }
    });
    
    return allSuggestions.slice(0, 6);
  }, [searchTerm, wallpapers]);

  const displaySuggestions = suggestions.length > 0 ? suggestions : generatedSuggestions;

  if (!showSuggestions || displaySuggestions.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-4 bg-white/95 backdrop-blur-2xl rounded-3xl border-2 border-white/30 shadow-2xl z-[9999] overflow-hidden animate-fadeIn">
      <div className="">
        
        
        {displaySuggestions.map((suggestion, index) => (
          <button
            key={`${suggestion.type}-${suggestion.value}-${index}`}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSuggestionClick?.(suggestion);
            }}
            className="w-full px-6 py-4 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-2xl transition-all duration-300 flex items-center gap-4 text-gray-700 hover:text-gray-900 mb-2 last:mb-0 group cursor-pointer"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-lg" aria-hidden="true">{suggestion.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-lg truncate">{suggestion.value}</div>
              <div className="text-sm text-gray-500 capitalize">{suggestion.type}</div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">→</span>
              </div>
            </div>
          </button>
        ))}
        
      
      </div>
    </div>
  );
};