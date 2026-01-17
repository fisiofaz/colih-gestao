import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserRole } from "@prisma/client";

export default async function MonitoringPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const session = await auth();

  // Apenas Admin pode ver essa tela
  if (session?.user?.role !== "ADMIN") {
    redirect("/relatorios");
  }

  const params = await searchParams;
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonthStr =
    params.month ||
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

  // 1. Busca todos os membros ativos (COLIH e ADMIN)
  const allMembers = await prisma.user.findMany({
    where: {
      role: { in: [UserRole.COLIH, UserRole.ADMIN] },
    },
    select: {
      id: true,
      name: true,
      whatsapp: true,
      activityReports: {
        where: { month: currentMonthStr },
        select: { id: true, createdAt: true },
      },
    },
    orderBy: { name: "asc" },
  });

  // 2. Separa quem entregou de quem está pendente
  const statusList = allMembers.map((member) => {
    const hasReport = member.activityReports.length > 0;
    return {
      ...member,
      status: hasReport ? "DONE" : "PENDING",
      deliveredAt: hasReport ? member.activityReports[0].createdAt : null,
    };
  });

  const pendingCount = statusList.filter((m) => m.status === "PENDING").length;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              🕵️‍♂️ Monitoramento
            </h1>
            <p className="text-slate-500">
              Controle de entregas de {currentMonthStr}
            </p>
          </div>
          <Link
            href="/relatorios"
            className="text-blue-600 hover:underline text-sm"
          >
            ← Voltar para Relatórios
          </Link>
        </div>

        {/* RESUMO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
            <p className="text-sm text-slate-500">Total de Membros</p>
            <p className="text-2xl font-bold">{allMembers.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
            <p className="text-sm text-slate-500">Entregues</p>
            <p className="text-2xl font-bold">
              {allMembers.length - pendingCount}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
            <p className="text-sm text-slate-500">Pendentes</p>
            <p className="text-2xl font-bold text-red-600">{pendingCount}</p>
          </div>
        </div>

        {/* LISTA DE MEMBROS */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 text-slate-600 border-b">
              <tr>
                <th className="p-4">Membro</th>
                <th className="p-4">Status</th>
                <th className="p-4">Whatsapp</th>
                <th className="p-4">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {statusList.map((member) => {
                // LÓGICA DA MENSAGEM AUTOMÁTICA
                const firstName = member.name?.split(" ")[0] || "Irmão";

                // Mensagem muda se passou do dia 10
                let zapMessage = "";
                if (currentDay <= 10) {
                  zapMessage = `Olá ${firstName}, tudo bem? Lembrete amigável: Não esqueça de preencher o relatório da COLIH de ${currentMonthStr} até o dia 10. Obrigado!`;
                } else {
                  zapMessage = `Olá ${firstName}. O prazo do dia 10 já passou. Por favor, poderia preencher o relatório da COLIH de ${currentMonthStr} hoje? Precisamos fechar os dados.`;
                }

                const zapLink = member.whatsapp
                  ? `https://wa.me/55${member.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(zapMessage)}`
                  : null;

                return (
                  <tr key={member.id} className="hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-800">
                      {member.name}
                      {member.status === "DONE" && (
                        <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                          Entregue em {member.deliveredAt?.toLocaleDateString()}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {member.status === "PENDING" ? (
                        <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">
                          ⏳ Pendente
                        </span>
                      ) : (
                        <span className="text-green-600">✅ OK</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-500">
                      {member.whatsapp || "Sem nº cadastrado"}
                    </td>
                    <td className="p-4">
                      {member.status === "PENDING" && member.whatsapp && (
                        <a
                          href={zapLink!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-md transition-colors text-xs font-bold"
                        >
                          📲 Cobrar no Zap
                        </a>
                      )}
                      {member.status === "PENDING" && !member.whatsapp && (
                        <span className="text-xs text-slate-400 italic">
                          Cadastre o cel no perfil
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
