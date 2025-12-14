import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await auth();

  // Se não estiver logado, o Middleware já barra, mas garantimos aqui também
  if (!session) redirect("/login");

  // Buscamos os totais no banco
  const doctorCount = await prisma.doctor.count();
  const userCount = await prisma.user.count();

  return (
    <main className="min-h-screen p-8 bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Cabeçalho de Boas-vindas */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Olá, {session.user?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-slate-500 mt-2">
            Bem-vindo ao painel de controle da COLIH.
          </p>
        </div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card de Médicos (Link clicável) */}
          <Link
            href="/medicos"
            className="block bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                <span className="text-2xl">👨‍⚕️</span>
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Gestão
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">
                Total de Médicos
              </p>
              <p className="text-3xl font-bold text-slate-900">{doctorCount}</p>
            </div>
          </Link>

          {/* Card de Membros (Link clicável) */}
          <Link
            href="/membros"
            className="block bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-purple-300 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                <span className="text-2xl">👨 </span>
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Admin
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">
                Membros da Equipe
              </p>
              <p className="text-3xl font-bold text-slate-900">{userCount}</p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
