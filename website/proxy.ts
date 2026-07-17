// Node.js runtime – auth proxy using standalone config (no Prisma adapter needed)
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export function proxy(request: Request) {
  const url = new URL(request.url);

  // Allow login page to render without redirect loop
  if (url.pathname === "/admin/login") {
    return;
  }

  // Delegate to NextAuth's authorized callback which handles redirects
  // The `auth` function from the config checks the JWT and runs authorized()
  return auth(request as any);
}

export const config = {
  matcher: ["/admin/:path*"],
};
