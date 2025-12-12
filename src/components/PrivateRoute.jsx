import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
    // 1. Verificamos directamente si existe el token o el usuario en localStorage
    // (Igual que hicimos en el MainLayout)
    const isAuthenticated = localStorage.getItem("authToken"); // O "user", según prefieras validar

    // 2. Si no hay token, lo mandamos al login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // 3. Si hay token, renderizamos el hijo (que en tu caso es <MainLayout />)
    return children;
};

export default PrivateRoute;