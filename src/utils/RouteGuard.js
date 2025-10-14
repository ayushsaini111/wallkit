// components/RouteGuard.js
'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import NavigationLoader from '@/components/NavigationLoader';

const RouteGuard = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Public routes
  const publicRoutes = [
    '/',
    '/about',
    '/trending',
    '/explore',
    '/policy',
    '/termsCondition',
    '/auth/signin',
    '/auth/signup',
    '/download',
    '/wallpaper/[id]', // Dynamic wallpaper route
  ];

  useEffect(() => {
    if (status === 'loading') return; // Wait for session to load

    // Check if current route is public
    const isPublicRoute = publicRoutes.some(route => {
      if (route.includes('[id]')) {
        // Handle dynamic routes like /wallpaper/:id
        return pathname.startsWith(route.replace('[id]', ''));
      }
      return route === pathname;
    });

    // Redirect unauthenticated users from private routes
    if (!session && !isPublicRoute) {
      console.log(`[ROUTE GUARD] Redirecting from ${pathname} to /auth/signin`);
      router.replace('/auth/signin');
      return;
    }

    // Redirect authenticated users away from signin/signup pages
    if (session && (pathname === '/auth/signin' || pathname === '/auth/signup')) {
      router.replace('/');
      return;
    }
  }, [session, status, pathname, router]);

  return (
    <>
      {/* Top navigation loader */}
      <NavigationLoader color="#f97316" height="2px" zIndex={9999} />
      {children}
    </>
  );
};

export default RouteGuard;
