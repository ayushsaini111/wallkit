// page.js
import WallpaperGallery from '@/components/wallpapergallary/main';

export default function Home() {
  return (
    <div className=''>
      <WallpaperGallery />
    </div>
  );
}

// // Alternative with additional layout/metadata
// export default function HomePage() {
//   return (
//     <>
//       {/* Optional: Add any header/navigation here */}
//       <header className="bg-white shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 py-4">
//           <h1 className="text-2xl font-bold text-gray-900">Wallpaper Gallery</h1>
//         </div>
//       </header>
      
//       {/* Main Gallery Component */}
//       <WallpaperGallery />
      
//       {/* Optional: Add footer here */}
//       <footer className="bg-gray-800 text-white p-4 mt-12">
//         <div className="max-w-7xl mx-auto text-center">
//           <p>&copy; 2025 Wallpaper Gallery. All rights reserved.</p>
//         </div>
//       </footer>
//     </>
//   );
// }

// // If you want to add metadata (Next.js 13+ app directory)
// export const metadata = {
//   title: 'Wallpaper Gallery - Beautiful HD Wallpapers',
//   description: 'Discover and download amazing wallpapers from talented creators',
//   keywords: 'wallpapers, HD wallpapers, desktop backgrounds, mobile wallpapers',
// };
