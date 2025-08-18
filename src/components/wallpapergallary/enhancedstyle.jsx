'use client';

const EnhancedStyles = () => {
  return (
    <style jsx global>{`
      /* ============ Z-INDEX UTILITIES ============ */
      
      .z-dropdown {
        z-index: 9999;
      }
      
      .z-modal {
        z-index: 10000;
      }
      
      .z-tooltip {
        z-index: 9998;
      }
      
      .z-header {
        z-index: 100;
      }
      
      .z-sticky {
        z-index: 200;
      }
      
      /* Ensure search dropdown appears above everything */
      .search-dropdown {
        z-index: 9999 !important;
        position: relative;
      }
      
      /* ============ ANIMATIONS ============ */
      
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(100%) scale(0.9);
        }
        to {
          opacity: 1;
          transform: translateX(0) scale(1);
        }
      }
      
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.8);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      
      @keyframes shimmer {
        0% {
          background-position: -200px 0;
        }
        100% {
          background-position: calc(200px + 100%) 0;
        }
      }
      
      @keyframes float {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-20px);
        }
      }
      
      @keyframes glow {
        0%, 100% {
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
        }
        50% {
          box-shadow: 0 0 30px rgba(59, 130, 246, 0.8), 0 0 40px rgba(59, 130, 246, 0.3);
        }
      }
      
      @keyframes rainbow {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      /* ============ UTILITY CLASSES ============ */
      
      .animate-fadeIn {
        animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      
      .animate-slideIn {
        animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      
      .animate-slideUp {
        animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      
      .animate-scaleIn {
        animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      
      .animate-shimmer {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200px 100%;
        animation: shimmer 2s infinite;
      }
      
      .animate-float {
        animation: float 6s ease-in-out infinite;
      }
      
      .animate-glow {
        animation: glow 2s ease-in-out infinite alternate;
      }
      
      .animate-rainbow {
        background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
        background-size: 400% 400%;
        animation: rainbow 15s ease infinite;
      }
      
      /* ============ SCROLLBAR STYLES ============ */
      
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
      
      .scrollbar-thin {
        scrollbar-width: thin;
        scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
      }
      
      .scrollbar-thin::-webkit-scrollbar {
        height: 6px;
        width: 6px;
      }
      
      .scrollbar-thin::-webkit-scrollbar-track {
        background: transparent;
      }
      
      .scrollbar-thin::-webkit-scrollbar-thumb {
        background-color: rgba(156, 163, 175, 0.5);
        border-radius: 20px;
      }
      
      .scrollbar-thin::-webkit-scrollbar-thumb:hover {
        background-color: rgba(156, 163, 175, 0.8);
      }
      
      /* ============ LAYOUT UTILITIES ============ */
      
      .break-inside-avoid {
        break-inside: avoid;
        page-break-inside: avoid;
      }
      
      .masonry {
        column-count: 1;
        column-gap: 1rem;
        column-fill: balance;
      }
      
      @media (min-width: 640px) {
        .masonry {
          column-count: 2;
        }
      }
      
      @media (min-width: 768px) {
        .masonry {
          column-count: 3;
        }
      }
      
      @media (min-width: 1024px) {
        .masonry {
          column-count: 3;
        }
      }
      
      @media (min-width: 1280px) {
        .masonry {
          column-count: 4;
        }
      }
      
      /* ============ GLASS MORPHISM EFFECTS ============ */
      
      .glass {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      
      .glass-dark {
        background: rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .glass-heavy {
        background: rgba(255, 255, 255, 0.25);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.3);
      }
      
      /* ============ GRADIENT UTILITIES ============ */
      
      .gradient-text {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .gradient-border {
        background: linear-gradient(white, white) padding-box,
                    linear-gradient(135deg, #667eea, #764ba2) border-box;
        border: 2px solid transparent;
      }
      
      .gradient-shadow {
        box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
      }
      
      /* ============ INTERACTIVE STATES ============ */
      
      .hover-lift {
        transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      
      .hover-lift:hover {
        transform: translateY(-8px) scale(1.02);
      }
      
      .hover-glow {
        transition: box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      
      .hover-glow:hover {
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1);
      }
      
      .hover-scale {
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }
      
      .hover-scale:hover {
        transform: scale(1.05);
      }
      
      .hover-rotate {
        transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      
      .hover-rotate:hover {
        transform: rotate(3deg);
      }
      
      /* ============ LOADING STATES ============ */
      
      .skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200px 100%;
        animation: shimmer 1.5s infinite;
      }
      
      .skeleton-dark {
        background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
        background-size: 200px 100%;
        animation: shimmer 1.5s infinite;
      }
      
      .loading-dots::after {
        content: '';
        animation: dots 2s infinite;
      }
      
      @keyframes dots {
        0%, 20% { content: '.'; }
        40% { content: '..'; }
        60%, 100% { content: '...'; }
      }
      
      /* ============ FOCUS STATES ============ */
      
      .focus-visible-ring:focus-visible {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
      }
      
      .focus-visible-glow:focus-visible {
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
      }
      
      /* ============ ACCESSIBILITY ============ */
      
      @media (prefers-reduced-motion: reduce) {
        .animate-pulse,
        .animate-bounce,
        .animate-spin,
        .animate-ping,
        .animate-fadeIn,
        .animate-slideIn,
        .animate-slideUp,
        .animate-scaleIn,
        .animate-shimmer,
        .animate-float,
        .animate-glow,
        .animate-rainbow {
          animation: none;
        }
        
        .transition-all,
        .transition-colors,
        .transition-transform,
        .hover-lift,
        .hover-glow,
        .hover-scale,
        .hover-rotate {
          transition: none;
        }
      }
      
      @media (prefers-color-scheme: dark) {
        .dark-mode {
          color-scheme: dark;
        }
        
        .auto-dark {
          background-color: #1f2937;
          color: #f9fafb;
        }
      }
      
      /* ============ PRINT STYLES ============ */
      
      @media print {
        .no-print {
          display: none !important;
        }
        
        .print-break-before {
          page-break-before: always;
        }
        
        .print-break-after {
          page-break-after: always;
        }
        
        .print-break-inside-avoid {
          page-break-inside: avoid;
        }
      }
      
      /* ============ RESPONSIVE UTILITIES ============ */
      
      @media (max-width: 640px) {
        .mobile-full {
          width: 100vw;
          margin-left: calc(-50vw + 50%);
        }
        
        .mobile-padding {
          padding-left: 1rem;
          padding-right: 1rem;
        }
      }
      
      /* ============ CUSTOM PROPERTIES ============ */
      
      :root {
        --shadow-light: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        --shadow-medium: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        --shadow-heavy: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        --shadow-glow: 0 0 20px rgba(59, 130, 246, 0.3);
        
        --border-radius-sm: 0.375rem;
        --border-radius-md: 0.5rem;
        --border-radius-lg: 0.75rem;
        --border-radius-xl: 1rem;
        --border-radius-2xl: 1.5rem;
        --border-radius-3xl: 2rem;
        
        --timing-fast: 0.2s;
        --timing-medium: 0.3s;
        --timing-slow: 0.5s;
        
        --easing-smooth: cubic-bezier(0.16, 1, 0.3, 1);
        --easing-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
      }
    `}</style>
  );
};

export default EnhancedStyles;