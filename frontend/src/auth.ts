import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: true,
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "aifusion_prod_auth_secret_7711",
  session: { strategy: "jwt" },
  providers: [
    Credentials({
        name: "AIFusion",
        credentials: {
          username: { label: "Email", type: "text" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
            if (credentials?.username && credentials?.password) {
                return { id: "user", name: "User", email: credentials.username as string };
            }
            return null;
        }
    }),
    // Only include social providers if their IDs are actually present
    ...(process.env.GITHUB_ID ? [
      GitHub({
          clientId: process.env.GITHUB_ID,
          clientSecret: process.env.GITHUB_SECRET
      })
    ] : []),
    ...(process.env.GOOGLE_ID ? [
      Google({
          clientId: process.env.GOOGLE_ID,
          clientSecret: process.env.GOOGLE_SECRET
      })
    ] : []),
  ],
  callbacks: {
    async session({ session, token }) {
        if (session.user && token.sub) {
            session.user.id = token.sub;
        }
        return session;
    },
    async jwt({ token, user }) {
        if (user) {
            token.id = user.id;
        }
        return token;
    }
  }
})
