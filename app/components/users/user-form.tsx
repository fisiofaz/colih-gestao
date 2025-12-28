"use client";

import { updateUser } from "@/app/actions";
import { User } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface UserFormProps {
  user: User;
}

export default function UserForm({ user }: UserFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);

    // Chama a server action que criamos
    const result = await updateUser(user.id, formData);

    if (result.success) {
      router.push("/membros"); // Volta para a lista
      router.refresh(); // Atualiza os dados
    } else {
      setError(result.message);
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 max-w-2xl mx-auto"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nome Completo
          </label>
          <input
            name="name"
            defaultValue={user.name || ""}
            required
            className="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email
          </label>
          <input
            name="email"
            type="email"
            defaultValue={user.email || ""}
            required
            className="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Cargo / Role */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Função / Cargo
          </label>
          <select
            name="role"
            defaultValue={user.role}
            className="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="COLIH">Membro COLIH</option>
            <option value="GVP">Membro GVP</option>
            <option value="ADMIN">Administrador</option>
          </select>
          <p className="text-xs text-slate-500 mt-1">
            ⚠️ Cuidado ao definir como Administrador.
          </p>
        </div>
      </div>

      {/* Botões */}
      <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
        <Link
          href="/membros"
          className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
        >
          {loading ? "Salvando..." : "Salvar Alterações"}
        </button>
      </div>
    </form>
  );
}
