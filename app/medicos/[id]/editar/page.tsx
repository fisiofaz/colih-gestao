// app/medicos/[id]/editar/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditDoctorForm from "./edit-form";

interface PageProps {
  // MUDANÇA 1: No Next.js 15, params é uma Promise
  params: Promise<{
    id: string;
  }>;
}

export default async function EditarMedicoPage({ params }: PageProps) {
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">
            Editar: {doctor.firstName} {doctor.lastName}
          </h1>
        </div>

        <EditDoctorForm doctor={doctor} />
      </div>
    </div>
  );
}
