/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import { apiService } from "../services/apiService";

// --- CREAR AUDITORIA DIARIA ---
const createDailyAudit = () => ({
  inicio_whatsapp: { e: false, c: false },
  accion_venta: { e: false, p: false, n: false },
  accion_cobranza: { e: false, p: false, n: false },
  llamadas_venta: { e: false, p: false, n: false },
  llamadas_cobranza: { e: false, p: false, n: false },
  // visitas_asesor ahora se calculará dinámicamente en AuditRow, pero mantenemos estructura
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

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Fetch base companies and registered matrix data in parallel
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

        // Create a map for quick access to matrix data by id_bitrix
        const matrixMap = new Map();
        if (Array.isArray(matrixData)) {
          matrixData.forEach((item) => {
            if (item.id_bitrix) {
              matrixMap.set(item.id_bitrix.toString(), item);
            }
          });
        }

        const processedData = companies
          .map((item) => {
            if (!item) return null;

            const b = item.bitrix || {};
            const p = item.profit || {};

            // Find registered matrix data for this client
            const registered = matrixMap.get(b.ID?.toString());
            const gestionData = registered?.gestion || {};

            // 1. GESTION (Historial): Ahora es siempre un Array
            const g = Array.isArray(item.gestion) ? item.gestion : [];

            return {
              id: b.ID || Math.random(),

              // --- DATOS IDENTIFICATIVOS (BITRIX) ---
              id_bitrix: b.ID || "—",
              etapa: "",
              nombre: b.TITLE || "Sin Nombre",
              codigo: b.UF_CRM_1634787828 || "—",
              zona: b.UF_CRM_1635903069 || "—",
              segmento: b.UF_CRM_1638457710 || "—",

              // Coordenada Planificada (Base)
              coordenadas: b.UF_CRM_1651251237102 || null,

              diasVisita: Array.isArray(b.UF_CRM_1686015739936)
                ? b.UF_CRM_1686015739936.join(", ")
                : b.UF_CRM_1686015739936
                  ? "Sí"
                  : "No",

              // --- DATOS FINANCIEROS (PROFIT) ---
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

              // --- GESTIÓN (Historial Array con Ubicaciones) ---
              gestion: g,

              // --- PLANIFICACIÓN (CARGAR DESDE DATOS REGISTRADOS SI EXISTEN) ---
              bitacora: gestionData.bitacora || item.bitacora || "",
              obs_ejecutiva: gestionData.obs_ejecutiva || item.obs_ejecutiva || "",
              semana: gestionData.semana || item.semana || {},

              // --- AUDITORIA DIARIA (CARGAR DESDE DATOS REGISTRADOS SI EXISTEN) ---
              auditoria: gestionData.auditoria_matriz || {
                lunes: createDailyAudit(),
                martes: createDailyAudit(),
                miercoles: createDailyAudit(),
                jueves: createDailyAudit(),
                viernes: createDailyAudit(),
                sabado: createDailyAudit(),
              },

              // Helper function disponible en el objeto row para calcular distancia on-the-fly
              calculateDistance: calculateDistance,
            };
          })
          .filter(Boolean);

        setData(processedData);
      } catch (err) {
        console.error("Error en useAuditoria:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAuditoriaChange = useCallback(
    (id, day, category, field, value) => {
      setData((prevData) =>
        prevData.map((row) => {
          if (row.id !== id) return row;
          const newAuditoria = { ...row.auditoria };
          const dayData = { ...newAuditoria[day] };

          if (category === "observacion") {
            dayData.observacion = value;
          } else {
            dayData[category] = {
              ...dayData[category],
              [field]: value,
            };
          }

          newAuditoria[day] = dayData;
          return { ...row, auditoria: newAuditoria };
        }),
      );
    },
    [],
  );

  return { data, loading, error, handleAuditoriaChange };
};
