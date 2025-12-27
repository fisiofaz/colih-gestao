"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface SpecialtySidebarProps {
  specialties: { name: string; count: number }[];
}

export default function SpecialtySidebar({
  specialties,
}: SpecialtySidebarProps) {
  const searchParams = useSearchParams();
  const currentSpecialty = searchParams.get("especialidade");

  // Função para manter os outros filtros (como tipo) ao clicar na especialidade
  const createQueryString = (name: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    params.set("page", "1"); // Sempre volta para página 1 ao filtrar
    return params.toString();
  };

  return (
    <aside className="w-full md:w-64 flex-shrink-0 mb-8 md:mb-0 md:mr-8">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden sticky top-4">
        <div className="p-4 bg-slate-50 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
            Especialidades
          </h3>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {/* Link para "Todas" */}
          <Link
            href={`/medicos?${createQueryString("especialidade", null)}`}
            className={`flex justify-between items-center px-3 py-2 text-sm rounded-lg transition-colors
              ${
                !currentSpecialty
                  ? "bg-blue-50 text-blue-700 font-bold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
          >
            <span>Todas</span>
          </Link>

          {/* Lista de Especialidades */}
          {specialties.map((item) => (
            <Link
              key={item.name}
              href={`/medicos?${createQueryString("especialidade", item.name)}`}
              className={`flex justify-between items-center px-3 py-2 text-sm rounded-lg transition-colors group
                ${
                  currentSpecialty === item.name
                    ? "bg-blue-50 text-blue-700 font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
            >
              <span className="truncate">{item.name}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full 
                ${
                  currentSpecialty === item.name
                    ? "bg-blue-200 text-blue-800"
                    : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                }`}
              >
                {item.count}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
