import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";
import type { User } from "@prisma/client";

async function getUser(email: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    return user;
  } catch (error) {
    console.error("Falha ao buscar usuário:", error);
    throw new Error("Falha ao buscar usuário.");
  }
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
          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) return user;
        }

        console.log("Credenciais inválidas");
        return null;
      },
    }),
  ],
});
