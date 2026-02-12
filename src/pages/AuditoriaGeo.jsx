/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useAuditoriaGeo } from "../hooks/useAuditoriaGeo";
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
  MapPin,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Navigation,
  Edit3,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Database,
  Layers,
} from "lucide-react";

// --- HELPERS VISUALES ---

// 1. StatCard (Nuevo componente para consistencia visual)
const StatCard = ({ icon: Icon, label, value, colorClass, iconColor }) => (
  <div
    className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${colorClass} shadow-sm min-w-[140px]`}
  >
    <div className={`p-2 rounded-lg ${iconColor}`}>
      <Icon size={18} />
    </div>
    <div>
      <p className="text-[10px] uppercase font-bold opacity-70 leading-none mb-1">
        {label}
      </p>
      <p className="text-lg font-black leading-none">{value}</p>
    </div>
  </div>
);

// 2. Lógica de Color de Fila
const getRowColor = (status) => {
  switch (status) {
    case "MATCH":
      return "bg-green-50 hover:bg-green-100 dark:bg-green-900/10 dark:hover:bg-green-900/20";
    case "CLOSE":
      return "bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/10 dark:hover:bg-yellow-900/20";
    case "MISSING_BOTH":
    case "MISSING_PROFIT":
    case "MISSING_BITRIX":
      return "bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20";
    default:
      return "bg-white hover:bg-slate-50 dark:bg-[#111827] dark:hover:bg-white/5";
  }
};

// 3. Badge de Estado
const GeoStatusBadge = ({ status, distance }) => {
  let icon = <AlertTriangle size={14} />;
  let text = status;
  let colorClass =
    "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";

  switch (status) {
    case "MATCH":
      icon = <CheckCircle size={14} />;
      text = "EXACTO";
      colorClass =
        "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
      break;
    case "CLOSE": {
      const metros = distance ? (distance * 1000).toFixed(0) : 0;
      icon = <Navigation size={14} />;
      text = `DIF: ${metros}m`;
      colorClass =
        "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800";
      break;
    }
    case "MISSING_BOTH":
      icon = <XCircle size={14} />;
      text = "SIN DATA";
      colorClass =
        "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
      break;
    case "MISSING_PROFIT":
      text = "FALTA PROFIT";
      colorClass =
        "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800";
      break;
    case "MISSING_BITRIX":
      text = "FALTA BITRIX";
      colorClass =
        "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
      break;
  }

  return (
    <div
      className={`flex items-center justify-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold w-full max-w-[120px] shadow-sm ${colorClass}`}
    >
      {icon}
      <span>{text}</span>
    </div>
  );
};

// 4. Input Editable
const EditableCell = ({ value, onChange, placeholder = "..." }) => (
  <div className="relative w-full">
    <input
      type="text"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full min-w-[100px] bg-white dark:bg-[#262626] border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-xs outline-none transition-all placeholder-gray-400 focus:ring-2 focus:ring-[#1a9888] focus:border-transparent dark:text-gray-200 shadow-sm"
    />
    <Edit3
      size={12}
      className="absolute right-2 top-2 text-gray-400 pointer-events-none opacity-50"
    />
  </div>
);

// --- COMPONENTE PRINCIPAL ---
const AuditoriaGeo = () => {
  const {
    auditData,
    loading,
    handleAuditChange,
    page,
    totalPages,
    totalRecords,
    goToPage,
  } = useAuditoriaGeo();

  const [jumpPage, setJumpPage] = useState("");

  const handleJumpSubmit = (e) => {
    e.preventDefault();
    const p = parseInt(jumpPage);
    if (p >= 1 && p <= totalPages) {
      goToPage(p);
      setJumpPage("");
    } else {
      alert(`Por favor ingresa una página entre 1 y ${totalPages}`);
    }
  };

  const problemCount = auditData.filter((r) =>
    r.status.includes("MISSING"),
  ).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-white dark:bg-[#0b1120]">
      {/* --- HEADER --- */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8 border-b border-gray-200 dark:border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <div className="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-2xl">
            <MapPin size={32} className="text-[#1a9888] dark:text-teal-400" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
              Auditoría de{" "}
              <span className="text-[#1a9888] dark:text-teal-400">
                Coordenadas
              </span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              Validación cruzada entre Profit y Bitrix
            </p>
          </div>
        </div>

        {/* --- STATS CARDS --- */}
        <div className="flex flex-wrap gap-3">
          <StatCard
            icon={Database}
            label="Registros"
            value={totalRecords}
            colorClass="bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-300"
            iconColor="text-slate-500"
          />
          <StatCard
            icon={Layers}
            label="Páginas"
            value={totalPages}
            colorClass="bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300"
            iconColor="text-blue-500"
          />
          <StatCard
            icon={AlertTriangle}
            label="Problemas (Pag)"
            value={problemCount}
            colorClass="bg-red-50 border-red-100 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"
            iconColor="text-red-500"
          />
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
              <Tr className="border-b-0">
                <Th
                  colSpan={2}
                  stickyTop
                  className="border-b border-r border-gray-200 dark:border-[#333] text-slate-700 dark:text-slate-300 bg-gray-100 dark:bg-[#1e1e1e] z-20 text-center"
                >
                  CLIENTE
                </Th>
                <Th
                  colSpan={2}
                  stickyTop
                  className="border-b border-r border-gray-200 dark:border-[#333] bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 z-20 text-center"
                >
                  UBICACIÓN
                </Th>
                <Th
                  colSpan={1}
                  stickyTop
                  className="border-b border-r border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300 z-20 text-center"
                >
                  PROFIT
                </Th>
                <Th
                  colSpan={2}
                  stickyTop
                  className="border-b border-r border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/40 z-20 text-center"
                >
                  BITRIX
                </Th>
                <Th
                  colSpan={2}
                  stickyTop
                  className="border-b border-gray-200 dark:border-[#333] text-gray-600 dark:text-gray-400 font-bold bg-gray-100 dark:bg-gray-800 z-20 text-center"
                >
                  AUDITORÍA
                </Th>
              </Tr>

              {/* Nivel 2 Header */}
              <Tr className="border-b border-gray-200 dark:border-[#333]">
                <Th className="min-w-[100px] bg-white dark:bg-[#1e1e1e] z-10 text-xs uppercase text-gray-500">
                  Código
                </Th>
                <Th className="min-w-[250px] text-left bg-white dark:bg-[#1e1e1e] shadow-md z-10 border-r border-gray-100 dark:border-gray-800 text-xs uppercase text-gray-500">
                  Nombre Cliente
                </Th>

                <Th className="min-w-[150px] bg-white dark:bg-[#1e1e1e] text-xs uppercase text-gray-500">
                  Zona
                </Th>
                <Th className="min-w-[120px] bg-white dark:bg-[#1e1e1e] border-r border-gray-100 dark:border-gray-800 text-xs uppercase text-gray-500">
                  Ruta
                </Th>

                <Th className="min-w-[180px] bg-green-50 dark:bg-green-900 border-r border-green-100 dark:border-green-900 text-xs uppercase text-green-700 dark:text-green-500 text-center">
                  Coordenadas
                </Th>

                <Th className="min-w-[100px] bg-blue-50 dark:bg-blue-900 text-xs uppercase text-blue-700 dark:text-blue-500 text-center">
                  ID
                </Th>
                <Th className="min-w-[180px] bg-blue-50 dark:bg-blue-900 border-r border-blue-100 dark:border-blue-900 text-xs uppercase text-blue-700 dark:text-blue-500 text-center">
                  Coordenadas
                </Th>

                <Th className="min-w-[160px] text-center bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500">
                  Estado
                </Th>
                <Th className="min-w-[200px] bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500">
                  Observación
                </Th>
              </Tr>
            </Thead>

            <Tbody>
              {auditData.map((row) => (
                <Tr key={row.id_interno} className={getRowColor(row.status)}>
                  {/* Sticky Columns */}
                  <Td className="bg-slate-50 dark:bg-[#0b1120] text-xs font-mono font-bold text-slate-700 dark:text-slate-300 z-10 transition-colors">
                    {row.codigo_profit}
                  </Td>
                  <Td className="text-left font-semibold bg-white dark:bg-[#111827] border-r dark:border-white/5 shadow-md text-xs z-10 transition-colors">
                    <div className="truncate max-w-[250px]" title={row.nombre}>
                      {row.nombre}
                    </div>
                  </Td>

                  {/* Location */}
                  <Td className="text-xs transition-colors">{row.zona}</Td>
                  <Td className="transition-colors border-r border-gray-200 dark:border-white/5">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${
                        row.ruta && row.ruta.includes("CERRADO")
                          ? "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:border-red-900 dark:text-red-300"
                          : "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
                      }`}
                    >
                      {row.ruta}
                    </span>
                  </Td>

                  {/* Profit */}
                  <Td className="font-mono text-[10px] text-center text-slate-500 bg-green-50 border-r border-green-100 dark:bg-green-900 dark:border-white/5 transition-colors">
                    {row.coords_profit || "-"}
                  </Td>

                  {/* Bitrix */}
                  <Td className="font-mono text-xs text-center text-blue-600 font-bold bg-blue-50 dark:bg-blue-900 transition-colors">
                    {row.id_bitrix}
                  </Td>
                  <Td className="font-mono text-[10px] text-center text-slate-500 bg-blue-50 border-r border-blue-100 dark:bg-blue-900 dark:border-white/5 transition-colors">
                    {row.coords_bitrix || "-"}
                  </Td>

                  {/* Auditoría */}
                  <Td className="flex justify-center transition-colors py-2">
                    <GeoStatusBadge
                      status={row.status}
                      distance={row.distancia}
                    />
                  </Td>
                  <Td className="bg-white dark:bg-[#111827] transition-colors">
                    <EditableCell
                      value={row.obs_auditor}
                      onChange={(val) => handleAuditChange(row.id_interno, val)}
                      placeholder="Validar..."
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </TableContainer>

      {/* --- PAGINACIÓN --- */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4 mt-2 gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => goToPage(1)}
            disabled={page === 1}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300"
          >
            <ChevronsLeft size={16} />
          </button>
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 dark:bg-[#333] dark:text-gray-200 dark:border-gray-600"
          >
            <ChevronLeft size={16} /> Anterior
          </button>
          <span className="px-4 py-2 text-sm font-semibold text-[#1a9888] bg-teal-50 rounded-lg border border-teal-100 dark:bg-teal-900/20 dark:border-teal-800">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 dark:bg-[#333] dark:text-gray-200 dark:border-gray-600"
          >
            Siguiente <ChevronRight size={16} />
          </button>
          <button
            onClick={() => goToPage(totalPages)}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
        <form onSubmit={handleJumpSubmit} className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Ir a pág:
          </span>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={jumpPage}
            onChange={(e) => setJumpPage(e.target.value)}
            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a9888] dark:bg-[#333] dark:border-gray-600 dark:text-white"
          />
          <button
            type="submit"
            className="px-3 py-1 text-xs font-bold text-white bg-gray-600 rounded-md hover:bg-gray-700"
          >
            IR
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuditoriaGeo;
