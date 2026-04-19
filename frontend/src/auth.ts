import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"

const globalForPrisma = global as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
        name: "Developer Bypass",
        credentials: {
          username: { label: "Username", type: "text" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
            // Instantly bypass login and create a stub dev user in the DB if it doesn't exist
            let devUser = await prisma.user.findUnique({ where: { email: "dev@local.com" } });
            if (!devUser) {
                devUser = await prisma.user.create({
                    data: { name: "Developer", email: "dev@local.com", tokens: 100 }
                });
            }
            return { id: devUser.id, name: devUser.name, email: devUser.email };
        }
    }),
    GitHub({
        clientId: process.env.GITHUB_ID ?? 'placeholder',
        clientSecret: process.env.GITHUB_SECRET ?? 'placeholder'
    }),
    Google({
        clientId: process.env.GOOGLE_ID ?? 'placeholder',
        clientSecret: process.env.GOOGLE_SECRET ?? 'placeholder'
    }),
  ],
  callbacks: {
    async session({ session, token }) {
        if (session.user && token.sub) {
            session.user.id = token.sub;
            const dbUser = await prisma.user.findUnique({ where: { id: token.sub } });
            (session.user as any).tokens = dbUser?.tokens ?? 0;
        }
        return session;
    }
  }
})
