import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;

      // AQUI ESTAVA O PROBLEMA: Adicionamos "/membros" na lista de rotas protegidas
      const isOnProtectedRoutes =
        nextUrl.pathname === "/" ||
        nextUrl.pathname.startsWith("/medicos") ||
        nextUrl.pathname.startsWith("/membros");

      const isOnLogin = nextUrl.pathname.startsWith("/login");

      if (isOnProtectedRoutes) {
        if (isLoggedIn) return true;
        return false; // Redireciona para /login se não estiver logado
      } else if (isLoggedIn && isOnLogin) {
        // Se já está logado e tenta ir pro login, manda pro dashboard
        return Response.redirect(new URL("/", nextUrl));
      }
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
