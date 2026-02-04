/* eslint-disable react-hooks/set-state-in-effect */
import {
  Database,
  DatabaseZap,
  Moon,
  Sun,
  User,
  Container,
  Menu,
  X as XIcon,
  ArrowUpDown,
  Users,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";

export default function Sidebar() {
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const modoOscuro = localStorage.getItem("modoOscuro") === "true";
    setIsDark(modoOscuro);
    document.documentElement.classList.toggle("dark", modoOscuro);

    // Recuperar estado colapsado
    const collapsed = localStorage.getItem("sidebarCollapsed") === "true";
    setIsCollapsed(collapsed);
  }, []);

  const toggleDarkMode = () => {
    const nuevoEstado = !isDark;
    setIsDark(nuevoEstado);
    document.documentElement.classList.toggle("dark", nuevoEstado);
    localStorage.setItem("modoOscuro", nuevoEstado ? "true" : "false");
  };

  const toggleSidebar = () => {
    const nuevoEstado = !isCollapsed;
    setIsCollapsed(nuevoEstado);
    localStorage.setItem("sidebarCollapsed", nuevoEstado ? "true" : "false");
  };

  const { user } = useAuth();

  const links = [
    {
      to: "/gestion-usuarios",
      label: "Gestion de Usuarios",
      icon: <User />,
      permission: (p) => p?.editar_usuarios || p?.acceso_total,
    },
    {
      to: "/base-datos-bitrix",
      label: "Planificación",
      icon: <Database />,
      permission: (p) =>
        (p?.ver_dashboard && !p?.gestion_matrix) ||
        p?.acceso_total ||
        p?.editar_usuarios,
    },
    {
      to: "/planificaciones",
      label: "Planificaciones",
      icon: <Database />,
      permission: (p, role) => {
        const r = role?.toLowerCase().trim();
        return (
          p?.gestion_matrix ||
          p?.acceso_total ||
          p?.editar_usuarios ||
          r === "auditor" ||
          r === "administrador"
        );
      },
    },
    {
      to: "/base-datos-profit",
      label: "Comparativa Profit-Bitrix",
      icon: <DatabaseZap />,
      permission: (p) =>
        p?.gestion_matrix || p?.acceso_total || p?.editar_usuarios,
    },
    {
      to: "/matriz",
      label: "Matriz",
      icon: <Container />,
      permission: (p) =>
        p?.gestion_matrix || p?.acceso_total || p?.editar_usuarios,
    },
    // {
    //   to: "/rendimiento",
    //   label: "Rendimiento",
    //   icon: <ArrowUpDown />,
    //   permission: (p) =>
    //     p?.gestion_matrix || p?.acceso_total || p?.editar_usuarios,
    // },
    // {
    //   to: "/vendedores",
    //   label: "Vendedores",
    //   icon: <Users />,
    //   permission: (p) =>
    //     p?.gestion_matrix || p?.acceso_total || p?.editar_usuarios,
    // },
  ];

  const filteredLinks = links.filter((link) => {
    if (!link.permission) return true;
    return link.permission(user?.permisos, user?.role);
  });

  return (
    <aside
      className={`${isCollapsed ? "w-20" : "w-52"} min-h-screen bg-linear-to-b from-[#1a9888] to-[#023831] text-white py-6 px-4 shadow-sm sticky top-0 transition-all duration-300 flex flex-col overflow-hidden`}
    >
      <div className="flex items-center justify-between mb-8 px-2">
        {!isCollapsed && (
          <div className="text-2xl font-bold tracking-wide">Menú</div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none"
          title={isCollapsed ? "Expandir" : "Contraer"}
        >
          {isCollapsed ? <Menu size={24} /> : <XIcon size={24} />}
        </button>
      </div>

      <nav className="flex flex-col gap-2 flex-1 overflow-y-auto pr-1 sidebar-nav custom-scrollbar">
        {filteredLinks.map(({ to, label, icon }, index) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={`${to}-${index}`}
              to={to}
              className={`flex items-center rounded-lg transition-all duration-300 group ${isCollapsed ? "justify-center py-3 px-0" : "space-x-3 py-3 px-3"} ${isActive
                ? "bg-white/15 text-white font-bold border-l-4 border-teal-400 shadow-lg shadow-teal-900/20"
                : "text-teal-100/70 hover:bg-white/10 hover:text-white border-l-4 border-transparent font-medium"
                }`}
              title={isCollapsed ? label : ""}
            >
              <span
                className={`text-xl transition-all duration-300 ${isActive ? "scale-110 text-teal-400" : "group-hover:scale-110 group-hover:text-teal-300"}`}
              >
                {icon}
              </span>
              {!isCollapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Botón modo oscuro */}
      <div className="mt-auto pt-6 border-t border-white/10">
        <button
          onClick={toggleDarkMode}
          className={`w-full flex items-center transition-all duration-300 bg-white/5 hover:bg-white/10 text-white rounded-xl p-3 ${isCollapsed ? "justify-center" : "justify-between"} border border-white/5`}
          title={isCollapsed ? (isDark ? "Modo Claro" : "Modo Oscuro") : ""}
        >
          {!isCollapsed && (
            <span className="text-sm font-semibold tracking-wide">
              {isDark ? "MODO CLARO" : "MODO OSCURO"}
            </span>
          )}
          <span className="text-xl">
            {isDark ? (
              <Sun size={isCollapsed ? 24 : 20} className="text-amber-400" />
            ) : (
              <Moon size={isCollapsed ? 24 : 20} className="text-blue-300" />
            )}
          </span>
        </button>
      </div>
    </aside>
  );
}
