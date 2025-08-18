'use client';
import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useSession } from 'next-auth/react';
import { UserPlus, Check } from 'lucide-react';

// ✅ GLOBAL FOLLOW EVENT EMITTER
class FollowEventEmitter extends EventTarget {
  emit(userId, data) {
    this.dispatchEvent(new CustomEvent('followStatusChange', {
      detail: { userId, data }
    }));
  }
}

const followEventEmitter = new FollowEventEmitter();

// ✅ GLOBAL CACHES
const followStatusCache = new Map();
const followStatusPromises = new Map();

// ✅ STORAGE SERVICE
const getUserKey = (keyBase) => {
  try {
    if (typeof window === 'undefined') return keyBase;
    const user = JSON.parse(localStorage.getItem('lastLoggedInUser') || sessionStorage.getItem('currentUser'));
    return user ? `${keyBase}_${user}` : keyBase;
  } catch {
    return keyBase;
  }
};

const FollowStorageService = {
  getFollowedUsers: () => {
    try {
      if (typeof window === 'undefined') return [];
      return JSON.parse(localStorage.getItem(getUserKey('followedUsers'))) || [];
    } catch {
      return [];
    }
  },
  
  updateFollowedUsers: (list) => {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem(getUserKey('followedUsers'), JSON.stringify(list));
    } catch (e) {
      console.error('Failed to update followed users:', e);
    }
  },

  getFollowStatus: (userId) => {
    try {
      if (typeof window === 'undefined') return null;
      const cache = JSON.parse(localStorage.getItem('followStatusCache')) || {};
      const userCache = cache[userId];
      if (userCache && Date.now() - userCache.timestamp < 5 * 60 * 1000) {
        return userCache;
      }
      return null;
    } catch {
      return null;
    }
  },

  setFollowStatus: (userId, status) => {
    try {
      if (typeof window === 'undefined') return;
      const cache = JSON.parse(localStorage.getItem('followStatusCache')) || {};
      cache[userId] = {
        ...status,
        timestamp: Date.now()
      };
      localStorage.setItem('followStatusCache', JSON.stringify(cache));
    } catch (e) {
      console.error('Failed to cache follow status:', e);
    }
  }
};

// ✅ FOLLOW STATUS FETCHER
const fetchFollowStatusOptimized = async (userId) => {
  if (!userId) return { isFollowing: false, followerCount: 0 };

  // Check memory cache first
  const memoryCache = followStatusCache.get(userId);
  if (memoryCache && Date.now() - memoryCache.timestamp < 5 * 60 * 1000) {
    return memoryCache.data;
  }

  // Check localStorage cache
  const localCache = FollowStorageService.getFollowStatus(userId);
  if (localCache) {
    followStatusCache.set(userId, { data: localCache, timestamp: localCache.timestamp });
    return localCache;
  }

  // Prevent duplicate API calls
  if (followStatusPromises.has(userId)) {
    return await followStatusPromises.get(userId);
  }

  const promise = fetch(`/api/follow?following=${userId}`)
    .then(res => res.json())
    .then(data => {
      const result = {
        isFollowing: data.isFollowing || false,
        followerCount: data.followerCount || 0
      };

      followStatusCache.set(userId, { data: result, timestamp: Date.now() });
      FollowStorageService.setFollowStatus(userId, result);
      
      // Emit status change
      followEventEmitter.emit(userId, result);
      
      return result;
    })
    .catch(err => {
      console.error('Error fetching follow status:', err);
      return { isFollowing: false, followerCount: 0 };
    })
    .finally(() => {
      followStatusPromises.delete(userId);
    });

  followStatusPromises.set(userId, promise);
  return await promise;
};

// ✅ GLOBAL FOLLOW STATUS UPDATER
const updateFollowStatusGlobally = (userId, newStatus) => {
  // Update memory cache
  followStatusCache.set(userId, { data: newStatus, timestamp: Date.now() });
  
  // Update localStorage cache
  FollowStorageService.setFollowStatus(userId, newStatus);
  
  // Update followed users list
  const followedUsers = FollowStorageService.getFollowedUsers();
  if (newStatus.isFollowing && !followedUsers.includes(userId)) {
    followedUsers.push(userId);
    FollowStorageService.updateFollowedUsers(followedUsers);
  } else if (!newStatus.isFollowing && followedUsers.includes(userId)) {
    const updated = followedUsers.filter(id => id !== userId);
    FollowStorageService.updateFollowedUsers(updated);
  }
  
  // Emit global status change event
  followEventEmitter.emit(userId, newStatus);
};

// ✅ FOLLOW CONTEXT
const FollowContext = createContext(null);

export const FollowProvider = ({ children }) => {
  const [followStatuses, setFollowStatuses] = useState(new Map());

  useEffect(() => {
    const handleFollowStatusChange = (event) => {
      const { userId, data } = event.detail;
      setFollowStatuses(prev => new Map(prev.set(userId, data)));
    };

    followEventEmitter.addEventListener('followStatusChange', handleFollowStatusChange);

    return () => {
      followEventEmitter.removeEventListener('followStatusChange', handleFollowStatusChange);
    };
  }, []);

  const value = {
    followStatuses,
    updateFollowStatus: updateFollowStatusGlobally,
    fetchFollowStatus: fetchFollowStatusOptimized
  };

  return (
    <FollowContext.Provider value={value}>
      {children}
    </FollowContext.Provider>
  );
};

// ✅ FOLLOW HOOK
export const useFollow = (userId) => {
  const { data: session, status: sessionStatus } = useSession();
  const context = useContext(FollowContext);
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const isOwnProfile = session?.user?._id === userId;

  // Initialize from localStorage immediately
  useEffect(() => {
    if (sessionStatus === 'loading' || !userId || isOwnProfile) return;
    
    const followedUsers = FollowStorageService.getFollowedUsers();
    setIsFollowing(followedUsers.includes(userId));
  }, [userId, sessionStatus, isOwnProfile]);

  // Listen to global follow status changes
  useEffect(() => {
    if (!userId) return;

    const handleFollowStatusChange = (event) => {
      const { userId: changedUserId, data } = event.detail;
      if (changedUserId === userId) {
        setIsFollowing(data.isFollowing);
        setFollowerCount(data.followerCount);
      }
    };

    followEventEmitter.addEventListener('followStatusChange', handleFollowStatusChange);

    return () => {
      followEventEmitter.removeEventListener('followStatusChange', handleFollowStatusChange);
    };
  }, [userId]);

  // Background sync with server
  useEffect(() => {
    if (sessionStatus === 'loading' || !session?.user || !userId || isOwnProfile) {
      return;
    }

    let mounted = true;
    
    fetchFollowStatusOptimized(userId)
      .then(data => {
        if (mounted) {
          setIsFollowing(data.isFollowing);
          setFollowerCount(data.followerCount);
        }
      });

    return () => {
      mounted = false;
    };
  }, [userId, session?.user, sessionStatus, isOwnProfile]);

  // Toggle follow function
  const toggleFollow = useCallback(async (onUnauthorizedAction) => {
    if (sessionStatus === 'loading' || !userId || isOwnProfile) return;

    if (!session?.user) {
      onUnauthorizedAction?.('follow');
      return;
    }

    setLoading(true);

    // Optimistic update
    const newFollowingState = !isFollowing;
    const newFollowerCount = newFollowingState ? followerCount + 1 : Math.max(0, followerCount - 1);
    
    setIsFollowing(newFollowingState);
    setFollowerCount(newFollowerCount);
    
    const optimisticStatus = {
      isFollowing: newFollowingState,
      followerCount: newFollowerCount
    };
    
    updateFollowStatusGlobally(userId, optimisticStatus);

    try {
      const res = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ following: userId }),
      });

      if (res.status === 401) {
        // Revert on unauthorized
        const revertStatus = {
          isFollowing: !newFollowingState,
          followerCount: followerCount
        };
        setIsFollowing(!newFollowingState);
        setFollowerCount(followerCount);
        updateFollowStatusGlobally(userId, revertStatus);
        onUnauthorizedAction?.('follow');
        return;
      }

      if (!res.ok) {
        // Revert on error
        const revertStatus = {
          isFollowing: !newFollowingState,
          followerCount: followerCount
        };
        setIsFollowing(!newFollowingState);
        setFollowerCount(followerCount);
        updateFollowStatusGlobally(userId, revertStatus);
        throw new Error('Follow request failed');
      }

      const data = await res.json();
      
      // Confirm with server response
      const confirmedStatus = {
        isFollowing: data.isFollowing ?? newFollowingState,
        followerCount: data.followerCount ?? newFollowerCount
      };
      
      setIsFollowing(confirmedStatus.isFollowing);
      setFollowerCount(confirmedStatus.followerCount);
      updateFollowStatusGlobally(userId, confirmedStatus);

    } catch (err) {
      console.error('Follow error:', err);
      
      // Revert on error
      const revertStatus = {
        isFollowing: !newFollowingState,
        followerCount: followerCount
      };
      setIsFollowing(!newFollowingState);
      setFollowerCount(followerCount);
      updateFollowStatusGlobally(userId, revertStatus);
    } finally {
      setLoading(false);
    }
  }, [isFollowing, userId, session?.user, sessionStatus, isOwnProfile, followerCount]);

  return {
    isFollowing,
    followerCount,
    loading,
    toggleFollow,
    isOwnProfile
  };
};

// ✅ FOLLOW BUTTON COMPONENT
export const FollowButton = ({ 
  userId, 
  onUnauthorizedAction,
  className = "",
  size = "default",
  variant = "default",
  showFollowerCount = false,
  children 
}) => {
  const { isFollowing, followerCount, loading, toggleFollow, isOwnProfile } = useFollow(userId);

  if (isOwnProfile) return null;

  const handleClick = (e) => {
    e?.stopPropagation();
    toggleFollow(onUnauthorizedAction);
  };

  const sizeClasses = {
    small: "px-3 py-2 text-sm",
    default: "px-4 py-3",
    large: "px-6 py-4 text-lg"
  };

  const variantClasses = {
    default: isFollowing
      ? 'bg-green-500 text-white border border-green-400 hover:bg-green-600'
      : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl',
    outline: isFollowing
      ? 'border-2 border-green-500 text-green-500 bg-green-50 hover:bg-green-100'
      : 'border-2 border-blue-500 text-blue-500 bg-blue-50 hover:bg-blue-100',
    minimal: isFollowing
      ? 'text-green-600 hover:text-green-700 hover:bg-green-50'
      : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`
        rounded-xl font-semibold transition-all duration-150 
        flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {isFollowing ? (
            <Check className="w-4 h-4" />
          ) : (
            <UserPlus className="w-4 h-4" />
          )}
          {children || (
            <>
              <span>{isFollowing ? 'Following' : 'Follow'}</span>
              {showFollowerCount && (
                <span className="text-xs opacity-80">
                  ({followerCount.toLocaleString()})
                </span>
              )}
            </>
          )}
        </>
      )}
    </button>
  );
};

// ✅ FOLLOWER COUNT COMPONENT
export const FollowerCount = ({ userId, className = "" }) => {
  const { followerCount } = useFollow(userId);
  
  return (
    <span className={className}>
      {followerCount.toLocaleString()} followers
    </span>
  );
};

// ✅ CACHE CLEANUP UTILITY
export const cleanupFollowCaches = () => {
  const now = Date.now();
  const maxAge = 10 * 60 * 1000; // 10 minutes
  
  // Clean memory cache
  for (const [userId, cacheEntry] of followStatusCache.entries()) {
    if (now - cacheEntry.timestamp > maxAge) {
      followStatusCache.delete(userId);
    }
  }
  
  // Clean localStorage cache
  try {
    if (typeof window !== 'undefined') {
      const cache = JSON.parse(localStorage.getItem('followStatusCache')) || {};
      const cleanedCache = {};
      
      for (const [userId, cacheEntry] of Object.entries(cache)) {
        if (now - cacheEntry.timestamp <= maxAge) {
          cleanedCache[userId] = cacheEntry;
        }
      }
      
      localStorage.setItem('followStatusCache', JSON.stringify(cleanedCache));
    }
  } catch (error) {
    console.error('Error cleaning follow caches:', error);
  }
};

// Auto cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(cleanupFollowCaches, 5 * 60 * 1000);
}

export default {
  FollowProvider,
  useFollow,
  FollowButton,
  FollowerCount,
  cleanupFollowCaches,
  updateFollowStatusGlobally,
  fetchFollowStatusOptimized
};