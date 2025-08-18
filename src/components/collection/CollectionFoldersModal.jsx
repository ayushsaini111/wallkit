'use client';

import { useEffect, useState } from "react";
import { X, Plus, Heart, Check,Bookmark, Folder, ImageIcon, Sparkles, Minus } from "lucide-react";

export default function CollectionFoldersModal({ wallpaperId, isOpen, onClose, onWallpaperSaved }) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [creating, setCreating] = useState(false);
  const [wallpaperInCollections, setWallpaperInCollections] = useState(new Set());
  const [isAnimating, setIsAnimating] = useState(false);

  // ✅ OPTIMIZED: Simple and fast collection checking
  const checkWallpaperInCollections = async () => {
    try {
      const res = await fetch("/api/collection");
      const data = await res.json();
      
      if (data.success && Array.isArray(data.collections)) {
        const collectionsWithWallpaper = new Set();
        
        // ✅ SIMPLE, FAST PROCESSING - NO CHUNKING NEEDED
        data.collections.forEach(collection => {
          if (collection.wallpapers?.includes(wallpaperId) ||
              collection.wallpaperPreview?.some(wp => wp._id === wallpaperId)) {
            collectionsWithWallpaper.add(collection._id);
          }
        });
        
        // ✅ IMMEDIATE STATE UPDATE
        setWallpaperInCollections(collectionsWithWallpaper);
        setCollections(data.collections);
        
        const hasAnyCollections = collectionsWithWallpaper.size > 0;
        if (onWallpaperSaved) {
          onWallpaperSaved(hasAnyCollections);
        }
      } else {
        setCollections([]);
      }
    } catch (err) {
      console.error('Error checking wallpaper in collections:', err);
      setCollections([]);
    }
  };

  // ✅ OPTIMIZED: Non-blocking collection fetch
  const fetchCollections = async () => {
    try {
      // ✅ DON'T SET LOADING TRUE IMMEDIATELY - LET UI SHOW FIRST
      await checkWallpaperInCollections();
    } catch (err) {
      console.error('Error fetching collections:', err);
      setCollections([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ ENHANCED: Faster toggle with optimistic updates
  const toggleWallpaperInCollection = async (collectionId) => {
    setSaving(collectionId);
    const isCurrentlyInCollection = wallpaperInCollections.has(collectionId);
    
    // ✅ OPTIMISTIC UPDATE - UPDATE UI IMMEDIATELY
    const newWallpaperInCollections = new Set(wallpaperInCollections);
    if (isCurrentlyInCollection) {
      newWallpaperInCollections.delete(collectionId);
    } else {
      newWallpaperInCollections.add(collectionId);
    }
    setWallpaperInCollections(newWallpaperInCollections);

    // ✅ UPDATE COLLECTION COUNT IMMEDIATELY
    setCollections(prev => prev.map(collection => {
      if (collection._id === collectionId) {
        const newCount = isCurrentlyInCollection
          ? Math.max((collection.wallpaperCount || 0) - 1, 0)
          : (collection.wallpaperCount || 0) + 1;
        return { ...collection, wallpaperCount: newCount };
      }
      return collection;
    }));

    // ✅ NOTIFY PARENT IMMEDIATELY
    if (onWallpaperSaved) {
      const hasAnyCollections = newWallpaperInCollections.size > 0;
      onWallpaperSaved(hasAnyCollections);
    }
    
    try {
      const res = await fetch("/api/collection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectionId, wallpaperId }),
      });
      
      const data = await res.json();
      
      if (!data.success) {
        // ✅ REVERT OPTIMISTIC UPDATE ON ERROR
        setWallpaperInCollections(wallpaperInCollections);
        setCollections(prev => prev.map(collection => {
          if (collection._id === collectionId) {
            const revertCount = isCurrentlyInCollection
              ? (collection.wallpaperCount || 0) + 1
              : Math.max((collection.wallpaperCount || 0) - 1, 0);
            return { ...collection, wallpaperCount: revertCount };
          }
          return collection;
        }));
        
        if (onWallpaperSaved) {
          const hasAnyCollections = wallpaperInCollections.size > 0;
          onWallpaperSaved(hasAnyCollections);
        }
        
        console.error('Failed to toggle wallpaper in collection:', data.message);
        alert(data.message || 'Failed to update collection');
      }

      // ✅ AUTO-CLOSE FOR SINGLE COLLECTION
      if (collections.length === 1 && data.success) {
        setTimeout(() => {
          onClose();
        }, 800);
      }
        
    } catch (err) {
      // ✅ REVERT ON NETWORK ERROR
      setWallpaperInCollections(wallpaperInCollections);
      setCollections(prev => prev.map(collection => {
        if (collection._id === collectionId) {
          const revertCount = isCurrentlyInCollection
            ? (collection.wallpaperCount || 0) + 1
            : Math.max((collection.wallpaperCount || 0) - 1, 0);
          return { ...collection, wallpaperCount: revertCount };
        }
        return collection;
      }));
      
      if (onWallpaperSaved) {
        const hasAnyCollections = wallpaperInCollections.size > 0;
        onWallpaperSaved(hasAnyCollections);
      }
      
      console.error('Error toggling wallpaper in collection:', err);
      alert('Network error. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  // ✅ OPTIMIZED: Faster collection creation
  const createNewCollection = async () => {
    if (!newCollectionName.trim()) return;
    
    setCreating(true);
    
    // ✅ OPTIMISTIC UPDATE - ADD TO UI IMMEDIATELY
    const tempCollection = {
      _id: `temp_${Date.now()}`,
      name: newCollectionName.trim(),
      wallpaperCount: 1,
      wallpaperPreview: []
    };
    setCollections(prev => [tempCollection, ...prev]);
    setWallpaperInCollections(prev => new Set([...prev, tempCollection._id]));
    
    try {
      // Create the collection
      const res = await fetch("/api/collection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCollectionName.trim() }),
      });
      
      const data = await res.json();
      console.log(data);
      
      if (data.success) {
        // ✅ REPLACE TEMP COLLECTION WITH REAL ONE
        setCollections(prev => prev.map(col => 
          col._id === tempCollection._id 
            ? { ...data.data, wallpaperCount: 0, wallpaperPreview: [] }
            : col
        ));
        
        setWallpaperInCollections(prev => {
          const newSet = new Set(prev);
          newSet.delete(tempCollection._id);
          newSet.add(data.data._id);
          return newSet;
        });
        
        // Add wallpaper to the new collection
        await toggleWallpaperInCollection(data.data._id);
        
        // Reset form
        setNewCollectionName('');
        setShowCreateForm(false);
      } else {
        // ✅ REVERT ON ERROR
        setCollections(prev => prev.filter(col => col._id !== tempCollection._id));
        setWallpaperInCollections(prev => {
          const newSet = new Set(prev);
          newSet.delete(tempCollection._id);
          return newSet;
        });
        
        console.error('Failed to create collection:', data.message);
        alert(data.message || 'Failed to create collection');
      }
    } catch (err) {
      // ✅ REVERT ON ERROR
      setCollections(prev => prev.filter(col => col._id !== tempCollection._id));
      setWallpaperInCollections(prev => {
        const newSet = new Set(prev);
        newSet.delete(tempCollection._id);
        return newSet;
      });
      
      console.error('Error creating collection:', err);
      alert('Network error. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  // ✅ OPTIMIZED: Immediate modal display, background data loading
  useEffect(() => {
    if (isOpen) {
      // ✅ SHOW MODAL IMMEDIATELY
      setIsAnimating(true);
      setShowCreateForm(false);
      setNewCollectionName('');
      setLoading(collections.length === 0); // Only show loading if no cached data
      
      // ✅ LOAD DATA IN BACKGROUND
      const loadData = async () => {
        try {
          await fetchCollections();
        } catch (error) {
          console.error('Failed to load to collections:', error);
          setLoading(false);
        }
      };
      
      loadData();
    } else {
      setIsAnimating(false);
    }
  }, [isOpen, wallpaperId]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 h-screen bg-black/30 backdrop-blur-sm z-[9999] transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Modal Container - Fixed at bottom-right */}
      <div className="fixed z-[10000] bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)]">
        <div 
          className={`
            bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden
            w-full transform transition-all duration-300 ease-out will-change-transform
            ${isAnimating 
              ? 'translate-y-0 opacity-100' 
              : 'translate-y-4 opacity-0'
            }
          `}
          style={{
            transform: isAnimating ? 'translate3d(0, 0, 0)' : 'translate3d(0, 1rem, 0)',
            backfaceVisibility: 'hidden',
            perspective: 1000,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100/50 bg-gradient-to-r from-indigo-50/50 via-purple-50/50 to-pink-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-pink-600 rounded-2xl">
                  <Bookmark className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Manage Collections</h2>
                  <p className="text-sm text-gray-500">Add or remove from your collections</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* ✅ OPTIMIZED: Show skeleton only when no collections and loading */}
            {collections.length === 0 && loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-scroll scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
                {collections?.map((collection, index) => {
                  const isInCollection = wallpaperInCollections.has(collection._id);
                  const isSaving = saving === collection._id;
                  
                  return (
                    <div
                      key={collection._id}
                      onClick={() => !isSaving && toggleWallpaperInCollection(collection._id)}
                      className={`
                        group flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer
                        ${isInCollection 
                          ? 'border-green-200 bg-green-50/50 shadow-sm ring-2 ring-green-100' 
                          : isSaving
                          ? 'border-indigo-200 bg-indigo-50/50 shadow-sm'
                          : 'border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 hover:shadow-sm'
                        }
                      `}
                    >
                      {/* Collection Preview */}
                      <div className="relative">
                        {collection.wallpaperPreview?.length > 0 ? (
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center shadow-inner">
                            <div className="grid grid-cols-2 gap-0.5 w-full h-full">
                              {collection.wallpaperPreview.slice(0, 4).map((wallpaper, idx) => (
                                <div key={idx} className="bg-gray-200 relative">
                                  {wallpaper.imageUrl && (
                                    <img 
                                      src={wallpaper.imageUrl} 
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-inner">
                            <Folder className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Collection Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-800 truncate group-hover:text-gray-900 transition-colors">
                            {collection.name}
                          </h3>
                          {isInCollection && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                              Saved
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors">
                          {collection.wallpaperCount || 0} wallpaper{(collection.wallpaperCount || 0) !== 1 ? 's' : ''}
                        </p>
                      </div>

                      {/* Status Icon */}
                      <div className="flex-shrink-0">
                        {isSaving ? (
                          <div className="w-6 h-6 border-2 border-indigo-300 border-t-indigo-500 rounded-full animate-spin"></div>
                        ) : isInCollection ? (
                          <div className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-sm transition-colors group">
                            <Minus className="w-5 h-5 text-white" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-gray-100 group-hover:bg-indigo-100 rounded-full flex items-center justify-center transition-all duration-200 group-hover:shadow-sm">
                            <Plus className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Create New Collection */}
                {!showCreateForm ? (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-gray-300 hover:border-indigo-300 hover:bg-indigo-50/30 hover:shadow-sm transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center group-hover:from-indigo-200 group-hover:to-purple-200 transition-all duration-200 shadow-inner">
                      <Plus className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-gray-700 group-hover:text-indigo-700 transition-colors">
                        Create New Collection
                      </h3>
                      <p className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors">
                        Start a new collection for your wallpapers
                      </p>
                    </div>
                  </button>
                ) : (
                  <div className="p-4 rounded-2xl border-2 text-black border-indigo-200 bg-indigo-50/30 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <Sparkles className="w-5 h-5 text-indigo-500" />
                      <h3 className="font-semibold text-gray-800">Create New Collection</h3>
                    </div>
                    <input
                      type="text"
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                      placeholder="Enter collection name..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all duration-200 shadow-sm"
                      onKeyPress={(e) => e.key === 'Enter' && createNewCollection()}
                      autoFocus
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={createNewCollection}
                        disabled={!newCollectionName.trim() || creating}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-xl font-medium disabled:opacity-50 hover:from-orange-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow"
                      >
                        {creating ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Creating...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Create & Save
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setShowCreateForm(false)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-xl transition-all duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced scrollbar styles */}
      <style jsx>{`
        .space-y-3::-webkit-scrollbar {
          width: 4px;
        }
        
        .space-y-3::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 0;
        }
        
        .space-y-3::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 2px;
          transition: background-color 0.2s ease;
        }
        
        .space-y-3::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.8);
        }
        
        .space-y-3 {
          scrollbar-width: thin;
          scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }
        
        @supports (-webkit-overflow-scrolling: touch) {
          .space-y-3 {
            -webkit-overflow-scrolling: touch;
            transform: translateZ(0);
            will-change: scroll-position;
          }
        }
      `}</style>
    </>
  );
}