import React, { useState, useCallback } from 'react';
import { 
  X, 
  Download, 
  Monitor, 
  Smartphone, 
  Tv, 
  Film, 
  Star, 
  Settings,
  ChevronDown,
  ChevronUp,
  Image,
  Zap,
  Flame,
  Check,
  Info,
  FileImage,
  Users,
  Calendar,
  HardDrive,
  Shield,
  Activity
} from 'lucide-react';

// Mock data for demonstration
const DOWNLOAD_PRESETS = {
  original: {
    label: 'Original Quality',
    description: 'Maximum resolution and quality',
    params: {},
    estimatedSize: '5-15 MB',
    recommended: false,
    priority: 'high'
  },
  compressed: {
    label: 'High Quality',
    description: 'Optimized for best balance',
    params: { quality: 85 },
    estimatedSize: '1-3 MB',
    recommended: true,
    priority: 'medium'
  },
  mobile: {
    label: 'Mobile (720p)',
    description: 'Optimized for mobile devices',
    params: { width: 720, quality: 80 },
    estimatedSize: '500KB-1MB',
    recommended: false,
    priority: 'low'
  },
  desktop: {
    label: 'Desktop (1366p)',
    description: 'Standard desktop resolution',
    params: { width: 1366, quality: 85 },
    estimatedSize: '1-2 MB',
    recommended: false,
    priority: 'medium'
  },
  fhd: {
    label: 'Full HD (1080p)',
    description: '1920×1080 resolution',
    params: { width: 1920, height: 1080, quality: 90 },
    estimatedSize: '2-4 MB',
    recommended: false,
    priority: 'medium'
  },
  uhd: {
    label: '4K Ultra HD',
    description: '3840×2160 resolution',
    params: { width: 3840, height: 2160, quality: 95 },
    estimatedSize: '8-20 MB',
    recommended: false,
    priority: 'high'
  }
};

const FORMAT_OPTIONS = {
  jpg: { 
    label: 'JPEG', 
    description: 'Universal compatibility',
    params: { output: 'jpg' },
    extension: 'jpg'
  },
  png: { 
    label: 'PNG', 
    description: 'Lossless with transparency',
    params: { output: 'png' },
    extension: 'png'
  },
  webp: { 
    label: 'WebP', 
    description: '30% smaller than JPEG',
    params: { output: 'webp' },
    extension: 'webp'
  },
  avif: { 
    label: 'AVIF', 
    description: '50% smaller, latest standard',
    params: { output: 'avif' },
    extension: 'avif'
  }
};

const DownloadOptionsModal = ({ 
  isOpen = true, 
  onClose = () => {}, 
  onDownload = () => {}, 
  wallpaper = {
    title: "Professional Workspace Setup",
    userDetails: { username: "design_studio" },
    category: "Business",
    downloadCount: 2847,
    viewCount: 12453,
    createdAt: "2025-01-15T10:30:00Z",
    imageUrl: "https://cloud.appwrite.io/v1/storage/buckets/bucket/files/file/view?project=project",
    compressedUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg"
  },
  isDownloading = false,
  downloadProgress = 0
}) => {
  const [selectedPreset, setSelectedPreset] = useState('compressed');
  const [selectedFormat, setSelectedFormat] = useState('jpg');
  const [showCustomOptions, setShowCustomOptions] = useState(false);
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');
  const [customFilename, setCustomFilename] = useState('');

  // Detect storage type
  const getStorageType = () => {
    if (wallpaper?.imageUrl?.includes('cloudinary.com')) {
      return 'cloudinary';
    } else if (wallpaper?.imageUrl?.includes('appwrite.io')) {
      return 'appwrite';
    }
    return 'unknown';
  };

  const storageType = getStorageType();

  // Check if preset will use Cloudinary transformations for Appwrite
  const willUseCloudinaryTransformation = (preset) => {
    return storageType === 'appwrite' && 
           preset !== 'original' && 
           preset !== 'compressed' && 
           wallpaper?.compressedUrl?.includes('cloudinary.com');
  };

  const handlePresetDownload = useCallback((preset, format) => {
    setSelectedPreset(preset);
    onDownload(preset, format);
  }, [onDownload]);

  const handleCustomDownload = useCallback(() => {
    const width = customWidth ? parseInt(customWidth) : null;
    const height = customHeight ? parseInt(customHeight) : null;
    const filename = customFilename.trim() || null;
    
    if (width || height) {
      onDownload('custom', selectedFormat, filename, { width, height });
    }
  }, [customWidth, customHeight, customFilename, selectedFormat, onDownload]);

  const getPresetIcon = (preset) => {
    const icons = {
      original: <Flame className="w-5 h-5 text-orange-600" />,
      compressed: <Zap className="w-5 h-5 text-blue-600" />,
      mobile: <Smartphone className="w-5 h-5 text-green-600" />,
      desktop: <Monitor className="w-5 h-5 text-purple-600" />,
      fhd: <Tv className="w-5 h-5 text-indigo-600" />,
      uhd: <Star className="w-5 h-5 text-yellow-600" />
    };
    return icons[preset] || <Image className="w-5 h-5 text-gray-600" />;
  };

  const getPresetColor = (preset, isSelected = false, isAvailable = true) => {
    if (!isAvailable) return 'border-gray-200 bg-gray-50 opacity-60';
    if (isSelected) return 'border-blue-500 bg-blue-50';
    
    const colors = {
      original: 'border-orange-200 bg-orange-50 hover:bg-orange-100',
      compressed: 'border-blue-200 bg-blue-50 hover:bg-blue-100',
      mobile: 'border-green-200 bg-green-50 hover:bg-green-100',
      desktop: 'border-purple-200 bg-purple-50 hover:bg-purple-100',
      fhd: 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100',
      uhd: 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100'
    };
    return colors[preset] || 'border-gray-200 bg-gray-50 hover:bg-gray-100';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed h-screen inset-0 z-[10000] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl lg:max-w-2xl max-h-[85vh] overflow-hidden mx-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Download className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Download Options</h2>
              <p className="text-xs md:text-sm text-gray-600">Choose your preferred quality and format</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
          </button>
        </div>

        {/* Progress Bar */}
        {isDownloading && downloadProgress > 0 && (
          <div className="px-4 md:px-6 py-3 bg-blue-50 border-b border-blue-100">
            <div className="flex items-center justify-between text-sm text-blue-900 mb-2">
              <span>Downloading...</span>
              <span>{downloadProgress}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${downloadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Quick Download Options */}
          <div className="mb-6 md:mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Download</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {Object.entries(DOWNLOAD_PRESETS).map(([key, preset]) => {
                const usesCloudinary = willUseCloudinaryTransformation(key);
                const isAvailable = storageType === 'cloudinary' || 
                                  key === 'original' || 
                                  key === 'compressed' || 
                                  usesCloudinary;
                
                return (
                  <button
                    key={key}
                    onClick={() => {
                      if (isAvailable) {
                        handlePresetDownload(key, selectedFormat);
                      }
                    }}
                    disabled={isDownloading || !isAvailable}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md disabled:cursor-not-allowed ${getPresetColor(key, selectedPreset === key, isAvailable)}`}
                  >
                    <div className="flex items-start gap-3">
                      {getPresetIcon(key)}
                      <div className="text-left flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-semibold text-gray-900">
                            {preset.label}
                          </div>
                          {preset.recommended && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              RECOMMENDED
                            </span>
                          )}
                          {!isAvailable && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                              UNAVAILABLE
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {preset.description}
                        </div>
                       
                      </div>
                      {isDownloading && selectedPreset === key && (
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Format Selection */}
          <div className="mb-6 md:mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Format Options</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(FORMAT_OPTIONS).map(([key, format]) => (
                <button
                  key={key}
                  onClick={() => setSelectedFormat(key)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    selectedFormat === key
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="font-semibold text-sm mb-1">{format.label}</div>
                  <div className="text-xs opacity-80">{format.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Options */}
          <div className="mb-6">
            <button
              onClick={() => setShowCustomOptions(!showCustomOptions)}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium mb-4"
            >
              <Settings className="w-5 h-5" />
              <span>Custom Options</span>
              {showCustomOptions ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>

            {showCustomOptions && (
              <div className="bg-gray-50 rounded-xl p-4 md:p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Width (pixels)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 1920"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Height (pixels)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 1080"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Filename (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Leave empty for auto-generated name"
                    value={customFilename}
                    onChange={(e) => setCustomFilename(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {(customWidth || customHeight) && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm text-green-800">
                      <Check className="w-4 h-4" />
                      <span>Custom: {customWidth || 'auto'} × {customHeight || 'auto'} pixels</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleCustomDownload}
                  disabled={isDownloading || (!customWidth && !customHeight)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {isDownloading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Download Custom
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 md:p-6 border-t border-gray-200 bg-gray-50 gap-3">
          {/* <div className="text-sm text-gray-600 text-center sm:text-left">
            💡 Download will start automatically
          </div> */}
          <button
            onClick={onClose}
            className="px-6  text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadOptionsModal;