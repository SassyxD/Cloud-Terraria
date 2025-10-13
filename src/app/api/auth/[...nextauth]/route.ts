import type { NextRequest } from "next/server";
import * as authModule from "~/server/auth/index";

export async function GET(request: NextRequest) {
	const h = authModule.handlers?.GET as unknown as ((req: Request) => Promise<Response> | Response) | undefined;
	return (h?.(request as unknown as Request) as Promise<Response> | Response) ?? new Response(null, { status: 404 });
}

export async function POST(request: NextRequest) {
	const h = authModule.handlers?.POST as unknown as ((req: Request) => Promise<Response> | Response) | undefined;
	return (h?.(request as unknown as Request) as Promise<Response> | Response) ?? new Response(null, { status: 404 });
}
