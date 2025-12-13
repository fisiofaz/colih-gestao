// lib/schemas.ts
import { z } from "zod";

// Aqui definimos as regras de validação baseadas no PDF
export const doctorSchema = z.object({
  // Parte 1 e 2: Dados Pessoais
  firstName: z.string().min(2, "Nome deve ter pelo menos 2 letras"),
  lastName: z.string().min(2, "Sobrenome deve ter pelo menos 2 letras"),

  // Enums precisam bater com o Prisma
  type: z.enum(["COOPERATING", "CONSULTANT", "OTHER"], {
    errorMap: () => ({ message: "Selecione um tipo de médico" }),
  }),
  gender: z.enum(["MALE", "FEMALE"], {
    errorMap: () => ({ message: "Selecione o sexo" }),
  }),

  // Contato (Opcionais, mas validados se preenchidos)
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phoneMobile: z.string().optional(),
  phoneHome: z.string().optional(),

  // Endereço (Obrigatórios segundo o PDF)
  address: z.string().min(5, "Endereço muito curto"),
  city: z.string().min(2, "Cidade obrigatória"),
  state: z.string().length(2, "Use a sigla do estado (ex: RS)"),
  zipCode: z.string().min(8, "CEP inválido"),
  country: z.string().default("Brasil"),

  // Parte 3: Especialidades
  specialty1: z.string().min(3, "Pelo menos uma especialidade é obrigatória"),
  specialty2: z.string().optional(),

  // Booleans (Checkboxes)
  acceptsAdult: z.boolean().default(false),
  acceptsChild: z.boolean().default(false),
  acceptsNewborn: z.boolean().default(false),
});

// Exportamos o "Tipo" para o TypeScript usar no formulário
export type DoctorFormData = z.infer<typeof doctorSchema>;
