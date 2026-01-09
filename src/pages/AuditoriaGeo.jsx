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
  Save,
} from "lucide-react";

// --- HELPERS VISUALES ---

// 1. Lógica de Color de Fila
const getRowColor = (status) => {
  switch (status) {
    case "MATCH":
      return "bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30";
    case "CLOSE":
      return "bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30";
    case "MISSING_BOTH":
    case "MISSING_PROFIT":
    case "MISSING_BITRIX":
      return "bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30";
    default:
      return "bg-white hover:bg-gray-50 dark:bg-[#191919] dark:hover:bg-[#202020]";
  }
};

// 2. Badge de Estado
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
      className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-bold w-fit ${colorClass}`}
    >
      {icon}
      <span>{text}</span>
    </div>
  );
};

// 3. Input Editable
const EditableCell = ({ value, onChange, placeholder = "..." }) => (
  <div className="relative w-full">
    <input
      type="text"
      value={value || ""}
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-white dark:bg-[#191919]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg text-[#1a9888]">
            <MapPin size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#191919] dark:text-white">
              Auditoría de Coordenadas
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Registros: {totalRecords} | Páginas: {totalPages}
            </p>
          </div>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="px-3 py-1 bg-red-50 text-red-600 rounded-full border border-red-100 dark:bg-red-900/20 dark:border-red-800 flex items-center gap-2">
            <AlertTriangle size={14} />
            <span>
              Problemas:{" "}
              <strong>
                {auditData.filter((r) => r.status.includes("MISSING")).length}
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
              {/* CORRECCIÓN AQUÍ: 
                                1. bg-gray-50 aplicado DIRECTAMENTE a cada Th.
                                2. z-20 añadido para que estén por encima del contenido.
                                3. stickyTop añadido a todos para que no se oculte al bajar.
                            */}
              <Tr className="border-b-0">
                <Th
                  colSpan={2}
                  stickyTop
                  className="border-b border-r border-gray-200 dark:border-[#333] text-[#1a9888] bg-gray-50 dark:bg-[#1e1e1e] z-20"
                >
                  CLIENTE
                </Th>
                <Th
                  colSpan={2}
                  stickyTop
                  className="border-b border-r border-gray-200 dark:border-[#333] bg-blue-100 dark:bg-blue-900 text-blue-600 z-20"
                >
                  UBICACIÓN
                </Th>
                <Th
                  colSpan={1}
                  stickyTop
                  className="border-b border-r border-gray-200 dark:border-[#333] text-green-600 bg-green-50 dark:bg-green-900 z-20"
                >
                  PROFIT
                </Th>
                <Th
                  colSpan={2}
                  stickyTop
                  className="border-b border-r border-gray-200 dark:border-[#333] text-blue-600 bg-blue-50 dark:bg-blue-900 z-20"
                >
                  BITRIX
                </Th>
                <Th
                  colSpan={2}
                  stickyTop
                  className="border-b border-gray-200 dark:border-[#333] text-gray-600 font-bold bg-gray-100 dark:bg-gray-800 z-20"
                >
                  AUDITORÍA
                </Th>
              </Tr>

              {/* SEGUNDA FILA:
                                1. bg-white aplicado DIRECTAMENTE a cada Th.
                                2. top-[value] añadido si quisieras que esta fila también sea sticky (la dejaré normal para que se oculte bajo la primera si así lo deseas, o sólida para que no transparente).
                            */}
              <Tr className="border-b border-gray-200 dark:border-[#333]">
                <Th className="min-w-[100px] bg-white dark:bg-[#1e1e1e] z-10">
                  Código
                </Th>
                <Th className="min-w-[250px] text-left bg-white dark:bg-[#1e1e1e] shadow-md z-10">
                  Nombre Cliente
                </Th>

                <Th className="min-w-[150px] bg-white dark:bg-[#1e1e1e]">
                  Zona
                </Th>
                <Th className="min-w-[120px] bg-white dark:bg-[#1e1e1e]">
                  Ruta
                </Th>

                <Th className="min-w-[180px] bg-green-50 dark:bg-green-900">
                  Coordenadas
                </Th>

                <Th className="min-w-[100px] bg-blue-50 dark:bg-blue-900">
                  ID
                </Th>
                <Th className="min-w-[180px] bg-blue-50 dark:bg-blue-900">
                  Coordenadas
                </Th>

                <Th className="min-w-[160px] text-center bg-gray-100 dark:bg-gray-800">
                  Estado
                </Th>
                <Th className="min-w-[200px] bg-gray-100 dark:bg-gray-800">
                  Observación
                </Th>
              </Tr>
            </Thead>

            <Tbody>
              {auditData.map((row) => (
                <Tr key={row.id_interno} className={getRowColor(row.status)}>
                  {/* Sticky Columns */}
                  <Td className="bg-gray-50 dark:bg-[#202020] text-xs font-mono font-bold text-gray-700 dark:text-gray-300 z-10">
                    {row.codigo_profit}
                  </Td>
                  <Td className="text-left font-semibold bg-white dark:bg-[#191919] border-r shadow-md text-xs z-10">
                    <div className="truncate max-w-[250px]" title={row.nombre}>
                      {row.nombre}
                    </div>
                  </Td>

                  {/* Location */}
                  <Td className="text-xs">{row.zona}</Td>
                  <Td>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        row.ruta && row.ruta.includes("CERRADO")
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {row.ruta}
                    </span>
                  </Td>

                  {/* Profit */}
                  <Td className="font-mono text-[10px] text-gray-500 bg-green-50 border-l border-gray-200 dark:bg-green-900/10 dark:border-[#333]">
                    {row.coords_profit || "-"}
                  </Td>

                  {/* Bitrix */}
                  <Td className="font-mono text-xs text-blue-600 font-bold bg-blue-50 border-l border-gray-200 dark:bg-blue-900/10 dark:border-[#333]">
                    {row.id_bitrix}
                  </Td>
                  <Td className="font-mono text-[10px] text-gray-500 bg-blue-50 dark:bg-blue-900/10">
                    {row.coords_bitrix || "-"}
                  </Td>

                  {/* Auditoría */}
                  <Td className="flex justify-center border-l border-gray-200 dark:border-[#333]">
                    <GeoStatusBadge
                      status={row.status}
                      distance={row.distancia}
                    />
                  </Td>
                  <Td className="bg-white dark:bg-[#191919]">
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
