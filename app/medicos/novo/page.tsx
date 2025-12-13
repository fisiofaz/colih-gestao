"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { doctorSchema, DoctorFormData } from "@/lib/schemas";
import { createDoctor } from "@/app/actions";
import { useState } from "react";

export default function NovoMedicoPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // MUDANÇA 1: Removemos o <DoctorFormData> daqui.
  // Deixamos o 'zodResolver' ensinar ao formulário quais são os campos.
  // Isso elimina o erro vermelho no 'resolver'.
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      country: "Brasil",
      acceptsAdult: true,
    },
  });

  // MUDANÇA 2: Dizemos explicitamente que 'data' é do tipo DoctorFormData
  async function onSubmit(data: DoctorFormData) {
    setIsSubmitting(true);
    await createDoctor(data);
  }

  return (
    <div className="min-h-screen p-8 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/medicos"
            className="text-slate-500 hover:text-blue-700 flex items-center gap-1 text-sm font-medium"
          >
            ← Voltar
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">
            Cadastrar Novo Médico
          </h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          {/* MUDANÇA 3: O erro no handleSubmit deve sumir agora que o useForm está alinhado */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* --- SEÇÃO 1: TIPO E NOME --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Tipo *
                </label>
                <select {...register("type")} className="w-full input-padrao">
                  <option value="">Selecione...</option>
                  <option value="COOPERATING">Médico Cooperador</option>
                  <option value="CONSULTANT">Médico Consultor</option>
                  <option value="OTHER">Outro</option>
                </select>
                {errors.type && (
                  <p className="text-red-500 text-xs">
                    {String(errors.type.message)}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Primeiro Nome *
                </label>
                <input
                  {...register("firstName")}
                  className="w-full input-padrao"
                  placeholder="Ex: Lucas"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs">
                    {String(errors.firstName.message)}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Sobrenome *
                </label>
                <input
                  {...register("lastName")}
                  className="w-full input-padrao"
                  placeholder="Ex: Silva"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs">
                    {String(errors.lastName.message)}
                  </p>
                )}
              </div>
            </div>

            {/* --- SEÇÃO 2: DETALHES PESSOAIS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Sexo *
                </label>
                <select {...register("gender")} className="w-full input-padrao">
                  <option value="">Selecione...</option>
                  <option value="MALE">Masculino</option>
                  <option value="FEMALE">Feminino</option>
                </select>
                {errors.gender && (
                  <p className="text-red-500 text-xs">
                    {String(errors.gender.message)}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  E-mail
                </label>
                <input
                  {...register("email")}
                  className="w-full input-padrao"
                  type="email"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs">
                    {String(errors.email.message)}
                  </p>
                )}
              </div>
            </div>

            {/* --- SEÇÃO 3: ENDEREÇO --- */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-lg font-semibold text-slate-700 mb-4">
                Endereço
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  {...register("address")}
                  placeholder="Rua / Número"
                  className="w-full input-padrao"
                />
                <input
                  {...register("city")}
                  placeholder="Cidade"
                  className="w-full input-padrao"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    {...register("state")}
                    placeholder="UF (Ex: RS)"
                    className="w-full input-padrao"
                    maxLength={2}
                  />
                  <input
                    {...register("zipCode")}
                    placeholder="CEP"
                    className="w-full input-padrao"
                  />
                </div>
              </div>
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">
                  Endereço obrigatório
                </p>
              )}
            </div>

            {/* --- SEÇÃO 4: ESPECIALIDADES --- */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-lg font-semibold text-slate-700 mb-4">
                Dados Médicos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Especialidade Principal *
                  </label>
                  <input
                    {...register("specialty1")}
                    className="w-full input-padrao"
                    placeholder="Ex: Cardiologia"
                  />
                  {errors.specialty1 && (
                    <p className="text-red-500 text-xs">
                      {String(errors.specialty1.message)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Subespecialidade (Opcional)
                  </label>
                  <input
                    {...register("specialty2")}
                    className="w-full input-padrao"
                  />
                </div>
              </div>

              <div className="mt-4 flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("acceptsAdult")}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-slate-700">Atende Adultos</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("acceptsChild")}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-slate-700">
                    Atende Crianças
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
              <Link
                href="/medicos"
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Salvando..." : "Salvar Médico"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .input-padrao {
          @apply w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
        }
      `}</style>
    </div>
  );
}
