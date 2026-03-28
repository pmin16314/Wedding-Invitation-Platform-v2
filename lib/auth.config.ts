import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages:   { signIn: "/login", error: "/login" },
  providers: [],
  callbacks: {
    // jwt and session callbacks are safe for Edge — no Prisma, no Node crypto
    async jwt({ token, user }) {
      if (user) {
        token.id          = user.id;
        token.role        = (user as any).role;
        token.weddingId   = (user as any).weddingId;
        token.weddingSlug = (user as any).weddingSlug;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id          = token.id          as string;
      session.user.role        = token.role        as string;
      session.user.weddingId   = token.weddingId   as string | null;
      session.user.weddingSlug = token.weddingSlug as string | null;
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = (auth?.user as any)?.role as string | undefined;
      const path = nextUrl.pathname;

      if (path.startsWith("/dashboard") && !isLoggedIn)
        return Response.redirect(new URL("/login", nextUrl.origin));

      if (path.startsWith("/admin")) {
        if (!isLoggedIn) return Response.redirect(new URL("/login", nextUrl.origin));
        if (role !== "ADMIN") return Response.redirect(new URL("/dashboard", nextUrl.origin));
      }

      if (path === "/login" && isLoggedIn)
        return Response.redirect(new URL(role === "ADMIN" ? "/admin" : "/dashboard", nextUrl.origin));

      return true;
    },
  },
};
