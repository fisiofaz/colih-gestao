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
import SpecialtySidebar from "../components/doctors/specialty-sidebar";
import FAB from "@/app/components/ui/fab";

interface PageProps {
  searchParams: Promise<{
    query?: string;
    tipo?: string;
    page?: string;
    especialidade?: string;
  }>;
}

export default async function MedicosPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user?.role === "GVP") redirect("/");

  const ITEMS_PER_PAGE = 10; 
  const params = await searchParams;

  const query = params.query || "";
  const tipoFiltro = params.tipo as DoctorType | undefined;
  const especialidadeFiltro = params.especialidade;

  const currentPage = Number(params.page) || 1;
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  // BUSCAR TODAS AS ESPECIALIDADES
  const specialtiesGrouped = await prisma.doctor.groupBy({
    by: ["specialty1"],
    _count: { specialty1: true },
    orderBy: { specialty1: "asc" },
    where: { type: tipoFiltro },
  });

  const allSpecialties = specialtiesGrouped
    .map((item) => ({
      name: item.specialty1,
      count: item._count.specialty1,
    }))
    .filter((s) => s.name);

  // FILTROS
  const whereCondition = {
    type: tipoFiltro,
    ...(especialidadeFiltro && {
      specialty1: { equals: especialidadeFiltro, mode: "insensitive" as const },
    }),
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
    prisma.doctor.count({ where: whereCondition }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Título Dinâmico
  let pageTitle = "Todos os Médicos";
  if (especialidadeFiltro) pageTitle = `${especialidadeFiltro}`;
  if (tipoFiltro) pageTitle += ` (${DOCTOR_TYPE_LABELS[tipoFiltro]})`;

  const dataImpressao = new Date().toLocaleDateString("pt-BR");

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <main className="max-w-7xl mx-auto">
        {/* CABEÇALHO DE IMPRESSÃO */}
        <div className="hidden print:block mb-8">
          <h1 className="text-2xl font-bold uppercase mb-1">
            Lista de Médicos - COLIH
          </h1>
          <p className="text-sm">Relatório gerado em: {dataImpressao}</p>
          <p className="text-sm font-bold mt-1">
            {especialidadeFiltro
              ? `Especialidade: ${especialidadeFiltro}`
              : "Geral"}
          </p>
        </div>

        {/* CABEÇALHO DA TELA */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-8 gap-4 no-print">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 capitalize">
              {pageTitle}
            </h1>
            <p className="text-slate-500 mt-1 text-sm md:text-base">
              Mostrando {doctors.length} de {totalCount} profissionais
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {(tipoFiltro || especialidadeFiltro) && (
              <Link
                href="/medicos"
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg shadow-sm"
              >
                Limpar Filtros
              </Link>
            )}
            <div className="hidden md:block">
              <PrintButton />
            </div>
            <Link
              href="/medicos/novo"   
              className="flex w-full md:w-auto justify-center bg-blue-700 hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg shadow-sm transition-all items-center gap-2 font-medium"
            >
              <span>+</span> Novo Médico
            </Link>
          </div>
        </header>

        {/* LAYOUT GRID: SIDEBAR + CONTEÚDO */}
        <div className="flex flex-col md:flex-row items-start">
          {/* SIDEBAR */}
          <div className="no-print w-full md:w-auto">
            <SpecialtySidebar specialties={allSpecialties} />
          </div>

          {/* CONTEÚDO PRINCIPAL */}
          <div className="flex-1 w-full">
            <section className="mb-6 max-w-md no-print">
              <Search />
            </section>

            {/* --------------------------------------------------------- */}
            {/* 🖥️ VERSÃO DESKTOP (TABELA) - Escondida no Mobile */}
            {/* --------------------------------------------------------- */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:block print:shadow-none print:border-0">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 print:bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Médico
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Especialidade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Contato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Atendimento
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider no-print">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {doctors.map((doctor) => (
                    <tr
                      key={doctor.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold no-print">
                            {doctor.firstName[0]}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">
                              {doctor.gender === "FEMALE" ? "Dra." : "Dr."}{" "}
                              {doctor.firstName} {doctor.lastName}
                            </div>
                            <div className="text-xs text-slate-500">
                              {
                                DOCTOR_TYPE_LABELS[
                                  doctor.type as keyof typeof DOCTOR_TYPE_LABELS
                                ]
                              }
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">
                          {doctor.specialty1}
                        </div>
                        {doctor.specialty2 && (
                          <div className="text-xs text-slate-500">
                            {doctor.specialty2}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">
                          {doctor.phoneMobile}
                        </div>
                        <div className="text-xs text-slate-500">
                          {doctor.city}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-1 mb-1">
                          {doctor.isSus && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">
                              SUS
                            </span>
                          )}
                          {doctor.hasHealthPlan && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                              Conv.
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2 text-base text-slate-400 grayscale opacity-50">
                          <span
                            title="Adulto"
                            className={
                              doctor.acceptsAdult
                                ? "grayscale-0 opacity-100"
                                : ""
                            }
                          >
                            👨
                          </span>
                          <span
                            title="Criança"
                            className={
                              doctor.acceptsChild
                                ? "grayscale-0 opacity-100"
                                : ""
                            }
                          >
                            🧒
                          </span>
                          <span
                            title="Bebê"
                            className={
                              doctor.acceptsNewborn
                                ? "grayscale-0 opacity-100"
                                : ""
                            }
                          >
                            👶
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium no-print">
                        <div className="flex justify-end items-center gap-3">
                          <Link
                            href={`/medicos/${doctor.id}/editar`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Editar
                          </Link>
                          <DeleteButton
                            id={doctor.id}
                            name={doctor.firstName}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* --------------------------------------------------------- */}
            {/* 📱 VERSÃO MOBILE (CARDS) - Escondida no Desktop */}
            {/* --------------------------------------------------------- */}
            <div className="md:hidden space-y-4 print:hidden">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="bg-white p-5 rounded-xl shadow-sm border border-slate-200"
                >
                  {/* Cabeçalho do Card */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                        {doctor.firstName[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg leading-tight">
                          {doctor.firstName} {doctor.lastName}
                        </h3>
                        <p className="text-sm text-blue-600 font-medium">
                          {doctor.specialty1}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/medicos/${doctor.id}/editar`}
                      className="p-2 -mr-2 text-slate-400 hover:text-blue-600"
                    >
                      ✏️
                    </Link>
                  </div>

                  {/* Informações */}
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm mb-5 border-t border-b border-slate-50 py-3">
                    <div>
                      <span className="block text-xs font-semibold text-slate-400 uppercase">
                        Cidade
                      </span>
                      <span className="text-slate-700">{doctor.city}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-slate-400 uppercase">
                        Atendimento
                      </span>
                      <div className="flex gap-1 mt-0.5">
                        {doctor.isSus && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">
                            SUS
                          </span>
                        )}
                        {doctor.hasHealthPlan && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                            Conv.
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400 uppercase">
                        Público:
                      </span>
                      <div className="flex gap-2 text-base text-slate-400 grayscale opacity-50">
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
                          title="Bebê"
                          className={
                            doctor.acceptsNewborn
                              ? "grayscale-0 opacity-100"
                              : ""
                          }
                        >
                          👶
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botões de Ação Mobile */}
                  <div className="flex gap-3">
                    {doctor.phoneMobile ? (
                      <>
                        <a
                          href={`tel:${doctor.phoneMobile.replace(/\D/g, "")}`}
                          className="flex-1 bg-white border border-slate-200 text-slate-700 py-3 rounded-lg text-center text-sm font-semibold flex items-center justify-center gap-2 active:bg-slate-50 shadow-sm"
                        >
                          📞 Ligar
                        </a>
                        <a
                          href={`https://wa.me/55${doctor.phoneMobile.replace(
                            /\D/g,
                            ""
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 bg-green-600 text-white py-3 rounded-lg text-center text-sm font-semibold flex items-center justify-center gap-2 active:bg-green-700 shadow-sm"
                        >
                          💬 WhatsApp
                        </a>
                      </>
                    ) : (
                      <span className="w-full text-center text-slate-400 text-sm py-2 bg-slate-50 rounded-lg">
                        Sem telefone cadastrado
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Mensagem Vazia */}
            {doctors.length === 0 && (
              <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center no-print">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-slate-900">
                  Nenhum médico encontrado
                </h3>
                <Link
                  href="/medicos"
                  className="text-blue-600 hover:underline mt-2 block"
                >
                  Limpar filtros
                </Link>
              </div>
            )}

            <div className="mt-8 no-print">
              <Pagination totalPages={totalPages} />
            </div>
          </div>
        </div>

        {/* FAB (Floating Action Button) - Só aparece no mobile */}
        <FAB href="/medicos/novo" label="Adicionar Médico" />
      </main>
    </div>
  );
}
