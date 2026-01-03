import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/login");
  const isChangePasswordPage = req.nextUrl.pathname === "/trocar-senha";
  const mustChangePassword = req.auth?.user?.mustChangePassword;

  // Se não está logado e tenta acessar página interna -> manda pro Login
  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Se está logado, PRECISA trocar senha e NÃO está na página de troca -> Bloqueia
  if (isLoggedIn && mustChangePassword && !isChangePasswordPage) {
    return NextResponse.redirect(new URL("/trocar-senha", req.url));
  }

  // Se está logado, JÁ trocou a senha, mas tenta acessar a página de troca -> Manda pra Home
  if (isLoggedIn && !mustChangePassword && isChangePasswordPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

// Configuração: Onde o middleware vai rodar (ignora arquivos estáticos, imagens, etc)
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
