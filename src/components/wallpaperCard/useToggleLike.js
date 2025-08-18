// useToggleLike.js - Hook for handling wallpaper likes

import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { StorageService } from './StorageService';

export const useToggleLike = (wallpaperId, initialLikeCount = 0, onUnauthorizedAction) => {
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

    setIsLoading(true);

    try {
      const res = await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallpaperId }),
      });

      if (res.status === 401) {
        onUnauthorizedAction?.("like");
        return;
      }

      if (res.ok) {
        const liked = StorageService.getLikedWallpapers();
        const wasLiked = liked.includes(wallpaperId);
        const updated = wasLiked
          ? liked.filter(id => id !== wallpaperId)
          : [...liked, wallpaperId];

        StorageService.updateLikedWallpapers(updated);
        setIsLiked(!wasLiked);
        setLikeCount(prev => wasLiked ? prev - 1 : prev + 1);
      } else {
        console.error('Failed to toggle like:', res.statusText);
      }
    } catch (err) {
      console.error('Like error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [wallpaperId, sessionStatus, session?.user, isLoading, onUnauthorizedAction]);

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