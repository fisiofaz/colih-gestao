import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Dashboard() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Busca dados em paralelo para ser rápido
  const [
    totalDoctors,
    cooperatingDoctors,
    susDoctors,
    unimedDoctors,
    latestDoctors,
  ] = await Promise.all([
    prisma.doctor.count(),
    prisma.doctor.count({ where: { type: "COOPERATING" } }),
    prisma.doctor.count({ where: { isSus: true } }),
    prisma.doctor.count({ where: { hasHealthPlan: true } }),
    prisma.doctor.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <main className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
              Olá, {session.user?.name?.split(" ")[0]}! 👋
            </h1>
            <p className="text-slate-500 mt-1">
              Aqui está o resumo da sua gestão hoje.
            </p>
          </div>
          {/* BOTÃO PARA A NOVA PÁGINA DE ESTATÍSTICAS */}
          <Link
            href="/estatisticas"
            className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 border border-blue-200 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors shadow-sm"
          >
            📊 Ver Gráficos Detalhados
          </Link>
        </div>

        {/* --- GRID DE CARDS (Estatísticas) --- */}
        {/* Celular: 1 coluna | Tablet: 2 colunas | PC: 4 colunas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <DashboardCard
            title="Total de Médicos"
            value={totalDoctors}
            icon="👨‍⚕️"
            color="bg-blue-500"
            href="/medicos"
          />

          <DashboardCard
            title="Cooperadores"
            value={cooperatingDoctors}
            icon="🤝"
            color="bg-indigo-500"
            href="/medicos?tipo=COOPERATING"
          />

          <DashboardCard
            title="Atendem SUS"
            value={susDoctors}
            icon="🏥"
            color="bg-green-500"
            href="/medicos?isSus=true"
          />

          <DashboardCard
            title="Planos/Convênio"
            value={unimedDoctors}
            icon="💳"
            color="bg-purple-500"
            href="/medicos?hasHealthPlan=true"
          />
        </div>

        {/* --- ÚLTIMOS CADASTRADOS (Tabela simplificada) --- */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h2 className="font-bold text-slate-800">Últimos Cadastros</h2>
            <Link
              href="/medicos"
              className="text-sm text-blue-600 hover:underline"
            >
              Ver todos
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {latestDoctors.map((doc) => (
              <Link
                key={doc.id}
                href={`/medicos/${doc.id}/editar`}
                className="block p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                      {doc.firstName[0]}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm md:text-base">
                        {doc.firstName} {doc.lastName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {doc.specialty1} • {doc.city}
                      </p>
                    </div>
                  </div>
                  <span className="text-slate-400 text-xl">›</span>
                </div>
              </Link>
            ))}

            {latestDoctors.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-sm">
                Nenhum médico cadastrado ainda.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Subcomponente para os Cards (Fica limpo no código principal)
function DashboardCard({
  title,
  value,
  icon,
  color,
  href,
}: {
  title: string;
  value: number;
  icon: string;
  color: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow group"
    >
      <div
        className={`${color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform`}
      >
        {icon}
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </Link>
  );
}
