// DownloadOptionsModal.js - Enhanced with Aspect Ratios and Mobile Responsive Design

import React, { useState, useCallback, useEffect } from 'react';
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
  Activity,
  ArrowLeft,
  Tablet
} from 'lucide-react';

import { DOWNLOAD_PRESETS, FORMAT_OPTIONS, PRESET_CATEGORIES } from '@/components/wallpaperCard/useDownloadHandler';

const DownloadOptionsModal = ({ 
  isOpen = false, 
  onClose = () => {}, 
  onDownload = () => {}, 
  wallpaper = {},
  isDownloading = false,
  downloadProgress = 0
}) => {
  const [selectedPreset, setSelectedPreset] = useState('compressed');
  const [selectedFormat, setSelectedFormat] = useState('jpg');
  const [showCustomOptions, setShowCustomOptions] = useState(false);
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');
  const [customFilename, setCustomFilename] = useState('');
  const [expandedCategory, setExpandedCategory] = useState('quality');

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

  // Check if preset is available
  const isPresetAvailable = (preset) => {
    if (preset === 'original' || preset === 'compressed') return true;
    if (storageType === 'cloudinary') return true;
    return willUseCloudinaryTransformation(preset);
  };

  // Handle preset download
  const handlePresetDownload = useCallback((preset, format) => {
    setSelectedPreset(preset);
    onDownload(preset, format);
  }, [onDownload]);

  // Handle custom download
  const handleCustomDownload = useCallback(() => {
    const width = customWidth ? parseInt(customWidth) : null;
    const height = customHeight ? parseInt(customHeight) : null;
    const filename = customFilename.trim() || null;
    
    if (width || height) {
      onDownload('custom', selectedFormat, filename, { width, height });
    }
  }, [customWidth, customHeight, customFilename, selectedFormat, onDownload]);

  // Get preset icon
  const getPresetIcon = (preset) => {
    const icons = {
      original: <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />,
      compressed: <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />,
      mobile_portrait: <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />,
      mobile_landscape: <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 rotate-90" />,
      mobile_square: <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />,
      tablet_portrait: <Tablet className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />,
      tablet_landscape: <Tablet className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 rotate-90" />,
      desktop_hd: <Monitor className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />,
      desktop_wide: <Monitor className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />,
      desktop_4k: <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
    };
    return icons[preset] || <Image className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />;
  };

  // Get preset color
  const getPresetColor = (preset, isSelected = false, isAvailable = true) => {
    if (!isAvailable) return 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed';
    if (isSelected) return 'border-blue-500 bg-blue-50 ring-2 ring-blue-200';
    
    const colors = {
      original: 'border-orange-200 bg-orange-50 hover:bg-orange-100',
      compressed: 'border-blue-200 bg-blue-50 hover:bg-blue-100',
      mobile_portrait: 'border-green-200 bg-green-50 hover:bg-green-100',
      mobile_landscape: 'border-green-200 bg-green-50 hover:bg-green-100',
      mobile_square: 'border-green-200 bg-green-50 hover:bg-green-100',
      tablet_portrait: 'border-purple-200 bg-purple-50 hover:bg-purple-100',
      tablet_landscape: 'border-purple-200 bg-purple-50 hover:bg-purple-100',
      desktop_hd: 'border-blue-200 bg-blue-50 hover:bg-blue-100',
      desktop_wide: 'border-blue-200 bg-blue-50 hover:bg-blue-100',
      desktop_4k: 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100'
    };
    return colors[preset] || 'border-gray-200 bg-gray-50 hover:bg-gray-100';
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Group presets by category
  const getPresetsByCategory = () => {
    const categories = {};
    
    Object.entries(DOWNLOAD_PRESETS).forEach(([key, preset]) => {
      const category = preset.category || 'other';
      if (!categories[category]) {
        categories[category] = [];
      }
      
      categories[category].push({
        key,
        ...preset,
        available: isPresetAvailable(key)
      });
    });
    
    return categories;
  };

  const presetsByCategory = getPresetsByCategory();

  // Handle body scroll when modal opens
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[10001] bg-black/40 backdrop-blur-md flex items-end sm:items-center justify-center"
      onClick={onClose}
      style={{
        WebkitBackdropFilter: 'blur(8px)',
        backdropFilter: 'blur(8px)'
      }}
    >
      <div 
        className="bg-white/95 backdrop-blur-xl rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-xl lg:max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden mx-0 sm:mx-4 flex flex-col"
        onClick={e => e.stopPropagation()}
        style={{
          WebkitBackdropFilter: 'blur(20px)',
          backdropFilter: 'blur(20px)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200/50 bg-white/90 backdrop-blur-xl flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile back button */}
            <button
              onClick={onClose}
              className="sm:hidden flex items-center gap-2 px-3 py-1.5 bg-gray-100/80 hover:bg-gray-200/80 rounded-xl transition-all duration-200 active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-gray-700" />
              <span className="text-gray-700 text-sm font-medium">Back</span>
            </button>
            
            <div className="hidden sm:block p-2 bg-blue-100/80 rounded-lg backdrop-blur-sm">
              <Download className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Download Options</h2>
              <p className="text-xs md:text-sm text-gray-600 hidden sm:block">Choose your preferred quality and format</p>
            </div>
          </div>
          
          {/* Desktop close button */}
          <button
            onClick={onClose}
            className="hidden sm:block p-2 hover:bg-gray-100/80 rounded-lg transition-colors backdrop-blur-sm"
          >
            <X className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
          </button>
        </div>

        {/* Progress Bar */}
        {isDownloading && downloadProgress > 0 && (
          <div className="px-4 sm:px-6 py-3 bg-blue-50/80 border-b border-blue-100 backdrop-blur-sm flex-shrink-0">
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

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent" style={{ WebkitOverflowScrolling: 'touch' }}>
          
          {/* Format Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Format</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {Object.entries(FORMAT_OPTIONS).map(([key, format]) => (
                <button
                  key={key}
                  onClick={() => setSelectedFormat(key)}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                    selectedFormat === key
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="font-semibold text-sm mb-1">{format.label}</div>
                  <div className="text-xs opacity-80 line-clamp-1">{format.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Preset Categories */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Size & Quality Options</h3>
            
            {Object.entries(presetsByCategory).map(([categoryKey, presets]) => {
              const category = PRESET_CATEGORIES[categoryKey];
              if (!category) return null;
              
              const isExpanded = expandedCategory === categoryKey;
              const hasAvailablePresets = presets.some(preset => preset.available);
              
              if (!hasAvailablePresets) return null;
              
              return (
                <div key={categoryKey} className="border border-gray-200/50 rounded-xl overflow-hidden bg-gray-50/30 backdrop-blur-sm">
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : categoryKey)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-100/50 transition-colors"
                  >
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">{category.label}</div>
                      <div className="text-sm text-gray-600 mt-1">{category.description}</div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  
                  {isExpanded && (
                    <div className="px-4 pb-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {presets.map((preset) => {
                          if (!preset.available) return null;
                          
                          return (
                            <button
                              key={preset.key}
                              onClick={() => {
                                if (preset.available) {
                                  handlePresetDownload(preset.key, selectedFormat);
                                }
                              }}
                              disabled={isDownloading || !preset.available}
                              className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md disabled:cursor-not-allowed text-left ${getPresetColor(preset.key, selectedPreset === preset.key, preset.available)}`}
                            >
                              <div className="flex items-start gap-3">
                                {getPresetIcon(preset.key)}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="font-semibold text-gray-900 text-sm sm:text-base">
                                      {preset.label}
                                    </div>
                                    {preset.recommended && (
                                      <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                        RECOMMENDED
                                      </span>
                                    )}
                                    {preset.aspectRatio && (
                                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                                        {preset.aspectRatio}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs sm:text-sm text-gray-600 mb-2">
                                    {preset.description}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {preset.estimatedSize}
                                  </div>
                                </div>
                                {isDownloading && selectedPreset === preset.key && (
                                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Custom Options */}
          <div className="mt-6">
            <button
              onClick={() => setShowCustomOptions(!showCustomOptions)}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium mb-4 transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>Custom Dimensions</span>
              {showCustomOptions ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>

            {showCustomOptions && (
              <div className="bg-gray-50/80 text-gray-900 backdrop-blur-sm rounded-xl p-4 sm:p-6 space-y-4 border border-gray-200/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Width (pixels)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 1920"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                  />
                </div>

                {/* Quick aspect ratio buttons */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quick Aspect Ratios
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: '16:9', width: 1920, height: 1080 },
                      { label: '9:16', width: 1080, height: 1920 },
                      { label: '4:3', width: 1536, height: 2048 },
                      { label: '1:1', width: 1080, height: 1080 },
                      { label: '21:9', width: 2560, height: 1080 },
                      { label: '3:4', width: 2048, height: 1536 },
                      { label: '18:9', width: 1440, height: 2880 },
                      { label: '4K', width: 3840, height: 2160 }
                    ].map((ratio) => (
                      <button
                        key={ratio.label}
                        onClick={() => {
                          setCustomWidth(ratio.width.toString());
                          setCustomHeight(ratio.height.toString());
                        }}
                        className="px-3 py-2 text-xs font-medium bg-white/80 hover:bg-gray-100/80 border border-gray-200 rounded-lg transition-colors backdrop-blur-sm"
                      >
                        {ratio.label}
                      </button>
                    ))}
                  </div>
                </div>

                {(customWidth || customHeight) && (
                  <div className="bg-green-50/80 border border-green-200 rounded-lg p-3 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-sm text-green-800">
                      <Check className="w-4 h-4" />
                      <span>Custom: {customWidth || 'auto'} × {customHeight || 'auto'} pixels</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleCustomDownload}
                  disabled={isDownloading || (!customWidth && !customHeight)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
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

          {/* Storage Info
          {storageType !== 'unknown' && (
            <div className="mt-6 p-4 bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-xl">
              <div className="flex items-start gap-3">
                
              </div>
            </div>
          )} */}

          {/* Add some bottom spacing for mobile scroll */}
          <div className="h-6 sm:h-0"></div>
        </div>

        {/* Footer - Fixed at bottom on mobile */}
        <div className="flex-shrink-0 p-4 sm:p-6 border-t border-gray-200/50 bg-white/90 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-sm text-gray-600 text-center sm:text-left">
              💡 Downloads start automatically
            </div>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors rounded-lg hover:bg-gray-100/50"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced scrollbar styles */}
      <style jsx>{`
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
          border-radius: 3px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: rgba(107, 114, 128, 0.7);
        }

        /* iOS momentum scrolling */
        .scrollbar-thin {
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }
        
        /* Line clamp utilities */
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Mobile responsive adjustments */
        @media (max-width: 640px) {
          .scrollbar-thin {
            overflow-y: scroll;
          }
        }
      `}</style>
    </div>
  );
};

export default DownloadOptionsModal;