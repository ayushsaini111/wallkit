'use client'
import { SessionProvider } from 'next-auth/react'
import { AuthProvider } from '@/context/AuthContext'
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClearUserStorageOnLogout from '@/components/ClearUserStorageOnLogout';
import Footer from '@/components/footer/footer';
import Navbar from '@/components/navbar/Navbar';
import { usePathname } from 'next/navigation';
import RouteGuard from '@/utils/RouteGuard';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const pathname = usePathname();

  // Pages where Navbar & Footer should be hidden
  const hideLayoutRoutes = ['/auth/signin', '/auth/signup'];
  const shouldHideLayout = hideLayoutRoutes.includes(pathname);

  return (
    <html lang="en">
      <head>
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        
        {/* Mobile Web App Capable */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="WallPickr" />
        
        {/* Apple Icons */}
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-512.png" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${geistSans.variable} antialiased max-w-[14400px]`}>
        <SessionProvider>
          <AuthProvider>
            <RouteGuard>
              {!shouldHideLayout && <Navbar />}
              <ClearUserStorageOnLogout />
              {children}
              {!shouldHideLayout && <Footer />}
            </RouteGuard>
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}