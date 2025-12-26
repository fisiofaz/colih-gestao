"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { doctorSchema, DoctorFormData } from "@/lib/schemas";
import { createDoctor, updateDoctor } from "@/app/actions"; 
import { useState, useEffect } from "react";
import { Doctor } from "@prisma/client";
import { toast } from "sonner";
import { maskCEP, maskPhone, unmask } from "@/lib/utils";

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
    setValue, // Permite definir valores dos campos manualmente
    watch, // Permite "assistir" o valor de um campo
    setFocus, // Para focar no campo Número após achar o endereço
    formState: { errors },
  } = useForm({
    resolver: zodResolver(doctorSchema),
    // Se for edição, usa os dados do médico. Se for novo, usa os padrões.
    defaultValues: isEditing
      ? {
          firstName: doctor.firstName,
          lastName: doctor.lastName,
          type: doctor.type,
          gender: doctor.gender,
          email: doctor.email || "",
          phoneMobile: maskPhone(doctor.phoneMobile || ""),
          address: doctor.address || "",
          city: doctor.city || "",
          state: doctor.state || "",
          zipCode: maskCEP(doctor.zipCode || ""),
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

  // --- ASSISTIR O CEP ---
  const zipCodeValue = watch("zipCode");

  useEffect(() => {
    // Só roda se tiver valor
    if (!zipCodeValue) return;

    // Aplica máscara visual
    const maskedZip = maskCEP(zipCodeValue);
    if (zipCodeValue !== maskedZip) {
      setValue("zipCode", maskedZip);
    }

    // Se o CEP estiver completo (8 dígitos reais), busca no ViaCEP
    const cleanZip = unmask(zipCodeValue);
    if (cleanZip.length === 8) {
      fetchAddress(cleanZip);
    }
  }, [zipCodeValue, setValue]);

  // Função que busca no ViaCEP
  async function fetchAddress(cep: string) {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast.error("CEP não encontrado!");
        setFocus("address"); // Foca no endereço para digitar manual
        return;
      }

      // Preenche os campos automaticamente
      setValue("address", data.logradouro);
      setValue("city", data.localidade);
      setValue("state", data.uf);

      toast.success("Endereço encontrado!");
      // Foca no campo de endereço para a pessoa completar o número
      setTimeout(() => setFocus("address"), 100);
    } catch (error) {
      console.error("Erro ao buscar CEP", error);
      // Não damos erro fatal, deixamos o usuário digitar
    }
  }

  // --- MÁSCARA DE TELEFONE ---
  // Usamos onChange no input para aplicar em tempo real
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = maskPhone(e.target.value);
    setValue("phoneMobile", formatted);
  };

  async function onSubmit(data: DoctorFormData) {
    setIsSubmitting(true);
    const toastId = toast.loading("Salvando informações...");

    // Converte JSON para FormData
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === "boolean") {
        if (value) formData.append(key, "on");
      } else if (value !== undefined && value !== null && value !== "") {
        // Limpamos a máscara antes de enviar pro banco 
        if (key === "phoneMobile" || key === "zipCode") {
          formData.append(key, unmask(String(value)));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    try {
      if (isEditing && doctor) {
        await updateDoctor(doctor.id, null, formData);
        // Sucesso na Edição
        toast.success("Médico atualizado com sucesso!", { id: toastId });
      } else {
        await createDoctor(null, formData);
        // Sucesso na Criação
        toast.success("Novo médico cadastrado!", { id: toastId });
      }
      // O redirect acontece no server side
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar. Verifique os dados.", { id: toastId });
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

      {/* --- TIPO E NOME --- */}
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

      {/* --- CONTATOS --- */}
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
            onChange={handlePhoneChange}
            className="w-full input-padrao"
            placeholder="(00) 00000-0000"
          />
        </div>
      </div>

      {/* --- ENDEREÇO INTELIGENTE --- */}
      <div className="pt-4 border-t border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-700">Endereço</h3>
          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full font-medium">
            ✨ Busca Automática via CEP
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">
              CEP
            </label>
            <input
              {...register("zipCode")}
              className="w-full input-padrao font-mono" // font-mono ajuda a ver os números
              placeholder="00000-000"
              maxLength={9}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">
              Estado (UF)
            </label>
            <input
              {...register("state")}
              placeholder="UF"
              className="w-full input-padrao bg-slate-50"
              readOnly
              tabIndex={-1}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase">
              Cidade
            </label>
            <input
              {...register("city")}
              placeholder="Cidade"
              className="w-full input-padrao bg-slate-50"
              readOnly
              tabIndex={-1}
            />
            {errors.city && (
              <p className="text-red-500 text-xs mt-1">Cidade é obrigatória</p>
            )}
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase">
              Endereço (Rua, Av.) e Número
            </label>
            <input
              {...register("address")}
              placeholder="Ex: Av. Paulista, 1000"
              className="w-full input-padrao"
            />
          </div>
        </div>
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

      <div className="border-t border-slate-100 pt-6 mt-6">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
          Informações Administrativas (Colih)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CHECKBOXES SUS E CONVÊNIO */}
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                name="isSus"
                defaultChecked={doctor?.isSus}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-slate-700 font-medium">Atende SUS</span>
            </label>

            <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                name="hasHealthPlan"
                defaultChecked={doctor?.hasHealthPlan}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-slate-700 font-medium">
                Atende Convênios
              </span>
            </label>
          </div>

          {/* CAMPO MEMBRO RESPONSÁVEL */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Membro Responsável (Contato)
            </label>
            <input
              type="text"
              name="responsibleMember"
              defaultValue={doctor?.responsibleMember || ""}
              placeholder="Ex: Dinarci Pansera"
              className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              Irmão da Colih que mantém contato com este médico.
            </p>
          </div>
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
