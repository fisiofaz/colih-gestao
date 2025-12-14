"use client";

import { useActionState } from "react"; // Hook novo do Next 15/React 19
import { authenticate } from "@/app/actions";

export default function LoginPage() {
  // O hook gerencia o estado do formulário (erro, sucesso, carregando)
  // 'errorMessage' recebe o retorno da função authenticate (ex: "Senha incorreta")
  const [errorMessage, dispatch, isPending] = useActionState(
    authenticate,
    undefined
  );

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Cabeçalho */}
        <div className="bg-blue-900 p-8 text-center">
          <div className="text-4xl mb-2">🏥</div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            COLIH Gestão
          </h1>
          <p className="text-blue-200 text-sm mt-1">Acesso Restrito</p>
        </div>

        {/* Formulário */}
        <div className="p-8">
          {/* O 'action={dispatch}' envia os dados para o authenticate no servidor */}
          <form action={dispatch} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-slate-700 block"
              >
                E-mail
              </label>
              <input
                id="email"
                name="email" // Importante: o name deve ser 'email' para o Auth.js ler
                type="email"
                required
                placeholder="seu@email.com"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-slate-700 block"
              >
                Senha
              </label>
              <input
                id="password"
                name="password" // Importante: o name deve ser 'password'
                type="password"
                required
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Mensagem de Erro (Se houver) */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                ⚠️ <p>{errorMessage}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending} // Desabilita enquanto carrega
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-lg transition-colors shadow-md disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {isPending ? "Entrando..." : "Acessar Sistema"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
