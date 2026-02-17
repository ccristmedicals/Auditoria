import React, { useState, useEffect, useMemo } from "react";
import { generateRendimientoExcel } from "../utils/ExcelExporter";
import { apiService } from "../services/apiService";
import {
  TrendingUp,
  RefreshCw,
  Download,
  Search,
  Users,
  BarChart3,
  CheckCircle2,
  PieChart,
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

// --- HELPERS ---
const formatNumber = (val) => new Intl.NumberFormat("es-ES").format(val || 0);
const formatPercent = (val) => `${Number(val || 0).toFixed(1)}%`;

// --- COMPONENTES VISUALES ---

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

const PercentBadge = ({ value }) => {
  const num = parseFloat(value);
  let styles =
    "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800";

  if (num >= 80) {
    styles =
      "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800";
  } else if (num >= 50) {
    styles =
      "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";
  }

  return (
    <span
      className={`px-2 py-1 rounded-md text-[11px] font-bold border ${styles}`}
    >
      {formatPercent(value)}
    </span>
  );
};

const Rendimiento = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // 1. Petición en paralelo
      const [clientesRes, matrizRes] = await Promise.all([
        apiService.getAllCompanies(),
        apiService.getMatrix(),
      ]);

      // 2. Procesar Clientes
      let rawClients = [];
      if (clientesRes && clientesRes.data && Array.isArray(clientesRes.data)) {
        rawClients = clientesRes.data;
      } else if (Array.isArray(clientesRes)) {
        rawClients = clientesRes;
      }

      // 3. Procesar Matriz (Mapa para Ejecutiva)
      const matrizMap = new Map();
      const rawMatrix = matrizRes.data || matrizRes || [];
      if (Array.isArray(rawMatrix)) {
        rawMatrix.forEach((item) => {
          if (item.id_bitrix) {
            matrizMap.set(String(item.id_bitrix), item.auditoria_matriz);
          }
        });
      }

      // 4. Segmentos Únicos
      const segmentosUnicos = [
        ...new Set(
          rawClients
            .map((c) => c.bitrix?.UF_CRM_1638457710)
            .filter((seg) => seg && seg.trim() !== ""),
        ),
      ].sort();

      // 5. Calcular Totales
      const processedData = segmentosUnicos.map((segmentoNombre, index) => {
        // Filtrar clientes de la ruta
        const clientesDelSegmento = rawClients.filter(
          (c) => c.bitrix?.UF_CRM_1638457710 === segmentoNombre,
        );

        let exec_efectivos = 0;
        let exec_no_efectivos = 0;
        let vend_efectivos = 0;
        let vend_no_efectivos = 0;
        let gestiones_reales_con_gestion = 0;

        clientesDelSegmento.forEach((cliente) => {
          const bitrixID = String(cliente.bitrix?.ID || "");

          // --- A. LÓGICA DE FILTRO PREVIO ---
          let purchaseYear = 0;
          const fechaUltimaCompra = cliente.profit?.fecha_ultima_compra || "";

          if (fechaUltimaCompra) {
            if (fechaUltimaCompra.includes("-")) {
              const parts = fechaUltimaCompra.split("-");
              purchaseYear =
                parts[0] > 1000 ? parseInt(parts[0]) : parseInt(parts[2]);
            } else if (fechaUltimaCompra.includes("/")) {
              purchaseYear = parseInt(fechaUltimaCompra.split("/")[2]);
            }
          }

          const codigoProfit = cliente.bitrix?.UF_CRM_1634787828 || "";
          const hasProfitCode = codigoProfit && codigoProfit !== "—";

          const isEligible = purchaseYear >= 2024 && hasProfitCode;
          let cumpleConGestion = false;

          // --- B. LÓGICA EJECUTIVA Y MATRIZ ---
          let auditData = matrizMap.get(bitrixID);
          if (typeof auditData === "string") {
            try {
              auditData = JSON.parse(auditData);
            } catch {
              auditData = null;
            }
          }

          if (auditData) {
            const dias = [
              "lunes",
              "martes",
              "miercoles",
              "jueves",
              "viernes",
              "sabado",
            ];
            dias.forEach((dia) => {
              if (auditData[dia]) {
                const diaLog = auditData[dia];

                // 1. Contadores Normales (Ejecutiva)
                const ventaOk = diaLog.accion_venta?.e === true;
                const cobroOk = diaLog.accion_cobranza?.e === true;
                if (ventaOk || cobroOk) exec_efectivos++;

                const ventaFail =
                  diaLog.accion_venta?.n === true ||
                  diaLog.accion_venta?.p === true;
                const cobroFail =
                  diaLog.accion_cobranza?.n === true ||
                  diaLog.accion_cobranza?.p === true;
                if ((ventaFail || cobroFail) && !ventaOk && !cobroOk) {
                  exec_no_efectivos++;
                }

                // 2. Lógica "CON GESTIÓN"
                if (isEligible) {
                  const hasWa =
                    diaLog.inicio_whatsapp?.e === true ||
                    diaLog.inicio_whatsapp?.c === true;
                  const hasCall =
                    diaLog.llamadas_venta?.e === true ||
                    diaLog.llamadas_venta?.p === true ||
                    diaLog.llamadas_venta?.n === true;

                  if (hasWa || hasCall) {
                    cumpleConGestion = true;
                  }
                }
              }
            });
          }

          // --- C. LÓGICA VENDEDOR ---
          const gestiones = cliente.gestion || [];
          if (Array.isArray(gestiones)) {
            gestiones.forEach((g) => {
              const ventaConcretada = g.venta_tipoGestion === "concretada";
              const cobranzaConcretada =
                g.cobranza_tipoGestion === "concretada";
              const ventaFallida =
                g.venta_tipoGestion === "en_proceso" ||
                g.venta_tipoGestion === "no_concretada";
              const cobranzaFallida =
                g.cobranza_tipoGestion === "en_proceso" ||
                g.cobranza_tipoGestion === "no_concretada";

              if (ventaConcretada || cobranzaConcretada) {
                vend_efectivos++;
              } else if (ventaFallida || cobranzaFallida) {
                vend_no_efectivos++;
              }
            });
          }

          // --- D. ACUMULAR "CON GESTIÓN" ---
          if (cumpleConGestion) {
            gestiones_reales_con_gestion++;
          }
        });

        return {
          id: index,
          segmento: segmentoNombre,
          total_clientes: clientesDelSegmento.length,
          ejecutiva: {
            efectivos: exec_efectivos,
            no_efectivos: exec_no_efectivos,
          },
          vendedor: {
            efectivos: vend_efectivos,
            no_efectivos: vend_no_efectivos,
          },
          gestiones_reales: gestiones_reales_con_gestion,
        };
      });

      setData(processedData);
    } catch (error) {
      console.error("Error calculando rendimiento:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter((item) =>
      item.segmento.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [data, searchTerm]);

  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, curr) => {
        acc.total_clientes += curr.total_clientes;
        acc.ejecutiva_efectivos += curr.ejecutiva.efectivos;
        acc.ejecutiva_no += curr.ejecutiva.no_efectivos;
        acc.vendedor_efectivos += curr.vendedor.efectivos;
        acc.vendedor_no += curr.vendedor.no_efectivos;
        acc.gestiones_reales += curr.gestiones_reales || 0;
        return acc;
      },
      {
        total_clientes: 0,
        ejecutiva_efectivos: 0,
        ejecutiva_no: 0,
        vendedor_efectivos: 0,
        vendedor_no: 0,
        gestiones_reales: 0,
      },
    );
  }, [filteredData]);

  const globalPctEjecutiva =
    totals.ejecutiva_efectivos + totals.ejecutiva_no > 0
      ? (totals.ejecutiva_efectivos /
          (totals.ejecutiva_efectivos + totals.ejecutiva_no)) *
        100
      : 0;

  const globalPctVendedor =
    totals.vendedor_efectivos + totals.vendedor_no > 0
      ? (totals.vendedor_efectivos /
          (totals.vendedor_efectivos + totals.vendedor_no)) *
        100
      : 0;

  // --- FUNCIÓN DE EXPORTACIÓN A EXCEL ---
  const handleExport = () => {
    // Le pasamos la data filtrada y los totales calculados
    generateRendimientoExcel(filteredData, totals);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-[#0b1120]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-12 h-12 text-[#1a9888] animate-spin" />
          <p className="text-slate-600 dark:text-slate-300 font-medium animate-pulse">
            Calculando rendimiento...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-white dark:bg-[#0b1120]">
      {/* HEADER */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8 border-b border-gray-200 dark:border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <div className="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-2xl">
            <TrendingUp
              size={32}
              className="text-[#1a9888] dark:text-teal-400"
            />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
              Tablero de{" "}
              <span className="text-[#1a9888] dark:text-teal-400">
                Rendimiento
              </span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Análisis de efectividad &bull; Ejecutiva vs Vendedor
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <div className="flex gap-2">
            <button
              onClick={loadData}
              className="px-4 py-3 bg-gray-50 dark:bg-[#1a2333] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 transition-all"
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={handleExport} // <--- USAR EL NUEVO HANDLER
              className="px-4 py-3 bg-[#1a9888] text-white rounded-xl hover:bg-[#158072] transition-all shadow-lg shadow-teal-900/20 flex items-center gap-2"
            >
              <Download size={18} />
              <span className="hidden sm:inline font-bold">Excel</span>
            </button>
          </div>
          <div className="relative w-full xl:w-80">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Buscar ruta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#1a2333] border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-[#1a9888]/20 dark:text-white text-sm font-medium transition-all"
            />
          </div>
        </div>
      </div>

      {/* KPIS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Clientes"
          value={formatNumber(totals.total_clientes)}
          icon={Users}
          colorHex="#2563eb"
        />
        <StatCard
          label="Efe. Ejecutiva"
          value={formatPercent(globalPctEjecutiva)}
          icon={CheckCircle2}
          colorHex="#059669"
        />
        <StatCard
          label="Efe. Vendedor"
          value={formatPercent(globalPctVendedor)}
          icon={BarChart3}
          colorHex="#d97706"
        />
        <StatCard
          label="Gestión Total"
          value={formatNumber(
            totals.ejecutiva_efectivos +
              totals.ejecutiva_no +
              totals.vendedor_efectivos +
              totals.vendedor_no,
          )}
          icon={PieChart}
          colorHex="#7c3aed"
        />
      </div>

      {/* TABLA */}
      <TableContainer className="shadow-none border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-[#111827]">
        <Table>
          <Thead>
            <tr className="uppercase leading-tight">
              <Th
                rowSpan={2}
                stickyLeft
                className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 min-w-[180px] border-b border-r dark:border-gray-700 font-bold z-20"
              >
                Compañía / Segmento
              </Th>
              <Th
                rowSpan={2}
                className="bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 min-w-[100px] border-b border-r dark:border-gray-700 text-center font-bold"
              >
                Total Clientes
              </Th>
              <Th
                colSpan={3}
                className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-100 border-b border-r dark:border-gray-700 text-center font-bold"
              >
                Gestión Ejecutiva
              </Th>
              <Th
                colSpan={3}
                className="bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-100 border-b border-r dark:border-gray-700 text-center font-bold"
              >
                Gestión Vendedor
              </Th>
              <Th
                colSpan={2}
                className="bg-purple-100 dark:bg-purple-900/50 text-purple-900 dark:text-purple-100 border-b dark:border-gray-700 text-center font-bold"
              >
                Consolidado
              </Th>
            </tr>
            <tr className="uppercase leading-tight text-[10px]">
              <Th className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 border-b border-r dark:border-gray-700 text-center">
                Efectivos
              </Th>
              <Th className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 border-b border-r dark:border-gray-700 text-center">
                Neg/Proc
              </Th>
              <Th className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 border-b border-r dark:border-gray-700 text-center font-bold">
                % Efec.
              </Th>
              <Th className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 border-b border-r dark:border-gray-700 text-center">
                Efectivos
              </Th>
              <Th className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 border-b border-r dark:border-gray-700 text-center">
                Neg/Proc
              </Th>
              <Th className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 border-b border-r dark:border-gray-700 text-center font-bold">
                % Efec.
              </Th>
              <Th className="bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 border-b border-r dark:border-gray-700 text-center">
                Gest. Reales
              </Th>
              <Th className="bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 border-b dark:border-gray-700 text-center font-bold">
                % Cumpl.
              </Th>
            </tr>
          </Thead>
          <Tbody>
            {filteredData.map((row) => {
              // --- CÁLCULOS EJECUTIVA ---
              const totalGestionesEjecutiva =
                row.ejecutiva.efectivos + row.ejecutiva.no_efectivos;

              const pctEjecutiva =
                totalGestionesEjecutiva > 0
                  ? (row.ejecutiva.efectivos / totalGestionesEjecutiva) * 100
                  : 0;

              // --- CÁLCULOS VENDEDOR ---
              const totalGestionesVendedor =
                row.vendedor.efectivos + row.vendedor.no_efectivos;

              const pctVendedor =
                totalGestionesVendedor > 0
                  ? (row.vendedor.efectivos / totalGestionesVendedor) * 100
                  : 0;

              // --- CÁLCULOS CONSOLIDADO ---
              const gestionesVerdaderas = row.gestiones_reales;
              const pctCumplimiento =
                row.total_clientes > 0
                  ? (gestionesVerdaderas / row.total_clientes) * 100
                  : 0;

              return (
                <Tr
                  key={row.id}
                  className="hover:bg-gray-50 dark:hover:bg-[#1a2333]"
                >
                  <Td
                    stickyLeft
                    className="font-black text-xs sm:text-sm text-gray-800 dark:text-gray-200 border-r dark:border-gray-800"
                  >
                    {row.segmento}
                  </Td>

                  <Td className="text-center font-bold text-blue-700 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-900/10 border-r dark:border-gray-800">
                    {row.total_clientes}
                  </Td>

                  {/* --- GRUPO EJECUTIVA --- */}
                  <Td className="text-center text-emerald-700 dark:text-emerald-400 font-medium border-r dark:border-gray-800">
                    {row.ejecutiva.efectivos}
                  </Td>
                  <Td className="text-center text-gray-500 dark:text-gray-400 border-r dark:border-gray-800">
                    {row.ejecutiva.no_efectivos}
                  </Td>
                  <Td className="text-center border-r dark:border-gray-800 bg-emerald-50/30 dark:bg-emerald-900/10">
                    <PercentBadge value={pctEjecutiva} />
                  </Td>

                  {/* --- GRUPO VENDEDOR --- */}
                  <Td className="text-center text-amber-700 dark:text-amber-400 font-medium border-r dark:border-gray-800">
                    {row.ejecutiva.efectivos}
                  </Td>
                  <Td className="text-center text-gray-500 dark:text-gray-400 border-r dark:border-gray-800">
                    {row.vendedor.no_efectivos}
                  </Td>
                  <Td className="text-center border-r dark:border-gray-800 bg-amber-50/30 dark:bg-amber-900/10">
                    <PercentBadge value={pctVendedor} />
                  </Td>

                  {/* --- GRUPO CONSOLIDADO --- */}
                  <Td className="text-center text-purple-700 dark:text-purple-400 font-bold border-r dark:border-gray-800">
                    {gestionesVerdaderas}
                  </Td>
                  <Td className="text-center bg-purple-50/30 dark:bg-purple-900/10">
                    <PercentBadge value={pctCumplimiento} />
                  </Td>
                </Tr>
              );
            })}

            {/* --- FILA DE TOTALES --- */}
            <tr className="bg-gray-100 dark:bg-[#1f2937] border-t-2 border-gray-300 dark:border-gray-600 font-black text-xs uppercase">
              <Td
                stickyLeft
                className="text-right p-3 border-r dark:border-gray-700 bg-gray-100 dark:bg-[#1f2937]"
              >
                TOTALES:
              </Td>
              <Td className="text-center text-blue-800 dark:text-blue-300 border-r dark:border-gray-700">
                {formatNumber(totals.total_clientes)}
              </Td>
              <Td className="text-center text-emerald-800 dark:text-emerald-300 border-r dark:border-gray-700">
                {formatNumber(totals.ejecutiva_efectivos)}
              </Td>
              <Td className="text-center text-gray-600 dark:text-gray-400 border-r dark:border-gray-700">
                {formatNumber(totals.ejecutiva_no)}
              </Td>
              <Td className="text-center border-r dark:border-gray-700">
                {formatPercent(globalPctEjecutiva)}
              </Td>
              <Td className="text-center text-amber-800 dark:text-amber-300 border-r dark:border-gray-700">
                {formatNumber(totals.vendedor_efectivos)}
              </Td>
              <Td className="text-center text-gray-600 dark:text-gray-400 border-r dark:border-gray-700">
                {formatNumber(totals.vendedor_no)}
              </Td>
              <Td className="text-center border-r dark:border-gray-700">
                {formatPercent(globalPctVendedor)}
              </Td>
              <Td className="text-center text-purple-800 dark:text-purple-300 border-r dark:border-gray-700">
                {formatNumber(totals.gestiones_reales)}
              </Td>
              <Td className="text-center">
                {formatPercent(
                  (totals.gestiones_reales / (totals.total_clientes || 1)) *
                    100,
                )}
              </Td>
            </tr>
          </Tbody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Rendimiento;
