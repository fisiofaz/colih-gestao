import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // O matcher define onde o middleware deve rodar.
  // A regex abaixo diz: "Rode em tudo, MENOS arquivos estáticos e imagens"
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
