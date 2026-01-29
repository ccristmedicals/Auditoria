import React, { useMemo } from "react";
import {
  Users,
  DollarSign,
  MapPin,
  FileText,
  Calendar,
  TrendingUp,
} from "lucide-react";

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

const Vendedores = () => {
  const data = useMemo(() => generarDatosPrueba(), []);

  return (
    <div className="p-4 bg-gray-50 dark:bg-[#191919] min-h-screen">
      {/* HEADER SIMPLE */}
      <div className="mb-6 flex items-center gap-3">
        <div className="p-3 bg-amber-500 rounded-lg text-white shadow-lg">
          <Users size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Tablero de Vendedores
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Seguimiento diario de gestión y cumplimiento (PROFIT)
          </p>
        </div>
      </div>

      {/* CONTENEDOR DE LA TABLA */}
      <div className="overflow-x-auto rounded-xl shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1e1e]">
        <table className="w-full text-xs border-collapse">
          <thead>
            {/* FILA DE ENCABEZADOS CON COLORES SEGÚN IMAGEN */}
            <tr className="text-white uppercase text-center font-bold leading-tight">
              {/* 1. VENDEDORES PROFIT */}
              <th className="p-3 bg-amber-400 text-black border-r border-amber-500 min-w-[150px] sticky left-0 z-10">
                Vendedores Profit
              </th>

              {/* 2. HORA DE SALIDA */}
              <th className="p-2 bg-[#487838] border-r border-[#3a612d] w-[100px]">
                Hora de Salida
              </th>

              {/* 3. HORA DE LLEGADA */}
              <th className="p-2 bg-[#487838] border-r border-[#3a612d] w-[100px]">
                Hora de Llegada
              </th>

              {/* 4. REPORTES ESTABLECIDOS */}
              <th className="p-2 bg-[#487838] border-r border-[#3a612d] w-[90px]">
                Reportes Establec.
              </th>

              {/* 5. REPORTES LOGRADOS */}
              <th className="p-2 bg-[#487838] border-r border-[#3a612d] w-[90px]">
                Reportes Logrados
              </th>

              {/* 6. % CUMPLIMIENTO VISITAS */}
              <th className="p-2 bg-[#487838] border-r border-[#3a612d] w-[100px]">
                % Cumplim. Visitas
              </th>

              {/* 7. LOGRADO (RESTA) - Color verde claro */}
              <th className="p-2 bg-[#92d050] text-black border-r border-[#7ab33e] w-[100px]">
                Logrado (Resta Est - Log)
              </th>

              {/* 8. GEOCERCA - Amarillo */}
              <th className="p-2 bg-yellow-300 text-black border-r border-yellow-400 w-[100px]">
                Geocerca
              </th>

              {/* 9. NEGOCIACIONES - Verde Oscuro */}
              <th className="p-2 bg-[#487838] border-r border-[#3a612d] w-[110px]">
                Negociaciones
              </th>

              {/* 10. COBRADO DEL DIA - Color Durazno/Salmon */}
              <th className="p-2 bg-[#f4b084] text-black border-r border-[#d69a73] w-[110px]">
                Cobrado del Día
              </th>

              {/* 11. % COBRANZA DIA - Color Durazno/Salmon */}
              <th className="p-2 bg-[#f4b084] text-black border-r border-[#d69a73] w-[110px]">
                % Cobranza Día
              </th>

              {/* 12. VENTAS - Amarillo */}
              <th className="p-2 bg-yellow-400 text-black border-r border-yellow-500 w-[110px]">
                Ventas
              </th>

              {/* 13. CARTERA ACTIVA - Azul */}
              <th className="p-2 bg-[#00b0f0] border-r border-[#0090c5] w-[100px]">
                Cartera Activa (Mensual)
              </th>

              {/* 14. % CUMPLIMIENTO META MENSUAL - Azul */}
              <th className="p-2 bg-[#00b0f0] border-r border-[#0090c5] w-[110px]">
                % Cumplim. Meta Mensual
              </th>

              {/* 15. NUEVOS Y RECUPERADOS - Azul Claro */}
              <th className="p-2 bg-[#bdd7ee] text-black border-r border-[#9ebcd8] w-[110px]">
                Nuevos y Recuperados
              </th>

              {/* 16. GESTIONES PLANIFICACION - Rojo */}
              <th className="p-2 bg-red-600 border-r border-red-700 w-[110px]">
                Gestiones Planificación
              </th>

              {/* 17. CUMPLIMIENTO PLANIFICADO - Rojo */}
              <th className="p-2 bg-red-600 border-r border-red-700 w-[120px]">
                Cumplim. Planificado
              </th>

              {/* 18. OBSERVACION / NRO ACTA - Verde Profit */}
              <th className="p-2 bg-[#487838] min-w-[200px]">
                Observación / Acta Profit
              </th>
            </tr>
          </thead>

          <tbody className="bg-white dark:bg-[#1e1e1e] divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((row) => {
              // --- CÁLCULOS EN TIEMPO DE RENDERIZADO (Según lógica imagen) ---

              // 6. % CUMPLIMIENTO DE VISITAS (Logrado / Establecido)
              const percVisitas =
                row.reportesEstablecidos > 0
                  ? (row.reportesLogrados / row.reportesEstablecidos) * 100
                  : 0;

              // 7. LOGRADO (RESTA) -> (Establecido - Logrados)
              const restaLogrado =
                row.reportesEstablecidos - row.reportesLogrados;

              // 11. % COBRANZA (Cobrado / Meta)
              const percCobranza =
                row.metaCobranza > 0
                  ? (row.cobradoDia / row.metaCobranza) * 100
                  : 0;

              // 14. % META MENSUAL (Cartera Activa / Meta Mensual) *Nota: Asumí Cartera como numerador, ajustar si es Ventas*
              // Según la imagen dice "Division entre lo que lleva y la meta". Usaré Cartera Activa vs Meta Mensual como ejemplo
              const percMetaMensual =
                row.metaMensual > 0
                  ? (row.carteraActiva / row.metaMensual) * 100
                  : 0;

              // 17. CUMPLIMIENTO PLANIFICADO (Gestiones Planificadas / Visitas a Lograr)
              const percPlanificado =
                row.visitasALograr > 0
                  ? (row.gestionesPlanificacion / row.visitasALograr) * 100
                  : 0;

              return (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 dark:hover:bg-[#252525] text-center text-gray-700 dark:text-gray-300"
                >
                  {/* 1. NOMBRE (Sticky) */}
                  <td className="p-3 font-bold text-left bg-white dark:bg-[#1e1e1e] border-r border-gray-100 dark:border-gray-800 sticky left-0 z-0">
                    {row.vendedor}
                  </td>

                  {/* 2. HORA SALIDA */}
                  <td className="p-2 border-r dark:border-gray-800">
                    {row.horaSalida}
                  </td>

                  {/* 3. HORA LLEGADA */}
                  <td className="p-2 border-r dark:border-gray-800">
                    {row.horaLlegada}
                  </td>

                  {/* 4. ESTABLECIDOS */}
                  <td className="p-2 border-r dark:border-gray-800">
                    {row.reportesEstablecidos}
                  </td>

                  {/* 5. LOGRADOS */}
                  <td className="p-2 border-r dark:border-gray-800 font-semibold">
                    {row.reportesLogrados}
                  </td>

                  {/* 6. % VISITAS */}
                  <td
                    className={`p-2 border-r dark:border-gray-800 font-bold ${percVisitas >= 90 ? "text-green-600" : "text-red-500"}`}
                  >
                    {formatPercent(percVisitas)}
                  </td>

                  {/* 7. RESTA (FALTANTES) */}
                  <td className="p-2 border-r dark:border-gray-800 bg-gray-50 dark:bg-gray-800 font-medium">
                    {restaLogrado}
                  </td>

                  {/* 8. GEOCERCA (Placeholder) */}
                  <td className="p-2 border-r dark:border-gray-800 text-gray-400 italic">
                    --
                  </td>

                  {/* 9. NEGOCIACIONES */}
                  <td className="p-2 border-r dark:border-gray-800">
                    {row.negociaciones}
                  </td>

                  {/* 10. COBRADO */}
                  <td className="p-2 border-r dark:border-gray-800 text-blue-600 dark:text-blue-400">
                    {formatCurrency(row.cobradoDia)}
                  </td>

                  {/* 11. % COBRANZA */}
                  <td className="p-2 border-r dark:border-gray-800 font-bold">
                    {formatPercent(percCobranza)}
                  </td>

                  {/* 12. VENTAS */}
                  <td className="p-2 border-r dark:border-gray-800 text-green-600 dark:text-green-400 font-semibold">
                    {formatCurrency(row.ventas)}
                  </td>

                  {/* 13. CARTERA ACTIVA */}
                  <td className="p-2 border-r dark:border-gray-800">
                    {row.carteraActiva}
                  </td>

                  {/* 14. % META MENSUAL */}
                  <td className="p-2 border-r dark:border-gray-800 font-bold">
                    {formatPercent(percMetaMensual)}
                  </td>

                  {/* 15. NUEVOS */}
                  <td className="p-2 border-r dark:border-gray-800">
                    {row.nuevosRecuperados}
                  </td>

                  {/* 16. PLANIFICACION */}
                  <td className="p-2 border-r dark:border-gray-800">
                    {row.gestionesPlanificacion}
                  </td>

                  {/* 17. % CUMPLIMIENTO PLANIFICADO */}
                  <td className="p-2 border-r dark:border-gray-800 font-bold">
                    {formatPercent(percPlanificado)}
                  </td>

                  {/* 18. OBSERVACION */}
                  <td
                    className="p-2 text-left text-xs truncate max-w-[200px]"
                    title={row.observacion}
                  >
                    {row.observacion}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Vendedores;
