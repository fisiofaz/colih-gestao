import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardCharts from "../components/dashboard/charts"; 
import Link from "next/link";

export default async function StatisticsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  // GVP não costuma ver dados estratégicos, mas se quiser liberar, remova esta linha
  if (session.user?.role === "GVP") redirect("/");

  // Busca dados pesados para os gráficos
  const [totalDoctors, cooperatingDoctors, specialtiesGrouped] =
    await Promise.all([
      prisma.doctor.count(),
      prisma.doctor.count({ where: { type: "COOPERATING" } }),
      prisma.doctor.groupBy({
        by: ["specialty1"],
        _count: { specialty1: true },
        orderBy: { _count: { specialty1: "desc" } },
        take: 10, // Top 10 especialidades
      }),
    ]);

  // Prepara dados para o gráfico de barras
  const chartSpecialties = specialtiesGrouped.map((item) => ({
    name: item.specialty1,
    value: item._count.specialty1,
  }));

  // Prepara dados para o gráfico de pizza
  const chartTypes = [
    { name: "Cooperadores", value: cooperatingDoctors },
    { name: "Consultores", value: totalDoctors - cooperatingDoctors },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <main className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100"
          >
            ← Voltar
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
              Estatísticas e Relatórios
            </h1>
            <p className="text-slate-500">
              Análise detalhada da base de dados.
            </p>
          </div>
        </div>

        {/* Componente de Gráficos (Recharts) */}
        <DashboardCharts
          specialtiesData={chartSpecialties}
          typeData={chartTypes}
        />

        {/* Você pode adicionar mais análises aqui no futuro */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mt-6">
          <h3 className="font-bold text-slate-800 mb-2">Resumo Geral</h3>
          <p className="text-slate-600">
            Atualmente a base conta com <strong>{totalDoctors} médicos</strong>{" "}
            cadastrados, sendo que{" "}
            <strong>
              {((cooperatingDoctors / totalDoctors) * 100).toFixed(1)}%
            </strong>{" "}
            são Cooperadores.
          </p>
        </div>
      </main>
    </div>
  );
}
