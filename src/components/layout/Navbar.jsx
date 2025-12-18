import { CircleUserRound, LogOut } from "lucide-react";
import Logo from "../../assets/Logo.png";

export default function Navbar({
  nombreNegocio = "CristMedicals Auditoria",
  user = user.usuario,
  onLogout = () => { },
}) {
  return (
    <header className="bg-white dark:bg-[#191919] shadow-xl py-2 px-6 sm:px-8 flex items-center justify-between border-b border-gray-200 dark:border-[#464646] sticky top-0 z-50 rounded-b-xl">
      <div className="flex-1 min-w-[50px]"></div>

      <div className="flex items-center gap-3 flex-grow justify-center">
        <img src={Logo} alt="CristMedical Logo" className="h-12" />
        <h1 className="text-xl md:text-2xl font-extrabold text-[#1a9888] dark:text-teal-400">
          {nombreNegocio}
        </h1>
      </div>

      {user ? (
        <div className="flex items-center gap-4 sm:gap-6 flex-1 justify-end">
          <div className="flex items-center gap-2 bg-teal-50 dark:bg-teal-200 p-3 rounded-full shadow-inner">
            <CircleUserRound className="text-[#1a9888] text-xl sm:text-2xl" />
            <span className="text-[#191919] font-semibold text-xs sm:text-base">
              {user?.nombre || user?.usuario || "Usuario"}
            </span>
          </div>

          <button
            onClick={onLogout}
            title="Cerrar sesión"
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 ease-in-out transform hover:scale-105 flex items-center gap-2 font-bold text-xs sm:text-sm shadow-md whitespace-nowrap"
            aria-label="Cerrar sesión"
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>
      ) : (
        <span className="text-gray-400 italic text-xs sm:text-sm flex-1 text-right">
          No autenticado
        </span>
      )}
    </header>
  );
}
