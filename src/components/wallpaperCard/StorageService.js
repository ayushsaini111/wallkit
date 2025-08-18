// StorageService.js - Handles all localStorage operations

const getUserKey = (keyBase) => {
  try {
    const user = JSON.parse(localStorage.getItem('lastLoggedInUser'));
    return user ? `${keyBase}_${user}` : keyBase;
  } catch {
    return keyBase;
  }
};

export const StorageService = {
  // Liked wallpapers
  getLikedWallpapers: () => {
    try {
      return JSON.parse(localStorage.getItem(getUserKey('likedWallpapers'))) || [];
    } catch {
      return [];
    }
  },

  updateLikedWallpapers: (list) => {
    try {
      localStorage.setItem(getUserKey('likedWallpapers'), JSON.stringify(list));
    } catch (e) {
      console.error('Failed to update liked wallpapers:', e);
    }
  },

  // Saved wallpapers
  getSavedWallpapers: () => {
    try {
      return JSON.parse(localStorage.getItem(getUserKey('savedWallpapers'))) || [];
    } catch {
      return [];
    }
  },

  updateSavedWallpapers: (list) => {
    try {
      localStorage.setItem(getUserKey('savedWallpapers'), JSON.stringify(list));
    } catch (e) {
      console.error('Failed to update saved wallpapers:', e);
    }
  },

  // Viewed wallpapers
  getViewedWallpapers: () => {
    try {
      return JSON.parse(localStorage.getItem(getUserKey('viewedWallpapers'))) || [];
    } catch {
      return [];
    }
  },

  updateViewedWallpapers: (list) => {
    try {
      localStorage.setItem(getUserKey('viewedWallpapers'), JSON.stringify(list));
    } catch (e) {
      console.error('Failed to update viewed wallpapers:', e);
    }
  },

  // Collections cache
  getCachedCollections: (userId) => {
    try {
      const cache = JSON.parse(localStorage.getItem('collectionsCache')) || {};
      const userCache = cache[userId];
      if (userCache && Date.now() - userCache.timestamp < 10 * 60 * 1000) {
        return userCache.data;
      }
      return null;
    } catch {
      return null;
    }
  },

  setCachedCollections: (userId, collections) => {
    try {
      const cache = JSON.parse(localStorage.getItem('collectionsCache')) || {};
      cache[userId] = {
        data: collections,
        timestamp: Date.now()
      };
      localStorage.setItem('collectionsCache', JSON.stringify(cache));
    } catch (e) {
      console.error('Failed to cache collections:', e);
    }
  },

  // Clear specific storage
  clearLikedWallpapers: () => {
    try {
      localStorage.removeItem(getUserKey('likedWallpapers'));
    } catch (e) {
      console.error('Failed to clear liked wallpapers:', e);
    }
  },

  clearSavedWallpapers: () => {
    try {
      localStorage.removeItem(getUserKey('savedWallpapers'));
    } catch (e) {
      console.error('Failed to clear saved wallpapers:', e);
    }
  },

  clearViewedWallpapers: () => {
    try {
      localStorage.removeItem(getUserKey('viewedWallpapers'));
    } catch (e) {
      console.error('Failed to clear viewed wallpapers:', e);
    }
  },

  clearCollectionsCache: () => {
    try {
      localStorage.removeItem('collectionsCache');
    } catch (e) {
      console.error('Failed to clear collections cache:', e);
    }
  },

  // Clear all wallpaper related storage
  clearAll: () => {
    try {
      StorageService.clearLikedWallpapers();
      StorageService.clearSavedWallpapers();
      StorageService.clearViewedWallpapers();
      StorageService.clearCollectionsCache();
    } catch (e) {
      console.error('Failed to clear all storage:', e);
    }
  }
};