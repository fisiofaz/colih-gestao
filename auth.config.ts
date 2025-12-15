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
      const user = auth?.user as
        | {
            role?: string;
            mustChangePassword?: boolean;
          }
        | undefined;
      const mustChangePassword = user?.mustChangePassword;

      // Rotas
      const isOnDashboard = nextUrl.pathname === "/";

      // Separamos a rota de médicos para aplicar regra específica
      const isOnMedicos = nextUrl.pathname.startsWith("/medicos");

      const isOnMembros = nextUrl.pathname.startsWith("/membros");
      const isOnChangePassword = nextUrl.pathname === "/trocar-senha";
      const isOnLogin = nextUrl.pathname.startsWith("/login");

      // --- REGRAS DE SEGURANÇA ---
      // 1. Se precisa trocar a senha
      if (isLoggedIn && mustChangePassword) {
        if (isOnChangePassword) return true;
        return Response.redirect(new URL("/trocar-senha", nextUrl));
      }

      // 2. Se NÃO precisa trocar senha, mas tenta acessar a pagina de troca
      if (isLoggedIn && !mustChangePassword && isOnChangePassword) {
        return Response.redirect(new URL("/", nextUrl));
      }

      // 3. REGRA NOVA: GVT NÃO acessa Médicos
      if (isLoggedIn && isOnMedicos && user?.role === "GVT") {
        return Response.redirect(new URL("/", nextUrl));
      }

      // 4. Lógica padrão de proteção (Dashboard, Médicos e Membros)
      if (isOnDashboard || isOnMedicos || isOnMembros) {
        if (isLoggedIn) return true;
        return false; // Redireciona para login
      }

      // 5. Se já está logado e tenta ir pro login
      else if (isLoggedIn && isOnLogin) {
        return Response.redirect(new URL("/", nextUrl));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
