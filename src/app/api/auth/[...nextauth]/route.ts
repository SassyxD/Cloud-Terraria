import NextAuth from "next-auth";
import { authConfig } from "~/server/auth/config";

// Create the NextAuth handlers directly here so they are available at runtime
// for the app router. We cast to `any` because NextAuth's types are complex.
export const { GET, POST } = NextAuth(authConfig as any);
