"use client";

import { useState } from "react";
import { uploadDocument, deleteDocument } from "@/app/actions";
import { toast } from "sonner";
import Image from "next/image";

// Tipo simples para o documento
type Doc = {
  id: string;
  url: string;
  filename: string;
};

interface DocumentManagerProps {
  doctorId: string;
  documents: Doc[];
}

export default function DocumentManager({
  doctorId,
  documents,
}: DocumentManagerProps) {
  const [isUploading, setIsUploading] = useState(false);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const toastId = toast.loading("Enviando arquivo...");

    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadDocument(doctorId, formData);

    if (result?.message) {
      toast.error(result.message, { id: toastId });
    } else {
      toast.success("Arquivo anexado!", { id: toastId });
    }

    setIsUploading(false);
    // Limpa o input para poder subir o mesmo arquivo de novo se quiser
    event.target.value = "";
  }

  async function handleDelete(docId: string, url: string) {
    if (!confirm("Tem certeza que deseja excluir este arquivo?")) return;

    const toastId = toast.loading("Excluindo...");
    await deleteDocument(docId, doctorId, url);
    toast.success("Arquivo removido", { id: toastId });
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-8 no-print">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        📎 Documentos e Anexos
      </h3>

      {/* Lista de Arquivos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="relative group border border-slate-200 rounded-lg p-2 hover:border-blue-300 transition-colors"
          >
            {/* Link para abrir */}
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center"
            >
              <div className="h-20 bg-slate-50 rounded-md flex items-center justify-center mb-2 overflow-hidden relative">
                {/* Se for imagem, mostra preview. Se não, mostra ícone */}
                {doc.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <Image
                    src={doc.url}
                    alt={doc.filename}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="text-3xl">📄</span>
                )}
              </div>
              <p
                className="text-xs text-slate-600 truncate px-1"
                title={doc.filename}
              >
                {doc.filename}
              </p>
            </a>

            {/* Botão de Excluir (aparece no hover) */}
            <button
              onClick={() => handleDelete(doc.id, doc.url)}
              className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"
              title="Excluir arquivo"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Botão de Upload */}
      <div className="flex items-center gap-4">
        <label
          className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer
          ${
            isUploading
              ? "bg-slate-100 text-slate-400 cursor-wait"
              : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
          }
        `}
        >
          {isUploading ? (
            <>⏳ Enviando...</>
          ) : (
            <>
              ☁️ Anexar Arquivo
              <input
                type="file"
                className="hidden"
                onChange={handleUpload}
                accept="image/*,application/pdf" // Aceita Imagens e PDF
              />
            </>
          )}
        </label>
        <span className="text-xs text-slate-400">
          Max: 4MB (Imagens ou PDF)
        </span>
      </div>
    </div>
  );
}
