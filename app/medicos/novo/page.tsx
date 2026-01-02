import DoctorForm from "@/app/components/doctors/DoctorForm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function NewDoctorPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {" "}
        {/* max-w-3xl limita largura no PC, mas no mobile é 100% */}
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Novo Médico</h1>
        <DoctorForm />
      </div>
    </div>
  );
}
