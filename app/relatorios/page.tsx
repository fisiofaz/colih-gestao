import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { submitActivityReport } from "@/app/actions";
import { revalidatePath } from "next/cache";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/");

  const isAdmin = session.user.role === "ADMIN";
  const params = await searchParams;

  // Define o mês padrão como o atual (ex: "2023-12")
  const today = new Date();
  const currentMonth =
    params.month ||
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

  // Busca o relatório do próprio usuário para preencher o form
  const myReport = await prisma.activityReport.findUnique({
    where: {
      userId_month: {
        userId: session.user.id,
        month: currentMonth,
      },
    },
  });

  // SE FOR ADMIN: Busca todos os relatórios do mês para o Resumão
  const allReports = isAdmin
    ? await prisma.activityReport.findMany({
        where: { month: currentMonth },
        include: { user: { select: { name: true } } },
        orderBy: { user: { name: "asc" } },
      })
    : [];

  // Cálculos do Admin
  const totalVisits = allReports.reduce((acc, curr) => acc + curr.visits, 0);
  const totalSolo = allReports.reduce((acc, curr) => acc + curr.soloCases, 0);
  const totalSharedRaw = allReports.reduce(
    (acc, curr) => acc + curr.sharedCases,
    0,
  );

  // A LÓGICA MÁGICA: Soma os casos em dupla e divide por 2
  // (Assumindo que ambos os irmãos reportaram. Arredondamos pra cima caso seja ímpar)
  const totalSharedAdjusted = Math.ceil(totalSharedRaw / 2);

  const totalCasesFinal = totalSolo + totalSharedAdjusted;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* CABEÇALHO E SELETOR DE MÊS */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold text-slate-800">
            📋 Relatório Mensal
          </h1>
          <form className="flex items-center gap-2">
            <label
              htmlFor="month-selector"
              className="text-sm font-medium text-slate-600"
            >
              Mês referência:
            </label>
            <input
              id="month-selector"
              type="month"
              name="month"
              defaultValue={currentMonth}
              className="border border-slate-300 rounded-md p-2 text-sm"
              onChange={(e) => {
                window.location.href = `/relatorios?month=${e.target.value}`;
              }}
            />
          </form>
        </div>

        {/* ÁREA DO ADMIN: RESUMO GERAL */}
        {isAdmin && (
          <div className="bg-white border-l-4 border-blue-600 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              📊 Consolidação do Administrador
              <span className="text-sm font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded">
                Visível apenas para você
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-500">Membros que reportaram</p>
                <p className="text-2xl font-bold text-slate-800">
                  {allReports.length}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-700">
                  Total de Visitas Preventivas
                </p>
                <p className="text-2xl font-bold text-green-800">
                  {totalVisits}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700">
                  Total de Casos (Ajustado)
                </p>
                <p className="text-3xl font-bold text-blue-800">
                  {totalCasesFinal}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  ({totalSolo} sozinhos + {totalSharedAdjusted} em dupla)
                </p>
              </div>
            </div>

            {/* Tabela Detalhada */}
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="p-3">Membro</th>
                    <th className="p-3">Visitas</th>
                    <th className="p-3">Sozinho</th>
                    <th className="p-3">Em Dupla</th>
                    <th className="p-3">Parceiro(s) Citado(s)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {allReports.map((rep) => (
                    <tr key={rep.id} className="hover:bg-slate-50">
                      <td className="p-3 font-medium">{rep.user.name}</td>
                      <td className="p-3">{rep.visits}</td>
                      <td className="p-3">{rep.soloCases}</td>
                      <td className="p-3">{rep.sharedCases}</td>
                      <td className="p-3 text-slate-500 italic">
                        {rep.partners || "-"}
                      </td>
                    </tr>
                  ))}
                  {allReports.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-4 text-center text-slate-400"
                      >
                        Nenhum relatório enviado neste mês ainda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FORMULÁRIO INDIVIDUAL (Para todos) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-1">
            Seu Relatório de Atividade
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Por favor, preencha seus dados referentes a{" "}
            <strong>{currentMonth}</strong>.
          </p>

          <form
            action={async (formData) => {
              "use server";
              await submitActivityReport(formData);
            }}
            className="space-y-6"
          >
            <input type="hidden" name="month" value={currentMonth} />

            {/* Pergunta 1: Casos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="soloCases" 
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  1. Quantos casos você cuidou{" "}
                  <span className="text-blue-600">SOZINHO</span>?
                </label>
                <input
                  id="soloCases" 
                  type="number"
                  name="soloCases"
                  min="0"
                  defaultValue={myReport?.soloCases || 0}
                  className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                />
              </div>

              <div>
                <label
                  htmlFor="sharedCases" 
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  2. Quantos casos você cuidou{" "}
                  <span className="text-amber-600">EM DUPLA</span>?
                </label>
                <input
                  id="sharedCases" 
                  type="number"
                  name="sharedCases"
                  min="0"
                  defaultValue={myReport?.sharedCases || 0}
                  className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Coloque o número total. O sistema fará o ajuste para não
                  contar duplicado.
                </p>
              </div>
            </div>

            {/* Pergunta 2: Parceiros */}
            <div>
              <label
                htmlFor="partners" 
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Com qual(is) membro(s) você trabalhou nos casos em dupla?
              </label>
              <input
                id="partners" 
                type="text"
                name="partners"
                placeholder="Ex: Irmão João da Silva..."
                defaultValue={myReport?.partners || ""}
                className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
              />
            </div>

            <hr className="border-slate-100" />

            {/* Pergunta 3: Visitas */}
            <div>
              <label
                htmlFor="visits"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                3. Quantas Visitas Preventivas você fez?
              </label>
              <input
                id="visits"
                type="number"
                name="visits"
                min="0"
                defaultValue={myReport?.visits || 0}
                className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors shadow-sm"
            >
              💾 Salvar Relatório
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
