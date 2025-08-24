// components/RouteGuard.js (Updated)
'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import NavigationLoader from '@/components/NavigationLoader';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/footer';
import ClearUserStorageOnLogout from '@/components/ClearUserStorageOnLogout';

const RouteGuard = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const publicRoutes = ['/', '/about', '/trending', '/explore', '/policy', '/termsCondition', '/auth/signin', '/auth/signup'];

  // Pages where Navbar & Footer should be hidden
  const hideLayoutRoutes = ['/auth/signin', '/auth/signup'];
  const shouldHideLayout = hideLayoutRoutes.includes(pathname);

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    const isPublicRoute = publicRoutes.includes(pathname);

    if (!session && !isPublicRoute) {
      console.log(`[ROUTE GUARD] Redirecting from ${pathname} to /signin`);
      router.push('/auth/signin');
      return;
    }

    if (session && (pathname === '/auth/signin' || pathname === '/auth/signup')) {
      router.push('/');
      return;
    }
  }, [session, status, pathname, router]);

  return (
    <div className="min-h-screen">
      {/* Global Navigation Loading Bar */}
      <NavigationLoader 
        color="#f97316"  // Orange-500
        height="2px"     // Thinner line
        zIndex={9999}
      />
      
      {/* Layout Components */}
      {!shouldHideLayout && <Navbar />}
      <ClearUserStorageOnLogout />
      
      {/* Main Content - Remove any gaps */}
      <main className="block" style={{ margin: 0, padding: 0 }}>
        {children}
      </main>
      
      {/* Footer */}
      {!shouldHideLayout && <Footer />}
    </div>
  );
};

export default RouteGuard;