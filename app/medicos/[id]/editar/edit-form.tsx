"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { doctorSchema, DoctorFormData } from "@/lib/schemas";
import { updateDoctor } from "@/app/actions";
import { useState } from "react";
import { Doctor } from "@prisma/client";

// Definimos que este componente ACEITA dados de um médico existente
interface EditFormProps {
  doctor: Doctor;
}

export default function EditDoctorForm({ doctor }: EditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(doctorSchema),
    // AQUI ESTÁ A MÁGICA: Preenchemos o formulário com os dados que vieram do banco
    defaultValues: {
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      type: doctor.type,
      gender: doctor.gender,
      email: doctor.email || "",
      phoneMobile: doctor.phoneMobile || "",
      address: doctor.address,
      city: doctor.city,
      state: doctor.state,
      zipCode: doctor.zipCode,
      country: doctor.country,
      specialty1: doctor.specialty1,
      specialty2: doctor.specialty2 || "",
      acceptsAdult: doctor.acceptsAdult,
      acceptsChild: doctor.acceptsChild,
      acceptsNewborn: doctor.acceptsNewborn,
    },
  });

  async function onSubmit(data: DoctorFormData) {
    setIsSubmitting(true);
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      // O backend espera "on" para checkboxes marcados
      if (typeof value === "boolean") {
        if (value) formData.append(key, "on");
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    try {
      // null é o prevState que a action espera
      await updateDoctor(doctor.id, null, formData);
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 bg-white p-8 rounded-xl shadow-sm border border-slate-200"
    >
      {/* SEÇÃO 1: TIPO E NOME */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Tipo de Atuação
          </label>
          <div className="relative">
            <select
              {...register("type")}
              className="w-full input-padrao bg-blue-50 border-blue-200 text-blue-800 font-semibold"
            >
              <option value="COOPERATING">Médico Cooperador</option>
              <option value="CONSULTANT">Médico Consultor</option>
              <option value="OTHER">Outro</option>
            </select>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Primeiro Nome
          </label>
          <input {...register("firstName")} className="w-full input-padrao" />
          {errors.firstName && (
            <p className="text-red-500 text-xs">{errors.firstName.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Sobrenome
          </label>
          <input {...register("lastName")} className="w-full input-padrao" />
          {errors.lastName && (
            <p className="text-red-500 text-xs">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      {/* SEÇÃO 2: DETALHES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Sexo</label>
          <select {...register("gender")} className="w-full input-padrao">
            <option value="MALE">Masculino</option>
            <option value="FEMALE">Feminino</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">E-mail</label>
          <input {...register("email")} className="w-full input-padrao" />
          {errors.email && (
            <p className="text-red-500 text-xs">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Celular</label>
          <input
            {...register("phoneMobile")}
            className="w-full input-padrao"
            placeholder="(00) 00000-0000"
          />
          {errors.phoneMobile && (
            <p className="text-red-500 text-xs">{errors.phoneMobile.message}</p>
          )}
        </div>
      </div>

      {/* SEÇÃO 3: ENDEREÇO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          {...register("city")}
          className="w-full input-padrao"
          placeholder="Cidade"
        />
        <input
          {...register("address")}
          className="w-full input-padrao"
          placeholder="Endereço"
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            {...register("state")}
            className="w-full input-padrao"
            placeholder="UF"
            maxLength={2}
          />
          <input
            {...register("zipCode")}
            className="w-full input-padrao"
            placeholder="CEP"
          />
        </div>
        {errors.city && (
          <p className="text-red-500 text-xs">{errors.city.message}</p>
        )}
      </div>

      {/* SEÇÃO 4: ESPECIALIDADES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-slate-700">
            Especialidade Principal
          </label>
          <input {...register("specialty1")} className="w-full input-padrao" />
          {errors.specialty1 && (
            <p className="text-red-500 text-xs">{errors.specialty1.message}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">
            Subespecialidade (Opcional)
          </label>
          <input {...register("specialty2")} className="w-full input-padrao" />
        </div>
      </div>

      {/* SEÇÃO 5: CHECKBOXES */}
      <div className="flex gap-6 pt-2">
        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            {...register("acceptsAdult")}
            className="rounded text-blue-600"
          />
          Atende Adulto
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            {...register("acceptsChild")}
            className="rounded text-blue-600"
          />
          Atende Criança
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            {...register("acceptsNewborn")}
            className="rounded text-blue-600"
          />
          Atende Recém-nascido
        </label>
      </div>

      <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
        <Link
          href="/medicos"
          className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50"
        >
          {isSubmitting ? "Salvando..." : "Atualizar Médico"}
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