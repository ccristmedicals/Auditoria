/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { apiService } from "../services/apiService";

export const useBaseDatosBitrix = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            const data = await apiService.getBitrixCompanies(1100);
            const rawList = Array.isArray(data) ? data : data.data || [];

            const formattedData = rawList.map((item, index) => {
                const b = item.bitrix || {};
                const p = item.profit || {};

                return {
                    id_interno: index,
                    // --- BITRIX ---
                    id: b.ID || "",
                    nombre: b.TITLE || "Sin Nombre",
                    codigo_profit: b.UF_CRM_1634787828 || "",
                    ciudad: b.UF_CRM_1635903069 || "",
                    segmento: b.UF_CRM_1638457710 || "",
                    coordenadas: b.UF_CRM_1651251237102 || "",
                    dias_visita: Array.isArray(b.UF_CRM_1686015739936)
                        ? b.UF_CRM_1686015739936.join(", ")
                        : (b.UF_CRM_1686015739936 || ""),

                    // --- PROFIT ---
                    // 'login' parece ser el Límite de Crédito o un identificador numérico
                    limite_credito: p.login || 0,

                    saldo_transito: parseFloat(p.saldo_trancito) || 0,
                    saldo_vencido: parseFloat(p.saldo_vencido) || 0,

                    fecha_compra: p.fecha_ultima_compra || "-",

                    // Puede venir como null o string "factura / fecha"
                    factura_morosidad: p.factura_mayor_morosidad || "-",

                    ultimo_cobro: parseFloat(p.ultimo_cobro) || 0,
                    sku_mes: parseInt(p.sku_mes) || 0,

                    // 'horar_caja' mapea a Clasificación (ej: "D")
                    clasificacion: p.horar_caja || "-",

                    // Nuevos campos de ventas
                    ventas_actual: parseFloat(p.ventas_mes_actual) || 0,
                    ventas_anterior: parseFloat(p.ventas_mes_pasado) || 0,

                    // Campo calculado o placeholder si no viene en el JSON
                    convenio: "N/A",

                    // Inicializamos vacíos ya que el usuario los llenará
                    bitacora: "",
                    obs_ejecutiva: "",

                    // Lunes
                    lunes_accion: "",
                    lunes_ejecucion: "",
                    // Martes
                    martes_accion: "",
                    martes_ejecucion: "",
                    // Miercoles
                    miercoles_accion: "",
                    miercoles_ejecucion: "",
                    // Jueves
                    jueves_accion: "",
                    jueves_ejecucion: "",
                    // Viernes
                    viernes_accion: "",
                    viernes_ejecucion: ""
                };
            });

            setCompanies(formattedData);

        } catch (err) {
            console.warn("⚠️ Error backend Bitrix. Usando Mock Data.");
            setError("Modo Offline: Datos simulados.");

            // DATA SIMULADA ACTUALIZADA CON TU EJEMPLO REAL
            setCompanies([
                {
                    id_interno: 1,
                    id: "4931",
                    nombre: "FARMACIA LA PAZ 2011",
                    codigo_profit: "FAR00708",
                    ciudad: "Portuguesa Alta (Portuguesa)",
                    segmento: "Portuguesa Alta - CAPITAL",
                    coordenadas: "9.555756, -69.211128",
                    dias_visita: "Lunes, Miercoles, Viernes",
                    convenio: "N/A",
                    limite_credito: 400,
                    saldo_transito: 918.2,
                    saldo_vencido: 0,
                    fecha_compra: "2025-12-09",
                    factura_morosidad: "305127 / 2025-12-03",
                    ultimo_cobro: 270514,
                    sku_mes: 16,
                    clasificacion: "D",
                    ventas_actual: 950.48,
                    ventas_anterior: 401.02
                },
                {
                    id_interno: 2,
                    id: "9999",
                    nombre: "CLIENTE SIN COORDENADAS C.A.",
                    codigo_profit: "0", // Provoca alerta roja
                    ciudad: "Caracas",
                    segmento: "Capital",
                    coordenadas: "0", // Provoca alerta roja
                    dias_visita: "Martes",
                    convenio: "N/A",
                    limite_credito: 0,
                    saldo_transito: 0,
                    saldo_vencido: 150.50, // Rojo por deuda
                    fecha_compra: "2024-01-01",
                    factura_morosidad: "-",
                    ultimo_cobro: 0,
                    sku_mes: 0,
                    clasificacion: "Z",
                    ventas_actual: 0,
                    ventas_anterior: 0
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return { companies, loading, error };
};