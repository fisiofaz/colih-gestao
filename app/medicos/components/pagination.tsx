"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface PaginationProps {
  totalPages: number;
}

export default function Pagination({ totalPages }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Pega a página atual da URL (ou assume 1 se não tiver)
  const currentPage = Number(searchParams.get("page")) || 1;

  // Função que cria o link mantendo os outros filtros (busca, tipo, etc)
  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  if (totalPages <= 1) return null; // Se só tem 1 página, não mostra nada

  return (
    <div className="flex justify-center items-center gap-4 mt-8">
      {/* Botão ANTERIOR */}
      <PaginationArrow
        direction="left"
        href={createPageURL(currentPage - 1)}
        isDisabled={currentPage <= 1}
      />

      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600 font-medium">
          Página {currentPage} de {totalPages}
        </span>
      </div>

      {/* Botão PRÓXIMO */}
      <PaginationArrow
        direction="right"
        href={createPageURL(currentPage + 1)}
        isDisabled={currentPage >= totalPages}
      />
    </div>
  );
}

// Sub-componente simples para as setas
function PaginationArrow({
  href,
  direction,
  isDisabled,
}: {
  href: string;
  direction: "left" | "right";
  isDisabled?: boolean;
}) {
  const className = `flex h-10 w-10 items-center justify-center rounded-md border ${
    isDisabled
      ? "pointer-events-none text-slate-300 border-slate-200"
      : "hover:bg-slate-100 text-slate-600 border-slate-300"
  }`;

  const icon =
    direction === "left" ? (
      <span className="text-lg">←</span>
    ) : (
      <span className="text-lg">→</span>
    );

  return isDisabled ? (
    <div className={className}>{icon}</div>
  ) : (
    <Link className={className} href={href}>
      {icon}
    </Link>
  );
}
