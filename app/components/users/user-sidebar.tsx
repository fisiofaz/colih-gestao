"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

interface UserSidebarProps {
  counts: {
    COLIH: number;
    GVP: number;
    ADMIN: number;
    total: number;
  };
}

export default function UserSidebar({ counts }: UserSidebarProps) {
  const searchParams = useSearchParams();
  const currentRole = searchParams.get("role");
  const [isOpen, setIsOpen] = useState(false);

  // Função para manter a busca (query) ao trocar de filtro
  const createQueryString = (name: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    params.set("page", "1");
    return params.toString();
  };

  const menuItems = [
    { 
      label: "Todos", 
      role: null, 
      count: counts.total, 
      icon: "👥" 
    },
    { 
      label: "COLIH", 
      role: "COLIH", 
      count: counts.COLIH, 
      icon: "👔" 
    },
    { 
      label: "GVP", 
      role: "GVP", 
      count: counts.GVP, 
      icon: "🏥" 
    },
    {
      label: "Administradores",
      role: "ADMIN",
      count: counts.ADMIN,
      icon: "⚙️",
    },
    {
      label: "Administradores",
      role: "ADMIN",
      count: counts.ADMIN,
      icon: "⚙️",
    },
  ];

  return (
    <aside className="w-full md:w-64 flex-shrink-0 mb-8 md:mb-0 md:mr-8">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden sticky top-4">
        {/* HEADER CLICÁVEL NO MOBILE */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex justify-between items-center p-4 bg-slate-50 border-b border-slate-100 md:cursor-default"
        >
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
            Grupos
          </h3>
          <span className="md:hidden text-slate-500">{isOpen ? "▲" : "▼"}</span>
        </button>

        <div
          className={`${isOpen ? "block" : "hidden"} md:block p-2 space-y-1`}
        >
          {menuItems.map((item) => {
            const isActive = currentRole === item.role;
            return (
              <Link
                key={item.label}
                href={`/membros?${createQueryString("role", item.role)}`}
                onClick={() => setIsOpen(false)}
                className={`flex justify-between items-center px-3 py-2 text-sm rounded-lg transition-colors group
                  ${
                    isActive
                      ? "bg-blue-50 text-blue-700 font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full 
                  ${
                    isActive
                      ? "bg-blue-200 text-blue-800"
                      : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                  }`}
                >
                  {item.count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
