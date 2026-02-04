import { useState, useEffect, useMemo } from "react";
import { apiService } from "../services/apiService";
import {
    TableContainer,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
} from "../components/ui/Tabla";
import {
    Calendar,
    RefreshCw,
    Search,
    MapPin,
    DollarSign,
    AlertCircle,
    Briefcase,
    ChevronDown,
    ChevronUp,
    User
} from "lucide-react";

// Componente para renderizar la tarjeta de día
const DayCard = ({ day, data }) => {
    if (!data?.tarea && !data?.accion) return null;

    const isCobranza = data.tarea?.toLowerCase().includes("cobranza");

    return (
        <div className={`text-xs p-1.5 rounded border mb-1 last:mb-0 ${isCobranza
            ? "bg-red-50 border-red-100 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"
            : "bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300"
            }`}>
            <div className="font-bold uppercase mb-0.5 opacity-70 text-[10px]">{day}</div>
            {data.tarea && <div className="font-semibold">{data.tarea}</div>}
            {data.accion && <div className="italic opacity-80">{data.accion}</div>}
        </div>
    );
};

// Componente para una sección de planificación individual
const PlanificacionGroup = ({ id_planificacion, items, formatDate, formatCurrency }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    if (!items || items.length === 0) return null;

    // Tomamos los datos "cabecera" del primer ítem (asumiendo que son iguales para toda la planificación)
    const headerData = items[0];
    const totalVencido = items.reduce((acc, item) => acc + (item.full_data?.saldo_vencido || 0), 0);
    const user = headerData.usuario || headerData.co_ven || "No Identificado";

    return (
        <div className="mb-8 bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            {/* Cabecera del Grupo */}
            <div
                className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 dark:bg-[#151926] border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#1e2436] transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-4">
                    <button className="p-1 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-600">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <div>
                        <div className="flex items-center gap-2">

                            <h3 className="font-bold text-slate-700 dark:text-gray-200 text-lg">
                                Planificación del {formatDate(headerData.fecha_registro)}
                            </h3>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                                <User size={14} />
                                {user}
                            </span>
                            {headerData.vendedor && (
                                <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400">
                                    <Briefcase size={14} />
                                    {headerData.vendedor}
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <Briefcase size={14} />
                                {items.length} Clientes
                            </span>
                        </div>
                    </div>
                </div>

                {/* Resumen Financiero del Grupo */}
                {totalVencido > 0 && (
                    <div className="mt-3 md:mt-0 flex items-center bg-red-50 dark:bg-red-900/10 px-3 py-2 rounded-lg border border-red-100 dark:border-red-900/30">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] uppercase font-bold text-red-400">Total Vencido</span>
                            <span className="font-bold text-red-700 dark:text-red-300 font-mono">
                                {formatCurrency(totalVencido)}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Tabla Detalle */}
            {isExpanded && (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-white dark:bg-[#1a1f2e] text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-100 dark:border-gray-800">
                            <tr>
                                <th className="p-4">Cliente</th>
                                <th className="p-4">Finanzas</th>
                                <th className="p-4 min-w-[300px]">Semana</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {items.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-[#1e2436]/50 transition-colors">
                                    <td className="p-4 align-top">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-bold text-slate-800 dark:text-white text-sm">
                                                {item.nombre_cliente}
                                            </span>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 font-mono">
                                                    {item.codigo_profit}
                                                </span>
                                            </div>
                                            {item.full_data?.segmento && (
                                                <span className="flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 mt-0.5">
                                                    <MapPin size={10} />
                                                    {item.full_data.segmento}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 align-top">
                                        <div className="flex flex-col gap-1.5 text-xs">
                                            {item.full_data?.saldo_vencido > 0 && (
                                                <div className="flex justify-between items-center gap-4 text-red-600 dark:text-red-400 font-medium">
                                                    <span>Vencido:</span>
                                                    <span className="font-mono">{formatCurrency(item.full_data.saldo_vencido)}</span>
                                                </div>
                                            )}
                                            {item.full_data?.saldo_transito > 0 && (
                                                <div className="flex justify-between items-center gap-4 text-blue-600 dark:text-blue-400">
                                                    <span>Tránsito:</span>
                                                    <span className="font-mono">{formatCurrency(item.full_data.saldo_transito)}</span>
                                                </div>
                                            )}
                                            {item.full_data?.limite_credito && (
                                                <div className="flex justify-between items-center gap-4 text-gray-500">
                                                    <span>Límite:</span>
                                                    <span className="font-mono">{formatCurrency(Number(item.full_data.limite_credito))}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 align-top">
                                        {item.semana ? (
                                            <div className="grid grid-cols-5 gap-1">
                                                {["lunes", "martes", "miercoles", "jueves", "viernes"].map(day => (
                                                    <div key={day} className="min-w-[50px]">
                                                        {item.semana[day]?.tarea || item.semana[day]?.accion ? (
                                                            <DayCard day={day.slice(0, 3)} data={item.semana[day]} />
                                                        ) : (
                                                            <div className="text-[9px] text-center text-gray-300 dark:text-gray-700 py-1 border border-dashed border-gray-200 dark:border-gray-800 rounded">
                                                                -
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-xs italic">Sin agenda</span>
                                        )}
                                        {item.obs_ejecutiva && (
                                            <div className="mt-2 text-xs text-slate-500 italic border-l-2 border-yellow-400 pl-2 bg-yellow-50 dark:bg-yellow-900/10 p-1 rounded-r">
                                                "{item.obs_ejecutiva}"
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const Planificaciones = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRutas, setSelectedRutas] = useState([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [rutaSearchTerm, setRutaSearchTerm] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await apiService.getPlanificacion();
                if (response && Array.isArray(response)) {
                    setData(response);
                } else if (response && response.data && Array.isArray(response.data)) {
                    setData(response.data);
                } else {
                    setData([]);
                }
            } catch (error) {
                console.error("Error cargando planificaciones:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("es-VE", {
            weekday: 'long',
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("es-VE", {
            style: "currency",
            currency: "USD",
        }).format(amount || 0);
    };

    // Obtener rutas únicas para el selector
    const uniqueRutas = useMemo(() => {
        const rutas = new Set();
        data.forEach(item => {
            if (item.full_data?.segmento) {
                rutas.add(item.full_data.segmento);
            }
        });
        return Array.from(rutas).sort();
    }, [data]);

    // Filtrar rutas únicas según el buscador interno
    const filteredUniqueRutas = useMemo(() => {
        return uniqueRutas.filter(ruta =>
            ruta.toLowerCase().includes(rutaSearchTerm.toLowerCase())
        );
    }, [uniqueRutas, rutaSearchTerm]);

    // Filtrado y Agrupamiento
    const groupedData = useMemo(() => {
        // 1. Filtrar
        const filtered = data.filter(item => {
            const matchesSearch = item.nombre_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.codigo_profit?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesRuta = selectedRutas.length === 0 ||
                selectedRutas.includes(item.full_data?.segmento);

            return matchesSearch && matchesRuta;
        });

        // 2. Agrupar
        const groups = filtered.reduce((acc, item) => {
            const id = item.id_planificacion || "sin-id";
            if (!acc[id]) {
                acc[id] = [];
            }
            acc[id].push(item);
            return acc;
        }, {});

        // 3. Convertir a array y Ordenar por fecha del primer elemento (más reciente primero)
        return Object.entries(groups).sort(([, itemsA], [, itemsB]) => {
            const dateA = new Date(itemsA[0]?.fecha_registro || 0);
            const dateB = new Date(itemsB[0]?.fecha_registro || 0);
            return dateB - dateA; // Descendiente
        });

    }, [data, searchTerm, selectedRutas]);


    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-white dark:bg-[#0b1120]">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="w-12 h-12 text-[#1a9888] animate-spin" />
                    <p className="text-slate-600 dark:text-slate-300 font-medium animate-pulse">
                        Cargando planificaciones...
                    </p>
                </div>
            </div>
        );
    }

    const toggleRuta = (ruta) => {
        setSelectedRutas(prev =>
            prev.includes(ruta)
                ? prev.filter(r => r !== ruta)
                : [...prev, ruta]
        );
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-white dark:bg-[#0b1120]">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-2xl">
                        <Calendar size={32} className="text-[#1a9888] dark:text-teal-400" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                            Registros{" "}
                            <span className="text-[#1a9888] dark:text-teal-400">
                                Guardados
                            </span>
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                            Gestión y seguimiento de visitas semanales
                        </p>
                    </div>
                </div>

                {/* Buscadores */}
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl leading-5 bg-gray-50 dark:bg-[#1a1f2e] text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1a9888] focus:border-transparent sm:text-sm transition-all"
                            placeholder="Buscar cliente o código..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Multi-select para Rutas */}
                    <div className="relative w-full md:w-72">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex items-center justify-between w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#1a1f2e] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a9888] transition-all text-sm"
                        >
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MapPin className="h-5 w-5 text-gray-400" />
                            </div>
                            <span className="truncate">
                                {selectedRutas.length === 0
                                    ? "Todas las rutas"
                                    : `${selectedRutas.length} seleccionadas`}
                            </span>
                            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isMenuOpen ? "rotate-180" : ""}`} />
                        </button>

                        {isMenuOpen && (
                            <div className="absolute z-50 mt-2 w-full bg-white dark:bg-[#1a1f2e] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-80 flex flex-col overflow-hidden">
                                <div className="p-2 bg-white dark:bg-[#1a1f2e] border-b border-gray-100 dark:border-gray-800 space-y-2">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                            <Search className="h-3 w-3 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            className="block w-full pl-7 pr-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-xs bg-gray-50 dark:bg-[#0b1120] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1a9888]"
                                            placeholder="Filtrar rutas..."
                                            value={rutaSearchTerm}
                                            onChange={(e) => setRutaSearchTerm(e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedRutas([]);
                                        }}
                                        className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider hover:underline w-full text-left"
                                    >
                                        Limpiar selección
                                    </button>
                                </div>
                                <div className="p-1 overflow-y-auto">
                                    {filteredUniqueRutas.length > 0 ? (
                                        filteredUniqueRutas.map(ruta => (
                                            <label
                                                key={ruta}
                                                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 cursor-pointer transition-colors"
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-gray-300 text-[#1a9888] focus:ring-[#1a9888]"
                                                    checked={selectedRutas.includes(ruta)}
                                                    onChange={() => toggleRuta(ruta)}
                                                />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">{ruta}</span>
                                            </label>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-xs text-gray-400 italic">
                                            No se encontraron rutas
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Overlay invisible para cerrar el menú al hacer clic fuera */}
                        {isMenuOpen && (
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    setRutaSearchTerm(""); // Limpiar búsqueda al cerrar
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {groupedData.map(([id, items]) => (
                    <PlanificacionGroup
                        key={id}
                        id_planificacion={id}
                        items={items}
                        formatDate={formatDate}
                        formatCurrency={formatCurrency}
                    />
                ))}

                {!loading && groupedData.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <Search size={48} className="stroke-1 opacity-50 mb-4" />
                        <p className="text-lg font-medium">No se encontraron planificaciones</p>
                        <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Planificaciones;
