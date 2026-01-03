"use client";

import { updatePassword } from "@/app/actions";
import { useFormState } from "react-dom";

// Estado inicial para o hook
const initialState = {
  message: "",
  errors: {},
};

export default function TrocarSenhaPage() {
  const [state, action] = useFormState(updatePassword, initialState);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-red-100">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">
            Troca de Senha Obrigatória 🔒
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            Por segurança, você precisa definir uma nova senha antes de acessar
            o sistema.
          </p>
        </div>

        <form action={action} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nova Senha
            </label>
            <input
              name="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              className="w-full rounded-lg border-slate-300 focus:ring-blue-500"
              required
            />
            {state?.errors?.password && (
              <p className="text-red-500 text-xs mt-1">
                {state.errors.password[0]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Confirmar Nova Senha
            </label>
            <input
              name="confirmPassword"
              type="password"
              className="w-full rounded-lg border-slate-300 focus:ring-blue-500"
              required
            />
            {state?.errors?.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {state.errors.confirmPassword[0]}
              </p>
            )}
          </div>

          {state?.message && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
              {state.message}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
          >
            Atualizar Senha e Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
