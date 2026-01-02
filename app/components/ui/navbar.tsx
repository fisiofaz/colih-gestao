"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { handleLogout } from "@/app/actions"; // Ajuste o caminho se necessário
import type { User } from "next-auth";

interface NavbarProps {
  user: User;
}

export default function Navbar({ user }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isGVP = user?.role === "GVP";

  // Definição dos links para facilitar a renderização
  const links = [
    { label: "Dashboard", href: "/", visible: true },
    { label: "Médicos", href: "/medicos", visible: !isGVP },
    { label: "Membros", href: "/membros", visible: true },
    {
      label: "Estatísticas",
      href: "/estatisticas",
      visible: !isGVP,
      icon: "📊",
    },
    { label: "Auditoria", href: "/auditoria", visible: !isGVP, icon: "🔍" },
  ];

  return (
    <nav className="bg-blue-900 text-white shadow-lg no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* LADO ESQUERDO: LOGO E LINKS DESKTOP */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link
              href="/"
              className="text-xl font-bold tracking-tight flex items-center gap-2"
            >
              <span className="text-2xl">🏥</span>
              <span className="hidden sm:inline">COLIH Gestão</span>
              <span className="sm:hidden">CG</span>
            </Link>

            {/* Links Desktop (somente telas md para cima) */}
            <div className="hidden md:flex gap-6 text-sm font-medium">
              {links.map(
                (link) =>
                  link.visible && (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`hover:text-blue-200 transition-colors flex items-center gap-1
                      ${
                        pathname === link.href
                          ? "text-white font-bold underline decoration-2 underline-offset-4"
                          : "text-blue-100"
                      }`}
                    >
                      {link.icon && <span>{link.icon}</span>}
                      {link.label}
                    </Link>
                  )
              )}
            </div>
          </div>

          {/* LADO DIREITO: PERFIL E MENU MOBILE */}
          <div className="flex items-center gap-4">
            {/* Perfil (Desktop e Mobile) */}
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold">
                {user.name?.split(" ")[0]}
              </div>
              <div className="text-xs text-blue-300 bg-blue-800 px-2 py-0.5 rounded-full inline-block">
                {user.role}
              </div>
            </div>

            {/* Botão Sair (Desktop) */}
            <div className="hidden md:block">
              <form action={handleLogout}>
                <button className="bg-blue-800 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors border border-blue-700">
                  Sair
                </button>
              </form>
            </div>

            {/* BOTÃO HAMBÚRGUER (Aparece só no Mobile) */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-blue-200 hover:text-white hover:bg-blue-700 focus:outline-none"
              >
                <span className="sr-only">Abrir menu</span>
                {isOpen ? (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MENU MOBILE (DROPDOWN) */}
      {isOpen && (
        <div className="md:hidden bg-blue-800 border-t border-blue-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {/* User Info Mobile */}
            <div className="px-3 py-2 border-b border-blue-700 mb-2">
              <p className="text-base font-medium text-white">{user.name}</p>
              <p className="text-sm text-blue-300">{user.email}</p>
              <span className="text-xs bg-blue-900 px-2 py-0.5 rounded mt-1 inline-block">
                {user.role}
              </span>
            </div>

            {links.map(
              (link) =>
                link.visible && (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium
                    ${
                      pathname === link.href
                        ? "bg-blue-900 text-white"
                        : "text-blue-100 hover:bg-blue-700 hover:text-white"
                    }`}
                  >
                    {link.icon && <span className="mr-2">{link.icon}</span>}
                    {link.label}
                  </Link>
                )
            )}

            {/* Logout Mobile */}
            <div className="pt-2 mt-2 border-t border-blue-700">
              <form action={handleLogout}>
                <button className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-200 hover:bg-blue-700 hover:text-white">
                  Sair do Sistema
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
