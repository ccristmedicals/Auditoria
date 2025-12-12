import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiService } from "../services/apiService";
import {
    User,
    Lock,
    Briefcase,
    Shield,
    Check,
    ChevronDown,
    X
} from "lucide-react";

const RegisterForm = () => {
    const navigate = useNavigate();

    // Estado para el dropdown personalizado de segmentos
    const [isSegmentMenuOpen, setIsSegmentMenuOpen] = useState(false);
    const segmentRef = useRef(null);

    // Estado de segmentos disponibles
    const [availableSegmentos, setAvailableSegmentos] = useState([]);
    const [loadingSegmentos, setLoadingSegmentos] = useState(true);

    // Estado del formulario
    const [formData, setFormData] = useState({
        usuario: "",
        contraseña: "",
        segmentos: [],
        status: 1, // Por defecto 1 (True/Activo)
        role: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Cargar segmentos al montar
    useEffect(() => {
        const fetchSegmentos = async () => {
            try {
                const data = await apiService.getSegmentos();
                setAvailableSegmentos(Array.isArray(data) ? data : data.data || []);
            } catch (err) {
                console.error("Error loading segments:", err);
                setError("Error al cargar los segmentos disponibles.");
            } finally {
                setLoadingSegmentos(false);
            }
        };

        fetchSegmentos();

        // Cerrar menú de segmentos si clickean fuera
        const handleClickOutside = (event) => {
            if (segmentRef.current && !segmentRef.current.contains(event.target)) {
                setIsSegmentMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Manejador general de inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Manejador del Multi-Select de Segmentos (Custom)
    const toggleSegment = (segmentValue) => {
        setFormData(prev => {
            const exists = prev.segmentos.includes(segmentValue);
            let newSegmentos;
            if (exists) {
                newSegmentos = prev.segmentos.filter(s => s !== segmentValue);
            } else {
                newSegmentos = [...prev.segmentos, segmentValue];
            }
            return { ...prev, segmentos: newSegmentos };
        });
    };

    // Roles
    const rolesOptions = [
        { value: "ejecutiva", label: "Ejecutiva (Ver Rutas Asignadas)" },
        { value: "vendedor", label: "Vendedor (Ver Solo Segmentos Asignados)" },
        { value: "auditor", label: "Auditor (Ver Rutas/Matrix - No Crear Usuario)" },
        { value: "administrador", label: "Administrador (Acceso Total y Modificaciones)" },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        // 1. Mapeo de Roles a Permisos (Para que el backend sepa qué puede hacer el usuario)
        const permisosMap = {
            "ejecutiva": {
                ver_dashboard: true,
                ver_rutas: true,
                editar_usuarios: false
            },
            "vendedor": {
                ver_dashboard: true,
                ver_segmentos_asignados: true,
                editar_usuarios: false
            },
            "auditor": {
                ver_dashboard: true,
                ver_rutas: true,
                gestion_matrix: true,
                crear_usuario: false
            },
            "administrador": {
                ver_dashboard: true,
                editar_usuarios: true,
                acceso_total: true
            }
        };

        // 2. Preparar Payload (Forzamos status: 1)
        const payload = {
            usuario: formData.usuario,
            contraseña: formData.contraseña,
            segmentos: formData.segmentos,
            status: 1, // SIEMPRE enviamos 1
            permisos: permisosMap[formData.role] || {} // Enviamos el objeto de permisos
        };

        try {
            await apiService.registerUser(payload);
            setSuccess(true);
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err) {
            setError(err.message || "Error al registrar el usuario.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="dark:bg-[#1b1b1b] p-8 rounded-lg shadow-xl max-w-lg w-full mx-auto my-10 border border-white/10"
        >
            <h2 className="text-3xl font-bold text-center dark:text-white text-[#191919] mb-6">
                Registrar Nuevo Usuario
            </h2>

            {/* --- Usuario --- */}
            <div className="mb-6">
                <label className="block text-[#262626] dark:text-white text-left text-sm font-semibold mb-2">
                    Usuario:
                </label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        <User color="#1a9888" size={20} />
                    </span>
                    <input
                        type="text"
                        name="usuario"
                        value={formData.usuario}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 text-[#262626] dark:text-white focus:ring-green-500 transition-all duration-200 bg-white dark:bg-[#2b2b2b] border-gray-300 dark:border-gray-600"
                        required
                    />
                </div>
            </div>

            {/* --- Contraseña --- */}
            <div className="mb-6">
                <label className="block text-[#262626] dark:text-white text-left text-sm font-semibold mb-2">
                    Contraseña:
                </label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        <Lock color="#1a9888" size={20} />
                    </span>
                    <input
                        type="password"
                        name="contraseña"
                        value={formData.contraseña}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 text-[#262626] dark:text-white focus:ring-green-500 transition-all duration-200 bg-white dark:bg-[#2b2b2b] border-gray-300 dark:border-gray-600"
                        required
                    />
                </div>
            </div>

            {/* --- Rol / Permisos --- */}
            <div className="mb-6">
                <label className="block text-[#262626] dark:text-white text-left text-sm font-semibold mb-2">
                    Rol y Permisos:
                </label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        <Shield color="#1a9888" size={20} />
                    </span>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full pl-10 pr-10 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 text-[#262626] dark:text-white focus:ring-green-500 transition-all duration-200 bg-white dark:bg-[#2b2b2b] border-gray-300 dark:border-gray-600 appearance-none cursor-pointer"
                        required
                    >
                        <option value="" disabled>Seleccione un rol...</option>
                        {rolesOptions.map((role) => (
                            <option key={role.value} value={role.value}>
                                {role.label}
                            </option>
                        ))}
                    </select>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                        <ChevronDown size={20} />
                    </span>
                </div>
            </div>

            {/* --- Segmentos --- */}
            <div className="mb-8" ref={segmentRef}>
                <label className="block text-[#262626] dark:text-white text-left text-sm font-semibold mb-2">
                    Segmentos Asignados:
                </label>

                <div className="relative">
                    <div
                        onClick={() => !loadingSegmentos && setIsSegmentMenuOpen(!isSegmentMenuOpen)}
                        className={`w-full min-h-[42px] pl-10 pr-10 py-2 border-2 rounded-lg cursor-pointer bg-white dark:bg-[#2b2b2b] border-gray-300 dark:border-gray-600 flex flex-wrap gap-2 items-center transition-all duration-200 ${isSegmentMenuOpen ? 'ring-2 ring-green-500 border-transparent' : ''}`}
                    >
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 h-full">
                            <Briefcase color="#1a9888" size={20} />
                        </span>

                        {formData.segmentos.length === 0 ? (
                            <span className="text-gray-400 select-none">
                                {loadingSegmentos ? "Cargando..." : "Seleccionar segmentos..."}
                            </span>
                        ) : (
                            formData.segmentos.map((seg, idx) => (
                                <span key={idx} className="bg-teal-100 text-teal-800 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 dark:bg-teal-900 dark:text-teal-100">
                                    {seg}
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); toggleSegment(seg); }}
                                        className="hover:text-teal-600 dark:hover:text-white"
                                    >
                                        <X size={14} />
                                    </button>
                                </span>
                            ))
                        )}

                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 h-full">
                            <ChevronDown size={20} className={`transition-transform duration-200 ${isSegmentMenuOpen ? 'rotate-180' : ''}`} />
                        </span>
                    </div>

                    {isSegmentMenuOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#2b2b2b] border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {availableSegmentos.map((seg, idx) => {
                                const val = seg.segmento || seg;
                                const isSelected = formData.segmentos.includes(val);
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => toggleSegment(val)}
                                        className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between text-[#262626] dark:text-white transition-colors"
                                    >
                                        <span>{val}</span>
                                        {isSelected && <Check size={16} className="text-[#1a9888]" />}
                                    </div>
                                );
                            })}
                            {availableSegmentos.length === 0 && (
                                <div className="px-4 py-2 text-gray-500 text-sm">No hay segmentos disponibles</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* SE ELIMINÓ EL BLOQUE DE STATUS AQUÍ */}

            {/* Mensajes de Estado */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800">
                    <span className="block sm:inline">¡Usuario registrado con éxito! Redirigiendo...</span>
                </div>
            )}

            {/* Botón Submit */}
            <button
                type="submit"
                className="w-full bg-[#1a9888] hover:bg-[#056356] text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-200 transform hover:scale-105 disabled:bg-gray-400 disabled:transform-none dark:bg-green-600 dark:hover:bg-green-700"
                disabled={loading}
            >
                {loading ? "Registrando..." : "Registrar Usuario"}
            </button>

            {/* Link para volver al Login */}
            <div className="mt-6 text-center border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    ¿Ya tienes una cuenta?{" "}
                    <Link
                        to="/login"
                        className="font-bold text-[#1a9888] hover:text-[#056356] dark:text-green-500 dark:hover:text-green-400 transition-colors"
                    >
                        Inicia sesión aquí
                    </Link>
                </p>
            </div>
        </form>
    );
};

export default RegisterForm;