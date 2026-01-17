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

  // Bloqueio de Segurança: Só Admin entra aqui
  if (session?.user?.role !== "ADMIN") {
    redirect("/relatorios");
  }

  const params = await searchParams;
  const today = new Date();
  const currentDay = today.getDate(); // Dia de hoje (ex: 17)

  // --- MUDANÇA DA LÓGICA AQUI ---

  // 1. Calcular qual é o "Mês Passado" (o mês que deve ser relatado)
  const lastMonthDate = new Date();
  lastMonthDate.setMonth(today.getMonth() - 1); // Volta 1 mês
  const lastMonthStr = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, "0")}`;

  // 2. Se não tiver filtro na URL, o padrão é cobrar o Mês Passado
  const filterMonth = params.month || lastMonthStr;

  // Busca todos os membros que devem relatar (COLIH e ADMIN)
  const members = await prisma.user.findMany({
    where: {
      role: { in: [UserRole.COLIH, UserRole.ADMIN] },
    },
    select: {
      id: true,
      name: true,
      whatsapp: true,
      activityReports: {
        where: { month: filterMonth }, // Busca relatório do mês filtrado
        select: { id: true, createdAt: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              🕵️‍♂️ Monitoramento de Entregas
            </h1>
            <p className="text-slate-500">
              Mês de referência (Relatório):{" "}
              <strong className="text-blue-600">{filterMonth}</strong>
            </p>
          </div>
          <Link href="/" className="text-blue-600 hover:underline">
            Voltar ao Início
          </Link>
        </div>

        {/* ALERTA DE PRAZO */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                O prazo de entrega para o relatório de{" "}
                <strong>{lastMonthStr}</strong> é dia{" "}
                <strong>
                  10/{String(today.getMonth() + 1).padStart(2, "0")}
                </strong>
                .
                {currentDay > 10 ? (
                  <span className="font-bold text-red-600 ml-1">
                    {" "}
                    (Prazo Encerrado)
                  </span>
                ) : (
                  <span className="font-bold text-green-600 ml-1">
                    {" "}
                    (Dentro do Prazo)
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 text-slate-600 border-b">
              <tr>
                <th className="p-4">Membro</th>
                <th className="p-4">Status</th>
                <th className="p-4">Ação (WhatsApp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((member) => {
                const hasReport = member.activityReports.length > 0;
                const firstName = member.name?.split(" ")[0] || "Irmão";

                // --- LÓGICA DA MENSAGEM CORRIGIDA ---
                let zapMessage = "";

                // Formata a data para ficar bonito na mensagem (ex: 2026-01 vira "01/2026")
                const [ano, mes] = filterMonth.split("-");
                const mesFormatado = `${mes}/${ano}`;

                if (currentDay <= 10) {
                  // Antes do dia 10: Lembrete Amigável
                  zapMessage = `Olá ${firstName}, tudo bem? Lembrete da COLIH: Por favor, preencha seu relatório de *${mesFormatado}* até o dia 10. Obrigado!`;
                } else {
                  // Depois do dia 10: Cobrança
                  zapMessage = `Olá ${firstName}. O prazo do dia 10 já passou. Por favor, precisamos do seu relatório de *${mesFormatado}* urgente para fechar os dados. Pode preencher hoje?`;
                }

                const zapLink = member.whatsapp
                  ? `https://wa.me/55${member.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(zapMessage)}`
                  : null;

                return (
                  <tr key={member.id} className="hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-900">
                      {member.name}
                      <div className="text-xs text-slate-400">
                        {member.whatsapp || "Sem whats cadastrado"}
                      </div>
                    </td>

                    <td className="p-4">
                      {hasReport ? (
                        <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200">
                          ✅ Entregue
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-1 rounded border border-red-200">
                          ⏳ Pendente
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      {!hasReport && zapLink && (
                        <a
                          href={zapLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`px-3 py-2 rounded-lg font-bold text-xs inline-flex items-center gap-2 transition-colors text-white ${
                            currentDay > 10
                              ? "bg-red-500 hover:bg-red-600"
                              : "bg-green-500 hover:bg-green-600"
                          }`}
                        >
                          {currentDay > 10
                            ? "🚨 Cobrar Atraso"
                            : "📲 Enviar Lembrete"}
                        </a>
                      )}
                      {!hasReport && !zapLink && (
                        <span className="text-xs text-slate-400 italic">
                          Cadastre o cel no perfil
                        </span>
                      )}
                      {hasReport && <span className="text-slate-400">-</span>}
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
