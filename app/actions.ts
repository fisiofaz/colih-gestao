"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import * as bcrypt from "bcryptjs";
import { auth, signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { Prisma } from "@prisma/client";

// --- TIPO GLOBAL PARA O ESTADO DOS FORMULÁRIOS ---
// Isso substitui o 'any' e remove o erro do prevState
export type State = {
  errors?: {
    [key: string]: string[];
  };
  message?: string | null;
} | null;

// --- SCHEMAS DE VALIDAÇÃO (ZOD) ---

const DoctorSchema = z.object({
  firstName: z.string().min(1, "Nome é obrigatório"),
  lastName: z.string().min(1, "Sobrenome é obrigatório"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phoneMobile: z.string().min(1, "Celular é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().length(2, "Estado deve ter 2 letras"),
  specialty1: z.string().min(1, "Especialidade principal é obrigatória"),
  type: z.enum(["COOPERATING", "CONSULTANT", "OTHER"]),
  acceptsAdult: z.boolean().optional(),
  acceptsChild: z.boolean().optional(),
  acceptsNewborn: z.boolean().optional(),
});

const CreateUserSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 letras"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

// Schema para validar as duas senhas
const ChangePasswordSchema = z.object({
  password: z.string().min(6, "A nova senha deve ter no mínimo 6 caracteres"),
  confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não conferem",
  path: ["confirmPassword"],
});

// --- ACTIONS DE MÉDICOS ---

export async function createDoctor(prevState: State, formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries());

  const dataToValidate = {
    ...rawFormData,
    acceptsAdult: rawFormData.acceptsAdult === "on",
    acceptsChild: rawFormData.acceptsChild === "on",
    acceptsNewborn: rawFormData.acceptsNewborn === "on",
  };

  const validatedFields = DoctorSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Faltam campos obrigatórios. Verifique o formulário.",
    };
  }

  try {
    // O 'unknown' serve para 'limpar' o tipo do Zod antes de afirmar que é um Input do Prisma
    const data = validatedFields.data as unknown as Prisma.DoctorCreateInput;

    await prisma.doctor.create({ data });
  } catch (error) {
    return {
      message: "Erro no Banco de Dados: Falha ao criar médico.",
    };
  }

  revalidatePath("/medicos");
  redirect("/medicos");
}

export async function updateDoctor(
  id: string,
  prevState: State,
  formData: FormData
) {
  const rawFormData = Object.fromEntries(formData.entries());

  const dataToValidate = {
    ...rawFormData,
    acceptsAdult: rawFormData.acceptsAdult === "on",
    acceptsChild: rawFormData.acceptsChild === "on",
    acceptsNewborn: rawFormData.acceptsNewborn === "on",
  };

  const validatedFields = DoctorSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Erro na validação dos campos.",
    };
  }

  try {
    const data = validatedFields.data as unknown as Prisma.DoctorUpdateInput;

    await prisma.doctor.update({
      where: { id },
      data,
    });
  } catch (error) {
    return { message: "Erro ao atualizar médico." };
  }

  revalidatePath("/medicos");
  redirect("/medicos");
}

export async function deleteDoctor(id: string) {
  try {
    await prisma.doctor.delete({
      where: { id },
    });
  } catch (error) {
    return { success: false, error: "Erro ao excluir." };
  }
  revalidatePath("/medicos");
}

// --- ACTIONS DE LOGIN/LOGOUT ---

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "E-mail ou senha incorretos.";
        default:
          return "Algo deu errado. Tente novamente.";
      }
    }
    throw error;
  }
}

export async function handleLogout() {
  await signOut({ redirectTo: "/login" });
}

// --- ACTION DE NOVO USUÁRIO ---

export async function createUser(prevState: State, formData: FormData) {
  const validatedFields = CreateUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Erro na validação dos campos.",
    };
  }

  const { name, email, password } = validatedFields.data;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criação manual garantindo que os campos batem com o banco
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        mustChangePassword: true,
      },
    });
  } catch (error) {
    return { message: "Erro ao criar usuário. Talvez o email já exista." };
  }

  revalidatePath("/membros");
  redirect("/membros");
}

export async function updatePassword(prevState: State, formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) return { message: "Usuário não autenticado" };

  const validatedFields = ChangePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Erro na validação.",
    };
  }

  const { password } = validatedFields.data;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Atualiza a senha E remove a obrigatoriedade de troca
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        password: hashedPassword,
        mustChangePassword: false, 
      },
    });
  } catch (error) {
    return { message: "Erro ao atualizar senha." };
  }

  // Redireciona para a home
  redirect("/");
}
