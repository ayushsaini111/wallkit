// src/app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

// ✅ Export authOptions so it can be imported by other API routes
export { handler as GET, handler as POST, authOptions };