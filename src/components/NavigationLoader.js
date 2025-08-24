// components/NavigationLoader.js
'use client';

import { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const NavigationLoader = ({
  color = '#f97316', // orange-500 - ensure this is being used
  height = '2px', // thinner line
  className = '',
  zIndex = 50
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Start loading
    setIsLoading(true);
    setProgress(10);
    
    let progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev; // Stop at 90%
        return prev + Math.random() * 15;
      });
    }, 150);

    // Complete loading after a short delay
    const completeTimer = setTimeout(() => {
      setProgress(100);
      
      // Hide after completion animation
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
        if (progressInterval) {
          clearInterval(progressInterval);
        }
      }, 200);
    }, 800); // Adjust timing as needed

    return () => {
      clearInterval(progressInterval);
      clearTimeout(completeTimer);
    };
  }, [pathname, searchParams]);

  if (!isLoading) return null;

  return (
    <div 
      className={`fixed top-0 left-0 right-0 ${className}`}
      style={{
        height,
        zIndex,
        background: 'rgba(255, 255, 255, 0.1)'
      }}
    >
      <div 
        className="h-full transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          background: `linear-gradient(90deg, #f97316, #f97316dd)`, // Force orange-500
          boxShadow: `0 0 10px #f9731660`
        }}
      />
    </div>
  );
};

export default NavigationLoader;