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
  X,
  RefreshCw,
} from "lucide-react";

const RegisterForm = () => {
  const navigate = useNavigate();
  const [isSegmentMenuOpen, setIsSegmentMenuOpen] = useState(false);
  const segmentRef = useRef(null);
  const [availableSegmentos, setAvailableSegmentos] = useState([]);
  const [loadingSegmentos, setLoadingSegmentos] = useState(true);
  const [formData, setFormData] = useState({
    usuario: "",
    contraseña: "",
    segmentos: [],
    status: 1,
    role: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
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
    const handleClickOutside = (event) => {
      if (segmentRef.current && !segmentRef.current.contains(event.target)) {
        setIsSegmentMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const toggleSegment = (segmentCode) => {
    setFormData((prev) => {
      const exists = prev.segmentos.includes(segmentCode);
      let newSegmentos;
      if (exists) {
        newSegmentos = prev.segmentos.filter((s) => s !== segmentCode);
      } else {
        newSegmentos = [...prev.segmentos, segmentCode];
      }
      return { ...prev, segmentos: newSegmentos };
    });
  };
  const rolesOptions = [
    { value: "ejecutiva", label: "Ejecutiva (Ver Rutas Asignadas)" },
    { value: "vendedor", label: "Vendedor (Ver Solo Segmentos Asignados)" },
    {
      value: "auditor",
      label: "Auditor (Ver Rutas/Matrix - No Crear Usuario)",
    },
    {
      value: "administrador",
      label: "Administrador (Acceso Total y Modificaciones)",
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    const permisosMap = {
      ejecutiva: {
        ver_dashboard: true,
        ver_rutas: true,
        editar_usuarios: false,
      },
      vendedor: {
        ver_dashboard: true,
        ver_segmentos_asignados: true,
        editar_usuarios: false,
      },
      auditor: {
        ver_dashboard: true,
        ver_rutas: true,
        gestion_matrix: true,
        crear_usuario: false,
      },
      administrador: {
        ver_dashboard: true,
        editar_usuarios: true,
        acceso_total: true,
      },
    };
    const payload = {
      usuario: formData.usuario,
      contraseña: formData.contraseña,
      segmentos: formData.segmentos,
      status: 1,
      permisos: permisosMap[formData.role] || {},
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
      className="bg-white dark:bg-[#111827] p-10 rounded-3xl shadow-2xl max-w-xl w-full mx-auto my-10 border border-gray-100 dark:border-white/5 transition-all duration-500"
    >
      <h2 className="text-3xl font-black text-center text-slate-800 dark:text-white mb-8 tracking-tight">
        Registrar <span className="text-[#1a9888] dark:text-teal-400">Nuevo Usuario</span>
      </h2>

      {/* --- Usuario --- */}
      <div className="mb-6">
        <label className="block text-slate-600 dark:text-slate-300 text-left text-sm font-bold mb-2 ml-1">
          Usuario
        </label>
        <div className="relative group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-teal-500 transition-colors">
            <User size={20} />
          </span>
          <input
            type="text"
            name="usuario"
            value={formData.usuario}
            onChange={handleChange}
            className="w-full pl-12 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all duration-300 bg-slate-50 dark:bg-[#0b1120] text-slate-800 dark:text-white placeholder-slate-400"
            placeholder="Ej: juan_perez"
            required
          />
        </div>
      </div>

      {/* --- Contraseña --- */}
      <div className="mb-6">
        <label className="block text-slate-600 dark:text-slate-300 text-left text-sm font-bold mb-2 ml-1">
          Contraseña
        </label>
        <div className="relative group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-teal-500 transition-colors">
            <Lock size={20} />
          </span>
          <input
            type="password"
            name="contraseña"
            value={formData.contraseña}
            onChange={handleChange}
            className="w-full pl-12 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all duration-300 bg-slate-50 dark:bg-[#0b1120] text-slate-800 dark:text-white placeholder-slate-400"
            placeholder="••••••••"
            required
          />
        </div>
      </div>

      {/* --- Rol / Permisos --- */}
      <div className="mb-6">
        <label className="block text-slate-600 dark:text-slate-300 text-left text-sm font-bold mb-2 ml-1">
          Rol y Permisos
        </label>
        <div className="relative group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-teal-500 transition-colors">
            <Shield size={20} />
          </span>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full pl-12 pr-10 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all duration-300 bg-slate-50 dark:bg-[#0b1120] text-slate-800 dark:text-white appearance-none cursor-pointer"
            required
          >
            <option value="" disabled>
              Seleccione un rol...
            </option>
            {rolesOptions.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
          <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
            <ChevronDown size={20} />
          </span>
        </div>
      </div>

      {/* --- Segmentos --- */}
      <div className="mb-8" ref={segmentRef}>
        <label className="block text-slate-600 dark:text-slate-300 text-left text-sm font-bold mb-2 ml-1">
          Segmentos Asignados
        </label>

        <div className="relative group">
          <div
            onClick={() =>
              !loadingSegmentos && setIsSegmentMenuOpen(!isSegmentMenuOpen)
            }
            className={`w-full min-h-[52px] pl-12 pr-10 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer bg-slate-50 dark:bg-[#0b1120] flex flex-wrap gap-2 items-center transition-all duration-300 ${isSegmentMenuOpen
              ? "ring-4 ring-teal-500/10 border-teal-500 shadow-lg shadow-teal-500/5"
              : ""
              }`}
          >
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 h-full group-focus-within:text-teal-500 transition-colors">
              <Briefcase size={20} />
            </span>

            {formData.segmentos.length === 0 ? (
              <span className="text-slate-400 select-none text-sm">
                {loadingSegmentos ? "Cargando..." : "Seleccionar segmentos..."}
              </span>
            ) : (
              formData.segmentos.map((segCode, idx) => {
                const segmentObj = availableSegmentos.find(
                  (s) => (s.co_seg || s.segmento || s) === segCode,
                );
                const displayName = segmentObj
                  ? segmentObj.des_seg || segmentObj.segmento || segmentObj
                  : segCode;
                return (
                  <span
                    key={idx}
                    className="bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-teal-200 dark:bg-teal-900/40 dark:text-teal-100 dark:border-teal-500/30 transition-all hover:scale-105"
                  >
                    {displayName}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSegment(segCode);
                      }}
                      className="hover:text-teal-600 dark:hover:text-white transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                );
              })
            )}

            <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400 h-full">
              <ChevronDown
                size={20}
                className={`transition-transform duration-300 ${isSegmentMenuOpen ? "rotate-180" : ""
                  }`}
              />
            </span>
          </div>

          {isSegmentMenuOpen && (
            <div className="absolute z-20 w-full mt-2 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl max-h-64 overflow-y-auto animate-slide-in-up">
              {availableSegmentos.map((seg, idx) => {
                const code = seg.co_seg || seg.segmento || seg;
                const name = seg.des_seg || seg.segmento || seg;
                const isSelected = formData.segmentos.includes(code);
                return (
                  <div
                    key={idx}
                    onClick={() => toggleSegment(code)}
                    className="px-5 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between text-slate-700 dark:text-slate-100 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0"
                  >
                    <span className="text-sm font-medium">{name}</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "bg-teal-500 border-teal-500" : "border-slate-300 dark:border-slate-600"}`}>
                      {isSelected && <Check size={14} className="text-white" />}
                    </div>
                  </div>
                );
              })}
              {availableSegmentos.length === 0 && (
                <div className="px-5 py-4 text-slate-400 text-sm italic text-center">
                  No hay segmentos disponibles
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-5 py-3 rounded-2xl relative mb-6 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30 text-sm font-medium animate-shake">
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-5 py-3 rounded-2xl relative mb-6 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30 text-sm font-bold flex items-center gap-2">
          <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
            <Check size={14} className="text-white" />
          </div>
          <span>¡Usuario registrado con éxito! Redirigiendo...</span>
        </div>
      )}

      {/* Botón Submit */}
      <button
        type="submit"
        className="w-full bg-[#1a9888] hover:bg-[#137a6d] dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-black py-4 px-4 rounded-2xl shadow-xl shadow-teal-900/20 hover:shadow-teal-900/40 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 disabled:bg-slate-300 disabled:transform-none"
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <RefreshCw className="animate-spin" size={20} />
            REGISTRANDO...
          </span>
        ) : "REGISTRAR USUARIO"}
      </button>

      {/* Link para volver al Login */}
      <div className="mt-8 text-center border-t border-slate-100 dark:border-slate-800 pt-6">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          ¿Ya tienes una cuenta?{" "}
          <Link
            to="/login"
            className="font-black text-[#1a9888] hover:text-[#137a6d] dark:text-teal-400 dark:hover:text-teal-300 transition-colors uppercase tracking-wider text-xs"
          >
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </form>
  );
};

export default RegisterForm;
