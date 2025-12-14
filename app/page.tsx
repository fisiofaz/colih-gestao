import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  // 1. Buscamos os totais no banco de dados
  // O Promise.all faz as duas buscas ao mesmo tempo (mais rápido)
  const [doctorCount, memberCount] = await Promise.all([
    prisma.doctor.count(),
    prisma.user.count(),
  ]);
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-slate-50 p-4">
      {/* Cabeçalho Central */}
      <header className="text-center mb-12 space-y-4">
        <div className="text-6xl mb-4">🏥</div>
        <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight">
          COLIH Gestão
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Sistema de Apoio à Comissão de Ligação com Hospitais
        </p>
      </header>

      {/* Grid de Cards */}
      <main className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        {/* Card de Médicos */}
        <section className="group bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all text-center">
          <Link href="/medicos" className="block">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-100 transition-colors">
              <span className="text-3xl">👨‍⚕️</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Médicos</h2>
            <p className="text-4xl font-extrabold text-blue-600 mb-2">
              {doctorCount}
            </p>
            <p className="text-slate-500 text-sm">
              Profissionais cadastrados na base
            </p>
          </Link>
        </section>
        {/* Card de Membros */}
        <section className="relative group bg-slate-50 p-8 rounded-2xl shadow-sm border border-slate-200 text-center opacity-75">
          {/* Badge de Em Breve */}
          <span className="absolute top-4 right-4 bg-slate-200 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">
            Em breve
          </span>
          <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">👥</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-700 mb-2">Membros</h2>
          <p className="text-4xl font-extrabold text-slate-400 mb-2">
            {memberCount}
          </p>
          <p className="text-slate-500 text-sm">Usuários do sistema</p>
        </section>
      </main>
      <footer className="mt-16 text-slate-400 text-sm">
        © {new Date().getFullYear()} COLIH Centro Oeste Gaúcha
      </footer>
    </div>
  );
}
