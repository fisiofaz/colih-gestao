import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DOCTOR_TYPE_LABELS } from "@/lib/constants";

// Esta função roda no SERVIDOR. É seguro buscar dados aqui.
export default async function MedicosPage() {
  // 1. Buscamos os médicos no banco, ordenados por nome
  const doctors = await prisma.doctor.findMany({
    orderBy: { firstName: "asc" },
    include: { createdBy: true }, // Trazemos o nome de quem cadastrou
  });

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho da Página */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Médicos Cooperadores
            </h1>
            <p className="text-slate-500 mt-1">
              Listagem de profissionais cadastrados na COLIH
            </p>
          </div>
          <Link
            href="/medicos/novo"
            className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-2 font-medium"
          >
            <span>+</span> Novo Médico
          </Link>
        </header>

        {/* GRID DE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200"
            >
              {/* Topo do Card: Nome e Especialidade */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {/* LÓGICA INTELIGENTE DE PREFIXO */}
                    {(() => {
                      // 1. Monta o nome completo
                      const fullName = `${doctor.firstName} ${doctor.lastName}`;

                      // 2. Verifica se o usuário já digitou "Dr." ou "Dra." no nome
                      const hasPrefix =
                        fullName.toLowerCase().startsWith("dr.") ||
                        fullName.toLowerCase().startsWith("dra.");

                      // 3. Define o prefixo correto baseado no sexo (se precisar adicionar)
                      const automaticPrefix =
                        doctor.gender === "FEMALE" ? "Dra." : "Dr.";

                      // 4. Retorna o nome ajustado
                      return hasPrefix
                        ? fullName
                        : `${automaticPrefix} ${fullName}`;
                    })()}
                  </h2>
                  <span className="inline-block mt-1 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
                    {doctor.specialty1}
                  </span>
                </div>

                {/* Badge do Tipo (Traduzido) */}
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  {/* TRADUÇÃO AQUI: Usa a chave do banco para pegar o texto em PT */}
                  {
                    DOCTOR_TYPE_LABELS[
                      doctor.type as keyof typeof DOCTOR_TYPE_LABELS
                    ]
                  }
                </span>
              </div>

              {/* Informações de Contato */}
              <div className="space-y-2.5 text-sm text-slate-600 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📍</span>
                  <span>
                    {doctor.city} - {doctor.state}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-lg">📞</span>
                  <span className="font-medium">
                    {doctor.phoneMobile || doctor.phoneHome || "Sem telefone"}
                  </span>
                </div>

                {/* Mostra quais pacientes atende */}
                <div className="flex gap-2 mt-2 pt-2">
                  {doctor.acceptsAdult && <span title="Adulto">👨</span>}
                  {doctor.acceptsChild && <span title="Criança">🧒</span>}
                  {doctor.acceptsNewborn && (
                    <span title="Recém-nascido">👶</span>
                  )}
                </div>
              </div>

              {/* Rodapé do Card */}
              <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center">
                <span className="text-xs text-slate-400">
                  Atualizado recentemente
                </span>

                {/* Link para a página de edição */}
                <Link
                  href={`/medicos/${doctor.id}/editar`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 hover:underline"
                >
                  ✏️ Editar
                </Link>
              </div>
            </div>
          ))}

          {/* Estado Vazio (Caso não tenha rodado o seed) */}
          {doctors.length === 0 && (
            <div className="col-span-full bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
              <div className="text-4xl mb-4">📭</div>
              <h3 className="text-lg font-medium text-slate-900">
                Nenhum médico encontrado
              </h3>
              <p className="text-slate-500 mt-1">
                Parece que o banco de dados está vazio.
              </p>
              <p className="text-sm text-blue-600 mt-2 font-mono bg-blue-50 inline-block px-2 py-1 rounded">
                Dica: Rode `npx prisma db seed` no terminal
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
