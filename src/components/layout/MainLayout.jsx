import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function MainLayout() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // 1. DESCOMENTAMOS ESTO:
  // Es necesario para que, al recargar la página, el sistema recuerde al usuario
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error al leer usuario:", error);
        setUser(null);
        // Opcional: si los datos están corruptos, limpiar todo
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
      }
    } else {
      // Si no hay usuario, podrías redirigir al login opcionalmente:
      // navigate("/login");
    }
  }, []);

  const handleLogout = () => {
    // Limpiamos el almacenamiento
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");

    // Limpiamos el estado local
    setUser(null);

    // Redirigimos
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-black font-inter">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Pasamos el usuario recuperado del localStorage al Navbar */}
        <Navbar user={user} onLogout={handleLogout} />

        <main className="flex-1 min-w-0 overflow-auto">
          {/* Nota: agregué overflow-auto aquí arriba para que el scroll funcione dentro del main si el contenido es largo */}
          <div className="bg-white dark:bg-[#191919] rounded-xl shadow-lg m-4 p-6 sm:p-4 min-h-[calc(100vh-2rem)]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}