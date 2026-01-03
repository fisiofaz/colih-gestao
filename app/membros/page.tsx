import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import UserSidebar from "@/app/components/users/user-sidebar";
import Search from "../medicos/components/search";
import Pagination from "../medicos/components/pagination";
import { DeleteUserButton } from "@/app/membros/components/delete-user-button";

interface PageProps {
  searchParams: Promise<{
    query?: string;
    role?: string;
    page?: string;
  }>;
}

export default async function MembrosPage({ searchParams }: PageProps) {
  const session = await auth();

  // 1. REGRA DE ACESSO:
  // GVP é barrado. COLIH e ADMIN podem entrar.
  if (!session || session.user?.role === "GVP") {
    redirect("/");
  }

  // Variável para controlar o que aparece na tela
  const isAdmin = session.user.role === "ADMIN";

  const ITEMS_PER_PAGE = 10;
  const params = await searchParams;

  const query = params.query || "";
  const roleFiltro = params.role as UserRole | undefined;
  const currentPage = Number(params.page) || 1;
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  const whereCondition = {
    role: roleFiltro,
    OR: query
      ? [
          { name: { contains: query, mode: "insensitive" as const } },
          { email: { contains: query, mode: "insensitive" as const } },
        ]
      : undefined,
  };

  const [users, totalCount, countColih, countGvp, countAdmin] =
    await Promise.all([
      prisma.user.findMany({
        where: whereCondition,
        orderBy: { name: "asc" },
        take: ITEMS_PER_PAGE,
        skip: skip,
      }),
      prisma.user.count({ where: whereCondition }),
      prisma.user.count({ where: { role: "COLIH" } }),
      prisma.user.count({ where: { role: "GVP" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
    ]);

  const totalUsersGlobal = countColih + countGvp + countAdmin;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const roleLabels: Record<string, string> = {
    ADMIN: "Administrador",
    COLIH: "Membro COLIH",
    GVP: "Membro GVP",
  };

  const roleColors: Record<string, string> = {
    ADMIN: "bg-slate-100 text-slate-600",
    COLIH: "bg-blue-50 text-blue-700 border-blue-100",
    GVP: "bg-purple-50 text-purple-700 border-purple-100",
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <main className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Gerenciar Membros
            </h1>
            <p className="text-slate-500 mt-1">
              Visualização dos membros do sistema
            </p>
          </div>

          {/* SÓ ADMIN VÊ O BOTÃO DE NOVO MEMBRO */}
          {isAdmin && (
            <Link
              href="/membros/novo"
              className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-2 font-medium"
            >
              <span>+</span> Novo Membro
            </Link>
          )}
        </header>

        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="w-full md:w-auto">
            <UserSidebar
              counts={{
                COLIH: countColih,
                GVP: countGvp,
                ADMIN: countAdmin,
                total: totalUsersGlobal,
              }}
            />
          </div>

          <div className="flex-1 w-full">
            <section className="mb-6 max-w-md">
              <Search placeholder="Buscar por nome ou email..." />
            </section>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Nome</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Função</th>
                    {/* SÓ ADMIN VÊ O CABEÇALHO DA COLUNA AÇÕES */}
                    {isAdmin && <th className="px-6 py-4 text-right">Ações</th>}
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
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            roleColors[user.role] || "bg-gray-100"
                          }`}
                        >
                          {roleLabels[user.role] || user.role}
                        </span>
                      </td>

                      {/* SÓ ADMIN VÊ OS BOTÕES DE AÇÃO */}
                      {isAdmin && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end items-center gap-3">
                            <Link
                              href={`/membros/${user.id}/editar`}
                              className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                            >
                              Editar
                            </Link>

                            {session.user?.id !== user.id && (
                              <DeleteUserButton
                                id={user.id}
                                name={user.name || "Usuário"}
                              />
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}

                  {users.length === 0 && (
                    <tr>
                      <td
                        colSpan={isAdmin ? 4 : 3}
                        className="px-6 py-12 text-center text-slate-500"
                      >
                        Nenhum membro encontrado neste filtro.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6">
              <Pagination totalPages={totalPages} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
