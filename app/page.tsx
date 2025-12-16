import { getDashboardData } from "@/app/actions";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

// --- 1. Definimos o componente FORA da função principal ---
type StatCardProps = {
  label: string;
  value: number;
  subtext?: string;
  color: string;
  icon: string;
};

const StatCard = ({ label, value, subtext, color, icon }: StatCardProps) => (
  <div
    className={`bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between ${color}`}
  >
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
      <p className="text-3xl font-bold text-slate-800">{value}</p>
      {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
    </div>
    <div className="text-3xl opacity-80">{icon}</div>
  </div>
);

// --- 2. Função Principal ---
export default async function Dashboard() {
  const session = await auth();
  if (!session) redirect("/login");

  const data = await getDashboardData();

  // Garantimos que stats existe, senão usamos padrão
  const stats = data.stats || { membros: { total: 0, colih: 0, gvt: 0 } };

  // --- CENÁRIO GVT ---
  if (!data.allowed) {
    return (
      <main className="min-h-screen p-8 bg-slate-50 flex flex-col items-center">
        <div className="max-w-4xl w-full space-y-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <h1 className="text-2xl font-bold text-slate-800 mb-4">
              Olá, {session.user?.name}
            </h1>
            <p className="text-slate-500 mb-8">
              Você está logado como membro GVT. Abaixo está o quadro da equipe.
            </p>

            <Link href="/membros" className="block group">
              <StatCard
                label="Total de Membros"
                value={stats.membros.total}
                subtext={`${stats.membros.colih} COLIH • ${stats.membros.gvt} GVT`}
                color="border-l-4 border-l-purple-500 hover:bg-slate-50 transition"
                icon="👥"
              />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // --- CENÁRIO COLIH ---
  return (
    <main className="min-h-screen p-6 md:p-8 bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Painel Geral</h1>
            <p className="text-slate-500 mt-1">
              Bem-vindo, {session.user?.name?.split(" ")[0]}.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/membros"
              className="bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 font-medium transition"
            >
              Gerenciar Membros
            </Link>
            <Link
              href="/medicos/novo"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition shadow-sm"
            >
              + Novo Médico
            </Link>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/membros">
            <div className="cursor-pointer hover:opacity-95 transition">
              <StatCard
                label="Equipe"
                value={stats.membros.total}
                subtext={`${stats.membros.colih} COLIH / ${stats.membros.gvt} GVT`}
                color="border-l-4 border-l-purple-500"
                icon="👥"
              />
            </div>
          </Link>

          <div className="bg-white p-6 rounded-xl border-l-4 border-l-blue-500 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">
                  Cooperadores
                </p>
                <p className="text-3xl font-bold text-slate-800">
                  {data.colaboradores.length}
                </p>
              </div>
              <div className="text-3xl opacity-80">🩺</div>
            </div>
            <Link
              href="/medicos?tipo=COOPERATING"
              className="mt-4 block text-xs text-blue-600 hover:underline"
            >
              Ver lista completa &rarr;
            </Link>
          </div>

          <div className="bg-white p-6 rounded-xl border-l-4 border-l-indigo-500 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">
                  Consultores
                </p>
                <p className="text-3xl font-bold text-slate-800">
                  {data.consultores.length}
                </p>
              </div>
              <div className="text-3xl opacity-80">🎓</div>
            </div>
            <Link
              href="/medicos?tipo=CONSULTANT"
              className="mt-4 block text-xs text-indigo-600 hover:underline"
            >
              Ver lista completa &rarr;
            </Link>
          </div>
        </div>

        {/* Listas Detalhadas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Lista Colaboradores */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="font-bold text-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Médicos Cooperadores
              </h2>
            </div>
            <div className="p-2">
              {data.colaboradores.map((medico) => (
                <div
                  key={medico.id}
                  className="p-3 hover:bg-slate-50 rounded-lg transition flex justify-between items-center group"
                >
                  <div>
                    <div className="font-medium text-slate-800">
                      {medico.firstName} {medico.lastName}
                    </div>
                    <div className="text-xs text-slate-500">
                      {medico.specialty1}
                    </div>
                  </div>
                  <Link
                    href={`/medicos/${medico.id}`}
                    className="text-xs font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1 bg-blue-50 rounded"
                  >
                    Abrir
                  </Link>
                </div>
              ))}
              {data.colaboradores.length === 0 && (
                <p className="p-6 text-center text-sm text-slate-400">
                  Nenhum registro.
                </p>
              )}
            </div>
          </section>

          {/* Lista Consultores */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="font-bold text-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                Médicos Consultores
              </h2>
            </div>
            <div className="p-2">
              {data.consultores.map((medico) => (
                <div
                  key={medico.id}
                  className="p-3 hover:bg-slate-50 rounded-lg transition flex justify-between items-center group"
                >
                  <div>
                    <div className="font-medium text-slate-800">
                      {medico.firstName} {medico.lastName}
                    </div>
                    <div className="text-xs text-slate-500">
                      {medico.specialty1}
                    </div>
                  </div>
                  <Link
                    href={`/medicos/${medico.id}`}
                    className="text-xs font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1 bg-indigo-50 rounded"
                  >
                    Abrir
                  </Link>
                </div>
              ))}
              {data.consultores.length === 0 && (
                <p className="p-6 text-center text-sm text-slate-400">
                  Nenhum registro.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
