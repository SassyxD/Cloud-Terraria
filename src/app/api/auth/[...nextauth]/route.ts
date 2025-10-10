/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import * as authModule from "~/server/auth";

const handlers = (authModule as any).handlers;

export const { GET, POST } = handlers;
