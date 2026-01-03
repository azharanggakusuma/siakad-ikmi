import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string
      username: string
      name: string
      role: string
      student_id?: string | null 
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    username: string
    name: string
    role: string
    student_id?: string | null 
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    id: string
    username: string
    role: string
    student_id?: string | null 
  }
}