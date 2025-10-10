import NextAuth from "next-auth";
import { cache } from "react";

import { authConfig } from "./config";

const nextAuthResult = NextAuth(authConfig) as any;

const { auth: uncachedAuth, handlers, signIn, signOut } = nextAuthResult;

const auth = cache(uncachedAuth);

// Explicitly export handlers as `any` to satisfy TypeScript resolution during Next.js builds
export { auth, handlers, signIn, signOut };
