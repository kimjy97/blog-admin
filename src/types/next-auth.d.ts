import { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: "admin" | "editor" | "author" | "subscriber";
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    role?: "admin" | "editor" | "author" | "subscriber";
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    role?: "admin" | "editor" | "author" | "subscriber";
  }
}
