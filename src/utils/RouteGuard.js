// components/RouteGuard.js
'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

const RouteGuard = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const publicRoutes = ['/', '/about', '/trending', '/explore', "/policy","/termsCondition",'/auth/signin', '/auth/signup'];
  
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

  // Show loading for protected routes while checking auth
//   if (status === 'loading') {
//     return <div>Loading...</div>;
//   }

  // Don't render protected content for unauthenticated users
//   const isPublicRoute = publicRoutes.includes(pathname);
//   if (!session && !isPublicRoute) {
//     return <div>Redirecting...</div>;
//   }

  return children;
};

export default RouteGuard;