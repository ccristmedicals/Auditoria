/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useBaseDatosBitrix } from "../hooks/useBaseDatosBitrix";
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
  RefreshCw,
  Database,
  MapPin,
  AlertTriangle,
  Edit3,
  Save,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Filter,
  Search,
  X,
  ChevronDown,
  CheckSquare,
  Square,
} from "lucide-react";
import { apiService } from "../services/apiService";

// --- CONSTANTES ---
const OPCIONES_SEGMENTOS = [
  "40",
  "TRUJILLO",
  "MERIDA",
  "MERIDA - ALTA",
  "MERIDA - BAJA",
  "CARACAS",
];

// --- COMPONENTES AUXILIARES ---

// 1. Selector Múltiple para Filtros (NUEVO)
const FilterMultiSelect = ({ label, options, selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (val) => {
    if (selected.includes(val)) {
      onChange(selected.filter((item) => item !== val));
    } else {
      onChange([...selected, val]);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-all shadow-sm ${
          selected.length > 0
            ? "bg-teal-50 border-[#1a9888] text-[#1a9888] ring-1 ring-[#1a9888] dark:bg-teal-900/20 dark:border-teal-800"
            : "bg-white border-gray-300 text-gray-700 dark:bg-[#262626] dark:border-gray-600 dark:text-gray-300"
        }`}
      >
        <Filter size={16} />
        <span>{label}</span>
        {selected.length > 0 && (
          <span className="bg-[#1a9888] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
            {selected.length}
          </span>
        )}
        <ChevronDown size={14} className="ml-1 opacity-50" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-2 w-64 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-100 left-0">
            <div className="text-xs font-bold text-gray-400 mb-2 px-2 uppercase tracking-wider">
              Seleccionar Segmentos
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar">
              {options.map((opt) => {
                const isSelected = selected.includes(opt);
                return (
                  <div
                    key={opt}
                    onClick={() => toggleOption(opt)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm transition-all ${
                      isSelected
                        ? "bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 font-medium"
                        : "hover:bg-gray-100 dark:hover:bg-[#333] text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 border rounded flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-[#1a9888] border-[#1a9888]"
                          : "border-gray-400 dark:border-gray-600"
                      }`}
                    >
                      {isSelected && (
                        <CheckSquare size={14} className="text-white" />
                      )}
                    </div>
                    {opt}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const ErrorAwareCell = React.memo(({ value, isError, icon = false }) => {
  if (isError) {
    return (
      <div className="flex items-center gap-1.5 text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-2 py-1 rounded-md w-fit">
        <AlertTriangle size={14} />
        <span className="font-bold text-xs">{value || "VACÍO"}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      {icon && <span className="text-gray-400">{icon}</span>}
      <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>
    </div>
  );
});

const EditableCell = React.memo(({ value, onChange, placeholder = "..." }) => {
  const [localValue, setLocalValue] = useState(value || "");

  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  const onBlur = () => {
    if (localValue !== value) {
      onChange(localValue);
    }
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={onBlur}
        onKeyDown={(e) => e.key === "Enter" && onBlur()}
        placeholder={placeholder}
        className="w-full bg-white dark:bg-[#262626] border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm outline-none transition-all placeholder-gray-400 focus:ring-2 focus:ring-[#1a9888] focus:border-transparent dark:text-gray-200"
      />
      <Edit3
        size={12}
        className="absolute right-2 top-2.5 text-gray-400 pointer-events-none opacity-50"
      />
    </div>
  );
});

const ClassificationBadge = React.memo(({ value }) => {
  const letter = (value || "").toString().toUpperCase().charAt(0);

  const colorMap = {
    A: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300",
    B: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300",
    C: "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300",
    D: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300",
    E: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300",
    Z: "bg-red-200 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300",
  };

  const colorClass =
    colorMap[letter] ||
    "bg-gray-100 text-gray-400 border-gray-200 dark:bg-gray-800";

  return (
    <div className="flex justify-center">
      <span
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${colorClass} transition-colors`}
      >
        {letter || "-"}
      </span>
    </div>
  );
});

// --- COMPONENTE FILA ---
const CompanyRow = React.memo(
  ({
    row,
    isSelected,
    toggleSelect,
    handleCompanyChange,
    handleSave,
    formatCurrency,
  }) => {
    // --- HELPER PARA RENDERIZAR TEXTO CON COLORES ---
    const renderStyledContent = (textString) => {
      if (!textString) return "-";

      const parts = textString.split(" / ");

      return (
        <div className="flex flex-col gap-1">
          {parts.map((part, index) => {
            let colorClass = "text-gray-600 dark:text-gray-400";

            if (part.startsWith("V:")) {
              colorClass = "text-green-700 dark:text-green-400 font-medium";
            } else if (part.startsWith("C:")) {
              colorClass = "text-blue-700 dark:text-blue-400 font-medium";
            }

            return (
              <span
                key={index}
                className={`${colorClass} wrap-break-word whitespace-normal leading-tight text-xs`}
              >
                {part}
              </span>
            );
          })}
        </div>
      );
    };

    // Helper para generar celdas de días
    const renderDayCells = (dayPrefix, bgColorClass, borderClass = "") => {
      return (
        <>
          {/* ACCIÓN (Solo Lectura) */}
          <Td className={`${bgColorClass} min-w-[150px] align-top`}>
            <div className="px-2 py-1.5">
              {renderStyledContent(row[`${dayPrefix}_accion`])}
            </div>
          </Td>

          {/* OBSERVACIÓN (Solo Lectura) */}
          <Td className={`${bgColorClass} min-w-[150px] align-top`}>
            <div className="px-2 py-1.5 italic">
              {renderStyledContent(row[`${dayPrefix}_observacion`])}
            </div>
          </Td>

          {/* TAREA (Editable) */}
          <Td
            className={`${bgColorClass} ${borderClass} min-w-[150px] align-top`}
          >
            <EditableCell
              value={row[`${dayPrefix}_tarea`]}
              onChange={(val) =>
                handleCompanyChange(row.id_interno, `${dayPrefix}_tarea`, val)
              }
              placeholder="Tarea..."
            />
          </Td>
        </>
      );
    };

    return (
      <Tr className={isSelected ? "bg-teal-50/30 dark:bg-teal-900/10" : ""}>
        {/* Checkbox */}
        <Td className="bg-white dark:bg-[#191919] border-r dark:border-[#333] text-center">
          <input
            type="checkbox"
            className="w-4 h-4 accent-[#1a9888] cursor-pointer"
            checked={isSelected}
            onChange={() => toggleSelect(row.id_interno)}
          />
        </Td>

        {/* Datos Básicos */}
        <Td className="bg-gray-50 dark:bg-[#202020] text-xs font-mono">
          {row.id}
        </Td>
        <Td className="text-left font-semibold bg-white dark:bg-[#191919] border-r shadow-md">
          <div
            className="flex items-center gap-2 truncate max-w-[280px]"
            title={row.nombre}
          >
            {row.nombre}
          </div>
        </Td>

        {/* Celdas Informativas */}
        <Td>
          <ErrorAwareCell
            value={row.codigo_profit}
            isError={!row.codigo_profit || row.codigo_profit === "0"}
          />
        </Td>
        <Td>{row.ciudad}</Td>
        <Td>
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full dark:bg-blue-900/30 dark:text-blue-200">
            {row.segmento}
          </span>
        </Td>
        <Td>
          <ErrorAwareCell
            value={row.coordenadas}
            isError={!row.coordenadas || row.coordenadas === "0"}
            icon={<MapPin size={12} />}
          />
        </Td>
        <Td className="text-xs truncate max-w-[140px]" title={row.dias_visita}>
          {row.dias_visita || "-"}
        </Td>
        <Td>{row.convenio}</Td>
        <Td align="right" className="font-mono text-xs">
          {row.limite_credito}
        </Td>
        <Td align="right" className="font-mono text-xs">
          {formatCurrency(row.saldo_transito)}
        </Td>
        <Td
          align="right"
          className={`font-mono text-xs font-bold ${
            row.saldo_vencido > 0 ? "text-red-600" : "text-green-600"
          }`}
        >
          {formatCurrency(row.saldo_vencido)}
        </Td>
        <Td className="text-xs">{row.fecha_compra}</Td>
        <Td
          className="text-xs text-red-500 truncate max-w-[120px]"
          title={row.factura_morosidad}
        >
          {row.factura_morosidad}
        </Td>
        <Td align="right" className="font-mono text-xs">
          {formatCurrency(row.ultimo_cobro)}
        </Td>
        <Td>{row.sku_mes}</Td>
        <Td>
          <ClassificationBadge value={row.clasificacion} />
        </Td>
        <Td
          align="right"
          className="font-mono text-xs text-blue-600 bg-gray-50 dark:bg-[#202020]"
        >
          {formatCurrency(row.ventas_actual)}
        </Td>
        <Td
          align="right"
          className="font-mono text-xs text-gray-500 bg-gray-50 dark:bg-[#202020]"
        >
          {formatCurrency(row.ventas_anterior)}
        </Td>

        {/* --- SECCIÓN GESTIÓN --- */}
        <Td className="bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-[#333] min-w-[300px]">
          <EditableCell
            value={row.bitacora}
            onChange={(val) =>
              handleCompanyChange(row.id_interno, "bitacora", val)
            }
            placeholder="Bitácora..."
          />
        </Td>
        <Td className="bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-[#333] min-w-[300px]">
          <EditableCell
            value={row.obs_ejecutiva}
            onChange={(val) =>
              handleCompanyChange(row.id_interno, "obs_ejecutiva", val)
            }
            placeholder="Observación Ejecutiva..."
          />
        </Td>

        {/* --- AGENDA SEMANAL --- */}
        {renderDayCells("lunes", "bg-indigo-50 dark:bg-indigo-900/20")}
        {renderDayCells("martes", "bg-white dark:bg-[#1e1e1e]")}
        {renderDayCells("miercoles", "bg-indigo-50 dark:bg-indigo-900/20")}
        {renderDayCells("jueves", "bg-white dark:bg-[#1e1e1e]")}
        {renderDayCells(
          "viernes",
          "bg-indigo-50 dark:bg-indigo-900/20",
          "border-r border-gray-200 dark:border-[#333]",
        )}

        {/* Guardar */}
        <Td
          stickyRight
          className="bg-white dark:bg-[#191919] border-l shadow-[-4px_0_5px_-2px_rgba(0,0,0,0.1)]"
        >
          <div className="flex justify-center">
            <button
              onClick={() => handleSave(row)}
              className="p-2 text-white bg-[#1a9888] hover:bg-[#137a6d] rounded-lg transition shadow-sm"
            >
              <Save size={16} />
            </button>
          </div>
        </Td>
      </Tr>
    );
  },
);

// --- COMPONENTE PRINCIPAL ---
const BaseDatosBitrix = () => {
  const {
    companies,
    loading,
    // Filtros del Hook
    selectedSegments,
    setSelectedSegments,
    filterZona,
    setFilterZona,
    onlyVencidos,
    setOnlyVencidos,
    // Paginación
    page,
    totalPages,
    totalRecords,
    goToPage,
    // Acciones
    handleCompanyChange,
    refresh,
  } = useBaseDatosBitrix();

  const [jumpPage, setJumpPage] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(""); // Búsqueda por Nombre/ID en resultados

  const toggleSelect = useCallback((id_interno) => {
    setSelectedIds((prev) =>
      prev.includes(id_interno)
        ? prev.filter((id) => id !== id_interno)
        : [...prev, id_interno],
    );
  }, []);

  const toggleSelectAll = useCallback(
    (checked) => {
      if (checked) {
        const allIds = companies.map((c) => c.id_interno);
        setSelectedIds(allIds);
      } else {
        setSelectedIds([]);
      }
    },
    [companies],
  );

  // Filtro adicional para Nombre/ID dentro de la página actual
  const displayedCompanies = useMemo(() => {
    let result = companies;

    // Filtro Local por Nombre/ID
    if (localSearchTerm) {
      const term = localSearchTerm.toLowerCase();
      result = result.filter(
        (company) =>
          company.nombre?.toLowerCase().includes(term) ||
          company.id?.toString().includes(term) ||
          company.codigo_profit?.toLowerCase().includes(term),
      );
    }

    if (showOnlySelected) {
      result = result.filter((c) => selectedIds.includes(c.id_interno));
    }
    return result;
  }, [companies, localSearchTerm, showOnlySelected, selectedIds]);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  }, []);

  const handleSave = useCallback(async (companyData) => {
    const payload = {
      id_bitrix: companyData.id,
      codigo_profit: companyData.codigo_profit,
      gestion: {
        bitacora: companyData.bitacora,
        obs_ejecutiva: companyData.obs_ejecutiva,
        semana: {
          lunes: {
            accion: companyData.lunes_accion,
            observacion: companyData.lunes_observacion,
            tarea: companyData.lunes_tarea,
          },
          martes: {
            accion: companyData.martes_accion,
            observacion: companyData.martes_observacion,
            tarea: companyData.martes_tarea,
          },
          miercoles: {
            accion: companyData.miercoles_accion,
            observacion: companyData.miercoles_observacion,
            tarea: companyData.miercoles_tarea,
          },
          jueves: {
            accion: companyData.jueves_accion,
            observacion: companyData.jueves_observacion,
            tarea: companyData.jueves_tarea,
          },
          viernes: {
            accion: companyData.viernes_accion,
            observacion: companyData.viernes_observacion,
            tarea: companyData.viernes_tarea,
          },
        },
      },
      full_data: companyData,
    };
    console.log(
      "📦 PAYLOAD QUE SE ENVÍA AL BACKEND:",
      JSON.stringify(payload, null, 2),
    );
    try {
      // Usamos saveMatrix o saveConfig dependiendo de tu API
      const response = await apiService.saveMatrix(payload);
      if (response) {
        alert(`✅ Gestión de "${companyData.nombre}" guardada correctamente.`);
      }
    } catch (error) {
      console.error("❌ Error al guardar:", error);
      alert(`⚠️ Error al guardar datos de ${companyData.nombre}.`);
    }
  }, []);

  const handleJumpSubmit = (e) => {
    e.preventDefault();
    const p = parseInt(jumpPage);
    if (p >= 1 && p <= totalPages) {
      goToPage(p);
      setJumpPage("");
    } else {
      alert(`Página inválida (1-${totalPages})`);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-white dark:bg-[#191919]">
      {/* --- HEADER Y BARRA DE FILTROS --- */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg text-[#1a9888]">
            <Database size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#191919] dark:text-white">
              Auditoría de Clientes
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total: {totalRecords} | Visibles: {displayedCompanies.length} |
              Seleccionados: {selectedIds.length}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-start sm:items-center">
          {/* 1. INPUT ZONA (Filtro del Hook) */}
          <div className="relative w-full sm:w-48 group">
            <input
              type="text"
              placeholder="Filtrar Zona..."
              value={filterZona}
              onChange={(e) => setFilterZona(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a9888]/50 focus:border-[#1a9888] transition-all"
            />
            <Search
              size={16}
              className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-[#1a9888]"
            />
            {filterZona && (
              <button
                onClick={() => setFilterZona("")}
                className="absolute right-2 top-2.5 text-gray-400 hover:text-red-500"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* 2. SELECTOR SEGMENTOS (Filtro Backend) */}
          <FilterMultiSelect
            label="Segmentos"
            options={OPCIONES_SEGMENTOS}
            selected={selectedSegments}
            onChange={setSelectedSegments}
          />

          {/* 3. TOGGLE VENCIDOS (Filtro Hook) */}
          <button
            onClick={() => setOnlyVencidos(!onlyVencidos)}
            className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-all shadow-sm ${
              onlyVencidos
                ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300 ring-1 ring-red-200"
                : "bg-white border-gray-300 text-gray-700 dark:bg-[#262626] dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50"
            }`}
          >
            {onlyVencidos ? <CheckSquare size={16} /> : <Square size={16} />}
            <span>Solo Vencidos</span>
          </button>

          {/* 4. BUSCADOR LOCAL (Nombre/ID) */}
          <div className="relative w-full sm:w-48">
            <input
              type="text"
              placeholder="Buscar por Nombre/ID..."
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              className="w-full pl-3 pr-8 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-all"
            />
            {localSearchTerm && (
              <button
                onClick={() => setLocalSearchTerm("")}
                className="absolute right-2 top-2.5 text-gray-400 hover:text-red-500"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* FILTRO VER SELECCIONADOS */}
          <button
            onClick={() => setShowOnlySelected(!showOnlySelected)}
            className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all flex items-center gap-2 shadow-sm ${
              showOnlySelected
                ? "bg-[#1a9888] text-white border-[#1a9888]"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-[#1a9888]"
            }`}
          >
            <Filter size={16} />
            {showOnlySelected ? "Ver Todos" : "Ver Selec."}
          </button>

          {/* REFRESCAR */}
          <button
            onClick={refresh}
            disabled={loading}
            className="p-2 text-gray-500 bg-white border border-gray-300 hover:text-[#1a9888] hover:border-[#1a9888] hover:bg-teal-50 rounded-lg transition-all shadow-sm"
          >
            <RefreshCw
              size={20}
              className={loading ? "animate-spin text-[#1a9888]" : ""}
            />
          </button>
        </div>
      </div>

      <TableContainer>
        {loading ? (
          <div className="p-10 flex flex-col items-center justify-center text-gray-500">
            <RefreshCw className="animate-spin w-8 h-8 mb-2 text-[#1a9888]" />
            <span>Cargando página {page}...</span>
          </div>
        ) : (
          <Table>
            <Thead>
              {/* Nivel 1 Header */}
              <Tr className="bg-gray-50 dark:bg-[#1e1e1e] border-b-0">
                <Th className="bg-white dark:bg-[#191919] w-12 text-center border-r dark:border-[#333]">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-[#1a9888] cursor-pointer"
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    checked={
                      companies.length > 0 &&
                      selectedIds.length === companies.length
                    }
                  />
                </Th>
                <Th
                  colSpan={2}
                  className="border-b border-r border-gray-200 dark:border-[#333] text-[#1a9888] bg-white dark:bg-[#1e1e1e]"
                >
                  Empresa
                </Th>
                <Th
                  colSpan={6}
                  className="border-b border-r border-gray-200 dark:border-[#333] bg-blue-50 dark:bg-blue-900 text-blue-600 text-center"
                >
                  Datos Bitrix
                </Th>
                <Th
                  colSpan={5}
                  className="border-b border-r border-gray-200 dark:border-[#333] bg-green-50 dark:bg-green-900 text-green-600 text-center"
                >
                  Datos Profit
                </Th>
                <Th
                  colSpan={5}
                  className="border-b border-r border-gray-200 dark:border-[#333] text-purple-600 text-center bg-indigo-200 dark:bg-indigo-800"
                >
                  Ventas
                </Th>
                <Th
                  colSpan={2}
                  className="border-b border-r border-orange-300 dark:border-[#333] text-orange-600 font-bold bg-orange-200 dark:bg-orange-800 text-center"
                >
                  Gestión
                </Th>
                <Th
                  colSpan={15}
                  className="border-b border-r border-gray-200 dark:border-[#333] text-indigo-600 bg-indigo-50 dark:bg-indigo-900 text-center"
                >
                  Agenda Semanal (Acción / Obs / Tarea)
                </Th>
                <Th className="bg-white dark:bg-[#191919] border-l border-gray-200 dark:border-[#333]"></Th>
              </Tr>

              {/* Nivel 2 Header */}
              <Tr>
                <Th className="bg-white dark:bg-[#191919] border-r dark:border-[#333]"></Th>
                <Th className="min-w-[60px] bg-white dark:bg-[#191919]">ID</Th>
                <Th className="min-w-[200px] text-left bg-white dark:bg-[#191919] shadow-md">
                  Nombre
                </Th>
                <Th className="min-w-[120px] bg-blue-50 dark:bg-blue-800 font-bold">
                  Cód. Profit
                </Th>
                <Th className="min-w-[140px] bg-blue-50 dark:bg-blue-800 font-bold">
                  Ciudad
                </Th>
                <Th className="min-w-[140px] bg-blue-50 dark:bg-blue-800 font-bold">
                  Segmento
                </Th>
                <Th className="min-w-[160px] bg-blue-50 dark:bg-blue-800 font-bold">
                  Coordenadas
                </Th>
                <Th className="min-w-[200px] bg-blue-50 dark:bg-blue-800 font-bold">
                  Días Visita
                </Th>
                <Th className="min-w-[100px] bg-blue-50 dark:bg-blue-800 font-bold">
                  Convenio
                </Th>
                <Th className="min-w-[110px] bg-green-50 dark:bg-green-800 font-bold">
                  Límite
                </Th>
                <Th className="min-w-[110px] bg-green-50 dark:bg-green-800 font-bold">
                  Tránsito
                </Th>
                <Th className="min-w-[110px] bg-green-50 dark:bg-green-800 font-bold">
                  Vencido
                </Th>
                <Th className="min-w-[100px] bg-green-50 dark:bg-green-800 font-bold">
                  F. Compra
                </Th>
                <Th className="min-w-[200px] bg-green-50 dark:bg-green-800 font-bold">
                  F. Morosidad
                </Th>
                <Th className="min-w-[110px] bg-indigo-200 dark:bg-indigo-800 font-bold">
                  Últ. Cobro
                </Th>
                <Th className="min-w-[70px] bg-indigo-200 dark:bg-indigo-800 font-bold">
                  SKU
                </Th>
                <Th className="min-w-[70px] bg-indigo-200 dark:bg-indigo-800 font-bold">
                  Clasif.
                </Th>
                <Th className="min-w-[110px] bg-indigo-200 dark:bg-indigo-800 font-bold">
                  Actual
                </Th>
                <Th className="min-w-[110px] bg-indigo-200 dark:bg-indigo-800 font-bold">
                  Anterior
                </Th>

                {/* GESTIÓN */}
                <Th className="min-w-[300px] text-orange-600 font-bold bg-orange-200 dark:bg-orange-800">
                  Bitácora
                </Th>
                <Th className="min-w-[300px] text-orange-600 font-bold bg-orange-200 dark:bg-orange-800">
                  Obs. Ejec.
                </Th>

                {/* AGENDA SEMANAL */}
                <Th className="min-w-[150px] bg-indigo-50 dark:bg-indigo-900">
                  Lun-Acc
                </Th>
                <Th className="min-w-[150px] bg-indigo-50 dark:bg-indigo-900">
                  Lun-Obs
                </Th>
                <Th className="min-w-[150px] bg-indigo-50 dark:bg-indigo-900">
                  Lun-Tar
                </Th>

                <Th className="min-w-[150px] bg-white dark:bg-[#1e1e1e]">
                  Mar-Acc
                </Th>
                <Th className="min-w-[150px] bg-white dark:bg-[#1e1e1e]">
                  Mar-Obs
                </Th>
                <Th className="min-w-[150px] bg-white dark:bg-[#1e1e1e]">
                  Mar-Tar
                </Th>

                <Th className="min-w-[150px] bg-indigo-50 dark:bg-indigo-900">
                  Mie-Acc
                </Th>
                <Th className="min-w-[150px] bg-indigo-50 dark:bg-indigo-900">
                  Mie-Obs
                </Th>
                <Th className="min-w-[150px] bg-indigo-50 dark:bg-indigo-900">
                  Mie-Tar
                </Th>

                <Th className="min-w-[150px] bg-white dark:bg-[#1e1e1e]">
                  Jue-Acc
                </Th>
                <Th className="min-w-[150px] bg-white dark:bg-[#1e1e1e]">
                  Jue-Obs
                </Th>
                <Th className="min-w-[150px] bg-white dark:bg-[#1e1e1e]">
                  Jue-Tar
                </Th>

                <Th className="min-w-[150px] bg-indigo-50 dark:bg-indigo-900">
                  Vie-Acc
                </Th>
                <Th className="min-w-[150px] bg-indigo-50 dark:bg-indigo-900">
                  Vie-Obs
                </Th>
                <Th className="min-w-[150px] bg-indigo-50 dark:bg-indigo-900">
                  Vie-Tar
                </Th>

                <Th className="min-w-[80px] bg-white dark:bg-[#191919] border-l shadow-[-4px_0_5px_-2px_rgba(0,0,0,0.1)] text-center">
                  Guardar
                </Th>
              </Tr>
            </Thead>

            <Tbody>
              {displayedCompanies.length > 0 ? (
                displayedCompanies.map((row) => (
                  <CompanyRow
                    key={row.id_interno}
                    row={row}
                    isSelected={selectedIds.includes(row.id_interno)}
                    toggleSelect={toggleSelect}
                    handleCompanyChange={handleCompanyChange}
                    handleSave={handleSave}
                    formatCurrency={formatCurrency}
                  />
                ))
              ) : (
                <Tr>
                  <Td colSpan={40} className="text-center py-8 text-gray-500">
                    No se encontraron resultados para tu búsqueda.
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        )}
      </TableContainer>

      {/* Paginación */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4 mt-2 gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => goToPage(1)}
            disabled={page === 1}
            className="p-2 rounded-lg border dark:border-gray-600 disabled:opacity-50"
          >
            <ChevronsLeft size={16} />
          </button>
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className="flex items-center gap-1 px-3 py-2 text-sm border rounded-lg disabled:opacity-50 dark:bg-[#333] dark:text-gray-200"
          >
            <ChevronLeft size={16} /> Anterior
          </button>
          <span className="px-4 py-2 text-sm font-semibold text-[#1a9888] bg-teal-50 dark:bg-teal-900/20 rounded-lg">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
            className="flex items-center gap-1 px-3 py-2 text-sm border rounded-lg disabled:opacity-50 dark:bg-[#333] dark:text-gray-200"
          >
            Siguiente <ChevronRight size={16} />
          </button>
          <button
            onClick={() => goToPage(totalPages)}
            disabled={page === totalPages}
            className="p-2 rounded-lg border dark:border-gray-600 disabled:opacity-50"
          >
            <ChevronsRight size={16} />
          </button>
        </div>

        <form onSubmit={handleJumpSubmit} className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Ir a:</span>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={jumpPage}
            onChange={(e) => setJumpPage(e.target.value)}
            className="w-16 px-2 py-1 text-sm border rounded-md dark:bg-[#333] dark:text-white"
          />
          <button
            type="submit"
            className="px-3 py-1 text-xs font-bold text-white bg-gray-600 rounded-md"
          >
            IR
          </button>
        </form>
      </div>
    </div>
  );
};

export default BaseDatosBitrix;
