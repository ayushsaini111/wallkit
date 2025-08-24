'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FollowButton, FollowerCount, useFollow } from '@/components/FollowSystem';
import CollectionFoldersModal from "@/components/collection/CollectionFoldersModal";
import { WallpaperModal } from './WallpaperModal';
import { useToggleLike } from './useToggleLike';
import { useToggleSave } from './useToggleSave';
import { useDownloadHandler } from './useDownloadHandler';
import { StorageService } from './StorageService';
import {
    Heart,
    Download,
    Eye,
    User,
    Bookmark,
    Pencil,
    Trash2,
    MoreVertical
} from 'lucide-react';
import Image from 'next/image';

const WallpaperCard = ({
    wallpaper,
    index = 0,
    onUnauthorizedAction,
    showOwnerActions = false,
    onEdit = null,
    onDelete = null,
    onClick = null,
    showUserInfo = true,
    onWallpaperRemoved = null
}) => {
    const { data: session, status: sessionStatus } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Use unified follow system
    const { isFollowing, followerCount } = useFollow(wallpaper.userDetails?._id);

    // Use custom hooks - Pass the removal callback properly
    const { isLiked, likeCount, toggleLike } = useToggleLike(
        wallpaper._id,
        wallpaper.likeCount || 0,
        onUnauthorizedAction,
        onWallpaperRemoved // This will trigger immediate removal from favorites page
    );

    const {
        isSaved,
        toggleSave,
        modalOpen,
        handleModalClose,
        handleCollectionSave
    } = useToggleSave(
        wallpaper._id,
        onUnauthorizedAction,
        onWallpaperRemoved
    );

    const { handleDownload, downloadCount } = useDownloadHandler(wallpaper);

    // Local component state
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [profileImageLoaded, setProfileImageLoaded] = useState(false);
    const [profileImageError, setProfileImageError] = useState(false);
    const [viewCount, setViewCount] = useState(wallpaper.viewCount || 0);
    // 🆕 NEW: Mobile menu state
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    // Refs and tracking
    const isOwner = session?.user?._id === wallpaper.userDetails?._id;
    const viewTracked = useRef(false);
    const intersectionRef = useRef(null);

    // Check URL parameters for modal state
    useEffect(() => {
        const wallpaperId = searchParams.get('wallpaper');
        if (wallpaperId === wallpaper._id) {
            setShowModal(true);
            document.body.style.overflow = 'hidden';

            if (intersectionRef.current) {
                intersectionRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }
    }, [searchParams, wallpaper._id]);

    // Debounce function
    const debounce = useCallback((func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }, []);

    // View tracking
    const debouncedTrackView = useCallback(
        debounce(async () => {
            try {
                const viewed = StorageService.getViewedWallpapers();
                if (viewed.includes(wallpaper._id)) return;

                const res = await fetch('/api/views', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ wallpaperId: wallpaper._id }),
                });

                if (res.ok) {
                    const updatedViewed = [...viewed, wallpaper._id];
                    StorageService.updateViewedWallpapers(updatedViewed);
                    setViewCount(prev => prev + 1);
                }
            } catch (error) {
                console.error('Failed to track view:', error);
            }
        }, 1000),
        [wallpaper._id]
    );

    // View tracking with Intersection Observer
    useEffect(() => {
        let observer;
        const currentRef = intersectionRef.current;

        if (currentRef && !viewTracked.current) {
            observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting && !viewTracked.current) {
                        debouncedTrackView();
                        viewTracked.current = true;
                    }
                },
                {
                    threshold: 0.5,
                    rootMargin: '0px 0px -100px 0px'
                }
            );

            observer.observe(currentRef);
        }

        return () => {
            if (observer && currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [debouncedTrackView]);

    // Navigation functions
    const openProfileDirect = useCallback((e) => {
        e?.stopPropagation();
        const username = wallpaper.userDetails?.username;
        if (!username) return;
        router.push(`/profile/${username}`);
    }, [wallpaper.userDetails?.username, router]);

    const handleCardClick = useCallback((e) => {
        if (onClick) {
            onClick(e);
        } else {
            openModal();
        }
    }, [onClick]);

    const openModal = useCallback(() => {
        const currentUrl = new URL(window.location);
        currentUrl.searchParams.set('wallpaper', wallpaper._id);
        router.push(currentUrl.toString(), { scroll: false });

        setShowModal(true);
        document.body.style.overflow = 'hidden';
    }, [wallpaper._id, router]);

    const closeModal = useCallback((e) => {
        e?.stopPropagation();

        const currentUrl = new URL(window.location);
        currentUrl.searchParams.delete('wallpaper');
        router.push(currentUrl.toString(), { scroll: false });

        setShowModal(false);
        document.body.style.overflow = 'unset';
    }, [router]);

    const handleImageError = useCallback(() => {
        setImageError(true);
        setImageLoaded(true);
    }, []);

    // 🆕 NEW: Toggle mobile menu
    const toggleMobileMenu = useCallback((e) => {
        e.stopPropagation();
        setShowMobileMenu(prev => !prev);
    }, []);

    // 🆕 NEW: Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            if (showMobileMenu) {
                setShowMobileMenu(false);
            }
        };

        if (showMobileMenu) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [showMobileMenu]);

    // Profile Image Component
    const ProfileImage = useCallback(() => {
        const avatar = wallpaper.userDetails?.avatar;

        if (!avatar) {
            return (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center ring-2 ring-white/40">
                    <User className="w-5 h-5 text-white" />
                </div>
            );
        }

        return (
            <div className="relative w-10 h-10 sm:block hidden">
                {!profileImageLoaded && !profileImageError && (
                    <div className="absolute inset-0 rounded-full bg-gray-300 animate-pulse ring-2 ring-white/40"></div>
                )}

                {!profileImageError ? (
                    <Image
                        src={avatar}
                        alt={wallpaper.userDetails?.username || 'User'}
                        onClick={openProfileDirect}
                        width={40}
                        height={40}
                        onLoad={() => setProfileImageLoaded(true)}
                        onError={() => {
                            setProfileImageError(true);
                            setProfileImageLoaded(true);
                        }}
                        className={`w-10 h-10 rounded-full object-cover ring-2 ring-white/40 cursor-pointer hover:ring-white/60 transition-all ${profileImageLoaded ? 'opacity-100' : 'opacity-0'
                            }`}
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center ring-2 ring-white/40">
                        <User className="w-5 h-5 text-white" />
                    </div>
                )}
            </div>
        );
    }, [wallpaper.userDetails?.avatar, wallpaper.userDetails?.username, profileImageLoaded, profileImageError, openProfileDirect]);

    return (
        <>
            <div
                ref={intersectionRef}
                className="group relative cursor-pointer transform transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1 bg-white rounded-lg md:rounded-3xl shadow-xl hover:shadow-2xl overflow-hidden h-full w-full"
                onClick={handleCardClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Image Container */}
                <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    {/* Error State */}
                    {imageError ? (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                            <div className="text-center">
                                <div className="text-4xl mb-2">🖼️</div>
                                <div className="text-sm font-semibold">Image unavailable</div>
                            </div>
                        </div>
                    ) : (
                        <img
                            src={wallpaper.compressedUrl || wallpaper.imageUrl}
                            alt={wallpaper.title || 'Wallpaper'}
                            className={`w-full h-full object-cover transition-all duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                                } ${isHovered ? 'scale-z-105' : 'scale-100'}`}
                            onLoad={() => setImageLoaded(true)}
                            onError={handleImageError}
                            loading={index < 6 ? 'eager' : 'eager'}
                        />
                    )}

                    {/* 🆕 Mobile Edit/Delete Menu (Only for profile page - owner actions) */}
                    {showOwnerActions && (
                        <div className="absolute top-2 right-2 sm:hidden z-30">
                            <button
                                onClick={toggleMobileMenu}
                                className="p-2 bg-black/50 backdrop-blur-sm text-white rounded-full hover:bg-black/70 transition-all"
                            >
                                <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* Mobile Dropdown Menu */}
                            {showMobileMenu && (
                                <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-40 min-w-[140px]">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowMobileMenu(false);
                                            onEdit && onEdit(wallpaper);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <Pencil className="w-4 h-4 text-blue-500" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowMobileMenu(false);
                                            onDelete && onDelete(wallpaper);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Enhanced Hover Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-all duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'
                        }`}>

                        {/* Regular Action Buttons (Desktop - Top Right) */}
                        {!showOwnerActions && (
                            <div className="absolute top-4 right-4 flex-col gap-2 z-20 hidden sm:flex">
                                <button
                                    onClick={toggleLike}
                                    className={`p-3 rounded-2xl transform hover:scale-105 shadow-lg transition-all duration-300 ${isLiked
                                            ? 'bg-red-500 text-white scale-105 shadow-red-500/50'
                                            : 'bg-white/20 text-white hover:bg-white/30'
                                        } ${isHovered ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}
                                    style={{ transitionDelay: '50ms' }}
                                >
                                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-white' : ''}`} />
                                </button>

                                <button
                                    onClick={toggleSave}
                                    className={`p-3 rounded-2xl transform hover:scale-105 shadow-lg transition-all duration-300 ${isSaved
                                            ? 'bg-blue-500 text-white scale-105 shadow-blue-500/50'
                                            : 'bg-white/20 text-white hover:bg-white/30'
                                        } ${isHovered ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}
                                    style={{ transitionDelay: '100ms' }}
                                >
                                    <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-white' : ''}`} />
                                </button>
                            </div>
                        )}

                        {/* Owner Actions (Desktop - Top Right) */}
                        {showOwnerActions && (
                            <div className="absolute top-4 right-4 flex-col gap-2 z-20 hidden sm:flex">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit && onEdit(wallpaper); }}
                                    className={`p-3 rounded-2xl transform hover:scale-105 shadow-lg transition-all duration-300 bg-blue-500 text-white hover:bg-blue-600 ${isHovered ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}
                                    style={{ transitionDelay: '50ms' }}
                                    title="Edit wallpaper"
                                >
                                    <Pencil className="w-5 h-5" />
                                </button>

                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete && onDelete(wallpaper); }}
                                    className={`p-3 rounded-2xl transform hover:scale-105 shadow-lg transition-all duration-300 bg-red-500 text-white hover:bg-red-600 ${isHovered ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}
                                    style={{ transitionDelay: '100ms' }}
                                    title="Delete wallpaper"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                        {/* Download Button - Bottom Right (Desktop) */}
                        <div className="absolute bottom-6 right-4 z-20 hidden sm:block">
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDownload(e); }}
                                className={`sm:p-3 lg:p-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl transition-all duration-300 backdrop-blur-xl transform hover:scale-110 shadow-xl ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                                    }`}
                                style={{ transitionDelay: '300ms' }}
                            >
                                <Download className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Bottom Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                            <div className={`transform transition-all duration-500 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                                }`}>
                                {/* Creator Info */}
                                {showUserInfo && wallpaper.userDetails && (
                                    <div className="flex items-center justify-between mb-4 hidden sm:flex">
                                        <div className="flex items-center gap-3">
                                            <ProfileImage />
                                            <div className="text-white">
                                                <div className="font-semibold text-base truncate max-w-32">
                                                    {wallpaper.userDetails?.username || 'Anonymous'}
                                                </div>
                                                {isFollowing && (
                                                    <div className="text-xs text-green-300 font-medium">Following</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Title */}
                                <h5 className="font-bold text-white text-sm mb-4 line-clamp-2 leading-tight hidden sm:block">
                                    {wallpaper.title || 'Untitled Wallpaper'}
                                </h5>
                            </div>
                        </div>
                    </div>

                    {/* Subtle border glow */}
                    <div className="absolute inset-0 rounded-none md:rounded-3xl ring-1 ring-inset ring-white/20 pointer-events-none"></div>
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

            {/* Enhanced Modal */}
            <WallpaperModal
                wallpaper={wallpaper}
                showModal={showModal}
                onClose={closeModal}
                onToggleLike={toggleLike}
                onToggleSave={toggleSave}
                onDownload={handleDownload}
                onUnauthorizedAction={onUnauthorizedAction}
                isLiked={isLiked}
                isSaved={isSaved}
                likeCount={likeCount}
                downloadCount={downloadCount}
                viewCount={viewCount}
            />
        </>
    );
};

export { WallpaperCard };