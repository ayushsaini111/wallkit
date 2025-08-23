// WallpaperModal.js - Fixed with Real Follower Count and Mobile Scroll

'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FollowButton, useFollow, FollowerCount } from '@/components/FollowSystem';
import { useDownloadHandler } from '@/components/wallpaperCard/useDownloadHandler';
import  DownloadOptionsModal  from '@/components/wallpaperCard/DownloadOptionsModal';
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
  Loader,
  ChevronDown,
  Settings
} from 'lucide-react';
import Image from 'next/image';

// ✅ ENHANCED FOLLOWER COUNT COMPONENT - Uses real follower count with instant updates
const CustomFollowerCount = ({ wallpaper, className = "" }) => {
  // Get initial follower count from wallpaper data
  const initialFollowerCount = wallpaper?.userDetails?.followerCount || wallpaper?.followerCount || 0;
  
  // Use the enhanced useFollow hook with real-time updates
  const { followerCount } = useFollow(wallpaper?.userDetails?._id, initialFollowerCount);

  return (
    <div className={`flex items-center gap-1 text-gray-600 ${className}`}>
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
      <Loader className={`${sizeClasses[size]} animate-spin text-gray-500`} />
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
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

  // Enhanced download handler - DEFAULT TO ORIGINAL
  const {
    handleDownload,
    quickDownload,
    customDownload,
    isDownloading,
    storageType
  } = useDownloadHandler(wallpaper);

  const openProfileDirect = useCallback((e) => {
    e?.stopPropagation();
    const username = wallpaper.userDetails?.username;
    if (!username) return;
    router.push(`/profile/${username}`);
  }, [wallpaper.userDetails?.username, router]);

  const getShareableUrl = useCallback(() => {
    const url = `${window.location.origin}/?wallpaper=${wallpaper._id}`;
    
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
      alert(`Copy this link to share: ${shareUrl}`);
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
    }
  }, [getShareableUrl]);

  // DEFAULT to original quality download
  const handleQuickDownload = useCallback((e) => {
    e?.stopPropagation();
    handleDownload('original', 'jpg');
  }, [handleDownload]);

  const handleAdvancedDownload = useCallback((preset, format, filename, dimensions) => {
    if (preset === 'custom' && dimensions) {
      customDownload(dimensions.width, dimensions.height, format, filename);
    } else {
      handleDownload(preset, format, filename);
    }
  }, [handleDownload, customDownload]);

  const openDownloadOptions = useCallback((e) => {
    e?.stopPropagation();
    setShowDownloadOptions(true);
  }, []);

  // ✅ ENHANCED CLOSE FUNCTION
  const handleClose = useCallback((e) => {
    e?.stopPropagation();
    
    setIsClosing(true);
    
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        const url = new URL(window.location);
        url.searchParams.delete('wallpaper');
        window.history.replaceState(null, '', url.toString());
      }
      
      onClose();
      document.body.style.overflow = 'unset';
      setIsClosing(false);
    }, 150);
  }, [onClose]);

  // ✅ Update URL when modal opens
  useEffect(() => {
    if (showModal && wallpaper?._id) {
      const url = new URL(window.location);
      url.searchParams.set('wallpaper', wallpaper._id);
      window.history.replaceState(null, '', url.toString());
    }
    
    return () => {
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

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose(e);
      }
    };

    const handlePopState = (e) => {
      e.preventDefault();
      handleClose(e);
    };

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handlePopState);
    
    window.history.pushState({ modalOpen: true }, '', window.location.href);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
      document.body.style.overflow = 'unset';
      
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
      setShowDownloadOptions(false);
    }
  }, [showModal]);

  if (!showModal) return null;

  return (
    <>
      {/* ✅ BACKDROP */}
      <div
        className={`fixed inset-0 z-[9999] bg-black/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
        style={{ height: '100vh', minHeight: '110dvh' }}
      >
        <div
          className={`w-full h-full max-w-none max-h-none sm:w-[95vw] sm:h-[90vh] sm:max-w-7xl sm:max-h-[90vh] bg-white/95 backdrop-blur-md sm:rounded-2xl lg:rounded-3xl shadow-2xl border-0 sm:border sm:border-gray-200 overflow-hidden transition-all duration-300 ${
            isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ✅ ENHANCED HEADER */}
          <div className="relative z-30">
            {/* Mobile Header */}
            <div className="flex sm:hidden items-center justify-between p-3 bg-white/90 backdrop-blur-md border-b border-gray-200">
              <button
                onClick={handleClose}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 active:scale-95"
              >
                <ArrowLeft className="w-4 h-4 text-gray-700" />
                <span className="text-gray-700 text-sm font-medium">Back</span>
              </button>
              <h3 className="text-gray-900 font-semibold text-sm truncate max-w-[60%]">
                {wallpaper.title || 'Wallpaper'}
              </h3>
              <div className="w-16"></div>
            </div>

            {/* Desktop Close Button */}
            <button
              onClick={handleClose}
              className="hidden sm:block absolute top-4 right-4 lg:top-6 lg:right-6 z-30 p-2 lg:p-2 bg-white/90 backdrop-blur-md rounded-xl lg:rounded-xl text-gray-700 hover:bg-white hover:text-red-600 transition-all duration-100 shadow-lg hover:scale-110 active:scale-95 border border-gray-200"
            >
              <X className="w-5 h-5 lg:w-5 lg:h-5" />
            </button>
          </div>

          {/* ✅ MOBILE SCROLLABLE CONTENT - FIXED MOBILE VIEW */}
          <div className="flex flex-col h-[calc(100%-57px)] sm:h-full sm:flex-row overflow-hidden">
            {/* ✅ IMAGE SECTION - MOBILE RESPONSIVE */}
            <div className="w-full sm:w-2/3 lg:w-2/3 relative flex items-center justify-center xs:p-3 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-50/80 to-gray-100/80 backdrop-blur-sm h-[45vh] xs:h-[40vh] sm:h-full overflow-hidden flex-shrink-0">
              
              {/* Loading State */}
              {imageLoading && !imageError && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                  <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <div className="text-gray-600 text-sm mt-3">Loading wallpaper...</div>
                  </div>
                </div>
              )}

              {/* Error State */}
              {imageError ? (
                <div className="flex items-center justify-center text-gray-500 text-center">
                  <div>
                    <div className="text-2xl xs:text-3xl sm:text-4xl lg:text-6xl mb-2 sm:mb-4">🖼️</div>
                    <div className="text-sm xs:text-base sm:text-lg lg:text-xl font-semibold">Image unavailable</div>
                    <div className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2">Failed to load the wallpaper</div>
                  </div>
                </div>
              ) : (
         <div className="relative w-full h-full">
  <Image
    src={wallpaper.compressedUrl || wallpaper.imageUrl}
    alt={wallpaper.title || 'Wallpaper'}
    fill
    className={`object-contain rounded-lg sm:rounded-xl lg:rounded-2xl shadow-2xl transition-opacity duration-300 ${
      imageLoading ? 'opacity-0' : 'opacity-100'
    }`}
    onLoad={handleImageLoad}
    onError={handleImageError}
    loading="eager"
    sizes="100vw"
  />
</div>

              )}
            </div>

            {/* ✅ DETAILS SECTION - MOBILE SCROLLABLE */}
            <div className="w-full sm:w-1/3 lg:w-1/3 flex flex-col bg-white/90 backdrop-blur-md h-[65vh] xs:h-[60vh] sm:h-full border-t sm:border-t-0 sm:border-l border-gray-200 flex-shrink-0 overflow-hidden">
              
              {/* Fixed Header Section */}
              <div className="flex-shrink-0 p-3 xs:p-4 sm:p-6 lg:p-8 pb-2">
                {/* ✅ USER INFO - WITH REAL FOLLOWER COUNT */}
                <div className="flex items-start gap-2 xs:gap-3 sm:gap-4">
                  {wallpaper.userDetails?.avatar ? (
                    <Image
                      src={wallpaper.userDetails.avatar}
                      alt={wallpaper.userDetails.username}
                      className="w-8 h-8 xs:w-10 xs:h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-lg xs:rounded-xl sm:rounded-2xl object-cover ring-1 xs:ring-2 ring-gray-200 cursor-pointer flex-shrink-0 hover:ring-blue-400 transition-all"
                      onClick={openProfileDirect}
                      width={64}
                      height={64}
                    />
                  ) : (
                    <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-lg xs:rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center ring-1 xs:ring-2 ring-gray-200 cursor-pointer flex-shrink-0 hover:ring-blue-400 transition-all"
                         onClick={openProfileDirect}>
                      <User className="w-3 h-3 xs:w-4 xs:h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
                    </div>
                  )}
                  <div className="text-gray-900 min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-gray-700 flex-wrap">
                      <button
                        onClick={openProfileDirect}
                        className="text-xs xs:text-sm sm:text-lg font-medium hover:text-blue-600 transition-colors cursor-pointer truncate"
                      >
                        {wallpaper.userDetails?.username || 'Anonymous'}
                      </button>
                      <span className="text-xs">•</span>
                      <CustomFollowerCount wallpaper={wallpaper} />
                    </div>
                    <h2 className="text-xs xs:text-sm sm:text-lg font-bold line-clamp-2 mt-0.5 xs:mt-1">
                      {wallpaper.title || 'Untitled Wallpaper'}
                    </h2>
                  </div>
                </div>
              </div>

              {/* ✅ SCROLLABLE CONTENT AREA - MOBILE OPTIMIZED */}
              <div className="flex-1 overflow-y-auto h-[30vh] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent px-3 xs:px-4 sm:px-6 lg:px-8 pb-3 xs:pb-4 sm:pb-6 lg:pb-8" style={{
                WebkitOverflowScrolling: 'touch',
                scrollBehavior: 'smooth'
              }}>
                <div className="space-y-3 xs:space-y-4 sm:space-y-4 lg:space-y-6">

                  {/* ✅ DESCRIPTION */}
                  {wallpaper.description && (
                    <div className="text-xs text-gray-600 font-medium">
                      <p className="line-clamp-2 xs:line-clamp-3">{wallpaper.description}</p>
                    </div>
                  )}

                  {/* ✅ MAIN ACTION BUTTONS */}
                  <div className="flex items-center gap-2">
                    <FollowButton
                      userId={wallpaper.userDetails?._id}
                      onUnauthorizedAction={onUnauthorizedAction}
                      className="flex-1 text-xs sm:text-base h-9 xs:h-10"
                      size="small"
                      initialFollowerCount={wallpaper?.userDetails?.followerCount || wallpaper?.followerCount || 0}
                    />

                    <button
                      onClick={onToggleLike}
                      className={`p-2 xs:p-2.5 sm:p-3 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 border ${
                        isLiked
                          ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/30'
                          : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? 'fill-white' : ''}`} />
                    </button>

                    <button
                      onClick={onToggleSave}
                      className={`p-2 xs:p-2.5 sm:p-3 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 border ${
                        isSaved
                          ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/30'
                          : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 sm:w-5 sm:h-5 ${isSaved ? 'fill-white' : ''}`} />
                    </button>

                    <button
                      onClick={handleShare}
                      className={`p-2 xs:p-2.5 sm:p-3 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 border ${
                        shareStatus === 'copied' 
                          ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/30' 
                          : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
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

                  {/* ✅ ENHANCED DOWNLOAD BUTTONS - DEFAULT ORIGINAL + FREE */}
                  <div className="space-y-2">
                    {/* Quick Download - Original Quality */}
                    <button
                      onClick={handleQuickDownload}
                      disabled={isDownloading}
                      className="w-full py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm sm:text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-2"
                    >
                      {isDownloading ? (
                        <>
                          <div className="w-4 h-4 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 sm:w-6 sm:h-6" />
                          Free Download 
                        </>
                      )}
                    </button>

                    {/* Advanced Download Options */}
                    <button
                      onClick={openDownloadOptions}
                      className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 border border-gray-200"
                    >
                      <Settings className="w-4 h-4" />
                      Download Options
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* ✅ STATS GRID */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50/80 backdrop-blur-sm rounded-lg p-2 xs:p-3 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Eye className="w-3 h-3" />
                          <span className="text-xs">Views</span>
                        </div>
                        <span className="font-bold text-gray-900 text-xs xs:text-sm">
                          {viewCount?.toLocaleString() || '0'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50/80 backdrop-blur-sm rounded-lg p-2 xs:p-3 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Download className="w-3 h-3" />
                          <span className="text-xs">Downloads</span>
                        </div>
                        <span className="font-bold text-gray-900 text-xs xs:text-sm">
                          {downloadCount?.toLocaleString() || '0'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50/80 backdrop-blur-sm rounded-lg p-2 xs:p-3 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Heart className="w-3 h-3" />
                          <span className="text-xs">Likes</span>
                        </div>
                        <span className="font-bold text-gray-900 text-xs xs:text-sm">
                          {likeCount?.toLocaleString() || '0'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50/80 backdrop-blur-sm rounded-lg p-2 xs:p-3 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar className="w-3 h-3" />
                          <span className="text-xs">Date</span>
                        </div>
                        <span className="font-bold text-gray-900 text-xs">
                          {new Date(wallpaper.createdAt || Date.now()).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ✅ DIRECT LINK */}
                  <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-sm border border-blue-200 rounded-lg p-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-md flex items-center justify-center flex-shrink-0">
                          <ExternalLink className="w-3 h-3 text-white" />
                        </div>
                        <div className="text-gray-900 min-w-0">
                          <div className="font-semibold text-xs">Direct Link</div>
                          <div className="text-gray-600 text-[10px] hidden xs:block">Share this wallpaper</div>
                        </div>
                      </div>
                      <button
                        onClick={handleCopyLink}
                        className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 flex-shrink-0 text-xs border ${
                          copyLinkStatus === 'copied'
                            ? 'bg-green-100 border-green-200 text-green-700'
                            : 'bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-gray-50 text-gray-700'
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

                  {/* ✅ TAGS */}
                  {wallpaper.tags && wallpaper.tags.filter(tag => tag && tag.trim()).length > 0 && (
                    <div>
                      <h3 className="text-gray-900 font-semibold mb-2 flex items-center gap-2 text-xs sm:text-sm">
                        <span>Tags</span>
                        <div className="w-6 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {wallpaper.tags.filter(tag => tag && tag.trim()).slice(0, 6).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100/80 backdrop-blur-sm text-gray-700 rounded-md hover:bg-gray-200 transition-all cursor-pointer border border-gray-200 text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ ENHANCED SCROLLBAR STYLES */}
        <style jsx>{`
          .scrollbar-thin {
            scrollbar-width: thin;
            scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
          }
          
          .scrollbar-thin::-webkit-scrollbar {
            width: 4px;
          }
          
          .scrollbar-thin::-webkit-scrollbar-track {
            background: transparent;
          }
          
          .scrollbar-thin::-webkit-scrollbar-thumb {
            background-color: rgba(156, 163, 175, 0.5);
            border-radius: 2px;
          }
          
          .scrollbar-thin::-webkit-scrollbar-thumb:hover {
            background-color: rgba(107, 114, 128, 0.7);
          }

          /* iOS momentum scrolling */
          .scrollbar-thin {
            -webkit-overflow-scrolling: touch;
          }
          
          /* Mobile scroll improvements */
          @media (max-width: 640px) {
            .scrollbar-thin {
              overflow-y: scroll;
              scroll-behavior: smooth;
            }
          }
        `}</style>
      </div>

      {/* ✅ DOWNLOAD OPTIONS MODAL */}
      <DownloadOptionsModal
        isOpen={showDownloadOptions}
        onClose={() => setShowDownloadOptions(false)}
        onDownload={handleAdvancedDownload}
        wallpaper={wallpaper}
        isDownloading={isDownloading}
      />
    </>
  );
};