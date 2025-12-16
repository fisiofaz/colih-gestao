"use client";

import { useFormState } from "react-dom";
import { updatePassword } from "@/app/actions"; // Importe a ação que criamos
import { handleLogout } from "@/app/actions"; // Para caso a pessoa queira desistir

export default function ChangePasswordPage() {
  const [state, dispatch, isPending] = useFormState(updatePassword, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
        <div className="bg-orange-500 p-6 text-center">
          <div className="text-4xl mb-2">🔐</div>
          <h1 className="text-xl font-bold text-white">
            Troca de Senha Obrigatória
          </h1>
          <p className="text-orange-100 text-sm mt-1">
            Por segurança, você precisa definir uma nova senha no primeiro
            acesso.
          </p>
        </div>

        <div className="p-8">
          <form action={dispatch} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                Nova Senha
              </label>
              <input
                name="password"
                type="password"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-700 focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="No mínimo 6 caracteres"
              />
              <p className="text-red-500 text-xs mt-1">
                {state?.errors?.password}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                Confirme a Nova Senha
              </label>
              <input
                name="confirmPassword"
                type="password"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-700 focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="Repita a senha"
              />
              <p className="text-red-500 text-xs mt-1">
                {state?.errors?.confirmPassword}
              </p>
            </div>

            {state?.message && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
                {state.message}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition-colors"
            >
              {isPending ? "Salvando..." : "Definir Nova Senha"}
            </button>
          </form>

          {/* Botão de Sair caso não queira trocar agora */}
          <form action={handleLogout} className="mt-4 text-center">
            <button className="text-sm text-slate-400 hover:text-slate-600">
              Sair e fazer isso depois
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
