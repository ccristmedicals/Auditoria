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

    // Calculamos el start (offset) para la API
    const startOffset = (page - 1) * ITEMS_PER_PAGE;

    try {
      const response = await apiService.getBitrixCompanies(startOffset);

      // 1. OBTENEMOS EL TOTAL REAL DEL BACKEND
      // Usamos response.total (5554 según tu ejemplo)
      const realTotal = response.total || 0;
      setTotalRecords(realTotal);
      setTotalPages(Math.ceil(realTotal / ITEMS_PER_PAGE));

      // 2. OBTENEMOS EL ARRAY DE DATOS (Limitamos a 25 si la API devuelve más)
      const rawList = (response.data || []).slice(0, ITEMS_PER_PAGE);

      const formattedData = rawList.map((item, index) => {
        const b = item.bitrix || {};
        const p = item.profit || {};
        const g = item.gestion || {};

        return {
          // ID único para React (Página + Índice)
          id_interno: `${page}-${index}`,

          // DATOS BITRIX
          id: b.ID || "",
          nombre: b.TITLE || "Sin Nombre",
          codigo_profit: b.UF_CRM_1634787828 || "",
          ciudad: b.UF_CRM_1635903069 || "",
          segmento: b.UF_CRM_1638457710 || "",
          coordenadas: b.UF_CRM_1651251237102 || "",
          dias_visita: Array.isArray(b.UF_CRM_1686015739936)
            ? b.UF_CRM_1686015739936.join(", ")
            : b.UF_CRM_1686015739936 || "",

          // DATOS PROFIT
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

          // DATOS GESTION
          gestion: g,

          // CAMPOS MANUALES (Inicializados vacíos)
          bitacora: "",
          obs_ejecutiva: "",
          // lunes_accion: "", lunes_ejecucion: "",
          // martes_accion: "", martes_ejecucion: "",
          // miercoles_accion: "", miercoles_ejecucion: "",
          // jueves_accion: "", jueves_ejecucion: "",
          // viernes_accion: "", viernes_ejecucion: ""
        };
      });

      setCompanies(formattedData);
    } catch (err) {
      console.error("Error fetching companies:", err);
      setError("Error al cargar datos.");

      // MOCK DE RESPALDO (Por si el backend falla mientras pruebas)
      setTotalRecords(100);
      setTotalPages(2);
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
        c.id_interno === id_interno ? { ...c, [field]: value } : c
      )
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
