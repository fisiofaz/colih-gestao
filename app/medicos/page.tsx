import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Search from "./components/search";
import Pagination from "./components/pagination";
import Filters from "./components/filters"; // <--- Importamos o novo componente
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

  // Apenas GVP não vê a lista? Ou todos podem ver?
  // Mantendo a lógica anterior: se tiver sessão, vê.
  if (!session) {
    redirect("/login");
  }

  const role = session.user.role;
  const isGVP = role === "GVP";

  // 1. Recebe os parâmetros da URL
  const params = await searchParams;
  const query = params.query || "";
  const currentPage = Number(params.page) || 1;
  const cityFilter = params.city || "";
  const specialtyFilter = params.specialty || "";

  const ITEMS_PER_PAGE = 10;
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  // 2. Busca todas as Cidades e Especialidades únicas para montar os filtros
  // O "distinct" garante que não venha repetido
  const [citiesRaw, specialtiesRaw] = await Promise.all([
    prisma.doctor.findMany({
      select: { city: true },
      where: { city: { not: "" } }, // Ignora vazios
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

  // 3. Monta o filtro principal do banco de dados
  const whereCondition = {
    // Se tiver filtro de cidade, aplica. Senão, ignora.
    ...(cityFilter ? { city: cityFilter } : {}),

    // Se tiver filtro de especialidade, aplica.
    ...(specialtyFilter ? { specialty1: specialtyFilter } : {}),

    // Busca por texto (Nome ou Email ou Telefone)
    OR: query
      ? [
          { firstName: { contains: query, mode: "insensitive" as const } },
          { lastName: { contains: query, mode: "insensitive" as const } },
          { specialty1: { contains: query, mode: "insensitive" as const } },
          { city: { contains: query, mode: "insensitive" as const } },
        ]
      : undefined,
  };

  // 4. Busca os médicos filtrados
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
          {/* Barra de Busca de Texto */}
          <div className="flex-1">
            <Search placeholder="Buscar por nome, CRM..." />
          </div>

          {/* Novos Filtros Dropdown */}
          <Filters cities={uniqueCities} specialties={uniqueSpecialties} />
        </section>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Especialidade</th>
                <th className="px-6 py-4">Cidade</th>
                <th className="px-6 py-4">Telefone</th>
                {!isGVP && <th className="px-6 py-4 text-right">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {doctors.map((doctor) => (
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
                  <td className="px-6 py-4 font-mono text-xs">
                    {doctor.phoneMobile}
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
              ))}

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
