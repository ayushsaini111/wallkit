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
    <>
      {/* Global Navigation Loading Bar - NOW ORANGE! */}
      <NavigationLoader 
        color="#f97316"  // Orange-500 instead of green
        height="2px"     // Thinner line as requested
        zIndex={9999}
      />
      
      {/* Layout Components */}
      {!shouldHideLayout && <Navbar />}
      <ClearUserStorageOnLogout />
      
      {/* Main Content */}
      {children}
      
      {/* Footer */}
      {!shouldHideLayout && <Footer />}
    </>
  );
};

export default RouteGuard;