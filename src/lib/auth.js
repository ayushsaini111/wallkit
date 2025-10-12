// src/lib/auth.js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import { User } from "@/models/user.model";
import { sendWelcomeEmail } from "@/lib/mailer";

export const authOptions = {
  session: { 
    strategy: "jwt",
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

        return {
          _id: user._id.toString(),
          id: user._id.toString(),
          email: user.email,
          username: user.username,
          avatar: user.avatar,
          bio: user.bio,
          emailNotifications: user.emailNotifications,
          provider: user.provider || 'local',
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
          const baseUsername = profile.name?.toLowerCase().replace(/\s+/g, "") || profile.email.split("@")[0];
          let username = baseUsername;
          let suffix = 1;

          while (await User.findOne({ username })) {
            username = `${baseUsername}${suffix++}`;
          }

          existingUser = await User.create({
            name: profile.name,
            email: profile.email,
            avatar: profile.picture,
            provider: "google",
            username,
            emailNotifications: true,
          });

          await sendWelcomeEmail({ name: profile.name, email: profile.email });
        } else if (!existingUser.avatar) {
          existingUser.avatar = profile.picture;
          await existingUser.save();
        }

        // Merge Google user data into NextAuth user object
        Object.assign(user, {
          _id: existingUser._id.toString(),
          id: existingUser._id.toString(),
          name: existingUser.name,
          email: existingUser.email,
          avatar: existingUser.avatar,
          username: existingUser.username,
          bio: existingUser.bio,
          emailNotifications: existingUser.emailNotifications,
          provider: "google",
          createdAt: existingUser.createdAt,
        });
      }

      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      if (trigger === "update" && session) {
        return { ...token, ...session, _id: token._id, id: token._id, email: token.email };
      }

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
        token.provider = account?.provider === "google" ? "google" : user.provider || "local";
      }

      if (token._id && !user && trigger !== "update") {
        try {
          await dbConnect();
          const freshUser = await User.findById(token._id).lean();
          if (freshUser) {
            token.name = freshUser.name;
            token.username = freshUser.username;
            token.avatar = freshUser.avatar;
            token.bio = freshUser.bio;
            token.email = freshUser.email;
            token.emailNotifications = freshUser.emailNotifications;
          }
        } catch (err) {
          console.error("[JWT] Failed to refresh user:", err);
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        _id: token._id,
        id: token._id,
        name: token.name,
        email: token.email,
        username: token.username,
        avatar: token.avatar,
        image: token.avatar,
        bio: token.bio,
        emailNotifications: token.emailNotifications,
        provider: token.provider,
        createdAt: token.createdAt,
      };
      return session;
    },
  },
};
