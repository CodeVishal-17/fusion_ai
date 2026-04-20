import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "aifusion_prod_auth_secret_7711",
  session: { strategy: "jwt" },
  providers: [
    Credentials({
        name: "Developer Bypass",
        credentials: {
          username: { label: "Username", type: "text" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
            return { id: "dev", name: "Developer", email: "dev@local.com" };
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
        }
        return session;
    }
  }
})
