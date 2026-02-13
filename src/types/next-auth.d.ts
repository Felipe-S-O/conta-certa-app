import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    role?: string;
    error?: string;
    user: {
      id?: number;
      firstName?: string;
      lastName?: string;
      companyId?: number;
      role?: string;
    } & DefaultSession["user"];
  }

  interface User {
    accessToken: string;
    refreshToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    refreshToken: string;
    id?: number;
    firstName?: string;
    lastName?: string;
    companyId?: number;
    role?: string;
    exp: number;
    error?: string;
  }
}
