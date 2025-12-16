import type { Metadata } from "next";
import { Inter } from "next/font/google"; 
import "./globals.css";
import Link from "next/link";
import { auth } from "@/auth";
import { handleLogout } from "./actions";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "COLIH Gestão",
  description: "Sistema de gestão para COLIH",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Buscamos a sessão para saber quem está logado e qual o cargo
  const session = await auth();
  const user = session?.user;

  // Verificamos se é GVT para esconder menus
  const isGVT = user?.role === "GVT";

  return (
    <html lang="pt-BR">
      <body className={`${inter.className} antialiased bg-slate-50`}>
        <nav className="bg-blue-900 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo / Título */}
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏥</span>
                <Link
                  href="/"
                  className="font-bold text-xl tracking-tight hover:text-blue-100 transition-colors"
                >
                  COLIH Gestão
                </Link>
              </div>

              {/* Menu da Direita */}
              <div className="hidden md:flex items-center space-x-4">
                {/* Se estiver logado, mostra o botão Médicos */}
                {user && (
                  <>
                    {/* REGRA: Só mostra Médicos se NÃO for GVT */}
                    {!isGVT && (
                      <Link
                        href="/medicos"
                        className="hover:bg-blue-800 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Médicos
                      </Link>
                    )}
                    {/* Membros todos podem ver (mas com permissões diferentes lá dentro) */}
                    <Link
                      href="/membros"
                      className="hover:bg-blue-800 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Membros
                    </Link>
                  </>
                )}

                {/* ÁREA DINÂMICA DE USUÁRIO */}
                {user ? (
                  <div className="flex items-center gap-4 ml-4 pl-4 border-l border-blue-800">
                    <div className="text-right hidden lg:block">
                      <p className="text-sm font-semibold leading-none">
                        {user.name}
                      </p>
                      <p className="text-xs text-blue-300 font-mono mt-1">
                        {user.role}
                      </p>
                    </div>

                    <form action={handleLogout}>
                      <button
                        type="submit"
                        className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-2 rounded transition-colors"
                      >
                        Sair
                      </button>
                    </form>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="bg-white text-blue-900 hover:bg-blue-50 px-4 py-2 rounded-md text-sm font-bold transition-colors"
                  >
                    Entrar
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>

        {children}
      </body>
    </html>
  );
}
