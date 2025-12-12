import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/apiService";

export const useAuth = () => {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const login = async (username, password) => {
        try {
            setLoading(true);
            setError("");

            const data = await apiService.login({ usuario: username, contraseña: password });

            // Store token and user data
            // Adjust based on actual API response structure
            if (data.token) {
                localStorage.setItem("authToken", data.token);
            }
            if (data.user) {
                localStorage.setItem("user", JSON.stringify(data.user));
            }

            navigate("/ventas"); // Or wherever the user should go
            return data;
        } catch (err) {
            setError(err.message || "Error al iniciar sesión");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return { login, logout, loading, error };
};
