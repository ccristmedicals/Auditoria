import { useState, useEffect, useMemo } from "react";
import { apiService } from "../services/apiService";
import { analizarGeocerca } from "../utils/geolocalizacion";
import { obtenerDireccionBDC } from "../utils/obtenerDireccion";

export const useTableroVendedores = () => {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [direcciones, setDirecciones] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiService.getPlanificacion();
        let dataArray = [];
        if (response && Array.isArray(response.data)) {
          dataArray = response.data;
        } else if (Array.isArray(response)) {
          dataArray = response;
        }
        setRawData(dataArray);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const vendedoresFinal = useMemo(() => {
    if (!rawData.length) return [];
    const agrupado = {};

    rawData.forEach((item) => {
      const nombreVendedor = item.vendedor || "Sin Asignar";
      const fullData = item.full_data || {};
      const gestiones = Array.isArray(fullData.gestion) ? fullData.gestion : [];

      if (!agrupado[nombreVendedor]) {
        agrupado[nombreVendedor] = {
          id: nombreVendedor,
          vendedor: nombreVendedor,
          reportesEstablecidos: 0,
          reportesLogrados: 0,
          ventas: 0,
          geoTotalGps: 0,
          geoEnSitio: 0,
          horas: [],

          // Datos de Rastreo
          ultimoRegistroTime: 0,
          ultimaLat: null,
          ultimaLng: null,
          ultimoCliente: "N/A",

          // NUEVO: Array para observaciones estructuradas
          observacionData: [],

          negociaciones: 0,
          cobradoDia: 0,
          metaCobranza: 1000,
          carteraActiva: 0,
          metaMensual: 100,
          nuevosRecuperados: 0,
        };
      }

      const v = agrupado[nombreVendedor];
      v.reportesEstablecidos += 1;

      if (gestiones.length > 0) {
        v.reportesLogrados += 1;
        const venta = parseFloat(fullData.ventas_actual);
        if (!isNaN(venta)) v.ventas += venta;

        const analisis = analizarGeocerca(item);
        if (
          analisis.status !== "SIN_GPS_VENDEDOR" &&
          analisis.status !== "SIN_DATA_CLIENTE"
        ) {
          v.geoTotalGps += 1;
          if (analisis.status === "OK") v.geoEnSitio += 1;
        }

        // Buscar última gestión
        gestiones.forEach((g) => {
          if (g.fecha_registro) {
            const fechaSafe = new Date(g.fecha_registro.replace(" ", "T"));
            const time = fechaSafe.getTime();

            if (!isNaN(time)) {
              v.horas.push(fechaSafe);

              if (time > v.ultimoRegistroTime) {
                v.ultimoRegistroTime = time;
                v.ultimaLat = g.ubicacion_lat;
                v.ultimaLng = g.ubicacion_lng;
                v.ultimoCliente = item.nombre_cliente;

                // --- LÓGICA OBSERVACIONES ESTRUCTURADAS ---
                const obsList = [];

                // 1. Venta (Verde)
                if (g.venta_tipoGestion) {
                  const desc = (g.venta_descripcion || "").trim();
                  obsList.push({
                    type: "venta",
                    text: `${g.venta_tipoGestion}${desc ? " - " + desc : ""}`,
                  });
                }

                // 2. Cobranza (Azul)
                if (g.cobranza_tipoGestion) {
                  const desc = (g.cobranza_descripcion || "").trim();
                  obsList.push({
                    type: "cobranza",
                    text: `${g.cobranza_tipoGestion}${desc ? " - " + desc : ""}`,
                  });
                }

                v.observacionData = obsList;
              }
            }
          }
        });
      }
    });

    return Object.values(agrupado).map((v) => {
      let horaSalida = "--:--";
      let horaLlegada = "--:--";
      if (v.horas.length > 0) {
        v.horas.sort((a, b) => a - b);
        const fmt = (d) =>
          d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        horaSalida = fmt(v.horas[0]);
        horaLlegada = fmt(v.horas[v.horas.length - 1]);
      }

      let direccionTexto = "Sin actividad";
      if (v.ultimaLat) {
        direccionTexto = direcciones[v.vendedor] || "Localizando...";
      }

      const pctGeocerca =
        v.geoTotalGps > 0
          ? Math.round((v.geoEnSitio / v.geoTotalGps) * 100)
          : 0;

      return {
        ...v,
        horaSalida,
        horaLlegada,
        pctGeocerca,
        direccionTexto,
        ultimoCliente: v.ultimoCliente,
        gestionesPlanificacion: v.reportesEstablecidos,
        visitasALograr: v.reportesEstablecidos,
        observacionData: v.observacionData, // Pasamos el array al componente
      };
    });
  }, [rawData, direcciones]);

  useEffect(() => {
    if (vendedoresFinal.length === 0) return;
    const cargarDirecciones = async () => {
      const nuevasDirecciones = {};
      const promesas = vendedoresFinal.map(async (v) => {
        if (v.ultimaLat && v.ultimaLng && !direcciones[v.vendedor]) {
          const dir = await obtenerDireccionBDC(v.ultimaLat, v.ultimaLng);
          nuevasDirecciones[v.vendedor] = dir;
        }
      });
      await Promise.all(promesas);
      if (Object.keys(nuevasDirecciones).length > 0) {
        setDirecciones((prev) => ({ ...prev, ...nuevasDirecciones }));
      }
    };
    cargarDirecciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawData]);

  return { vendedores: vendedoresFinal, loading, error };
};
