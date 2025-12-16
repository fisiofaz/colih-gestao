"use client";

import { useFormState } from "react-dom";
import { createUser } from "@/app/actions";
import Link from "next/link";

export default function NewMemberPage() {
  const [state, dispatch, isPending] = useFormState(createUser, null);

  return (
    <div className="min-h-screen bg-slate-50 p-8 flex justify-center">
      <div className="max-w-lg w-full">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Novo Usuário</h1>
          <Link
            href="/membros"
            className="text-sm text-slate-500 hover:text-blue-600"
          >
            ← Voltar
          </Link>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <form action={dispatch} className="space-y-6">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nome Completo
              </label>
              <input
                name="name"
                type="text"
                required
                className="w-full rounded-md border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p className="text-red-500 text-xs mt-1">{state?.errors?.name}</p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email de Acesso
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-md border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p className="text-red-500 text-xs mt-1">
                {state?.errors?.email}
              </p>
            </div>

            {/* PERMISSÃO (ROLE) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nível de Permissão
              </label>
              <div className="relative">
                <select
                  name="role"
                  defaultValue="GVT"
                  className="w-full rounded-md border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
                >
                  <option value="GVT">Membro GVT (Acesso Restrito)</option>
                  <option value="COLIH">Membro COLIH (Gestão Total)</option>
                </select>
                {/* Ícone de seta para ficar bonito */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Membros GVT veem apenas a lista de membros. Membros COLIH
                gerenciam médicos.
              </p>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Senha Inicial
              </label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                className="w-full rounded-md border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p className="text-red-500 text-xs mt-1">
                {state?.errors?.password}
              </p>
            </div>

            {/* Erro Geral */}
            {state?.message && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">
                {state.message}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-lg disabled:opacity-50"
            >
              {isPending ? "Cadastrando..." : "Criar Usuário"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
