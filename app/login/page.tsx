"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    // Simulação de login (apenas para testar o visual hoje)
    setTimeout(() => {
      alert("O visual funciona! Próximo passo: Conectar o Auth.js");
      setIsLoading(false);
    }, 1000);
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Cabeçalho do Card */}
        <div className="bg-blue-900 p-8 text-center">
          <div className="text-4xl mb-2">🏥</div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            COLIH Gestão
          </h1>
          <p className="text-blue-200 text-sm mt-1">Acesso Restrito</p>
        </div>

        {/* Formulário */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* E-mail */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-slate-700 block"
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="seu@email.com"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-700 block"
                >
                  Senha
                </label>
                <Link
                  href="#"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Botão Entrar */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-lg transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Entrando...
                </>
              ) : (
                "Acessar Sistema"
              )}
            </button>
          </form>
        </div>

        {/* Rodapé do Card */}
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Acesso exclusivo para membros da comissão.
          </p>
        </div>
      </div>
    </div>
  );
}
