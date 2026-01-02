import Link from "next/link";

interface FABProps {
  href: string;
  label?: string; 
}

export default function FAB({ href, label = "Novo" }: FABProps) {
  return (
    <Link
      href={href}
      title={label}
      className="fixed bottom-6 right-6 z-50 md:hidden bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-transform active:scale-95 flex items-center justify-center"
    >
      {/* Ícone de + Grande */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 4.5v15m7.5-7.5h-15"
        />
      </svg>
    </Link>
  );
}
