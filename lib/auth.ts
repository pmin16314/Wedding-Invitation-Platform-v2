import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: { type: "text" },   // called "username" but value is their email
        password: { type: "password" },
        slug:     { type: "text" },
      },
      async authorize(creds) {
        try {
          const username = (creds?.username as string)?.toLowerCase().trim();
          const password = creds?.password as string;
          const slug     = creds?.slug as string | undefined;
          if (!username || !password || password.length > 72) return null;
          const user = await prisma.user.findUnique({
            where: { username }, include: { wedding: true },
          });
          if (!user?.passwordHash) return null;
          if (!await bcrypt.compare(password, user.passwordHash)) return null;
          if (slug && user.role === "COUPLE") {
            if (!user.wedding || user.wedding.slug !== slug) return null;
          }
          return {
            id:          user.id,
            email:       user.email ?? user.username,
            name:        user.name,
            role:        user.role,
            weddingId:   user.wedding?.id   ?? null,
            weddingSlug: user.wedding?.slug ?? null,
          };
        } catch { return null; }
      },
    }),
  ],
});
