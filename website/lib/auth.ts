import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
});

/** Wraps `auth()` for convenience in API routes */
export async function getServerAuth() {
  const session = await auth();
  if (!session?.user) return null;
  return session;
}
