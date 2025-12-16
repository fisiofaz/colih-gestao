// app/medicos/[id]/editar/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation"; // Adicionado redirect
import EditDoctorForm from "./edit-form"; // Certifique-se que o caminho está certo (pode ser ../edit-form dependendo da pasta)
import { auth } from "@/auth"; // Importamos a autenticação

interface PageProps {
  // MUDANÇA 1: No Next.js 15, params é uma Promise
  params: Promise<{
    id: string;
  }>;
}

export default async function EditarMedicoPage({ params }: PageProps) {
  // --- 1. SEGURANÇA ---
  const session = await auth();

  // Se não tá logado, tchau
  if (!session) redirect("/login");

  // Se for GVT, não pode editar médico (manda pra home)
  if (session.user?.role === "GVT") {
    redirect("/");
  }

  // --- 2. LÓGICA DA PÁGINA ---

  // MUDANÇA 2: Precisamos fazer o 'await' antes de usar o ID
  const { id } = await params;

  // Agora o id existe de verdade!
  const doctor = await prisma.doctor.findUnique({
    where: { id },
  });

  if (!doctor) {
    notFound();
  }

  return (
    <div className="min-h-screen p-8 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-800">
            Editar: {doctor.firstName} {doctor.lastName}
          </h1>
          <a
            href="/medicos"
            className="text-sm text-slate-500 hover:text-blue-600"
          >
            ← Voltar para lista
          </a>
        </div>

        {/* Passamos os dados para o formulário cliente */}
        <EditDoctorForm doctor={doctor} />
      </div>
    </div>
  );
}
