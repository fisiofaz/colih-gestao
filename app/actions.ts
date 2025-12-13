"use server"; // <--- ISSO É MÁGICO. Diz que essa função roda apenas no servidor.

import { prisma } from "@/lib/prisma";
import { doctorSchema, DoctorFormData } from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createDoctor(data: DoctorFormData) {
  // 1. Validar os dados de novo (segurança extra contra hackers)
  const result = doctorSchema.safeParse(data);

  if (!result.success) {
    return { success: false, error: "Dados inválidos enviadas." };
  }

  // 2. Salvar no Banco
  // Precisamos de um ID de usuário "fake" pois ainda não temos sistema de login real.
  // Vamos pegar o primeiro usuário que acharmos no banco (o Admin que criamos no seed).
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
