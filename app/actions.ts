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
import { logAudit } from "@/lib/logger";
import { put, del } from "@vercel/blob";
import { hash } from "bcryptjs";
import { Resend } from "resend";
import WelcomeEmail from "@/app/components/emails/welcome-email";

const resend = new Resend(process.env.RESEND_API_KEY);

// --- TIPO GLOBAL PARA O ESTADO DOS FORMULÁRIOS (LEGADO PARA OUTRAS PÁGINAS) ---
export type State = {
  errors?: {
    [key: string]: string[];
  };
  message?: string | null;
} | null;

// --- SCHEMAS DE VALIDAÇÃO (ZOD) ---
const CreateUserSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 letras"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  role: z.enum(["COLIH", "GVP"]),
});

const ChangePasswordSchema = z
  .object({
    password: z.string().min(6, "A nova senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
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
  const isGVP = role === "GVP";

  try {
    const [colaboradores, consultores, totalMembros, membrosCOLIH, membrosGVP] =
      await Promise.all([
        !isGVP
          ? prisma.doctor.findMany({
              where: { type: "COOPERATING" },
              orderBy: { firstName: "asc" },
              take: 5,
            })
          : Promise.resolve([]),

        !isGVP
          ? prisma.doctor.findMany({
              where: { type: "CONSULTANT" },
              orderBy: { firstName: "asc" },
              take: 5,
            })
          : Promise.resolve([]),

        prisma.user.count(),
        prisma.user.count({ where: { role: UserRole.COLIH } }),
        prisma.user.count({ where: { role: UserRole.GVP } }),
      ]);

    return {
      allowed: !isGVP,
      userRole: role,
      colaboradores,
      consultores,
      stats: {
        medicos: colaboradores.length + consultores.length,
        membros: {
          total: totalMembros,
          colih: membrosCOLIH,
          GVP: membrosGVP,
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

// Agora aceita apenas formData (sem prevState) para funcionar com o novo formulário
export async function createDoctor(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role === "GVP") {
    return { success: false, message: "Permissão negada." };
  }

  const rawFormData = Object.fromEntries(formData.entries());

  const dataToValidate = {
    ...rawFormData,
    // Converte os checkboxes para booleanos
    acceptsAdult: rawFormData.acceptsAdult === "on",
    acceptsChild: rawFormData.acceptsChild === "on",
    acceptsNewborn: rawFormData.acceptsNewborn === "on",
    isSus: rawFormData.isSus === "on",
    hasHealthPlan: rawFormData.hasHealthPlan === "on",
    // O campo phoneHome virá automaticamente dentro de rawFormData se o input tiver name="phoneHome"
  };

  const validatedFields = doctorSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    // Pega a primeira mensagem de erro para simplificar o feedback
    const firstError = Object.values(
      validatedFields.error.flatten().fieldErrors
    )[0]?.[0];
    return {
      success: false,
      message: firstError || "Erro de validação nos campos.",
    };
  }

  try {
    const { type, ...rest } = validatedFields.data;

    await prisma.doctor.create({
      data: {
        ...rest,
        type: type as DoctorType,
        createdById: session.user.id,
      },
    });

    await logAudit(
      "CREATE",
      "DOCTOR",
      `Criou médico: ${rest.firstName} ${rest.lastName} (${rest.specialty1})`
    );

    revalidatePath("/medicos");
    // Não usamos redirect aqui, o Client Component fará isso ao receber success: true
    return { success: true, message: "Médico criado com sucesso!" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Erro ao salvar no banco de dados." };
  }
}

// Atualizado para receber apenas (id, formData) - Resolve o erro "3 arguments expected"
export async function updateDoctor(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role === "GVP") {
    return { success: false, message: "Acesso negado." };
  }

  const rawFormData = Object.fromEntries(formData.entries());

  const dataToValidate = {
    ...rawFormData,
    acceptsAdult: rawFormData.acceptsAdult === "on",
    acceptsChild: rawFormData.acceptsChild === "on",
    acceptsNewborn: rawFormData.acceptsNewborn === "on",
    isSus: rawFormData.isSus === "on",
    hasHealthPlan: rawFormData.hasHealthPlan === "on",
  };

  const validatedFields = doctorSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    const firstError = Object.values(
      validatedFields.error.flatten().fieldErrors
    )[0]?.[0];
    return {
      success: false,
      message: firstError || "Erro na validação dos campos.",
    };
  }

  try {
    const { type, ...rest } = validatedFields.data;

    await prisma.doctor.update({
      where: { id },
      data: {
        ...rest,
        type: type as DoctorType,
      },
    });

    await logAudit(
      "UPDATE",
      "DOCTOR",
      `Editou médico ID: ${id} - Nome: ${rest.firstName} ${rest.lastName}`
    );

    revalidatePath("/medicos");
    return { success: true, message: "Médico atualizado com sucesso!" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Erro ao atualizar médico." };
  }
}

export async function deleteDoctor(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role === "GVP") {
    return { success: false, error: "Acesso negado" };
  }
  try {
    await prisma.doctor.delete({
      where: { id },
    });

    await logAudit("DELETE", "DOCTOR", `Excluiu médico ID: ${id}`);

    revalidatePath("/medicos");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro ao excluir." };
  }
}

// =========================================================
// 3. AÇÕES DE USUÁRIOS (CRUD)
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
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { message: "Você não tem permissão para criar novos usuários." };
  }
  const validatedFields = CreateUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Erro na validação dos campos.",
    };
  }

  const { name, email, password, role } = validatedFields.data;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Cria o usuário no Banco
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        mustChangePassword: true,
        role: role as UserRole,
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

  redirect("/");
}

export async function deleteUser(userId: string) {
  const session = await auth();
  
  // 1. Verifica permissão
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, message: "Permissão negada." };
  }

  // 2. Impede auto-exclusão
  if (session.user.id === userId) {
    return { success: false, message: "Você não pode excluir sua própria conta." };
  }

  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath("/membros");
    return { success: true, message: "Usuário excluído com sucesso." };
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    return { success: false, message: "Erro ao excluir usuário." };
  }
}

// =========================================================
// 4. UPLOAD DE ARQUIVOS (VERCEL BLOB)
// =========================================================

export async function uploadDocument(doctorId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role === "GVP") {
    return { message: "Permissão negada." };
  }

  const file = formData.get("file") as File;

  if (!file || file.size === 0) {
    return { message: "Nenhum arquivo selecionado." };
  }

  if (file.size > 4 * 1024 * 1024) {
    return { message: "Arquivo muito grande. Máximo 4MB." };
  }

  try {
    const blob = await put(file.name, file, {
      access: "public",
    });

    await prisma.document.create({
      data: {
        url: blob.url,
        filename: file.name,
        doctorId: doctorId,
      },
    });

    await logAudit(
      "CREATE",
      "DOCTOR",
      `Anexou arquivo: ${file.name} ao médico ID: ${doctorId}`
    );
  } catch (error) {
    console.error(error);
    return { message: "Erro ao fazer upload." };
  }

  revalidatePath(`/medicos/${doctorId}/editar`);
}

export async function deleteDocument(
  documentId: string,
  doctorId: string,
  fileUrl: string
) {
  const session = await auth();
  if (!session?.user || session.user.role === "GVP") return;

  try {
    await prisma.document.delete({ where: { id: documentId } });
    await del(fileUrl);
    await logAudit("DELETE", "DOCTOR", `Removeu arquivo ID: ${documentId}`);
  } catch (error) {
    console.error("Erro ao deletar arquivo", error);
  }

  revalidatePath(`/medicos/${doctorId}/editar`);
}

// =========================================================
// 5. AGENDA DE VISITAS
// =========================================================

export async function createVisit(doctorId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role === "GVP")
    return { message: "Sem permissão" };

  const dateString = formData.get("date") as string;
  const notes = formData.get("notes") as string;

  if (!dateString) return { message: "Data é obrigatória" };

  try {
    await prisma.visit.create({
      data: {
        date: new Date(dateString),
        notes,
        doctorId,
        status: "PENDING",
      },
    });

    await logAudit(
      "CREATE",
      "DOCTOR",
      `Agendou visita para ${new Date(
        dateString
      ).toLocaleDateString()} (Doc ID: ${doctorId})`
    );
  } catch (error) {
    return { message: "Erro ao agendar visita." };
  }

  revalidatePath(`/medicos/${doctorId}/editar`);
}

export async function toggleVisitStatus(
  visitId: string,
  currentStatus: string,
  doctorId: string
) {
  const session = await auth();
  if (!session?.user || session.user.role === "GVP") return;

  const newStatus = currentStatus === "PENDING" ? "DONE" : "PENDING";

  try {
    await prisma.visit.update({
      where: { id: visitId },
      data: { status: newStatus },
    });
  } catch (error) {
    console.error("Erro ao atualizar status", error);
  }

  revalidatePath(`/medicos/${doctorId}/editar`);
}

export async function deleteVisit(visitId: string, doctorId: string) {
  const session = await auth();
  if (!session?.user || session.user.role === "GVP") return;

  try {
    await prisma.visit.delete({ where: { id: visitId } });
    await logAudit("DELETE", "DOCTOR", `Cancelou visita ID: ${visitId}`);
  } catch (error) {
    console.error("Erro ao excluir visita", error);
  }

  revalidatePath(`/medicos/${doctorId}/editar`);
}

export async function updateUser(id: string, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { success: false, message: "Não autorizado" };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as UserRole;
  const password = formData.get("password") as string;

  const dataToUpdate: Prisma.UserUpdateInput = {
    name,
    email,
    role,
  };

  if (password && password.trim() !== "") {
    if (password.length < 6) {
      return {
        success: false,
        message: "A senha deve ter no mínimo 6 caracteres.",
      };
    }
    dataToUpdate.password = await hash(password, 12);
  }

  try {
    await prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    revalidatePath("/membros");
    return { success: true, message: "Membro atualizado com sucesso!" };
  } catch (error) {
    console.error("Erro ao atualizar membro:", error);
    return { success: false, message: "Erro ao atualizar membro." };
  }
}
