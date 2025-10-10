/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment */
import NextAuth from "next-auth";
import { cache } from "react";
import type { Session } from "next-auth";

import { authConfig } from "./config";

// Provide a narrow-ish type for the NextAuth return shape using `unknown` casts to avoid
// polluting the codebase with `any`. This gives us a typed `auth` function and `handlers`
// that other modules can import without needing unsafe `any` casts.
const nextAuthResult = NextAuth(authConfig) as unknown as {
	auth: () => Promise<Session | null>;
	handlers: {
		GET: (req: Request) => Promise<Response> | Response;
		POST: (req: Request) => Promise<Response> | Response;
	};
	signIn: (...args: unknown[]) => unknown;
	signOut: (...args: unknown[]) => unknown;
};

const { auth: uncachedAuth, handlers, signIn, signOut } = nextAuthResult;

const auth = cache(uncachedAuth as () => Promise<Session | null>);

export { auth, handlers, signIn, signOut };
