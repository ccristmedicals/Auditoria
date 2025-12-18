import { useState, useEffect, useCallback } from "react";
import { apiService } from "../services/apiService";

export const useAuditoriaGeo = () => {
    const [auditData, setAuditData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- PAGINACIÓN ---
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 50;
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchAuditData();
    }, [page]);

    const fetchAuditData = async () => {
        setLoading(true);
        setError(null);

        // Calculamos el offset para la API (Pág 1 = 0, Pág 2 = 50, etc.)
        const startOffset = (page - 1) * ITEMS_PER_PAGE;

        try {
            // 1. LLAMADA REAL A LA API
            const response = await apiService.getGeoAudit(startOffset);

            // 2. Total real del backend
            const realTotal = response.count || 0;
            setTotalRecords(realTotal);
            setTotalPages(Math.ceil(realTotal / ITEMS_PER_PAGE));

            // 3. Mapeo de la estructura
            const rawList = response.data || [];

            const formattedData = rawList.map((item, index) => {
                const p = item.profit || {};
                const b = item.bitrix || {};
                const c = item.coordinate_comparison || {};

                return {
                    // ID único para React
                    id_interno: `${page}-${index}`,

                    // PROFIT
                    codigo_profit: p.co_cli || "N/A",
                    nombre: p.cli_des || "Sin Nombre",
                    zona: p.zon_des || "-",
                    ruta: p.seg_des || "-",
                    coords_profit: p.campo3 || null,

                    // BITRIX
                    id_bitrix: b?.bitrix_id || "No Vinculado",
                    coords_bitrix: b?.UF_CRM_1651251237102 || null,

                    // COMPARACIÓN
                    status: c.status || "UNKNOWN",
                    distancia: c.distance_km,

                    // CAMPO MANUAL
                    obs_auditor: ""
                };
            });

            setAuditData(formattedData);

        } catch (err) {
            console.error(err);
            setError("Error cargando auditoría de coordenadas. Verifica la conexión a la VPN/Red Local.");
            setAuditData([]); // Limpiamos la tabla si hay error
        } finally {
            setLoading(false);
        }
    };

    const goToPage = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) setPage(pageNumber);
    };

    const handleAuditChange = useCallback((id_interno, value) => {
        setAuditData(prev => prev.map(row =>
            row.id_interno === id_interno ? { ...row, obs_auditor: value } : row
        ));
    }, []);

    return {
        auditData, loading, error, handleAuditChange,
        page, totalPages, totalRecords, goToPage
    };
};