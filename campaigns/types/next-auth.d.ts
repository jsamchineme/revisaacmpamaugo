import { type UserRole } from "@prisma/client";
import "next-auth";
import "@auth/core/types";

declare module "next-auth" {
  interface User {
    role?: UserRole;
    twoFactorRequired?: boolean;
    twoFactorVerified?: boolean;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: UserRole;
      twoFactorRequired?: boolean;
      twoFactorVerified?: boolean;
    };
  }
}

declare module "@auth/core/types" {
  interface User {
    role?: UserRole;
    twoFactorRequired?: boolean;
    twoFactorVerified?: boolean;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: UserRole;
      twoFactorRequired?: boolean;
      twoFactorVerified?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    twoFactorRequired?: boolean;
    twoFactorVerified?: boolean;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    twoFactorRequired?: boolean;
    twoFactorVerified?: boolean;
  }
}
