import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AuditPage() {
  const session = await auth();

  // Segurança: Apenas COLIH ou ADMIN podem ver logs. GVP não.
  if (!session || session.user?.role === "GVP") {
    redirect("/");
  }

  // Busca os últimos 50 logs
  const logs = await prisma.auditLog.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true, role: true, email: true },
      },
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">
          🔍 Logs de Auditoria
        </h1>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Data/Hora</th>
                <th className="px-6 py-4">Usuário</th>
                <th className="px-6 py-4">Ação</th>
                <th className="px-6 py-4">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(log.createdAt).toLocaleString("pt-BR")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">
                      {log.user.name}
                    </div>
                    <div className="text-xs text-slate-400">
                      {log.user.role}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold
                      ${
                        log.action === "CREATE"
                          ? "bg-green-100 text-green-700"
                          : log.action === "DELETE"
                          ? "bg-red-100 text-red-700"
                          : log.action === "UPDATE"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }
                    `}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              Nenhum registro encontrado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
