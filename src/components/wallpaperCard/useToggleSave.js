// useToggleSave.js - Hook for handling wallpaper saves/collections

import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { StorageService } from './StorageService';

// Collections cache
const collectionsCache = new Map();
const collectionsPromises = new Map();

const fetchCollectionsOptimized = async (userId) => {
  if (!userId) return [];

  // Check memory cache first
  const memoryCache = collectionsCache.get(userId);
  if (memoryCache && Date.now() - memoryCache.timestamp < 10 * 60 * 1000) {
    return memoryCache.data;
  }

  // Check localStorage cache
  const localCache = StorageService.getCachedCollections(userId);
  if (localCache) {
    collectionsCache.set(userId, { data: localCache, timestamp: Date.now() });
    return localCache;
  }

  // Check if there's already a pending request
  if (collectionsPromises.has(userId)) {
    return await collectionsPromises.get(userId);
  }

  // Make API request
  const promise = fetch("/api/collection")
    .then(res => res.json())
    .then(data => {
      const collections = data.success && Array.isArray(data.collections) ? data.collections : [];
      
      // Cache the results
      collectionsCache.set(userId, { data: collections, timestamp: Date.now() });
      StorageService.setCachedCollections(userId, collections);
      
      return collections;
    })
    .catch(err => {
      console.error('Error fetching collections:', err);
      return [];
    })
    .finally(() => {
      collectionsPromises.delete(userId);
    });

  collectionsPromises.set(userId, promise);
  return await promise;
};

export const useToggleSave = (wallpaperId, onUnauthorizedAction, onWallpaperRemoved) => {
  const { data: session, status: sessionStatus } = useSession();
  const [isSaved, setIsSaved] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize saved state from localStorage
  useEffect(() => {
    if (sessionStatus === 'loading') return;
    
    const saved = StorageService.getSavedWallpapers();
    setIsSaved(saved.includes(wallpaperId));
  }, [wallpaperId, sessionStatus]);

  // Check wallpaper saved status in collections
  const checkWallpaperSavedStatus = useCallback(async (wallpaperId) => {
    if (!session?.user) return false;

    try {
      const collections = await fetchCollectionsOptimized(session.user._id);
      return collections.some(collection =>
        collection.wallpaperPreview?.some(wp => wp._id === wallpaperId) ||
        (Array.isArray(collection.wallpapers) && collection.wallpapers.includes(wallpaperId))
      );
    } catch (error) {
      console.error('Error checking wallpaper saved status:', error);
      return false;
    }
  }, [session?.user]);

  // Sync saved state with backend collections
  useEffect(() => {
    if (sessionStatus === 'loading' || !session?.user) return;

    let mounted = true;

    const syncSavedState = async () => {
      try {
        const isCurrentlySaved = await checkWallpaperSavedStatus(wallpaperId);
        if (mounted) {
          setIsSaved(isCurrentlySaved);

          // Update localStorage to match backend state
          const savedWallpapers = StorageService.getSavedWallpapers();
          if (isCurrentlySaved && !savedWallpapers.includes(wallpaperId)) {
            savedWallpapers.push(wallpaperId);
            StorageService.updateSavedWallpapers(savedWallpapers);
          } else if (!isCurrentlySaved && savedWallpapers.includes(wallpaperId)) {
            const updated = savedWallpapers.filter(id => id !== wallpaperId);
            StorageService.updateSavedWallpapers(updated);
          }
        }
      } catch (error) {
        console.error('Error syncing saved state:', error);
      }
    };

    const timeoutId = setTimeout(syncSavedState, 1000);
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [session?.user, wallpaperId, sessionStatus, checkWallpaperSavedStatus]);

  const toggleSave = useCallback(async (e) => {
    e?.stopPropagation();

    if (sessionStatus === 'loading' || isLoading) return;

    if (!session?.user) {
      onUnauthorizedAction?.("save");
      return;
    }

    // Open collections modal instead of direct API call
    setModalOpen(true);
  }, [session?.user, sessionStatus, isLoading, onUnauthorizedAction]);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handleCollectionSave = useCallback((saved) => {
    setIsSaved(saved);

    // Update localStorage
    const savedWallpapers = StorageService.getSavedWallpapers();
    if (saved && !savedWallpapers.includes(wallpaperId)) {
      const updated = [...savedWallpapers, wallpaperId];
      StorageService.updateSavedWallpapers(updated);
    } else if (!saved && savedWallpapers.includes(wallpaperId)) {
      const updated = savedWallpapers.filter(id => id !== wallpaperId);
      StorageService.updateSavedWallpapers(updated);
    }

    // Handle wallpaper removal callback
    if (!saved && onWallpaperRemoved) {
      onWallpaperRemoved(wallpaperId);
    }

    // Clear collections cache to force refresh
    if (session?.user) {
      collectionsCache.delete(session.user._id);
    }
  }, [wallpaperId, onWallpaperRemoved, session?.user]);

  const setSavedState = useCallback((saved) => {
    setIsSaved(saved);
    const savedWallpapers = StorageService.getSavedWallpapers();
    
    if (saved && !savedWallpapers.includes(wallpaperId)) {
      const updated = [...savedWallpapers, wallpaperId];
      StorageService.updateSavedWallpapers(updated);
    } else if (!saved && savedWallpapers.includes(wallpaperId)) {
      const updated = savedWallpapers.filter(id => id !== wallpaperId);
      StorageService.updateSavedWallpapers(updated);
    }
  }, [wallpaperId]);

  return {
    isSaved,
    toggleSave,
    modalOpen,
    handleModalClose,
    handleCollectionSave,
    setSavedState,
    isLoading
  };
};

// Export collections utilities
export { fetchCollectionsOptimized, collectionsCache };