import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PrintButton } from "../medicos/components/print-button";

export default async function MembersPage() {
  //Proteção: Só logado entra aqui
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Verificamos se o usuário atual é GVP para esconder o botão de criar
  const isGVP = session.user.role === "GVP";

  //Busca usuários no banco
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Função auxiliar para cor da badge (Pode ficar aqui dentro mesmo)
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "COLIH":
        return "bg-purple-100 text-purple-700 ring-purple-700/10";
      case "GVP":
        return "bg-green-100 text-green-700 ring-green-600/20";
      case "ADMIN":
        return "bg-red-100 text-red-700 ring-red-600/10";
      default:
        return "bg-gray-50 text-gray-600 ring-gray-500/10";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Membros da Comissão
            </h1>
            <p className="text-slate-500 mt-1">
              Usuários com acesso ao sistema
            </p>
          </div>
          {/* SÓ MOSTRA O BOTÃO SE NÃO FOR GVP */}
          {!isGVP && (
            <Link
              href="/membros/novo"
              className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2"
            >
              <span>+</span> Novo Membro
            </Link>
          )}
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Função</th>
                <th className="px-6 py-4 text-right">Cadastrado em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {user.name || "Sem nome"}
                  </td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${getRoleBadge(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-400">
                    {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
