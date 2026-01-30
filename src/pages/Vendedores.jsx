import React, { useMemo } from "react";
import {
  Users,
  Search,
  TrendingUp,
  Target,
  Clock,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import {
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "../components/ui/Tabla";

// --- DATOS DE PRUEBA (DUMMY DATA) ---
const generarDatosPrueba = () => {
  return [
    {
      id: 1,
      vendedor: "Juan Pérez",
      horaSalida: "08:00 AM", // Hora primer reporte
      horaLlegada: "05:30 PM", // Hora ultimo reporte
      reportesEstablecidos: 20, // Cantidad a realizar
      reportesLogrados: 18, // Cantidad por aplicación
      // Calculados:
      // % Cumplimiento = (18/20)*100
      // Logrado (Resta) = 20 - 18
      negociaciones: 5, // Facturas + proveedores
      cobradoDia: 1500.0,
      metaCobranza: 2000.0,
      ventas: 1200.0,
      carteraActiva: 45,
      metaMensual: 100,
      nuevosRecuperados: 2,
      gestionesPlanificacion: 15, // Visitas por orden ejecutiva
      visitasALograr: 20,
      observacion: "Todo en orden",
    },
    {
      id: 2,
      vendedor: "Maria Gonzalez",
      horaSalida: "08:15 AM",
      horaLlegada: "06:00 PM",
      reportesEstablecidos: 25,
      reportesLogrados: 25,
      negociaciones: 8,
      cobradoDia: 3200.0,
      metaCobranza: 3000.0,
      ventas: 2800.0,
      carteraActiva: 60,
      metaMensual: 120,
      nuevosRecuperados: 5,
      gestionesPlanificacion: 20,
      visitasALograr: 25,
      observacion: "Excelente gestión",
    },
    {
      id: 3,
      vendedor: "Carlos Ruiz",
      horaSalida: "09:00 AM",
      horaLlegada: "04:00 PM",
      reportesEstablecidos: 15,
      reportesLogrados: 10,
      negociaciones: 2,
      cobradoDia: 500.0,
      metaCobranza: 1500.0,
      ventas: 600.0,
      carteraActiva: 30,
      metaMensual: 80,
      nuevosRecuperados: 0,
      gestionesPlanificacion: 8,
      visitasALograr: 15,
      observacion: "Vehículo averiado",
    },
  ];
};

// --- COMPONENTE DE FORMATO DE MONEDA ---
const formatCurrency = (val) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" }).format(
    val,
  );

const formatPercent = (val) => `${val.toFixed(1)}%`;

const StatBadge = React.memo(({ label, value, colorClass, icon: Icon }) => (
  <div className="flex flex-col items-center px-6 border-r last:border-r-0 border-gray-200 dark:border-slate-800 min-w-[120px]">
    <div className="flex items-center gap-2 mb-1">
      {Icon && <Icon size={12} className="text-gray-400" />}
      <span className="text-[10px] uppercase font-bold text-gray-400 leading-none text-center tracking-wider">
        {label}
      </span>
    </div>
    <span className={`text-base font-black ${colorClass} leading-none`}>
      {value}
    </span>
  </div>
));

const Vendedores = () => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const rawData = useMemo(() => generarDatosPrueba(), []);

  const filteredData = useMemo(() => {
    if (!searchTerm) return rawData;
    const term = searchTerm.toLowerCase();
    return rawData.filter((v) => v.vendedor.toLowerCase().includes(term));
  }, [rawData, searchTerm]);

  // Totales para StatBadges
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

  return (
    <div className="p-6 bg-slate-50 dark:bg-[#0f172a] min-h-screen">
      {/* HEADER COMPLETO ESTILO MATRIZ */}
      <div className="mb-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-linear-to-br from-amber-400 to-amber-600 rounded-2xl text-white shadow-lg shadow-amber-500/20">
              <Users size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">
                Tablero de Vendedores
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold rounded-full border border-amber-100 dark:border-amber-800 uppercase tracking-wider">
                  Auditoría Profit
                </span>
                <span className="text-xs text-slate-400 font-medium italic">
                  Seguimiento diario de gestión
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center bg-gray-50/50 dark:bg-slate-800/50 p-2 rounded-2xl border border-gray-100 dark:border-slate-800">
            <StatBadge
              label="Logrados"
              value={totals.logrados}
              colorClass="text-emerald-600 dark:text-emerald-400"
              icon={CheckCircle2}
            />
            <StatBadge
              label="% Cumplimiento"
              value={formatPercent(totalCumplimiento)}
              colorClass={
                totalCumplimiento >= 90 ? "text-emerald-500" : "text-amber-500"
              }
              icon={TrendingUp}
            />
            <StatBadge
              label="Total Cobrado"
              value={formatCurrency(totals.cobrado)}
              colorClass="text-blue-600 dark:text-blue-400"
              icon={Target}
            />
          </div>

          <div className="relative w-full md:w-80">
            <Search
              size={18}
              className="absolute left-4 top-3 text-slate-400"
            />
            <input
              type="text"
              placeholder="Buscar vendedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-medium dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* CONTENEDOR DE LA TABLA ESTILO MATRIZ */}
      <TableContainer className="shadow-xl">
        <Table>
          <Thead>
            <tr className="uppercase leading-tight">
              <Th
                stickyLeft
                align="left"
                className="bg-amber-50 dark:bg-slate-800 text-amber-700 dark:text-amber-400 min-w-[200px]"
              >
                Vendedores Profit
              </Th>
              <Th className="bg-slate-100/50 dark:bg-slate-800 min-w-[100px]">
                Hora Salida
              </Th>
              <Th className="bg-slate-100/50 dark:bg-slate-800 min-w-[100px]">
                Hora Llegada
              </Th>
              <Th className="bg-slate-100/50 dark:bg-slate-800">Establec.</Th>
              <Th className="bg-slate-100/50 dark:bg-slate-800">Logrados</Th>
              <Th className="bg-slate-100/50 dark:bg-slate-800 min-w-[120px]">
                % Visitas
              </Th>
              <Th className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 min-w-[100px]">
                Faltantes
              </Th>
              <Th className="bg-slate-100/50 dark:bg-slate-800 min-w-[100px]">
                Geocerca
              </Th>
              <Th className="bg-slate-100/50 dark:bg-slate-800 min-w-[110px]">
                Negoc.
              </Th>
              <Th className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 min-w-[130px]">
                Cobrado Día
              </Th>
              <Th className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 min-w-[110px]">
                % Cobro
              </Th>
              <Th className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 min-w-[130px]">
                Ventas
              </Th>
              <Th className="bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 min-w-[100px]">
                Cartera Act.
              </Th>
              <Th className="bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 min-w-[120px]">
                % Meta Mens.
              </Th>
              <Th className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 min-w-[110px]">
                Nuevos/Recup.
              </Th>
              <Th className="bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 min-w-[120px]">
                Gestiones Plan.
              </Th>
              <Th className="bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 min-w-[130px]">
                % Planificado
              </Th>
              <Th className="bg-slate-100/50 dark:bg-slate-800 min-w-[250px]">
                Observación / Acta Profit
              </Th>
            </tr>
          </Thead>

          <Tbody>
            {filteredData.length === 0 ? (
              <Tr>
                <Td colSpan={18} className="py-20">
                  <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
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
                const percMetaMensual =
                  row.metaMensual > 0
                    ? (row.carteraActiva / row.metaMensual) * 100
                    : 0;
                const percPlanificado =
                  row.visitasALograr > 0
                    ? (row.gestionesPlanificacion / row.visitasALograr) * 100
                    : 0;

                return (
                  <Tr key={row.id}>
                    <Td stickyLeft align="left" className="font-black">
                      {row.vendedor}
                    </Td>
                    <Td>{row.horaSalida}</Td>
                    <Td>{row.horaLlegada}</Td>
                    <Td className="font-medium">{row.reportesEstablecidos}</Td>
                    <Td className="font-bold text-slate-900 dark:text-white">
                      {row.reportesLogrados}
                    </Td>
                    <Td>
                      <span
                        className={`px-2 py-1 rounded-full text-[11px] font-black ${
                          percVisitas >= 90
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                        }`}
                      >
                        {formatPercent(percVisitas)}
                      </span>
                    </Td>
                    <Td className="bg-emerald-50/30 dark:bg-emerald-900/5 font-bold">
                      {restaLogrado}
                    </Td>
                    <Td className="text-slate-300 italic">--</Td>
                    <Td>{row.negociaciones}</Td>
                    <Td className="text-blue-600 dark:text-blue-400 font-bold">
                      {formatCurrency(row.cobradoDia)}
                    </Td>
                    <Td className="font-black">
                      {formatPercent(percCobranza)}
                    </Td>
                    <Td className="text-emerald-600 dark:text-emerald-400 font-black">
                      {formatCurrency(row.ventas)}
                    </Td>
                    <Td>{row.carteraActiva}</Td>
                    <Td className="font-black">
                      {formatPercent(percMetaMensual)}
                    </Td>
                    <Td>{row.nuevosRecuperados}</Td>
                    <Td>{row.gestionesPlanificacion}</Td>
                    <Td className="font-black text-rose-600 dark:text-rose-400">
                      {formatPercent(percPlanificado)}
                    </Td>
                    <Td align="left" className="max-w-[250px]">
                      <div
                        className="truncate text-xs text-slate-500"
                        title={row.observacion}
                      >
                        {row.observacion}
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
