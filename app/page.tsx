import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import DashboardCharts from "@/app/components/dashboard/dashboard-charts";
import { StatCard } from "@/app/components/dashboard/stat-card";

export default async function Dashboard() {
  const session = await auth();
  if (!session) redirect("/login");

  // Busca dados existentes (Listas e Totais)
  const user = session.user;
  const isGVP = user?.role === "GVP";

  // --- BUSCA DE DADOS (PARALELA PARA PERFORMANCE) ---
  // Promise.all faz todas as buscas ao mesmo tempo, deixando o carregamento mais rápido
  const [
    totalDoctors,
    cooperatingCount,
    consultantCount,
    specialtiesGroup,
    citiesGroup,
    lastCooperating,
    lastConsultant,
    memberStats,
  ] = await Promise.all([
    // Contagens Totais
    prisma.doctor.count(),
    prisma.doctor.count({ where: { type: "COOPERATING" } }),
    prisma.doctor.count({ where: { type: "CONSULTANT" } }),

    // Agrupamento para Gráficos
    prisma.doctor.groupBy({
      by: ["specialty1"],
      _count: { specialty1: true },
      orderBy: { _count: { specialty1: "desc" } },
      take: 5,
    }),
    prisma.doctor.groupBy({
      by: ["city"],
      _count: { city: true },
      orderBy: { _count: { city: "desc" } },
      take: 5,
    }),

    // Listas Recentes
    prisma.doctor.findMany({
      where: { type: "COOPERATING" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.doctor.findMany({
      where: { type: "CONSULTANT" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),

    // Stats de Membros (Para o card de Equipe)
    prisma.user.groupBy({
      by: ["role"],
      _count: { role: true },
    }),
  ]);

  // --- PREPARAÇÃO DOS DADOS ---
  // Formata dados para os gráficos
  const specialtyChartData = specialtiesGroup.map((item) => ({
    name: item.specialty1,
    value: item._count.specialty1,
  }));

  const cityChartData = citiesGroup.map((item) => ({
    name: item.city,
    value: item._count.city,
  }));

  // Calcula stats de membros
  const totalMembros = memberStats.reduce(
    (acc, curr) => acc + curr._count.role,
    0
  );

  const colihCount =
    memberStats.find((m) => m.role === UserRole.COLIH)?._count.role || 0;
  const gvpCount =
    memberStats.find((m) => m.role === UserRole.GVP)?._count.role || 0;

  // --- 3. RENDERIZAÇÃO ---

  //  VISÃO GVP 
  if (isGVP) {
    return (
      <main className="min-h-screen p-8 bg-slate-50 flex flex-col items-center">
        <div className="max-w-4xl w-full">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <h1 className="text-2xl font-bold text-slate-800 mb-4">
              Olá, {user?.name}
            </h1>
            <p className="text-slate-500 mb-8">
              Você está logado como membro GVP. Abaixo está o quadro da equipe.
            </p>
            <Link href="/membros" className="block group">
              <StatCard
                label="Total de Membros"
                value={totalMembros}
                subtext={`${colihCount} COLIH • ${gvpCount} GVP`}
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
              Bem-vindo, {user?.name?.split(" ")[0]}.
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

        {/* Estatísticas (Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/membros">
            <div className="cursor-pointer hover:opacity-95 transition">
              <StatCard
                label="Equipe"
                value={totalMembros}
                subtext={`${colihCount} COLIH / ${gvpCount} GVP`}
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
                  {cooperatingCount}
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
                  {consultantCount}
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

        {/* --- GRÁFICOS --- */}
        <DashboardCharts
          specialtyData={specialtyChartData}
          cityData={cityChartData}
        />

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
              {lastCooperating.map((medico) => (
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
                    href={`/medicos/${medico.id}/editar`}
                    className="text-xs font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1 bg-blue-50 rounded"
                  >
                    Abrir
                  </Link>
                </div>
              ))}
              {lastCooperating.length === 0 && (
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
              {lastConsultant.map((medico) => (
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
                    href={`/medicos/${medico.id}/editar`}
                    className="text-xs font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1 bg-indigo-50 rounded"
                  >
                    Abrir
                  </Link>
                </div>
              ))}
              {lastConsultant.length === 0 && (
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
