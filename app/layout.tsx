import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { auth } from "@/auth";
import { handleLogout } from "./actions";
import { Toaster } from "sonner";

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
  const session = await auth();
  const user = session?.user;
  const isGVP = user?.role === "GVP"; // Verifica se é GVP

  return (
    <html lang="pt-BR">
      <body className={`${inter.className} antialiased bg-slate-50`}>
        {/* BARRA DE NAVEGAÇÃO */}
        {user && (
          <nav className="bg-blue-900 text-white shadow-lg no-print">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <div className="flex items-center gap-8">
                  {/* Logo / Home */}
                  <Link
                    href="/"
                    className="text-xl font-bold tracking-tight flex items-center gap-2"
                  >
                    <span className="text-2xl">🏥</span> COLIH Gestão
                  </Link>

                  {/* Links do Menu */}
                  <div className="hidden md:flex gap-6 text-sm font-medium">
                    <Link
                      href="/"
                      className="hover:text-blue-200 transition-colors"
                    >
                      Dashboard
                    </Link>

                    {/* Só mostra Médicos se NÃO for GVP (conforme sua regra anterior de esconder a lista) 
                        Se quiser que GVP veja a lista mas não edite, remova o !isGVP daqui */}
                    {!isGVP && (
                      <Link
                        href="/medicos"
                        className="hover:text-blue-200 transition-colors"
                      >
                        Médicos
                      </Link>
                    )}

                    <Link
                      href="/membros"
                      className="hover:text-blue-200 transition-colors"
                    >
                      Membros
                    </Link>

                    {/* --- NOVO: BOTÃO DE AUDITORIA --- */}
                    {/* Só aparece se NÃO for GVP */}
                    {!isGVP && (
                      <Link
                        href="/auditoria"
                        className="flex items-center gap-1 text-blue-200 hover:text-white transition-colors"
                      >
                        🔍 Auditoria
                      </Link>
                    )}
                  </div>
                </div>

                {/* Perfil e Logout */}
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-semibold">{user.name}</div>
                    <div className="text-xs text-blue-300 bg-blue-800 px-2 py-0.5 rounded-full inline-block">
                      {user.role}
                    </div>
                  </div>
                  <form action={handleLogout}>
                    <button className="bg-blue-800 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                      Sair
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </nav>
        )}

        {children}

        <Toaster position="top-right" richColors expand={true} />
      </body>
    </html>
  );
}
