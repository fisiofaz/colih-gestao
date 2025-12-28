import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import UserForm from "@/app/components/users/user-form"; 

interface EditUserPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  // Segurança: Só ADMIN pode entrar aqui
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  // Busca o ID da URL
  const resolvedParams = await params;
  const userId = resolvedParams.id;

  // Busca os dados do usuário no banco
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    notFound(); // Retorna 404 se o usuário não existir
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">
          Editar Membro
        </h1>

        {/* Renderiza o formulário passando os dados */}
        <UserForm user={user} />
      </div>
    </div>
  );
}
