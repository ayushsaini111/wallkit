// useToggleSave.js
import { useState, useCallback, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { StorageService } from './StorageService';

export const useToggleSave = (wallpaperId, onUnauthorizedAction, onWallpaperRemoved) => {
  const { data: session, status: sessionStatus } = useSession();
  const [isSaved, setIsSaved] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Initialize from localStorage on mount and when wallpaperId or sessionStatus changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStatus === 'loading') return;

    const saved = StorageService.getSavedWallpapers();
    // console.log('[useToggleSave] init saved list for', wallpaperId, saved);
    setIsSaved(saved.includes(wallpaperId));
  }, [wallpaperId, sessionStatus]);

  // Listen for same-tab and cross-tab changes
  useEffect(() => {
    const refreshFromStorage = () => {
      const saved = StorageService.getSavedWallpapers();
      const nowSaved = saved.includes(wallpaperId);
      // debug
      // console.log('[useToggleSave] refreshFromStorage', wallpaperId, nowSaved);
      setIsSaved(nowSaved);
    };

    const storageHandler = (e) => {
      // cross-tab: only react when the sync key changes (minimize noise)
      if (!e || e.key === 'savedWallpapersSync') {
        refreshFromStorage();
      }
    };

    const customHandler = (e) => {
      // same-tab custom event
      refreshFromStorage();
    };

    window.addEventListener('storage', storageHandler);
    window.addEventListener('savedWallpapersChanged', customHandler);

    // run once
    refreshFromStorage();

    return () => {
      window.removeEventListener('storage', storageHandler);
      window.removeEventListener('savedWallpapersChanged', customHandler);
    };
  }, [wallpaperId]);

  // toggleSave: open modal if no explicit API, otherwise optimistic persist to configured endpoint
  const toggleSave = useCallback(async (e) => {
    e?.stopPropagation();
    if (sessionStatus === 'loading' || isLoading) return;

    if (!session?.user) {
      onUnauthorizedAction?.('save');
      return;
    }

    // If developer set explicit api in env, use it; else open modal (safe)
    const explicitEndpoint = typeof window !== 'undefined' && process?.env?.NEXT_PUBLIC_TOGGLE_SAVE_API
      ? process.env.NEXT_PUBLIC_TOGGLE_SAVE_API
      : null;

    if (!explicitEndpoint) {
      // safe UX: open collection modal for manual save
      setModalOpen(true);
      return;
    }

    setIsLoading(true);

    // optimistic update
    const currentSaved = StorageService.getSavedWallpapers();
    const currentlySaved = currentSaved.includes(wallpaperId);
    const newList = currentlySaved ? currentSaved.filter(id => id !== wallpaperId) : [...currentSaved, wallpaperId];

    if (currentlySaved) {
      onWallpaperRemoved?.(wallpaperId);
      setIsSaved(false);
    } else {
      setIsSaved(true);
    }
    StorageService.updateSavedWallpapers(newList);

    try {
      const res = await fetch(explicitEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ wallpaperId, action: currentlySaved ? 'unsave' : 'save' })
      });

      let data = null;
      try { data = await res.json(); } catch (err) {}

      if (res.ok && (data === null || data.success !== false)) {
        // persisted
        console.log('[useToggleSave] persisted to', explicitEndpoint, data);
      } else {
        console.error('[useToggleSave] persist failed', { status: res.status, data });
        // revert
        StorageService.updateSavedWallpapers(currentSaved);
        setIsSaved(currentSaved.includes(wallpaperId));
        // fallback: open modal so user can manually save
        setModalOpen(true);
      }
    } catch (err) {
      console.error('[useToggleSave] network error', err);
      StorageService.updateSavedWallpapers(currentSaved);
      setIsSaved(currentSaved.includes(wallpaperId));
      setModalOpen(true);
      alert('Network error. Could not save wallpaper; opening collections as fallback.');
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [session, sessionStatus, wallpaperId, isLoading, onUnauthorizedAction, onWallpaperRemoved]);

  const handleModalClose = useCallback(() => setModalOpen(false), []);
  const handleCollectionSave = useCallback((saved) => {
    setIsSaved(Boolean(saved));
    const savedWallpapers = StorageService.getSavedWallpapers();
    if (saved && !savedWallpapers.includes(wallpaperId)) {
      StorageService.updateSavedWallpapers([...savedWallpapers, wallpaperId]);
    } else if (!saved && savedWallpapers.includes(wallpaperId)) {
      StorageService.updateSavedWallpapers(savedWallpapers.filter(id => id !== wallpaperId));
      onWallpaperRemoved?.(wallpaperId);
    }
  }, [wallpaperId, onWallpaperRemoved]);

  const setSavedState = useCallback((saved) => {
    setIsSaved(Boolean(saved));
    const savedWallpapers = StorageService.getSavedWallpapers();
    if (saved && !savedWallpapers.includes(wallpaperId)) {
      StorageService.updateSavedWallpapers([...savedWallpapers, wallpaperId]);
    } else if (!saved && savedWallpapers.includes(wallpaperId)) {
      StorageService.updateSavedWallpapers(savedWallpapers.filter(id => id !== wallpaperId));
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
