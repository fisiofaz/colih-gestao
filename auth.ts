import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { User, UserRole } from "@prisma/client";

async function getUser(email: string): Promise<User | null> {
  try {
    return await prisma.user.findUnique({ where: { email } });
  } catch (error) {
    throw new Error("Falha ao buscar usuário.");
  }
}

interface UserCustomFields {
  mustChangePassword?: boolean;
  role?: UserRole; 
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
          if (!user || !user.password) return null;

          // Verifica se a senha bate (usando bcrypt)
          const passwordsMatch = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (passwordsMatch) return user;
        }
        return null;
      },
    }),
  ],
  callbacks: {
    // Quando o usuário loga, jogamos os dados do banco para o Token
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.mustChangePassword = user.mustChangePassword;
      }
      return token;
    },
    // Quando o front pede dados, jogamos os dados do Token para a Sessão
    async session({ session, token }) {
     if (token && session.user) {
       session.user.role = token.role as UserRole;
       session.user.mustChangePassword = token.mustChangePassword as boolean;
     }
      return session;
    },
  },
});
