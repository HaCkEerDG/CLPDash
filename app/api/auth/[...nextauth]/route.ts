import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcrypt"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        // For development, you can use these hardcoded credentials
        const validCredentials = {
          username: process.env.ADMIN_USERNAME || 'admin',
          // In production, use hashed password stored in env
          password: process.env.ADMIN_PASSWORD || 'admin123'
        }

        if (credentials.username === validCredentials.username &&
            credentials.password === validCredentials.password) {
          return {
            id: '1',
            name: credentials.username,
            email: `${credentials.username}@example.com`
          }
        }

        return null
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST } 
