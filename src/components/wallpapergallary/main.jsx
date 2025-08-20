'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/navbar/Navbar';
import { WallpaperGallery } from '@/components/wallpapergallary/WallpaperGallery';

const MainPage = () => {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Handle URL parameters for category selection
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      console.log('Category from URL:', categoryFromUrl);
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

  const handleCategorySelect = (category) => {
    console.log('Category selected:', category);
    setSelectedCategory(category);
  };

  return (
    <div className="min-h-screen">
      <Navbar onCategorySelect={handleCategorySelect} />
      <WallpaperGallery 
        key={selectedCategory} 
        initialCategory={selectedCategory}
      />
    </div>
  );
};

export default MainPage;