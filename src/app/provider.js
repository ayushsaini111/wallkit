"use client"

import { SessionProvider } from "next-auth/react"
import { AuthProvider } from "@/context/AuthContext"
import RouteGuard from "@/utils/RouteGuard"

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <RouteGuard>
          {children}
        </RouteGuard>
      </AuthProvider>
    </SessionProvider>
  )
}
