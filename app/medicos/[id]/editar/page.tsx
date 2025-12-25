// app/medicos/[id]/editar/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation"; 
import { auth } from "@/auth"; 
import Link from "next/link";
import DoctorForm from "@/app/components/doctors/DoctorForm";
import DocumentManager from "@/app/components/doctors/document-manager";
import VisitManager from "@/app/components/doctors/visit-manager";

interface PageProps {
  // MUDANÇA 1: No Next.js 15, params é uma Promise
  params: Promise<{
    id: string;
  }>;
}

export default async function EditarMedicoPage({ params }: PageProps) {
  // --- SEGURANÇA ---
  const session = await auth();

  // Se não tá logado, tchau
  if (!session) redirect("/login");

  // Se for GVP, não pode editar médico (manda pra home)
  if (session.user?.role === "GVP") {
    redirect("/");
  }

  // --- LÓGICA DA PÁGINA ---
  // Precisamos fazer o 'await' antes de usar o ID
  const { id } = await params;

  // Agora o id existe de verdade!
  const doctor = await prisma.doctor.findUnique({
    where: { id },
    include: {
      documents: { orderBy: { createdAt: "desc" } },
      visits: { orderBy: { date: "asc" } },
    },
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

        {/* Formulário Principal */}
        <DoctorForm doctor={doctor} />

        {/* Área de Uploads logo abaixo do form */}
        <DocumentManager doctorId={doctor.id} documents={doctor.documents} />

        {/* Adiciona a Agenda */}
        <VisitManager doctorId={doctor.id} visits={doctor.visits} />
      </div>
    </div>
  );
}
