// StorageService.js
// Robust per-user storage + same-tab & cross-tab sync + debug helpers

const resolveUserIdentifier = (user) => {
  if (!user) return null;
  if (typeof user === 'string') return user;
  return user._id || user.id || user.username || user.email || null;
};

const getRawLastUser = () => {
  try {
    return localStorage.getItem('lastLoggedInUser');
  } catch {
    return null;
  }
};

const getUserKey = (keyBase) => {
  try {
    const raw = getRawLastUser();
    if (!raw) return keyBase;
    try {
      const parsed = JSON.parse(raw);
      const id = resolveUserIdentifier(parsed);
      if (id) return `${keyBase}_${id}`;
    } catch {
      const id = raw;
      if (id) return `${keyBase}_${id}`;
    }
    return keyBase;
  } catch (e) {
    console.error('[StorageService] getUserKey error', e);
    return keyBase;
  }
};

const emitSavedWallpapersChange = (key) => {
  try {
    window.dispatchEvent(new CustomEvent('savedWallpapersChanged', { detail: { key, ts: Date.now() } }));
  } catch (e) { /* ignore */ }

  try {
    localStorage.setItem('savedWallpapersSync', String(Date.now()));
  } catch (e) { /* ignore */ }
};

export const StorageService = {
  // Debug helper: list keys and saved value
  debugDump: () => {
    try {
      const raw = getRawLastUser();
      console.log('[StorageService] lastLoggedInUser raw:', raw);
      const savedKey = getUserKey('savedWallpapers');
      console.log('[StorageService] resolved saved key:', savedKey);
      const val = localStorage.getItem(savedKey);
      console.log('[StorageService] savedWallpapers value:', val);
      const likedKey = getUserKey('likedWallpapers');
      console.log('[StorageService] resolved liked key:', likedKey);
      console.log('[StorageService] likedWallpapers value:', localStorage.getItem(likedKey));
    } catch (e) {
      console.error('[StorageService] debugDump error', e);
    }
  },

  // Liked wallpapers
  getLikedWallpapers: () => {
    try {
      const key = getUserKey('likedWallpapers');
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('[StorageService] getLikedWallpapers error', e);
      return [];
    }
  },

  updateLikedWallpapers: (list) => {
    try {
      const key = getUserKey('likedWallpapers');
      localStorage.setItem(key, JSON.stringify(list));
      // Note: not emitting savedWallpapers events for likes; emit if you need cross-tab sync for likes too
      try { localStorage.setItem('likedWallpapersSync', String(Date.now())); } catch (e) {}
    } catch (e) {
      console.error('[StorageService] updateLikedWallpapers error', e);
    }
  },

  // Saved wallpapers
  getSavedWallpapers: () => {
    try {
      const key = getUserKey('savedWallpapers');
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('[StorageService] getSavedWallpapers error', e);
      return [];
    }
  },

  updateSavedWallpapers: (list) => {
    try {
      const key = getUserKey('savedWallpapers');
      localStorage.setItem(key, JSON.stringify(list));
      // Emit events for same-tab + cross-tab sync
      emitSavedWallpapersChange(key);
    } catch (e) {
      console.error('[StorageService] updateSavedWallpapers error', e);
    }
  },

  // Viewed wallpapers
  getViewedWallpapers: () => {
    try {
      const key = getUserKey('viewedWallpapers');
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('[StorageService] getViewedWallpapers error', e);
      return [];
    }
  },

  updateViewedWallpapers: (list) => {
    try {
      const key = getUserKey('viewedWallpapers');
      localStorage.setItem(key, JSON.stringify(list));
    } catch (e) {
      console.error('[StorageService] updateViewedWallpapers error', e);
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
    } catch (e) {
      console.error('[StorageService] getCachedCollections error', e);
      return null;
    }
  },

  setCachedCollections: (userId, collections) => {
    try {
      const cache = JSON.parse(localStorage.getItem('collectionsCache')) || {};
      cache[userId] = { data: collections, timestamp: Date.now() };
      localStorage.setItem('collectionsCache', JSON.stringify(cache));
    } catch (e) {
      console.error('[StorageService] setCachedCollections error', e);
    }
  },

  // Clear specific storage
  clearLikedWallpapers: () => {
    try {
      const key = getUserKey('likedWallpapers');
      localStorage.removeItem(key);
      try { localStorage.setItem('likedWallpapersSync', String(Date.now())); } catch (e) {}
    } catch (e) {
      console.error('[StorageService] clearLikedWallpapers error', e);
    }
  },

  clearSavedWallpapers: () => {
    try {
      const key = getUserKey('savedWallpapers');
      localStorage.removeItem(key);
      emitSavedWallpapersChange(key);
    } catch (e) {
      console.error('[StorageService] clearSavedWallpapers error', e);
    }
  },

  clearViewedWallpapers: () => {
    try {
      const key = getUserKey('viewedWallpapers');
      localStorage.removeItem(key);
    } catch (e) {
      console.error('[StorageService] clearViewedWallpapers error', e);
    }
  },

  clearCollectionsCache: () => {
    try {
      localStorage.removeItem('collectionsCache');
    } catch (e) {
      console.error('[StorageService] clearCollectionsCache error', e);
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
      console.error('[StorageService] clearAll error', e);
    }
  }
};
