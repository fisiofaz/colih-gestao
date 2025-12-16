"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import * as bcrypt from "bcryptjs";
import { auth, signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { Prisma, DoctorType, UserRole } from "@prisma/client";
import { doctorSchema } from "@/lib/schemas";


// --- TIPO GLOBAL PARA O ESTADO DOS FORMULÁRIOS ---
export type State = {
  errors?: {
    [key: string]: string[];
  };
  message?: string | null;
} | null;

// --- SCHEMAS DE VALIDAÇÃO (ZOD) ---
// O DoctorSchema estamos importando de lib/schemas para manter coerência

const CreateUserSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 letras"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

const ChangePasswordSchema = z.object({
  password: z.string().min(6, "A nova senha deve ter no mínimo 6 caracteres"),
  confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não conferem",
  path: ["confirmPassword"],
});

// =========================================================
// 1. DASHBOARD E LEITURA
// =========================================================

export async function getDashboardData() {
 
  const session = await auth();

  if (!session?.user) {
    return {
      allowed: false,
      userRole: null,
      colaboradores: [],
      consultores: [],
      stats: null,
    };
  }

  const role = session.user.role;
  const isGVT = role === "GVT";

  try {
    // Buscamos tudo em paralelo para ser rápido
    const [colaboradores, consultores, totalMembros, membrosCOLIH, membrosGVT] =
      await Promise.all([
        // 1. Médicos (Só buscamos se NÃO for GVT para economizar banco)
        !isGVT
          ? prisma.doctor.findMany({
              where: { type: "COOPERATING" },
              orderBy: { firstName: "asc" },
              take: 5,
            })
          : Promise.resolve([]),

        !isGVT
          ? prisma.doctor.findMany({
              where: { type: "CONSULTANT" },
              orderBy: { firstName: "asc" },
              take: 5,
            })
          : Promise.resolve([]),

        // 2. Estatísticas de Membros
        prisma.user.count(),
        prisma.user.count({ where: { role: UserRole.COLIH } }),
        prisma.user.count({ where: { role: UserRole.GVT } }),
      ]);

    return {
      allowed: !isGVT, // Define se pode ver médicos
      userRole: role,
      colaboradores,
      consultores,
      stats: {
        medicos: colaboradores.length + consultores.length, // Apenas dos listados/totais
        membros: {
          total: totalMembros,
          colih: membrosCOLIH,
          gvt: membrosGVT,
        },
      },
    };
  } catch (error) {
    console.error("Erro no dashboard:", error);
    return {
      allowed: false,
      userRole: role,
      colaboradores: [],
      consultores: [],
      stats: null,
    };
  }
}

// =========================================================
// 2. AÇÕES DE MÉDICOS (CUD)
// =========================================================

export async function createDoctor(prevState: State, formData: FormData) {
  // 1. Segurança: Verificar Sessão
  const session = await auth();
  if (!session?.user?.id || session.user.role === "GVT") {
    return {
      message: "Permissão negada. Apenas membros COLIH podem cadastrar.",
    };
  }

  const rawFormData = Object.fromEntries(formData.entries());

  // Tratamento dos Checkboxes (HTML envia "on" ou nada)
  const dataToValidate = {
    ...rawFormData,
    acceptsAdult: rawFormData.acceptsAdult === "on",
    acceptsChild: rawFormData.acceptsChild === "on",
    acceptsNewborn: rawFormData.acceptsNewborn === "on",
  };

  // 2. Validação com Zod
  const validatedFields = doctorSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Faltam campos obrigatórios. Verifique o formulário.",
    };
  }

  try {
    const { type, ...rest } = validatedFields.data;

    // 3. Inserção no Banco (Incluindo createdById)
    await prisma.doctor.create({
      data: {
        ...rest,
        type: type as DoctorType,
        createdById: session.user.id,
      },
    });
  } catch (error) {
    console.error(error);
    return {
      message: "Erro no Banco de Dados: Falha ao criar médico.",
    };
  }

  revalidatePath("/");
  revalidatePath("/medicos");
  redirect("/medicos");
}

export async function updateDoctor(
  id: string,
  prevState: State,
  formData: FormData
) {
  // Segurança
  const session = await auth();
  if (!session?.user || session.user.role === "GVT") {
    return { message: "Acesso negado." };
  }

  const rawFormData = Object.fromEntries(formData.entries());

  const dataToValidate = {
    ...rawFormData,
    acceptsAdult: rawFormData.acceptsAdult === "on",
    acceptsChild: rawFormData.acceptsChild === "on",
    acceptsNewborn: rawFormData.acceptsNewborn === "on",
  };

  const validatedFields = doctorSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Erro na validação dos campos.",
    };
  }

  try {
    const { type, ...rest } = validatedFields.data;

    // Convertemos para o tipo correto do Prisma
    const dataUpdate: Prisma.DoctorUpdateInput = {
      ...rest,
      type: type as DoctorType,
    };

    await prisma.doctor.update({
      where: { id },
      data: dataUpdate,
    });
  } catch (error) {
    return { message: "Erro ao atualizar médico." };
  }

  revalidatePath("/");
  revalidatePath("/medicos");
  redirect("/medicos");
}

export async function deleteDoctor(id: string) {
  const session = await auth();
  // Proteção extra para delete
  if (!session?.user || session.user.role === "GVT") {
    return { success: false, error: "Acesso negado" };
  }
  try {
    await prisma.doctor.delete({
      where: { id },
    });
  } catch (error) {
    return { success: false, error: "Erro ao excluir." };
  }
  revalidatePath("/medicos");
  revalidatePath("/");
}

// =========================================================
// 3. AÇÕES DE LOGIN E USUÁRIOS
// =========================================================

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
        role: "GVT",
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
