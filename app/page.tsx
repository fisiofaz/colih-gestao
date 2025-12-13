import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* Logotipo / Título */}
      <div className="text-center mb-10">
        <div className="text-6xl mb-4">🏥</div>
        <h1 className="text-4xl font-bold text-blue-900 tracking-tight">
          COLIH Gestão
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          Sistema de Apoio à Comissão de Ligação com Hospitais
        </p>
      </div>

      {/* Grid de Opções (Menu) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        {/* Cartão: Médicos */}
        <Link
          href="/medicos"
          className="group bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all flex flex-col items-center text-center cursor-pointer"
        >
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
            👨‍⚕️
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Médicos</h2>
          <p className="text-slate-500 text-sm">
            Cadastrar, listar e gerenciar médicos cooperadores e consultores.
          </p>
        </Link>

        {/* Cartão: Membros (Ainda não criamos, mas já deixamos o espaço) */}
        <div className="bg-slate-100 p-8 rounded-2xl border border-slate-200 flex flex-col items-center text-center opacity-70 cursor-not-allowed relative">
          <div className="absolute top-4 right-4 bg-slate-200 text-slate-500 text-xs px-2 py-1 rounded">
            Em breve
          </div>
          <div className="w-16 h-16 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center text-3xl mb-4">
            busts_in_silhouette
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Membros</h2>
          <p className="text-slate-500 text-sm">
            Gerenciar usuários do sistema e membros da comissão.
          </p>
        </div>
      </div>

      <footer className="mt-16 text-slate-400 text-sm">
        © 2025 COLIH Centro Oeste Gaúcha
      </footer>
    </main>
  );
}
