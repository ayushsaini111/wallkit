// WallpaperModal.js - Fixed version with instant follower count and responsive design

'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FollowButton } from '@/components/FollowSystem';
import {
  Heart,
  Download,
  Eye,
  Calendar,
  X,
  Check,
  Copy,
  User,
  Share2,
  Bookmark,
  Star,
  ExternalLink,
  Users
} from 'lucide-react';
import Image from 'next/image';

// ✅ IMPROVED FOLLOWER COUNT COMPONENT - instant display, works for all users
const CustomFollowerCount = ({ userId, className = "" }) => {
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    // Check cache first for instant display
    const getCachedFollowerCount = () => {
      try {
        if (typeof window === 'undefined') return null;
        
        // Check localStorage cache
        const cache = JSON.parse(localStorage.getItem('followStatusCache')) || {};
        const userCache = cache[userId];
        
        if (userCache && Date.now() - userCache.timestamp < 10 * 60 * 1000) { // 10 min cache
          return userCache.followerCount || 0;
        }
        
        // Check if user is in followed users list (indicates they have followers)
        const followedUsers = JSON.parse(localStorage.getItem('followedUsers')) || [];
        if (followedUsers.includes(userId)) {
          return 1; // At least 1 follower if someone follows them
        }
        
        return null;
      } catch {
        return null;
      }
    };

    // Set cached value immediately for instant display
    const cachedCount = getCachedFollowerCount();
    if (cachedCount !== null) {
      setFollowerCount(cachedCount);
    }

    // Fetch fresh data in background
    const fetchFollowerCount = async () => {
      try {
        const response = await fetch(`/api/follow?following=${userId}`);
        if (response.ok) {
          const data = await response.json();
          const count = data.followerCount || 0;
          setFollowerCount(count);
          
          // Update cache
          try {
            const cache = JSON.parse(localStorage.getItem('followStatusCache')) || {};
            cache[userId] = {
              ...cache[userId],
              followerCount: count,
              timestamp: Date.now()
            };
            localStorage.setItem('followStatusCache', JSON.stringify(cache));
          } catch (e) {
            console.error('Failed to cache follower count:', e);
          }
        }
      } catch (error) {
        console.error('Error fetching follower count:', error);
        // Keep the cached value or 0 if no cache
      }
    };

    fetchFollowerCount();
  }, [userId]);

  return (
    <div className={`flex items-center gap-1 text-white/60 ${className}`}>
      {/* <Users className="w-3 h-3" /> */}
      <span className="text-xs sm:text-sm">
        {followerCount.toLocaleString()}
      </span>
      <span className="text-xs sm:text-sm">followers</span>
    </div>
  );
};

export const WallpaperModal = ({
  wallpaper,
  showModal,
  onClose,
  onToggleLike,
  onToggleSave,
  onDownload,
  onUnauthorizedAction,
  isLiked,
  isSaved,
  likeCount,
  downloadCount,
  viewCount
}) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [shareStatus, setShareStatus] = useState('idle');
  const [copyLinkStatus, setCopyLinkStatus] = useState('idle');
  const [imageError, setImageError] = useState(false);

  const openProfileDirect = useCallback((e) => {
    e?.stopPropagation();
    const username = wallpaper.userDetails?.username;
    if (!username) return;
    router.push(`/profile/${username}`);
  }, [wallpaper.userDetails?.username, router]);

  const getShareableUrl = useCallback(() => {
    return `${window.location.origin}${window.location.pathname}?wallpaper=${wallpaper._id}`;
  }, [wallpaper._id]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const handleShare = useCallback(async (e) => {
    e?.stopPropagation();
    const shareUrl = getShareableUrl();
    
    // Try native share API first (works on mobile devices)
    if (navigator.share) {
      try {
        await navigator.share({
          title: wallpaper.title || 'Check out this wallpaper',
          text: wallpaper.description || 'Amazing wallpaper I found!',
          url: shareUrl,
        });
        return;
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.log('Native share failed, falling back to clipboard');
        } else {
          return;
        }
      }
    }
    
    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      try {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          setShareStatus('copied');
          setTimeout(() => setShareStatus('idle'), 2000);
        } else {
          alert(`Copy this link to share: ${shareUrl}`);
        }
      } catch (fallbackErr) {
        console.error('All share methods failed:', fallbackErr);
        alert(`Copy this link to share: ${shareUrl}`);
      }
    }
  }, [getShareableUrl, wallpaper.title, wallpaper.description]);

  const handleCopyLink = useCallback(async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(getShareableUrl());
      setCopyLinkStatus('copied');
      setTimeout(() => setCopyLinkStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      try {
        const textArea = document.createElement('textarea');
        textArea.value = getShareableUrl();
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          setCopyLinkStatus('copied');
          setTimeout(() => setCopyLinkStatus('idle'), 2000);
        }
      } catch (fallbackErr) {
        console.error('Copy fallback failed:', fallbackErr);
      }
    }
  }, [getShareableUrl]);

  const handleClose = useCallback((e) => {
    e?.stopPropagation();
    onClose();
    document.body.style.overflow = 'unset';
  }, [onClose]);

  // Reset states when modal opens/closes
  useEffect(() => {
    if (showModal) {
      setShareStatus('idle');
      setCopyLinkStatus('idle');
      setImageError(false);
    }
  }, [showModal]);

  if (!showModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 h-screen bg-black/30 backdrop-blur-lg flex items-center justify-center p-2 sm:p-4 modal-overlay"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-7xl max-h-[85vh] mx-auto bg-black/30 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/10 modal-content overflow-hidden "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30 p-2 bg-black/40 backdrop-blur-md rounded-xl sm:rounded-2xl text-white hover:bg-black/60 transition-all duration-300 shadow-xl hover:scale-110"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row min-h-[85vh] overflow-y-auto lg:overflow-hidden">
          {/* Image Section */}
          <div className="lg:w-2/3 relative flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-black/10 to-black/30 min-h-[40vh] lg:min-h-full">
            {imageError ? (
              <div className="flex items-center justify-center text-white/60 text-center">
                <div>
                  <div className="text-4xl sm:text-6xl mb-4">🖼️</div>
                  <div className="text-lg sm:text-xl font-semibold">Image unavailable</div>
                  <div className="text-xs sm:text-sm text-white/40 mt-2">Failed to load the wallpaper</div>
                </div>
              </div>
            ) : (
              <img
                src={wallpaper.imageUrl}
                alt={wallpaper.title || 'Wallpaper'}
                className="max-w-full max-h-[35vh] lg:max-h-[80vh] object-contain rounded-xl sm:rounded-2xl shadow-2xl"
                onError={handleImageError}
              />
            )}
          </div>

          {/* Details Section */}
          <div className="lg:w-1/3 p-4 sm:p-8 bg-gradient-to-br from-black/20 to-black/40 backdrop-blur-sm lg:overflow-y-auto">
            <div className="mb-6 sm:mb-8">
              {/* User Info */}
              <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                {wallpaper.userDetails?.avatar ? (
                  <Image
                    src={wallpaper.userDetails.avatar}
                    alt={wallpaper.userDetails.username}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl object-cover ring-2 ring-white/20 cursor-pointer flex-shrink-0"
                    onClick={openProfileDirect}
                    width={64}
                    height={64}
                  />
                ) : (
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center ring-2 ring-white/20 cursor-pointer flex-shrink-0"
                       onClick={openProfileDirect}>
                    <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                )}
                 <div className="text-white">
                  <div className="flex items-center gap-3 mt-1 text-white/80">
                    <button
                      onClick={openProfileDirect}
                      className="text-lg font-medium hover:text-blue-400 transition-colors cursor-pointer"
                    >
                      {wallpaper.userDetails?.username || 'Anonymous'}
                    </button>
                    <span>•</span>
                    {/* ✅ USE CUSTOM FOLLOWER COUNT COMPONENT */}
                    <CustomFollowerCount userId={wallpaper.userDetails?._id} />
                  </div>
                  <h2 className="text-lg max-w-[12vw] font-bold line-clamp-2">
                    {wallpaper.title || 'Untitled Wallpaper'}
                  </h2>
                </div>
              </div>

              {/* Description */}
              {wallpaper.description && (
                <div className="text-sm text-gray-200 font-medium mb-4 sm:mb-6">
                  <p className="line-clamp-3">{wallpaper.description}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                <FollowButton
                  userId={wallpaper.userDetails?._id}
                  onUnauthorizedAction={onUnauthorizedAction}
                  className="flex-1 text-sm sm:text-base"
                  size="small"
                />

                <button
                  onClick={onToggleLike}
                  className={`p-2 sm:p-3 rounded-xl transition-all duration-150 hover:scale-110 ${
                    isLiked
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? 'fill-white' : ''}`} />
                </button>

                <button
                  onClick={onToggleSave}
                  className={`p-2 sm:p-3 rounded-xl transition-all duration-150 hover:scale-110 ${
                    isSaved
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 sm:w-5 sm:h-5 ${isSaved ? 'fill-white' : ''}`} />
                </button>

                <button
                  onClick={handleShare}
                  className={`p-2 sm:p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
                    shareStatus === 'copied' 
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' 
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  title={shareStatus === 'copied' ? 'Link copied!' : 'Share wallpaper'}
                >
                  {shareStatus === 'copied' ? (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>

              {/* Download Button */}
              <button
                onClick={onDownload}
                className="w-full py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] flex items-center justify-center gap-2 sm:gap-3"
              >
                <Download className="w-5 h-5 sm:w-6 sm:h-6" />
                Download
              </button>
            </div>

            {/* Direct Link Section */}
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <div className="text-white min-w-0">
                    <div className="font-semibold text-xs sm:text-sm">Direct Link</div>
                    <div className="text-white/60 text-xs hidden sm:block">Share this wallpaper</div>
                  </div>
                </div>
                <button
                  onClick={handleCopyLink}
                  className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg transition-all flex items-center gap-1 flex-shrink-0 ${
                    copyLinkStatus === 'copied'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  {copyLinkStatus === 'copied' ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span className="text-xs">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span className="text-xs">Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-6 sm:mb-8">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 sm:gap-2 text-white/60">
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm">Views</span>
                  </div>
                  <span className="font-bold text-white text-sm sm:text-lg">
                    {viewCount?.toLocaleString() || '0'}
                  </span>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 sm:gap-2 text-white/60">
                    <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm">Downloads</span>
                  </div>
                  <span className="font-bold text-white text-sm sm:text-lg">
                    {downloadCount?.toLocaleString() || '0'}
                  </span>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 sm:gap-2 text-white/60">
                    <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm">Likes</span>
                  </div>
                  <span className="font-bold text-white text-sm sm:text-lg">
                    {likeCount?.toLocaleString() || '0'}
                  </span>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 sm:gap-2 text-white/60">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm">Published</span>
                  </div>
                  <span className="font-bold text-white text-xs sm:text-sm">
                    {new Date(wallpaper.createdAt || Date.now()).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Tags Section */}
            {wallpaper.tags && wallpaper.tags.filter(tag => tag && tag.trim()).length > 0 && (
              <div className="mb-6 sm:mb-8">
                <h3 className="text-white font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                  <span>Tags</span>
                  <div className="w-6 sm:w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
                </h3>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {wallpaper.tags.filter(tag => tag && tag.trim()).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white/90 rounded-lg sm:rounded-xl hover:bg-white/20 transition-all cursor-pointer border border-white/20 backdrop-blur-sm text-xs sm:text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* License Info */}
            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <div className="text-emerald-300 font-bold text-sm sm:text-base">Free to Use</div>
              </div>
              <p className="text-emerald-200/80 text-xs sm:text-sm">
                Commercial & Personal use allowed. No attribution required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};