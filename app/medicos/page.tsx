import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DOCTOR_TYPE_LABELS } from "@/lib/constants"; // Certifique-se de ter criado este arquivo
import { DeleteButton } from "./components/delete-button"; // Ajuste o caminho se necessário
import Search from "./components/search"; // Ajuste o caminho se necessário
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DoctorType } from "@prisma/client";

// Definimos o tipo das props da página
interface PageProps {
  searchParams: Promise<{
    query?: string;
    tipo?: string; // Adicionamos o suporte ao filtro de tipo
  }>;
}

export default async function MedicosPage({ searchParams }: PageProps) {
  // 1. SEGURANÇA: Verificar Login e Permissão
  const session = await auth();

  if (!session) redirect("/login");

  // Se for GVT, expulsa para a Home (Segurança de Rota)
  if (session.user?.role === "GVT") {
    redirect("/");
  }

  // 2. PARÂMETROS DA URL
  // Lemos a busca e o tipo (aguardando a Promise do Next.js 15)
  const params = await searchParams;
  const query = params.query || "";
  const tipoFiltro = params.tipo as DoctorType | undefined; // 'COOPERATING' | 'CONSULTANT'

  // 3. BUSCA NO BANCO
  const doctors = await prisma.doctor.findMany({
    where: {
      // Se tiver filtro de tipo na URL, aplica. Se não, traz todos.
      type: tipoFiltro,

      // Busca textual (Nome, Sobrenome, Especialidade)
      OR: query
        ? [
            { firstName: { contains: query, mode: "insensitive" } },
            { lastName: { contains: query, mode: "insensitive" } },
            { specialty1: { contains: query, mode: "insensitive" } },
          ]
        : undefined, // Se não tiver busca textual, ignora o OR
    },
    orderBy: {
      firstName: "asc",
    },
  });

  // Título dinâmico da página
  const pageTitle = tipoFiltro
    ? `Médicos ${DOCTOR_TYPE_LABELS[tipoFiltro]}es` // "Médicos Cooperadores"
    : "Todos os Médicos";

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <main className="max-w-7xl mx-auto">
        {/* Cabeçalho da Página */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{pageTitle}</h1>
            <p className="text-slate-500 mt-1">
              {doctors.length} profissionais encontrados
            </p>
          </div>
          <div className="flex gap-3">
            {/* Se estiver filtrado, botão para limpar filtro */}
            {tipoFiltro && (
              <Link
                href="/medicos"
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg shadow-sm"
              >
                Ver Todos
              </Link>
            )}
            <Link
              href="/medicos/novo"
              className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-2 font-medium"
            >
              <span>+</span> Novo Médico
            </Link>
          </div>
        </header>

        {/* Componente de Busca */}
        <section className="mb-6 max-w-md">
          <Search />
        </section>

        {/* GRID DE CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200 relative group"
            >
              {/* Etiqueta de Tipo (Canto superior direito) */}
              <span
                className={`absolute top-4 right-4 text-[10px] font-bold tracking-wider px-2 py-1 rounded-full uppercase
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

              {/* Topo do Card: Nome e Especialidade */}
              <div className="mb-4 pr-16">
                {" "}
                {/* Padding right para não bater na etiqueta */}
                <h2 className="text-xl font-bold text-slate-900 truncate">
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
                <span className="inline-block mt-1 text-sm text-slate-500 font-medium">
                  {doctor.specialty1}
                </span>
              </div>

              {/* Informações de Contato */}
              <div className="space-y-2.5 text-sm text-slate-600 border-t border-slate-100 pt-4">
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

                {/* Ícones de Atendimento */}
                <div className="flex gap-3 mt-2 pt-2 text-xl text-slate-400 grayscale opacity-50">
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
              </div>

              {/* Rodapé do Card */}
              <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                {/* Botão de Excluir */}
                <DeleteButton id={doctor.id} name={doctor.firstName} />

                {/* Link de Editar */}
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
            <div className="col-span-full bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
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
      </main>
    </div>
  );
}
