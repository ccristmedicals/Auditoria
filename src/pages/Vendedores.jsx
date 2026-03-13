/* eslint-disable react-hooks/set-state-in-effect */
import { useMemo, useState, useEffect } from "react";
import {
  Users,
  Search,
  TrendingUp,
  Target,
  CheckCircle2,
  // MapPin,
  // Store,
  Loader2,
  // Navigation,
} from "lucide-react";

import { useToast } from "../components/ui/Toast";
import { useTableroVendedores } from "../hooks/useTableroVendedores";
import {
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "../components/ui/Tabla";

// --- HELPERS ---
const formatCurrency = (val) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" }).format(
    val || 0,
  );

const formatPercent = (val) => `${Number(val || 0).toFixed(0)}%`;

const StatCard = ({ label, value, icon: Icon, colorHex }) => (
  <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
    <div
      className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
      style={{ color: colorHex }}
    >
      {Icon && <Icon size={24} />}
    </div>
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-2xl font-black text-gray-800 dark:text-white leading-none mt-1">
        {value}
      </p>
    </div>
  </div>
);

const ObservacionCell = ({ valorInicial, onGuardar }) => {
  const [valor, setValor] = useState(valorInicial);
  useEffect(() => setValor(valorInicial), [valorInicial]);

  const handleBlur = () => {
    if (valor !== valorInicial) onGuardar(valor);
  };

  return (
    <textarea
      className="w-full h-16 p-2 text-xs border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[#1a9888] focus:border-transparent outline-none resize-none placeholder-gray-300 dark:text-white transition-all"
      placeholder="Nota..."
      value={valor}
      onChange={(e) => setValor(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) e.target.blur();
      }}
    />
  );
};

const Vendedores = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { showToast, ToastContainer } = useToast();
  const {
    vendedores: rawData,
    loading,
    actualizarObservacion,
  } = useTableroVendedores();

  const filteredData = useMemo(() => {
    if (!searchTerm) return rawData;
    const term = searchTerm.toLowerCase();
    return rawData.filter((v) => v.vendedor.toLowerCase().includes(term));
  }, [rawData, searchTerm]);

  const totals = useMemo(() => {
    return {
      logrados: filteredData.reduce(
        (acc, curr) => acc + curr.reportesLogrados,
        0,
      ),
      establecidos: filteredData.reduce(
        (acc, curr) => acc + curr.reportesEstablecidos,
        0,
      ),
      cobrado: filteredData.reduce((acc, curr) => acc + curr.cobradoDia, 0),
    };
  }, [filteredData]);

  const totalCumplimiento =
    totals.establecidos > 0 ? (totals.logrados / totals.establecidos) * 100 : 0;

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-[#0b1120]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[#1a9888] animate-spin" />
          <p className="text-slate-600 dark:text-slate-300 font-medium animate-pulse">
            Sincronizando Profit & Planificación...
          </p>
        </div>
      </div>
    );

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-white dark:bg-[#0b1120]">
      {/* HEADER */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8 border-b border-gray-200 dark:border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <div className="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-2xl">
            <Users size={32} className="text-[#1a9888] dark:text-teal-400" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
              Tabla de{" "}
              <span className="text-[#1a9888] dark:text-teal-400">
                Vendedores
              </span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Auditoría Profit 
              {/* &bull; Geolocalización en tiempo real */}
            </p>
          </div>
        </div>

        <div className="relative w-full xl:w-96">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Buscar vendedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#1a2333] border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-[#1a9888]/20 dark:text-white text-sm font-medium transition-all"
          />
        </div>
      </div>

      {/* KPIS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Visitas Logradas"
          value={totals.logrados}
          icon={CheckCircle2}
          colorHex="#059669"
        />
        <StatCard
          label="% Cumplimiento"
          value={formatPercent(totalCumplimiento)}
          icon={TrendingUp}
          colorHex={totalCumplimiento >= 90 ? "#059669" : "#d97706"}
        />
        <StatCard
          label="Cobrado Hoy"
          value={formatCurrency(totals.cobrado)}
          icon={Target}
          colorHex="#2563eb"
        />
      </div>

      {/* TABLA */}
      <TableContainer className="shadow-none border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-[#111827]">
        <Table>
          <Thead>
            <tr className="uppercase leading-tight">
              {/* 1. VENDEDOR */}
              <Th className="bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-100 min-w-50 border-b dark:border-gray-700 font-bold">
                Vendedores_P Profit
              </Th>
              {/* 2. SALIDA */}
              <Th className="bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 border-b dark:border-gray-700 font-bold">
                Salida
              </Th>
              {/* 3. LLEGADA */}
              <Th className="bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 border-b dark:border-gray-700 font-bold">
                Llegada
              </Th>
              {/* 4. PLAN */}
              <Th className="bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 border-b dark:border-gray-700 font-bold">
                Rep. Establecidos
              </Th>
              {/* 5. REAL */}
              <Th className="bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 border-b dark:border-gray-700 font-bold">
                Rep. Logrados
              </Th>
              {/* 6. % CUMPLIMIENTO */}
              <Th className="bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 border-b dark:border-gray-700 font-bold">
                % Visitas
              </Th>
              {/* 7. LOGRADO (Faltante) */}
              <Th className="bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 border-b dark:border-gray-700 font-bold">
                Logrado (Resta)
              </Th>
              {/* 8. GEOCERCA */}
              {/* <Th className="bg-yellow-50 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100 min-w-55 text-center border-b dark:border-gray-700 font-bold">
                Geocerca
              </Th> */}
              {/* 9. NEGOCIACIONES */}
              <Th className="bg-indigo-50 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100 border-b dark:border-gray-700 font-bold">
                Negoc.
              </Th>
              {/* 10. COBRADO */}
              <Th className="bg-orange-50 dark:bg-orange-900 text-orange-900 dark:text-orange-100 min-w-30 border-b dark:border-gray-700 font-bold">
                Cobrado Día
              </Th>
              {/* 11. % COBRANZA */}
              {/* <Th className="bg-orange-50 dark:bg-orange-900 text-orange-900 dark:text-orange-100 border-b dark:border-gray-700 font-bold">
                % Cobranza del Día
              </Th> */}
              {/* 12. VENTAS */}
              <Th className="bg-amber-50 dark:bg-amber-900 text-amber-900 dark:text-amber-100 min-w-30 border-b dark:border-gray-700 font-bold">
                Ventas
              </Th>
              {/* 13. CARTERA */}
              <Th className="bg-cyan-50 dark:bg-cyan-900 text-cyan-900 dark:text-cyan-100 border-b dark:border-gray-700 font-bold">
                Cartera Activa
              </Th>
              {/* 14. % META */}
              <Th className="bg-cyan-50 dark:bg-cyan-900 text-cyan-900 dark:text-cyan-100 border-b dark:border-gray-700 font-bold">
                % Meta
              </Th>
              {/* 15. NUEVOS */}
              <Th className="bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 border-b dark:border-gray-700 font-bold">
                Nuevos
              </Th>
              {/* 16. GESTIONES PLANIF */}
              <Th className="bg-rose-50 dark:bg-rose-900 text-rose-900 dark:text-rose-100 border-b dark:border-gray-700 font-bold">
                Gest. Planif.
              </Th>
              {/* 17. CUMPLIMIENTO PLANIF */}
              <Th className="bg-rose-50 dark:bg-rose-900 text-rose-900 dark:text-rose-100 border-b dark:border-gray-700 font-bold">
                % Planif.
              </Th>
              {/* 18. OBSERVACION */}
              <Th className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 min-w-50 border-b dark:border-gray-700 font-bold">
                Observación
              </Th>
            </tr>
          </Thead>

          <Tbody>
            {filteredData.length === 0 ? (
              <Tr>
                <Td colSpan={18} className="py-20 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Search size={40} strokeWidth={1} />
                    <p className="font-medium">No se encontraron vendedores</p>
                  </div>
                </Td>
              </Tr>
            ) : (
              filteredData.map((row) => {
                const percVisitas =
                  row.reportesEstablecidos > 0
                    ? (row.reportesLogrados / row.reportesEstablecidos) * 100
                    : 0;
                const restaLogrado =
                  row.reportesEstablecidos - row.reportesLogrados;
                // const percCobranza =
                //   row.metaCobranza > 0
                //     ? (row.cobrado_dia / row.metaCobranza) * 100
                //     : 0;
                const percMetaMensual =
                  row.metaVentasMensual > 0
                    ? (row.ventas / row.metaVentasMensual) * 100
                    : 0;
                // CORRECCIÓN APLICADA: LOGRADO / PLANIFICADO
                // Muestra qué porcentaje de la ruta asignada fue cubierta realmente.
                const percPlanificado =
                  row.gestionesPlanificacion > 0
                    ? (row.reportesLogrados / row.gestionesPlanificacion) * 100
                    : 0;

                return (
                  <Tr
                    key={row.id}
                    className="hover:bg-gray-50 dark:hover:bg-[#1a2333]"
                  >
                    {/* 1. VENDEDOR */}
                    <Td
                      align="left"
                      className="font-black border-r border-gray-200 dark:border-gray-800 text-xs text-gray-800 dark:text-gray-200"
                    >
                      {row.vendedor}
                    </Td>
                    {/* 2. SALIDA */}
                    <Td>{row.horaSalida}</Td>
                    {/* 3. LLEGADA */}
                    <Td>{row.horaLlegada}</Td>
                    {/* 4. ESTABLECIDOS */}
                    <Td className="font-medium text-center">
                      {row.reportesEstablecidos}
                    </Td>
                    {/* 5. LOGRADOS */}
                    <Td className="font-bold text-center text-slate-900 dark:text-white">
                      {row.reportesLogrados}
                    </Td>
                    {/* 6. % VISITAS */}
                    <Td className="text-center">
                      <span
                        className={`px-2 py-1 rounded-md text-[11px] font-bold border ${percVisitas >= 90 ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-rose-100 text-rose-800 border-rose-200"}`}
                      >
                        {formatPercent(percVisitas)}
                      </span>
                    </Td>
                    {/* 7. RESTA */}
                    <Td className="font-bold text-center text-emerald-700 dark:text-emerald-400">
                      {restaLogrado}
                    </Td>

                    {/* 8. GEOCERCA */}
                    {/* <Td className="text-center p-2 align-middle">
                      {row.direccionTexto === "Sin actividad" ? (
                        <span className="text-[10px] text-gray-400 italic">
                          -- Inactivo --
                        </span>
                      ) : (
                        <div className="flex flex-col items-center gap-1 py-1">
                          <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 font-bold text-[11px]">
                            <Store size={12} className="shrink-0" />
                            <span
                              className="truncate max-w-37.5"
                              title={row.ultimoCliente}
                            >
                              {row.ultimoCliente}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 max-w-45">
                            <MapPin
                              size={10}
                              className="shrink-0 text-slate-400"
                            />
                            <span
                              className="truncate"
                              title={row.direccionTexto}
                            >
                              {row.direccionTexto}
                            </span>
                          </div>
                          {row.pctGeocerca > 0 && (
                            <div
                              className={`text-[9px] font-bold px-1.5 rounded border ${row.pctGeocerca >= 80 ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}`}
                            >
                              {row.pctGeocerca}% OK
                            </div>
                          )}
                        </div>
                      )}
                    </Td> */}

                    {/* 9. NEGOCIACIONES */}
                    <Td className="text-center">{row.negociaciones}</Td>

                    {/* 10. COBRADO */}
                    <Td className="text-right text-blue-600 dark:text-blue-400 font-bold text-xs">
                      {formatCurrency(row.cobradoDia)}
                    </Td>

                    {/* 11. % COBRO */}
                    {/* <Td className="text-center font-bold">
                      {formatPercent(percCobranza)}
                    </Td> */}

                    {/* 12. VENTAS */}
                    <Td className="text-right text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                      {formatCurrency(row.ventas)}
                    </Td>

                    {/* 13. CARTERA */}
                    <Td className="text-center">{row.carteraActiva}</Td>

                    {/* 14. % META */}
                    <Td className="text-center font-bold">
                      {formatPercent(percMetaMensual)}
                    </Td>

                    {/* 15. NUEVOS */}
                    <Td className="text-center text-blue-500 font-bold">
                      {row.nuevosRecuperados}
                    </Td>

                    {/* 16. GESTIONES PLANIF */}
                    <Td className="text-center">
                      {row.gestionesPlanificacion}
                    </Td>

                    {/* 17. % PLANIF */}
                    <Td className="text-center font-bold text-rose-600 dark:text-rose-400">
                      {formatPercent(percPlanificado)}
                    </Td>

                    {/* 18. OBSERVACION */}
                    <Td className="p-2">
                      <ObservacionCell
                        valorInicial={row.observacionManual}
                        onGuardar={(nuevoTexto) => {
                          actualizarObservacion(row.vendedor, nuevoTexto);
                          showToast(
                            "Observación guardada correctamente",
                            "success",
                          );
                        }}
                      />
                    </Td>
                  </Tr>
                );
              })
            )}
          </Tbody>
        </Table>
      </TableContainer>
      <ToastContainer />
    </div>
  );
};

export default Vendedores;
