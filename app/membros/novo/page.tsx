"use client";

import { useActionState } from "react";
import { createUser } from "@/app/actions";
import Link from "next/link";

export default function NewMemberPage() {
  const [state, dispatch, isPending] = useActionState(createUser, null);

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
