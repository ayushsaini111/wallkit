// middleware.js
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Define EXACT public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/about", 
    "/trending",
    "/explore"
  ];

  // Define auth-related routes
  const authRoutes = [
    "/signin",
    "/signup", 
    "/auth/signin",
    "/auth/signup",
    "/auth/error"
  ];

  // Define system routes that should be ignored
  const systemRoutes = [
    "/api/auth", // NextAuth API routes
    "/_next",    // Next.js static files
    "/favicon.ico",
    "/robots.txt",
    "/sitemap.xml"
  ];

  // Allow system routes to pass through
  const isSystemRoute = systemRoutes.some(route => pathname.startsWith(route));
  if (isSystemRoute) {
    return NextResponse.next();
  }

  // Check if it's an EXACT match for public routes
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // Check if it's an auth route
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // If user is NOT authenticated
  if (!token) {
    // Allow access only to exact public routes and auth routes
    if (isPublicRoute || isAuthRoute) {
      return NextResponse.next();
    }
    
    // Block everything else and redirect to signin
    console.log(`[MIDDLEWARE] Blocking unauthorized access to: ${pathname}`);
    const loginUrl = new URL("/signin", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // If user IS authenticated
  if (token) {
    // Redirect authenticated users away from auth pages
    if (isAuthRoute) {
      const dashboardUrl = new URL("/dashboard", req.url);
      return NextResponse.redirect(dashboardUrl);
    }
    
    // Allow access to all other routes for authenticated users
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt, sitemap.xml
     */
    "/((?!api(?!/auth)|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};