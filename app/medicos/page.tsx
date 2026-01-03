import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Search from "./components/search";
import Pagination from "./components/pagination";
import Filters from "./components/filters";
import { DeleteButton } from "@/app/medicos/components/delete-button";

interface PageProps {
  searchParams: Promise<{
    query?: string;
    page?: string;
    city?: string;
    specialty?: string;
  }>;
}

export default async function MedicosPage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const role = session.user.role;
  const isGVP = role === "GVP";

  const params = await searchParams;
  const query = params.query || "";
  const currentPage = Number(params.page) || 1;
  const cityFilter = params.city || "";
  const specialtyFilter = params.specialty || "";

  const ITEMS_PER_PAGE = 10;
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  const [citiesRaw, specialtiesRaw] = await Promise.all([
    prisma.doctor.findMany({
      select: { city: true },
      where: { city: { not: "" } },
      distinct: ["city"],
      orderBy: { city: "asc" },
    }),
    prisma.doctor.findMany({
      select: { specialty1: true },
      where: { specialty1: { not: "" } },
      distinct: ["specialty1"],
      orderBy: { specialty1: "asc" },
    }),
  ]);

  const uniqueCities = citiesRaw.map((c) => c.city);
  const uniqueSpecialties = specialtiesRaw.map((s) => s.specialty1);

  const whereCondition = {
    ...(cityFilter ? { city: cityFilter } : {}),
    ...(specialtyFilter ? { specialty1: specialtyFilter } : {}),
    OR: query
      ? [
          { firstName: { contains: query, mode: "insensitive" as const } },
          { lastName: { contains: query, mode: "insensitive" as const } },
          { specialty1: { contains: query, mode: "insensitive" as const } },
          { city: { contains: query, mode: "insensitive" as const } },
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

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <main className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Gerenciar Médicos
            </h1>
            <p className="text-slate-500 mt-1">
              {totalCount} médicos encontrados
            </p>
          </div>
          {!isGVP && (
            <Link
              href="/medicos/novo"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-2 font-medium"
            >
              <span>+</span> Novo Médico
            </Link>
          )}
        </header>

        <section className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
          <div className="flex-1">
            <Search placeholder="Buscar por nome, CRM..." />
          </div>
          <Filters cities={uniqueCities} specialties={uniqueSpecialties} />
        </section>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Especialidade</th>
                <th className="px-6 py-4">Cidade</th>
                <th className="px-6 py-4">Contato (WhatsApp)</th>
                {!isGVP && <th className="px-6 py-4 text-right">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {doctors.map((doctor) => {
                // LÓGICA DO WHATSAPP:
                // 1. Remove tudo que não for número
                const rawPhone = doctor.phoneMobile?.replace(/\D/g, "") || "";
                // 2. Adiciona o código do Brasil (55) se tiver número
                const whatsappUrl = rawPhone
                  ? `https://wa.me/55${rawPhone}?text=Olá Dr(a). ${doctor.firstName}, sou da COLIH.`
                  : null;

                return (
                  <tr
                    key={doctor.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {doctor.firstName} {doctor.lastName}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {doctor.specialty1}
                      </span>
                    </td>
                    <td className="px-6 py-4">{doctor.city}</td>

                    {/* COLUNA DO WHATSAPP ATUALIZADA */}
                    <td className="px-6 py-4">
                      {whatsappUrl ? (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors border border-emerald-200"
                        >
                          {/* Ícone do WhatsApp (SVG) */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              fillRule="evenodd"
                              d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 5.25V4.5z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {doctor.phoneMobile}
                        </a>
                      ) : (
                        <span className="text-slate-400 text-xs italic">
                          Sem número
                        </span>
                      )}
                    </td>

                    {!isGVP && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-3">
                          <Link
                            href={`/medicos/${doctor.id}/editar`}
                            className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                          >
                            Editar
                          </Link>
                          <DeleteButton
                            id={doctor.id}
                            name={doctor.firstName}
                          />
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}

              {doctors.length === 0 && (
                <tr>
                  <td
                    colSpan={isGVP ? 4 : 5}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    Nenhum médico encontrado com esses filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <Pagination totalPages={totalPages} />
        </div>
      </main>
    </div>
  );
}
