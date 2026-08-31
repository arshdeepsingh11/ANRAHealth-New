// The single Prisma Client instance for the whole app. Every backend
// function imports `prisma` from here — never create a `new PrismaClient()`
// anywhere else, or you'll open a new database connection per request.

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// In development, Next.js hot-reloads modules frequently. Without this,
// each reload would create a brand new PrismaClient and eventually exhaust
// SQLite's connection handling. Reusing a global instance fixes that.
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}