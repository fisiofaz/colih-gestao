import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;

      // AQUI ESTAVA O ERRO EM VERMELHO
      // Trocamos o 'any' por uma definição específica
      const user = auth?.user as { mustChangePassword?: boolean } | undefined;
      const mustChangePassword = user?.mustChangePassword;

      const isOnDashboard =
        nextUrl.pathname === "/" ||
        nextUrl.pathname.startsWith("/medicos") ||
        nextUrl.pathname.startsWith("/membros");
      const isOnChangePassword = nextUrl.pathname === "/trocar-senha";
      const isOnLogin = nextUrl.pathname.startsWith("/login");

      // 1. Se precisa trocar a senha
      if (isLoggedIn && mustChangePassword) {
        if (isOnChangePassword) return true;
        return Response.redirect(new URL("/trocar-senha", nextUrl));
      }

      // 2. Se NÃO precisa trocar senha, mas tenta acessar a pagina de troca
      if (isLoggedIn && !mustChangePassword && isOnChangePassword) {
        return Response.redirect(new URL("/", nextUrl));
      }

      // 3. Lógica padrão de proteção
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false;
      } else if (isLoggedIn && isOnLogin) {
        return Response.redirect(new URL("/", nextUrl));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
