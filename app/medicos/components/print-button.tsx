"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-lg font-medium transition flex items-center gap-2 no-print"
      title="Imprimir Lista ou Salvar em PDF"
    >
      <span className="text-lg">🖨️</span>
      <span className="hidden md:inline">Imprimir Lista</span>
    </button>
  );
}
