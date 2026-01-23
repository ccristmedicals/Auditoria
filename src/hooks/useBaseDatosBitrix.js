/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useMemo } from "react";
import { apiService } from "../services/apiService";

export const useBaseDatosBitrix = () => {
  // --- ESTADOS DE DATOS ---
  const [rawData, setRawData] = useState([]); // Datos crudos del API
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- ESTADOS DE FILTROS ---
  const [selectedSegments, setSelectedSegments] = useState([]); // Array ["40", "TRUJILLO"]
  const [filterZona, setFilterZona] = useState(""); // Texto libre
  const [onlyVencidos, setOnlyVencidos] = useState(false); // Checkbox

  // --- ESTADOS DE PAGINACIÓN ---
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 25;

  // 1. CARGAR DATOS DEL SERVIDOR (Filtro Segmento)
  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      // Preparamos el payload. Si hay segmentos seleccionados, los enviamos.
      const payload = {};
      if (selectedSegments.length > 0) {
        payload.segmentos = selectedSegments;
      }

      // Usamos getAllCompanies para traer la data filtrada por segmento desde SQL/Bitrix
      const response = await apiService.getAllCompanies(payload);

      // Normalizamos la respuesta
      const list = Array.isArray(response) ? response : response.data || [];

      setRawData(list);
      setPage(1); // Resetear a página 1 al cargar nuevos datos
    } catch (err) {
      console.error("Error fetching companies:", err);
      setError("Error al cargar datos.");
      setRawData([]);
    } finally {
      setLoading(false);
    }
  };

  // Recargar si cambian los Segmentos (Filtro de Servidor)
  useEffect(() => {
    fetchCompanies();
  }, [selectedSegments]);

  // 2. FILTROS LOCALES (Zona y Vencido)
  const filteredData = useMemo(() => {
    return rawData.filter((item) => {
      const b = item.bitrix || {};
      const p = item.profit || {};

      // A. Filtro Zona (Texto parcial)
      if (filterZona && filterZona.trim() !== "") {
        const zonaItem = (b.UF_CRM_1635903069 || "").toLowerCase();
        const zonaFilter = filterZona.toLowerCase();
        if (!zonaItem.includes(zonaFilter)) return false;
      }

      // B. Filtro Vencido (Saldo > 0)
      if (onlyVencidos) {
        const saldoVencido = parseFloat(p.saldo_vencido) || 0;
        if (saldoVencido <= 0.1) return false; // Margen de error pequeño
      }

      return true;
    });
  }, [rawData, filterZona, onlyVencidos]);

  // 3. PAGINACIÓN LOCAL
  const totalRecords = filteredData.length;
  const totalPages = Math.ceil(totalRecords / ITEMS_PER_PAGE) || 1;

  const paginatedData = useMemo(() => {
    const startIdx = (page - 1) * ITEMS_PER_PAGE;
    const endIdx = startIdx + ITEMS_PER_PAGE;
    return filteredData.slice(startIdx, endIdx);
  }, [filteredData, page]);

  // 4. MAPEO DE DATOS (Formato Visual para la Tabla)
  const companies = useMemo(() => {
    return paginatedData.map((item, index) => {
      const b = item.bitrix || {};
      const p = item.profit || {};

      // A. HISTORIAL (Array de gestiones pasadas)
      const gList = Array.isArray(item.gestion) ? item.gestion : [];

      // B. TAREAS (Objeto semana guardado en BD Matrix)
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
        id_interno: `${page}-${index}`, // ID único para renderizado

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

        // --- DATOS GESTION ---
        gestion: gList,

        // --- CAMPOS MANUALES (EDITABLES) ---
        bitacora: item.bitacora || "",
        obs_ejecutiva: item.obs_ejecutiva || "",

        // --- AGENDA SEMANAL ---
        // Accion/Obs: Vienen del historial (Solo lectura)
        // Tarea: Viene de BD Matrix (Editable)
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
  }, [paginatedData, page]); // Se recalcula cuando cambia la página o los datos filtrados

  // Función para cambiar página
  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setPage(pageNumber);
    }
  };

  return {
    companies, // La lista formateada y paginada para la tabla
    loading,
    error,

    // Paginación
    page,
    totalPages,
    totalRecords,
    goToPage,

    // Filtros
    selectedSegments,
    setSelectedSegments,
    filterZona,
    setFilterZona,
    onlyVencidos,
    setOnlyVencidos,

    // Acción manual
    refresh: fetchCompanies,
  };
};
