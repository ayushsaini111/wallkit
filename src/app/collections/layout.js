'use client'
// import { SessionProvider } from 'next-auth/react'
// import { AuthProvider } from '@/context/AuthContext'
// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";
// import ClearUserStorageOnLogout from '@/components/ClearUserStorageOnLogout';
// import Footer from '@/components/footer';
// import Navbar from '@/components/Navbar';
// import { usePathname } from 'next/navigation';
import Layout from "@/components/collection/layout";
import { Divide } from "lucide-react";



export default function RootLayout({ children }) {


  return (
    <div>



      <Layout/>
            {children}
    </div>
      
        
      
    
  );
}
