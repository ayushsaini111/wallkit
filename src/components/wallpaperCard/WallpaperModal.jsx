'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FollowButton, useFollow, FollowerCount } from '@/components/FollowSystem';
import { useDownloadHandler } from '@/components/wallpaperCard/useDownloadHandler';
import DownloadOptionsModal from '@/components/wallpaperCard/DownloadOptionsModal';
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

// Enhanced Follower Count Component
const CustomFollowerCount = ({ wallpaper, className = "" }) => {
  const initialFollowerCount = wallpaper?.userDetails?.followerCount || wallpaper?.followerCount || 0;
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

  // Enhanced download handler
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

  // Updated: Create clean shareable URL without query parameters
  const getShareableUrl = useCallback(() => {
    const url = `${window.location.origin}/wallpaper/${wallpaper._id}`;
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

  // Default to original quality download
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

  // Updated: Enhanced close function for clean URLs
  const handleClose = useCallback((e) => {
    e?.stopPropagation();

    setIsClosing(true);

    // Immediately restore body scroll
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';

    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 150);
  }, [onClose]);

  // Handle back button and escape key
  useEffect(() => {
    if (!showModal) return;

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';

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

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
      
      // Restore body scroll
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
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
      {/* Enhanced backdrop with blur */}
      <div
        className={`fixed inset-0 z-[9999] bg-black/30 backdrop-blur-md flex transition-all duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
        style={{ 
          height: '100vh', 
          minHeight: '110dvh',
          WebkitBackdropFilter: 'blur(8px)',
          backdropFilter: 'blur(8px)'
        }}
      >
        {/* Modal container */}
        <div
          className={`w-full h-full sm:w-[95vw] sm:h-[90vh] sm:max-w-7xl sm:max-h-[88vh] sm:m-auto bg-white/95 backdrop-blur-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl border-0 sm:border sm:border-gray-200/50 overflow-hidden transition-all duration-300 ${
            isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
          }`}
          onClick={(e) => e.stopPropagation()}
          style={{
            WebkitBackdropFilter: 'blur(20px)',
            backdropFilter: 'blur(20px)'
          }}
        >
          {/* Enhanced header */}
          <div className="relative z-30">
            {/* Mobile Header */}
            <div className="flex sm:hidden items-center justify-between p-3 bg-white/90 backdrop-blur-xl border-b border-gray-200/50">
              <button
                onClick={handleClose}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100/80 hover:bg-gray-200/80 rounded-xl transition-all duration-200 active:scale-95 backdrop-blur-sm"
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
              className="hidden sm:block absolute top-4 right-4 lg:top-6 lg:right-6 z-30 p-2 lg:p-2 bg-white/90 backdrop-blur-xl rounded-xl text-gray-700 hover:bg-white hover:text-red-600 transition-all duration-200 shadow-lg hover:scale-110 active:scale-95 border border-gray-200/50"
            >
              <X className="w-5 h-5 lg:w-5 lg:h-5" />
            </button>
          </div>

          {/* Rest of the modal content remains the same */}
          <div className="flex flex-col h-[calc(100%-57px)] sm:h-full sm:flex-row overflow-hidden">
            {/* Image section */}
            <div className="w-full sm:w-2/3 lg:w-2/3 relative flex items-center justify-center bg-gradient-to-br from-gray-50/80 to-gray-100/80 backdrop-blur-sm overflow-hidden sm:overflow-visible">
              <div 
                className="mobile-smooth-scroll w-full h-full sm:h-auto flex flex-col sm:block overflow-y-auto sm:overflow-visible"
                style={{ 
                  height: 'calc(100vh - 57px)',
                  minHeight: 'calc(100vh - 57px)'
                }}
              >
                <div className="flex-shrink-0 w-full h-[45vh] sm:h-full sm:min-h-0 relative flex items-center justify-center sm:p-0">
                  {imageError ? (
                    <div className="flex items-center justify-center text-gray-500 text-center">
                      <div>
                        <div className="text-2xl xs:text-3xl sm:text-4xl lg:text-6xl mb-2 sm:mb-4">🖼️</div>
                        <div className="text-sm xs:text-base sm:text-lg lg:text-xl font-semibold">Image unavailable</div>
                        <div className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2">Failed to load the wallpaper</div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full h-full max-w-none max-h-none">
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

                {/* Mobile details section */}
                <div className="sm:hidden flex-1 bg-white/95 backdrop-blur-xl border-t border-gray-200/50 min-h-[55vh] mobile-content-scroll">
                  <div className="mobile-scroll-header flex-shrink-0 p-4 pb-2 bg-white/95 backdrop-blur-xl sticky top-0 z-10 border-b border-gray-100/50">
                    <div className="flex items-start gap-3">
                      {wallpaper.userDetails?.avatar ? (
                        <Image
                          src={wallpaper.userDetails.avatar}
                          alt={wallpaper.userDetails.username}
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-gray-200 cursor-pointer flex-shrink-0 hover:ring-blue-400 transition-all"
                          onClick={openProfileDirect}
                          width={40}
                          height={40}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center ring-2 ring-gray-200 cursor-pointer flex-shrink-0 hover:ring-blue-400 transition-all"
                             onClick={openProfileDirect}>
                          <User className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div className="text-gray-900 min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-gray-700 flex-wrap">
                          <button
                            onClick={openProfileDirect}
                            className="text-sm font-medium hover:text-blue-600 transition-colors cursor-pointer truncate"
                          >
                            {wallpaper.userDetails?.username || 'Anonymous'}
                          </button>
                          <span className="text-xs">•</span>
                          <CustomFollowerCount wallpaper={wallpaper} />
                        </div>
                        <h2 className="text-sm font-bold line-clamp-2 mt-1">
                          {wallpaper.title || 'Untitled Wallpaper'}
                        </h2>
                      </div>
                    </div>
                  </div>

                  <div className="mobile-scroll-content px-4 pb-8 space-y-4 overflow-y-auto">
                    {/* Description */}
                    {wallpaper.description && (
                      <div className="text-xs text-gray-600 font-medium p-3 bg-gray-50/80 rounded-lg border border-gray-200/50">
                        <p className="line-clamp-3">{wallpaper.description}</p>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      <FollowButton
                        userId={wallpaper.userDetails?._id}
                        onUnauthorizedAction={onUnauthorizedAction}
                        className="flex-1 text-xs h-9"
                        size="small"
                        initialFollowerCount={wallpaper?.userDetails?.followerCount || wallpaper?.followerCount || 0}
                      />

                      <button
                        onClick={onToggleLike}
                        className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 border ${
                          isLiked
                            ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/30'
                            : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
                      </button>

                      <button
                        onClick={onToggleSave}
                        className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 border ${
                          isSaved
                            ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/30'
                            : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
                      </button>

                      <button
                        onClick={handleShare}
                        className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 border ${
                          shareStatus === 'copied'
                            ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/30'
                            : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {shareStatus === 'copied' ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Share2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Download buttons */}
                    <div className="space-y-2">
                      <button
                        onClick={handleQuickDownload}
                        disabled={isDownloading}
                        className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-2"
                      >
                        {isDownloading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            Download
                          </>
                        )}
                      </button>

                      <button
                        onClick={openDownloadOptions}
                        className="w-full py-2.5 bg-gray-100/80 hover:bg-gray-200/80 text-gray-700 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 border border-gray-200 backdrop-blur-sm"
                      >
                        <Settings className="w-4 h-4" />
                        Download Options
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Updated: Direct link section with clean URL */}
                    <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-sm border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-md flex items-center justify-center flex-shrink-0">
                            <ExternalLink className="w-3 h-3 text-white" />
                          </div>
                          <div className="text-gray-900 min-w-0">
                            <div className="font-semibold text-xs">Direct Link</div>
                            <div className="text-gray-600 text-[10px] truncate">
                              /wallpaper/{wallpaper._id}
                            </div>
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
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Stats, tags, and other content remain the same */}
                    {/* ... */}

                    <div className="h-16"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Details Section remains the same */}
            {/* ... */}
          </div>
        </div>

        {/* Same mobile scrolling styles */}
        <style jsx>{`
          @media (max-width: 640px) {
            .mobile-smooth-scroll {
              -webkit-overflow-scrolling: touch;
              overflow-scrolling: touch;
              scroll-behavior: smooth;
              overscroll-behavior: contain;
              touch-action: pan-y;
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
            
            .mobile-smooth-scroll::-webkit-scrollbar {
              display: none;
            }
          }
        `}</style>
      </div>

      {/* Download Options Modal */}
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