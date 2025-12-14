import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";
import type { User } from "@prisma/client";

async function getUser(email: string): Promise<User | null> {
  try {
    return await prisma.user.findUnique({ where: { email } });
  } catch (error) {
    throw new Error("Falha ao buscar usuário.");
  }
}

interface UserWithPasswordStatus {
  mustChangePassword?: boolean;
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        // Valida se os dados vêm no formato certo com Zod
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          // Busca o usuário no banco
          const user = await getUser(email);
          if (!user) return null;

          // Verifica se a senha bate (usando bcrypt)
          const passwordsMatch = await bcrypt.compare(
            password,
            user.password as string
          );

          if (passwordsMatch) return user;
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.mustChangePassword = (
          user as UserWithPasswordStatus
        ).mustChangePassword;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        (session.user as UserWithPasswordStatus).mustChangePassword =
          token.mustChangePassword as boolean;
      }
      return session;
    },
  },
});
