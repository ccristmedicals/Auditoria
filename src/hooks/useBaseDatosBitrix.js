/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from "react";
import { apiService } from "../services/apiService";

export const useBaseDatosBitrix = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- PAGINACIÓN ---
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 25;
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchCompanies();
  }, [page]);

  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);

    const startOffset = (page - 1) * ITEMS_PER_PAGE;

    try {
      // Llamada al backend
      const response = await apiService.getBitrixCompanies(startOffset);

      const realTotal = response.total || 0;
      setTotalRecords(realTotal);
      setTotalPages(Math.ceil(realTotal / ITEMS_PER_PAGE));

      const rawList = (response.data || []).slice(0, ITEMS_PER_PAGE);

      const formattedData = rawList.map((item, index) => {
        const b = item.bitrix || {};
        const p = item.profit || {};

        // 1. HISTORIAL (Solo lectura): Viene en el array 'gestion'
        const gList = Array.isArray(item.gestion) ? item.gestion : [];

        // 2. TAREAS (Editable): Viene en el objeto 'semana' desde tu backend actualizado
        const semanaData = item.semana || {};

        // --- HELPER: Extraer info histórica del Array ---
        const extractHistoryData = (dayName) => {
          const target = dayName
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

          const log = gList.find((g) => {
            if (!g.dia_semana) return false;
            return (
              g.dia_semana
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "") === target
            );
          });

          if (log) {
            // Unir Tipo de Gestión
            let accionParts = [];
            if (log.venta_tipoGestion)
              accionParts.push(`V: ${log.venta_tipoGestion}`);
            if (log.cobranza_tipoGestion)
              accionParts.push(`C: ${log.cobranza_tipoGestion}`);

            // Unir Descripciones
            let obsParts = [];
            if (log.venta_descripcion)
              obsParts.push(`V: ${log.venta_descripcion}`);
            if (log.cobranza_descripcion)
              obsParts.push(`C: ${log.cobranza_descripcion}`);

            return {
              accion: accionParts.join(" / ") || "",
              observacion: obsParts.join(" / ") || "",
            };
          }
          return { accion: "", observacion: "" };
        };

        const lunesHist = extractHistoryData("lunes");
        const martesHist = extractHistoryData("martes");
        const miercolesHist = extractHistoryData("miercoles");
        const juevesHist = extractHistoryData("jueves");
        const viernesHist = extractHistoryData("viernes");

        return {
          id_interno: `${page}-${index}`,

          // --- DATOS BITRIX ---
          id: b.ID || "",
          nombre: b.TITLE || "Sin Nombre",
          codigo_profit: b.UF_CRM_1634787828 || "",
          ciudad: b.UF_CRM_1635903069 || "",
          segmento: b.UF_CRM_1638457710 || "",
          coordenadas: b.UF_CRM_1651251237102 || "",
          dias_visita: Array.isArray(b.UF_CRM_1686015739936)
            ? b.UF_CRM_1686015739936.join(", ")
            : b.UF_CRM_1686015739936 || "",

          // --- DATOS PROFIT ---
          limite_credito: p.login || 0,
          saldo_transito: parseFloat(p.saldo_trancito) || 0,
          saldo_vencido: parseFloat(p.saldo_vencido) || 0,
          fecha_compra: p.fecha_ultima_compra || "-",
          factura_morosidad: p.factura_mayor_morosidad || "-",
          ultimo_cobro: parseFloat(p.ultimo_cobro) || 0,
          sku_mes: parseInt(p.sku_mes) || 0,
          clasificacion: p.horar_caja || "-",
          ventas_actual: parseFloat(p.ventas_mes_actual) || 0,
          ventas_anterior: parseFloat(p.ventas_mes_pasado) || 0,
          convenio: "N/A",

          // --- DATOS GESTION (Para referencia) ---
          gestion: gList,

          // --- CAMPOS MANUALES (EDITABLES) ---
          // Ahora leemos directo de la raíz del item, porque tu backend actualizado los pone ahí
          bitacora: item.bitacora || "",
          obs_ejecutiva: item.obs_ejecutiva || "",

          // --- AGENDA SEMANAL ---
          // Accion/Obs: Vienen del historial (gList) -> ReadOnly
          // Tarea: Viene de item.semana -> Editable

          lunes_accion: lunesHist.accion,
          lunes_observacion: lunesHist.observacion,
          lunes_tarea: semanaData.lunes?.tarea || "",

          martes_accion: martesHist.accion,
          martes_observacion: martesHist.observacion,
          martes_tarea: semanaData.martes?.tarea || "",

          miercoles_accion: miercolesHist.accion,
          miercoles_observacion: miercolesHist.observacion,
          miercoles_tarea: semanaData.miercoles?.tarea || "",

          jueves_accion: juevesHist.accion,
          jueves_observacion: juevesHist.observacion,
          jueves_tarea: semanaData.jueves?.tarea || "",

          viernes_accion: viernesHist.accion,
          viernes_observacion: viernesHist.observacion,
          viernes_tarea: semanaData.viernes?.tarea || "",
        };
      });

      setCompanies(formattedData);
    } catch (err) {
      console.error("Error fetching companies:", err);
      setError("Error al cargar datos.");
      setTotalRecords(0);
      setTotalPages(0);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setPage(pageNumber);
    }
  };

  const handleCompanyChange = useCallback((id_interno, field, value) => {
    setCompanies((prev) =>
      prev.map((c) =>
        c.id_interno === id_interno ? { ...c, [field]: value } : c,
      ),
    );
  }, []);

  return {
    companies,
    loading,
    error,
    handleCompanyChange,
    page,
    totalPages,
    totalRecords,
    goToPage,
  };
};
