import { useState, useEffect, useCallback, useMemo } from "react";
import { apiService } from "../services/apiService";
import { useAuth } from "./useAuth";

export const useBaseDatosBitrix = () => {
  const { user } = useAuth();
  const [allCompanies, setAllCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- FILTROS ---
  const [selectedSegments, setSelectedSegments] = useState([]);
  const [filterZona, setFilterZona] = useState("");
  const [onlyVencidos, setOnlyVencidos] = useState(false);

  // --- PAGINACIÓN ---
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 25;
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    fetchCompanies();
  }, []); // Solo al montar

  // --- FILTRADO LOCAL ---
  const filteredCompanies = useMemo(() => {
    let result = allCompanies;

    // 1. Filtro por Zona (Texto libre en Ciudad o Segmento)
    if (filterZona) {
      const z = filterZona.toLowerCase();
      result = result.filter(
        (c) =>
          (c.ciudad && c.ciudad.toLowerCase().includes(z)) ||
          (c.segmento && c.segmento.toLowerCase().includes(z))
      );
    }

    // 2. Filtro por Segmentos Seleccionados (MultiSelect)
    if (selectedSegments.length > 0) {
      result = result.filter(
        (c) => c.segmento && selectedSegments.includes(c.segmento)
      );
    }

    // 3. Solo Vencidos
    if (onlyVencidos) {
      result = result.filter((c) => c.saldo_vencido > 0);
    }

    return result;
  }, [allCompanies, filterZona, selectedSegments, onlyVencidos]);

  // Actualizar totalRecords basado en el filtrado
  useEffect(() => {
    // Si estamos filtrando localmente, el total de registros cambia
    // Nota: Si el backend devuelve TODO, entonces 'totalRecords' original era el total global.
    // Pero para la paginación local, necesitamos el length de filteredCompanies.
    setTotalRecords(filteredCompanies.length);
    // Resetear página si cambia el filtro
    setPage(1);
  }, [filteredCompanies.length]); // filterZona, selectedSegments, onlyVencidos implícitos en length change a menudo, pero mejor length.
  // Pero cuidado, esto puede causar loops si no estamos atentos.
  // Mejor: calcular totalPages basado en filteredCompanies.

  const totalPages = Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE);

  // --- DERIVAR DATA PARA LA PAGINA ACTUAL ---
  const companies = useMemo(() => {
    // Si no hay datos filtrados, retornar vacio
    if (filteredCompanies.length === 0) return [];

    // Asegurar que la pagina es valida
    const safePage = Math.min(page, Math.max(1, totalPages));
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredCompanies.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCompanies, page, totalPages]);

  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);

    const userSegmentos = user?.segmentos || [];

    try {
      // Llamada al backend para traer TODO (Companies + Matrix Data)
      const [companiesResponse, matrixResponse] = await Promise.all([
        apiService.getAllCompanies(userSegmentos),
        apiService.getMatrix(),
      ]);

      const rawList = companiesResponse.data || [];
      const matrixList = matrixResponse.data || [];

      // Crear Mapa de Matrix para búsqueda rápida por ID
      const matrixMap = {};
      matrixList.forEach((m) => {
        if (m.id_bitrix) {
          matrixMap[m.id_bitrix] = m;
        }
      });

      const formattedData = rawList.map((item, index) => {
        const b = item.bitrix || {};
        const p = item.profit || {};

        // 1. HISTORIAL (Solo lectura): Viene en el array 'gestion'
        const gList = Array.isArray(item.gestion) ? item.gestion : [];

        // 2. TAREAS (Editable): Viene en el objeto 'semana' desde tu backend actualizado
        // --- MERGE CON DATOS GUARDADOS (MATRIX) ---
        // Buscamos si existe data guardada para este id_bitrix
        // La data de matrix viene como array en responseMatrix.data
        // Pero para eficiencia, lo ideal sería tener un Map fuera del loop.
        // (Lo haremos justo antes del map)

        const savedData = matrixMap[b.ID];

        // Prioridad: 
        // 1. Data guardada en Matrix (savedData)
        // 2. Data que venga en el endpoint 'companies' (item.semana, item.bitacora...)
        // 3. Valor por defecto ("")

        const semanaData = savedData?.semana || item.semana || {};
        const bitacora = savedData?.bitacora || item.bitacora || "";
        const obs_ejecutiva = savedData?.obs_ejecutiva || item.obs_ejecutiva || "";

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
          id_interno: `idx-${index}`,

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
          bitacora: bitacora,
          obs_ejecutiva: obs_ejecutiva,

          // --- AGENDA SEMANAL ---
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

      setAllCompanies(formattedData);
    } catch (err) {
      console.error("Error fetching companies:", err);
      setError("Error al cargar datos.");
      setAllCompanies([]);
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
    setAllCompanies((prev) =>
      prev.map((c) =>
        c.id_interno === id_interno ? { ...c, [field]: value } : c,
      ),
    );
  }, []);

  const refresh = fetchCompanies;

  return {
    companies,
    loading,
    error,
    handleCompanyChange,
    page,
    totalPages,
    totalRecords: filteredCompanies.length,
    goToPage,
    // --- NUEVOS RETORNOS ---
    selectedSegments,
    setSelectedSegments,
    filterZona,
    setFilterZona,
    onlyVencidos,
    setOnlyVencidos,
    // --- DATA CALCULADA ---
    uniqueSegments: useMemo(() => {
      const segments = allCompanies
        .map((c) => c.segmento)
        .filter((s) => s && s.trim() !== "");
      return [...new Set(segments)].sort();
    }, [allCompanies]),
    refresh
  };
};
