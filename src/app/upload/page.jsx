'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { uploadImageToAppwrite } from '@/lib/appwrite/storage';
import { uploadImageToCloudinary } from '@/lib/appwrite/storagetwo';

const UploadWallpaper = () => {
    const { data: session } = useSession();
    const [dragActive, setDragActive] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [uploadResults, setUploadResults] = useState([]);
    const [currentTagInput, setCurrentTagInput] = useState({});
    const fileInputRef = useRef(null);

    // Predefined categories
    const categories = [
        'Nature',
        'Abstract',
        'Minimalist',
        'Animals',
        'Cityscape',
        'Space',
        'Technology',
        'Fantasy',
        'Textures & Patterns',
        'Food & Drinks',
        'People',
        'Architecture',
        'Cars & Vehicles',
        'Art & Illustration',
        '3D Renders',
        'Typography',
        'Dark',
        'Light',
        'Vintage',
        'Sports',
        'Other'
    ];

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
            // Check if file is an image
            if (!file.type.startsWith('image/')) {
                alert(`${file.name} is not a valid image file`);
                return false;
            }
            // Check file size (max 50MB for wallpapers)
            if (file.size > 50 * 1024 * 1024) {
                alert(`${file.name} is too large. Maximum size is 50MB`);
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
                    title: file.name.split('.')[0], // Remove extension for default title
                    description: '',
                    tags: [],
                    category: 'Other',
                    isPrivate: false
                }
            }));

            setSelectedFiles(prev => [...filesWithPreview, ...prev]);

            // Initialize tag inputs for new files
            const newTagInputs = {};
            filesWithPreview.forEach(file => {
                newTagInputs[file.id] = '';
            });
            setCurrentTagInput(prev => ({ ...prev, ...newTagInputs }));
        }
    };

    // Update file metadata
    const updateFileMetadata = (fileId, field, value) => {
        setSelectedFiles(prev =>
            prev.map(f =>
                f.id === fileId
                    ? {
                        ...f,
                        metadata: {
                            ...f.metadata,
                            [field]: value
                        }
                    }
                    : f
            )
        );
    };

    // Handle tag input
    const handleTagInput = (fileId, value) => {
        setCurrentTagInput(prev => ({ ...prev, [fileId]: value }));
    };

    // Handle tag enter key
    const handleTagKeyPress = (e, fileId) => {
        if (e.key === 'Enter' && currentTagInput[fileId]?.trim()) {
            const currentFile = selectedFiles.find(f => f.id === fileId);
            const newTag = currentTagInput[fileId].trim();

            if (!currentFile.metadata.tags.includes(newTag)) {
                updateFileMetadata(fileId, 'tags', [...currentFile.metadata.tags, newTag]);
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

    // Remove file from selection
    const removeFile = (fileId) => {
        setSelectedFiles(prev => {
            const updatedFiles = prev.filter(f => f.id !== fileId);
            // Cleanup object URL to prevent memory leaks
            const fileToRemove = prev.find(f => f.id === fileId);
            if (fileToRemove?.preview) {
                URL.revokeObjectURL(fileToRemove.preview);
            }
            return updatedFiles;
        });

        // Cleanup tag input
        setCurrentTagInput(prev => {
            const updated = { ...prev };
            delete updated[fileId];
            return updated;
        });

        // Also remove from upload progress if exists
        setUploadProgress(prev => {
            const updated = { ...prev };
            delete updated[fileId];
            return updated;
        });
    };

    // Validate file data before upload
    const validateFileData = (fileData) => {
        const { title, description, category } = fileData.metadata;

        if (!title.trim()) {
            return 'Title is required';
        }
        if (title.trim().length < 3) {
            return 'Title must be at least 3 characters long';
        }
        if (description.trim().length > 500) {
            return 'Description must be less than 500 characters';
        }
        if (!category) {
            return 'Category is required';
        }

        return null;
    };

    // Upload files using your existing logic
    const uploadFiles = async () => {
        if (selectedFiles.length === 0) return;

        // Validate all files first
        const validationErrors = [];
        selectedFiles.forEach(fileData => {
            if (fileData.status === 'pending') {
                const error = validateFileData(fileData);
                if (error) {
                    validationErrors.push(`${fileData.name}: ${error}`);
                }
            }
        });

        if (validationErrors.length > 0) {
            alert('Please fix the following errors:\n\n' + validationErrors.join('\n'));
            return;
        }

        setUploading(true);
        const results = [];

        for (const fileData of selectedFiles) {
            if (fileData.status !== 'pending') continue;

            try {
                // Update progress
                setUploadProgress(prev => ({
                    ...prev,
                    [fileData.id]: { status: 'uploading', progress: 0 }
                }));

                // Update file status
                setSelectedFiles(prev =>
                    prev.map(f =>
                        f.id === fileData.id
                            ? { ...f, status: 'uploading' }
                            : f
                    )
                );
                console.log("size", fileData.size);


                // Upload to Appwrite using your existing function
                let imageUrlObj;
                if (fileData.size > 10 * 1024 * 1024) {
                    // Upload to Appwrite
                    console.log("Uploading to Appwrite:", fileData.file.name);
                    imageUrlObj = await uploadImageToAppwrite(fileData.file);
                    console.log("Appwrite upload result:", imageUrlObj);

                } else {
                    // Upload to Cloudinary
                    console.log("Uploading to Cloudinary:", fileData.file.name);
                    
                    imageUrlObj = await uploadImageToCloudinary(fileData.file);
                    console.log("Cloudinary upload result:", imageUrlObj);

                }


                // Prepare form data for your backend
                const formData = new FormData();
                formData.append('title', fileData.metadata.title);
                formData.append('description', fileData.metadata.description);
                formData.append('tags', fileData.metadata.tags.join(','));
                formData.append('category', fileData.metadata.category);
                formData.append('isPrivate', fileData.metadata.isPrivate);
                formData.append('imageUrl', imageUrlObj.url);
                formData.append('userId', session.user._id);
                formData.append('appwriteId', imageUrlObj.id);


                console.log('[CLIENT] Sending form to backend...');
                const res = await fetch('/api/wallpaperupload', {
                    method: 'POST',
                    body: formData,
                });

                const data = await res.json();
                console.log('[CLIENT] Upload result:', data);

                if (data.success) {
                    // Update progress to completion
                    setUploadProgress(prev => ({
                        ...prev,
                        [fileData.id]: { status: 'completed', progress: 100 }
                    }));

                    // Update file status
                    setSelectedFiles(prev =>
                        prev.map(f =>
                            f.id === fileData.id
                                ? { ...f, status: 'completed', uploadedId: imageUrlObj.id }
                                : f
                        )
                    );

                    results.push({
                        id: fileData.id,
                        name: fileData.name,
                        status: 'success',
                        uploadedId: imageUrlObj.id,
                        url: imageUrlObj.url
                    });
                } else {
                    throw new Error(data.message || 'Upload failed');
                }

            } catch (error) {
                console.error(`Error uploading ${fileData.name}:`, error);

                // Update progress to error
                setUploadProgress(prev => ({
                    ...prev,
                    [fileData.id]: { status: 'error', progress: 0 }
                }));

                // Update file status
                setSelectedFiles(prev =>
                    prev.map(f =>
                        f.id === fileData.id
                            ? { ...f, status: 'error' }
                            : f
                    )
                );

                results.push({
                    id: fileData.id,
                    name: fileData.name,
                    status: 'error',
                    error: error.message
                });
            }
        }

        setUploadResults(results);
        setUploading(false);
    };

    // Clear all files
    const clearFiles = () => {
        // Cleanup object URLs
        selectedFiles.forEach(fileData => {
            if (fileData.preview) {
                URL.revokeObjectURL(fileData.preview);
            }
        });

        setSelectedFiles([]);
        setUploadProgress({});
        setUploadResults([]);
        setCurrentTagInput({});
    };

    // Start over (reset everything)
    const startOver = () => {
        clearFiles();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
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

    // If not authenticated, show login prompt
    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center p-12 bg-white rounded-2xl shadow-2xl max-w-md mx-4">
                    <div className="text-7xl mb-6 animate-bounce">🔐</div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Access Required</h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        Please sign in to start sharing your beautiful wallpapers with our community
                    </p>
                    <a
                        href="/auth/login"
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 inline-flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        Sign In to Continue
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-16 bg-gradient-to-br from-gray-50 via-white to-blue-50">
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-7xl mx-auto">
                    {/* Enhanced Header */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-400 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
                                🎨
                            </div>
                            <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
                                <span className="bg-gradient-to-r ml-8 from-red-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                                    upload Your vision
                                </span>


                            </h1>
                        </div>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            Transform spaces and inspire others by uploading your stunning wallpapers.
                            Join our creative community and help others discover the perfect backdrop for their digital world.
                        </p>
                    </div>

                    {/* Enhanced Upload Area */}
                    <div className="mb-12">
                        <div
                            className={`relative border-2 border-dashed rounded-3xl p-16 text-center transition-all duration-300 ${dragActive
                                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 scale-[1.02] shadow-2xl'
                                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50/50 shadow-xl'
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

                            <div className="space-y-8">
                                <div className={`text-8xl transition-all duration-300 ${dragActive ? 'scale-125' : ''}`}>
                                    {dragActive ? '🎯' : '🖼️'}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                        {dragActive ? 'Drop your masterpieces here!' : 'Upload Your Wallpapers'}
                                    </h3>
                                    <p className="text-gray-600 mb-8 text-lg">
                                        Drag and drop your images here, or click to browse your collection
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-10 py-4 rounded-xl font-semibold transition-all duration-300 inline-flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none text-lg"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Browse Files
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-500 max-w-3xl mx-auto">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-700">Multiple Formats</div>
                                            <div className="text-xs">JPG, PNG, WebP, GIF</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-700">Large Files</div>
                                            <div className="text-xs">Up to 50MB each</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h2a1 1 0 011 1v3" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-700">High Quality</div>
                                            <div className="text-xs">1920×1080+ recommended</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Selected Files */}
                    {selectedFiles.length > 0 && (
                        <div className="mb-12">
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-3xl font-bold text-gray-900">
                                        Selected Files
                                    </h2>
                                    <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
                                        {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}
                                    </div>
                                    {pendingCount > 0 && (
                                        <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold">
                                            {pendingCount} pending
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {selectedFiles.map((fileData) => (
                                    <div key={fileData.id} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300">
                                        {/* Image Preview */}
                                        <div className="aspect-video relative bg-gradient-to-br from-gray-100 to-gray-200 group">
                                            <Image
                                                src={fileData.preview}
                                                alt={fileData.name}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                sizes="(max-width: 1024px) 100vw, 50vw"
                                            />

                                            {/* Status overlay */}
                                            {fileData.status === 'uploading' && (
                                                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center backdrop-blur-sm">
                                                    <div className="text-white text-center">
                                                        <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-b-3 border-white mx-auto mb-4"></div>
                                                        <p className="text-lg font-semibold">Uploading...</p>
                                                        <p className="text-sm opacity-90">This might take a moment</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Status badge */}
                                            <div className={`absolute top-4 left-4 px-3 py-2 rounded-xl text-sm font-semibold ${getStatusColor(fileData.status)} flex items-center gap-2 shadow-lg backdrop-blur-sm`}>
                                                {getStatusIcon(fileData.status)}
                                                {fileData.status.charAt(0).toUpperCase() + fileData.status.slice(1)}
                                            </div>
                                        </div>

                                        {/* File Info and Form */}
                                        <div className="p-8 text-black">
                                            <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                                                <span className="font-medium truncate flex-1 mr-4">{fileData.name}</span>
                                                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{formatFileSize(fileData.size)}</span>
                                            </div>

                                            {/* Metadata Form */}
                                            <div className="space-y-6">
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
                                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed text-sm transition-all duration-200"
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
                                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed text-sm resize-none transition-all duration-200"
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
                                                            disabled={uploading || fileData.status === 'completed'}
                                                            placeholder="Type a tag and press Enter..."
                                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed text-sm transition-all duration-200"
                                                        />

                                                        {/* Tags display */}
                                                        {fileData.metadata.tags.length > 0 && (
                                                            <div className="flex flex-wrap gap-2">
                                                                {fileData.metadata.tags.map((tag, index) => (
                                                                    <span
                                                                        key={index}
                                                                        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium border border-blue-200"
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
                                                            Add relevant tags to help others discover your wallpaper
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
                                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed text-sm transition-all duration-200"
                                                    >
                                                        {categories.map(category => (
                                                            <option key={category} value={category}>
                                                                {category}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Private checkbox */}
                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                                    <div className="flex items-start gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={fileData.metadata.isPrivate}
                                                            onChange={(e) => updateFileMetadata(fileData.id, 'isPrivate', e.target.checked)}
                                                            disabled={uploading || fileData.status === 'completed'}
                                                            className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                                                    <div className="text-2xl">
                                                        {fileData.metadata.isPrivate ? '🔒' : '🌐'}
                                                    </div>
                                                </div>

                                                {/* Progress bar for uploading files */}
                                                {fileData.status === 'uploading' && (
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-blue-600 font-medium">Uploading...</span>
                                                            <span className="text-gray-500">Please wait</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500 animate-pulse w-full"></div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Success state */}
                                                {fileData.status === 'completed' && (
                                                    <div className="text-center">
                                                        <div className="inline-flex items-center gap-3 text-green-600 text-sm font-semibold bg-green-50 px-6 py-3 rounded-xl border border-green-200">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            Successfully uploaded!
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Error state */}
                                                {fileData.status === 'error' && (
                                                    <div className="text-center">
                                                        <div className="inline-flex items-center gap-3 text-red-600 text-sm font-semibold bg-red-50 px-6 py-3 rounded-xl border border-red-200">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            Upload failed
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Individual Remove Button */}
                                                <div className="pt-4">
                                                    <button
                                                        onClick={() => removeFile(fileData.id)}
                                                        disabled={uploading}
                                                        className="w-full bg-gray-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-gray-700 px-4 py-3 rounded-xl font-medium transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed text-sm inline-flex items-center justify-center gap-2 border border-gray-200"
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

                            {/* Action Buttons at Bottom */}
                            <div className="flex justify-center gap-6 mt-12">
                                <button
                                    onClick={uploadFiles}
                                    disabled={uploading || selectedFiles.every(f => f.status === 'completed') || pendingCount === 0}
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 inline-flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none text-lg"
                                >
                                    {uploading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                            Uploading {selectedFiles.filter(f => f.status === 'uploading').length} file{selectedFiles.filter(f => f.status === 'uploading').length !== 1 ? 's' : ''}...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            {pendingCount === 1 ? 'Upload Wallpaper' : `Upload All `}
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={clearFiles}
                                    disabled={uploading}
                                    className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 inline-flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none text-lg"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    {pendingCount === 1 ? 'remove wallpaper' : `remove all wallpapers`}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Upload Results */}
                    {uploadResults.length > 0 && (
                        <div className="mb-12">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-3xl font-bold text-gray-900">Upload Results</h2>
                                    <div className="flex gap-2">
                                        {uploadResults.filter(r => r.status === 'success').length > 0 && (
                                            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
                                                {uploadResults.filter(r => r.status === 'success').length} successful
                                            </div>
                                        )}
                                        {uploadResults.filter(r => r.status === 'error').length > 0 && (
                                            <div className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-semibold">
                                                {uploadResults.filter(r => r.status === 'error').length} failed
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={startOver}
                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 inline-flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Upload More
                                </button>
                            </div>

                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                                <div className="space-y-0">
                                    {uploadResults.map((result, index) => (
                                        <div
                                            key={result.id}
                                            className={`p-6 flex items-center justify-between transition-all duration-300 ${index !== uploadResults.length - 1 ? 'border-b border-gray-100' : ''
                                                } ${result.status === 'success'
                                                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100'
                                                    : 'bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${result.status === 'success'
                                                        ? 'bg-green-100 text-green-600'
                                                        : 'bg-red-100 text-red-600'
                                                    }`}>
                                                    {result.status === 'success' ? (
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 text-lg">{result.name}</p>
                                                    {result.error && (
                                                        <p className="text-sm text-red-600 mt-1">{result.error}</p>
                                                    )}
                                                    {result.status === 'success' && (
                                                        <p className="text-sm text-green-600 mt-1">Ready to inspire others!</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className={`text-sm font-bold px-4 py-2 rounded-full ${result.status === 'success'
                                                    ? 'text-green-700 bg-green-100'
                                                    : 'text-red-700 bg-red-100'
                                                }`}>
                                                {result.status === 'success' ? '✓ Uploaded' : '✗ Failed'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Enhanced Tips Section */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg">
                                💡
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">
                                Pro Tips for Amazing Uploads
                            </h3>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 mb-8">
                            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg">
                                    📸
                                </div>
                                <h4 className="font-bold text-gray-900 mb-3">Perfect Quality</h4>
                                <div className="text-sm text-gray-600 space-y-2">
                                    <p>• High resolution (1920×1080+)</p>
                                    <p>• Sharp and clear details</p>
                                    <p>• Proper aspect ratios</p>
                                </div>
                            </div>

                            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg">
                                    🏷️
                                </div>
                                <h4 className="font-bold text-gray-900 mb-3">Smart Tagging</h4>
                                <div className="text-sm text-gray-600 space-y-2">
                                    <p>• Use descriptive keywords</p>
                                    <p>• Include colors and moods</p>
                                    <p>• Think like a searcher</p>
                                </div>
                            </div>

                            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg">
                                    ⚡
                                </div>
                                <h4 className="font-bold text-gray-900 mb-3">Quick Upload</h4>
                                <div className="text-sm text-gray-600 space-y-2">
                                    <p>• Drag & drop multiple files</p>
                                    <p>• Fill all required fields</p>
                                    <p>• Use JPG for faster uploads</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-bold text-amber-900 mb-2 text-lg">Remember</p>
                                    <p className="text-amber-800 leading-relaxed">
                                        Quality wallpapers with great titles, proper categories, and relevant tags get discovered more often!
                                        Take a moment to fill out all the details - it helps the community find exactly what they're looking for.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadWallpaper;