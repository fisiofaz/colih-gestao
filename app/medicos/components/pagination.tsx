"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface PaginationProps {
  totalPages: number;
}

export default function Pagination({ totalPages }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  // Gera a lista de páginas (ex: [1, 2, "...", 9, 10])
  const allPages = generatePagination(currentPage, totalPages);

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2">
      {/* Seta Esquerda */}
      <PaginationArrow
        direction="left"
        href={createPageURL(currentPage - 1)}
        isDisabled={currentPage <= 1}
      />

      {/* VISÃO DESKTOP: Mostra os números (1, 2, ..., 10) */}
      {/* 'hidden md:flex' = Esconde no celular, mostra no PC */}
      <div className="hidden md:flex gap-1">
        {allPages.map((page, index) => {
          let position: "first" | "last" | "single" | "middle" | undefined;

          if (index === 0) position = "first";
          if (index === allPages.length - 1) position = "last";
          if (allPages.length === 1) position = "single";
          if (page === "...") position = "middle";

          return (
            <PaginationNumber
              key={`${page}-${index}`} // Key única combinando valor e índice
              href={createPageURL(page)}
              page={page}
              position={position}
              isActive={currentPage === page}
            />
          );
        })}
      </div>

      {/* VISÃO MOBILE: Mostra apenas "Pág X de Y" */}
      {/* 'flex md:hidden' = Mostra no celular, esconde no PC */}
      <div className="flex md:hidden items-center px-4 py-2 bg-white rounded-md border border-slate-200 text-sm font-medium text-slate-600">
        {currentPage} / {totalPages}
      </div>

      {/* Seta Direita */}
      <PaginationArrow
        direction="right"
        href={createPageURL(currentPage + 1)}
        isDisabled={currentPage >= totalPages}
      />
    </div>
  );
}

// --- SUB-COMPONENTES E UTILITÁRIOS ---

function PaginationNumber({
  page,
  href,
  isActive,
  position,
}: {
  page: number | string;
  href: string;
  position?: "first" | "last" | "middle" | "single";
  isActive: boolean;
}) {
  const className = `flex h-10 w-10 items-center justify-center text-sm border 
    ${position === "first" || position === "single" ? "rounded-l-md" : ""}
    ${position === "last" || position === "single" ? "rounded-r-md" : ""}
    ${
      isActive
        ? "z-10 bg-blue-600 border-blue-600 text-white font-bold"
        : "text-slate-600 border-slate-300 hover:bg-slate-100"
    }
    ${!isActive && position !== "middle" ? "hover:bg-gray-100" : ""}
    ${
      position === "middle"
        ? "text-gray-300 border-transparent pointer-events-none"
        : ""
    }
  `;

  return isActive || page === "..." ? (
    <div className={className}>{page}</div>
  ) : (
    <Link href={href} className={className}>
      {page}
    </Link>
  );
}

function PaginationArrow({
  href,
  direction,
  isDisabled,
}: {
  href: string;
  direction: "left" | "right";
  isDisabled?: boolean;
}) {
  const className = `flex h-10 w-10 items-center justify-center rounded-md border transition-colors ${
    isDisabled
      ? "pointer-events-none text-slate-300 border-slate-200"
      : "hover:bg-slate-100 text-slate-600 border-slate-300 bg-white"
  } ${direction === "left" ? "mr-2" : "ml-2"}`;

  const icon = direction === "left" ? "←" : "→";

  return isDisabled ? (
    <div className={className}>{icon}</div>
  ) : (
    <Link className={className} href={href}>
      {icon}
    </Link>
  );
}

// Lógica para gerar os números (ex: 1 ... 4 5 6 ... 10)
const generatePagination = (currentPage: number, totalPages: number) => {
  // Se tiver até 7 páginas, mostra todas [1, 2, 3, 4, 5, 6, 7]
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Se estiver nas primeiras 3 páginas: [1, 2, 3, ..., 9, 10]
  if (currentPage <= 3) {
    return [1, 2, 3, "...", totalPages - 1, totalPages];
  }

  // Se estiver nas últimas 3 páginas: [1, 2, ..., 8, 9, 10]
  if (currentPage >= totalPages - 2) {
    return [1, 2, "...", totalPages - 2, totalPages - 1, totalPages];
  }

  // Se estiver no meio: [1, ..., 4, 5, 6, ..., 10]
  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
};
