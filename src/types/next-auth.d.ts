import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    email?: string;
    role?: string;
    error?: string;
    user?: {
      name?: string;
      email?: string;
    } & DefaultSession["user"];
  }

  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    email?: string;
    role?: string;
    exp?: number;
    error?: string;
  }
}
