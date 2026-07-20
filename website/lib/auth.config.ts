import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { createHmac } from "crypto";
import { prisma } from "./db";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role as "ADMIN" | "EDITOR" | "AUTHOR";
        if ("twoFactorRequired" in user && user.twoFactorRequired) {
          token.twoFactorRequired = true;
        }
      }

      if (trigger === "update" && session && typeof session === "object") {
        const s = session as Record<string, unknown>;
        if (
          typeof s.twoFactorHmac === "string" &&
          typeof s.twoFactorTimestamp === "string" &&
          token.id
        ) {
          const expectedHmac = createHmac("sha256", process.env.NEXTAUTH_SECRET!)
            .update(token.id + s.twoFactorTimestamp)
            .digest("hex");
          if (
            expectedHmac === s.twoFactorHmac &&
            Date.now() - parseInt(s.twoFactorTimestamp, 10) < 5 * 60 * 1000
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
        session.user.role = token.role as "ADMIN" | "EDITOR" | "AUTHOR";
        session.user.twoFactorRequired = token.twoFactorRequired === true;
        session.user.twoFactorVerified = token.twoFactorVerified === true;
      }
      return session;
    },
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = auth?.user?.role as
        | "ADMIN"
        | "EDITOR"
        | "AUTHOR"
        | undefined;
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      const isLoginPage = nextUrl.pathname === "/admin/login";
      const isVerify2faPage = nextUrl.pathname === "/admin/verify-2fa";
      const isVerify2faApi = nextUrl.pathname === "/api/auth/verify-2fa";
      const isNextAuthApi = nextUrl.pathname.startsWith("/api/auth");

      const twoFactorRequired = auth?.user?.twoFactorRequired === true;
      const twoFactorVerified = auth?.user?.twoFactorVerified === true;
      const needs2fa = isLoggedIn && twoFactorRequired && !twoFactorVerified;

      const adminOnlyRoutes = ["/admin/users"];
      const isAdminOnlyRoute = adminOnlyRoutes.some((route) =>
        nextUrl.pathname.startsWith(route)
      );

      if (isLoginPage) {
        // Redirect to dashboard if already logged in and 2FA verified (or not required)
        if (isLoggedIn && !needs2fa) {
          return Response.redirect(new URL("/admin", nextUrl));
        }
        return true;
      }

      if (isVerify2faPage) {
        // Only allow access to verify-2fa page if 2FA is actually required
        if (needs2fa) return true;
        // If not logged in, redirect to login
        if (!isLoggedIn) {
          return Response.redirect(new URL("/admin/login", nextUrl));
        }
        // If already verified or not required, redirect to admin
        return Response.redirect(new URL("/admin", nextUrl));
      }

      if (isAdminRoute) {
        if (!isLoggedIn) {
          const loginUrl = new URL("/admin/login", nextUrl);
          loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
          return Response.redirect(loginUrl);
        }

        if (needs2fa) {
          return Response.redirect(new URL("/admin/verify-2fa", nextUrl));
        }

        if (isAdminOnlyRoute && userRole !== "ADMIN") {
          return Response.redirect(new URL("/admin", nextUrl));
        }

        return true;
      }

      // For API routes: allow NextAuth and verify-2fa API when 2FA is pending
      if (isNextAuthApi || isVerify2faApi) {
        return true;
      }

      return true;
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        const baseUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };

        if (user.twoFactorEnabled) {
          return { ...baseUser, twoFactorRequired: true };
        }

        return baseUser;
      },
    }),
  ],
};
