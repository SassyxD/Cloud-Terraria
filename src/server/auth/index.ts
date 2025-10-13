import NextAuth from "next-auth";
import { cache } from "react";
import type { Session } from "next-auth";
import type { NextRequest } from "next/server";

import { authConfig } from "./config";

// NextAuth returns a handler object when called in the App Router scenario.
// We call it once and export typed helpers for the rest of the app.
const nextAuthResult = NextAuth(authConfig) as unknown as {
  auth: () => Promise<Session | null>;
  handlers: {
    GET: (req: NextRequest) => Promise<Response> | Response;
    POST: (req: NextRequest) => Promise<Response> | Response;
  };
  signIn: (...args: unknown[]) => unknown;
  signOut: (...args: unknown[]) => unknown;
};

const { auth: uncachedAuth, handlers, signIn, signOut } = nextAuthResult;

const auth = cache(uncachedAuth as () => Promise<Session | null>);

export { auth, handlers, signIn, signOut };
