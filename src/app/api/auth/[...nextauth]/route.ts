import * as authModule from "~/server/auth";

// handlers is provided by NextAuth at runtime; access it from the module namespace
const handlers = (authModule as any).handlers;

export const { GET, POST } = handlers;
