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
            // This is a placeholder for the credentials logic
            // The actual login happens via the backend API call in login/page.tsx
            // But we need this provider to exist for next-auth to work
            if (credentials?.username && credentials?.password) {
                return { id: "user", name: "User", email: credentials.username as string };
            }
            return null;
        }
    }),
    GitHub({
        clientId: process.env.GITHUB_ID || 'placeholder',
        clientSecret: process.env.GITHUB_SECRET || 'placeholder'
    }),
    Google({
        clientId: process.env.GOOGLE_ID || 'placeholder',
        clientSecret: process.env.GOOGLE_SECRET || 'placeholder'
    }),
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
