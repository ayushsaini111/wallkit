"use client"

import { useEffect } from "react";
import { Search, Sparkles, LayoutGrid, TrendingUp, Zap, Star, ArrowDown, X } from 'lucide-react';

export const LoginPopup = ({ isVisible, onClose, actionType = 'general' }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const handleLogin = () => {
    // Redirect to login page
    window.location.href = '/auth/signin';
  };

  // Dynamic content based on action type
  const getPopupContent = (actionType) => {
    const contentMap = {
      like: {
        icon: '❤️',
        title: 'Login to Like',
        description: 'Show your love for amazing wallpapers! Login to like and build your personal collection of favorites.',
        buttonText: 'Login & Like'
      },
      follow: {
        icon: '👥',
        title: 'Login to Follow',
        description: 'Never miss amazing content! Login to follow your favorite creators and get notified of their latest uploads.',
        buttonText: 'Login & Follow'
      },
      save: {
        icon: '📌',
        title: 'Login to Save',
        description: 'Keep track of wallpapers you love! Login to save wallpapers to your personal collection for easy access.',
        buttonText: 'Login & Save'
      },
      download: {
        icon: '⬇️',
        title: 'Login to Download',
        description: 'Get high-quality wallpapers instantly! Login to download wallpapers in full resolution.',
        buttonText: 'Login & Download'
      },
      general: {
        icon: '🔐',
        title: 'Login Required',
        description: 'Please login to like, save, or follow wallpapers and creators.',
        buttonText: 'Login Now'
      }
    };
    return contentMap[actionType] || contentMap.general;
  };

  const content = getPopupContent(actionType);

  if (!isVisible) return null;

  return (
    <aside className="fixed bottom-6 right-6 z-50 animate-slideIn" role="alertdialog" aria-labelledby="login-title" aria-describedby="login-description">
      <div className="bg-white/95 backdrop-blur-xl  border-red-200 rounded-3xl shadow-2xl p-6 max-w-sm border-2">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl flex items-center justify-center">
            <span className="text-2xl" aria-hidden="true">{content.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 id="login-title" className="font-bold text-gray-900 mb-2 text-lg">{content.title}</h4>
            <p id="login-description" className="text-gray-600 text-sm mb-4 leading-relaxed">
              {content.description}
            </p>
            <div className="flex gap-2">
              <button 
                onClick={handleLogin}
                className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-xl text-sm font-semibold hover:from-orange-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {content.buttonText}
              </button>
              <button 
                onClick={onClose}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all duration-300"
              >
                Later
              </button>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close login popup"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </aside>
  );
};