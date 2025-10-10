/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import NextAuth from "next-auth";
import { authConfig } from "~/server/auth/config";

const nextAuthHandler = NextAuth(authConfig as any);

export async function GET(request: Request) {
	return await (nextAuthHandler as any).GET?.(request) ?? new Response(null, { status: 404 });
}

export async function POST(request: Request) {
	return await (nextAuthHandler as any).POST?.(request) ?? new Response(null, { status: 404 });
}
