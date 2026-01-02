import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { auth } from "@/auth";
import { handleLogout } from "./actions";
import { Toaster } from "sonner";
import Navbar from "@/app/components/ui/navbar";

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

  return (
    <html lang="pt-BR">
      <body className={`${inter.className} antialiased bg-slate-50`}>
        {/* Renderiza o Navbar APENAS se tiver usuário logado */}
        {/* Passamos o objeto 'user' para o componente cuidar da lógica visual */}
        {user && <Navbar user={user} />}

        {children}

        <Toaster position="top-right" richColors expand={true} />
      </body>
    </html>
  );
}
