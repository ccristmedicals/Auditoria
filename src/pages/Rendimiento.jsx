/* eslint-disable react-hooks/immutability */
import React, { useState, useEffect, useMemo } from "react";
import { TrendingUp, RefreshCw, Download } from "lucide-react";
import {
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "../components/ui/Tabla";

// --- 1. Celda de Número Simple (Para conteos) ---
const NumberCell = ({
  value,
  colorClass = "text-gray-700 dark:text-gray-300",
}) => (
  <Td className="text-center border-r border-gray-200 dark:border-gray-700 p-2">
    <span className={`font-medium text-sm ${colorClass}`}>{value}</span>
  </Td>
);

// --- 2. Celda de Porcentaje (Con colores condicionales) ---
const PercentCell = ({ value }) => {
  let badgeClass = "text-red-700 bg-red-100 border-red-200";

  if (parseFloat(value) >= 80) {
    badgeClass = "text-green-700 bg-green-100 border-green-200";
  } else if (parseFloat(value) >= 50) {
    badgeClass = "text-orange-700 bg-orange-100 border-orange-200";
  }

  return (
    <Td className="text-center border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#252525] p-2">
      <div className="flex justify-center">
        <span
          className={`text-xs font-bold px-2 py-1 rounded-md border ${badgeClass}`}
        >
          {value}%
        </span>
      </div>
    </Td>
  );
};

// --- GENERADOR DE DATOS FICTICIOS (MOCK) ---
const generateMockData = () => {
  const rutas = [
    "Apure Ruta 1",
    "Apure Ruta 2",
    "Apure Ruta 3",
    "Apure Ruta 4",
    "Apure Ruta 5",
    "Apure Ruta 6",
    "Apure Ruta 7",
    "Guarico Ruta 1",
    "Guarico Ruta 2",
  ];

  return rutas.map((ruta, index) => {
    const totalClientes = Math.floor(Math.random() * (150 - 50) + 50);

    // Ejecutiva
    const efectivaEjecutiva = Math.floor(Math.random() * (totalClientes * 0.6));
    const negativaEjecutiva = Math.floor(Math.random() * (totalClientes * 0.2));
    const procesoEjecutiva = Math.floor(Math.random() * (totalClientes * 0.1));

    // Vendedor
    const efectivaVendedor = Math.floor(Math.random() * (totalClientes * 0.5));
    const negativaVendedor = Math.floor(Math.random() * (totalClientes * 0.2));
    const procesoVendedor = Math.floor(Math.random() * (totalClientes * 0.1));

    return {
      id: index,
      segmento: ruta,
      total_clientes: totalClientes,
      ejecutiva: {
        efectivos: efectivaEjecutiva,
        no_efectivos: negativaEjecutiva + procesoEjecutiva,
      },
      vendedor: {
        efectivos: efectivaVendedor,
        no_efectivos: negativaVendedor + procesoVendedor,
      },
    };
  });
};

const Rendimiento = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      setData(generateMockData());
      setLoading(false);
    }, 800);
  };

  // --- CÁLCULOS DE TOTALES ---
  const totals = useMemo(() => {
    return data.reduce(
      (acc, curr) => {
        acc.total_clientes += curr.total_clientes;
        acc.ejecutiva_efectivos += curr.ejecutiva.efectivos;
        acc.ejecutiva_no += curr.ejecutiva.no_efectivos;
        acc.vendedor_efectivos += curr.vendedor.efectivos;
        acc.vendedor_no += curr.vendedor.no_efectivos;
        return acc;
      },
      {
        total_clientes: 0,
        ejecutiva_efectivos: 0,
        ejecutiva_no: 0,
        vendedor_efectivos: 0,
        vendedor_no: 0,
      },
    );
  }, [data]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-[#191919]">
        <div className="text-[#1a9888] flex flex-col items-center">
          <RefreshCw className="animate-spin w-10 h-10 mb-3" />
          <span className="font-semibold text-lg">Calculando métricas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-white dark:bg-[#191919]">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg text-[#1a9888]">
            <TrendingUp size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#191919] dark:text-white">
              Tablero de Rendimiento
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Métricas de efectividad por ruta
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-[#202020] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 transition-colors shadow-sm text-sm font-medium"
          >
            <RefreshCw size={16} />
            <span>Actualizar</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1a9888] text-white rounded-lg hover:bg-[#137a6d] transition-colors shadow-sm text-sm font-medium">
            <Download size={16} />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* TABLA */}
      <TableContainer className="max-h-[75vh]">
        <Table>
          <Thead>
            {/* NIVEL 1 */}
            <Tr>
              <Th
                rowSpan={2}
                stickyTop
                className="z-30 bg-gray-100 dark:bg-[#2a2a2a] border-r border-b min-w-[180px] text-xs uppercase"
              >
                Compañía, Segmento (Profit)
              </Th>
              <Th
                rowSpan={2}
                stickyTop
                className="z-30 bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-r border-b text-center text-xs uppercase w-[100px]"
              >
                Cantidad Clientes dentro Política
              </Th>

              {/* GRUPOS */}
              <Th
                colSpan={3}
                stickyTop
                className="z-20 bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100 border-r border-b text-center text-xs font-bold uppercase h-10"
              >
                Gestión de la Ejecutiva
              </Th>
              <Th
                colSpan={3}
                stickyTop
                className="z-20 bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-100 border-r border-b text-center text-xs font-bold uppercase h-10"
              >
                Gestión del Vendedor
              </Th>
              <Th
                colSpan={2}
                stickyTop
                className="z-20 bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100 border-b text-center text-xs font-bold uppercase h-10"
              >
                Consolidado
              </Th>
            </Tr>

            {/* NIVEL 2 (Sub-headers) */}
            <Tr>
              {/* Ejecutiva */}
              <Th
                stickyTop
                className="top-10 z-20 bg-green-50 dark:bg-green-900 text-green-800 border-r border-b text-[10px] text-center uppercase h-10"
              >
                Efectivos
              </Th>
              <Th
                stickyTop
                className="top-10 z-20 bg-green-50 dark:bg-green-900 text-green-800 border-r border-b text-[10px] text-center uppercase h-10"
              >
                Neg/Proc
              </Th>
              <Th
                stickyTop
                className="top-10 z-20 bg-green-50 dark:bg-green-900 text-green-900 border-r border-b text-[10px] text-center uppercase font-bold h-10"
              >
                % Efec.
              </Th>

              {/* Vendedor */}
              <Th
                stickyTop
                className="top-10 z-20 bg-amber-50 dark:bg-amber-900 text-amber-800 border-r border-b text-[10px] text-center uppercase h-10"
              >
                Efectivos
              </Th>
              <Th
                stickyTop
                className="top-10 z-20 bg-amber-50 dark:bg-amber-900 text-amber-800 border-r border-b text-[10px] text-center uppercase h-10"
              >
                Neg/Proc
              </Th>
              <Th
                stickyTop
                className="top-10 z-20 bg-amber-50 dark:bg-amber-900 text-amber-900 border-r border-b text-[10px] text-center uppercase font-bold h-10"
              >
                % Efec.
              </Th>

              {/* Consolidado */}
              <Th
                stickyTop
                className="top-10 z-20 bg-purple-50 dark:bg-purple-900 text-purple-800 border-r border-b text-[10px] text-center uppercase h-10"
              >
                Gestiónes Verdadears
              </Th>
              <Th
                stickyTop
                className="top-10 z-20 bg-purple-50 dark:bg-purple-900 text-purple-900 border-b text-[10px] text-center uppercase font-bold h-10"
              >
                % Cumplimiento de Cartera
              </Th>
            </Tr>
          </Thead>

          <Tbody>
            {data.map((row) => {
              // Cálculos
              const totalGestionesEjecutiva =
                row.ejecutiva.efectivos + row.ejecutiva.no_efectivos;
              const pctEjecutiva =
                totalGestionesEjecutiva > 0
                  ? (
                      (row.ejecutiva.efectivos / totalGestionesEjecutiva) *
                      100
                    ).toFixed(1)
                  : 0;

              const totalGestionesVendedor =
                row.vendedor.efectivos + row.vendedor.no_efectivos;
              const pctVendedor =
                totalGestionesVendedor > 0
                  ? (
                      (row.vendedor.efectivos / totalGestionesVendedor) *
                      100
                    ).toFixed(1)
                  : 0;

              const gestionesVerdaderas = row.ejecutiva.efectivos;
              const pctCumplimiento =
                row.total_clientes > 0
                  ? ((gestionesVerdaderas / row.total_clientes) * 100).toFixed(
                      1,
                    )
                  : 0;

              return (
                <Tr
                  key={row.id}
                  className="hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                >
                  <Td className="font-semibold text-gray-700 dark:text-gray-300 border-r bg-white dark:bg-[#1e1e1e] p-2 text-xs">
                    {row.segmento}
                  </Td>
                  <Td className="text-center font-bold border-r bg-blue-50/30 text-blue-700 dark:text-blue-300 p-2 text-xs">
                    {row.total_clientes}
                  </Td>

                  {/* Ejecutiva */}
                  <NumberCell
                    value={row.ejecutiva.efectivos}
                    colorClass="text-green-700 font-bold"
                  />
                  <NumberCell value={row.ejecutiva.no_efectivos} />
                  <PercentCell value={pctEjecutiva} />

                  {/* Vendedor */}
                  <NumberCell
                    value={row.vendedor.efectivos}
                    colorClass="text-amber-700 font-bold"
                  />
                  <NumberCell value={row.vendedor.no_efectivos} />
                  <PercentCell value={pctVendedor} />

                  {/* Consolidado */}
                  <NumberCell
                    value={gestionesVerdaderas}
                    colorClass="text-purple-700 font-bold"
                  />
                  <PercentCell value={pctCumplimiento} />
                </Tr>
              );
            })}

            {/* FILA DE TOTALES */}
            <Tr className="bg-gray-100 dark:bg-[#333] border-t-2 border-gray-300 dark:border-gray-500 font-bold text-xs">
              <Td className="text-right uppercase p-3 border-r">
                TOTAL GENERAL:
              </Td>
              <Td className="text-center text-blue-800 border-r">
                {totals.total_clientes}
              </Td>

              {/* Totales Ejecutiva */}
              <Td className="text-center text-green-800 border-r">
                {totals.ejecutiva_efectivos}
              </Td>
              <Td className="text-center text-gray-600 border-r">
                {totals.ejecutiva_no}
              </Td>
              <Td className="text-center border-r">
                {(
                  (totals.ejecutiva_efectivos /
                    (totals.ejecutiva_efectivos + totals.ejecutiva_no || 1)) *
                  100
                ).toFixed(1)}
                %
              </Td>

              {/* Totales Vendedor */}
              <Td className="text-center text-amber-800 border-r">
                {totals.vendedor_efectivos}
              </Td>
              <Td className="text-center text-gray-600 border-r">
                {totals.vendedor_no}
              </Td>
              <Td className="text-center border-r">
                {(
                  (totals.vendedor_efectivos /
                    (totals.vendedor_efectivos + totals.vendedor_no || 1)) *
                  100
                ).toFixed(1)}
                %
              </Td>

              {/* Totales Consolidado */}
              <Td className="text-center text-purple-800 border-r">
                {totals.ejecutiva_efectivos}
              </Td>
              <Td className="text-center">
                {(
                  (totals.ejecutiva_efectivos / totals.total_clientes) *
                  100
                ).toFixed(1)}
                %
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Rendimiento;
