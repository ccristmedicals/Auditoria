import { useState, useEffect, useCallback } from "react";
import { apiService } from "../services/apiService";

const createDailyAudit = () => ({
    accion: { presencial: false, llamada: false, mensaje: false },
    contacto: "",
    observacion: "",
    proximo_paso: ""
});

export const useAuditoria = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const rawData = await apiService.getAllCompanies();

                // Validación de Array (Tu blindaje anterior)
                let dataToMap = [];
                if (Array.isArray(rawData)) {
                    dataToMap = rawData;
                } else if (rawData && Array.isArray(rawData.data)) {
                    dataToMap = rawData.data;
                } else if (rawData && typeof rawData === 'object') {
                    dataToMap = Object.values(rawData);
                } else {
                    dataToMap = [];
                }

                const processedData = dataToMap.map((item) => {
                    if (!item) return null;

                    const b = item.bitrix || {};
                    const p = item.profit || {};
                    const g = item.gestion || {};

                    return {
                        id_bitrix: b.ID || "—", // User requested ID
                        etapa: "", // Placeholder per user request

                        // --- BITRIX ---
                        nombre: b.TITLE || "Sin Nombre",
                        codigo: b.UF_CRM_1634787828 || "—",
                        zona: b.UF_CRM_1635903069 || "—",
                        segmento: b.UF_CRM_1638457710 || "—",
                        // Agregamos Coordenadas
                        coordenadas: b.UF_CRM_1651251237102 || null,
                        diasVisita: Array.isArray(b.UF_CRM_1686015739936)
                            ? b.UF_CRM_1686015739936.join(", ")
                            : (b.UF_CRM_1686015739936 ? "Sí" : "No"),

                        // --- PROFIT ---
                        limite_credito: parseFloat(p.login) || 0, // User said "login" is Limite Credito
                        saldo_transito: parseFloat(p.saldo_trancito) || 0,
                        saldo_vencido: parseFloat(p.saldo_vencido) || 0,
                        fecha_ultima_compra: p.fecha_ultima_compra || "—",
                        factura_morosidad: p.factura_mayor_morosidad || "—",
                        ultimo_cobro: p.ultimo_cobro || "—",
                        sku_mes: parseFloat(p.sku_mes) || 0,
                        horario_caja: p.horar_caja || "—", // Clasificación
                        posee_convenio: "—", // Placeholder per user request
                        venta_mes_actual: parseFloat(p.ventas_mes_actual) || 0,
                        venta_mes_pasado: parseFloat(p.ventas_mes_pasado) || 0,
                        // Placeholders for "Ventas mes anterior 2" if needed later

                        // --- GESTIÓN (NUEVO) ---
                        gestion: item.gestion || {
                            tipos: [],
                            venta_tipoGestion: "",
                            venta_descripcion: "",
                            cobranza_tipoGestion: "",
                            cobranza_descripcion: ""
                        },

                        // --- AUDITORIA DIARIA (Lunes - Viernes) ---
                        auditoria: {
                            lunes: createDailyAudit(),
                            martes: createDailyAudit(),
                            miercoles: createDailyAudit(),
                            jueves: createDailyAudit(),
                            viernes: createDailyAudit()
                        }
                    };
                }).filter(Boolean);

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

    const handleAuditoriaChange = useCallback((id, day, field, value) => {
        setData((prevData) =>
            prevData.map((row) => {
                if (row.id !== id) return row;

                // Copia profunda segura para el día específico
                const newAuditoria = { ...row.auditoria };
                const dayData = { ...newAuditoria[day] };

                if (field.includes('.')) {
                    // Manejo de objetos anidados (ej: accion.presencial)
                    const [parent, child] = field.split('.');
                    dayData[parent] = {
                        ...dayData[parent],
                        [child]: value
                    };
                } else {
                    dayData[field] = value;
                }

                newAuditoria[day] = dayData;
                return { ...row, auditoria: newAuditoria };
            })
        );
    }, []);

    return { data, loading, error, handleAuditoriaChange };
};