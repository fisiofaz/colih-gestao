import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DOCTOR_TYPE_LABELS } from "@/lib/constants";
import { DeleteButton } from "./components/delete-button";
import Search from "./components/search";
import Pagination from "./components/pagination";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DoctorType } from "@prisma/client";
import { PrintButton } from "./components/print-button";

interface PageProps {
  searchParams: Promise<{
    query?: string;
    tipo?: string;
    page?: string;
  }>;
}

export default async function MedicosPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user?.role === "GVP") redirect("/");

  const ITEMS_PER_PAGE = 9;
  const params = await searchParams;
  const query = params.query || "";
  const tipoFiltro = params.tipo as DoctorType | undefined;
  const currentPage = Number(params.page) || 1;
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  const whereCondition = {
    type: tipoFiltro,
    OR: query
      ? [
          { firstName: { contains: query, mode: "insensitive" as const } },
          { lastName: { contains: query, mode: "insensitive" as const } },
          { specialty1: { contains: query, mode: "insensitive" as const } },
        ]
      : undefined,
  };

  const [doctors, totalCount] = await Promise.all([
    prisma.doctor.findMany({
      where: whereCondition,
      orderBy: { firstName: "asc" },
      take: ITEMS_PER_PAGE,
      skip: skip,
    }),
    prisma.doctor.count({
      where: whereCondition,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const pageTitle = tipoFiltro
    ? `Médicos ${DOCTOR_TYPE_LABELS[tipoFiltro]}es`
    : "Todos os Médicos";

  const dataImpressao = new Date().toLocaleDateString("pt-BR");

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <main className="max-w-7xl mx-auto">
        {/* CABEÇALHO DE IMPRESSÃO */}
        <div className="only-print">
          <h1 className="text-2xl font-bold uppercase mb-1">
            Lista de Médicos - COLIH
          </h1>
          <p className="text-sm">Relatório gerado em: {dataImpressao}</p>
          {tipoFiltro && (
            <p className="text-sm font-bold mt-1">
              Filtro: {DOCTOR_TYPE_LABELS[tipoFiltro]}
            </p>
          )}
        </div>

        {/* CABEÇALHO DA TELA */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 no-print">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{pageTitle}</h1>
            <p className="text-slate-500 mt-1">
              Mostrando {doctors.length} de {totalCount} profissionais
            </p>
          </div>
          <div className="flex gap-3">
            {tipoFiltro && (
              <Link
                href="/medicos"
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg shadow-sm"
              >
                Ver Todos
              </Link>
            )}
            <PrintButton />
            <Link
              href="/medicos/novo"
              className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-2 font-medium"
            >
              <span>+</span> Novo Médico
            </Link>
          </div>
        </header>

        <section className="mb-6 max-w-md no-print">
          <Search />
        </section>

        {/* GRID DE CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200 relative group flex flex-col"
            >
              {/* Badge ABSOLUTO (Canto Superior Direito) */}
              <span
                className={`absolute top-4 right-4 text-[10px] font-bold tracking-wider px-2 py-1 rounded-full uppercase z-10
                ${
                  doctor.type === "COOPERATING"
                    ? "bg-blue-50 text-blue-600"
                    : doctor.type === "CONSULTANT"
                    ? "bg-purple-50 text-purple-600"
                    : "bg-slate-100 text-slate-500"
                }
              `}
              >
                {
                  DOCTOR_TYPE_LABELS[
                    doctor.type as keyof typeof DOCTOR_TYPE_LABELS
                  ]
                }
              </span>

              {/* Título e Especialidade */}
              {/* pr-32 garante que o texto não bata no badge */}
              <div className="mb-2 pr-32">
                <h2
                  className="text-xl font-bold text-slate-900 line-clamp-2 min-h-[3.5rem] flex items-center"
                  title={`${doctor.firstName} ${doctor.lastName}`}
                >
                  {(() => {
                    const fullName = `${doctor.firstName} ${doctor.lastName}`;
                    const hasPrefix =
                      fullName.toLowerCase().startsWith("dr.") ||
                      fullName.toLowerCase().startsWith("dra.");
                    const automaticPrefix =
                      doctor.gender === "FEMALE" ? "Dra." : "Dr.";
                    return hasPrefix
                      ? fullName
                      : `${automaticPrefix} ${fullName}`;
                  })()}
                </h2>
                <span className="inline-block text-sm text-slate-500 font-medium -mt-1">
                  {doctor.specialty1}
                </span>
              </div>

              {/* Informações de Contato */}
              <div className="space-y-3 text-sm text-slate-600 border-t border-slate-100 pt-4 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📍</span>
                  <span className="truncate">
                    {doctor.city} - {doctor.state}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-lg">📞</span>
                  <span className="font-medium">
                    {doctor.phoneMobile || "Sem telefone"}
                  </span>
                </div>

                {/* BADGES SUS E CONVÊNIO (Com mais espaço acima: mt-4) */}
                {(doctor.isSus || doctor.hasHealthPlan) && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {doctor.isSus && (
                      <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        🏥 SUS
                      </span>
                    )}
                    {doctor.hasHealthPlan && (
                      <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                        💳 Convênios
                      </span>
                    )}
                  </div>
                )}

                {/* Ícones (Com mais espaço se tiver badges, ou padrão se não tiver) */}
                <div
                  className={`flex gap-3 text-xl text-slate-400 grayscale opacity-50 ${
                    doctor.isSus || doctor.hasHealthPlan ? "mt-3" : "mt-4"
                  }`}
                >
                  <span
                    title="Adulto"
                    className={
                      doctor.acceptsAdult ? "grayscale-0 opacity-100" : ""
                    }
                  >
                    👨
                  </span>
                  <span
                    title="Criança"
                    className={
                      doctor.acceptsChild ? "grayscale-0 opacity-100" : ""
                    }
                  >
                    🧒
                  </span>
                  <span
                    title="Recém-nascido"
                    className={
                      doctor.acceptsNewborn ? "grayscale-0 opacity-100" : ""
                    }
                  >
                    👶
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-1 text-[10px] text-slate-400 font-medium no-print">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-3 h-3"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    Atualizado em:{" "}
                    {new Date(doctor.updatedAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              {/* Botões */}
              <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity no-print">
                <DeleteButton id={doctor.id} name={doctor.firstName} />
                <Link
                  href={`/medicos/${doctor.id}/editar`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 hover:underline"
                >
                  ✏️ Editar
                </Link>
              </div>
            </div>
          ))}

          {/* Estado Vazio */}
          {doctors.length === 0 && (
            <div className="col-span-full bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center no-print">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-slate-900">
                Nenhum médico encontrado
              </h3>
              <p className="text-slate-500 mt-1">
                Tente ajustar sua busca ou o filtro selecionado.
              </p>
              {tipoFiltro && (
                <Link
                  href="/medicos"
                  className="text-blue-600 hover:underline mt-2 block"
                >
                  Limpar filtros
                </Link>
              )}
            </div>
          )}
        </section>

        <div className="mt-8 no-print">
          <Pagination totalPages={totalPages} />
        </div>
      </main>
    </div>
  );
}
