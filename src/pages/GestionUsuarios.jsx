import { useState, useRef, useEffect } from "react";
import { useGestionUsuarios } from "../hooks/useGestionUsuarios";
import {
    TableContainer,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
} from "../components/ui/Tabla";
import { Save, Trash2, UserCog, RefreshCw, Check, ChevronDown, X } from "lucide-react";

// --- 1. Celda de Texto (Input Normal) - Para Usuario y Contraseña Visible ---
const TextCell = ({ value, onChange }) => (
    <Td className="p-2">
        <input
            type="text" // SIEMPRE TEXTO para que la contraseña se vea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full min-w-[120px] p-1.5 text-sm bg-gray-50 dark:bg-[#333] border border-gray-300 dark:border-[#555] rounded dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a9888]"
        />
    </Td>
);

// --- 2. Celda Multi-Select (NUEVA: Estilo Tags como en Registro) ---
const MultiSelectCell = ({ value = [], onChange, options }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Cierra el menú si se hace clic fuera
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    // Función para agregar o quitar un segmento del array
    const toggleOption = (optionValue) => {
        const currentSelected = Array.isArray(value) ? value : [];
        let newSelected;
        if (currentSelected.includes(optionValue)) {
            // Si ya existe, lo quitamos (Deseleccionar)
            newSelected = currentSelected.filter(item => item !== optionValue);
        } else {
            // Si no existe, lo agregamos (Seleccionar)
            newSelected = [...currentSelected, optionValue];
        }
        onChange(newSelected);
    };

    return (
        <Td className="p-2 overflow-visible"> {/* overflow-visible permite que el dropdown salga */}
            <div ref={containerRef} className="relative">
                {/* Área del Input / Tags */}
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full min-w-[180px] min-h-[38px] p-1.5 text-sm bg-gray-50 dark:bg-[#333] border border-gray-300 dark:border-[#555] rounded dark:text-white cursor-pointer flex flex-wrap gap-1 items-center transition-all ${isOpen ? 'ring-2 ring-[#1a9888] border-transparent' : ''}`}
                >
                    {(!value || value.length === 0) && (
                        <span className="text-gray-400 text-xs px-1">Seleccionar...</span>
                    )}

                    {Array.isArray(value) && value.map((item, idx) => (
                        <span key={idx} className="bg-teal-100 text-teal-800 text-xs px-2 py-0.5 rounded-full flex items-center gap-1 border border-teal-200 dark:bg-teal-900/50 dark:text-teal-100 dark:border-teal-800">
                            {item}
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleOption(item); }}
                                className="hover:text-teal-600 dark:hover:text-white rounded-full p-0.5"
                            >
                                <X size={10} />
                            </button>
                        </span>
                    ))}

                    <div className="ml-auto text-gray-400">
                        <ChevronDown size={14} />
                    </div>
                </div>

                {/* Menú Dropdown Flotante */}
                {isOpen && (
                    <div className="absolute z-50 mt-1 w-full min-w-[200px] bg-white dark:bg-[#262626] border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto left-0">
                        {options.map((opt) => {
                            const isSelected = Array.isArray(value) && value.includes(opt.value);
                            return (
                                <div
                                    key={opt.value}
                                    onClick={() => toggleOption(opt.value)}
                                    className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-[#333] cursor-pointer flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 transition-colors border-b border-gray-50 dark:border-gray-700/50 last:border-0"
                                >
                                    <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${isSelected ? 'bg-[#1a9888] border-[#1a9888]' : 'border-gray-400 dark:border-gray-500'}`}>
                                        {isSelected && <Check size={12} className="text-white" />}
                                    </div>
                                    <span>{opt.label}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </Td>
    );
};

// --- 3. Celda Select Simple (Para Estatus y Rol) ---
const SelectCell = ({ value, onChange, options, colorMap = {} }) => {
    const colorClass = colorMap[value] || "bg-gray-50 dark:bg-[#333]";
    return (
        <Td className="p-2">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full min-w-[140px] p-1.5 text-sm border border-gray-300 dark:border-[#555] rounded dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a9888] ${colorClass}`}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </Td>
    );
};

// --- CONSTANTES ---
const OPCIONES_ROLES = [
    { value: "ejecutiva", label: "EJECUTIVA" },
    { value: "vendedor", label: "VENDEDOR" },
    { value: "auditor", label: "AUDITOR" },
    { value: "administrador", label: "ADMINISTRADOR" },
];

const OPCIONES_SEGMENTO_PROFIT = [
    { value: "CARACAS", label: "CARACAS" },
    { value: "MERIDA", label: "MERIDA" },
    { value: "TRUJILLO", label: "TRUJILLO" },
    { value: "MERIDA - ALTA", label: "MERIDA - ALTA" },
    { value: "MERIDA - BAJA", label: "MERIDA - BAJA" },
];

const OPCIONES_ESTATUS = [
    { value: 1, label: "Activo" },
    { value: 0, label: "Inactivo" },
];

const GestionUsuarios = () => {
    const {
        usuarios,
        loading,
        handleUserChange,
        saveUserChanges,
        deleteUser
    } = useGestionUsuarios();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-white dark:bg-[#191919]">
                <div className="text-[#1a9888] flex flex-col items-center">
                    <RefreshCw className="animate-spin w-10 h-10 mb-3" />
                    <span className="font-semibold text-lg">Cargando usuarios...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-white dark:bg-[#191919]">

            <div className="flex items-center gap-3 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg text-[#1a9888]">
                    <UserCog size={28} />
                </div>
                <h2 className="text-2xl font-bold text-[#191919] dark:text-white">
                    Gestión de Usuarios
                </h2>
            </div>

            <TableContainer className="overflow-visible">
                {/* Nota: overflow-visible en el container ayuda a que los dropdowns no se corten si la tabla es pequeña */}
                <Table>
                    <Thead>
                        <Tr>
                            <Th align="left">Usuario</Th>
                            <Th align="left" className="min-w-[200px]">Segmento/Ruta</Th>
                            <Th align="left">Contraseña</Th>
                            <Th align="center">Estatus</Th>
                            <Th align="left">Rol / Permiso</Th>
                            <Th align="center" stickyLeft>Acciones</Th>
                        </Tr>
                    </Thead>

                    <Tbody>
                        {usuarios.map((u) => (
                            <Tr key={u.id}>
                                {/* 1. Usuario */}
                                <TextCell
                                    value={u.usuario}
                                    onChange={(val) => handleUserChange(u.id, "usuario", val)}
                                />

                                {/* 2. Segmentos (MULTI-SELECT ACTUALIZADO) */}
                                <MultiSelectCell
                                    value={u.segmentos} // Pasamos el array completo
                                    onChange={(newSegments) => handleUserChange(u.id, "segmentos", newSegments)}
                                    options={OPCIONES_SEGMENTO_PROFIT}
                                />

                                {/* 3. Contraseña (VISIBLE) */}
                                <TextCell
                                    value={u.contraseña}
                                    onChange={(val) => handleUserChange(u.id, "contraseña", val)}
                                />

                                {/* 4. Estatus */}
                                <SelectCell
                                    value={u.status}
                                    onChange={(val) => handleUserChange(u.id, "status", Number(val))}
                                    options={OPCIONES_ESTATUS}
                                    colorMap={{
                                        1: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
                                        0: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
                                    }}
                                />

                                {/* 5. Rol */}
                                <SelectCell
                                    value={u.role}
                                    onChange={(val) => handleUserChange(u.id, "role", val)}
                                    options={OPCIONES_ROLES}
                                />

                                {/* 6. Acciones */}
                                <Td align="center" stickyLeft className="bg-gray-50 dark:bg-[#262626]">
                                    <div className="flex justify-center gap-2">
                                        <button
                                            onClick={() => saveUserChanges(u.id)}
                                            className="p-2 text-white bg-[#1a9888] hover:bg-[#137a6d] rounded-lg transition shadow-sm"
                                            title="Guardar Cambios"
                                        >
                                            <Save size={18} />
                                        </button>
                                        <button
                                            onClick={() => deleteUser(u.id)}
                                            className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition shadow-sm"
                                            title="Eliminar Usuario"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </Td>
                            </Tr>
                        ))}

                        {!loading && usuarios.length === 0 && (
                            <Tr>
                                <Td colSpan={6} className="text-center py-8 text-gray-500">
                                    No hay usuarios registrados.
                                </Td>
                            </Tr>
                        )}
                    </Tbody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default GestionUsuarios;