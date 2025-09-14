'use client';
import React from 'react'
import { useEffect, useState } from "react";
import {
  BookMarked,
  Sparkles,
  Plus,
  Edit3,
  Trash2,
  Check,
  X,
  Folder,
  Image,
  ArrowRight,
  Heart,
  Palette,
  AlertTriangle
} from 'lucide-react';
import Loading from '@/components/loading';

// Floating Doodle Component
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

// Delete Confirmation Modal - FIXED
const DeleteModal = ({ isOpen, onClose, onConfirm, collectionName }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-sm sm:max-w-md w-full shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-200">
        <div className="text-center">
          {/* Warning Icon */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8 text-red-600" />
          </div>
          
          {/* Title */}
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
            Delete Collection?
          </h3>
          
          {/* Message */}
          <p className="text-gray-600 mb-2">
            Are you sure you want to delete
          </p>
          <p className="text-gray-900 font-semibold mb-4 sm:mb-6 break-words">
            "{collectionName}"?
          </p>
          <p className="text-sm text-red-600 mb-6 sm:mb-8">
            This action cannot be undone.
          </p>
          
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={onClose}
              className="order-2 sm:order-1 flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-2xl hover:bg-gray-200 transition-colors duration-200 active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose(); // Close modal immediately after confirm
              }}
              className="order-1 sm:order-2 flex-1 px-6 py-3 bg-red-500 text-white font-semibold rounded-2xl hover:bg-red-600 transition-colors duration-200 active:scale-95"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Collection Card Component - FIXED MOBILE ICONS
const CollectionCard = ({ 
  collection, 
  onRename, 
  onDelete, 
  onView, 
  isRenaming, 
  onStartRename, 
  onCancelRename, 
  renameValue, 
  onRenameValueChange 
}) => {
  return (
    <article className="group bg-white/70 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg border border-white/20 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
      {/* Collection Header */}
      <header className="p-4 sm:p-6 bg-gradient-to-r from-gray-50/80 to-white/60 border-b border-gray-100/50">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            {isRenaming ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => onRenameValueChange(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && onRename()}
                  className="flex-1 px-3 sm:px-4 py-2 bg-white/80 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 font-medium text-sm sm:text-base"
                  placeholder="Collection name"
                  autoFocus
                />
                <button
                  onClick={onRename}
                  className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors duration-200 active:scale-95 flex-shrink-0"
                  aria-label="Save rename"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={onCancelRename}
                  className="p-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors duration-200 active:scale-95 flex-shrink-0"
                  aria-label="Cancel rename"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="cursor-pointer" onClick={onView}>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors duration-300 truncate">
                  {collection.name}
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Image className="w-4 h-4 flex-shrink-0" />
                  <span>{collection.wallpaperCount || 0} wallpapers</span>
                </div>
              </div>
            )}
          </div>
          
          {/* FIXED: Always visible icons on mobile, hover on desktop */}
          {!isRenaming && (
            <div className="flex items-center gap-1 sm:gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStartRename();
                }}
                className="p-2 sm:p-2 bg-blue-500/20 sm:bg-blue-500/10 text-blue-600 rounded-xl hover:bg-blue-500 hover:text-white transition-all duration-200 active:scale-95"
                aria-label="Rename collection"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-2 sm:p-2 bg-red-500/20 sm:bg-red-500/10 text-red-600 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-200 active:scale-95"
                aria-label="Delete collection"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Collection Preview - FIXED HEIGHT */}
      <div className="p-3 sm:p-4">
        {collection.wallpaperPreview && collection.wallpaperPreview.length > 0 ? (
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 h-24 sm:h-32">
            {collection.wallpaperPreview.slice(0, 6).map((wallpaper, index) => (
              <div
                key={wallpaper._id || index}
                className="aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 hover:scale-105 transition-transform duration-300"
              >
                <img
                  src={wallpaper.imageUrl}
                  alt={wallpaper.title || 'Preview'}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={onView}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="h-24 sm:h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl sm:rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <Folder className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-1 sm:mb-2" />
              <p className="text-gray-500 text-xs sm:text-sm">Empty collection</p>
            </div>
          </div>
        )}
      </div>

      {/* View Collection Button */}
      <footer className="p-3 sm:p-4 pt-0">
        <button
          onClick={onView}
          className="w-full group/btn flex items-center justify-center gap-2 py-2.5 sm:py-3 bg-gradient-to-r from-orange-500/10 to-pink-500/10 text-orange-600 font-semibold rounded-xl sm:rounded-2xl hover:from-orange-500 hover:to-pink-600 hover:text-white transition-all duration-300 text-sm sm:text-base active:scale-95"
        >
          <span>View Collection</span>
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
        </button>
      </footer>
    </article>
  );
};

function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    collectionId: null,
    collectionName: ""
  });

  // Handle key press for inputs
  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  const fetchCollections = async () => {
    try {
      const res = await fetch("/api/collection");
      const data = await res.json();
      if (data.success && Array.isArray(data.collections)) {
        setCollections(data.collections);
      }
    } catch (err) {
      console.error('Failed to fetch collections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  // FIXED: Create collection with optimistic update
  const createCollection = async () => {
    if (!newCollectionName.trim() || creating) return;
    setCreating(true);
    
    // Create temporary collection for immediate UI update
    const tempId = `temp_${Date.now()}`;
    const tempCollection = {
      _id: tempId,
      name: newCollectionName.trim(),
      wallpaperCount: 0,
      wallpaperPreview: []
    };
    
    // Add to UI immediately
    setCollections(prev => [tempCollection, ...prev]);
    const collectionName = newCollectionName.trim();
    setNewCollectionName("");
    
    try {
      const res = await fetch("/api/collection", {
        method: "POST",
        body: JSON.stringify({ name: collectionName }),
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      
      if (data.success) {
        // Replace temporary with real collection
        setCollections(prev => 
          prev.map(col => 
            col._id === tempId 
              ? { ...data.collection, wallpaperCount: 0, wallpaperPreview: [] }
              : col
          )
        );
      } else {
        // Remove temporary on failure
        setCollections(prev => prev.filter(col => col._id !== tempId));
        setNewCollectionName(collectionName); // Restore input
        alert('Failed to create collection: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error creating collection:', err);
      // Remove temporary on error
      setCollections(prev => prev.filter(col => col._id !== tempId));
      setNewCollectionName(collectionName); // Restore input
      alert('Failed to create collection. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  // Rename collection with optimistic update
  const renameCollection = async (collectionId) => {
    if (!renameValue.trim()) return;
    
    const oldName = collections.find(c => c._id === collectionId)?.name;
    
    // Update UI immediately
    setCollections(prev => 
      prev.map(col => 
        col._id === collectionId ? { ...col, name: renameValue.trim() } : col
      )
    );
    
    try {
      const res = await fetch("/api/collection", {
        method: "PUT",
        body: JSON.stringify({ collectionId, newName: renameValue.trim() }),
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      
      if (!data.success) {
        // Revert on failure
        setCollections(prev => 
          prev.map(col => 
            col._id === collectionId ? { ...col, name: oldName } : col
          )
        );
        alert('Failed to rename collection: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error renaming collection:', err);
      // Revert on error
      setCollections(prev => 
        prev.map(col => 
          col._id === collectionId ? { ...col, name: oldName } : col
        )
      );
      alert('Failed to rename collection. Please try again.');
    } finally {
      setRenamingId(null);
      setRenameValue("");
    }
  };

  // FIXED: Delete collection with proper modal handling
  const deleteCollection = async (collectionId) => {
    const collectionToDelete = collections.find(c => c._id === collectionId);
    if (!collectionToDelete) return;
    
    // Remove from UI immediately
    setCollections(prev => prev.filter(col => col._id !== collectionId));
    
    try {
      const res = await fetch(`/api/collection?id=${collectionId}`, { method: "DELETE" });
      const data = await res.json();
      
      if (!data.success) {
        // Restore on failure
        setCollections(prev => [...prev, collectionToDelete]);
        alert('Failed to delete collection: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error deleting collection:', err);
      // Restore on error
      setCollections(prev => [...prev, collectionToDelete]);
      alert('Failed to delete collection. Please try again.');
    }
  };

  // Navigate to collection
  const viewCollection = (collectionName) => {
    window.location.href = `/collections/collect/${encodeURIComponent(collectionName)}`;
  };

  if (loading) {
    return (
      <Loading text={"loading your collections..."} />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 relative overflow-hidden">
      <div className="relative z-10 container mx-auto px-4 py-6 sm:py-12 max-w-7xl">
        {/* Collections Grid */}
        <main>
          {collections.length === 0 ? (
            <div className="text-center py-12 sm:py-20">
              <div className="relative mb-6 sm:mb-8">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                  <Folder className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
                </div>
                <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-10 h-10 sm:w-12 sm:h-12 bg-purple-400 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">No Collections Yet</h3>
              <p className="text-gray-600 text-lg sm:text-xl mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed px-4">
                Start organizing your wallpapers by creating your first collection above.
              </p>
              
              <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 font-semibold rounded-2xl text-sm sm:text-base">
                <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Create your first collection to get started</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {collections.map((collection) => (
                <CollectionCard
                  key={collection._id}
                  collection={collection}
                  isRenaming={renamingId === collection._id}
                  renameValue={renameValue}
                  onRenameValueChange={setRenameValue}
                  onStartRename={() => {
                    setRenamingId(collection._id);
                    setRenameValue(collection.name);
                  }}
                  onCancelRename={() => {
                    setRenamingId(null);
                    setRenameValue("");
                  }}
                  onRename={() => renameCollection(collection._id)}
                  onDelete={() => {
                    setDeleteModal({
                      isOpen: true,
                      collectionId: collection._id,
                      collectionName: collection.name
                    });
                  }}
                  onView={() => viewCollection(collection.name)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* FIXED: Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, collectionId: null, collectionName: "" })}
        onConfirm={() => deleteCollection(deleteModal.collectionId)}
        collectionName={deleteModal.collectionName}
      />
    </div>
  );
}

export default CollectionsPage;