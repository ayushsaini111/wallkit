// src/lib/auth.js
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
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
        if (!credentials?.email || !credentials?.password) return null;

        await dbConnect();
        const user = await User.findOne({ email: credentials.email });
        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          _id: user._id.toString(),
          id: user._id.toString(),
          email: user.email,
          username: user.username,
          avatar: user.avatar,
          bio: user.bio,
          emailNotifications: user.emailNotifications,
          provider: user.provider || "local",
          createdAt: user.createdAt,
        };
      },
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      await dbConnect();

      if (account?.provider === "google") {
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
            provider: "google",
            username,
            emailNotifications: true,
          });

          await sendWelcomeEmail({
            name: profile.name,
            email: profile.email,
          });
        } else if (!existingUser.avatar) {
          existingUser.avatar = profile.picture;
          await existingUser.save();
        }

        user._id = existingUser._id.toString();
        user.id = existingUser._id.toString();
        user.name = existingUser.name;
        user.email = existingUser.email;
        user.avatar = existingUser.avatar;
        user.username = existingUser.username;
        user.bio = existingUser.bio;
        user.emailNotifications = existingUser.emailNotifications;
        user.provider = "google";
        user.createdAt = existingUser.createdAt;
      }

      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      if (trigger === "update" && session) {
        token = { ...token, ...session };
        return token;
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
          console.error("[JWT] Failed to refresh user data:", err);
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user._id = token._id;
      session.user.id = token._id;
      session.user.name = token.name;
      session.user.email = token.email;
      session.user.username = token.username;
      session.user.avatar = token.avatar;
      session.user.image = token.avatar;
      session.user.bio = token.bio;
      session.user.emailNotifications = token.emailNotifications;
      session.user.provider = token.provider;
      session.user.createdAt = token.createdAt;

      return session;
    },
  },
};
