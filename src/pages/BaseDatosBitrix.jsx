import { useState } from "react";
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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Save,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  Search,
  X,
} from "lucide-react";
import { apiService } from "../services/apiService";

const ErrorAwareCell = ({ value, isError, icon = false }) => {
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
};

const EditableCell = ({ value, onChange, placeholder = "..." }) => (
  <div className="relative w-full">
    <input
      type="text"
      value={value !== undefined && value !== null ? value : ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full min-w-[100px] bg-white dark:bg-[#262626] border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm outline-none transition-all placeholder-gray-400 focus:ring-2 focus:ring-[#1a9888] focus:border-transparent dark:text-gray-200"
    />
    <Edit3
      size={12}
      className="absolute right-2 top-2.5 text-gray-400 pointer-events-none opacity-50"
    />
  </div>
);

const ClassificationBadge = ({ value }) => {
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
};

// --- COMPONENTE PRINCIPAL ---
const BaseDatosBitrix = () => {
  const {
    companies,
    loading,
    handleCompanyChange,
    page,
    totalPages,
    totalRecords,
    goToPage,
  } = useBaseDatosBitrix();

  // --- ESTADOS ---
  const [jumpPage, setJumpPage] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // <--- NUEVO ESTADO PARA BÚSQUEDA

  // --- LÓGICA DE SELECCIÓN ---
  const toggleSelect = (id_interno) => {
    setSelectedIds((prev) =>
      prev.includes(id_interno)
        ? prev.filter((id) => id !== id_interno)
        : [...prev, id_interno]
    );
  };

  const toggleSelectAll = (checked) => {
    if (checked) {
      const allIds = companies.map((c) => c.id_interno);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  // --- LÓGICA DE FILTRADO (Buscador + Switch Seleccionados) ---
  // 1. Primero filtramos por búsqueda
  const companiesFilteredBySearch = companies.filter((company) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();

    // Puedes añadir más campos aquí si lo necesitas
    return (
      company.nombre?.toLowerCase().includes(term) ||
      company.id?.toString().includes(term) ||
      company.codigo_profit?.toLowerCase().includes(term) ||
      company.ciudad?.toLowerCase().includes(term)
    );
  });

  // 2. Luego filtramos por "Mostrar solo seleccionados"
  const displayedCompanies = showOnlySelected
    ? companiesFilteredBySearch.filter((c) =>
        selectedIds.includes(c.id_interno)
      )
    : companiesFilteredBySearch;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  const handleSave = async (companyData) => {
    const payload = {
      id_bitrix: companyData.id,
      codigo_profit: companyData.codigo_profit,
      gestion: {
        bitacora: companyData.bitacora,
        obs_ejecutiva: companyData.obs_ejecutiva,
        semana: {
          lunes: {
            accion: companyData.lunes_accion,
            ejecucion: companyData.lunes_ejecucion,
          },
          martes: {
            accion: companyData.martes_accion,
            ejecucion: companyData.martes_ejecucion,
          },
          miercoles: {
            accion: companyData.miercoles_accion,
            ejecucion: companyData.miercoles_ejecucion,
          },
          jueves: {
            accion: companyData.jueves_accion,
            ejecucion: companyData.jueves_ejecucion,
          },
          viernes: {
            accion: companyData.viernes_accion,
            ejecucion: companyData.viernes_ejecucion,
          },
        },
      },
      full_data: companyData,
    };

    try {
      const response = await apiService.saveConfig(payload);
      if (response) {
        alert(`✅ Gestión de "${companyData.nombre}" guardada correctamente.`);
      }
    } catch (error) {
      console.error("❌ Error al guardar:", error);
      alert(`⚠️ Error al guardar datos de ${companyData.nombre}.`);
    }
  };

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
      {/* Header */}
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
          {/* --- BUSCADOR --- */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar cliente, ID, código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a9888]/50 focus:border-[#1a9888] transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* BOTÓN FILTRO SELECCIONADOS */}
          <button
            onClick={() => setShowOnlySelected(!showOnlySelected)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all flex items-center gap-2 shadow-sm ${
              showOnlySelected
                ? "bg-[#1a9888] text-white border-[#1a9888] ring-2 ring-[#1a9888]/20"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-[#1a9888]"
            }`}
          >
            <Filter size={16} />
            {showOnlySelected ? "Mostrar Todos" : "Ver Seleccionados"}
          </button>

          <div className="px-3 py-1 bg-red-50 text-red-600 rounded-lg border border-red-100 dark:bg-red-900/20 dark:border-red-800 flex items-center gap-2 text-xs h-[38px]">
            <AlertTriangle size={14} />
            <span>
              Errores:{" "}
              <strong>
                {
                  companies.filter(
                    (c) => !c.codigo_profit || c.codigo_profit === "0"
                  ).length
                }
              </strong>
            </span>
          </div>
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
              <Tr className="bg-gray-50 dark:bg-[#1e1e1e] border-b-0">
                {/* Checkbox Global */}
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
                  colSpan={8}
                  className="border-b border-r border-gray-200 dark:border-[#333] bg-green-50 dark:bg-green-900 text-green-600 text-center"
                >
                  Datos Profit
                </Th>
                <Th
                  colSpan={2}
                  className="border-b border-r border-gray-200 dark:border-[#333] text-purple-600 text-center bg-white dark:bg-[#1e1e1e]"
                >
                  Ventas
                </Th>
                <Th
                  colSpan={2}
                  className="border-b border-r border-gray-200 dark:border-[#333] text-gray-600 font-bold bg-gray-100 dark:bg-gray-800 text-center"
                >
                  Gestión
                </Th>
                <Th
                  colSpan={10}
                  className="border-b border-r border-gray-200 dark:border-[#333] text-indigo-600 bg-indigo-50 dark:bg-indigo-900 text-center"
                >
                  Agenda Semanal
                </Th>
                <Th className="bg-white dark:bg-[#191919] border-l border-gray-200 dark:border-[#333]"></Th>
              </Tr>
              <Tr>
                <Th className="bg-white dark:bg-[#191919] border-r dark:border-[#333]"></Th>
                <Th className="min-w-[60px] bg-white dark:bg-[#191919]">ID</Th>
                <Th className="min-w-[200px] text-left bg-white dark:bg-[#191919] shadow-md">
                  Nombre
                </Th>
                <Th className="min-w-[120px]">Cód. Profit</Th>
                <Th className="min-w-[140px]">Ciudad</Th>
                <Th className="min-w-[140px]">Segmento</Th>
                <Th className="min-w-[160px]">Coordenadas</Th>
                <Th className="min-w-[200px]">Días Visita</Th>
                <Th className="min-w-[100px]">Convenio</Th>
                <Th className="min-w-[110px]">Límite</Th>
                <Th className="min-w-[110px]">Tránsito</Th>
                <Th className="min-w-[110px]">Vencido</Th>
                <Th className="min-w-[100px]">F. Compra</Th>
                <Th className="min-w-[200px]">F. Morosidad</Th>
                <Th className="min-w-[110px]">Últ. Cobro</Th>
                <Th className="min-w-[70px]">SKU</Th>
                <Th className="min-w-[70px]">Clasif.</Th>
                <Th className="min-w-[110px]">Actual</Th>
                <Th className="min-w-[110px]">Anterior</Th>
                <Th className="min-w-[160px] bg-gray-100 dark:bg-gray-800">
                  Bitácora
                </Th>
                <Th className="min-w-[160px] bg-gray-100 dark:bg-gray-800">
                  Obs. Ejec.
                </Th>
                {/* Días de la semana ... */}
                <Th className="min-w-[140px] bg-indigo-50 dark:bg-indigo-900">
                  Lun-Acc
                </Th>
                <Th className="min-w-[140px] bg-indigo-50 dark:bg-indigo-900">
                  Lun-Eje
                </Th>
                <Th className="min-w-[140px] bg-white dark:bg-[#1e1e1e]">
                  Mar-Acc
                </Th>
                <Th className="min-w-[140px] bg-white dark:bg-[#1e1e1e]">
                  Mar-Eje
                </Th>
                <Th className="min-w-[140px] bg-indigo-50 dark:bg-indigo-900">
                  Mie-Acc
                </Th>
                <Th className="min-w-[140px] bg-indigo-50 dark:bg-indigo-900">
                  Mie-Eje
                </Th>
                <Th className="min-w-[140px] bg-white dark:bg-[#1e1e1e]">
                  Jue-Acc
                </Th>
                <Th className="min-w-[140px] bg-white dark:bg-[#1e1e1e]">
                  Jue-Eje
                </Th>
                <Th className="min-w-[140px] bg-indigo-50 dark:bg-indigo-900">
                  Vie-Acc
                </Th>
                <Th className="min-w-[140px] bg-indigo-50 dark:bg-indigo-900">
                  Vie-Eje
                </Th>
                <Th className="min-w-[80px] bg-white dark:bg-[#191919] border-l shadow-[-4px_0_5px_-2px_rgba(0,0,0,0.1)] text-center">
                  Guardar
                </Th>
              </Tr>
            </Thead>

            <Tbody>
              {displayedCompanies.length > 0 ? (
                displayedCompanies.map((row) => (
                  <Tr
                    key={row.id_interno}
                    className={
                      selectedIds.includes(row.id_interno)
                        ? "bg-teal-50/30 dark:bg-teal-900/10"
                        : ""
                    }
                  >
                    {/* Celda de Checkbox */}
                    <Td className="bg-white dark:bg-[#191919] border-r dark:border-[#333] text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-[#1a9888] cursor-pointer"
                        checked={selectedIds.includes(row.id_interno)}
                        onChange={() => toggleSelect(row.id_interno)}
                      />
                    </Td>

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

                    {/* Celdas de Datos (Igual al original) */}
                    <Td>
                      <ErrorAwareCell
                        value={row.codigo_profit}
                        isError={
                          !row.codigo_profit || row.codigo_profit === "0"
                        }
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
                    <Td
                      className="text-xs truncate max-w-[140px]"
                      title={row.dias_visita}
                    >
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
                        row.saldo_vencido > 0
                          ? "text-red-600"
                          : "text-green-600"
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

                    {/* Celdas Editables */}
                    <Td className="bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-[#333]">
                      <EditableCell
                        value={row.bitacora}
                        onChange={(val) =>
                          handleCompanyChange(row.id_interno, "bitacora", val)
                        }
                      />
                    </Td>
                    <Td className="bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-[#333]">
                      <EditableCell
                        value={row.obs_ejecutiva}
                        onChange={(val) =>
                          handleCompanyChange(
                            row.id_interno,
                            "obs_ejecutiva",
                            val
                          )
                        }
                      />
                    </Td>

                    {/* Lunes */}
                    <Td className="bg-indigo-50 dark:bg-indigo-900/20">
                      <EditableCell
                        value={row.lunes_accion}
                        onChange={(val) =>
                          handleCompanyChange(
                            row.id_interno,
                            "lunes_accion",
                            val
                          )
                        }
                      />
                    </Td>
                    <Td className="bg-indigo-50 dark:bg-indigo-900/20 border-r border-gray-200 dark:border-[#333]">
                      {/* Si no hay nada, muestra guion */}
                      {!row.gestion?.venta_descripcion &&
                      !row.gestion?.cobranza_descripcion ? (
                        "-"
                      ) : (
                        <div className="flex flex-col gap-1">
                          {/* Venta */}
                          {row.gestion?.venta_descripcion && (
                            <span
                              className="text-blue-600 block truncate max-w-[180px]"
                              title={row.gestion.venta_descripcion}
                            >
                              V: {row.gestion.venta_descripcion}
                            </span>
                          )}
                          {/* Cobranza */}
                          {row.gestion?.cobranza_descripcion && (
                            <span
                              className="text-teal-600 block truncate max-w-[180px]"
                              title={row.gestion.cobranza_descripcion}
                            >
                              C: {row.gestion.cobranza_descripcion}
                            </span>
                          )}
                        </div>
                      )}
                    </Td>
                    {/* <Td className="bg-indigo-50 dark:bg-indigo-900/20 border-r border-gray-200 dark:border-[#333]"><SelectCell value={row.lunes_ejecucion} onChange={(val) => handleCompanyChange(row.id_interno, 'lunes_ejecucion', val)} options={OPCIONES_EJECUCION} /></Td> */}
                    {/* Martes */}
                    <Td>
                      <EditableCell
                        value={row.martes_accion}
                        onChange={(val) =>
                          handleCompanyChange(
                            row.id_interno,
                            "martes_accion",
                            val
                          )
                        }
                      />
                    </Td>
                    <Td className=" dark:border-[#333]">
                      {/* Si no hay nada, muestra guion */}
                      {!row.gestion?.venta_descripcion &&
                      !row.gestion?.cobranza_descripcion ? (
                        "-"
                      ) : (
                        <div className="flex flex-col gap-1">
                          {/* Venta */}
                          {row.gestion?.venta_descripcion && (
                            <span
                              className="text-blue-600 block truncate max-w-[180px]"
                              title={row.gestion.venta_descripcion}
                            >
                              V: {row.gestion.venta_descripcion}
                            </span>
                          )}
                          {/* Cobranza */}
                          {row.gestion?.cobranza_descripcion && (
                            <span
                              className="text-teal-600 block truncate max-w-[180px]"
                              title={row.gestion.cobranza_descripcion}
                            >
                              C: {row.gestion.cobranza_descripcion}
                            </span>
                          )}
                        </div>
                      )}
                    </Td>
                    {/* Miércoles */}
                    <Td className="bg-indigo-50 dark:bg-indigo-900/20">
                      <EditableCell
                        value={row.miercoles_accion}
                        onChange={(val) =>
                          handleCompanyChange(
                            row.id_interno,
                            "miercoles_accion",
                            val
                          )
                        }
                      />
                    </Td>
                    <Td className="bg-indigo-50 dark:bg-indigo-900/20 border-r border-gray-200 dark:border-[#333]">
                      {/* Si no hay nada, muestra guion */}
                      {!row.gestion?.venta_descripcion &&
                      !row.gestion?.cobranza_descripcion ? (
                        "-"
                      ) : (
                        <div className="flex flex-col gap-1">
                          {/* Venta */}
                          {row.gestion?.venta_descripcion && (
                            <span
                              className="text-blue-600 block truncate max-w-[180px]"
                              title={row.gestion.venta_descripcion}
                            >
                              V: {row.gestion.venta_descripcion}
                            </span>
                          )}
                          {/* Cobranza */}
                          {row.gestion?.cobranza_descripcion && (
                            <span
                              className="text-teal-600 block truncate max-w-[180px]"
                              title={row.gestion.cobranza_descripcion}
                            >
                              C: {row.gestion.cobranza_descripcion}
                            </span>
                          )}
                        </div>
                      )}
                    </Td>
                    {/* Jueves */}
                    <Td>
                      <EditableCell
                        value={row.jueves_accion}
                        onChange={(val) =>
                          handleCompanyChange(
                            row.id_interno,
                            "jueves_accion",
                            val
                          )
                        }
                      />
                    </Td>
                    <Td className="dark:border-[#333]">
                      {/* Si no hay nada, muestra guion */}
                      {!row.gestion?.venta_descripcion &&
                      !row.gestion?.cobranza_descripcion ? (
                        "-"
                      ) : (
                        <div className="flex flex-col gap-1">
                          {/* Venta */}
                          {row.gestion?.venta_descripcion && (
                            <span
                              className="text-blue-600 block truncate max-w-[180px]"
                              title={row.gestion.venta_descripcion}
                            >
                              V: {row.gestion.venta_descripcion}
                            </span>
                          )}
                          {/* Cobranza */}
                          {row.gestion?.cobranza_descripcion && (
                            <span
                              className="text-teal-600 block truncate max-w-[180px]"
                              title={row.gestion.cobranza_descripcion}
                            >
                              C: {row.gestion.cobranza_descripcion}
                            </span>
                          )}
                        </div>
                      )}
                    </Td>
                    {/* Viernes */}
                    <Td className="bg-indigo-50 dark:bg-indigo-900/20">
                      <EditableCell
                        value={row.viernes_accion}
                        onChange={(val) =>
                          handleCompanyChange(
                            row.id_interno,
                            "viernes_accion",
                            val
                          )
                        }
                      />
                    </Td>
                    <Td className="bg-indigo-50 dark:bg-indigo-900/20 border-r border-gray-200 dark:border-[#333]">
                      {/* Si no hay nada, muestra guion */}
                      {!row.gestion?.venta_descripcion &&
                      !row.gestion?.cobranza_descripcion ? (
                        "-"
                      ) : (
                        <div className="flex flex-col gap-1">
                          {/* Venta */}
                          {row.gestion?.venta_descripcion && (
                            <span
                              className="text-blue-600 block truncate max-w-[180px]"
                              title={row.gestion.venta_descripcion}
                            >
                              V: {row.gestion.venta_descripcion}
                            </span>
                          )}
                          {/* Cobranza */}
                          {row.gestion?.cobranza_descripcion && (
                            <span
                              className="text-teal-600 block truncate max-w-[180px]"
                              title={row.gestion.cobranza_descripcion}
                            >
                              C: {row.gestion.cobranza_descripcion}
                            </span>
                          )}
                        </div>
                      )}
                    </Td>

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
                ))
              ) : (
                <Tr>
                  <Td colSpan={30} className="text-center py-8 text-gray-500">
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
