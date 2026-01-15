import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth";
import { Toaster } from "sonner";
import Navbar from "@/app/components/ui/navbar";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};


export const metadata: Metadata = {
  title: "COLIH Gestão",
  description: "Sistema de gestão para COLIH",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/public/android-chrome-192x192.png", // Ícone para abas e Android
    shortcut: "/public/android-chrome-192x192.png", // Ícone de atalho
    apple: "/public/android-chrome-192x192.png", // Ícone EXCLUSIVO para iPhone/iPad
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "COLIH",
  },
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
