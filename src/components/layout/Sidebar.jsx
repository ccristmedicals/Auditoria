/* eslint-disable react-hooks/set-state-in-effect */
import {
  Database,
  DatabaseZap,
  Moon,
  Sun,
  User,
  Container,
  TrendingUpDown,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const modoOscuro = localStorage.getItem("modoOscuro") === "true";
    setIsDark(modoOscuro);
    document.documentElement.classList.toggle("dark", modoOscuro);
  }, []);

  const toggleDarkMode = () => {
    const nuevoEstado = !isDark;
    setIsDark(nuevoEstado);
    document.documentElement.classList.toggle("dark", nuevoEstado);
    localStorage.setItem("modoOscuro", nuevoEstado ? "true" : "false");
  };

  const links = [
    { to: "/gestion-usuarios", label: "Gestion de Usuarios", icon: <User /> },
    {
      to: "/base-datos-bitrix",
      label: "Base de Datos Bitrix",
      icon: <Database />,
    },
    {
      to: "/base-datos-profit",
      label: "Base de Datos Profit",
      icon: <DatabaseZap />,
    },
    { to: "/matriz", label: "Matriz", icon: <Container /> },
    { to: "/rendimiento", label: "Rendimiento", icon: <TrendingUpDown /> },
  ];

  return (
    <aside className="w-64 min-w-[16rem] max-w-[16rem] bg-linear-to-b from-[#1a9888] to-[#023831] text-white h-screen py-6 px-4 shadow-2xl sticky top-0 transition-all duration-300 flex flex-col">
      <div className="text-2xl font-bold mb-6 tracking-wide px-3">Menú</div>
      <nav className="flex flex-col gap-2 flex-1 overflow-y-auto pr-2 sidebar-nav">
        {links.map(({ to, label, icon }, index) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={`${to}-${index}`}
              to={to}
              className={`flex space-x-3 items-center py-3 px-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? "bg-[#1a9888] text-white font-bold border-l-4 border-[#1a9888]"
                  : "text-teal-200 hover:bg-[#1a9888]/50 hover:text-white border-l-4 border-transparent font-medium"
              }`}
              title={label}
            >
              <span
                className={`text-xl ${
                  isActive
                    ? "text-white"
                    : "text-teal-200 group-hover:text-white"
                }`}
              >
                {icon}
              </span>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Botón modo oscuro (sin cambios) */}
      <div className="mt-auto pt-6 space-y-3">
        <div className="border-t border-green-300/40 dark:border-green-100/20 pt-4">
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-between px-4 py-2 bg-white/10 hover:bg-white/20 dark:bg-white/10 dark:hover:bg-white/20 text-white rounded-md transition-colors"
          >
            <span className="text-sm font-medium">
              {isDark ? "Modo Claro" : "Modo Oscuro"}
            </span>
            <span className="text-lg">{isDark ? <Sun /> : <Moon />}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
