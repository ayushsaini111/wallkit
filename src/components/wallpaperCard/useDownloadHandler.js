// useDownloadHandler.js - Fixed to ensure actual file downloads, not link opening

import { useState, useCallback } from 'react';

// Enhanced download quality presets with better descriptions
export const DOWNLOAD_PRESETS = {
  original: {
    label: 'Original Quality',
    description: 'Maximum quality • Largest file',
    params: {},
    icon: '🔥',
    estimatedSize: 'Large (5-15 MB)',
    recommended: false
  },
  compressed: {
    label: 'High Quality',
    description: 'Best balance • Fast download',
    params: { quality: 85 },
    icon: '⚡',
    estimatedSize: 'Medium (1-3 MB)',
    recommended: true
  },
  mobile: {
    label: 'Mobile Optimized',
    description: '720p • Perfect for phones',
    params: { width: 720, quality: 80 },
    icon: '📱',
    estimatedSize: 'Small (500KB-1MB)',
    recommended: false
  },
  desktop: {
    label: 'Desktop HD',
    description: '1366p • Great for laptops',
    params: { width: 1366, quality: 85 },
    icon: '💻',
    estimatedSize: 'Medium (1-2 MB)',
    recommended: false
  },
  hd: {
    label: 'HD (720p)',
    description: '1280×720 • Standard HD',
    params: { width: 1280, height: 720, quality: 85 },
    icon: '📺',
    estimatedSize: 'Medium (800KB-1.5MB)',
    recommended: false
  },
  fhd: {
    label: 'Full HD (1080p)',
    description: '1920×1080 • Perfect quality',
    params: { width: 1920, height: 1080, quality: 90 },
    icon: '🎬',
    estimatedSize: 'Large (2-4 MB)',
    recommended: false
  },
  uhd: {
    label: '4K Ultra HD',
    description: '3840×2160 • Maximum detail',
    params: { width: 3840, height: 2160, quality: 95 },
    icon: '🌟',
    estimatedSize: 'Very Large (8-20 MB)',
    recommended: false
  }
};

// Format options with better descriptions
export const FORMAT_OPTIONS = {
  jpg: { 
    label: 'JPG', 
    description: 'Universal • Smaller size', 
    params: { output: 'jpg' },
    icon: '🖼️'
  },
  png: { 
    label: 'PNG', 
    description: 'Lossless • Transparency', 
    params: { output: 'png' },
    icon: '🎨'
  },
  webp: { 
    label: 'WebP', 
    description: 'Modern • 30% smaller', 
    params: { output: 'webp' },
    icon: '🚀'
  },
  avif: { 
    label: 'AVIF', 
    description: 'Next-gen • 50% smaller', 
    params: { output: 'avif' },
    icon: '✨'
  }
};

export const useDownloadHandler = (wallpaper) => {
  const [downloadCount, setDownloadCount] = useState(wallpaper?.downloadCount || 0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Enhanced storage type detection
  const getStorageType = useCallback(() => {
    if (wallpaper?.imageUrl?.includes('cloudinary.com')) {
      return 'cloudinary';
    } else if (wallpaper?.imageUrl?.includes('appwrite.io') || wallpaper?.appwriteId) {
      return 'appwrite';
    }
    return 'unknown';
  }, [wallpaper]);

  // Optimized URL selection based on storage and quality
  const getOptimalUrl = useCallback((preset, format) => {
    const storageType = getStorageType();
    
    if (storageType === 'cloudinary') {
      // For Cloudinary, use compressed URL for all presets except original
      if (preset === 'original' && wallpaper?.imageUrl) {
        return wallpaper.imageUrl;
      } else if (wallpaper?.compressedUrl) {
        return wallpaper.compressedUrl;
      }
      return wallpaper?.imageUrl;
    } else if (storageType === 'appwrite') {
      // For Appwrite, only original and compressed work well
      if (preset === 'original' && wallpaper?.imageUrl) {
        return wallpaper.imageUrl;
      } else if (preset === 'compressed' && wallpaper?.compressedUrl) {
        return wallpaper.compressedUrl;
      } else if (wallpaper?.compressedUrl) {
        return wallpaper.compressedUrl;
      }
      return wallpaper?.imageUrl;
    }
    
    return wallpaper?.imageUrl || wallpaper?.compressedUrl;
  }, [wallpaper, getStorageType]);

  // Enhanced URL building with better Cloudinary transformations
  const buildDownloadUrl = useCallback((preset = 'compressed', format = 'jpg', customParams = null) => {
    const storageType = getStorageType();
    let baseUrl = getOptimalUrl(preset, format);

    if (!baseUrl) return null;

    // Use custom parameters if provided, otherwise use preset + format params
    const presetParams = customParams || DOWNLOAD_PRESETS[preset]?.params || {};
    const formatParams = FORMAT_OPTIONS[format]?.params || {};
    const allParams = { ...presetParams, ...formatParams };

    // For Appwrite storage, use Cloudinary transformations for non-standard presets
    if (storageType === 'appwrite' && Object.keys(allParams).length > 0 && 
        preset !== 'original' && preset !== 'compressed') {
      
      // Check if we have a Cloudinary compressed URL to work with
      if (wallpaper?.compressedUrl && wallpaper.compressedUrl.includes('cloudinary.com')) {
        console.log(`Using Cloudinary transformations for Appwrite ${preset} preset`);
        
        const urlParts = wallpaper.compressedUrl.split('/upload/');
        if (urlParts.length === 2) {
          const transformations = [];
          
          // Add quality transformation
          if (allParams.quality) {
            transformations.push(`q_${allParams.quality}`);
          }
          
          // Add dimension transformations
          if (allParams.width && allParams.height) {
            transformations.push(`w_${allParams.width},h_${allParams.height},c_fill`);
          } else if (allParams.width) {
            transformations.push(`w_${allParams.width},c_scale`);
          } else if (allParams.height) {
            transformations.push(`h_${allParams.height},c_scale`);
          }
          
          // Add format transformation
          if (allParams.output && allParams.output !== 'jpg') {
            transformations.push(`f_${allParams.output}`);
          }
          
          // Add optimization flags
          transformations.push('fl_progressive,fl_immutable_cache');
          
          const paramString = transformations.join(',');
          return `${urlParts[0]}/upload/${paramString}/${urlParts[1]}`;
        }
      }
      
      // Fallback to original Appwrite URL if no Cloudinary URL available
      console.log(`No Cloudinary URL available for transformations, using Appwrite ${preset} fallback`);
      return baseUrl;
    }
    
    // For Cloudinary URLs with transformations
    if (storageType === 'cloudinary' && Object.keys(allParams).length > 0) {
      const urlParts = baseUrl.split('/upload/');
      if (urlParts.length === 2) {
        const transformations = [];
        
        // Add quality transformation
        if (allParams.quality) {
          transformations.push(`q_${allParams.quality}`);
        }
        
        // Add dimension transformations
        if (allParams.width && allParams.height) {
          transformations.push(`w_${allParams.width},h_${allParams.height},c_fill`);
        } else if (allParams.width) {
          transformations.push(`w_${allParams.width},c_scale`);
        } else if (allParams.height) {
          transformations.push(`h_${allParams.height},c_scale`);
        }
        
        // Add format transformation
        if (allParams.output) {
          transformations.push(`f_${allParams.output}`);
        }
        
        // Add optimization flags
        transformations.push('fl_progressive,fl_immutable_cache');
        
        const paramString = transformations.join(',');
        return `${urlParts[0]}/upload/${paramString}/${urlParts[1]}`;
      }
    }

    // For Appwrite with limited transformations (original/compressed only)
    if (storageType === 'appwrite' && customParams && (customParams.width || customParams.height)) {
      const appwriteInfo = parseAppwriteUrl(baseUrl);
      if (appwriteInfo) {
        const { baseUrl: domain, projectId, bucketId, fileId } = appwriteInfo;
        const previewUrl = `${domain}/v1/storage/buckets/${bucketId}/files/${fileId}/preview`;
        
        const url = new URL(previewUrl);
        url.searchParams.set('project', projectId);
        
        if (customParams.width) url.searchParams.set('width', customParams.width);
        if (customParams.height) url.searchParams.set('height', customParams.height);
        if (customParams.quality) url.searchParams.set('quality', customParams.quality);
        if (customParams.output) url.searchParams.set('format', customParams.output);
        
        return url.toString();
      }
    }

    return baseUrl; // Return the optimal URL
  }, [wallpaper, getStorageType, getOptimalUrl]);

  // Parse Appwrite URL helper
  const parseAppwriteUrl = useCallback((url) => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      
      const bucketIndex = pathParts.indexOf('buckets');
      const filesIndex = pathParts.indexOf('files');
      
      if (bucketIndex !== -1 && filesIndex !== -1) {
        const bucketId = pathParts[bucketIndex + 1];
        const fileId = pathParts[filesIndex + 1];
        const projectId = urlObj.searchParams.get('project');
        
        return {
          baseUrl: `${urlObj.protocol}//${urlObj.host}`,
          projectId,
          bucketId,
          fileId
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing Appwrite URL:', error);
      return null;
    }
  }, []);

  // Enhanced filename generation
  const generateFilename = useCallback((preset, format, customFilename = null) => {
    if (customFilename) {
      const extension = format === 'jpg' ? 'jpg' : format;
      return customFilename.endsWith(`.${extension}`) ? customFilename : `${customFilename}.${extension}`;
    }
    
    const baseTitle = wallpaper?.title || `wallpaper_${Date.now()}`;
    const cleanTitle = baseTitle
      .replace(/[^a-z0-9\s]/gi, '')
      .replace(/\s+/g, '_')
      .toLowerCase()
      .substring(0, 50); // Limit filename length
    
    const presetSuffix = preset !== 'original' && preset !== 'compressed' ? `_${preset}` : '';
    const qualitySuffix = preset === 'original' ? '_original' : '';
    const extension = format;
    
    return `${cleanTitle}${qualitySuffix}${presetSuffix}.${extension}`;
  }, [wallpaper]);

  // ✅ FIXED DOWNLOAD FUNCTION - ENSURES ACTUAL FILE DOWNLOAD, NOT LINK OPENING
  const handleDownload = useCallback(async (preset = 'compressed', format = 'jpg', customFilename = null, customDimensions = null) => {
    if (isDownloading || !wallpaper?.imageUrl) return;

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      let downloadUrl;
      
      // Handle custom dimensions
      if (preset === 'custom' && customDimensions) {
        const storageType = getStorageType();
        
        if (storageType === 'appwrite' && wallpaper?.compressedUrl?.includes('cloudinary.com')) {
          console.log('Using Cloudinary transformations for Appwrite custom download');
          
          const customParams = {};
          if (customDimensions.width) customParams.width = customDimensions.width;
          if (customDimensions.height) customParams.height = customDimensions.height;
          if (format !== 'jpg') customParams.output = format;
          customParams.quality = 85;
          
          const baseUrl = wallpaper.compressedUrl;
          const urlParts = baseUrl.split('/upload/');
          
          if (urlParts.length === 2) {
            const transformations = [];
            
            if (customParams.quality) transformations.push(`q_${customParams.quality}`);
            
            if (customParams.width && customParams.height) {
              transformations.push(`w_${customParams.width},h_${customParams.height},c_fill`);
            } else if (customParams.width) {
              transformations.push(`w_${customParams.width},c_scale`);
            } else if (customParams.height) {
              transformations.push(`h_${customParams.height},c_scale`);
            }
            
            if (customParams.output) transformations.push(`f_${customParams.output}`);
            transformations.push('fl_progressive,fl_immutable_cache');
            
            const paramString = transformations.join(',');
            downloadUrl = `${urlParts[0]}/upload/${paramString}/${urlParts[1]}`;
          } else {
            downloadUrl = baseUrl;
          }
        } else if (storageType === 'appwrite') {
          const appwriteInfo = parseAppwriteUrl(wallpaper.imageUrl);
          if (appwriteInfo) {
            const { baseUrl: domain, projectId, bucketId, fileId } = appwriteInfo;
            const previewUrl = `${domain}/v1/storage/buckets/${bucketId}/files/${fileId}/preview`;
            
            const url = new URL(previewUrl);
            url.searchParams.set('project', projectId);
            
            if (customDimensions.width) url.searchParams.set('width', customDimensions.width);
            if (customDimensions.height) url.searchParams.set('height', customDimensions.height);
            url.searchParams.set('quality', '85');
            if (format !== 'jpg') url.searchParams.set('format', format);
            
            downloadUrl = url.toString();
          } else {
            downloadUrl = wallpaper.imageUrl;
          }
        } else {
          const customParams = {};
          if (customDimensions.width) customParams.width = customDimensions.width;
          if (customDimensions.height) customParams.height = customDimensions.height;
          if (format !== 'jpg') customParams.output = format;
          
          downloadUrl = buildDownloadUrl('original', 'jpg', customParams);
        }
      } else {
        downloadUrl = buildDownloadUrl(preset, format);
      }
      
      if (!downloadUrl) {
        throw new Error('Could not build download URL');
      }

      console.log(`Downloading ${preset} quality from:`, downloadUrl);

      // ✅ ENHANCED FETCH WITH PROPER CORS AND HEADERS
      const response = await fetch(downloadUrl, {
        method: 'GET',
        mode: 'cors', // Enable CORS
        cache: 'no-cache',
        headers: {
          'Accept': 'image/*,*/*;q=0.8',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }

      // ✅ IMPROVED PROGRESS TRACKING
      const contentLength = response.headers.get('content-length');
      const total = parseInt(contentLength, 10);
      let loaded = 0;

      const reader = response.body?.getReader();
      if (!reader) {
        // Fallback for browsers that don't support streaming
        const blob = await response.blob();
        console.log('Downloaded blob size:', blob.size, 'bytes');
        
        // ✅ FORCE DOWNLOAD WITH PROPER BLOB HANDLING
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = generateFilename(preset, format, customFilename);
        link.style.display = 'none';
        
        // ✅ ENSURE DOWNLOAD ATTRIBUTE IS RESPECTED
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 100);

        // Track download success
        if (wallpaper._id) {
          try {
            await fetch('/api/download', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                wallpaperId: wallpaper._id,
                preset,
                format,
                storageType: getStorageType(),
                ...(customDimensions && { dimensions: customDimensions })
              }),
            });
            setDownloadCount(prev => prev + 1);
          } catch (trackErr) {
            console.error('Download tracking failed:', trackErr);
          }
        }

        setShowDownloadMenu(false);
        console.log('Download completed successfully (fallback method)');
        return;
      }

      // ✅ STREAMING DOWNLOAD WITH PROGRESS
      const chunks = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        chunks.push(value);
        loaded += value.length;
        
        if (total) {
          setDownloadProgress(Math.round((loaded / total) * 100));
        }
      }

      const blob = new Blob(chunks, { 
        type: response.headers.get('content-type') || 'image/jpeg' 
      });
      console.log('Downloaded blob size:', blob.size, 'bytes');
      
      // ✅ FORCE DOWNLOAD WITH PROPER BLOB HANDLING
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = generateFilename(preset, format, customFilename);
      link.style.display = 'none';
      
      // ✅ ENSURE DOWNLOAD ATTRIBUTE IS RESPECTED
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      // Track download on backend (non-blocking)
      if (wallpaper._id) {
        try {
          await fetch('/api/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              wallpaperId: wallpaper._id,
              preset,
              format,
              storageType: getStorageType(),
              ...(customDimensions && { dimensions: customDimensions })
            }),
          });
          setDownloadCount(prev => prev + 1);
        } catch (trackErr) {
          console.error('Download tracking failed:', trackErr);
        }
      }

      setShowDownloadMenu(false);
      console.log('Download completed successfully');

    } catch (err) {
      console.error('Download failed:', err);
      
      // ✅ IMPROVED FALLBACK - TRY DIRECT DOWNLOAD BEFORE OPENING LINK
      try {
        const fallbackUrl = buildDownloadUrl(preset, format) || wallpaper.imageUrl || wallpaper.compressedUrl;
        console.log('Trying direct download fallback:', fallbackUrl);
        
        // Try one more time with a simple approach
        const response = await fetch(fallbackUrl, { mode: 'no-cors' });
        const blob = await response.blob();
        
        if (blob.size > 0) {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = generateFilename(preset, format, customFilename);
          link.style.display = 'none';
          
          document.body.appendChild(link);
          link.click();
          
          setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          }, 100);
          
          console.log('Fallback download successful');
          return;
        }
      } catch (fallbackErr) {
        console.error('Fallback download also failed:', fallbackErr);
      }
      
      // ✅ LAST RESORT - SHOW USER-FRIENDLY ERROR
      alert(`Download failed. This might be due to CORS restrictions or network issues.\n\nTip: Right-click the image and select "Save image as..." to download manually.`);
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  }, [wallpaper, isDownloading, buildDownloadUrl, generateFilename, getStorageType, parseAppwriteUrl]);

  // Quick download with optimized defaults
  const quickDownload = useCallback((e) => {
    e?.stopPropagation();
    handleDownload('original', 'jpg'); // Default to original quality
  }, [handleDownload]);

  // Custom download function
  const customDownload = useCallback(async (width, height, format = 'jpg', filename = null) => {
    if (isDownloading || !wallpaper?.imageUrl) return;

    const customDimensions = {};
    if (width) customDimensions.width = width;
    if (height) customDimensions.height = height;

    await handleDownload('custom', format, filename, customDimensions);
  }, [handleDownload, wallpaper, isDownloading]);

  const getPreviewUrl = useCallback((preset = 'compressed') => {
    return buildDownloadUrl(preset, 'jpg');
  }, [buildDownloadUrl]);

  const canDownload = useCallback(() => {
    return !!(wallpaper?.imageUrl && !isDownloading);
  }, [wallpaper, isDownloading]);

  const toggleDownloadMenu = useCallback((e) => {
    e?.stopPropagation();
    setShowDownloadMenu(prev => !prev);
  }, []);

  return {
    handleDownload,
    quickDownload,
    customDownload,
    downloadCount,
    isDownloading,
    downloadProgress,
    showDownloadMenu,
    setShowDownloadMenu,
    toggleDownloadMenu,
    buildDownloadUrl,
    generateFilename,
    getPreviewUrl,
    canDownload,
    storageType: getStorageType(),
    getOptimalUrl
  };
};