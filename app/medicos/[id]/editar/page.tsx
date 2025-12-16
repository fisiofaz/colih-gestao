// app/medicos/[id]/editar/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation"; 
import { auth } from "@/auth"; 
import Link from "next/link";
import DoctorForm from "@/app/components/doctors/DoctorForm";

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

  // Se for GVP, não pode editar médico (manda pra home)
  if (session.user?.role === "GVP") {
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
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/medicos"
            className="text-slate-500 hover:text-blue-600 text-sm"
          >
            ← Voltar
          </Link>
        </div>        
        <DoctorForm doctor={doctor} />
      </div>
    </div>
  );
}
