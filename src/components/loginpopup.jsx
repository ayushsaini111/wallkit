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
    description: 'Express your appreciation by liking wallpapers. Login to personalize your favorites collection.',
    buttonText: 'Login & Like'
  },
  follow: {
    icon: '👥',
    title: 'Login to Follow',
    description: 'Stay updated with your favorite creators. Login to follow and receive their latest uploads.',
    buttonText: 'Login & Follow'
  },
  save: {
    icon: '📌',
    title: 'Login to Save',
    description: 'Organize wallpapers you love into your personal collection. Sign in to save and access anytime.',
    buttonText: 'Login & Save'
  },
  general: {
    icon: '🔐',
    title: 'Login Required',
    description: 'Login to like, follow, save, and download wallpapers. Access a more personalized experience.',
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
      
        </div>
      </div>
    </aside>
  );
};