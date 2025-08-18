'use client';
import React, { useState } from 'react';
import { BookMarked, Sparkles, Plus } from 'lucide-react';

const FloatingDoodle = ({ children, className = "", delay = 0 }) => (
  <div
    className={`absolute opacity-10 text-6xl ${className}`}
    style={{
      animation: `float 6s ease-in-out infinite alternate`,
      animationDelay: `${delay}s`
    }}
  >
    {children}
    <style jsx>{`
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(5deg); }
      }
    `}</style>
  </div>
);

function CollectionsHeader() {
  const [newCollectionName, setNewCollectionName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  const createCollection = async () => {
    if (!newCollectionName.trim()) return;
    setCreating(true);

    try {
      const res = await fetch("/api/collect", {
        method: "POST",
        body: JSON.stringify({ name: newCollectionName }),
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (data.success) {
        setNewCollectionName("");
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
  <div className="bg-gradient-to-br from-gray-50 via-white to-purple-50 relative overflow-hidden px-4 sm:px-6 lg:px-8">
    <header className="text-center mb-5 py-8 sm:py-12 lg:py-16">
      <FloatingDoodle className="top-20 left-4 sm:left-10 text-purple-200" delay={0}>📁</FloatingDoodle>
      <FloatingDoodle className="top-32 right-4 sm:right-16 text-pink-200" delay={0.5}>✨</FloatingDoodle>
      <FloatingDoodle className="top-60 left-1/4 text-blue-200" delay={1}>🎨</FloatingDoodle>
      <FloatingDoodle className="bottom-40 right-4 sm:right-20 text-indigo-200" delay={1.5}>💫</FloatingDoodle>
      <FloatingDoodle className="bottom-20 left-1/3 text-green-200" delay={2}>🖼️</FloatingDoodle>

      {/* Decorative Elements */}
      <div className="flex justify-center items-center gap-2 sm:gap-4 mb-6 sm:mb-8">
        <div className="w-6 sm:w-12 h-0.5 bg-gradient-to-r from-transparent to-purple-300 rounded-full"></div>
        <div className="relative mt-4 sm:mt-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl transform rotate-12 hover:rotate-0 transition-all duration-500">
            <BookMarked className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
            <Sparkles className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
          </div>
        </div>
        <div className="w-6 sm:w-12 h-0.5 bg-gradient-to-l from-transparent to-pink-300 rounded-full"></div>
      </div>

      {/* Main Heading */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 sm:mb-6 leading-tight px-2">
        <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-500 bg-clip-text text-transparent">
          My
        </span>
        <span className="bg-gradient-to-r ml-2 sm:ml-5 from-pink-500 via-red-500 to-orange-500 bg-clip-text text-transparent">
          Collections
        </span>
      </h1>

      {/* Subheading */}
      <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed font-light px-4">
        Organize your favorite wallpapers into
        <span className="font-medium text-purple-600"> beautiful collections</span>
      </p>

      {/* Create New Collection */}
      <div className="max-w-xs sm:max-w-md mx-auto px-4">
        <div className="flex flex-col sm:flex-row gap-3 p-2 bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg border border-white/20">
          <input
            type="text"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, createCollection)}
            placeholder="Create a new collection..."
            className="flex-1 px-4 sm:px-6 py-3 bg-transparent border-0 focus:outline-none text-gray-800 placeholder-gray-500 text-center sm:text-left"
            disabled={creating}
          />
          <button
            onClick={createCollection}
            disabled={!newCollectionName.trim() || creating}
            className="px-4 sm:px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-600 text-white font-semibold rounded-xl sm:rounded-3xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {creating ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            <span className="sm:inline">Create</span>
          </button>
        </div>
      </div>
    </header>
  </div>
);
}

export default CollectionsHeader;
