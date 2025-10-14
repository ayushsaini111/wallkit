"use client";
import React, { useState, useCallback, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FollowButton, useFollow } from '@/components/FollowSystem';
import { useDownloadHandler } from '@/components/wallpaperCard/useDownloadHandler';
import DownloadOptionsModal from '@/components/wallpaperCard/DownloadOptionsModal';
import CollectionFoldersModal from "@/components/collection/CollectionFoldersModal";
import { useToggleLike } from '@/components/wallpaperCard/useToggleLike';
import { useToggleSave } from '@/components/wallpaperCard/useToggleSave';
import { StorageService } from '@/components/wallpaperCard/StorageService';
import { LoginPopup } from '@/components/loginpopup'; // Added import
import {
  Heart,
  Download,
  Eye,
  Calendar,
  Check,
  Copy,
  User,
  Share2,
  Bookmark,
  ExternalLink,
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

const WallpaperDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const wallpaperId = params.id;

  // State management
  const [wallpaper, setWallpaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareStatus, setShareStatus] = useState('idle');
  const [copyLinkStatus, setCopyLinkStatus] = useState('idle');
  const [imageError, setImageError] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  
  // Login popup states
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [loginActionType, setLoginActionType] = useState('general');

  // Handle unauthorized actions
  const handleUnauthorizedAction = useCallback((actionType = 'general') => {
    console.log('Unauthorized action triggered:', actionType);
    setLoginActionType(actionType);
    setShowLoginPopup(true);
  }, []);

  // Enhanced hooks with StorageService integration
  const { isLiked, likeCount, toggleLike } = useToggleLike(
    wallpaperId,
    wallpaper?.likeCount || 0,
    handleUnauthorizedAction // Updated to use our handler
  );

  const {
    isSaved,
    toggleSave,
    modalOpen,
    handleModalClose,
    handleCollectionSave,
    isLoading: isSaveLoading
  } = useToggleSave(
    wallpaperId,
    handleUnauthorizedAction // Updated to use our handler
  );

  // Enhanced download handler
  const {
    handleDownload,
    quickDownload,
    customDownload,
    isDownloading,
    storageType
  } = useDownloadHandler(wallpaper);

  // Fetch wallpaper data
  useEffect(() => {
    async function fetchWallpaper() {
      if (!wallpaperId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/wallpapers/${wallpaperId}`);
        const data = await res.json();
        
        if (data.success && data.wallpaper) {
          setWallpaper(data.wallpaper);
          setViewCount(data.wallpaper.viewCount || 0);
        } else {
          console.error("Wallpaper not found");
        }
      } catch (err) {
        console.error("Failed to fetch wallpaper:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchWallpaper();
  }, [wallpaperId]);

  // Create clean shareable URL
  const getShareableUrl = useCallback(() => {
    return `${window.location.origin}/wallpaper/${wallpaper._id}`;
  }, [wallpaper?._id]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const openProfileDirect = useCallback((e) => {
    e?.stopPropagation();
    const username = wallpaper?.userDetails?.username;
    if (!username) return;
    router.push(`/profile/${username}`);
  }, [wallpaper?.userDetails?.username, router]);

  // Simplified image handlers
  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  // Share functionality
  const handleShare = useCallback(async (e) => {
    e?.stopPropagation();
    const shareUrl = getShareableUrl();

    if (navigator.share) {
      try {
        await navigator.share({
          title: wallpaper?.title || 'Check out this wallpaper',
          text: wallpaper?.description || 'Amazing wallpaper I found!',
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
  }, [getShareableUrl, wallpaper?.title, wallpaper?.description]);

  const handleCopyLink = useCallback(async (e) => {
    e?.stopPropagation();
    try {
      await navigator.clipboard.writeText(getShareableUrl());
      setCopyLinkStatus('copied');
      setTimeout(() => setCopyLinkStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  }, [getShareableUrl]);

  // Download handlers
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

  // Reset states when wallpaper changes
  useEffect(() => {
    if (wallpaper) {
      setShareStatus('idle');
      setCopyLinkStatus('idle');
      setImageError(false);
      setShowDownloadOptions(false);
    }
  }, [wallpaper]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-orange-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading wallpaper...</p>
        </div>
      </div>
    );
  }

  // No wallpaper ID in URL
  if (!wallpaperId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <p className="text-gray-600 font-medium">No wallpaper selected</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Browse Wallpapers
          </button>
        </div>
      </div>
    );
  }

  // Wallpaper not found
  if (!wallpaper) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <p className="text-gray-600 font-medium">Wallpaper not found</p>
          <button
            onClick={handleBack}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Preload link for faster image loading */}
      {wallpaper && (wallpaper.compressedUrl || wallpaper.imageUrl) && (
        <link 
          rel="preload" 
          as="image" 
          href={wallpaper.compressedUrl || wallpaper.imageUrl}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Enhanced Mobile Header - Transparent backdrop */}
        <div className="flex sm:hidden items-center justify-between p-3 bg-white/70 backdrop-blur-md border-b border-gray-200/30 sticky top-0 z-50">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100/60 hover:bg-gray-200/60 rounded-xl transition-all duration-200 active:scale-95 backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4 text-gray-700" />
            <span className="text-gray-700 text-sm font-medium">Back</span>
          </button>
          <h3 className="text-gray-900 font-semibold text-sm truncate max-w-[60%]">
            {wallpaper.title || 'Wallpaper'}
          </h3>
          <div className="w-16"></div>
        </div>

        {/* Main Content - No gap between image and details on mobile */}
        <div className="flex flex-col sm:flex-row max-w-7xl mx-auto sm:p-6 lg:p-8 gap-0 sm:gap-6 h-[calc(100vh-4rem)] sm:h-auto">
          
          {/* Image Section - Full image display on mobile */}
          <div className="w-full sm:w-2/3 lg:w-2/3 relative flex items-center justify-center overflow-hidden sm:overflow-visible">
            
            <div 
              className="mobile-smooth-scroll w-full h-full sm:h-auto flex flex-col sm:block overflow-y-auto sm:overflow-visible"
              style={{ 
                height: 'calc(100vh - 57px)',
                minHeight: 'calc(100vh - 57px)'
              }}
            >
              
              {/* Image Container - Full image display on mobile */}
              <div className="flex-shrink-0 w-full h-[45vh] sm:h-full sm:min-h-0 relative">
                
                {/* Desktop Back Button - Floating, transparent backdrop */}
                <div className="hidden sm:block absolute top-4 left-4 z-20">
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 px-4 py-2 bg-black/10 hover:bg-black/20 backdrop-blur-md rounded-xl transition-all duration-200 text-white border border-white/20"
                  >
                    <ArrowLeft className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-600">Back</span>
                  </button>
                </div>

                {/* 🔥 FIXED: Full Screen Image Display - Show full image on mobile */}
                <div className="relative w-full h-full">
                  {imageError ? (
                    <div className="flex items-center justify-center text-gray-500 text-center w-full h-full bg-gradient-to-br from-gray-100 to-gray-200">
                      <div>
                        <div className="text-2xl xs:text-3xl sm:text-4xl lg:text-6xl mb-2 sm:mb-4">🖼️</div>
                        <div className="text-sm xs:text-base sm:text-lg lg:text-xl font-semibold">Image unavailable</div>
                        <div className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2">Failed to load the wallpaper</div>
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={wallpaper.compressedUrl || wallpaper.imageUrl}
                      alt={wallpaper.title || 'Wallpaper'}
                      fill
                      className="object-contain sm:rounded-2xl shadow-2xl" // 🔥 Changed: object-contain for full image display on mobile
                      onError={handleImageError}
                      priority={true}
                      quality={90}
                      placeholder="blur"
                      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2ZmZmZmZiIgb3BhY2l0eT0iMC4xIi8+PC9zdmc+"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 50vw"
                    />
                  )}
                </div>
              </div>

              {/* Mobile Details section */}
              <div className="sm:hidden flex-1 bg-white/70 backdrop-blur-md min-h-[55vh] mobile-content-scroll">
                {/* Fixed Header Section */}
                <div className="mobile-scroll-header flex-shrink-0 p-4 pb-2 bg-white/70 backdrop-blur-md sticky top-0 z-10 border-b border-gray-100/30">
                  {/* User info */}
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

                {/* Enhanced scrollable content with momentum */}
                <div className="mobile-scroll-content px-4 pb-8 space-y-4 overflow-y-auto">
                  {/* Description */}
                  {wallpaper.description && (
                    <div className="text-xs text-gray-600 font-medium p-3 bg-gray-50/60 rounded-lg border border-gray-200/30 backdrop-blur-sm">
                      <p className="line-clamp-3">{wallpaper.description}</p>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <FollowButton
                      userId={wallpaper.userDetails?._id}
                      onUnauthorizedAction={handleUnauthorizedAction} // Updated
                      className="flex-1 text-xs h-9"
                      size="small"
                      initialFollowerCount={wallpaper?.userDetails?.followerCount || wallpaper?.followerCount || 0}
                    />

                    <button
                      onClick={toggleLike}
                      className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 border ${
                        isLiked
                          ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/30'
                          : 'bg-gray-100/60 border-gray-200/50 text-gray-700 hover:bg-gray-200/60 backdrop-blur-sm'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
                    </button>

                    <button
                      onClick={toggleSave}
                      disabled={isSaveLoading}
                      className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 border ${
                        isSaved
                          ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/30'
                          : 'bg-gray-100/60 border-gray-200/50 text-gray-700 hover:bg-gray-200/60 backdrop-blur-sm'
                      }`}
                    >
                      {isSaveLoading ? (
                        <span className="w-4 h-4 inline-block border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
                      )}
                    </button>

                    <button
                      onClick={handleShare}
                      className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 border ${
                        shareStatus === 'copied'
                          ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/30'
                          : 'bg-gray-100/60 border-gray-200/50 text-gray-700 hover:bg-gray-200/60 backdrop-blur-sm'
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
                      className="w-full py-2.5 bg-gray-100/60 hover:bg-gray-200/60 text-gray-700 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 border border-gray-200/50 backdrop-blur-sm"
                    >
                      <Settings className="w-4 h-4" />
                      Download Options
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Stats and other content */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Eye className="w-3 h-3" />
                          <span className="text-xs">Views</span>
                        </div>
                        <span className="font-bold text-gray-900 text-sm">
                          {viewCount?.toLocaleString() || '0'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Download className="w-3 h-3" />
                          <span className="text-xs">Downloads</span>
                        </div>
                        <span className="font-bold text-gray-900 text-sm">
                          {wallpaper.downloadCount?.toLocaleString() || '0'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Heart className="w-3 h-3" />
                          <span className="text-xs">Likes</span>
                        </div>
                        <span className="font-bold text-gray-900 text-sm">
                          {likeCount?.toLocaleString() || '0'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200/30">
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

                  {/* Direct link */}
                  <div className="bg-gradient-to-r from-blue-50/60 to-purple-50/60 backdrop-blur-sm border border-blue-200/50 rounded-lg p-3">
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
                            : 'bg-white/60 backdrop-blur-sm border-gray-200/50 hover:bg-gray-50/60 text-gray-700'
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

                  {/* Tags */}
                  {wallpaper.tags && wallpaper.tags.filter(tag => tag && tag.trim()).length > 0 && (
                    <div>
                      <h3 className="text-gray-900 font-semibold mb-2 flex items-center gap-2 text-sm">
                        <span>Tags</span>
                        <div className="w-6 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {wallpaper.tags.filter(tag => tag && tag.trim()).slice(0, 6).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100/60 backdrop-blur-sm text-gray-700 rounded-md hover:bg-gray-200/60 transition-all cursor-pointer border border-gray-200/30 text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Extra bottom padding for smooth scroll end */}
                  <div className="h-16"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Desktop Details Section - Transparent backdrop */}
          <div className="hidden sm:flex w-full sm:w-1/3 lg:w-1/3 flex-col">
            <div className="bg-white/70 backdrop-blur-md sm:rounded-2xl shadow-lg border border-gray-200/30 overflow-hidden h-full flex flex-col">
              {/* Fixed Header Section */}
              <div className="flex-shrink-0 p-6 lg:p-8 pb-2">
                {/* User info */}
                <div className="flex items-start gap-4">
                  {wallpaper.userDetails?.avatar ? (
                    <Image
                      src={wallpaper.userDetails.avatar}
                      alt={wallpaper.userDetails.username}
                      className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl object-cover ring-2 ring-gray-200 cursor-pointer flex-shrink-0 hover:ring-blue-400 transition-all"
                      onClick={openProfileDirect}
                      width={64}
                      height={64}
                    />
                  ) : (
                    <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center ring-2 ring-gray-200 cursor-pointer flex-shrink-0 hover:ring-blue-400 transition-all"
                         onClick={openProfileDirect}>
                      <User className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                    </div>
                  )}
                  <div className="text-gray-900 min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-gray-700 flex-wrap">
                      <button
                        onClick={openProfileDirect}
                        className="text-lg font-medium hover:text-blue-600 transition-colors cursor-pointer truncate"
                      >
                        {wallpaper.userDetails?.username || 'Anonymous'}
                      </button>
                      <span className="text-xs">•</span>
                      <CustomFollowerCount wallpaper={wallpaper} />
                    </div>
                    <h2 className="text-lg font-bold line-clamp-2 mt-1">
                      {wallpaper.title || 'Untitled Wallpaper'}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Scrollable content area */}
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent px-6 lg:px-8 pb-6 lg:pb-8">
                <div className="space-y-5">
                  {/* Description */}
                  {wallpaper.description && (
                    <div className="text-sm text-gray-600 font-medium">
                      <p className="line-clamp-3">{wallpaper.description}</p>
                    </div>
                  )}

                  {/* Main action buttons */}
                  <div className="flex items-center gap-2">
                    <FollowButton
                      userId={wallpaper.userDetails?._id}
                      onUnauthorizedAction={handleUnauthorizedAction} // Updated
                      className="flex-1 text-base h-10"
                      size="small"
                      initialFollowerCount={wallpaper?.userDetails?.followerCount || wallpaper?.followerCount || 0}
                    />

                    <button
                      onClick={toggleLike}
                      className={`p-3 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 border ${
                        isLiked
                          ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/30'
                          : 'bg-gray-100/60 border-gray-200/50 text-gray-700 hover:bg-gray-200/60 backdrop-blur-sm'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isLiked ? 'fill-white' : ''}`} />
                    </button>

                    <button
                      onClick={toggleSave}
                      disabled={isSaveLoading}
                      className={`p-3 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 border ${
                        isSaved
                          ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/30'
                          : 'bg-gray-100/60 border-gray-200/50 text-gray-700 hover:bg-gray-200/60 backdrop-blur-sm'
                      }`}
                    >
                      {isSaveLoading ? (
                        <span className="w-5 h-5 inline-block border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-white' : ''}`} />
                      )}
                    </button>

                    <button
                      onClick={handleShare}
                      className={`p-3 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 border ${
                        shareStatus === 'copied'
                          ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/30'
                          : 'bg-gray-100/60 border-gray-200/50 text-gray-700 hover:bg-gray-200/60 backdrop-blur-sm'
                      }`}
                      title={shareStatus === 'copied' ? 'Link copied!' : 'Share wallpaper'}
                    >
                      {shareStatus === 'copied' ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Share2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Enhanced download buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={handleQuickDownload}
                      disabled={isDownloading}
                      className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-2"
                    >
                      {isDownloading ? (
                        <>
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="w-6 h-6" />
                          Download
                        </>
                      )}
                    </button>

                    <button
                      onClick={openDownloadOptions}
                      className="w-full py-2.5 bg-gray-100/60 hover:bg-gray-200/60 text-gray-700 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 border border-gray-200/50 backdrop-blur-sm"
                    >
                      <Settings className="w-4 h-4" />
                      Download Options
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Eye className="w-3 h-3" />
                          <span className="text-xs">Views</span>
                        </div>
                        <span className="font-bold text-gray-900 text-sm">
                          {viewCount?.toLocaleString() || '0'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Download className="w-3 h-3" />
                          <span className="text-xs">Downloads</span>
                        </div>
                        <span className="font-bold text-gray-900 text-sm">
                          {wallpaper.downloadCount?.toLocaleString() || '0'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Heart className="w-3 h-3" />
                          <span className="text-xs">Likes</span>
                        </div>
                        <span className="font-bold text-gray-900 text-sm">
                          {likeCount?.toLocaleString() || '0'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200/30">
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

                  {/* Direct link */}
                  <div className="bg-gradient-to-r from-blue-50/60 to-purple-50/60 backdrop-blur-sm border border-blue-200/50 rounded-lg p-2.5">
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
                            : 'bg-white/60 backdrop-blur-sm border-gray-200/50 hover:bg-gray-50/60 text-gray-700'
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

                  {/* Tags */}
                  {wallpaper.tags && wallpaper.tags.filter(tag => tag && tag.trim()).length > 0 && (
                    <div>
                      <h3 className="text-gray-900 font-semibold mb-2 flex items-center gap-2 text-sm">
                        <span>Tags</span>
                        <div className="w-6 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {wallpaper.tags.filter(tag => tag && tag.trim()).slice(0, 6).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100/60 backdrop-blur-sm text-gray-700 rounded-md hover:bg-gray-200/60 transition-all cursor-pointer border border-gray-200/30 text-xs"
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
      </div>

      {/* Collection Modal */}
      {modalOpen && (
        <CollectionFoldersModal
          isOpen={modalOpen}
          wallpaperId={wallpaper._id}
          onClose={handleModalClose}
          onWallpaperSaved={handleCollectionSave}
        />
      )}

      {/* Download Options Modal */}
      <DownloadOptionsModal
        isOpen={showDownloadOptions}
        onClose={() => setShowDownloadOptions(false)}
        onDownload={handleAdvancedDownload}
        wallpaper={wallpaper}
        isDownloading={isDownloading}
      />

      {/* 🔥 NEW: Login Popup */}
      <LoginPopup 
        isVisible={showLoginPopup} 
        onClose={() => setShowLoginPopup(false)} 
        actionType={loginActionType}
      />

      {/* Enhanced Mobile-Specific Scrollbar Styles */}
      <style jsx>{`
        /* Desktop scrollbar styles */
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

        /* Enhanced Mobile Smooth Scrolling */
        @media (max-width: 640px) {
          .mobile-smooth-scroll {
            /* Core mobile scroll optimizations */
            -webkit-overflow-scrolling: touch;
            overflow-scrolling: touch;
            scroll-behavior: smooth;
            scroll-snap-type: y proximity;
            
            /* Hide scrollbars on mobile */
            -ms-overflow-style: none;
            scrollbar-width: none;
            
            /* Momentum scrolling for iOS */
            -webkit-transform: translate3d(0, 0, 0);
            transform: translate3d(0, 0, 0);
            
            /* Reduce scroll resistance */
            overscroll-behavior: contain;
            touch-action: pan-y;
          }
          
          .mobile-smooth-scroll::-webkit-scrollbar {
            display: none;
          }
          
          .mobile-content-scroll {
            /* Additional content area optimizations */
            will-change: scroll-position;
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
          }
          
          .mobile-scroll-header {
            /* Smooth sticky header */
            will-change: transform;
            -webkit-transform: translate3d(0, 0, 0);
            transform: translate3d(0, 0, 0);
          }
          
          .mobile-scroll-content {
            /* Optimize content scrolling */
            padding-top: env(safe-area-inset-top, 0);
            padding-bottom: calc(env(safe-area-inset-bottom, 0) + 2rem);
            
            /* Enable hardware acceleration */
            -webkit-transform: translate3d(0, 0, 0);
            transform: translate3d(0, 0, 0);
            
            /* Smooth momentum */
            -webkit-overflow-scrolling: touch;
            overflow-scrolling: touch;
            
            /* Better scroll performance */
            will-change: scroll-position;
            contain: layout style paint;
          }
          
          /* Smooth scroll snap points */
          .mobile-scroll-content > * {
            scroll-snap-align: start;
          }
          
          /* Optimize touch interactions */
          .mobile-smooth-scroll * {
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
          }
          
          /* Allow text selection in content areas */
          .mobile-scroll-content p,
          .mobile-scroll-content span {
            -webkit-user-select: text;
            user-select: text;
          }
          
          /* Reduce motion for users who prefer it */
          @media (prefers-reduced-motion: reduce) {
            .mobile-smooth-scroll {
              scroll-behavior: auto;
              -webkit-overflow-scrolling: auto;
            }
          }
        }
        
        /* Desktop scrolling remains unchanged */
        @media (min-width: 641px) {
          .mobile-smooth-scroll {
            overflow: visible;
          }
        }
      `}</style>
    </>
  );
};

export default WallpaperDetailPage;