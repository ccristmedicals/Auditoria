import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import PrivateRoute from "../components/PrivateRoute";
import MainLayout from "../components/layout/MainLayout";
import GestionUsuarios from "../pages/GestionUsuarios";
import BaseDatosBitrix from "../pages/BaseDatosBitrix";
import RegisterPage from "../pages/RegisterPage";
import AuditoriaGeo from "../pages/AuditoriaGeo";

const AppRoutes = () => {
    return (
        <Routes>
            {/* Rutas Públicas */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Rutas Protegidas dentro del MainLayout */}
            <Route
                element={
                    <PrivateRoute>
                        <MainLayout />
                    </PrivateRoute>
                }
            >
                <Route path="/gestion-usuarios" element={<GestionUsuarios />} />
                <Route path="/base-datos-bitrix" element={<BaseDatosBitrix />} />
                <Route path="/base-datos-profit" element={<AuditoriaGeo />} />
            </Route>

            {/* Ruta para manejar páginas no encontradas */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default AppRoutes;
