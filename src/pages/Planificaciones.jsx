/* eslint-disable no-unused-vars */
import { useState, useEffect, useMemo, useRef } from "react";
import { apiService } from "../services/apiService";
import {
  Calendar,
  RefreshCw,
  Search,
  MapPin,
  Briefcase,
  ChevronDown,
  User,
  Filter,
  X,
  Download,
} from "lucide-react";
import StarRating from "../components/StarRating";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("es-VE", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
  }).format(amount || 0);
};

// --- COMPONENTES UI ---

const DayCard = ({ day, data }) => {
  if (!data?.tarea && !data?.accion) return null;
  const isCobranza = data.tarea?.toLowerCase().includes("cobranza");

  return (
    <div
      className={`text-[10px] sm:text-xs p-1.5 rounded border mb-1 last:mb-0 transition-all ${
        isCobranza
          ? "bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-300"
          : "bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300"
      }`}
    >
      <div className="font-bold uppercase mb-0.5 opacity-70 tracking-wider">
        {day}
      </div>
      {data.tarea && (
        <div className="font-semibold line-clamp-1" title={data.tarea}>
          {data.tarea}
        </div>
      )}
      {data.accion && (
        <div className="italic opacity-80 line-clamp-1" title={data.accion}>
          {data.accion}
        </div>
      )}
    </div>
  );
};

const PlanificacionHeader = ({
  headerData,
  itemCount,
  isExpanded,
  onClick,
  totalVencido,
  onDownload,
  rating,
  onRate,
}) => {
  const user = headerData.usuario || headerData.co_ven || "No Identificado";

  return (
    <div
      onClick={onClick}
      className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 dark:bg-[#151926] border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#1e2436] transition-all group"
    >
      <div className="flex items-center gap-4">
        <button
          className={`p-1.5 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-600 text-gray-500 transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
        >
          <ChevronDown size={16} />
        </button>
        <div>
          <h3 className="font-bold text-slate-700 dark:text-gray-200 text-base sm:text-lg group-hover:text-[#1a9888] transition-colors">
            Planificación del{" "}
            <span className="capitalize">
              {formatDate(headerData.fecha_registro)}
            </span>
          </h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full border border-gray-100 dark:border-gray-700">
              <User size={12} /> {user}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase size={12} /> {itemCount} Clientes
            </span>
            {headerData.vendedor && (
              <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                {headerData.vendedor}
              </span>
            )}

            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full border border-amber-100 dark:border-amber-800/30">
              <StarRating rating={rating} onRate={onRate} />
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN DERECHA: Botón Descarga + Total Vencido */}
      <div className="mt-3 md:mt-0 flex items-center gap-3 self-end md:self-auto">
        {/* BOTÓN DESCARGAR INDIVIDUAL */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDownload();
          }}
          className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 hover:text-red-600 hover:border-red-200 dark:hover:text-red-400 transition-colors shadow-sm"
          title="Descargar PDF de esta planificación"
        >
          <Download size={18} />
        </button>

        {totalVencido > 0 && (
          <div className="flex items-center bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-red-100 dark:border-red-900/30 shadow-sm">
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase font-bold text-red-400">
                Total Vencido
              </span>
              <span className="font-bold text-red-600 dark:text-red-400 font-mono text-sm">
                {formatCurrency(totalVencido)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PlanificacionTable = ({ items }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse">
      <thead className="bg-white dark:bg-[#1a1f2e] text-[10px] uppercase text-gray-500 dark:text-gray-400 font-bold border-b border-gray-100 dark:border-gray-800 tracking-wider">
        <tr>
          <th className="p-4 w-1/4">Cliente / Ruta</th>
          <th className="p-4 w-1/4">Estado Financiero</th>
          <th className="p-4 w-1/2">Agenda Semanal</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
        {items.map((item) => (
          <tr
            key={item.id}
            className="hover:bg-gray-50 dark:hover:bg-[#1e2436]/50 transition-colors"
          >
            {/* Columna Cliente */}
            <td className="p-4 align-top">
              <div className="flex flex-col gap-1">
                <span className="font-bold text-slate-800 dark:text-white text-sm line-clamp-2">
                  {item.nombre_cliente}
                </span>
                <div className="flex items-center gap-2">
                  <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs text-slate-600 dark:text-slate-300 font-mono font-bold">
                    {item.codigo_profit}
                  </span>
                </div>
                {item.full_data?.segmento && (
                  <span className="flex items-center gap-1 text-[11px] text-teal-600 dark:text-teal-400 mt-1 font-medium bg-teal-50 dark:bg-teal-900/20 w-fit px-2 py-0.5 rounded-full">
                    <MapPin size={10} />
                    {item.full_data.segmento}
                  </span>
                )}
              </div>
            </td>

            {/* Columna Finanzas */}
            <td className="p-4 align-top">
              <div className="flex flex-col gap-2 text-xs">
                {item.full_data?.saldo_vencido > 0 ? (
                  <div className="flex justify-between items-center p-1.5 bg-red-50 dark:bg-red-900/10 rounded border border-red-100 dark:border-red-900/20 text-red-700 dark:text-red-400">
                    <span className="font-semibold">Vencido</span>
                    <span className="font-mono font-bold">
                      {formatCurrency(item.full_data.saldo_vencido)}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-400 italic text-[10px]">
                    Sin saldo vencido
                  </span>
                )}

                {item.full_data?.saldo_transito > 0 && (
                  <div className="flex justify-between items-center text-blue-600 dark:text-blue-400 px-1">
                    <span>Tránsito:</span>
                    <span className="font-mono">
                      {formatCurrency(item.full_data.saldo_transito)}
                    </span>
                  </div>
                )}
                {item.full_data?.limite_credito && (
                  <div className="flex justify-between items-center text-gray-500 px-1">
                    <span>Límite:</span>
                    <span className="font-mono">
                      {formatCurrency(Number(item.full_data.limite_credito))}
                    </span>
                  </div>
                )}
              </div>
            </td>

            {/* Columna Semana */}
            <td className="p-4 align-top">
              {item.semana ? (
                <div className="grid grid-cols-5 gap-2">
                  {["lunes", "martes", "miercoles", "jueves", "viernes"].map(
                    (day) => (
                      <div key={day} className="min-w-[60px]">
                        {item.semana[day]?.tarea || item.semana[day]?.accion ? (
                          <DayCard
                            day={day.slice(0, 3)}
                            data={item.semana[day]}
                          />
                        ) : (
                          <div className="h-full min-h-[40px] rounded bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-100 dark:border-gray-700 flex items-center justify-center">
                            <span className="text-gray-300 dark:text-gray-600 text-[10px]">
                              •
                            </span>
                          </div>
                        )}
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <span className="text-gray-400 text-xs italic">
                  Sin agenda registrada
                </span>
              )}

              {item.obs_ejecutiva && (
                <div className="mt-3 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-2 rounded-lg flex gap-2 items-start">
                  <span className="font-bold">Nota:</span>
                  <span className="italic">"{item.obs_ejecutiva}"</span>
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Asegúrate de importar la función generadora
import { generatePlanificacionPDF } from "../utils/pdfGeneratorPlanificacion";

const PlanificacionGroup = ({ items }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const initialRating = items[0]?.rating_star || 0;
  const [currentRating, setCurrentRating] = useState(initialRating);

  if (!items || items.length === 0) return null;

  const headerData = items[0];
  const idPlanificacion = headerData.id_planificacion;

  // Calcular total vencido
  const totalVencido = items.reduce(
    (acc, item) => acc + (item.full_data?.saldo_vencido || 0),
    0,
  );

  // MANEJADOR DE DESCARGA
  const handleDownload = () => {
    const groupDate = new Date(headerData.fecha_registro);
    generatePlanificacionPDF(items, groupDate);
  };

  // MANEJADOR DE VALORACION
  const handleRate = async (newRating) => {
    setCurrentRating(newRating);
    try {
      await apiService.ratePlanificacion(idPlanificacion, newRating);
    } catch (error) {
      console.error("Error al valorar:", error);
      setCurrentRating(initialRating);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all hover:shadow-md">
      <PlanificacionHeader
        headerData={headerData}
        itemCount={items.length}
        isExpanded={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
        totalVencido={totalVencido}
        onDownload={handleDownload}
        rating={currentRating}
        onRate={handleRate}
      />
      {isExpanded && <PlanificacionTable items={items} />}
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---

const Planificaciones = () => {
  // Estado
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRutas, setSelectedRutas] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [rutaSearchTerm, setRutaSearchTerm] = useState("");

  // Ref para cerrar el menú al hacer click fuera
  const menuRef = useRef(null);

  // Carga de datos
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await apiService.getPlanificacion({
          historico: "true",
        });
        const cleanData = Array.isArray(response)
          ? response
          : response?.data || [];
        setData(cleanData);
      } catch (error) {
        console.error("Error cargando planificaciones:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lógica de Rutas (Memoizada)
  const uniqueRutas = useMemo(() => {
    const rutas = new Set();
    data.forEach((item) => {
      if (item.full_data?.segmento) rutas.add(item.full_data.segmento);
    });
    return Array.from(rutas).sort();
  }, [data]);

  const filteredUniqueRutas = useMemo(
    () =>
      uniqueRutas.filter((ruta) =>
        ruta.toLowerCase().includes(rutaSearchTerm.toLowerCase()),
      ),
    [uniqueRutas, rutaSearchTerm],
  );

  // Filtrado y Agrupamiento Principal (Memoizado)
  const groupedData = useMemo(() => {
    // --- 1. DEBUG INICIAL ---
    if (data.length > 0) {
      console.log("🔍 Iniciando filtrado...");
      console.log("   - Total datos entrada:", data.length);
      console.log("   - Filtro Fecha activo:", filterDate);
      console.log("   - Filtro Texto:", searchTerm);
    }

    // --- 2. FILTRADO ---
    const filtered = data.filter((item) => {
      const matchesSearch =
        item.nombre_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.codigo_profit?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRuta =
        selectedRutas.length === 0 ||
        selectedRutas.includes(item.full_data?.segmento);

      let matchesDate = true;
      if (filterDate) {
        // Ajuste de zona horaria (YYYY-MM-DD local)
        const dateObj = new Date(item.fecha_registro);
        const itemDate = dateObj.toLocaleDateString("en-CA");
        matchesDate = itemDate === filterDate;
      }

      return matchesSearch && matchesRuta && matchesDate;
    });

    if (data.length > 0) {
      console.log("   - Datos después de filtrar:", filtered.length);
    }

    // --- 3. AGRUPAMIENTO ---
    const groups = filtered.reduce((acc, item) => {
      const id = item.id_planificacion || "sin-id";
      if (!acc[id]) acc[id] = [];
      acc[id].push(item);
      return acc;
    }, {});

    // --- 4. ORDENAMIENTO (Guardamos en variable, no retornamos todavía) ---
    const sortedGroups = Object.entries(groups).sort(
      ([, itemsA], [, itemsB]) => {
        const dateA = new Date(itemsA[0]?.fecha_registro || 0);
        const dateB = new Date(itemsB[0]?.fecha_registro || 0);
        return dateB - dateA;
      },
    );

    // --- 5. DEBUG FINAL (MEJORADO) ---
    if (data.length > 0) {
      console.log("📦 Total Grupos:", sortedGroups.length);

      // 1. Ver el PRIMERO (El más nuevo)
      const firstGroup = sortedGroups[0];
      console.log("🆕 Más reciente:", firstGroup?.[1][0]?.fecha_registro);

      // 2. Ver el ÚLTIMO (El más viejo)
      const lastGroup = sortedGroups[sortedGroups.length - 1];
      console.log("👴 Más antiguo:", lastGroup?.[1][0]?.fecha_registro);

      // 3. Listar todas las fechas únicas encontradas
      const allDates = sortedGroups.map(
        ([_, items]) => items[0]?.fecha_registro.split("T")[0],
      );
      const uniqueDates = [...new Set(allDates)]; // Quita duplicados
      console.log("📅 Calendario disponible:", uniqueDates);
    }

    // --- 6. RETORNO FINAL ---
    return sortedGroups;
  }, [data, searchTerm, selectedRutas, filterDate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-[#0b1120]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-12 h-12 text-[#1a9888] animate-spin" />
          <p className="text-slate-600 dark:text-slate-300 font-medium animate-pulse">
            Sincronizando planificaciones...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-white dark:bg-[#0b1120]">
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-2xl shadow-sm border border-teal-100 dark:border-teal-900/30">
            <Calendar size={32} className="text-[#1a9888] dark:text-teal-400" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
              Registros{" "}
              <span className="text-[#1a9888] dark:text-teal-400">
                Guardados
              </span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              Gestión y seguimiento de visitas semanales
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-auto group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-[#1a9888]">
              <Calendar size={18} />
            </div>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full sm:w-40 pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#1a1f2e] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9888] focus:border-transparent transition-all shadow-sm cursor-pointer"
            />
            {/* Botón X pequeña para limpiar fecha si está seleccionada */}
            {filterDate && (
              <button
                onClick={() => setFilterDate("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-200 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-500 hover:text-red-500 rounded-full p-1 transition-colors"
                title="Limpiar fecha"
              >
                <X size={12} />
              </button>
            )}
          </div>
          {/* 1. Buscador de Texto */}
          <div className="relative w-full md:w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#1a9888] transition-colors" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#1a1f2e] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a9888] focus:border-transparent transition-all shadow-sm"
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* 2. Selector Rutas Custom */}
          <div className="relative w-full md:w-72" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`flex items-center justify-between w-full pl-3 pr-3 py-2.5 border rounded-xl bg-white dark:bg-[#1a1f2e] text-gray-900 dark:text-white transition-all shadow-sm ${
                isMenuOpen || selectedRutas.length > 0
                  ? "border-[#1a9888] ring-1 ring-[#1a9888]"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                <Filter
                  size={18}
                  className={`shrink-0 ${
                    selectedRutas.length > 0
                      ? "text-[#1a9888]"
                      : "text-gray-400"
                  }`}
                />
                <span className="text-sm truncate font-medium block text-left">
                  {selectedRutas.length === 0
                    ? "Todas las rutas"
                    : `${selectedRutas.length} seleccionadas`}
                </span>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-gray-400 shrink-0 transition-transform ${
                  isMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Menú Desplegable */}
            {isMenuOpen && (
              <div className="absolute z-50 mt-2 w-full bg-white dark:bg-[#1a1f2e] border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-60 md:max-h-96 flex flex-col overflow-hidden animation-fade-in-down">
                <div className="p-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#151926] shrink-0">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <input
                      type="text"
                      className="w-full pl-7 pr-7 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-xs bg-white dark:bg-[#0b1120] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1a9888]"
                      placeholder="Filtrar..."
                      value={rutaSearchTerm}
                      onChange={(e) => setRutaSearchTerm(e.target.value)}
                    />
                    {rutaSearchTerm && (
                      <button
                        onClick={() => setRutaSearchTerm("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                  {selectedRutas.length > 0 && (
                    <button
                      onClick={() => setSelectedRutas([])}
                      className="mt-2 text-[10px] font-bold text-red-500 hover:text-red-600 uppercase w-full text-center hover:bg-red-50 dark:hover:bg-red-900/20 py-1.5 rounded transition-colors"
                    >
                      Limpiar Filtros
                    </button>
                  )}
                </div>
                <div className="p-1 overflow-y-auto custom-scrollbar">
                  {filteredUniqueRutas.length > 0 ? (
                    filteredUniqueRutas.map((ruta) => (
                      <label
                        key={ruta}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 cursor-pointer group transition-colors"
                      >
                        <div
                          className={`w-4 h-4 rounded border flex shrink-0 items-center justify-center transition-colors ${
                            selectedRutas.includes(ruta)
                              ? "bg-[#1a9888] border-[#1a9888]"
                              : "border-gray-300 dark:border-gray-600 group-hover:border-[#1a9888]"
                          }`}
                        >
                          {selectedRutas.includes(ruta) && (
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          )}
                        </div>
                        <span
                          className={`text-xs font-medium truncate ${
                            selectedRutas.includes(ruta)
                              ? "text-[#1a9888]"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {ruta}
                        </span>
                      </label>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-gray-400 italic">
                      No hay resultados
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Listado de Grupos */}
      <div className="space-y-6">
        {groupedData.map(([id, items]) => (
          <PlanificacionGroup key={id} id_planificacion={id} items={items} />
        ))}

        {!loading && groupedData.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 bg-gray-50 dark:bg-[#151926] rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-sm mb-4">
              <Search size={32} className="text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              No se encontraron resultados
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs text-center">
              Intenta ajustar los términos de búsqueda o limpiar los filtros de
              ruta.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedRutas([]);
                setFilterDate("");
              }}
              className="mt-6 text-sm font-medium text-[#1a9888] hover:text-[#158072] hover:underline"
            >
              Limpiar todos los filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Planificaciones;
