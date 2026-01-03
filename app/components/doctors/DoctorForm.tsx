"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createDoctor, updateDoctor } from "@/app/actions"; // Suas server actions
import type { Doctor } from "@prisma/client";

interface DoctorFormProps {
  doctor?: Doctor; // Se vier preenchido, é Edição. Se null, é Criação.
}

export default function DoctorForm({ doctor }: DoctorFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const BRAZIL_STATES = [
    { value: "AC", label: "Acre" },
    { value: "AL", label: "Alagoas" },
    { value: "AP", label: "Amapá" },
    { value: "AM", label: "Amazonas" },
    { value: "BA", label: "Bahia" },
    { value: "CE", label: "Ceará" },
    { value: "DF", label: "Distrito Federal" },
    { value: "ES", label: "Espírito Santo" },
    { value: "GO", label: "Goiás" },
    { value: "MA", label: "Maranhão" },
    { value: "MT", label: "Mato Grosso" },
    { value: "MS", label: "Mato Grosso do Sul" },
    { value: "MG", label: "Minas Gerais" },
    { value: "PA", label: "Pará" },
    { value: "PB", label: "Paraíba" },
    { value: "PR", label: "Paraná" },
    { value: "PE", label: "Pernambuco" },
    { value: "PI", label: "Piauí" },
    { value: "RJ", label: "Rio de Janeiro" },
    { value: "RN", label: "Rio Grande do Norte" },
    { value: "RS", label: "Rio Grande do Sul" },
    { value: "RO", label: "Rondônia" },
    { value: "RR", label: "Roraima" },
    { value: "SC", label: "Santa Catarina" },
    { value: "SP", label: "São Paulo" },
    { value: "SE", label: "Sergipe" },
    { value: "TO", label: "Tocantins" },
  ];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);

    let result;
    if (doctor) {
      // Modo Edição
      result = await updateDoctor(doctor.id, formData);
    } else {
      // Modo Criação
      result = await createDoctor(formData);
    }

    if (result.success) {
      router.push("/medicos");
      router.refresh();
    } else {
      setError(result.message);
      setLoading(false);
      window.scrollTo(0, 0); // Sobe a tela para ver o erro
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-20 md:pb-0">
      {/* Exibe Erros se houver */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 text-sm">
          🚨 {error}
        </div>
      )}

      {/* --- BLOCO 1: DADOS PESSOAIS --- */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
          👤 Dados Pessoais
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nome *
            </label>
            <input
              name="firstName"
              defaultValue={doctor?.firstName}
              required
              placeholder="Ex: João"
              className="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Sobrenome */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Sobrenome *
            </label>
            <input
              name="lastName"
              defaultValue={doctor?.lastName}
              required
              placeholder="Ex: Silva"
              className="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Gênero */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Gênero
            </label>
            <select
              name="gender"
              defaultValue={doctor?.gender || "MALE"}
              className="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="MALE">Masculino (Dr.)</option>
              <option value="FEMALE">Feminino (Dra.)</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- BLOCO 2: CONTATO E LOCALIZAÇÃO --- */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
          📍 Contato e Endereço
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Celular - Com teclado numérico no mobile */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Celular / WhatsApp *
            </label>
            <input
              name="phoneMobile"
              defaultValue={doctor?.phoneMobile || ""}
              required
              inputMode="numeric"
              placeholder="(11) 99999-9999"
              className="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Telefone Fixo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Telefone Fixo
            </label>
            <input
              name="phoneHome"
              defaultValue={doctor?.phoneHome || ""}
              inputMode="numeric"
              placeholder="(11) 3333-3333"
              className="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Cidade */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Cidade *
            </label>
            <input
              name="city"
              defaultValue={doctor?.city}
              required
              className="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Estado (UF) *
            </label>
            <select
              name="state"
              defaultValue={doctor?.state || "RS"}
              className="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500"
            >
              {BRAZIL_STATES.map((uf) => (
                <option key={uf.value} value={uf.value}>
                  {uf.label} ({uf.value})
                </option>
              ))}
            </select>
          </div>

          {/* Endereço Completo (Ocupa 2 colunas no PC, 1 no Mobile) */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Endereço Completo
            </label>
            <input
              name="address"
              defaultValue={doctor?.address || ""}
              placeholder="Rua, Número, Bairro, CEP"
              className="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* --- BLOCO 3: DADOS PROFISSIONAIS --- */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
          ⚕️ Profissional
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Especialidade 1 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Especialidade Principal *
            </label>
            <input
              name="specialty1"
              defaultValue={doctor?.specialty1}
              required
              list="specialties-list" // Sugestões
              className="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500"
            />
            {/* Lista de sugestões nativa do navegador */}
            <datalist id="specialties-list">
              <option value="Cardiologia" />
              <option value="Pediatria" />
              <option value="Ortopedia" />
              <option value="Ginecologia" />
              <option value="Dermatologia" />
              <option value="Clínica Médica" />
            </datalist>
          </div>

          {/* Especialidade 2 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Especialidade Secundária
            </label>
            <input
              name="specialty2"
              defaultValue={doctor?.specialty2 || ""}
              list="specialties-list"
              className="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Tipo de Vínculo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tipo de Vínculo
            </label>
            <select
              name="type"
              defaultValue={doctor?.type || "COOPERATING"}
              className="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="COOPERATING">Cooperador (Aceita protocolo)</option>
              <option value="CONSULTANT">
                Consultor (Apenas tira dúvidas)
              </option>
            </select>
          </div>

          {/* CRM */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              CRM
            </label>
            <input
              name="crm"
              defaultValue={doctor?.crm || ""}
              className="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Checkboxes de Atendimento */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <h4 className="text-sm font-bold text-slate-900 mb-3">
            Detalhes do Atendimento
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Coluna 1: Público Alvo */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 p-2 border rounded-lg hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  name="acceptsAdult"
                  defaultChecked={doctor?.acceptsAdult}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Atende Adultos 👨</span>
              </label>
              <label className="flex items-center gap-2 p-2 border rounded-lg hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  name="acceptsChild"
                  defaultChecked={doctor?.acceptsChild}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Atende Crianças 🧒</span>
              </label>
              <label className="flex items-center gap-2 p-2 border rounded-lg hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  name="acceptsNewborn"
                  defaultChecked={doctor?.acceptsNewborn}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Atende Recém-nascidos 👶</span>
              </label>
            </div>

            {/* Coluna 2: Convênios / SUS */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 p-2 border border-green-200 bg-green-50 rounded-lg hover:bg-green-100 cursor-pointer">
                <input
                  type="checkbox"
                  name="isSus"
                  defaultChecked={doctor?.isSus}
                  className="rounded text-green-600 focus:ring-green-500"
                />
                <span className="text-sm font-medium text-green-800">
                  Atende pelo SUS 🏥
                </span>
              </label>
              <label className="flex items-center gap-2 p-2 border border-indigo-200 bg-indigo-50 rounded-lg hover:bg-indigo-100 cursor-pointer">
                <input
                  type="checkbox"
                  name="hasHealthPlan"
                  defaultChecked={doctor?.hasHealthPlan}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-indigo-800">
                  Aceita Convênios 💳
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* --- BOTÕES DE AÇÃO --- */}
      <div className="flex flex-col-reverse md:flex-row justify-end gap-3 pt-4 border-t border-slate-200">
        <Link
          href="/medicos"
          className="w-full md:w-auto px-6 py-3 text-center text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading
            ? "Salvando..."
            : doctor
            ? "✅ Salvar Alterações"
            : "✨ Cadastrar Médico"}
        </button>
      </div>
    </form>
  );
}
