import { useState, useEffect, useCallback } from "react";
import { apiService } from "../services/apiService";

export const useAuditoriaGeo = () => {
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE_VISUAL = 25;
  const totalRecords = allData.length;
  const totalPages = Math.ceil(totalRecords / ITEMS_PER_PAGE_VISUAL) || 1;
  const paginatedData = allData.slice(
    (page - 1) * ITEMS_PER_PAGE_VISUAL,
    page * ITEMS_PER_PAGE_VISUAL
  );

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      const firstResponse = await apiService.getGeoAudit(0);

      const firstPageData = Array.isArray(firstResponse.data)
        ? firstResponse.data
        : [];
      const totalCount = firstResponse.count || 0;

      const realChunkSize = firstPageData.length;

      let fullRawList = [...firstPageData];

      if (realChunkSize > 0 && totalCount > fullRawList.length) {
        const pendingRequests = [];

        for (
          let offset = realChunkSize;
          offset < totalCount;
          offset += realChunkSize
        ) {
          pendingRequests.push(apiService.getGeoAudit(offset));
        }

        if (pendingRequests.length > 0) {
          const responses = await Promise.all(pendingRequests);
          responses.forEach((res) => {
            if (res.data && Array.isArray(res.data)) {
              fullRawList = fullRawList.concat(res.data);
            }
          });
        }
      }

      // 4. Mapeo de datos
      const formattedData = fullRawList
        .map((item, index) => {
          if (!item) return null;
          const p = item.profit || {};
          const b = item.bitrix || {};
          const c = item.coordinate_comparison || {};

          return {
            id_interno: `${p.co_cli}-${b.bitrix_id}-${index}`,
            codigo_profit: p.co_cli || "—",
            nombre: p.cli_des || "Sin Nombre",
            zona: p.zon_des || "—",
            ruta: p.seg_des || "—",
            coords_profit: p.campo3 || null,
            id_bitrix: b.bitrix_id || "No Vinculado",
            coords_bitrix: b.UF_CRM_1651251237102 || null,
            status: c.status || "UNKNOWN",
            distancia:
              c.distance_km !== undefined && c.distance_km !== null
                ? parseFloat(c.distance_km).toFixed(2)
                : null,
            obs_auditor: "",
          };
        })
        .filter(Boolean);

      const uniqueData = Array.from(
        new Map(
          formattedData.map((item) => [item.codigo_profit, item])
        ).values()
      );

      setAllData(uniqueData);
    } catch (err) {
      console.error(err);
      setError("Error cargando auditoría.");
      setAllData([]);
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) setPage(pageNumber);
  };

  const handleAuditChange = useCallback((id_interno, value) => {
    setAllData((prev) =>
      prev.map((row) =>
        row.id_interno === id_interno ? { ...row, obs_auditor: value } : row
      )
    );
  }, []);

  return {
    auditData: paginatedData,
    loading,
    error,
    handleAuditChange,
    page,
    totalPages,
    totalRecords,
    goToPage,
    refresh: fetchAllData,
  };
};
