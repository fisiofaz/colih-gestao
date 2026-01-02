import DoctorForm from "@/app/components/doctors/DoctorForm";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";

export default async function EditDoctorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const doctor = await prisma.doctor.findUnique({
    where: { id },
  });

  if (!doctor) notFound();

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">
          Editar Médico
        </h1>
        <DoctorForm doctor={doctor} />
      </div>
    </div>
  );
}
