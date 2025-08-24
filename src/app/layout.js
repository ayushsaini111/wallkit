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