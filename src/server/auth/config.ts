import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import CognitoProvider from "next-auth/providers/cognito";

import { db } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    // Mock Credentials Provider for Development
    CredentialsProvider({
      id: "credentials",
      name: "Mock Account",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "demo" },
      },
      async authorize(credentials) {
        try {
          console.log("[Auth] Starting authorization...");
          
          // Accept any username for demo purposes
          if (!credentials?.username) {
            console.log("[Auth] No username provided");
            return null;
          }

          const username = credentials.username as string;
          console.log(`[Auth] Attempting to authorize user: ${username}`);

          // Find or create user in database
          const email = `${username}@demo.local`;
          console.log(`[Auth] Looking for user with email: ${email}`);
          
          let user = await db.user.findFirst({
            where: { email },
          });

          if (!user) {
            console.log(`[Auth] User not found, creating new user...`);
            user = await db.user.create({
              data: {
                name: username,
                email: email,
                emailVerified: new Date(),
              },
            });
            console.log(`[Auth] User created successfully with ID: ${user.id}`);
          } else {
            console.log(`[Auth] User found with ID: ${user.id}`);
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
          };
        } catch (error) {
          console.error("[Auth] Error during authorization:", error);
          // Return a simple error message for debugging
          if (error instanceof Error) {
            console.error("[Auth] Error message:", error.message);
            console.error("[Auth] Error stack:", error.stack);
          }
          return null;
        }
      },
    }),
    // AWS Cognito Provider (Production)
    ...(process.env.AUTH_COGNITO_ID && process.env.AUTH_COGNITO_SECRET && process.env.AUTH_COGNITO_ISSUER
      ? [
          CognitoProvider({
            clientId: process.env.AUTH_COGNITO_ID,
            clientSecret: process.env.AUTH_COGNITO_SECRET,
            issuer: process.env.AUTH_COGNITO_ISSUER,
          }),
        ]
      : []),
  ],
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
  },
  callbacks: {
    session: ({ session, token }) => {
      if (token && session.user) {
        session.user.id = token.sub!;
        if (token.name) session.user.name = token.name;
        if (token.email) session.user.email = token.email;
      }
      return session;
    },
    jwt: ({ token, user }) => {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
} satisfies NextAuthConfig;
