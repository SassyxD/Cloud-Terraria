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
      name: "Mock Account",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "demo" },
      },
      async authorize(credentials) {
        // Accept any username for demo purposes
        if (!credentials?.username) {
          return null;
        }

        // Find or create user in database
        let user = await db.user.findFirst({
          where: { email: `${credentials.username}@demo.local` },
        });

        if (!user) {
          user = await db.user.create({
            data: {
              name: credentials.username as string,
              email: `${credentials.username}@demo.local`,
              emailVerified: new Date(),
            },
          });
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
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
