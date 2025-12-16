"use client";

import Link from "next/link";
import DoctorForm from "@/app/components/doctors/DoctorForm";

export default function NovoMedicoPage() {
  
  return (
    <div className="min-h-screen p-8 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/medicos"
            className="text-slate-500 hover:text-blue-700 flex items-center gap-1 text-sm font-medium"
          >
            ← Voltar
          </Link>
          <DoctorForm />
        </div>
      </div>
    </div>
  );
}
