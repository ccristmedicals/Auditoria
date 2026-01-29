/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
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
  const [selectedVendedor, setSelectedVendedor] = useState(null);
  const [filterZona, setFilterZona] = useState("");
  const [onlyVencidos, setOnlyVencidos] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // --- CATALOGOS ---
  const [vendedores, setVendedores] = useState([]);

  // --- PAGINACIÓN ---
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 25;
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const vendRes = await apiService.getVendedoresApp();
      if (vendRes && vendRes.data) {
        setVendedores(
          vendRes.data.map((v) => ({
            label: v.nombre,
            value: v.co_ven,
          })),
        );
      }
      await fetchCompanies();
    } catch (err) {
      console.error("Error loading initial data:", err);
      setLoading(false);
    }
  };

  // --- FILTRADO LOCAL ---
  const filteredCompanies = useMemo(() => {
    console.log("🔍 Filtrando empresas - Total en crudo:", allCompanies.length);
    let result = allCompanies;

    if (filterZona) {
      const z = filterZona.toLowerCase();
      result = result.filter(
        (c) =>
          (c.ciudad && c.ciudad.toLowerCase().includes(z)) ||
          (c.segmento && c.segmento.toLowerCase().includes(z)),
      );
    }

    if (selectedSegments.length > 0) {
      result = result.filter(
        (c) => c.segmento && selectedSegments.includes(c.segmento),
      );
    }

    if (onlyVencidos) {
      result = result.filter((c) => c.saldo_vencido > 0);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          (c.nombre && c.nombre.toLowerCase().includes(term)) ||
          (c.id && c.id.toString().includes(term)) ||
          (c.codigo_profit && c.codigo_profit.toLowerCase().includes(term)),
      );
    }

    console.log("🔍 Resultado filtrado:", result.length);
    return result;
  }, [allCompanies, filterZona, selectedSegments, onlyVencidos, searchTerm]);

  useEffect(() => {
    setTotalRecords(filteredCompanies.length);
    setPage(1);
  }, [
    filteredCompanies.length,
    filterZona,
    selectedSegments,
    onlyVencidos,
    searchTerm,
  ]);

  const totalPages = Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE);

  const companies = useMemo(() => {
    if (filteredCompanies.length === 0) return [];
    const safePage = Math.min(page, Math.max(1, totalPages));
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredCompanies.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCompanies, page, totalPages]);

  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);

    const userSegmentos = user?.segmentos || [];

    try {
      const [companiesResponse, planificacionResponse] = await Promise.all([
        apiService.getAllCompanies(userSegmentos),
        apiService.getPlanificacion(),
      ]);

      console.log("📡 DEBUG - Raw API Responses:", {
        companiesCount: companiesResponse?.data?.length || 0,
        planificacionCount: planificacionResponse?.data?.length || 0,
        planificacionResponseSample: planificacionResponse?.data?.[0],
      });

      const rawList = companiesResponse.data || [];
      const planificacionList = planificacionResponse.data || [];

      console.log("🔍 DEBUG - Planificacion Response:", {
        totalPlanificacionRecords: planificacionList.length,
        firstPlanificacionRecord: planificacionList[0],
        planificacionStructure: planificacionList[0]
          ? Object.keys(planificacionList[0])
          : [],
      });

      const planificacionMap = {};
      planificacionList.forEach((m) => {
        if (m.id_bitrix) {
          planificacionMap[m.id_bitrix] = m;
        }
      });

      console.log("🔍 DEBUG - Planificacion Map:", {
        totalMappedRecords: Object.keys(planificacionMap).length,
        sampleIds: Object.keys(planificacionMap).slice(0, 5),
        sampleRecord: planificacionMap[Object.keys(planificacionMap)[0]],
      });

      const formattedData = rawList.map((item, index) => {
        const b = item.bitrix || {};
        const p = item.profit || {};
        const gList = Array.isArray(item.gestion) ? item.gestion : [];
        const savedData = planificacionMap[b.ID];

        // Para BaseDatosBitrix, los datos vienen en 'semana' directamente
        const semanaData = savedData?.semana || item.semana || {};
        const bitacora = savedData?.bitacora || item.bitacora || "";
        const obs_ejecutiva =
          savedData?.obs_ejecutiva || item.obs_ejecutiva || "";

        // Log detallado para los primeros 3 registros
        if (index < 3) {
          console.log(`🔍 DEBUG - Company #${index} (ID: ${b.ID}):`, {
            bitrixId: b.ID,
            hasSavedData: !!savedData,
            savedDataKeys: savedData ? Object.keys(savedData) : [],
            rawSemana: savedData?.semana,
            finalSemanaData: semanaData,
            semanaKeys: Object.keys(semanaData),
            lunesData: semanaData.lunes,
            gListLength: gList.length,
          });
        }

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
            let accionParts = [];
            if (log.venta_tipoGestion)
              accionParts.push(`V: ${log.venta_tipoGestion}`);
            if (log.cobranza_tipoGestion)
              accionParts.push(`C: ${log.cobranza_tipoGestion}`);
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

        // --- CALCULAR SI ESTÁ GESTIONADO HOY ---
        const daysMap = [
          "domingo",
          "lunes",
          "martes",
          "miercoles",
          "jueves",
          "viernes",
          "sabado",
        ];
        const todayIndex = new Date().getDay();
        const todayName = daysMap[todayIndex] || "";

        // Verificar en el historial (gList)
        const todayData = extractHistoryData(todayName);
        const hasHistoricalData = !!(todayData.accion || todayData.observacion);

        // Verificar en la planificación semanal (semana)
        const todayWeekData = semanaData[todayName];
        const hasWeekData = !!(
          todayWeekData?.tarea ||
          todayWeekData?.accion ||
          todayWeekData?.observacion
        );

        // Se considera gestionado si tiene datos en historial O en planificación
        const isManagedToday = hasHistoricalData || hasWeekData;

        return {
          id_interno: b.ID ? `bx-${b.ID}` : `idx-${index}-${Date.now()}`,
          id: b.ID || "0",
          nombre: b.TITLE || "Sin Nombre",
          codigo_profit: b.UF_CRM_1634787828 || "",
          ciudad: b.UF_CRM_1635903069 || "",
          segmento: b.UF_CRM_1638457710 || "",
          coordenadas: b.UF_CRM_1651251237102 || "",
          dias_visita: Array.isArray(b.UF_CRM_1686015739936)
            ? b.UF_CRM_1686015739936.join(", ")
            : b.UF_CRM_1686015739936 || "",
          co_ven: p.co_ven || "",

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

          gestion: gList,
          bitacora: bitacora,
          obs_ejecutiva: obs_ejecutiva,

          // Para cada día, priorizar datos guardados en semana, luego historial
          lunes_accion:
            semanaData.lunes?.accion || extractHistoryData("lunes").accion,
          lunes_observacion:
            semanaData.lunes?.observacion ||
            extractHistoryData("lunes").observacion,
          lunes_tarea: semanaData.lunes?.tarea || "",

          martes_accion:
            semanaData.martes?.accion || extractHistoryData("martes").accion,
          martes_observacion:
            semanaData.martes?.observacion ||
            extractHistoryData("martes").observacion,
          martes_tarea: semanaData.martes?.tarea || "",

          miercoles_accion:
            semanaData.miercoles?.accion ||
            extractHistoryData("miercoles").accion,
          miercoles_observacion:
            semanaData.miercoles?.observacion ||
            extractHistoryData("miercoles").observacion,
          miercoles_tarea: semanaData.miercoles?.tarea || "",

          jueves_accion:
            semanaData.jueves?.accion || extractHistoryData("jueves").accion,
          jueves_observacion:
            semanaData.jueves?.observacion ||
            extractHistoryData("jueves").observacion,
          jueves_tarea: semanaData.jueves?.tarea || "",

          viernes_accion:
            semanaData.viernes?.accion || extractHistoryData("viernes").accion,
          viernes_observacion:
            semanaData.viernes?.observacion ||
            extractHistoryData("viernes").observacion,
          viernes_tarea: semanaData.viernes?.tarea || "",

          isManagedToday: isManagedToday,
        };
      });

      setAllCompanies(formattedData);
    } catch (err) {
      console.error("Error fetching companies:", err);
      setError("Error al cargar datos.");
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
    // Caso especial: actualización masiva de isManagedToday
    if (field === "bulk_update_managed" && Array.isArray(value)) {
      setAllCompanies((prev) =>
        prev.map((c) =>
          value.includes(c.id_interno) ? { ...c, isManagedToday: true } : c,
        ),
      );
      return;
    }

    // Caso normal: actualización individual
    setAllCompanies((prev) =>
      prev.map((c) =>
        c.id_interno === id_interno ? { ...c, [field]: value } : c,
      ),
    );
  }, []);

  const refresh = fetchCompanies;

  return {
    companies,
    allCompanies,
    loading,
    error,
    handleCompanyChange,
    page,
    totalPages,
    totalRecords: filteredCompanies.length,
    goToPage,
    selectedSegments,
    setSelectedSegments,
    selectedVendedor,
    setSelectedVendedor,
    vendedores,
    filterZona,
    setFilterZona,
    onlyVencidos,
    setOnlyVencidos,
    searchTerm,
    setSearchTerm,
    uniqueSegments: useMemo(() => {
      const segments = allCompanies
        .map((c) => c.segmento)
        .filter((s) => s && s.trim() !== "");
      return [...new Set(segments)].sort();
    }, [allCompanies]),
    refresh,
  };
};
