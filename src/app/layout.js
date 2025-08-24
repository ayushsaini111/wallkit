"use client"
// app/layout.js (Simplified - Server Component)
import { SessionProvider } from 'next-auth/react'
import { AuthProvider } from '@/context/AuthContext'
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
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
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased max-w-[14400px]`}>
        <SessionProvider>
          <AuthProvider>
            <RouteGuard>
              {children}
            </RouteGuard>
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}