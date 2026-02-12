import React, { useMemo, useState } from "react";
import {
  Users,
  Search,
  TrendingUp,
  Target,
  CheckCircle2,
  MapPin,
  Navigation,
  Store,
  ShoppingCart,
  Banknote,
  Loader2,
} from "lucide-react";
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

// Componente de Badge simple para los KPIs superiores
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

const Vendedores = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { vendedores: rawData, loading } = useTableroVendedores();

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
            Sincronizando tablero...
          </p>
        </div>
      </div>
    );

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-white dark:bg-[#0b1120]">
      {/* HEADER ESTILO NUEVO (TEAL) */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8 border-b border-gray-200 dark:border-white/5 pb-6">
        <div className="flex items-center gap-4">
          {/* Icono con el estilo Teal */}
          <div className="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-2xl">
            <Users size={32} className="text-[#1a9888] dark:text-teal-400" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
              Tablero de{" "}
              <span className="text-[#1a9888] dark:text-teal-400">
                Vendedores
              </span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Auditoría Profit &bull; Geolocalización en tiempo real
            </p>
          </div>
        </div>

        {/* Buscador Integrado en el Header */}
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

      {/* TARJETAS DE KPIS (Clean Style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Visitas Logradas"
          value={totals.logrados}
          icon={CheckCircle2}
          colorHex="#059669" // Emerald 600
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
          colorHex="#2563eb" // Blue 600
        />
      </div>

      {/* TABLA COMPLETA CON CABECERAS SÓLIDAS */}
      <TableContainer className="shadow-none border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-[#111827]">
        <Table>
          <Thead>
            <tr className="uppercase leading-tight">
              {/* Vendedor (Ámbar - Sólido) */}
              <Th
                stickyLeft
                align="left"
                className="bg-amber-50 dark:bg-amber-900 text-amber-900 dark:text-amber-100 min-w-[200px] border-b dark:border-gray-700 font-bold"
              >
                Vendedor
              </Th>

              {/* Horarios (Gris - Sólido) */}
              <Th className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 min-w-[100px] border-b dark:border-gray-700 font-bold">
                Salida
              </Th>
              <Th className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 min-w-[100px] border-b dark:border-gray-700 font-bold">
                Llegada
              </Th>

              {/* Métricas Visitas (Gris - Sólido) */}
              <Th className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-b dark:border-gray-700 font-bold">
                Plan
              </Th>
              <Th className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-b dark:border-gray-700 font-bold">
                Real
              </Th>
              <Th className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 min-w-[100px] border-b dark:border-gray-700 font-bold">
                % Visitas
              </Th>

              {/* Faltantes (Verde - Sólido) */}
              <Th className="bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 min-w-[100px] border-b dark:border-gray-700 font-bold">
                Faltantes
              </Th>

              {/* GEOCERCA (Indigo - Sólido) */}
              <Th className="bg-indigo-100 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100 min-w-[280px] text-center border-b dark:border-gray-700 font-bold">
                <div className="flex items-center gap-1 justify-center">
                  <MapPin size={12} /> Última Ubicación
                </div>
              </Th>

              {/* Finanzas (Azul - Sólido) */}
              <Th className="bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-100 min-w-[110px] border-b dark:border-gray-700 font-bold">
                Negoc.
              </Th>
              <Th className="bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 min-w-[130px] border-b dark:border-gray-700 font-bold">
                Cobrado
              </Th>
              <Th className="bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 min-w-[110px] border-b dark:border-gray-700 font-bold">
                % Cobro
              </Th>

              {/* Ventas (Ámbar - Sólido) */}
              <Th className="bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-100 min-w-[130px] border-b dark:border-gray-700 font-bold">
                Ventas
              </Th>

              {/* KPIs Mensuales (Cyan/Purple/Rose - Sólidos) */}
              <Th className="bg-cyan-100 dark:bg-cyan-900 text-cyan-900 dark:text-cyan-100 min-w-[100px] border-b dark:border-gray-700 font-bold">
                Cartera
              </Th>
              <Th className="bg-cyan-100 dark:bg-cyan-900 text-cyan-900 dark:text-cyan-100 min-w-[100px] border-b dark:border-gray-700 font-bold">
                % Meta
              </Th>
              <Th className="bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100 min-w-[110px] border-b dark:border-gray-700 font-bold">
                Nuevos
              </Th>
              <Th className="bg-rose-100 dark:bg-rose-900 text-rose-900 dark:text-rose-100 min-w-[110px] border-b dark:border-gray-700 font-bold">
                Planif.
              </Th>
              <Th className="bg-rose-100 dark:bg-rose-900 text-rose-900 dark:text-rose-100 min-w-[100px] border-b dark:border-gray-700 font-bold">
                % Plan
              </Th>

              {/* Observación (Gris - Sólido) */}
              <Th className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 min-w-[250px] border-b dark:border-gray-700 font-bold">
                Observación
              </Th>
            </tr>
          </Thead>

          <Tbody>
            {filteredData.length === 0 ? (
              <Tr>
                <Td colSpan={19} className="py-20 text-center text-slate-400">
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

                const percCobranza =
                  row.metaCobranza > 0
                    ? (row.cobradoDia / row.metaCobranza) * 100
                    : 0;

                const percPlanificado =
                  row.visitasALograr > 0
                    ? (row.gestionesPlanificacion / row.visitasALograr) * 100
                    : 0;

                const percMetaMensual =
                  row.metaMensual > 0
                    ? (row.carteraActiva / row.metaMensual) * 100
                    : 0;

                return (
                  <Tr
                    key={row.id}
                    className="hover:bg-gray-50 dark:hover:bg-[#1a2333]"
                  >
                    {/* 1. Vendedor */}
                    <Td
                      stickyLeft
                      align="left"
                      className="font-black text-xs sm:text-sm text-gray-800 dark:text-gray-200"
                    >
                      {row.vendedor}
                    </Td>

                    {/* 2. Horarios */}
                    <Td>{row.horaSalida}</Td>
                    <Td>{row.horaLlegada}</Td>

                    {/* 3. Visitas */}
                    <Td className="font-medium">{row.reportesEstablecidos}</Td>
                    <Td className="font-bold text-slate-900 dark:text-white">
                      {row.reportesLogrados}
                    </Td>
                    <Td>
                      <span
                        className={`px-2 py-1 rounded-md text-[11px] font-bold border ${
                          percVisitas >= 90
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-100 dark:border-emerald-800"
                            : "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900 dark:text-rose-100 dark:border-rose-800"
                        }`}
                      >
                        {formatPercent(percVisitas)}
                      </span>
                    </Td>
                    <Td className="font-bold text-center text-emerald-700 dark:text-emerald-400">
                      {restaLogrado}
                    </Td>

                    {/* 4. GEOCERCA HÍBRIDA */}
                    <Td className="text-center p-2 align-middle">
                      {row.direccionTexto === "Sin actividad" ? (
                        <span className="text-xs text-gray-400 italic">
                          -- Sin GPS --
                        </span>
                      ) : (
                        <div className="flex flex-col items-center gap-1.5 py-1">
                          {/* Badge Porcentaje */}
                          <div
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-extrabold border ${
                              row.pctGeocerca >= 80
                                ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-800"
                                : row.pctGeocerca >= 50
                                  ? "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-800"
                                  : "bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-100 dark:border-red-800"
                            }`}
                          >
                            {row.pctGeocerca}% EN RANGO
                          </div>

                          {/* Tienda */}
                          <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 font-bold text-[11px] leading-tight">
                            <Store size={12} className="shrink-0" />
                            <span
                              className="truncate max-w-[200px]"
                              title={row.ultimoCliente}
                            >
                              {row.ultimoCliente || "Cliente Desconocido"}
                            </span>
                          </div>

                          {/* Dirección Real */}
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 max-w-[200px]">
                            {row.direccionTexto.includes("Localizando") ? (
                              <span className="animate-pulse text-blue-500 flex items-center gap-1">
                                <Loader2 size={10} className="animate-spin" />{" "}
                                Localizando...
                              </span>
                            ) : (
                              <>
                                <Navigation
                                  size={10}
                                  className="shrink-0 text-slate-400"
                                />
                                <span
                                  className="truncate"
                                  title={row.direccionTexto}
                                >
                                  {row.direccionTexto}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </Td>

                    {/* 5. Finanzas */}
                    <Td>{row.negociaciones}</Td>
                    <Td className="text-blue-600 dark:text-blue-400 font-bold">
                      {formatCurrency(row.cobradoDia)}
                    </Td>
                    <Td className="font-black">
                      {formatPercent(percCobranza)}
                    </Td>

                    {/* 6. Ventas (Real) */}
                    <Td className="text-emerald-600 dark:text-emerald-400 font-black">
                      {formatCurrency(row.ventas)}
                    </Td>

                    {/* 7. KPIs Mensuales */}
                    <Td>{row.carteraActiva}</Td>
                    <Td className="font-black">
                      {formatPercent(percMetaMensual)}
                    </Td>
                    <Td>{row.nuevosRecuperados}</Td>
                    <Td>{row.gestionesPlanificacion}</Td>
                    <Td className="font-black text-rose-600 dark:text-rose-400">
                      {formatPercent(percPlanificado)}
                    </Td>

                    {/* 8. Observación */}
                    <Td align="left" className="max-w-[250px] align-top">
                      <div className="flex flex-col gap-1.5 w-full">
                        {!row.observacionData ||
                        row.observacionData.length === 0 ? (
                          <span className="text-xs text-gray-400 italic">
                            Sin detalle
                          </span>
                        ) : (
                          row.observacionData.map((obs, idx) => (
                            <div
                              key={idx}
                              className={`flex items-center gap-1.5 text-[11px] p-1.5 rounded-md border max-w-full ${
                                obs.type === "venta"
                                  ? "bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:border-emerald-800 dark:text-emerald-200"
                                  : "bg-blue-50 border-blue-100 text-blue-800 dark:bg-blue-900/40 dark:border-blue-800 dark:text-blue-200"
                              }`}
                            >
                              <div className="shrink-0">
                                {obs.type === "venta" ? (
                                  <ShoppingCart size={12} />
                                ) : (
                                  <Banknote size={12} />
                                )}
                              </div>

                              <span
                                className="truncate font-medium flex-1 cursor-help"
                                title={obs.text}
                              >
                                {obs.text}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </Td>
                  </Tr>
                );
              })
            )}
          </Tbody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Vendedores;
