// useToggleLike.js - Updated hook with immediate UI feedback
import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { StorageService } from './StorageService';

export const useToggleLike = (wallpaperId, initialLikeCount = 0, onUnauthorizedAction, onWallpaperUnliked) => {
  const { data: session, status: sessionStatus } = useSession();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize liked state from localStorage
  useEffect(() => {
    if (sessionStatus === 'loading') return;
    
    const liked = StorageService.getLikedWallpapers();
    setIsLiked(liked.includes(wallpaperId));
  }, [wallpaperId, sessionStatus]);

  const toggleLike = useCallback(async (e) => {
    e?.stopPropagation();
    
    if (sessionStatus === 'loading' || isLoading) return;
    
    // Check if user is authenticated
    if (!session?.user) {
      onUnauthorizedAction?.("like");
      return;
    }

    // Get current state before making API call
    const liked = StorageService.getLikedWallpapers();
    const wasLiked = liked.includes(wallpaperId);
    
    // Immediately update UI for better UX
    const updated = wasLiked
      ? liked.filter(id => id !== wallpaperId)
      : [...liked, wallpaperId];

    StorageService.updateLikedWallpapers(updated);
    setIsLiked(!wasLiked);
    setLikeCount(prev => wasLiked ? prev - 1 : prev + 1);

    // Call the removal callback immediately if unliking
    if (wasLiked && onWallpaperUnliked) {
      onWallpaperUnliked(wallpaperId);
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallpaperId }),
      });

      if (res.status === 401) {
        onUnauthorizedAction?.("like");
        // Revert the optimistic update
        StorageService.updateLikedWallpapers(liked);
        setIsLiked(wasLiked);
        setLikeCount(prev => wasLiked ? prev + 1 : prev - 1);
        return;
      }

      if (!res.ok) {
        console.error('Failed to toggle like:', res.statusText);
        // Revert the optimistic update on failure
        StorageService.updateLikedWallpapers(liked);
        setIsLiked(wasLiked);
        setLikeCount(prev => wasLiked ? prev + 1 : prev - 1);
        
        // If we had called removal callback, we might need to add it back
        // but since the favorites page filters are already done, this is mainly for consistency
      }
    } catch (err) {
      console.error('Like error:', err);
      // Revert the optimistic update on error
      StorageService.updateLikedWallpapers(liked);
      setIsLiked(wasLiked);
      setLikeCount(prev => wasLiked ? prev + 1 : prev - 1);
    } finally {
      setIsLoading(false);
    }
  }, [wallpaperId, sessionStatus, session?.user, isLoading, onUnauthorizedAction, onWallpaperUnliked]);

  const setLikedState = useCallback((liked) => {
    setIsLiked(liked);
    const likedWallpapers = StorageService.getLikedWallpapers();
        
    if (liked && !likedWallpapers.includes(wallpaperId)) {
      const updated = [...likedWallpapers, wallpaperId];
      StorageService.updateLikedWallpapers(updated);
    } else if (!liked && likedWallpapers.includes(wallpaperId)) {
      const updated = likedWallpapers.filter(id => id !== wallpaperId);
      StorageService.updateLikedWallpapers(updated);
    }
  }, [wallpaperId]);

  return {
    isLiked,
    likeCount,
    toggleLike,
    isLoading,
    setLikedState
  };
};