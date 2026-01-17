import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { submitActivityReport } from "@/app/actions";
import MonthSelector from "./month-selector"; 

type MonthlyStats = {
  visits: number;
  solo: number;
  shared: number;
};

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const session = await auth();

  // Segurança reforçada
  if (!session?.user?.id) {
    redirect("/login");
  }

  const isAdmin = session.user.role === "ADMIN";
  const params = await searchParams;

  const today = new Date();
  const currentYear = today.getFullYear();
  const filterMonth =
    params.month ||
    `${currentYear}-${String(today.getMonth() + 1).padStart(2, "0")}`;

  // DADOS DO MÊS SELECIONADO
  const myReportMonth = await prisma.activityReport.findUnique({
    where: { userId_month: { userId: session.user.id, month: filterMonth } },
  });

  const allReportsMonth = isAdmin
    ? await prisma.activityReport.findMany({
        where: { month: filterMonth },
        include: { user: { select: { name: true } } },
        orderBy: { user: { name: "asc" } },
      })
    : [];

  const monthVisits = allReportsMonth.reduce(
    (acc, curr) => acc + curr.visits,
    0,
  );
  const monthSolo = allReportsMonth.reduce(
    (acc, curr) => acc + curr.soloCases,
    0,
  );
  const monthShared = allReportsMonth.reduce(
    (acc, curr) => acc + curr.sharedCases,
    0,
  );
  const monthTotalAdjusted = monthSolo + Math.ceil(monthShared / 2);

  // ESTATÍSTICAS ANUAIS
  const annualWhere = isAdmin
    ? { month: { startsWith: `${currentYear}-` } }
    : { month: { startsWith: `${currentYear}-` }, userId: session.user.id };

  const annualReports = await prisma.activityReport.findMany({
    where: annualWhere,
    orderBy: { month: "asc" },
  });

  // Agrupamento
  const monthlyStats = new Map<string, MonthlyStats>();

  annualReports.forEach((rep) => {
    const m = rep.month;
    if (!monthlyStats.has(m)) {
      monthlyStats.set(m, { visits: 0, solo: 0, shared: 0 });
    }
    const current = monthlyStats.get(m)!;
    current.visits += rep.visits;
    current.solo += rep.soloCases;
    current.shared += rep.sharedCases;
  });

  const sortedStats = Array.from(monthlyStats.entries()).sort();

  const yearTotals = sortedStats.reduce(
    (acc, [_, stats]) => {
      acc.visits += stats.visits;
      acc.solo += stats.solo;
      acc.shared += stats.shared;
      return acc;
    },
    { visits: 0, solo: 0, shared: 0 },
  );

  const historyData = sortedStats.map(([month, stats]) => {
    const adjustedTotal = isAdmin
      ? stats.solo + Math.ceil(stats.shared / 2)
      : stats.solo + stats.shared;

    return { month, ...stats, total: adjustedTotal };
  });

  const yearTotalAdjusted = isAdmin
    ? yearTotals.solo + Math.ceil(yearTotals.shared / 2)
    : yearTotals.solo + yearTotals.shared;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* TOPO */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              📋 Relatórios de Atividade
            </h1>
            <p className="text-slate-500">
              Gestão de Visitas e Casos Hospitalares
            </p>
          </div>

          <MonthSelector currentMonth={filterMonth} />
        </div>

        {/* TABELA ANUAL */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">
              📅 Acumulado Anual ({currentYear})
              {isAdmin ? (
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  Visão Geral COLIH
                </span>
              ) : (
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Meus Números
                </span>
              )}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white text-slate-500 border-b">
                <tr>
                  <th className="px-6 py-3">Mês</th>
                  <th className="px-6 py-3">Visitas Preventivas</th>
                  <th className="px-6 py-3">Casos (Sozinho)</th>
                  <th className="px-6 py-3">Casos (Dupla)</th>
                  <th className="px-6 py-3 font-bold text-slate-900 bg-slate-50">
                    Total de Casos
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historyData.map((row) => (
                  <tr key={row.month} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-medium text-slate-700">
                      {row.month}
                    </td>
                    <td className="px-6 py-3">{row.visits}</td>
                    <td className="px-6 py-3">{row.solo}</td>
                    <td className="px-6 py-3">{row.shared}</td>
                    <td className="px-6 py-3 font-bold text-blue-700 bg-slate-50">
                      {row.total}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-100 font-bold text-slate-800 border-t-2 border-slate-200">
                  <td className="px-6 py-4">TOTAL {currentYear}</td>
                  <td className="px-6 py-4">{yearTotals.visits}</td>
                  <td className="px-6 py-4">{yearTotals.solo}</td>
                  <td className="px-6 py-4">{yearTotals.shared}</td>
                  <td className="px-6 py-4 text-blue-800 text-lg">
                    {yearTotalAdjusted}
                  </td>
                </tr>
              </tbody>
            </table>
            {historyData.length === 0 && (
              <div className="p-8 text-center text-slate-400">
                Nenhum dado registrado neste ano ainda.
              </div>
            )}
          </div>
        </section>

        {/* FORMULÁRIO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-1">
              Preencher Relatório
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Dados referentes a:{" "}
              <strong className="text-blue-600">{filterMonth}</strong>
            </p>

            <form
              action={async (formData) => {
                "use server";
                await submitActivityReport(formData);
              }}
              className="space-y-5"
            >
              <input type="hidden" name="month" value={filterMonth} />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="solo"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Casos Sozinho
                  </label>
                  <input
                    id="solo"
                    type="number"
                    name="soloCases"
                    min="0"
                    defaultValue={myReportMonth?.soloCases || 0}
                    className="w-full border-slate-300 rounded-md shadow-sm p-2 border"
                  />
                </div>
                <div>
                  <label
                    htmlFor="shared"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Casos em Dupla
                  </label>
                  <input
                    id="shared"
                    type="number"
                    name="sharedCases"
                    min="0"
                    defaultValue={myReportMonth?.sharedCases || 0}
                    className="w-full border-slate-300 rounded-md shadow-sm p-2 border"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="part"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Parceiros (nos casos em dupla)
                </label>
                <input
                  id="part"
                  type="text"
                  name="partners"
                  placeholder="Nomes..."
                  defaultValue={myReportMonth?.partners || ""}
                  className="w-full border-slate-300 rounded-md shadow-sm p-2 border"
                />
              </div>

              <div>
                <label
                  htmlFor="visits"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Visitas Preventivas
                </label>
                <input
                  id="visits"
                  type="number"
                  name="visits"
                  min="0"
                  defaultValue={myReportMonth?.visits || 0}
                  className="w-full border-slate-300 rounded-md shadow-sm p-2 border"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg shadow-sm"
              >
                💾 Salvar Mês {filterMonth}
              </button>
            </form>
          </div>

          {isAdmin && (
            <div className="lg:col-span-1 bg-slate-50 rounded-xl border border-slate-200 p-6 h-fit">
              <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                👥 Detalhes de {filterMonth}
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                  Admin
                </span>
              </h3>

              <div className="space-y-4">
                <div className="bg-white p-3 rounded border border-slate-100 shadow-sm">
                  <p className="text-xs text-slate-500 uppercase font-bold">
                    Total Ajustado do Mês
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {monthTotalAdjusted} Casos
                  </p>
                </div>

                <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1">
                  {allReportsMonth.map((rep) => (
                    <div
                      key={rep.id}
                      className="text-sm bg-white p-3 rounded border border-slate-100"
                    >
                      <p className="font-bold text-slate-800">
                        {rep.user.name}
                      </p>
                      <div className="grid grid-cols-3 gap-1 mt-1 text-xs text-slate-500 text-center">
                        <div className="bg-slate-50 p-1 rounded">
                          Vis: {rep.visits}
                        </div>
                        <div className="bg-slate-50 p-1 rounded">
                          Soz: {rep.soloCases}
                        </div>
                        <div className="bg-slate-50 p-1 rounded">
                          Dup: {rep.sharedCases}
                        </div>
                      </div>
                    </div>
                  ))}
                  {allReportsMonth.length === 0 && (
                    <p className="text-sm text-slate-400 italic">
                      Nenhum dado.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
