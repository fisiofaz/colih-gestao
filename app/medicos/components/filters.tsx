"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface FiltersProps {
  cities: string[];
  specialties: string[];
}

export default function Filters({ cities, specialties }: FiltersProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  function handleFilter(term: string, type: "city" | "specialty") {
    const params = new URLSearchParams(searchParams);

    // Se selecionou algo, adiciona na URL. Se vazio, remove.
    if (term) {
      params.set(type, term);
    } else {
      params.delete(type);
    }

    // Reseta a paginação para 1 sempre que filtrar
    params.set("page", "1");

    replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
      {/* Filtro de Cidade */}
      <select
        className="px-4 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600"
        onChange={(e) => handleFilter(e.target.value, "city")}
        defaultValue={searchParams.get("city")?.toString()}
      >
        <option value="">Todas as Cidades</option>
        {cities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>

      {/* Filtro de Especialidade */}
      <select
        className="px-4 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600"
        onChange={(e) => handleFilter(e.target.value, "specialty")}
        defaultValue={searchParams.get("specialty")?.toString()}
      >
        <option value="">Todas as Especialidades</option>
        {specialties.map((spec) => (
          <option key={spec} value={spec}>
            {spec}
          </option>
        ))}
      </select>
    </div>
  );
}
