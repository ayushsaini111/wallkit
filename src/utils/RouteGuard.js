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

  const publicRoutes = ['/', '/about', '/trending', '/explore', "/policy", "/termsCondition", '/auth/signin', '/auth/signup'];

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
      {/* Orange Navigation Loader */}
      <NavigationLoader 
        color="#f97316"
        height="2px"
        zIndex={9999}
      />
      {children}
    </>
  );
};

export default RouteGuard;