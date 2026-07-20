import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role as "ADMIN" | "EDITOR";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "EDITOR";
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
  providers: [],
};
