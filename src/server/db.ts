import { PrismaClient } from "@prisma/client";

import { env } from "~/env";

// Debug: Check DATABASE_URL
console.log("[DB] DATABASE_URL from process.env:", process.env.DATABASE_URL);
console.log("[DB] DATABASE_URL from env:", env.DATABASE_URL);

const createPrismaClient = () =>
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
