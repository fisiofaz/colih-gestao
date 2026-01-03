import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("E-mail inválido"),
  role: z.enum(["ADMIN", "COLIH", "GVP"]),
});

// Aqui definimos as regras de validação baseadas no PDF
export const doctorSchema = z.object({
  // Parte 1 e 2: Dados Pessoais
  firstName: z.string().min(2, "Nome é obrigatório"),
  lastName: z.string().min(2, "Sobrenome é obrigatório"),

  // IMPORTANTE: Estes campos não podem faltar!
  type: z.enum(["COOPERATING", "CONSULTANT"]),
  gender: z.enum(["MALE", "FEMALE"]),

  // --- Contato ---
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phoneMobile: z.string().optional().or(z.literal("")),
  phoneHome: z.string().optional().or(z.literal("")),

  // Endereço (Obrigatórios segundo o PDF)
  address: z.string().optional().or(z.literal("")),
  city: z.string().min(2, "Cidade obrigatória"),
  state: z.string().length(2, "Use a sigla do estado (ex: RS)"),

  // --- Profissional ---
  crm: z.string().optional().or(z.literal("")),
  specialty1: z.string().min(3, "Especialidade obrigatória"),
  specialty2: z.string().optional().or(z.literal("")),

  // --- Checkboxes ---
  acceptsAdult: z.boolean(),
  acceptsChild: z.boolean(),
  acceptsNewborn: z.boolean(),
  isSus: z.boolean(),
  hasHealthPlan: z.boolean(),

  responsibleMember: z.string().optional().nullable(),
});

// Exportamos o "Tipo" para o TypeScript usar no formulário
export type DoctorFormData = z.infer<typeof doctorSchema>;
export type UserFormData = z.infer<typeof userSchema>;
