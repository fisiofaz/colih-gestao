"use server"; 

import { prisma } from "@/lib/prisma";
import { doctorSchema, DoctorFormData } from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";


export async function createDoctor(data: DoctorFormData) {
  // 1. Validar os dados de novo (segurança extra contra hackers)
  const result = doctorSchema.safeParse(data);

  if (!result.success) {
    return { success: false, error: "Dados inválidos enviadas." };
  }

  // 2. Salvar no Banco
  
  const adminUser = await prisma.user.findFirst();

  if (!adminUser) {
    return {
      success: false,
      error: "Nenhum usuário admin encontrado para vincular.",
    };
  }

  try {
    await prisma.doctor.create({
      data: {
        ...result.data, // Espalha todos os campos (firstName, lastName, etc)
        createdById: adminUser.id, // Vincula quem criou
      },
    });
  } catch (error) {
    console.error("Erro ao salvar:", error);
    return { success: false, error: "Erro de banco de dados." };
  }

  // 3. Atualizar a lista e Redirecionar
  revalidatePath("/medicos"); // Avisa a lista para recarregar os dados
  redirect("/medicos"); // Manda o usuário de volta para a lista
}

export async function updateDoctor(id: string, data: DoctorFormData) {
  const result = doctorSchema.safeParse(data);

  if (!result.success) {
    return { success: false, error: "Dados inválidos." };
  }

  try {
    await prisma.doctor.update({
      where: { id }, // AQUI ESTÁ O SEGREDO: Busca pelo ID
      data: result.data, // Atualiza com os novos dados
    });
  } catch (error) {
    console.error("Erro ao atualizar:", error);
    return { success: false, error: "Erro ao atualizar no banco." };
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

  // Atualiza a lista para o médico sumir da tela imediatamente
  revalidatePath("/medicos");
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    // Tenta fazer o login usando o provider 'credentials'
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
    // O NextAuth lança um erro para redirecionar, precisamos deixar passar
    throw error;
  }
}

export async function handleLogout() {
  await signOut({ redirectTo: "/login" });
}