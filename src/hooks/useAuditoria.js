/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import { apiService } from "../services/apiService";

// --- HELPER DE FECHAS (Hora Local) ---
const isWithinCurrentWeek = (dateStr) => {
  if (!dateStr || dateStr === "—" || dateStr === "-") return false;

  let date;
  if (dateStr.includes("/")) {
    const [day, month, year] = dateStr.split("/").map(Number);
    date = new Date(year, month - 1, day);
  } else if (dateStr.includes("-")) {
    const parts = dateStr.split("-").map(Number);
    if (parts[0] > 1000) {
      date = new Date(parts[0], parts[1] - 1, parts[2]);
    } else {
      date = new Date(parts[2], parts[1] - 1, parts[0]);
    }
  } else {
    date = new Date(dateStr);
  }

  if (isNaN(date.getTime())) return false;

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

// --- CREAR AUDITORIA DIARIA ---
const createDailyAudit = () => ({
  inicio_whatsapp: { e: false, c: false },
  accion_venta: { e: false, p: false, n: false },
  accion_cobranza: { e: false, p: false, n: false },
  llamadas_venta: { e: false, p: false, n: false },
  llamadas_cobranza: { e: false, p: false, n: false },
  cp: false,
  observacion: "",
});

// --- FUNCIÓN DE CÁLCULO DE DISTANCIA (Haversine Formula) ---
// Retorna distancia en METROS
const calculateDistance = (coord1, coord2) => {
  if (!coord1 || !coord2) return null;

  try {
    const [lat1, lon1] = coord1.split(",").map((s) => parseFloat(s.trim()));
    const [lat2, lon2] = coord2.split(",").map((s) => parseFloat(s.trim()));

    if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) return null;

    const R = 6371e3; // Radio de la tierra en metros
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) *
        Math.cos(phi2) *
        Math.sin(deltaLambda / 2) *
        Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // en metros
    return Math.round(distance); // Retornamos entero
  } catch (e) {
    return null;
  }
};

export const useAuditoria = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      const [rawData, matrixData] = await Promise.all([
        apiService.getAllCompanies(),
        apiService.getMatrix(),
      ]);

      let companies = [];
      if (Array.isArray(rawData)) {
        companies = rawData;
      } else if (rawData && Array.isArray(rawData.data)) {
        companies = rawData.data;
      } else if (rawData && typeof rawData === "object") {
        companies = Object.values(rawData);
      }

      const matrixMap = new Map();
      const matrixArray = matrixData?.data || matrixData || [];

      if (Array.isArray(matrixArray)) {
        // El backend devuelve ORDER BY fecha_registro DESC.
        // Tomamos el primero (más reciente) para cada id_bitrix.
        matrixArray.forEach((item) => {
          if (item.id_bitrix) {
            const idStr = item.id_bitrix.toString();
            if (!matrixMap.has(idStr)) {
              matrixMap.set(idStr, item);
            }
          }
        });
      }

      const processedData = companies
        .map((item) => {
          if (!item) return null;

          const b = item.bitrix || {};
          const p = item.profit || {};

          // Buscar datos registrados para este cliente
          const registered = matrixMap.get(b.ID?.toString());

          // Historial de gestiones (Profit/Bitrix)
          const g = Array.isArray(item.gestion) ? item.gestion : [];

          return {
            id: b.ID || Math.random(),
            id_bitrix: b.ID || "—",
            etapa: "",
            nombre: b.TITLE || "Sin Nombre",
            codigo: b.UF_CRM_1634787828 || "—",
            zona: b.UF_CRM_1635903069 || "—",
            segmento: b.UF_CRM_1638457710 || "—",
            coordenadas: b.UF_CRM_1651251237102 || null,
            diasVisita: Array.isArray(b.UF_CRM_1686015739936)
              ? b.UF_CRM_1686015739936.join(", ")
              : b.UF_CRM_1686015739936
                ? "Sí"
                : "No",
            limite_credito: parseFloat(p.login) || 0,
            saldo_transito: parseFloat(p.saldo_trancito) || 0,
            saldo_vencido: parseFloat(p.saldo_vencido) || 0,
            fecha_ultima_compra: p.fecha_ultima_compra || "—",
            factura_morosidad: p.factura_mayor_morosidad || "—",
            ultimo_cobro: p.ultimo_cobro || "—",
            sku_mes: parseFloat(p.sku_mes) || 0,
            horario_caja: p.horar_caja || "—",
            posee_convenio: "—",
            venta_mes_actual: parseFloat(p.ventas_mes_actual) || 0,
            venta_mes_pasado: parseFloat(p.ventas_mes_pasado) || 0,
            ventas_anterior_1: parseFloat(p.ventas_mes_pasado) || 0,
            ventas_anterior_2: 0,
            fecha_ultimo_cobro: p.ultimo_cobro || "—",
            clasificacion: p.horar_caja || "—",
            gestion: g,

            // Recuperar datos registrados (vienen como columnas planas del backend)
            bitacora: registered?.bitacora || item.bitacora || "",
            obs_ejecutiva:
              registered?.obs_ejecutiva || item.obs_ejecutiva || "",
            semana: registered?.semana || item.semana || {},
            auditoria: registered?.auditoria_matriz || {
              lunes: createDailyAudit(),
              martes: createDailyAudit(),
              miercoles: createDailyAudit(),
              jueves: createDailyAudit(),
              viernes: createDailyAudit(),
              sabado: createDailyAudit(),
            },

            calculateDistance: calculateDistance,
            isWithinCurrentWeek: isWithinCurrentWeek,
          };
        })
        .filter(Boolean);

      setData(processedData);
    } catch (err) {
      console.error("Error en useAuditoria:", err);
      setError(err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleAuditoriaChange = useCallback(
    (id, day, category, fieldOrValue, value) => {
      setData((prevData) =>
        prevData.map((row) => {
          if (row.id !== id) return row;
          const newAuditoria = { ...row.auditoria };
          const dayData = { ...newAuditoria[day] };

          if (value === undefined) {
            dayData[category] = fieldOrValue;
          } else {
            dayData[category] = {
              ...dayData[category],
              [fieldOrValue]: value,
            };
          }

          newAuditoria[day] = dayData;
          return { ...row, auditoria: newAuditoria };
        }),
      );
    },
    [],
  );

  return { data, loading, error, handleAuditoriaChange, refresh };
};
