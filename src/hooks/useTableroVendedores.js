import { useState, useEffect, useMemo } from "react";
import { apiService } from "../services/apiService";
import {
  analizarGeocerca,
  calcularDistanciaMetros,
} from "../utils/geolocalizacion";
import { obtenerDireccionBDC } from "../utils/obtenerDireccion";

export const useTableroVendedores = () => {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [direcciones, setDirecciones] = useState({});

  // ESTADO PARA OBSERVACIONES MANUALES (Cargamos de localStorage al inicio)
  const [observacionesManuales, setObservacionesManuales] = useState(() => {
    const saved = localStorage.getItem("tablero_observaciones");
    return saved ? JSON.parse(saved) : {};
  });

  // Función para actualizar y guardar en localStorage
  const actualizarObservacion = (vendedorId, texto) => {
    const nuevasObs = { ...observacionesManuales, [vendedorId]: texto };
    setObservacionesManuales(nuevasObs);
    localStorage.setItem("tablero_observaciones", JSON.stringify(nuevasObs));
  };

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

      const coordsCliente = fullData.coordenadas
        ? fullData.coordenadas.split(",")
        : [];
      const latCliente =
        coordsCliente.length === 2 ? parseFloat(coordsCliente[0]) : null;
      const lngCliente =
        coordsCliente.length === 2 ? parseFloat(coordsCliente[1]) : null;

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
          ultimoRegistroTime: 0,
          ultimaLat: null,
          ultimaLng: null,
          ultimoCliente: "N/A",
          distancia: 0,
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

                if (latCliente && lngCliente && v.ultimaLat && v.ultimaLng) {
                  const dist = calcularDistanciaMetros(
                    latCliente,
                    lngCliente,
                    parseFloat(v.ultimaLat),
                    parseFloat(v.ultimaLng),
                  );
                  v.distancia = Math.round(dist);
                }
                // NOTA: Eliminamos la lógica de obsList porque ya no la mostrarás
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
        // Insertamos el valor guardado manualmente
        observacionManual: observacionesManuales[v.vendedor] || "",
      };
    });
  }, [rawData, direcciones, observacionesManuales]);

  // --- SOLUCIÓN QUEUE (ANTI-BLOQUEO) ---
  useEffect(() => {
    if (vendedoresFinal.length === 0) return;
    const faltantes = vendedoresFinal.filter(
      (v) => v.ultimaLat && v.ultimaLng && !direcciones[v.vendedor],
    );

    if (faltantes.length === 0) return;

    const cargarSecuencialmente = async () => {
      const vendedor = faltantes[0];
      try {
        const dir = await obtenerDireccionBDC(
          vendedor.ultimaLat,
          vendedor.ultimaLng,
        );
        setDirecciones((prev) => ({ ...prev, [vendedor.vendedor]: dir }));
      } catch (e) {
        console.error("Error queue", e);
      }
    };

    const timer = setTimeout(() => {
      cargarSecuencialmente();
    }, 1200);

    return () => clearTimeout(timer);
  }, [vendedoresFinal, direcciones]);

  // Retornamos también la función para actualizar
  return {
    vendedores: vendedoresFinal,
    loading,
    error,
    actualizarObservacion,
  };
};
