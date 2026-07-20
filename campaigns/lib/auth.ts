import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { createHmac } from "crypto";
import { authConfig } from "./auth.config";
import { prisma } from "./db";
import { checkRateLimit } from "./rateLimit";

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        if (!email || !password) return null;

        const ip = getClientIp(request as Request);
        const rateLimit = await checkRateLimit(ip, "login", 5, 15 * 60 * 1000);
        if (rateLimit.blocked) {
          throw new Error("Too many login attempts. Please try again later.");
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          twoFactorRequired: user.twoFactorEnabled,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role as "ADMIN" | "EDITOR";
        token.twoFactorRequired = user.twoFactorRequired ?? false;
      }

      if (trigger === "update" && session) {
        const sess = session as Record<string, unknown>;
        if (
          typeof sess.twoFactorHmac === "string" &&
          typeof sess.twoFactorTimestamp === "string"
        ) {
          const expectedHmac = createHmac(
            "sha256",
            process.env.NEXTAUTH_SECRET!
          )
            .update(token.id + sess.twoFactorTimestamp)
            .digest("hex");

          if (
            expectedHmac === sess.twoFactorHmac &&
            Date.now() - parseInt(sess.twoFactorTimestamp, 10) < 5 * 60 * 1000
          ) {
            token.twoFactorVerified = true;
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "EDITOR";
        session.user.twoFactorRequired = token.twoFactorRequired ?? false;
        session.user.twoFactorVerified = token.twoFactorVerified ?? false;
      }
      return session;
    },
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      const isLoginPage = nextUrl.pathname === "/admin/login";
      const isVerify2faPage = nextUrl.pathname === "/admin/verify-2fa";
      const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
      const isVerify2faApi = nextUrl.pathname === "/api/auth/verify-2fa";

      const twoFactorRequired = auth?.user?.twoFactorRequired ?? false;
      const twoFactorVerified = auth?.user?.twoFactorVerified ?? false;
      const needs2fa = isLoggedIn && twoFactorRequired && !twoFactorVerified;

      if (isLoginPage) {
        if (isLoggedIn && !needs2fa) {
          return Response.redirect(new URL("/admin", nextUrl));
        }
        return true;
      }

      if (isVerify2faPage || isVerify2faApi) {
        return true;
      }

      if (needs2fa) {
        if (isApiAuthRoute) {
          return true;
        }
        if (isAdminRoute) {
          return Response.redirect(new URL("/admin/verify-2fa", nextUrl));
        }
      }

      if (isAdminRoute) {
        if (!isLoggedIn) {
          const loginUrl = new URL("/admin/login", nextUrl);
          loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
          return Response.redirect(loginUrl);
        }
        return true;
      }

      return true;
    },
  },
});
