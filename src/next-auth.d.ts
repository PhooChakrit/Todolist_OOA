// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      picture?: string;
      name?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    picture?: string;
    name?: string;
  }
}
