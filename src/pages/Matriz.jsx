/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { apiService } from "../services/apiService";
import { useAuditoria } from "../hooks/useAuditoria";
import {
  Save,
  Edit3,
  Search,
  XCircle,
  RefreshCw,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  CheckCircle,
  Loader,
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
import { FilterMultiSelect } from "../components/ui/FilterMultiSelect";

// --- COMPONENTES AUXILIARES ---
const StatBadge = React.memo(({ label, value, colorClass }) => (
  <div className="flex flex-col items-center px-4 border-r last:border-r-0 border-gray-200 dark:border-gray-700 min-w-[100px]">
    <span className="text-[10px] uppercase font-bold text-gray-400 leading-none mb-1 text-center">
      {label}
    </span>
    <span className={`text-sm font-black ${colorClass} leading-none`}>
      {value}
    </span>
  </div>
));

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

const formatCurrency = (val) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" }).format(
    val,
  );

// --- HELPER PARA FECHAS ---
const isWithinCurrentWeek = (dateStr) => {
  if (!dateStr || dateStr === "—" || dateStr === "-") return false;

  // Forzamos el parseo a hora local para evitar desfases de zona horaria (UTC vs Local)
  let date;
  if (dateStr.includes("/")) {
    const [day, month, year] = dateStr.split("/").map(Number);
    date = new Date(year, month - 1, day);
  } else if (dateStr.includes("-")) {
    const parts = dateStr.split("-").map(Number);
    if (parts[0] > 1000) {
      // YYYY-MM-DD
      date = new Date(parts[0], parts[1] - 1, parts[2]);
    } else {
      // DD-MM-YYYY
      date = new Date(parts[2], parts[1] - 1, parts[0]);
    }
  } else {
    date = new Date(dateStr);
  }

  if (isNaN(date.getTime())) return false;

  // Normalizamos a la fecha de hoy local
  const now = new Date();
  const dayOfWeek = now.getDay() || 7; // Lunes = 1, Domingo = 7

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - (dayOfWeek - 1));
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return date >= startOfWeek && date <= endOfWeek;
};

const TableCheckbox = React.memo(({ checked, onChange, colorClass }) => (
  <div className="flex justify-center">
    <input
      type="checkbox"
      checked={!!checked}
      onChange={(e) => onChange(e.target.checked)}
      className={`w-4 h-4 rounded border-gray-300 focus:ring-2 cursor-pointer ${colorClass}`}
    />
  </div>
));

const HeaderCountInput = React.memo(({ value }) => (
  <div>
    <input
      type="text"
      readOnly
      value={value}
      className="w-full text-center text-[12px] font-bold text-gray-700"
    />
  </div>
));

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
        className="w-full min-w-[120px] bg-white dark:bg-[#262626] border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#1a9888] dark:text-gray-200"
      />
      <Edit3
        size={12}
        className="absolute right-2 top-2.5 text-gray-400 pointer-events-none opacity-50"
      />
    </div>
  );
});

// --- COMPONENTE FILA ---
const AuditRow = React.memo(
  ({
    row,
    selectedDay,
    handleExclusiveChange,
    handleAuditChange,
    getDynamicBackground,
    handleSaveRow,
  }) => {
    const auditData = row.auditoria?.[selectedDay];
    const [isSaving, setIsSaving] = useState(false);

    // Colores dinámicos
    const bgAccionVenta = getDynamicBackground(
      auditData?.accion_venta,
      "bg-blue-50/20",
    );
    const bgAccionCobranza = getDynamicBackground(
      auditData?.accion_cobranza,
      "bg-blue-50/20",
    );
    const bgLlamadaVenta = getDynamicBackground(
      auditData?.llamadas_venta,
      "bg-orange-50/20",
    );
    const bgLlamadaCobranza = getDynamicBackground(
      auditData?.llamadas_cobranza,
      "bg-orange-50/20",
    );

    // --- 1. DATOS EXTERNOS ---
    const logDelDia = useMemo(() => {
      if (Array.isArray(row.gestion)) {
        return row.gestion.find((g) => {
          if (!g.dia_semana) return false;
          const diaApi = g.dia_semana
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
          const diaSelect = selectedDay
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
          return diaApi === diaSelect;
        });
      }
      return null;
    }, [row.gestion, selectedDay]);

    const assignedTask = useMemo(() => {
      const s = row.semana || {};
      const dayKey = selectedDay
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      return s[dayKey]?.tarea || "";
    }, [row.semana, selectedDay]);

    // --- CÁLCULO DE DISTANCIA (CORREGIDO) ---
    const { distanciaTxt, esLejos } = useMemo(() => {
      const planificada = row.coordenadas;
      const real = logDelDia?.ubicacion;

      if (planificada && real && row.calculateDistance) {
        const mts = row.calculateDistance(planificada, real);

        if (mts !== null) {
          // 1. Definir si está lejos (Umbral de ejemplo: 200 metros)
          // Si mts > 200, se marca en ROJO. Ajusta el 200 a tu gusto.
          const isFar = mts > 200;

          // 2. Formatear el texto
          const txt = mts > 1000 ? `${(mts / 1000).toFixed(2)} km` : `${mts} m`;

          return { distanciaTxt: txt, esLejos: isFar };
        }
      }
      // Valor por defecto
      return { distanciaTxt: "-", esLejos: false };
    }, [row.coordenadas, logDelDia, row.calculateDistance]);

    // --- 2. CÁLCULOS LÓGICOS DE LA FILA ---

    // A. PLANIFICACIÓN (Puestas): ¿Tiene Tarea en la semana?
    const hasPlanning = useMemo(() => {
      const s = row.semana || {};
      const dayKey = selectedDay
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      const dailyTask = s[dayKey]?.tarea;
      return dailyTask && dailyTask.toString().trim().length > 0;
    }, [row.semana, selectedDay]);

    // B. LÓGICA 'De N-P a E'
    const deNpAE = useMemo(() => {
      if (!auditData) return false;

      // 1. ¿Tiene marcadas Proceso o Negativa?
      const isNP =
        auditData.accion_venta?.p ||
        auditData.accion_venta?.n ||
        auditData.accion_cobranza?.p ||
        auditData.accion_cobranza?.n ||
        auditData.llamadas_venta?.p ||
        auditData.llamadas_venta?.n ||
        auditData.llamadas_cobranza?.p ||
        auditData.llamadas_cobranza?.n;

      if (!isNP) return false;

      // 2. ¿Fecha Últ. Compra y Fecha Últ. Cobro en la semana actual?
      const compraEnSemana = isWithinCurrentWeek(row.fecha_ultima_compra);
      const cobroEnSemana = isWithinCurrentWeek(
        row.fecha_ultimo_cobro || row.ultimo_cobro,
      );

      return compraEnSemana && cobroEnSemana;
    }, [
      auditData,
      row.fecha_ultima_compra,
      row.fecha_ultimo_cobro,
      row.ultimo_cobro,
    ]);

    // C. LÓGICA 'CON GESTION'
    const conGestion = useMemo(() => {
      // 1. Cohort Check (> 2024)
      let purchaseYear = 0;
      if (row.fecha_ultima_compra) {
        if (row.fecha_ultima_compra.includes("/")) {
          purchaseYear = parseInt(row.fecha_ultima_compra.split("/")[2]);
        } else if (row.fecha_ultima_compra.includes("-")) {
          const parts = row.fecha_ultima_compra.split("-");
          purchaseYear = parts[0] > 1000 ? parseInt(parts[0]) : parseInt(parts[2]);
        }
      }

      if (purchaseYear <= 2024) return false;

      // 2. Dates Check
      const compraSemana = isWithinCurrentWeek(row.fecha_ultima_compra);
      const cobroSemana = isWithinCurrentWeek(row.fecha_ultimo_cobro || row.ultimo_cobro);
      if (compraSemana && cobroSemana) return true;

      // 3. Actions Check
      // Venta por llamada (Cualquiera de E, P, N en llamadas_venta)
      const hasVentaCall =
        auditData?.llamadas_venta?.e ||
        auditData?.llamadas_venta?.p ||
        auditData?.llamadas_venta?.n;

      // Cobranza por Whatsapp (Checkbox "EJECUTIVA" -> inicio_whatsapp.e)
      const hasCobranzaWs = auditData?.inicio_whatsapp?.e;

      return !!(hasVentaCall && hasCobranzaWs);
    }, [row, auditData]);

    return (
      <Tr className="hover:bg-gray-50 dark:hover:bg-[#333]">
        {/* BITRIX */}
        <Td
          stickyLeft={false}
          className="font-bold border-r text-xs max-w-[180px] truncate bg-white dark:bg-[#191919] z-10"
          title={row.nombre}
        >
          {row.nombre}
        </Td>
        <Td className="text-xs text-gray-500">{row.id_bitrix}</Td>
        <Td className="text-xs font-mono">{row.codigo}</Td>
        <Td className="text-xs truncate max-w-[120px]" title={row.zona}>
          {row.zona}
        </Td>
        <Td className="text-xs truncate max-w-[120px]" title={row.diasVisita}>
          {row.diasVisita}
        </Td>
        {/* PROFIT */}
        <Td className="text-right text-xs text-blue-700">
          {formatCurrency(row.limite_credito)}
        </Td>
        <Td className="text-right text-xs">
          {formatCurrency(row.saldo_transito)}
        </Td>
        <Td
          className={`text-right text-xs ${row.saldo_vencido > 0 ? "text-red-500 font-bold" : ""}`}
        >
          {formatCurrency(row.saldo_vencido)}
        </Td>
        <Td className="text-center text-xs whitespace-nowrap">
          {row.fecha_ultima_compra}
        </Td>
        <Td className="text-xs text-center">{row.factura_morosidad}</Td>
        <Td className="text-right text-xs whitespace-nowrap">
          {row.ultimo_cobro}
        </Td>
        <Td className="text-center text-xs">
          <ClassificationBadge value={row.horario_caja} />
        </Td>
        <Td className="text-center text-xs">{row.posee_convenio}</Td>
        <Td className="text-right text-xs font-semibold bg-blue-50/50 dark:bg-blue-900/10">
          {formatCurrency(row.venta_mes_actual)}
        </Td>
        <Td className="text-right text-xs text-gray-500 border-r border-gray-200">
          {formatCurrency(row.venta_mes_pasado)}
        </Td>

        {/* --- CHECKBOXES --- */}
        <Td className="bg-green-50/20 border-l border-green-100 p-0 text-center">
          <TableCheckbox
            checked={auditData?.inicio_whatsapp?.e}
            onChange={(val) =>
              handleExclusiveChange(row.id, "inicio_whatsapp", "e", val, [
                "e",
                "c",
              ])
            }
            colorClass="text-green-600 focus:ring-green-500"
          />
        </Td>
        <Td className="bg-green-50/20 border-r border-green-100 p-0 text-center">
          <TableCheckbox
            checked={auditData?.inicio_whatsapp?.c}
            onChange={(val) =>
              handleExclusiveChange(row.id, "inicio_whatsapp", "c", val, [
                "e",
                "c",
              ])
            }
            colorClass="text-green-600 focus:ring-green-500"
          />
        </Td>
        <Td
          className={`${bgAccionVenta} border-l border-blue-100 p-0 text-center`}
        >
          <TableCheckbox
            checked={auditData?.accion_venta?.e}
            onChange={(val) =>
              handleExclusiveChange(row.id, "accion_venta", "e", val)
            }
            colorClass="text-blue-600 focus:ring-blue-500"
          />
        </Td>
        <Td className={`${bgAccionVenta} p-0 text-center`}>
          <TableCheckbox
            checked={auditData?.accion_venta?.p}
            onChange={(val) =>
              handleExclusiveChange(row.id, "accion_venta", "p", val)
            }
            colorClass="text-blue-600 focus:ring-blue-500"
          />
        </Td>
        <Td
          className={`${bgAccionVenta} border-r border-blue-100 p-0 text-center`}
        >
          <TableCheckbox
            checked={auditData?.accion_venta?.n}
            onChange={(val) =>
              handleExclusiveChange(row.id, "accion_venta", "n", val)
            }
            colorClass="text-red-600 focus:ring-red-500"
          />
        </Td>
        <Td className={`${bgAccionCobranza} p-0 text-center`}>
          <TableCheckbox
            checked={auditData?.accion_cobranza?.e}
            onChange={(val) =>
              handleExclusiveChange(row.id, "accion_cobranza", "e", val)
            }
            colorClass="text-blue-600 focus:ring-blue-500"
          />
        </Td>
        <Td className={`${bgAccionCobranza} p-0 text-center`}>
          <TableCheckbox
            checked={auditData?.accion_cobranza?.p}
            onChange={(val) =>
              handleExclusiveChange(row.id, "accion_cobranza", "p", val)
            }
            colorClass="text-blue-600 focus:ring-blue-500"
          />
        </Td>
        <Td
          className={`${bgAccionCobranza} border-r border-blue-100 p-0 text-center`}
        >
          <TableCheckbox
            checked={auditData?.accion_cobranza?.n}
            onChange={(val) =>
              handleExclusiveChange(row.id, "accion_cobranza", "n", val)
            }
            colorClass="text-red-600 focus:ring-red-500"
          />
        </Td>
        <Td className="bg-slate-300 dark:bg-slate-800 border-r border-gray-300 p-0 text-center">
          <TableCheckbox
            checked={auditData?.cp || false}
            onChange={(val) => handleAuditChange(row.id, "cp", val)}
            colorClass="text-purple-600 focus:ring-purple-500"
          />
        </Td>
        <Td
          className={`${bgLlamadaVenta} border-l border-orange-100 p-0 text-center`}
        >
          <TableCheckbox
            checked={auditData?.llamadas_venta?.e}
            onChange={(val) =>
              handleExclusiveChange(row.id, "llamadas_venta", "e", val)
            }
            colorClass="text-orange-600 focus:ring-orange-500"
          />
        </Td>
        <Td className={`${bgLlamadaVenta} p-0 text-center`}>
          <TableCheckbox
            checked={auditData?.llamadas_venta?.p}
            onChange={(val) =>
              handleExclusiveChange(row.id, "llamadas_venta", "p", val)
            }
            colorClass="text-orange-600 focus:ring-orange-500"
          />
        </Td>
        <Td
          className={`${bgLlamadaVenta} border-r border-orange-100 p-0 text-center`}
        >
          <TableCheckbox
            checked={auditData?.llamadas_venta?.n}
            onChange={(val) =>
              handleExclusiveChange(row.id, "llamadas_venta", "n", val)
            }
            colorClass="text-red-600 focus:ring-red-500"
          />
        </Td>
        <Td className={`${bgLlamadaCobranza} p-0 text-center`}>
          <TableCheckbox
            checked={auditData?.llamadas_cobranza?.e}
            onChange={(val) =>
              handleExclusiveChange(row.id, "llamadas_cobranza", "e", val)
            }
            colorClass="text-orange-600 focus:ring-orange-500"
          />
        </Td>
        <Td className={`${bgLlamadaCobranza} p-0 text-center`}>
          <TableCheckbox
            checked={auditData?.llamadas_cobranza?.p}
            onChange={(val) =>
              handleExclusiveChange(row.id, "llamadas_cobranza", "p", val)
            }
            colorClass="text-orange-600 focus:ring-orange-500"
          />
        </Td>
        <Td
          className={`${bgLlamadaCobranza} border-r border-orange-100 p-0 text-center`}
        >
          <TableCheckbox
            checked={auditData?.llamadas_cobranza?.n}
            onChange={(val) =>
              handleExclusiveChange(row.id, "llamadas_cobranza", "n", val)
            }
            colorClass="text-red-600 focus:ring-red-500"
          />
        </Td>

        {/* --- ICONO PLANIFICACIÓN (Visual) --- */}
        <Td className="text-center text-xs whitespace-nowrap border-l border-gray-200">
          {hasPlanning && (
            <div className="flex justify-center items-center h-full w-full">
              <CheckCircle
                size={18}
                className="text-green-500 drop-shadow-sm"
              />
            </div>
          )}
        </Td>

        {/* --- ACCIÓN (TAREA) --- */}
        <Td className="text-xs text-center p-2 border-r border-gray-200">
          <span className="text-gray-700 dark:text-gray-300 font-medium wrap-break-word leading-tight block max-w-[150px] mx-auto">
            {assignedTask || "-"}
          </span>
        </Td>

        {/* --- DIFERENCIA COORDENADAS --- */}
        <Td
          className={`text-center text-xs whitespace-nowrap font-medium ${distanciaTxt !== "-" && esLejos
            ? "text-red-500 font-bold"
            : "text-green-600"
            }`}
        >
          {distanciaTxt}
        </Td>
        <Td className="text-center text-xs">
          {!logDelDia?.venta_descripcion && !logDelDia?.cobranza_descripcion ? (
            "-"
          ) : (
            <div className="flex flex-col gap-1">
              {logDelDia?.venta_descripcion && (
                <span
                  className="text-green-600 block truncate max-w-[180px]"
                  title={logDelDia.venta_descripcion}
                >
                  V: {logDelDia.venta_descripcion}
                </span>
              )}
              {logDelDia?.cobranza_descripcion && (
                <span
                  className="text-blue-600 block truncate max-w-[180px]"
                  title={logDelDia.cobranza_descripcion}
                >
                  C: {logDelDia.cobranza_descripcion}
                </span>
              )}
            </div>
          )}
        </Td>

        <Td className="text-center text-xs whitespace-nowrap">
          {logDelDia?.fecha_registro}
        </Td>
        <Td className="text-xs text-center">{logDelDia?.venta_tipoGestion}</Td>
        <Td className="text-right text-xs whitespace-nowrap">
          {logDelDia?.cobranza_tipoGestion}
        </Td>
        <Td className="text-center text-xs">
          {!logDelDia?.venta_descripcion && !logDelDia?.cobranza_descripcion ? (
            "-"
          ) : (
            <div className="flex flex-col gap-1">
              {logDelDia?.venta_descripcion && (
                <span
                  className="text-green-600 block truncate max-w-[180px]"
                  title={logDelDia.venta_descripcion}
                >
                  V: {logDelDia.venta_descripcion}
                </span>
              )}
              {logDelDia?.cobranza_descripcion && (
                <span
                  className="text-blue-600 block truncate max-w-[180px]"
                  title={logDelDia.cobranza_descripcion}
                >
                  C: {logDelDia.cobranza_descripcion}
                </span>
              )}
            </div>
          )}
        </Td>
        <Td className="min-w-[350px]">
          <EditableCell
            value={auditData?.observacion || ""}
            onChange={(val) => handleAuditChange(row.id, "observacion", val)}
            placeholder="Escribe la observación del día..."
          />
        </Td>
        {/* BOTÓN GUARDAR */}
        <Td className="text-center p-2 border-l border-gray-200 bg-gray-50 dark:bg-gray-800">
          <button
            onClick={async () => {
              setIsSaving(true);
              await handleSaveRow(row);
              setIsSaving(false);
            }}
            disabled={isSaving}
            className="p-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 flex mx-auto"
          >
            {isSaving ? (
              <Loader size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
          </button>
        </Td>
        {/* DE N-P A E */}
        <Td className="text-center p-2 border-l border-gray-200">
          <span
            className={`font-bold text-xs px-2 py-1 rounded ${deNpAE ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {deNpAE ? "SÍ" : "NO"}
          </span>
        </Td>
        {/* CON GESTION */}
        <Td className="text-center p-2 border-l border-gray-200">
          <span
            className={`font-bold text-xs px-2 py-1 rounded ${conGestion ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-400"}`}
          >
            {conGestion ? "SÍ" : "NO"}
          </span>
        </Td>
      </Tr>
    );
  },
);

// --- COMPONENTE PRINCIPAL ---
const Matriz = () => {
  const { data, loading, error, handleAuditoriaChange, refresh } = useAuditoria();
  const [selectedDay, setSelectedDay] = useState("lunes");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedZonas, setSelectedZonas] = useState([]); // Nuevo estado para filtro de Zonas
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 25;

  // --- FILTRO DE ZONAS (FRONTEND) ---
  // Obtener lista única de zonas basado en la data cargada
  const uniqueZonas = useMemo(() => {
    if (!data) return [];
    const zonas = data.map((item) => item.zona).filter((z) => z && z !== "—");
    return [...new Set(zonas)].sort();
  }, [data]);

  // --- FUNCIÓN PARA GUARDAR FILA ---
  const handleSaveRow = useCallback(
    async (row) => {
      try {
        const payload = {
          id_bitrix: row.id_bitrix,
          codigo_profit: row.codigo,
          gestion: {
            bitacora: row.bitacora,
            obs_ejecutiva: row.obs_ejecutiva,
            semana: row.semana,
            auditoria_matriz: row.auditoria,
          },
          full_data: { nombre: row.nombre },
        };

        console.log("📤 ENVIANDO AL BACKEND:", payload);

        await apiService.saveMatrix(payload);

        // --- RECARGA AUTOMÁTICA DE DATOS SIN REFRESH DE PÁGINA ---
        await refresh(false); // false para no mostrar el spinner de carga completa si no quieres, o true para feedback claro

        alert("✅ Guardado correctamente");
      } catch (err) {
        console.error(err);
        alert("❌ Error al guardar");
      }
    },
    [refresh],
  );
  const getDynamicBackground = useCallback((categoryData, defaultColor) => {
    if (categoryData?.e)
      return "bg-green-200 dark:bg-green-900/60 transition-colors duration-300";
    if (categoryData?.p)
      return "bg-orange-200 dark:bg-orange-900/60 transition-colors duration-300";
    if (categoryData?.n)
      return "bg-red-200 dark:bg-red-900/60 transition-colors duration-300";
    return defaultColor;
  }, []);

  const handleExclusiveChange = useCallback(
    (rowId, category, field, newValue, customGroup = null) => {
      handleAuditoriaChange(rowId, selectedDay, category, field, newValue);
      if (newValue === true) {
        const siblings = customGroup || ["e", "p", "n"];
        siblings.forEach((sibling) => {
          if (sibling !== field) {
            handleAuditoriaChange(rowId, selectedDay, category, sibling, false);
          }
        });
      }
    },
    [handleAuditoriaChange, selectedDay],
  );

  const handleAuditChange = useCallback(
    (rowId, category, newValue) => {
      handleAuditoriaChange(rowId, selectedDay, category, newValue);
    },
    [handleAuditoriaChange, selectedDay],
  );

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // 1. Filtro por Texto (Nombre/Código)
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const nombre = item.nombre?.toLowerCase() || "";
        const codigo = item.codigo?.toString().toLowerCase() || "";
        if (!nombre.includes(term) && !codigo.includes(term)) return false;
      }

      // 2. Filtro por Zona (Multiselect)
      if (selectedZonas.length > 0) {
        if (!selectedZonas.includes(item.zona)) return false;
      }

      return true;
    });
  }, [data, searchTerm, selectedZonas]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE) || 1;
  const paginatedData = filteredData.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const goToPage = (p) => {
    if (p >= 1 && p <= totalPages) setPage(p);
  };

  // --- CÁLCULO DE TOTALES PARA EL HEADER (LÓGICA POR DÍA) ---
  const headerCounts = useMemo(() => {
    const counts = {
      // Totales de checks simples (Colores)
      inicio_whatsapp: { e: 0, c: 0 },
      accion_venta: { e: 0, p: 0, n: 0 },
      accion_cobranza: { e: 0, p: 0, n: 0 },
      llamadas_venta: { e: 0, p: 0, n: 0 },
      llamadas_cobranza: { e: 0, p: 0, n: 0 },

      puestas_total: 0,
      cumplidos_total: 0,
      visitas_dia_total: 0,
      deNpAE_total: 0,
      percent_avg: 0,
    };

    if (!data.length) return counts;

    const dayKey = selectedDay
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    filteredData.forEach((row) => {
      const day = row.auditoria?.[selectedDay];
      if (!day) return;

      // 1. Sumar checks simples de colores (Igual que antes)
      if (day.inicio_whatsapp?.e) counts.inicio_whatsapp.e++;
      if (day.inicio_whatsapp?.c) counts.inicio_whatsapp.c++;
      ["e", "p", "n"].forEach((f) => {
        if (day.accion_venta?.[f]) counts.accion_venta[f]++;
        if (day.accion_cobranza?.[f]) counts.accion_cobranza[f]++;
        if (day.llamadas_venta?.[f]) counts.llamadas_venta[f]++;
        if (day.llamadas_cobranza?.[f]) counts.llamadas_cobranza[f]++;
      });

      // --- 2. LÓGICA DE TOTALES ESTRICTA POR DÍA ---

      // A. PUESTAS: Solo si hay tarea en ESE día específico (dayKey)
      const s = row.semana || {};
      const dailyTask = s[dayKey]?.tarea;
      const isPuesta = dailyTask && dailyTask.toString().trim().length > 0;

      if (isPuesta) counts.puestas_total++;

      // Helpers para saber si hubo gestión real (Obs)
      const log = Array.isArray(row.gestion)
        ? row.gestion.find((g) => {
          if (!g.dia_semana) return false;
          return (
            g.dia_semana
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "") === dayKey
          );
        })
        : null;

      // ¿Tiene Observación (Manual del día O Histórica del día)?
      const hasObs =
        (day.observacion && day.observacion.toString().trim().length > 0) ||
        (log && (log.venta_descripcion || log.cobranza_descripcion));

      // B. CUMPLIDO (Era Puesta del día Y tuvo Obs)
      if (isPuesta && hasObs) counts.cumplidos_total++;

      // C. VISITA DEL DÍA (Solo tuvo Obs, planificado o no)
      if (hasObs) counts.visitas_dia_total++;

      // D. DE N-P A E (Cálculo inmediato para el total)
      const isNP =
        day.accion_venta?.p ||
        day.accion_venta?.n ||
        day.accion_cobranza?.p ||
        day.accion_cobranza?.n ||
        day.llamadas_venta?.p ||
        day.llamadas_venta?.n ||
        day.llamadas_cobranza?.p ||
        day.llamadas_cobranza?.n;

      if (isNP) {
        const compraSemana = isWithinCurrentWeek(row.fecha_ultima_compra);
        const cobroSemana = isWithinCurrentWeek(row.fecha_ultimo_cobro || row.ultimo_cobro);
        if (compraSemana && cobroSemana) counts.deNpAE_total++;
      }
    });

    // E. % TOTAL (Cumplidos / Puestas)
    if (counts.puestas_total > 0) {
      counts.percent_avg = (
        (counts.cumplidos_total / counts.puestas_total) *
        100
      ).toFixed(0);
    }

    return counts;
  }, [filteredData, selectedDay, data]);

  const stats = useMemo(() => {
    return {
      efectivas: filteredData.reduce((acc, row) => {
        const day = row.auditoria?.[selectedDay];
        if (!day) return acc;
        const hasE =
          day.accion_venta?.e ||
          day.accion_cobranza?.e ||
          day.llamadas_venta?.e ||
          day.llamadas_cobranza?.e;
        return hasE ? acc + 1 : acc;
      }, 0),
      ventaProceso: filteredData.reduce((acc, row) => {
        const day = row.auditoria?.[selectedDay];
        if (!day) return acc;
        return day.accion_venta?.p || day.llamadas_venta?.p ? acc + 1 : acc;
      }, 0),
      cobranzaProceso: filteredData.reduce((acc, row) => {
        const day = row.auditoria?.[selectedDay];
        if (!day) return acc;
        return day.accion_cobranza?.p || day.llamadas_cobranza?.p
          ? acc + 1
          : acc;
      }, 0),
      sinGestion: filteredData.reduce((acc, row) => {
        const day = row.auditoria?.[selectedDay];
        if (!day) return acc + 1;
        const hasCheck =
          day.inicio_whatsapp?.e ||
          day.inicio_whatsapp?.c ||
          day.accion_venta?.e ||
          day.accion_venta?.p ||
          day.accion_venta?.n ||
          day.accion_cobranza?.e ||
          day.accion_cobranza?.p ||
          day.accion_cobranza?.n ||
          day.llamadas_venta?.e ||
          day.llamadas_venta?.p ||
          day.llamadas_venta?.n ||
          day.llamadas_cobranza?.e ||
          day.llamadas_cobranza?.p ||
          day.llamadas_cobranza?.n;
        const hasObs =
          day.observacion && day.observacion.toString().trim().length > 0;
        return !hasCheck && !hasObs ? acc + 1 : acc;
      }, 0),
    };
  }, [filteredData, selectedDay]);

  if (error)
    return (
      <div className="p-8 text-center text-red-500">Error: {error.message}</div>
    );

  return (
    <div className="p-2 min-h-screen bg-white dark:bg-[#191919]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg text-[#1a9888]">
            <Save size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Auditoría de Conversaciones
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Mostrando {filteredData.length} de {data.length} registros
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
          {/* SELECTOR DE DÍA */}
          <div className="flex bg-gray-100 dark:bg-[#333] p-1 rounded-lg">
            {["lunes", "martes", "miercoles", "jueves", "viernes"].map(
              (day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-all ${selectedDay === day
                    ? "bg-white dark:bg-[#191919] text-[#1a9888] shadow-sm ring-1 ring-gray-200 dark:ring-0"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    }`}
                >
                  {day}
                </button>
              ),
            )}
          </div>

          {/* FILTRO DE ZONA */}
          <FilterMultiSelect
            label="Zonas"
            options={uniqueZonas}
            selected={selectedZonas}
            onChange={setSelectedZonas}
          />

          <div className="flex items-center bg-gray-50 dark:bg-[#202020] border border-gray-300 dark:border-gray-600 rounded-lg p-1 shadow-sm">
            <div className="relative border-r border-gray-200 dark:border-gray-700 pr-1">
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 w-48 text-sm bg-transparent outline-none dark:text-white transition-all"
              />
              <Search
                className="absolute left-3 top-2 text-gray-400"
                size={16}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-2 text-gray-400 hover:text-red-500"
                >
                  <XCircle size={16} />
                </button>
              )}
            </div>
            <div className="flex items-center h-full py-1">
              <StatBadge
                label="Efectivas"
                value={stats.efectivas}
                colorClass="text-green-600"
              />
              <StatBadge
                label="Venta (P)"
                value={stats.ventaProceso}
                colorClass="text-orange-500"
              />
              <StatBadge
                label="Cobro (P)"
                value={stats.cobranzaProceso}
                colorClass="text-blue-600"
              />
              <StatBadge
                label="Sin Gestión"
                value={stats.sinGestion}
                colorClass="text-red-500"
              />
              <StatBadge
                label="De N-P a E"
                value={headerCounts.deNpAE_total}
                colorClass="text-purple-600"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#202020] p-1 rounded-lg border border-gray-200 dark:border-[#333]">
              <span className="text-xs font-bold text-gray-500 px-2 uppercase">
                Día de Auditoría:
              </span>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="bg-white dark:bg-[#333] text-gray-700 dark:text-gray-200 text-sm font-medium px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1a9888]"
              >
                <option value="lunes">Lunes</option>
                <option value="martes">Martes</option>
                <option value="miercoles">Miércoles</option>
                <option value="jueves">Jueves</option>
                <option value="viernes">Viernes</option>
                <option value="sabado">Sábado</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <TableContainer className="max-h-[85vh]">
        {loading ? (
          <div className="p-10 flex flex-col items-center justify-center text-gray-500">
            <RefreshCw className="animate-spin w-8 h-8 mb-2 text-[#1a9888]" />
            <span>Cargando página 1...</span>
          </div>
        ) : (
          <Table>
            <Thead>
              {/* Nivel 1 Header */}
              <Tr>
                <Th
                  colSpan={5}
                  stickyTop
                  className="p-0 border-r border-green-200 dark:border-green-600 bg-green-100 dark:bg-green-900 h-1"
                ></Th>
                <Th
                  colSpan={10}
                  stickyTop
                  className="p-0 border-r border-blue-200 dark:border-blue-600 bg-blue-100 dark:bg-blue-900 h-1"
                ></Th>
                <Th
                  colSpan={19}
                  stickyTop
                  className="bg-purple-100 text-purple-800 text-center border-r border-purple-200 z-20 dark:bg-purple-900 dark:text-purple-200"
                >
                  GESTIÓN DIARIA:{" "}
                  <span className="uppercase font-bold">{selectedDay}</span>
                </Th>
                <Th
                  colSpan={4}
                  className="p-0 border-r border-gray-200 dark:border-gray-600 bg-gray-200 dark:bg-gray-900 h-1"
                ></Th>
                <Th
                  colSpan={1}
                  className="p-0 border-r border-pink-200 dark:border-pink-600 bg-pink-200 dark:bg-pink-900 h-1"
                ></Th>
                <Th
                  colSpan={1}
                  className="bg-white border-l border-gray-200"
                ></Th>
                <Th
                  colSpan={1}
                  className="bg-white border-l border-gray-200"
                ></Th>
                <Th
                  colSpan={1}
                  className="bg-white border-l border-gray-200"
                ></Th>
              </Tr>
              {/* Nivel 2 Header */}
              <Tr>
                <Th
                  colSpan={5}
                  className="p-0 border-r border-green-200 dark:border-green-600 bg-green-100 dark:bg-green-900 h-1"
                ></Th>
                <Th
                  colSpan={10}
                  className="p-0 border-r border-blue-200 dark:border-blue-600 bg-blue-100 dark:bg-blue-900 h-1"
                ></Th>
                <Th
                  colSpan={2}
                  className="text-center text-[10px] uppercase bg-yellow-50 dark:bg-yellow-900 border-r border-yellow-200 dark:border-yellow-600 text-gray-500"
                >
                  Inicios
                </Th>
                <Th
                  colSpan={6}
                  className="text-center text-[10px] uppercase bg-yellow-50 dark:bg-yellow-900 border-r border-yellow-200 dark:border-yellow-600 text-gray-500"
                >
                  Acción Realizada
                </Th>
                <Th
                  colSpan={1}
                  className="p-0 border-r border-green-300 dark:border-green-600 bg-slate-300 dark:bg-slate-900 h-1"
                ></Th>
                <Th
                  colSpan={6}
                  className="text-center text-[10px] uppercase bg-yellow-50 dark:bg-yellow-900 border-r border-yellow-200 dark:border-yellow-600 text-gray-500"
                >
                  Llamadas
                </Th>
                <Th
                  colSpan={4}
                  className="text-center text-[10px] uppercase bg-yellow-50 dark:bg-yellow-900 border-r border-yellow-200 dark:border-yellow-600 text-gray-500"
                >
                  Visitas Asesor de Venta
                </Th>
                <Th
                  colSpan={4}
                  className="p-0 border-r border-gray-200 dark:border-gray-600 bg-gray-200 dark:bg-gray-900 h-1"
                ></Th>
                <Th
                  colSpan={1}
                  className="p-0 border-r border-pink-200 dark:border-pink-600 bg-pink-200 dark:bg-pink-900 h-1"
                ></Th>
                <Th
                  colSpan={1}
                  className="bg-white border-l border-gray-200"
                ></Th>
                <Th
                  colSpan={1}
                  className="bg-white border-l border-gray-200"
                ></Th>
                <Th
                  colSpan={1}
                  className="bg-white border-l border-gray-200"
                ></Th>
              </Tr>
              {/* Nivel 3 Header */}
              <Tr>
                <Th
                  colSpan={5}
                  className="p-0 border-r border-green-200 dark:border-green-600 bg-green-100 dark:bg-green-900 h-1"
                ></Th>
                <Th
                  colSpan={10}
                  className="p-0 border-r border-blue-200 dark:border-blue-600 bg-blue-100 dark:bg-blue-900 h-1"
                ></Th>
                <Th
                  colSpan={2}
                  className="p-0 border-r border-yellow-200 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900 h-1"
                ></Th>
                <Th
                  colSpan={6}
                  className="p-0 border-r border-yellow-200 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900 h-1"
                ></Th>
                <Th
                  colSpan={1}
                  className="p-0 border-r border-green-300 dark:border-green-600 bg-slate-300 dark:bg-slate-900 h-1"
                ></Th>
                <Th
                  colSpan={6}
                  className="p-0 border-r border-yellow-200 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900 h-1"
                ></Th>
                <Th
                  colSpan={1}
                  className="p-0 border-r border-yellow-200 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900 h-1"
                >
                  Puestas
                </Th>
                <Th
                  colSpan={1}
                  className="p-0 border-r border-yellow-200 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900 h-1"
                >
                  Cumplidos
                </Th>
                <Th
                  colSpan={1}
                  className="p-0 border-r border-yellow-200 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900 h-1"
                >
                  Visitas del dia
                </Th>
                <Th
                  colSpan={1}
                  className="p-0 border-r border-yellow-200 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900 h-1"
                >
                  % de Planificación
                </Th>
                <Th
                  colSpan={4}
                  className="p-0 border-r border-gray-200 dark:border-gray-600 bg-gray-200 dark:bg-gray-900 h-1"
                ></Th>
                <Th
                  colSpan={1}
                  className="p-0 border-r border-pink-200 dark:border-pink-600 bg-pink-200 dark:bg-pink-900 h-1"
                ></Th>
                <Th
                  colSpan={1}
                  className="bg-white border-l border-gray-200"
                ></Th>
                <Th
                  colSpan={1}
                  className="bg-white border-l border-gray-200"
                ></Th>
                <Th
                  colSpan={1}
                  className="bg-white border-l border-gray-200"
                ></Th>
              </Tr>

              {/* --- HEADER NIVEL 4 (INPUTS Y TOTALES) --- */}
              <Tr>
                <Th
                  colSpan={5}
                  className=" bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-center border-r border-green-200 z-20 text-[15px]"
                >
                  DATOS DEL CLIENTE (BITRIX)
                </Th>
                <Th
                  colSpan={10}
                  className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-center border-r border-blue-200 dark:border-blue-600 z-20 text-[15px]"
                >
                  DATOS FINANCIEROS (PROFIT)
                </Th>
                <Th className="min-w-[30px] bg-white p-0 border-l border-white">
                  <HeaderCountInput value={headerCounts.inicio_whatsapp.e} />
                </Th>
                <Th className="min-w-[30px] bg-white p-0 border-l border-white">
                  <HeaderCountInput value={headerCounts.inicio_whatsapp.c} />
                </Th>
                <Th className="min-w-[30px] bg-white p-0 border-l border-white">
                  <HeaderCountInput value={headerCounts.accion_venta.e} />
                </Th>
                <Th className="min-w-[30px] bg-white p-0 border-l border-white">
                  <HeaderCountInput value={headerCounts.accion_venta.p} />
                </Th>
                <Th className="min-w-[30px] bg-white p-0 border-l border-white">
                  <HeaderCountInput value={headerCounts.accion_venta.n} />
                </Th>
                <Th className="min-w-[30px] bg-white p-0 border-l border-white">
                  <HeaderCountInput value={headerCounts.accion_cobranza.e} />
                </Th>
                <Th className="min-w-[30px] bg-white p-0 border-l border-white">
                  <HeaderCountInput value={headerCounts.accion_cobranza.p} />
                </Th>
                <Th className="min-w-[30px] bg-white p-0 border-l border-white">
                  <HeaderCountInput value={headerCounts.accion_cobranza.n} />
                </Th>
                <Th
                  colSpan={1}
                  className="p-0 border-r border-green-300 dark:border-green-600 bg-slate-300 dark:bg-slate-900 h-1"
                ></Th>
                <Th className="min-w-[30px] bg-white p-0 border-l border-white">
                  <HeaderCountInput value={headerCounts.llamadas_venta.e} />
                </Th>
                <Th className="min-w-[30px] bg-white p-0 border-l border-white">
                  <HeaderCountInput value={headerCounts.llamadas_venta.p} />
                </Th>
                <Th className="min-w-[30px] bg-white p-0 border-l border-white">
                  <HeaderCountInput value={headerCounts.llamadas_venta.n} />
                </Th>
                <Th className="min-w-[30px] bg-white p-0 border-l border-white">
                  <HeaderCountInput value={headerCounts.llamadas_cobranza.e} />
                </Th>
                <Th className="min-w-[30px] bg-white p-0 border-l border-white">
                  <HeaderCountInput value={headerCounts.llamadas_cobranza.p} />
                </Th>
                <Th className="min-w-[30px] bg-white p-0 border-l border-white">
                  <HeaderCountInput value={headerCounts.llamadas_cobranza.n} />
                </Th>

                {/* --- 4 CELDAS DE TOTALES (Reemplazan a las de llamadas repetidas) --- */}
                <Th className="min-w-[30px] bg-white p-0 border-l border-white">
                  <HeaderCountInput value={headerCounts.puestas_total} />
                </Th>
                <Th className="min-w-[30px] bg-white p-0 border-l border-white">
                  <HeaderCountInput value={headerCounts.cumplidos_total} />
                </Th>
                <Th className="min-w-[30px] bg-white p-0 border-l border-white">
                  <HeaderCountInput value={headerCounts.visitas_dia_total} />
                </Th>
                <Th className="min-w-[30px] bg-white p-0 border-l border-white">
                  <HeaderCountInput value={`${headerCounts.percent_avg}%`} />
                </Th>

                <Th
                  colSpan={4}
                  className="text-center text-[15px] uppercase bg-gray-200 dark:bg-gray-900 border-r dark:border-gray-600 border-gray-200 text-gray-700 dark:text-gray-200"
                >
                  Vendedores
                </Th>
                <Th
                  colSpan={1}
                  className="text-center text-[10px] uppercase bg-pink-200 dark:bg-pink-900 border-r dark:border-pink-600 border-pink-200 text-pink-700 dark:text-pink-200"
                >
                  Observación
                </Th>
                <Th className="bg-white border-l border-gray-200 text-[10px] uppercase font-bold text-center">
                  Guardar
                </Th>
                <Th className="bg-white border-l border-gray-200 text-[10px] uppercase font-bold text-center">
                  De N-P a E
                </Th>
                <Th className="bg-white border-l border-gray-200 text-[10px] uppercase font-bold text-center text-purple-700">
                  CON GESTIÓN
                </Th>
              </Tr>

              {/* Nivel 5, 6, 7 (Headers de etiquetas - Iguales) */}
              <Tr>
                <Th
                  colSpan={5}
                  className="p-0 border-r border-green-200 dark:border-green-600 bg-green-100 dark:bg-green-900 h-1"
                ></Th>
                <Th
                  colSpan={10}
                  className="p-0 border-r border-blue-200 dark:border-blue-600 bg-blue-100 dark:bg-blue-900 h-1"
                ></Th>
                <Th
                  colSpan={2}
                  className="text-center text-[10px] uppercase bg-green-50 dark:bg-green-900 border-r dark:border-green-600 border-green-200 text-green-700 dark:text-green-200"
                >
                  Inicio WhatsApp
                </Th>
                <Th
                  colSpan={6}
                  className="text-center text-[10px] uppercase bg-blue-50 dark:bg-blue-900 border-r dark:border-blue-600 border-blue-200 text-blue-700 dark:text-blue-200"
                >
                  Acción Realizada
                </Th>
                <Th
                  colSpan={1}
                  className="p-0 border-r border-green-300 dark:border-green-600 bg-slate-300 dark:bg-slate-900 h-1"
                ></Th>
                <Th
                  colSpan={6}
                  className="text-center text-[10px] uppercase bg-teal-50 dark:bg-teal-900 border-r dark:border-teal-600 border-teal-200 text-teal-700 dark:text-teal-200"
                >
                  Llamadas
                </Th>
                <Th
                  colSpan={4}
                  className="text-center text-[10px] uppercase bg-yellow-50 dark:bg-yellow-900 border-r dark:border-yellow-600 border-yellow-200 text-yellow-700 dark:text-yellow-200"
                >
                  Visitas Asesor de Venta
                </Th>
                <Th
                  colSpan={4}
                  className="p-0 border-r border-gray-200 dark:border-gray-600 bg-gray-200 dark:bg-gray-900 h-1"
                ></Th>
                <Th
                  colSpan={1}
                  className="p-0 border-r border-pink-200 dark:border-pink-600 bg-pink-200 dark:bg-pink-900 h-1"
                ></Th>
                <Th
                  colSpan={1}
                  className="bg-white border-r border-gray-200"
                ></Th>
                <Th
                  colSpan={1}
                  className="bg-white border-r border-gray-200"
                ></Th>
              </Tr>
              <Tr>
                <Th
                  colSpan={5}
                  className="p-0 border-r border-green-200 dark:border-green-600 bg-green-100 dark:bg-green-900 h-1"
                ></Th>
                <Th
                  colSpan={10}
                  className="p-0 border-r border-blue-200 dark:border-blue-600 bg-blue-100 dark:bg-blue-900 h-1"
                ></Th>
                <Th
                  colSpan={2}
                  className="p-0 border-r border-green-200 dark:border-green-600 bg-green-50 dark:bg-green-900 h-1"
                ></Th>
                <Th
                  colSpan={3}
                  className="text-center text-[10px] uppercase bg-blue-50 dark:bg-blue-900 border-r dark:border-blue-600 border-blue-200 text-blue-700 dark:text-blue-200"
                >
                  Venta
                </Th>
                <Th
                  colSpan={3}
                  className="text-center text-[10px] uppercase bg-blue-50 dark:bg-blue-900 border-r dark:border-blue-600 border-blue-200 text-blue-700 dark:text-blue-200"
                >
                  Cobranza
                </Th>
                <Th
                  colSpan={1}
                  className="p-0 border-r border-green-300 dark:border-green-600 bg-slate-300 dark:bg-slate-900 h-1"
                ></Th>
                <Th
                  colSpan={3}
                  className="text-center text-[10px] uppercase bg-teal-50 dark:bg-teal-900 border-r dark:border-teal-600 border-teal-200 text-teal-700 dark:text-teal-200"
                >
                  Venta
                </Th>
                <Th
                  colSpan={3}
                  className="text-center text-[10px] uppercase bg-teal-50 dark:bg-teal-900 border-r dark:border-teal-600 border-teal-200 text-teal-700 dark:text-teal-200"
                >
                  Cobranza
                </Th>
                <Th
                  colSpan={4}
                  className="p-0 border-r border-yellow-200 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900 h-1"
                ></Th>
                <Th
                  colSpan={4}
                  className="p-0 border-r border-gray-200 dark:border-gray-600 bg-gray-200 dark:bg-gray-900 h-1"
                ></Th>
                <Th
                  colSpan={1}
                  className="p-0 border-r border-pink-200 dark:border-pink-600 bg-pink-200 dark:bg-pink-900 h-1"
                ></Th>
                <Th
                  colSpan={1}
                  className="bg-white border-r border-gray-200"
                ></Th>
                <Th
                  colSpan={1}
                  className="bg-white border-r border-gray-200"
                ></Th>
              </Tr>
              <Tr>
                <Th
                  stickyLeft={false}
                  className="min-w-[180px] w-[180px] bg-white dark:bg-[#1e1e1e] z-20 shadow-md border-t"
                >
                  Cliente
                </Th>
                <Th className="min-w-[60px] bg-white dark:bg-[#1e1e1e] text-xs border-t">
                  Compañia ID
                </Th>
                <Th className="min-w-[80px] bg-white dark:bg-[#1e1e1e] text-xs border-t">
                  Código
                </Th>
                <Th className="min-w-[120px] bg-white dark:bg-[#1e1e1e] text-xs border-t">
                  Zona
                </Th>
                <Th className="min-w-[120px] bg-white dark:bg-[#1e1e1e] text-xs border-t">
                  Días
                </Th>
                <Th className="min-w-[100px] text-xs border-t">Límite Créd.</Th>
                <Th className="min-w-[100px] text-xs border-t">
                  Saldo Tránsito
                </Th>
                <Th className="min-w-[100px] text-xs border-t">
                  Saldo Vencido
                </Th>
                <Th className="min-w-[90px] text-xs border-t">
                  Fecha Últ. Compra
                </Th>
                <Th className="min-w-[110px] text-xs border-t">
                  Fact. Mayor Morosidad
                </Th>
                <Th className="min-w-[90px] text-xs border-t">
                  Fecha Últ. Cobro
                </Th>
                <Th className="min-w-[70px] text-xs border-t">Clasif.</Th>
                <Th className="min-w-[80px] text-xs border-t">
                  Posee Convenio
                </Th>
                <Th className="min-w-[100px] text-xs border-t">
                  Venta Mes Actual
                </Th>
                <Th className="min-w-[100px] text-xs border-t">
                  Venta Mes Anterior
                </Th>

                <Th
                  className="min-w-[30px] font-bold text-center bg-green-50 dark:bg-green-900 dark:text-green-200 text-[10px] border-l border-green-200"
                  title="Enviado"
                >
                  EJECUTIVA
                </Th>
                <Th
                  className="min-w-[30px] font-bold text-center bg-green-50 dark:bg-green-900 dark:text-green-200 text-[10px] border-r border-green-200"
                  title="Contestado"
                >
                  CLIENTE
                </Th>
                <Th
                  className="min-w-[30px] font-bold text-center bg-blue-50 dark:bg-blue-900 dark:text-blue-200 text-[10px] border-l border-blue-200"
                  title="Venta Enviado"
                >
                  E
                </Th>
                <Th
                  className="min-w-[30px] font-bold text-center bg-blue-50 dark:bg-blue-900 dark:text-blue-200 text-[10px]"
                  title="Venta Pendiente"
                >
                  P
                </Th>
                <Th
                  className="min-w-[30px] font-bold text-center bg-blue-50 dark:bg-blue-900 dark:text-blue-200 text-[10px] border-r border-blue-200"
                  title="Venta Negada"
                >
                  N
                </Th>
                <Th
                  className="min-w-[30px] font-bold text-center bg-blue-50 dark:bg-blue-900 dark:text-blue-200 text-[10px]"
                  title="Cobranza Enviado"
                >
                  E
                </Th>
                <Th
                  className="min-w-[30px] font-bold text-center bg-blue-50 dark:bg-blue-900 dark:text-blue-200 text-[10px]"
                  title="Cobranza Pendiente"
                >
                  P
                </Th>
                <Th
                  className="min-w-[30px] font-bold text-center bg-blue-50 dark:bg-blue-900 dark:text-blue-200 text-[10px] border-r border-blue-200"
                  title="Cobranza Negada"
                >
                  N
                </Th>
                <Th
                  colSpan={1}
                  className="p-0 border-r border-green-300 dark:border-green-600 bg-slate-300 dark:bg-slate-900 h-1"
                >
                  CP
                </Th>
                <Th
                  className="min-w-[30px] font-bold text-center bg-teal-50 dark:bg-teal-900 dark:text-teal-200 text-[10px] border-l border-teal-200"
                  title="Llamada Venta E"
                >
                  E
                </Th>
                <Th
                  className="min-w-[30px] font-bold text-center bg-teal-50 dark:bg-teal-900 dark:text-teal-200 text-[10px]"
                  title="Llamada Venta P"
                >
                  P
                </Th>
                <Th
                  className="min-w-[30px] font-bold text-center bg-teal-50 dark:bg-teal-900 dark:text-teal-200 text-[10px] border-r border-teal-200"
                  title="Llamada Venta N"
                >
                  N
                </Th>
                <Th
                  className="min-w-[30px] font-bold text-center bg-teal-50 dark:bg-teal-900 dark:text-teal-200 text-[10px]"
                  title="Llamada Cobranza E"
                >
                  E
                </Th>
                <Th
                  className="min-w-[30px] font-bold text-center bg-teal-50 dark:bg-teal-900 dark:text-teal-200 text-[10px]"
                  title="Llamada Cobranza P"
                >
                  P
                </Th>
                <Th
                  className="min-w-[30px] font-bold text-center bg-teal-50 dark:bg-teal-900 dark:text-teal-200 text-[10px]"
                  title="Llamada Cobranza N"
                >
                  N
                </Th>
                <Th className="text-center text-[10px] uppercase bg-yellow-50 dark:bg-yellow-900 dark:text-yellow-200 border-r border-yellow-200 text-yellow-700">
                  Planificación
                </Th>
                <Th className="text-center text-[10px] uppercase bg-yellow-50 dark:bg-yellow-900 dark:text-yellow-200 border-r border-yellow-200 text-yellow-700">
                  Acción del Dia
                </Th>
                <Th className="text-center text-[10px] uppercase bg-yellow-50 dark:bg-yellow-900 dark:text-yellow-200 border-r border-yellow-200 text-yellow-700">
                  Diferencia de Coordenadas
                </Th>
                <Th className="text-center text-[10px] uppercase bg-yellow-50 dark:bg-yellow-900 dark:text-yellow-200 border-r border-yellow-200 text-yellow-700">
                  Observación del vendedor
                </Th>
                <Th className="text-center text-[10px] uppercase bg-gray-200 dark:bg-gray-900 dark:text-gray-200 border-r border-gray-200 text-gray-700">
                  Fecha de Registro
                </Th>
                <Th className="text-center text-[10px] uppercase bg-gray-200 dark:bg-gray-900 dark:text-gray-200 border-r border-gray-200 text-gray-700">
                  Tipo de gestión de ventas
                </Th>
                <Th className="text-center text-[10px] uppercase bg-gray-200 dark:bg-gray-900 dark:text-gray-200 border-r border-gray-200 text-gray-700">
                  Tipo de gestión de cobranza
                </Th>
                <Th className="text-center text-[10px] uppercase bg-gray-200 dark:bg-gray-900 dark:text-gray-200 border-r border-gray-200 text-gray-700">
                  Descripción de ambos conceptos
                </Th>
                <Th className="text-center text-[10px] uppercase bg-pink-200 dark:bg-pink-900 dark:text-pink-200 border-r border-pink-200 text-pink-700">
                  Observaciones
                </Th>
                <Th className="bg-white border-l border-gray-200 text-xs text-center uppercase font-bold">
                  Guardar
                </Th>
                <Th className="bg-white border-l border-gray-200 text-[10px] text-center uppercase font-bold">
                  De N-P a E
                </Th>
                <Th className="bg-white border-l border-gray-200 text-[10px] text-center uppercase font-bold text-purple-700">
                  CON GESTIÓN
                </Th>
              </Tr>
            </Thead>

            <Tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row) => (
                  <AuditRow
                    key={row.id}
                    row={row}
                    selectedDay={selectedDay}
                    handleExclusiveChange={handleExclusiveChange}
                    handleAuditChange={handleAuditChange}
                    getDynamicBackground={getDynamicBackground}
                    handleSaveRow={handleSaveRow}
                  />
                ))
              ) : (
                <Tr>
                  <Td colSpan={41} className="text-center py-8 text-gray-500">
                    No se encontraron resultados para "{searchTerm}"
                  </Td>

                </Tr>
              )}
            </Tbody>
          </Table>
        )
        }
      </TableContainer >

      {/* --- PAGINACIÓN --- */}
      < div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4 mt-2 gap-4" >
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
            Página {page} de {totalPages || 1}
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const p = parseInt(e.target.pageInput.value);
            if (p >= 1 && p <= totalPages) {
              goToPage(p);
              e.target.pageInput.value = "";
            } else {
              alert(`Página inválida (1-${totalPages})`);
            }
          }}
          className="flex items-center gap-2"
        >
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Ir a pág:
          </span>
          <input
            name="pageInput"
            type="number"
            min="1"
            max={totalPages}
            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a9888] dark:bg-[#333] dark:border-gray-600 dark:text-white"
          />
          <button
            type="submit"
            className="px-3 py-1 text-xs font-bold text-white bg-gray-600 rounded-md hover:bg-gray-700"
          >
            IR
          </button>
        </form>
      </div >
    </div >
  );
};

export default Matriz;
