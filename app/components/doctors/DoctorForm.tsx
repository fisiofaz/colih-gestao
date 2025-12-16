"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { doctorSchema, DoctorFormData } from "@/lib/schemas";
import { createDoctor, updateDoctor } from "@/app/actions"; 
import { useState } from "react";
import { Doctor } from "@prisma/client"; // Tipo do Prisma

// Interface das Props: aceita um médico opcional
interface DoctorFormProps {
  doctor?: Doctor | null; // Se vier preenchido, é EDIÇÃO. Se null/undefined, é CRIAÇÃO.
}

export default function DoctorForm({ doctor }: DoctorFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!doctor; // Transformamos em booleano para facilitar checks

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(doctorSchema),
    // A MÁGICA ACONTECE AQUI:
    // Se for edição, usa os dados do médico. Se for novo, usa os padrões.
    defaultValues: isEditing
      ? {
          firstName: doctor.firstName,
          lastName: doctor.lastName,
          type: doctor.type,
          gender: doctor.gender,
          email: doctor.email || "",
          phoneMobile: doctor.phoneMobile || "",
          address: doctor.address || "",
          city: doctor.city || "",
          state: doctor.state || "",
          zipCode: doctor.zipCode || "",
          country: doctor.country || "Brasil",
          specialty1: doctor.specialty1,
          specialty2: doctor.specialty2 || "",
          acceptsAdult: doctor.acceptsAdult,
          acceptsChild: doctor.acceptsChild,
          acceptsNewborn: doctor.acceptsNewborn,
        }
      : {
          type: "COOPERATING", // Padrão
          country: "Brasil",
          gender: "MALE",
          acceptsAdult: true,
        },
  });

  async function onSubmit(data: DoctorFormData) {
    setIsSubmitting(true);

    // Converte JSON para FormData (Necessário para Server Actions)
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === "boolean") {
        if (value) formData.append(key, "on");
      } else if (value !== undefined && value !== null && value !== "") {
        formData.append(key, String(value));
      }
    });

    try {
      if (isEditing && doctor) {
        // MODO EDIÇÃO: Chama update passando ID
        await updateDoctor(doctor.id, null, formData);
      } else {
        // MODO CRIAÇÃO: Chama create
        await createDoctor(null, formData);
      }
      // O redirect acontece no server side
    } catch (error) {
      console.error(error);
      alert(`Erro ao ${isEditing ? "atualizar" : "cadastrar"} médico.`);
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 bg-white p-8 rounded-xl shadow-sm border border-slate-200"
    >
      {/* Cabeçalho do Formulário */}
      <div className="border-b border-slate-100 pb-4 mb-4">
        <h2 className="text-xl font-bold text-slate-800">
          {isEditing ? "Editar Médico" : "Cadastrar Novo Médico"}
        </h2>
        <p className="text-sm text-slate-500">
          {isEditing
            ? "Atualize os dados abaixo."
            : "Preencha os dados para adicionar ao sistema."}
        </p>
      </div>

      {/* --- SEÇÃO 1: TIPO E NOME --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Tipo *</label>
          <div className="relative">
            <select
              {...register("type")}
              className="w-full input-padrao bg-blue-50 border-blue-200 text-blue-800 font-semibold cursor-pointer"
            >
              <option value="COOPERATING">Médico Cooperador</option>
              <option value="CONSULTANT">Médico Consultor</option>
              <option value="OTHER">Outro</option>
            </select>
          </div>
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
          <label className="text-sm font-medium text-slate-700">Sexo *</label>
          <select {...register("gender")} className="w-full input-padrao">
            <option value="MALE">Masculino</option>
            <option value="FEMALE">Feminino</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">E-mail</label>
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
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Celular</label>
          <input
            {...register("phoneMobile")}
            className="w-full input-padrao"
            placeholder="(00) 00000-0000"
          />
        </div>
      </div>

      {/* --- SEÇÃO 3: ENDEREÇO --- */}
      <div className="pt-4 border-t border-slate-100">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">Endereço</h3>
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
              placeholder="UF"
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
        {errors.city && (
          <p className="text-red-500 text-xs mt-1">
            Cidade e UF são obrigatórios
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

        <div className="mt-4 flex gap-6 p-4 bg-slate-50 rounded-lg">
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
            <span className="text-sm text-slate-700">Atende Crianças</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register("acceptsNewborn")}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-slate-700">Recém-nascido</span>
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
          className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
        >
          {isSubmitting
            ? "Salvando..."
            : isEditing
            ? "Atualizar Médico"
            : "Salvar Médico"}
        </button>
      </div>

      <style jsx>{`
        .input-padrao {
          @apply w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
        }
      `}</style>
    </form>
  );
}
