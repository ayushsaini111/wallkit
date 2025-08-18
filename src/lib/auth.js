import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import { User } from "@/models/user.model";
import { sendWelcomeEmail } from "@/lib/mailer";

export const authOptions = {
  session: { 
    strategy: "jwt",
    // 🔥 Increase session max age to prevent frequent re-validation
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await dbConnect();
        const user = await User.findOne({ email: credentials.email });
        if (!user || !user.password) throw new Error("No user found");
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid password");
        
        // ✅ Return user with provider info for local login
        return {
          _id: user._id.toString(),
          id: user._id.toString(),
          email: user.email,
          username: user.username,
          avatar: user.avatar,
          bio: user.bio,
          emailNotifications: user.emailNotifications,
          provider: user.provider || 'local', // ✅ Ensure provider is set correctly
          createdAt: user.createdAt,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
   
  callbacks: {
    async signIn({ user, account, profile }) {
      await dbConnect();
       
      if (account.provider === "google") {
        let existingUser = await User.findOne({ email: profile.email });
         
        if (!existingUser) {
          const baseUsername =
            profile.name?.toLowerCase().replace(/\s+/g, "") ||
            profile.email.split("@")[0];
           
          let username = baseUsername;
          let suffix = 1;
           
          while (await User.findOne({ username })) {
            username = `${baseUsername}${suffix++}`;
          }
           
          existingUser = await User.create({
            name: profile.name,
            email: profile.email,
            avatar: profile.picture,
            provider: "google", // ✅ Explicitly set provider
            username,
            emailNotifications: true,
          });
           
          console.log("[SIGNIN] New Google user created:", existingUser.email);
           
          await sendWelcomeEmail({
            name: profile.name,
            email: profile.email,
          });
        } else if (!existingUser.avatar) {
          existingUser.avatar = profile.picture;
          await existingUser.save();
        }
         
        // ✅ Set all user properties correctly for Google login
        user._id = existingUser._id.toString();
        user.id = existingUser._id.toString();
        user.name = existingUser.name;
        user.email = existingUser.email;
        user.avatar = existingUser.avatar;
        user.username = existingUser.username;
        user.bio = existingUser.bio;
        user.emailNotifications = existingUser.emailNotifications;
        user.provider = "google"; // ✅ Explicitly set Google provider
        user.createdAt = existingUser.createdAt;
      }
       
      // ✅ For credentials (local) login, user object already has correct provider from authorize()
      return true;
    },
     
    async jwt({ token, user, account, trigger, session }) {
      // 🔥 Handle session updates - this is key for making updates work!
      if (trigger === "update" && session) {
        console.log("[JWT] Session update triggered:", session);
        
        // Merge the updated session data into the token
        token = {
          ...token,
          ...session,
          // Ensure we keep essential fields
          _id: token._id,
          id: token._id,
          email: token.email,
        };
        
        console.log("[JWT] Token updated with new session data");
        return token;
      }

      // Initial sign in
      if (user) {
        token._id = user._id;
        token.id = user._id;
        token.name = user.name;
        token.email = user.email;
        token.avatar = user.avatar;
        token.username = user.username;
        token.bio = user.bio;
        token.emailNotifications = user.emailNotifications;
        token.createdAt = user.createdAt;
        
        // ✅ Set provider based on account or user data
        if (account) {
          token.provider = account.provider === 'google' ? 'google' : 'local';
        } else {
          token.provider = user.provider || 'local';
        }
        
        console.log(`[JWT] Token created for ${token.provider} user:`, token.email);
      }

      // 🔥 Always fetch fresh user data from database when token is accessed
      // This ensures we always have the latest user data
      if (token._id && !user && trigger !== "update") {
        try {
          await dbConnect();
          const freshUser = await User.findById(token._id).lean();
          
          if (freshUser) {
            // Update token with fresh data from database
            token.name = freshUser.name;
            token.username = freshUser.username;
            token.avatar = freshUser.avatar;
            token.bio = freshUser.bio;
            token.emailNotifications = freshUser.emailNotifications;
            // Keep existing provider and other fields
            
            console.log("[JWT] Token refreshed with database data");
          }
        } catch (error) {
          console.error("[JWT] Failed to refresh user data:", error);
          // Continue with existing token data if DB fetch fails
        }
      }

      return token;
    },
     
    async session({ session, token }) {
      // ✅ Set all user data in session including correct provider
      session.user._id = token._id;
      session.user.id = token._id;
      session.user.name = token.name;
      session.user.email = token.email;
      session.user.username = token.username;
      session.user.avatar = token.avatar;
      session.user.image = token.avatar; // NextAuth compatibility
      session.user.bio = token.bio;
      session.user.emailNotifications = token.emailNotifications;
      session.user.provider = token.provider; // ✅ This should now be correct
      session.user.createdAt = token.createdAt;
      
      // Debug log to verify provider
      console.log(`[SESSION] Session created for ${session.user.provider} user:`, session.user.email);
             
      return session;
    },
  },
};