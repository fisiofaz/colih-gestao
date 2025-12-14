// auth.config.ts
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login", // Se não estiver logado, manda pra cá
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;

      // Rotas protegidas (Dashboard e Médicos)
      const isOnDashboard =
        nextUrl.pathname === "/" || nextUrl.pathname.startsWith("/medicos");

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redireciona para /login
      } else if (isLoggedIn) {
        // Se já está logado e tenta ir pro login, manda pro dashboard
        return Response.redirect(new URL("/", nextUrl));
      }
      return true;
    },
  },
  providers: [], // Vamos configurar o login com credenciais no próximo passo
} satisfies NextAuthConfig;
