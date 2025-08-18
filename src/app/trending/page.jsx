'use client';

import { useEffect, useState,useCallback } from 'react';
import { TrendingUp, Sparkles } from 'lucide-react';
import { WallpaperCard } from '@/components/wallpaperCard/WallpaperCard'; // Import the unified WallpaperCard component
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
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
   const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [loginActionType, setLoginActionType] = useState('general');
  const handleUnauthorizedAction = useCallback((actionType = 'general') => {
      console.log('Unauthorized action triggered:', actionType);
      setLoginActionType(actionType);
      setShowLoginPopup(true);
    }, []);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch('/api/trending');
        const data = await res.json();
        if (data.success) {
          setTrending(data.wallpapers);
        } else {
          // Fallback demo data
          setTrending(Array.from({ length: 12 }, (_, i) => ({
            _id: i,
            title: `Trending Design ${i + 1}`,
            category: ['Abstract', 'Nature', 'Minimal', 'Gradient'][i % 4]
          })));
        }
      } catch (err) {
        console.error('Error fetching trending wallpapers:', err);
        // Fallback demo data
        setTrending(Array.from({ length: 12 }, (_, i) => ({
          _id: i,
          title: `Trending Design ${i + 1}`,
          category: ['Abstract', 'Nature', 'Minimal', 'Gradient'][i % 4]
        })));
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
        <FloatingDoodle className="top-40 right-20 text-pink-200" delay={1}>✨</FloatingDoodle>
        <FloatingDoodle className="bottom-32 left-20 text-purple-200" delay={2}>📈</FloatingDoodle>
        <FloatingDoodle className="top-60 left-1/4 text-orange-200" delay={1.5}>🎨</FloatingDoodle>
        <FloatingDoodle className="bottom-40 right-1/3 text-pink-200" delay={2.5}>🌟</FloatingDoodle>

        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            {/* Animated Loading Icon */}
            <div className="relative mb-8">
              <div className="w-20 h-20 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-pink-100 border-b-pink-500 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Loading Trending Wallpapers</h2>
            <p className="text-gray-500">Discovering what's hot right now...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Background Doodles - More Scattered */}
      <FloatingDoodle className="top-20 left-10 text-orange-200" delay={0}>🔥</FloatingDoodle>
      <FloatingDoodle className="top-32 right-16 text-pink-200" delay={0.5}>✨</FloatingDoodle>
      <FloatingDoodle className="top-60 left-1/4 text-purple-200" delay={1}>📈</FloatingDoodle>
      <FloatingDoodle className="top-80 right-1/3 text-orange-200" delay={1.5}>🎨</FloatingDoodle>
      <FloatingDoodle className="bottom-40 left-16 text-pink-200" delay={2}>🌟</FloatingDoodle>
      <FloatingDoodle className="bottom-60 right-20 text-purple-200" delay={2.5}>🎭</FloatingDoodle>
      <FloatingDoodle className="bottom-20 left-1/3 text-orange-200" delay={3}>⚡</FloatingDoodle>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-7xl">
        {/* Enhanced Header Section */}
        <div className="text-center mb-16">
          {/* Decorative Elements */}
          <div className="flex justify-center items-center gap-4 mb-8">
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-orange-400 rounded-full"></div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl transform rotate-12 hover:rotate-0 transition-all duration-500">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-purple-400 rounded-full"></div>
          </div>

          {/* Main Heading with Enhanced Typography */}
          <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-orange-600 via-pink-600 to-purple-500 bg-clip-text text-transparent">
              Trending
            </span>
            <br />
            <span className="bg-gradient-to-r from-pink-600 via-purple-500 to-orange-600 bg-clip-text text-transparent">
              Wallpapers
            </span>
          </h1>

          {/* Subheading with Better Spacing */}
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed font-light">
            Discover the most popular and stunning wallpapers
            <span className="font-medium text-orange-600"> loved by our community</span>
          </p>
        </div>

        {/* Collection Grid using masonry layout like your collection page */}
         <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-3 gap-3 space-y-3 mx-auto px-4 w-full">
                  {trending.map((wallpaper, index) => (
                    <WallpaperCard 
                      key={wallpaper._id} 
                      wallpaper={wallpaper} 
                      index={index}
                      onUnauthorizedAction={handleUnauthorizedAction}
                    />
                  ))}
                </div>
      </div>
      <LoginPopup 
              isVisible={showLoginPopup} 
              onClose={() => setShowLoginPopup(false)} 
              actionType={loginActionType}
            />

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}