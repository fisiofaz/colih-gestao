"use client"; // Isso diz ao Next.js: "Esse pedaço roda no navegador"

import { useRouter } from "next/navigation";

export default function MonthSelector({
  currentMonth,
}: {
  currentMonth: string;
}) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm">
      <label
        htmlFor="month-selector"
        className="text-sm font-medium text-slate-600 pl-2"
      >
        Mês Referência:
      </label>
      <input
        id="month-selector"
        type="month"
        defaultValue={currentMonth}
        className="border-none text-slate-700 font-medium focus:ring-0 cursor-pointer"
        onChange={(e) => {
          // Quando muda a data, recarrega a página com o novo filtro
          router.push(`/relatorios?month=${e.target.value}`);
        }}
      />
    </div>
  );
}
