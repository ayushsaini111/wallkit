'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { uploadImageToAppwrite } from '@/lib/appwrite/storage';
import { uploadImageToCloudinary } from '@/lib/appwrite/storagetwo';
import { compressImage } from '@/utils/compressImage';

// Toast Component
const Toast = ({ message, type, isVisible, onClose }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    const getToastStyles = () => {
        switch (type) {
            case 'success':
                return 'bg-green-500 text-white';
            case 'info':
                return 'bg-blue-500 text-white';
            case 'warning':
                return 'bg-amber-500 text-white';
            case 'error':
                return 'bg-red-500 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                );
            case 'info':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'warning':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                );
            case 'error':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 max-w-md animate-slide-in">
            <div className={`${getToastStyles()} px-6 py-4 rounded-lg shadow-lg flex items-center gap-3`}>
                {getIcon()}
                <span className="font-medium">{message}</span>
                <button
                    onClick={onClose}
                    className="ml-auto hover:opacity-75 transition-opacity"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

const UploadWallpaper = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const [dragActive, setDragActive] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [uploadResults, setUploadResults] = useState([]);
    const [currentTagInput, setCurrentTagInput] = useState({});
    const fileInputRef = useRef(null);
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(null);
    const formSectionRef = useRef(null);
    
    // Toast state
    const [toast, setToast] = useState({ message: '', type: '', isVisible: false });
    
    // Navigation state
    const [isNavigating, setIsNavigating] = useState(false);
    const [navigationCountdown, setNavigationCountdown] = useState(0);

    // Predefined categories
    const categories = [
        'Nature', 'Abstract', 'Minimalist', 'Animals', 'Cityscape', 'Anime',
        'Superheroes', 'Cartoon', 'Space', 'Technology', 'Fantasy',
        'Textures & Patterns', 'Food & Drinks', 'People', 'Architecture',
        'Cars & Vehicles', 'Art & Illustration', '3D Renders', 'Typography',
        'Dark', 'Light', 'Vintage', 'Sports', 'Other'
    ];

    // Show toast function
    const showToast = (message, type) => {
        setToast({ message, type, isVisible: true });
    };

    // Hide toast function
    const hideToast = () => {
        setToast(prev => ({ ...prev, isVisible: false }));
    };

    // Navigation countdown effect
    useEffect(() => {
        let interval;
        if (isNavigating && navigationCountdown > 0) {
            interval = setInterval(() => {
                setNavigationCountdown(prev => prev - 1);
            }, 1000);
        } else if (isNavigating && navigationCountdown === 0) {
            router.push(`/profile/${session?.user?.username || ''}`);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isNavigating, navigationCountdown, router, session]);

    // Handle drag events
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    // Handle drop event
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    // Handle file selection from input
    const handleFileSelect = (e) => {
        if (e.target.files) {
            handleFiles(e.target.files);
        }
    };

    // Process selected files
    const handleFiles = (files) => {
        const validFiles = Array.from(files).filter(file => {
            if (!file.type.startsWith('image/')) {
                showToast(`${file.name} is not a valid image file`, 'error');
                return false;
            }
            if (file.size > 50 * 1024 * 1024) {
                showToast(`${file.name} is too large. Maximum size is 50MB`, 'error');
                return false;
            }
            return true;
        });

        if (validFiles.length > 0) {
            const filesWithPreview = validFiles.map(file => ({
                file,
                id: Math.random().toString(36).substr(2, 9),
                preview: URL.createObjectURL(file),
                name: file.name,
                size: file.size,
                status: 'pending',
                metadata: {
                    title: file.name.split('.')[0],
                    description: '',
                    tags: [],
                    category: 'Other',
                    isPrivate: false
                }
            }));

            setSelectedFiles(prev => [...filesWithPreview, ...prev]);

            const newTagInputs = {};
            filesWithPreview.forEach(file => {
                newTagInputs[file.id] = '';
            });
            setCurrentTagInput(prev => ({ ...prev, ...newTagInputs }));

            showToast(`${validFiles.length} file${validFiles.length !== 1 ? 's' : ''} added successfully`, 'success');

            setTimeout(() => {
                if (formSectionRef.current) {
                    formSectionRef.current.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
                }
            }, 100);
        }
    };

    // Update file metadata
    const updateFileMetadata = (fileId, field, value) => {
        setSelectedFiles(prev =>
            prev.map(f =>
                f.id === fileId
                    ? { ...f, metadata: { ...f.metadata, [field]: value } }
                    : f
            )
        );
    };

    // Handle tag input
    const handleTagInput = (fileId, value) => {
        setCurrentTagInput(prev => ({ ...prev, [fileId]: value }));
    };

    // Handle tag key press
    const handleTagKeyPress = (e, fileId) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(fileId);
        }
    };

    // Handle tag blur
    const handleTagBlur = (fileId) => {
        addTag(fileId);
    };

    // Add tag helper function
    const addTag = (fileId) => {
        const tagValue = currentTagInput[fileId]?.trim();
        if (tagValue) {
            const currentFile = selectedFiles.find(f => f.id === fileId);
            const newTags = tagValue.split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0 && !currentFile.metadata.tags.includes(tag));

            if (newTags.length > 0) {
                updateFileMetadata(fileId, 'tags', [...currentFile.metadata.tags, ...newTags]);
            }
            setCurrentTagInput(prev => ({ ...prev, [fileId]: '' }));
        }
    };

    // Remove tag
    const removeTag = (fileId, tagIndex) => {
        const currentFile = selectedFiles.find(f => f.id === fileId);
        const updatedTags = currentFile.metadata.tags.filter((_, index) => index !== tagIndex);
        updateFileMetadata(fileId, 'tags', updatedTags);
    };

    // Confirm remove file
    const confirmRemoveFile = (fileId) => {
        setShowRemoveConfirm(fileId);
    };

    // Cancel remove
    const cancelRemove = () => {
        setShowRemoveConfirm(null);
    };

    // Remove file from selection
    const removeFile = (fileId) => {
        setSelectedFiles(prev => {
            const updatedFiles = prev.filter(f => f.id !== fileId);
            const fileToRemove = prev.find(f => f.id === fileId);
            if (fileToRemove?.preview) {
                URL.revokeObjectURL(fileToRemove.preview);
            }
            return updatedFiles;
        });

        setCurrentTagInput(prev => {
            const updated = { ...prev };
            delete updated[fileId];
            return updated;
        });

        setUploadProgress(prev => {
            const updated = { ...prev };
            delete updated[fileId];
            return updated;
        });

        setShowRemoveConfirm(null);
        showToast('File removed successfully', 'info');
    };

    // Validate file data before upload
    const validateFileData = (fileData) => {
        const { title, description, category } = fileData.metadata;

        if (!title.trim()) return 'Title is required';
        if (title.trim().length < 3) return 'Title must be at least 3 characters long';
        if (description.trim().length > 500) return 'Description must be less than 500 characters';
        if (!category) return 'Category is required';

        return null;
    };

    // Upload files with improved UX
    const uploadFiles = async () => {
        if (selectedFiles.length === 0) return;

        // Validate files
        const validationErrors = [];
        const pendingFiles = selectedFiles.filter(fileData => fileData.status === 'pending');
        
        pendingFiles.forEach(fileData => {
            const error = validateFileData(fileData);
            if (error) validationErrors.push(`${fileData.name}: ${error}`);
        });

        if (validationErrors.length > 0) {
            showToast('Please fix validation errors before uploading', 'error');
            return;
        }

        setUploading(true);

        let uploadedCount = 0;
        const totalFiles = pendingFiles.length;

        // Show initial upload toast
        showToast(`Starting upload of ${totalFiles} file${totalFiles !== 1 ? 's' : ''}...`, 'info');

        // Process files one by one for better UX
        for (const fileData of pendingFiles) {
            try {
                // Mark as uploading
                setUploadProgress(prev => ({
                    ...prev,
                    [fileData.id]: { status: 'uploading', progress: 0 }
                }));
                setSelectedFiles(prev =>
                    prev.map(f => f.id === fileData.id ? { ...f, status: 'uploading' } : f)
                );

                // Compress and upload compressed version
                const compressedFile = await compressImage(fileData.file, { quality: 0.1 });
                const cloudinaryCompressedObj = await uploadImageToCloudinary(compressedFile);
                const compressedUrl = cloudinaryCompressedObj.url;

                // Save compressed URL to backend
                const formData = new FormData();
                formData.append('title', fileData.metadata.title);
                formData.append('description', fileData.metadata.description);
                formData.append('tags', fileData.metadata.tags.join(','));
                formData.append('category', fileData.metadata.category);
                formData.append('isPrivate', fileData.metadata.isPrivate);
                formData.append('imageUrl', compressedUrl);
                formData.append('compressedUrl', compressedUrl);
                formData.append('userId', session.user._id);

                const res = await fetch('/api/wallpaperupload', {
                    method: 'POST',
                    body: formData,
                });

                const savedData = await res.json();
                if (!savedData.success || !savedData.wallpaper?._id) {
                    throw new Error('Failed to save compressed wallpaper');
                }

                const wallpaperId = savedData.wallpaper._id;
                uploadedCount++;

                // Mark success immediately
                setUploadProgress(prev => ({
                    ...prev,
                    [fileData.id]: { status: 'completed', progress: 100 }
                }));
                setSelectedFiles(prev =>
                    prev.map(f =>
                        f.id === fileData.id
                            ? { ...f, status: 'completed', uploadedId: wallpaperId }
                            : f
                    )
                );

                showToast(`${fileData.name} uploaded successfully! (${uploadedCount}/${totalFiles})`, 'success');

                // Upload original in background (non-blocking)
                (async () => {
                    try {
                        let uploadedObj = null;
                        let originalUrl = "";

                        if (fileData.size >= 10 * 1024 * 1024) {
                            uploadedObj = await uploadImageToAppwrite(fileData.file);
                            originalUrl = uploadedObj.downloadUrl;
                        } else {
                            uploadedObj = await uploadImageToCloudinary(fileData.file);
                            originalUrl = uploadedObj.url;
                        }

                        await fetch(`/api/wallpaperupload/${wallpaperId}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                imageUrl: originalUrl,
                                storageId: uploadedObj.id
                            })
                        });
                    } catch (err) {
                        console.error('[Background Upload] Failed:', err);
                    }
                })();

            } catch (error) {
                console.error(`Error uploading ${fileData.name}:`, error);

                setUploadProgress(prev => ({
                    ...prev,
                    [fileData.id]: { status: 'error', progress: 0 }
                }));
                setSelectedFiles(prev =>
                    prev.map(f => f.id === fileData.id ? { ...f, status: 'error' } : f)
                );

                showToast(`Failed to upload ${fileData.name}`, 'error');
            }
        }

        setUploading(false);

        // If all uploads successful, navigate to profile
        if (uploadedCount === totalFiles && uploadedCount > 0) {
            showToast(`${totalFiles} wallpaper${totalFiles !== 1 ? 's' : ''} uploaded successfully!`, 'success');
            
            // Start navigation countdown
            setTimeout(() => {
                setIsNavigating(true);
                setNavigationCountdown(3); // 3 seconds countdown
            }, 1500); // Wait 1.5 seconds before showing navigation dialog
        } else if (uploadedCount > 0) {
            showToast(`${uploadedCount}/${totalFiles} files uploaded successfully`, 'warning');
        }
    };

    // Clear all files
    const clearFiles = () => {
        selectedFiles.forEach(fileData => {
            if (fileData.preview) {
                URL.revokeObjectURL(fileData.preview);
            }
        });

        setSelectedFiles([]);
        setUploadProgress({});
        setUploadResults([]);
        setCurrentTagInput({});
        showToast('All files cleared', 'info');
    };

    // Navigate to profile manually
    const navigateToProfile = () => {
        setIsNavigating(true);
        setNavigationCountdown(1);
    };

    // Cancel navigation
    const cancelNavigation = () => {
        setIsNavigating(false);
        setNavigationCountdown(0);
        showToast('Navigation cancelled', 'info');
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'text-amber-600 bg-amber-50';
            case 'uploading': return 'text-blue-600 bg-blue-50';
            case 'completed': return 'text-green-600 bg-green-50';
            case 'error': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    // Get status icon
    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'uploading':
                return (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current"></div>
                );
            case 'completed':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                );
            case 'error':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    // Count pending uploads
    const pendingCount = selectedFiles.filter(f => f.status === 'pending').length;
    const completedCount = selectedFiles.filter(f => f.status === 'completed').length;

    // If not authenticated, show login prompt
    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
                <div className="text-center p-6 md:p-12 bg-white rounded-lg md:rounded-2xl max-w-md w-full mx-4">
                    <div className="text-5xl md:text-7xl mb-4 md:mb-6">🔐</div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Access Required</h2>
                    <p className="text-gray-600 mb-6 md:mb-8 leading-relaxed text-sm md:text-base">
                        Please sign in to start sharing your beautiful wallpapers with our community
                    </p>
                    <a
                        href="/auth/login"
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg md:rounded-xl font-semibold transition-all duration-300 inline-flex items-center gap-2 md:gap-3 transform hover:-translate-y-0.5 text-sm md:text-base"
                    >
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3v1" />
                        </svg>
                        Sign In to Continue
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-4 bg-gradient-to-br from-gray-50 via-white to-blue-50">
            {/* Toast Component */}
            <Toast 
                message={toast.message} 
                type={toast.type} 
                isVisible={toast.isVisible} 
                onClose={hideToast} 
            />

            {/* Navigation Overlay */}
            {isNavigating && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Navigating to Profile</h3>
                        <p className="text-gray-600 mb-6">
                            Taking you to your profile in {navigationCountdown} second{navigationCountdown !== 1 ? 's' : ''}...
                        </p>
                    
                    </div>
                </div>
            )}

            <div className="container mx-auto px-4 py-6 md:py-12">
                <div className="max-w-7xl mx-auto">
                    {/* Success Summary - Show when files uploaded but not navigating */}
                    {completedCount > 0 && !isNavigating && (
                        <div className="mb-8 md:mb-12">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg md:rounded-2xl p-6 md:p-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-xl md:text-2xl font-bold text-green-800">
                                                {completedCount} wallpaper{completedCount !== 1 ? 's' : ''} uploaded successfully!
                                            </h3>
                                            <p className="text-green-700">
                                                Your wallpapers are now available in your profile
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={navigateToProfile}
                                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 inline-flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        View Profile
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Enhanced Header */}
                    <div className="text-center mb-8 md:mb-16">
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 md:mb-6 leading-tight">
                            <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                                Upload Your Vision
                            </span>
                        </h1>
                        <p className="text-sm leading-tight text-center md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
                            Transform spaces and inspire others by uploading your stunning wallpapers.
                            Join our creative community and help others discover the perfect backdrop for their digital world.
                        </p>
                    </div>

                    {/* Enhanced Upload Area */}
                    <div className="mb-8 md:mb-12">
                        <div
                            className={`relative border-2 border-dashed rounded-lg md:rounded-3xl p-8 md:p-16 text-center transition-all duration-300 ${dragActive
                                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50'
                                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50/50'
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            <div className="space-y-4 md:space-y-8">
                                <div className={`text-5xl md:text-8xl transition-all duration-300 ${dragActive ? 'scale-110 md:scale-125' : ''}`}>
                                    {dragActive ? '🎯' : '🖼️'}
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-4">
                                        {dragActive ? 'Drop your masterpieces here!' : 'Upload Your Wallpapers'}
                                    </h3>
                                    <p className="text-gray-600 mb-4 md:mb-8 text-sm md:text-lg">
                                        Drag and drop your images here, or click to browse your collection
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 md:px-10 py-3 md:py-4 rounded-lg md:rounded-xl font-semibold transition-all duration-300 inline-flex items-center gap-2 md:gap-3 transform hover:-translate-y-0.5 disabled:transform-none text-sm md:text-lg"
                                    >
                                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Browse Files
                                    </button>
                                </div>

                                {/* Feature highlights - responsive grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 text-xs md:text-sm text-gray-500 max-w-3xl mx-auto">
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0">
                                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div className="text-left">
                                            <div className="font-medium text-gray-700 text-sm">Multiple Formats</div>
                                            <div className="text-xs">JPG, PNG, WebP, GIF</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
                                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div className="text-left">
                                            <div className="font-medium text-gray-700 text-sm">Large Files</div>
                                            <div className="text-xs">Up to 50MB each</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 md:gap-3 sm:col-span-2 md:col-span-1">
                                        <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 flex-shrink-0">
                                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1-1H4a1 1 0 01-1-1V4a1 1 0 011-1h2a1 1 0 011 1v3" />
                                            </svg>
                                        </div>
                                        <div className="text-left">
                                            <div className="font-medium text-gray-700 text-sm">High Quality</div>
                                            <div className="text-xs">1920×1080+ recommended</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Selected Files - Responsive Layout */}
                    {selectedFiles.length > 0 && (
                        <div ref={formSectionRef} className="mb-8 md:mb-12">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 md:mb-8">
                                <div className="flex flex-wrap items-center gap-2 md:gap-4">
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                                        Selected Files
                                    </h2>
                                    <div className="bg-blue-100 text-blue-800 px-3 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm font-semibold">
                                        {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}
                                    </div>
                                    {pendingCount > 0 && (
                                        <div className="bg-amber-100 text-amber-800 px-3 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm font-semibold">
                                            {pendingCount} pending
                                        </div>
                                    )}
                                    {completedCount > 0 && (
                                        <div className="bg-green-100 text-green-800 px-3 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm font-semibold">
                                            {completedCount} uploaded
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Files Grid - Single column on mobile, two columns on larger screens */}
                            <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0 xl:gap-8">
                                {selectedFiles.map((fileData) => (
                                    <div key={fileData.id} className="bg-white rounded-lg md:rounded-2xl overflow-hidden border border-gray-100">
                                        {/* Image Preview - Consistent aspect ratio */}
                                        <div className="aspect-video relative bg-gradient-to-br from-gray-100 to-gray-200 group">
                                            <Image
                                                src={fileData.preview}
                                                alt={fileData.name}
                                                fill
                                                className={`object-cover transition-transform duration-500 ${fileData.status !== 'uploading' ? 'group-hover:scale-105' : ''}`}
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                priority
                                            />

                                            {/* Status overlay */}
                                            {fileData.status === 'uploading' && (
                                                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center backdrop-blur-sm">
                                                    <div className="text-white text-center px-4">
                                                        <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-t-2 border-b-2 md:border-t-3 md:border-b-3 border-white mx-auto mb-2 md:mb-4"></div>
                                                        <p className="text-sm md:text-lg font-semibold">Uploading...</p>
                                                        <p className="text-xs md:text-sm opacity-90">Processing your wallpaper</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Status badge */}
                                            <div className={`absolute top-2 left-2 md:top-4 md:left-4 px-2 py-1 md:px-3 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-semibold ${getStatusColor(fileData.status)} flex items-center gap-1 md:gap-2 backdrop-blur-sm`}>
                                                {getStatusIcon(fileData.status)}
                                                <span className="hidden sm:inline">{fileData.status.charAt(0).toUpperCase() + fileData.status.slice(1)}</span>
                                            </div>
                                        </div>

                                        {/* File Info and Form */}
                                        <div className="p-4 md:p-6 lg:p-8 text-black">
                                            <div className="flex items-center justify-between text-xs md:text-sm text-gray-500 mb-4 md:mb-6">
                                                <span className="font-medium truncate flex-1 mr-2 md:mr-4">{fileData.name}</span>
                                                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full flex-shrink-0">{formatFileSize(fileData.size)}</span>
                                            </div>

                                            {/* Metadata Form */}
                                            <div className="space-y-4 md:space-y-6">
                                                {/* Title */}
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Title <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={fileData.metadata.title}
                                                        onChange={(e) => updateFileMetadata(fileData.id, 'title', e.target.value)}
                                                        disabled={uploading || fileData.status === 'completed'}
                                                        placeholder="Give your wallpaper a catchy title"
                                                        className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed text-sm transition-all duration-200"
                                                        maxLength={100}
                                                    />
                                                    <p className="text-xs text-gray-500 mt-2 flex justify-between">
                                                        <span>Make it descriptive and engaging</span>
                                                        <span>{fileData.metadata.title.length}/100</span>
                                                    </p>
                                                </div>

                                                {/* Description */}
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Description
                                                    </label>
                                                    <textarea
                                                        value={fileData.metadata.description}
                                                        onChange={(e) => updateFileMetadata(fileData.id, 'description', e.target.value)}
                                                        disabled={uploading || fileData.status === 'completed'}
                                                        placeholder="Describe the mood, style, or inspiration behind this wallpaper..."
                                                        rows={3}
                                                        className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed text-sm resize-none transition-all duration-200"
                                                        maxLength={500}
                                                    />
                                                    <p className="text-xs text-gray-500 mt-2 flex justify-between">
                                                        <span>Help others understand your vision</span>
                                                        <span>{fileData.metadata.description.length}/500</span>
                                                    </p>
                                                </div>

                                                {/* Enhanced Tags */}
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Tags
                                                    </label>
                                                    <div className="space-y-3">
                                                        {/* Tag input */}
                                                        <input
                                                            type="text"
                                                            value={currentTagInput[fileData.id] || ''}
                                                            onChange={(e) => handleTagInput(fileData.id, e.target.value)}
                                                            onKeyPress={(e) => handleTagKeyPress(e, fileData.id)}
                                                            onBlur={() => handleTagBlur(fileData.id)}
                                                            disabled={uploading || fileData.status === 'completed'}
                                                            placeholder="nature, sunset, mountains, blue, peaceful (separate with commas)"
                                                            className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed text-sm transition-all duration-200"
                                                        />

                                                        {/* Tags display */}
                                                        {fileData.metadata.tags.length > 0 && (
                                                            <div className="flex flex-wrap gap-2">
                                                                {fileData.metadata.tags.map((tag, index) => (
                                                                    <span
                                                                        key={index}
                                                                        className="inline-flex items-center gap-1 md:gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-2 py-1 md:px-3 md:py-1 rounded-full text-xs font-medium border border-blue-200"
                                                                    >
                                                                        {tag}
                                                                        {!(uploading || fileData.status === 'completed') && (
                                                                            <button
                                                                                onClick={() => removeTag(fileData.id, index)}
                                                                                className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                                                                            >
                                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                                </svg>
                                                                            </button>
                                                                        )}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}

                                                        <p className="text-xs text-gray-500">
                                                            <span className="hidden sm:inline">Add relevant tags to help others discover your wallpaper. Press Enter or use commas to separate tags.</span>
                                                            <span className="sm:hidden">Separate tags with commas, then press Enter</span>
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Category */}
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Category <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        value={fileData.metadata.category}
                                                        onChange={(e) => updateFileMetadata(fileData.id, 'category', e.target.value)}
                                                        disabled={uploading || fileData.status === 'completed'}
                                                        className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed text-sm transition-all duration-200"
                                                    >
                                                        {categories.map(category => (
                                                            <option key={category} value={category}>
                                                                {category}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Private checkbox */}
                                                <div className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg md:rounded-xl">
                                                    <div className="flex items-start gap-2 md:gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={fileData.metadata.isPrivate}
                                                            onChange={(e) => updateFileMetadata(fileData.id, 'isPrivate', e.target.checked)}
                                                            disabled={uploading || fileData.status === 'completed'}
                                                            className="mt-1 h-4 w-4 md:h-5 md:w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                        />
                                                        <div>
                                                            <label className="text-sm font-semibold text-gray-800 cursor-pointer">
                                                                Private Upload
                                                            </label>
                                                            <p className="text-xs text-gray-600 mt-1">
                                                                Only you will be able to see this wallpaper
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-xl md:text-2xl">
                                                        {fileData.metadata.isPrivate ? '🔒' : '🌐'}
                                                    </div>
                                                </div>

                                                {/* Progress bar for uploading files */}
                                                {fileData.status === 'uploading' && (
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-blue-600 font-medium">Processing...</span>
                                                            <span className="text-gray-500">Please wait</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2 md:h-3 overflow-hidden">
                                                            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 md:h-3 rounded-full transition-all duration-500 animate-pulse w-full"></div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Success state */}
                                                {fileData.status === 'completed' && (
                                                    <div className="text-center">
                                                        <div className="inline-flex items-center gap-2 md:gap-3 text-green-600 text-sm font-semibold bg-green-50 px-4 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl border border-green-200">
                                                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            Successfully uploaded!
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Error state */}
                                                {fileData.status === 'error' && (
                                                    <div className="text-center">
                                                        <div className="inline-flex items-center gap-2 md:gap-3 text-red-600 text-sm font-semibold bg-red-50 px-4 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl border border-red-200">
                                                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            Upload failed - try again
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Individual Remove Button */}
                                                <div className="pt-2 md:pt-4">
                                                    <button
                                                        onClick={() => confirmRemoveFile(fileData.id)}
                                                        disabled={uploading}
                                                        className="w-full bg-gray-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-gray-700 px-3 py-2 md:px-4 md:py-3 rounded-lg md:rounded-xl font-medium transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed text-sm inline-flex items-center justify-center gap-2 border border-gray-200"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        Remove This File
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Action Buttons at Bottom - Mobile responsive */}
                            <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-6 mt-8 md:mt-12">
                                <button
                                    onClick={uploadFiles}
                                    disabled={uploading || selectedFiles.every(f => f.status === 'completed') || pendingCount === 0}
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 md:px-8 md:py-4 rounded-lg md:rounded-xl font-semibold transition-all duration-300 inline-flex items-center justify-center gap-2 md:gap-3 transform hover:-translate-y-0.5 disabled:transform-none text-sm md:text-lg"
                                >
                                    {uploading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-t-2 border-b-2 border-white"></div>
                                            <span className="hidden sm:inline">Uploading {selectedFiles.filter(f => f.status === 'uploading').length} file{selectedFiles.filter(f => f.status === 'uploading').length !== 1 ? 's' : ''}...</span>
                                            <span className="sm:hidden">Uploading...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            {pendingCount === 1 ? 'Upload Wallpaper' : `Upload All (${pendingCount})`}
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={clearFiles}
                                    disabled={uploading}
                                    className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 md:px-8 md:py-4 rounded-lg md:rounded-xl font-semibold transition-all duration-300 inline-flex items-center justify-center gap-2 md:gap-3 transform hover:-translate-y-0.5 disabled:transform-none text-sm md:text-lg"
                                >
                                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    <span className="hidden sm:inline">Clear All Files</span>
                                    <span className="sm:hidden">Clear All</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Enhanced Tips Section - Mobile responsive */}
                    <div className="bg-white rounded-lg md:rounded-2xl border border-gray-100 p-4 md:p-8">
                        <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg md:rounded-xl flex items-center justify-center text-white text-xl md:text-2xl">
                                💡
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                                Pro Tips for Amazing Uploads
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-6 md:mb-8">
                            <div className="text-center p-4 md:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg md:rounded-xl border border-blue-100">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl md:text-2xl mx-auto mb-3 md:mb-4">
                                    📸
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2 md:mb-3 text-sm md:text-base">Perfect Quality</h4>
                                <div className="text-xs md:text-sm text-gray-600 space-y-1 md:space-y-2">
                                    <p>• High resolution (1920×1080+)</p>
                                    <p>• Sharp and clear details</p>
                                    <p>• Proper aspect ratios</p>
                                </div>
                            </div>

                            <div className="text-center p-4 md:p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg md:rounded-xl border border-green-100">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-xl md:text-2xl mx-auto mb-3 md:mb-4">
                                    🏷️
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2 md:mb-3 text-sm md:text-base">Smart Tagging</h4>
                                <div className="text-xs md:text-sm text-gray-600 space-y-1 md:space-y-2">
                                    <p>• Use descriptive keywords</p>
                                    <p>• Include colors and moods</p>
                                    <p>• Think like a searcher</p>
                                </div>
                            </div>

                            <div className="text-center p-4 md:p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg md:rounded-xl border border-purple-100">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-500 rounded-full flex items-center justify-center text-white text-xl md:text-2xl mx-auto mb-3 md:mb-4">
                                    ⚡
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2 md:mb-3 text-sm md:text-base">Quick Upload</h4>
                                <div className="text-xs md:text-sm text-gray-600 space-y-1 md:space-y-2">
                                    <p>• Drag & drop multiple files</p>
                                    <p>• Fill all required fields</p>
                                    <p>• Use JPG for faster uploads</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 md:p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg md:rounded-xl border border-amber-200">
                            <div className="flex items-start gap-3 md:gap-4">
                                <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-bold text-amber-900 mb-1 md:mb-2 text-sm md:text-lg">Remember</p>
                                    <p className="text-amber-800 leading-relaxed text-xs md:text-sm">
                                        Quality wallpapers with great titles, proper categories, and relevant tags get discovered more often!
                                        Take a moment to fill out all the details - it helps the community find exactly what they're looking for.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Remove Confirmation Popup */}
                    {showRemoveConfirm && (
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-lg flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-lg md:rounded-xl p-6 md:p-8 max-w-md w-full mx-4">
                                <div className="text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Remove File?</h3>
                                    <p className="text-gray-600 mb-6 text-sm md:text-base">
                                        Are you sure you want to remove this wallpaper? All entered information will be lost.
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={cancelRemove}
                                            className="flex-1 px-4 py-2 md:px-6 md:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg md:rounded-xl font-semibold transition-all duration-200 text-sm md:text-base"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => removeFile(showRemoveConfirm)}
                                            className="flex-1 px-4 py-2 md:px-6 md:py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg md:rounded-xl font-semibold transition-all duration-200 text-sm md:text-base"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes slide-in {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default UploadWallpaper;