// WallpaperModal.js - Mobile optimized: removed overlay icons, improved loading, better responsive design

'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FollowButton, useFollow } from '@/components/FollowSystem';
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
  Users,
  ArrowLeft,
  Loader
} from 'lucide-react';
import Image from 'next/image';

// ✅ SIMPLIFIED FOLLOWER COUNT COMPONENT - using useFollow hook like ProfilePage
const CustomFollowerCount = ({ userId, className = "" }) => {
  const { followerCount } = useFollow(userId);

  if (!userId) {
    return (
      <div className={`flex items-center gap-1 text-white/60 ${className}`}>
        <span className="text-[10px] xs:text-xs sm:text-sm">0</span>
        <span className="text-[10px] xs:text-xs sm:text-sm">followers</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 text-white/60 ${className}`}>
      <span className="text-[10px] xs:text-xs sm:text-sm">
        {followerCount.toLocaleString()}
      </span>
      <span className="text-[10px] xs:text-xs sm:text-sm">followers</span>
    </div>
  );
};

// ✅ LOADING SPINNER COMPONENT
const LoadingSpinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className="flex items-center justify-center">
      <Loader className={`${sizeClasses[size]} animate-spin text-white/60`} />
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
  const [imageLoading, setImageLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  const openProfileDirect = useCallback((e) => {
    e?.stopPropagation();
    const username = wallpaper.userDetails?.username;
    if (!username) return;
    router.push(`/profile/${username}`);
  }, [wallpaper.userDetails?.username, router]);

  const getShareableUrl = useCallback(() => {
    // ✅ Use query parameter format
    const url = `${window.location.origin}/?wallpaper=${wallpaper._id}`;
    
    // Update browser URL without page reload
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', url);
    }
    
    return url;
  }, [wallpaper._id]);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoading(false);
  }, []);

  const handleShare = useCallback(async (e) => {
    e?.stopPropagation();
    const shareUrl = getShareableUrl();
    
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

  // ✅ ENHANCED CLOSE FUNCTION - handles back navigation properly
  const handleClose = useCallback((e) => {
    e?.stopPropagation();
    
    // ✅ Remove wallpaper query parameter when closing
    if (typeof window !== 'undefined') {
      const url = new URL(window.location);
      url.searchParams.delete('wallpaper');
      window.history.replaceState(null, '', url.toString());
    }
    
    onClose();
    document.body.style.overflow = 'unset';
  }, [onClose]);

  // ✅ Update URL when modal opens with query parameter
  useEffect(() => {
    if (showModal && wallpaper?._id) {
      const url = new URL(window.location);
      url.searchParams.set('wallpaper', wallpaper._id);
      window.history.replaceState(null, '', url.toString());
    }
    
    return () => {
      // Clean up URL when component unmounts
      if (typeof window !== 'undefined') {
        const url = new URL(window.location);
        url.searchParams.delete('wallpaper');
        window.history.replaceState(null, '', url.toString());
      }
    };
  }, [showModal, wallpaper?._id]);

  // ✅ HANDLE BACK BUTTON AND ESCAPE KEY
  useEffect(() => {
    if (!showModal) return;

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    // Handle escape key
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    // Handle browser back button
    const handlePopState = (e) => {
      e.preventDefault();
      handleClose();
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handlePopState);
    
    // Push a new state to handle back button
    window.history.pushState({ modalOpen: true }, '', window.location.href);

    return () => {
      // Clean up
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
      document.body.style.overflow = 'unset';
      
      // Go back in history if we pushed a state
      if (window.history.state?.modalOpen) {
        window.history.back();
      }
    };
  }, [showModal, handleClose]);

  // Reset states when modal opens/closes
  useEffect(() => {
    if (showModal) {
      setShareStatus('idle');
      setCopyLinkStatus('idle');
      setImageError(false);
      setImageLoading(true);
      setIsClosing(false);
    }
  }, [showModal]);

  if (!showModal) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleClose}
      style={{ height: '100vh', minHeight: '100dvh' }} // Support for dynamic viewport height
    >
      <div
        className={`w-full h-full max-w-none max-h-none sm:w-[95vw] sm:h-[90vh] sm:max-w-7xl sm:max-h-[90vh] bg-black/10 backdrop-blur-sm sm:rounded-2xl lg:rounded-3xl shadow-2xl border-0 sm:border sm:border-white/10 overflow-hidden transition-all duration-300 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ✅ ENHANCED HEADER - responsive close buttons */}
        <div className="relative z-30">
          {/* Mobile Header */}
          <div className="flex sm:hidden items-center justify-between p-3 bg-black/70 backdrop-blur-md border-b border-white/10">
            <button
              onClick={handleClose}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium">Back</span>
            </button>
            <h3 className="text-white font-semibold text-sm truncate max-w-[60%]">
              {wallpaper.title || 'Wallpaper'}
            </h3>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>

          {/* Desktop Close Button */}
          <button
            onClick={handleClose}
            className="hidden sm:block absolute top-4 right-4 lg:top-6 lg:right-6 z-30 p-2 lg:p-3 bg-black/60 backdrop-blur-md rounded-xl lg:rounded-2xl text-white hover:bg-black/80 transition-all duration-300 shadow-xl hover:scale-110 active:scale-95"
          >
            <X className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
        </div>

        {/* ✅ RESPONSIVE CONTENT - NO OVERLAY ICONS ON MOBILE */}
        <div className="flex flex-col lg:flex-row h-[calc(100%-57px)] sm:h-full overflow-hidden">
          {/* ✅ IMAGE SECTION - Clean on mobile, no overlay icons */}
          <div className="lg:w-2/3 relative flex items-center justify-center p-2 xs:p-3 sm:p-6 lg:p-8 bg-gradient-to-br from-black/10 to-black/30 h-[60vh] xs:h-[65vh] sm:h-[50vh] lg:h-full overflow-hidden">
            {/* ✅ LOADING STATE */}
            {imageLoading && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                <div className="text-center">
                  <LoadingSpinner size="lg" />
                  <div className="text-white/60 text-sm mt-3">Loading wallpaper...</div>
                </div>
              </div>
            )}

            {/* ✅ ERROR STATE */}
            {imageError ? (
              <div className="flex items-center justify-center text-white/60 text-center">
                <div>
                  <div className="text-2xl xs:text-3xl sm:text-4xl lg:text-6xl mb-2 sm:mb-4">🖼️</div>
                  <div className="text-sm xs:text-base sm:text-lg lg:text-xl font-semibold">Image unavailable</div>
                  <div className="text-xs sm:text-sm text-white/40 mt-1 sm:mt-2">Failed to load the wallpaper</div>
                </div>
              </div>
            ) : (
              <img
                src={wallpaper.imageUrl}
                alt={wallpaper.title || 'Wallpaper'}
                className={`max-w-full max-h-full object-contain rounded-lg sm:rounded-xl lg:rounded-2xl shadow-2xl transition-opacity duration-300 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                loading="eager"
              />
            )}

            {/* ✅ DESKTOP ONLY - Quick action overlay (hidden on mobile) */}
            <div className="hidden lg:flex absolute top-4 left-4 gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={onToggleLike}
                className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 backdrop-blur-md ${
                  isLiked
                    ? 'bg-red-500/80 text-white shadow-lg'
                    : 'bg-black/50 text-white hover:bg-black/70'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
              </button>
              
              <button
                onClick={onToggleSave}
                className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 backdrop-blur-md ${
                  isSaved
                    ? 'bg-blue-500/80 text-white shadow-lg'
                    : 'bg-black/50 text-white hover:bg-black/70'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
              </button>
            </div>
          </div>

          {/* ✅ DETAILS SECTION - All actions moved here for mobile */}
          <div className="lg:w-1/3 p-3 xs:p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-black/20 to-black/40 backdrop-blur-sm h-[40vh] xs:h-[35vh] sm:h-[50vh] lg:h-full overflow-y-auto scrollbar-hide">
            <div className="space-y-3 xs:space-y-4 sm:space-y-6 lg:space-y-8">
              {/* ✅ USER INFO - More compact on mobile */}
              <div className="flex items-start gap-2 xs:gap-3 sm:gap-4">
                {wallpaper.userDetails?.avatar ? (
                  <Image
                    src={wallpaper.userDetails.avatar}
                    alt={wallpaper.userDetails.username}
                    className="w-8 h-8 xs:w-10 xs:h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-lg xs:rounded-xl sm:rounded-2xl object-cover ring-1 xs:ring-2 ring-white/20 cursor-pointer flex-shrink-0 hover:ring-blue-400/50 transition-all"
                    onClick={openProfileDirect}
                    width={64}
                    height={64}
                  />
                ) : (
                  <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-lg xs:rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center ring-1 xs:ring-2 ring-white/20 cursor-pointer flex-shrink-0 hover:ring-blue-400/50 transition-all"
                       onClick={openProfileDirect}>
                    <User className="w-3 h-3 xs:w-4 xs:h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
                  </div>
                )}
                <div className="text-white min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-white/80 flex-wrap">
                    <button
                      onClick={openProfileDirect}
                      className="text-xs xs:text-sm sm:text-lg font-medium hover:text-blue-400 transition-colors cursor-pointer truncate"
                    >
                      {wallpaper.userDetails?.username || 'Anonymous'}
                    </button>
                    <span className="text-xs">•</span>
                    <CustomFollowerCount userId={wallpaper.userDetails?._id} />
                  </div>
                  <h2 className="text-xs xs:text-sm sm:text-lg font-bold line-clamp-2 mt-0.5 xs:mt-1">
                    {wallpaper.title || 'Untitled Wallpaper'}
                  </h2>
                </div>
              </div>

              {/* ✅ DESCRIPTION - Compact */}
              {wallpaper.description && (
                <div className="text-xs text-gray-200 font-medium">
                  <p className="line-clamp-2 xs:line-clamp-3">{wallpaper.description}</p>
                </div>
              )}

              {/* ✅ MAIN ACTION BUTTONS - Prominent on mobile */}
              <div className="flex items-center gap-2">
                <FollowButton
                  userId={wallpaper.userDetails?._id}
                  onUnauthorizedAction={onUnauthorizedAction}
                  className="flex-1 text-xs sm:text-base h-9 xs:h-10"
                  size="small"
                />

                <button
                  onClick={onToggleLike}
                  className={`p-2 xs:p-2.5 sm:p-3 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${
                    isLiked
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? 'fill-white' : ''}`} />
                </button>

                <button
                  onClick={onToggleSave}
                  className={`p-2 xs:p-2.5 sm:p-3 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${
                    isSaved
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 sm:w-5 sm:h-5 ${isSaved ? 'fill-white' : ''}`} />
                </button>

                <button
                  onClick={handleShare}
                  className={`p-2 xs:p-2.5 sm:p-3 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${
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

              {/* ✅ DOWNLOAD BUTTON - More prominent */}
              <button
                onClick={onDownload}
                className="w-full py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold text-sm sm:text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 sm:w-6 sm:h-6" />
                Download
              </button>

              {/* ✅ STATS GRID - Compact on mobile */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-2 xs:p-3 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-white/60">
                      <Eye className="w-3 h-3" />
                      <span className="text-xs">Views</span>
                    </div>
                    <span className="font-bold text-white text-xs xs:text-sm">
                      {viewCount?.toLocaleString() || '0'}
                    </span>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-2 xs:p-3 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-white/60">
                      <Download className="w-3 h-3" />
                      <span className="text-xs">Downloads</span>
                    </div>
                    <span className="font-bold text-white text-xs xs:text-sm">
                      {downloadCount?.toLocaleString() || '0'}
                    </span>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-2 xs:p-3 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-white/60">
                      <Heart className="w-3 h-3" />
                      <span className="text-xs">Likes</span>
                    </div>
                    <span className="font-bold text-white text-xs xs:text-sm">
                      {likeCount?.toLocaleString() || '0'}
                    </span>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-2 xs:p-3 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-white/60">
                      <Calendar className="w-3 h-3" />
                      <span className="text-xs">Date</span>
                    </div>
                    <span className="font-bold text-white text-xs">
                      {new Date(wallpaper.createdAt || Date.now()).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* ✅ DIRECT LINK - Compact */}
              <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-md flex items-center justify-center flex-shrink-0">
                      <ExternalLink className="w-3 h-3 text-white" />
                    </div>
                    <div className="text-white min-w-0">
                      <div className="font-semibold text-xs">Direct Link</div>
                      <div className="text-white/60 text-[10px] hidden xs:block">Share this wallpaper</div>
                    </div>
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 flex-shrink-0 text-xs ${
                      copyLinkStatus === 'copied'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {copyLinkStatus === 'copied' ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span className="hidden xs:inline">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span className="hidden xs:inline">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* ✅ TAGS - Compact */}
              {wallpaper.tags && wallpaper.tags.filter(tag => tag && tag.trim()).length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-2 flex items-center gap-2 text-xs sm:text-sm">
                    <span>Tags</span>
                    <div className="w-6 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {wallpaper.tags.filter(tag => tag && tag.trim()).slice(0, 6).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white/90 rounded-md hover:bg-white/20 transition-all cursor-pointer border border-white/20 backdrop-blur-sm text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ✅ LICENSE INFO - Compact */}
              <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-lg p-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-md flex items-center justify-center">
                    <Star className="w-2.5 h-2.5 text-white" />
                  </div>
                  <div className="text-emerald-300 font-bold text-xs">Free to Use</div>
                </div>
                <p className="text-emerald-200/80 text-xs">
                  Commercial & Personal use allowed. No attribution required.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ CUSTOM SCROLLBAR HIDE STYLES */}
      <style jsx>{`
        .scrollbar-hide {
          /* Hide scrollbar for Chrome, Safari and Opera */
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* Internet Explorer 10+ */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none; /* Safari and Chrome */
        }
      `}</style>
    </div>
  );
};