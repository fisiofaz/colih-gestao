"use client";

import { createVisit, deleteVisit, toggleVisitStatus } from "@/app/actions";
import { toast } from "sonner";
import { useState } from "react";

type Visit = {
  id: string;
  date: Date;
  notes: string | null;
  status: string;
};

export default function VisitManager({
  doctorId,
  visits,
}: {
  doctorId: string;
  visits: Visit[];
}) {
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    await createVisit(doctorId, formData);
    setIsSaving(false);
    toast.success("Visita agendada!");
    // Limpa o form (hack simples via DOM, ou use ref se preferir)
    (document.getElementById("visit-form") as HTMLFormElement)?.reset();
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-8 no-print">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        📅 Agenda de Visitas
      </h3>

      {/* Lista de Visitas */}
      <div className="space-y-3 mb-6">
        {visits.map((visit) => {
          const isDone = visit.status === "DONE";
          return (
            <div
              key={visit.id}
              className={`flex items-start justify-between p-3 rounded-lg border ${
                isDone
                  ? "bg-slate-50 border-slate-100 opacity-70"
                  : "bg-blue-50 border-blue-100"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox Customizado */}
                <button
                  onClick={() =>
                    toggleVisitStatus(visit.id, visit.status, doctorId)
                  }
                  className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors
                    ${
                      isDone
                        ? "bg-green-500 border-green-500 text-white"
                        : "bg-white border-slate-300 hover:border-blue-500"
                    }
                  `}
                  title={
                    isDone ? "Marcar como pendente" : "Marcar como realizada"
                  }
                >
                  {isDone && "✓"}
                </button>

                <div>
                  <div
                    className={`font-medium ${
                      isDone ? "line-through text-slate-500" : "text-slate-800"
                    }`}
                  >
                    {new Date(visit.date).toLocaleDateString("pt-BR")} às{" "}
                    {new Date(visit.date).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  {visit.notes && (
                    <p className="text-sm text-slate-600">{visit.notes}</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  if (confirm("Cancelar esta visita?"))
                    deleteVisit(visit.id, doctorId);
                }}
                className="text-slate-400 hover:text-red-500 transition-colors px-2"
                title="Excluir visita"
              >
                ×
              </button>
            </div>
          );
        })}

        {visits.length === 0 && (
          <p className="text-sm text-slate-400 italic">
            Nenhuma visita agendada.
          </p>
        )}
      </div>

      {/* Formulário de Nova Visita */}
      <form
        id="visit-form"
        action={handleSubmit}
        className="flex flex-col md:flex-row gap-3 items-end pt-4 border-t border-slate-100"
      >
        <div className="w-full md:w-auto">
          <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
            Data e Hora
          </label>
          <input
            type="datetime-local"
            name="date"
            required
            className="input-padrao w-full"
          />
        </div>
        <div className="flex-1 w-full">
          <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
            Observação
          </label>
          <input
            type="text"
            name="notes"
            placeholder="Ex: Levar formulário..."
            className="input-padrao w-full"
          />
        </div>
        <button
          disabled={isSaving}
          className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors w-full md:w-auto"
        >
          {isSaving ? "..." : "+ Agendar"}
        </button>
      </form>

      <style jsx>{`
        .input-padrao {
          @apply rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
        }
      `}</style>
    </div>
  );
}
