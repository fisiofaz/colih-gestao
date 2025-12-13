// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link"; // Importante para os links funcionarem

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "COLIH Gestão",
  description: "Sistema de Apoio à Comissão de Ligação com Hospitais",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        {/* --- NAVBAR (Menu Superior) --- */}
        <nav className="bg-blue-900 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo e Nome */}
              <Link
                href="/"
                className="flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                <span className="text-2xl">🏥</span>
                <span className="font-bold text-xl tracking-tight">
                  COLIH Gestão
                </span>
              </Link>

              {/* Links de Navegação */}
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  href="/medicos"
                  className="hover:bg-blue-800 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Médicos
                </Link>
                <Link
                  href="/membros"
                  className="hover:bg-blue-800 px-3 py-2 rounded-md text-sm font-medium transition-colors opacity-50 cursor-not-allowed"
                  title="Em breve"
                >
                  Membros
                </Link>
              </div>

              {/* Perfil (Fictício) */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-blue-200">Olá, Irmão</span>
                <div className="h-8 w-8 bg-blue-700 rounded-full flex items-center justify-center text-sm font-bold border border-blue-500">
                  IM
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* --- CONTEÚDO DAS PÁGINAS --- */}
        <main>{children}</main>
      </body>
    </html>
  );
}
