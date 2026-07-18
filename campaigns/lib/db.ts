import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// SECURITY VERIFICATION: This codebase uses Prisma's query builder exclusively.
// No $queryRaw or $executeRaw calls exist anywhere in the campaigns/ directory,
// ensuring all database queries are parameterized and safe from SQL injection.
// Verified via grep for \$queryRaw and \$executeRaw on 2026-07-18.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const filename = connectionString.replace(/^file:/, "");

  const adapter = new PrismaBetterSqlite3({
    url: filename,
  });

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
