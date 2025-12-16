"use client";

import { deleteDoctor } from "@/app/actions";
import { useState } from "react";

export function DeleteButton({ id, name }: { id: string; name: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    // 1. Confirmação do usuário
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o médico ${name}?`
    );

    if (confirmed) {
      setIsDeleting(true);

      try {
        // 2. Chamamos a action e esperamos a resposta
        // O TypeScript pode reclamar que a action retorna void ou objeto, então tratamos como 'any' ou verificamos a propriedade
        const response = await deleteDoctor(id);

        // 3. Se o servidor retornou um objeto com erro (ex: bloqueio GVP)
        if (response && typeof response === "object" && "error" in response) {
          alert(response.error); // "Acesso negado"
        }

        // Se deu certo, o revalidatePath no servidor atualiza a lista automaticamente
      } catch (error) {
        alert("Ocorreu um erro ao tentar excluir.");
      } finally {
        setIsDeleting(false);
      }
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1 hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      title="Excluir Registro"
    >
      {isDeleting ? (
        // Spinnerzinho simples enquanto carrega
        <svg
          className="animate-spin h-4 w-4 text-red-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
          />
        </svg>
      )}
      <span className="hidden md:inline">
        {isDeleting ? "Apagando..." : "Excluir"}
      </span>
    </button>
  );
}
