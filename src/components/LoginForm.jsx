import { Eye, EyeOff, Lock, UserLock } from "lucide-react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const LoginForm = () => {
    const navigate = useNavigate();
    // Desestructuramos login, loading y error del hook
    const { login, loading, error } = useAuth();
    const [credentials, setCredentials] = useState({});
    const [passwordVisible, setPasswordVisible] = useState(false);

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // 1. Intentamos hacer login
            await login(credentials.username, credentials.password);

            // 2. Si el login es exitoso (no lanza error), navegamos a la ruta deseada
            navigate('/gestion-usuarios');

        } catch (err) {
            // Si el login falla, el catch captura el error y NO navega
            console.error("Login failed:", err);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="dark:bg-[#1b1b1b] p-8 rounded-lg shadow-xl max-w-sm w-full mx-auto my- border border-white/10"
        >
            <h2 className="text-3xl font-bold text-center dark:text-white text-[#191919] mb-6">
                Ingresar al Sistema de Auditoria
            </h2>

            {/* Campo de Usuario */}
            <div className="mb-6">
                <label
                    htmlFor="username"
                    className="block text-[#262626] dark:text-white text-left text-sm font-semibold mb-2"
                >
                    Usuario:
                </label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        <UserLock color="#1a9888" size={20} />
                    </span>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={credentials.username}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 text-[#262626] dark:text-white focus:ring-green-500 transition-all duration-200 bg-white dark:bg-[#2b2b2b] border-gray-300 dark:border-gray-600"
                        required
                        disabled={loading}
                    />
                </div>
            </div>

            {/* Campo de Contraseña */}
            <div className="mb-8">
                <label
                    htmlFor="password"
                    className="block text-[#262626] dark:text-white text-left text-sm font-semibold mb-2"
                >
                    Contraseña:
                </label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        <Lock color="#1a9888" size={20} />
                    </span>
                    <input
                        type={passwordVisible ? "text" : "password"}
                        id="password"
                        name="password"
                        value={credentials.password}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 text-[#262626] dark:text-white focus:ring-green-500 transition-all duration-200 bg-white dark:bg-[#2b2b2b] border-gray-300 dark:border-gray-600"
                        required
                        disabled={loading}
                    />
                    <button
                        type="button"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-green-600 cursor-pointer"
                    >
                        {passwordVisible ? (
                            <Eye color="#1a9888" size={20} />
                        ) : (
                            <EyeOff color="#1a9888" size={20} />
                        )}
                    </button>
                </div>
            </div>

            {/* Mensaje de Error */}
            {error && (
                <div
                    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800"
                    role="alert"
                >
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {/* Botón de Submit */}
            <button
                type="submit"
                className="w-full bg-[#1a9888] hover:bg-[#056356] text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-200 transform hover:scale-105 disabled:bg-gray-400 disabled:transform-none dark:bg-green-600 dark:text-white dark:border-green-600 dark:hover:bg-green-700"
                disabled={loading}
            >
                {loading ? "Ingresando..." : "Ingresar"}
            </button>
            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    ¿No tienes una cuenta?{" "}
                    <Link
                        to="/register"
                        className="font-bold text-[#1a9888] hover:text-[#056356] dark:text-green-500 dark:hover:text-green-400 transition-colors"
                    >
                        Regístrate aquí
                    </Link>
                </p>
            </div>
        </form>
    );
};

export default LoginForm;