import { useState, useEffect, useMemo } from "react";
import { apiService } from "../services/apiService";
import {
  analizarGeocerca,
  calcularDistanciaMetros,
} from "../utils/geolocalizacion";
import { obtenerDireccionBDC } from "../utils/obtenerDireccion";

export const useTableroVendedores = () => {
  const [rawData, setRawData] = useState([]);
  const [metasData, setMetasData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [direcciones, setDirecciones] = useState({});

  // ESTADO PARA OBSERVACIONES MANUALES (Cargamos de localStorage al inicio)
  const [observacionesManuales, setObservacionesManuales] = useState(() => {
    const saved = localStorage.getItem("tablero_observaciones");
    return saved ? JSON.parse(saved) : {};
  });

  const actualizarObservacion = (vendedorId, texto) => {
    const nuevasObs = { ...observacionesManuales, [vendedorId]: texto };
    setObservacionesManuales(nuevasObs);
    localStorage.setItem("tablero_observaciones", JSON.stringify(nuevasObs));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Hacemos ambas llamadas en paralelo
        const [planificacionResponse, metasResponse] = await Promise.all([
          apiService.getPlanificacion(),
          fetch("https://98.94.185.164.nip.io/api/auditoria/kpi-metas").then(
            (res) => res.json(),
          ),
        ]);

        // Guardar datos de planificación asegurando el array
        let dataArray = [];
        if (
          planificacionResponse &&
          Array.isArray(planificacionResponse.data)
        ) {
          dataArray = planificacionResponse.data;
        } else if (Array.isArray(planificacionResponse)) {
          dataArray = planificacionResponse;
        }
        setRawData(dataArray);

        // Guardar datos de metas asegurando el array
        let metasArray = [];
        if (Array.isArray(metasResponse)) {
          metasArray = metasResponse;
        } else if (metasResponse && Array.isArray(metasResponse.data)) {
          metasArray = metasResponse.data;
        }
        setMetasData(metasArray);
      } catch (err) {
        console.error("Error cargando tablero:", err);
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

    // 1. Determinar qué día es HOY
    const diasSemana = [
      "diaDomingo",
      "diaLunes",
      "diaMartes",
      "diaMiercoles",
      "diaJueves",
      "diaViernes",
      "diaSabado",
    ];
    const hoy = new Date().getDay();
    const campoDiaActual = diasSemana[hoy];

    // Helper para limpiar strings
    const cleanStr = (str) => (str ? String(str).trim().toLowerCase() : "");

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
        // 2. Buscar la meta de este vendedor con string parsing robusto
        const nombreLimpio = cleanStr(nombreVendedor);
        const codigoLimpio = cleanStr(fullData.co_ven);

        const metaVendedor = metasData.find((m) => {
          const mNombre = cleanStr(m.nombre);
          const mCoVen = cleanStr(m.co_ven);
          return (
            (mNombre && mNombre === nombreLimpio) ||
            (mCoVen && mCoVen === codigoLimpio)
          );
        });

        // 3. Extraer la meta del día actual
        let metaDelDia = 0;
        if (metaVendedor && metaVendedor[campoDiaActual]) {
          metaDelDia = metaVendedor[campoDiaActual];
        }

        agrupado[nombreVendedor] = {
          id: nombreVendedor,
          vendedor: nombreVendedor,
          reportesEstablecidos: Number(metaDelDia) || 0, // META DE LA API (Columna "Plan")
          reportesLogrados: 0, // VISITAS REALES (Columna "Real")
          gestionesPlanificacion: 0, // ASIGNADAS POR EJECUTIVA (Columna "Planif.")
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
          metaCobranza: metaVendedor?.metaCobranza || 1000,
          carteraActiva: 0,
          metaMensual: metaVendedor?.metaVentas || 100,
          nuevosRecuperados: 0,
        };
      }

      const v = agrupado[nombreVendedor];

      // --- AQUÍ REINCORPORAMOS EL CONTADOR DE LA EJECUTIVA ---
      // Cada registro encontrado en la data cruda cuenta como un cliente asignado
      v.gestionesPlanificacion += 1;

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
        observacionManual: observacionesManuales[v.vendedor] || "",
      };
    });
  }, [rawData, metasData, direcciones, observacionesManuales]);

  // Queue para direcciones
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

  return {
    vendedores: vendedoresFinal,
    loading,
    error,
    actualizarObservacion,
  };
};
