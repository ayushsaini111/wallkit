// useDownloadHandler.js - Hook for handling wallpaper downloads

import { useState, useCallback } from 'react';

export const useDownloadHandler = (wallpaper) => {
  const [downloadCount, setDownloadCount] = useState(wallpaper?.downloadCount || 0);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = useCallback(async (e) => {
    e?.stopPropagation();
    
    if (isDownloading || !wallpaper?.imageUrl) return;

    setIsDownloading(true);

    try {
      // Fetch the image
      const response = await fetch(wallpaper.imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename
      const filename = wallpaper.title 
        ? `${wallpaper.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`
        : `wallpaper_${wallpaper._id || Date.now()}.jpg`;
      
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up object URL
      window.URL.revokeObjectURL(url);

      // Track download on backend (non-blocking)
      if (wallpaper._id) {
        fetch('/api/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallpaperId: wallpaper._id }),
        })
        .then(res => {
          if (res.ok) {
            setDownloadCount(prev => prev + 1);
          }
        })
        .catch(err => console.error('Download tracking failed:', err));
      }

    } catch (err) {
      console.error('Download failed:', err);
      
      // Fallback: try opening in new tab
      try {
        const newWindow = window.open(wallpaper.imageUrl, '_blank');
        if (!newWindow) {
          // If popup blocked, copy URL to clipboard
          await navigator.clipboard.writeText(wallpaper.imageUrl);
          alert('Download blocked. Image URL copied to clipboard.');
        }
      } catch (fallbackErr) {
        console.error('Fallback download failed:', fallbackErr);
        alert('Download failed. Please try again or right-click the image to save.');
      }
    } finally {
      setIsDownloading(false);
    }
  }, [wallpaper, isDownloading]);

  const downloadWithCustomName = useCallback(async (customName, e) => {
    e?.stopPropagation();
    
    if (isDownloading || !wallpaper?.imageUrl) return;

    setIsDownloading(true);

    try {
      const response = await fetch(wallpaper.imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const filename = customName.endsWith('.jpg') || customName.endsWith('.png') || customName.endsWith('.jpeg')
        ? customName
        : `${customName}.jpg`;
      
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Track download
      if (wallpaper._id) {
        fetch('/api/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallpaperId: wallpaper._id }),
        })
        .then(res => {
          if (res.ok) {
            setDownloadCount(prev => prev + 1);
          }
        })
        .catch(err => console.error('Download tracking failed:', err));
      }

    } catch (err) {
      console.error('Custom download failed:', err);
      alert('Download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  }, [wallpaper, isDownloading]);

  const getDownloadUrl = useCallback(() => {
    return wallpaper?.imageUrl;
  }, [wallpaper]);

  const canDownload = useCallback(() => {
    return !!(wallpaper?.imageUrl && !isDownloading);
  }, [wallpaper, isDownloading]);

  return {
    handleDownload,
    downloadWithCustomName,
    downloadCount,
    isDownloading,
    getDownloadUrl,
    canDownload
  };
};