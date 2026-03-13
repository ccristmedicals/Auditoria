/* eslint-disable no-unused-vars */
import { useState, useEffect, useMemo } from "react";
import { apiService } from "../services/apiService";
import {
  analizarGeocerca,
  calcularDistanciaMetros,
} from "../utils/geolocalizacion";
// import { obtenerDireccionBDC } from "../utils/obtenerDireccion";

// --- HELPER ROBUSTO PARA FECHAS ---
const esSemanaActual = (fechaString) => {
  if (!fechaString) return true; // Si no hay fecha, asumimos que sí para no ocultar datos por error

  // Intentamos convertir la fecha
  let fecha = new Date(fechaString);

  // Si da error (Invalid Date), intentamos parsear formato DD-MM-YYYY común en latam
  if (isNaN(fecha.getTime())) {
    const partes = String(fechaString).split(/[-/]/); // Separa por - o /
    if (partes.length === 3) {
      // Asumimos DD/MM/YYYY -> Convertimos a YYYY-MM-DD para JS
      // OJO: Ajustar índices según venga tu API (Dia:0, Mes:1, Año:2)
      const fechaISO = `${partes[2]}-${partes[1]}-${partes[0]}`;
      fecha = new Date(fechaISO);
    }
  }

  if (isNaN(fecha.getTime())) return true; // Si sigue siendo inválida, mostrar el dato

  const hoy = new Date();

  // Calcular Lunes de esta semana
  const primerDiaSemana = new Date(hoy);
  const diaSemana = hoy.getDay() || 7; // Domingo es 0, lo volvemos 7
  primerDiaSemana.setHours(0, 0, 0, 0);
  primerDiaSemana.setDate(hoy.getDate() - diaSemana + 1);

  // Calcular Domingo de esta semana
  const ultimoDiaSemana = new Date(primerDiaSemana);
  ultimoDiaSemana.setDate(primerDiaSemana.getDate() + 6);
  ultimoDiaSemana.setHours(23, 59, 59, 999);

  return fecha >= primerDiaSemana && fecha <= ultimoDiaSemana;
};

export const useTableroVendedores = () => {
  const [rawData, setRawData] = useState([]);
  const [metasData, setMetasData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [direcciones, setDirecciones] = useState({});

  // ESTADO PARA OBSERVACIONES
  const [observacionesManuales, setObservacionesManuales] = useState(() => {
    try {
      const saved = localStorage.getItem("tablero_observaciones");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
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

        // Calcular fechas dinámicamente
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        const today = now.toISOString().split('T')[0];

        const payload = {
          startDate,
          endDate,
          startDateCobrado: today,
          endDateCobrado: today
        };

        const [planificacionResponse, metasResponse] = await Promise.all([
          apiService.getPlanificacion(),
          fetch("https://98.94.185.164.nip.io/api/auditoria/kpi-metas", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          }).then((res) => res.json()),
        ]);

        // Manejo seguro de arrays
        let dataArray = [];
        if (
          planificacionResponse?.data &&
          Array.isArray(planificacionResponse.data)
        ) {
          dataArray = planificacionResponse.data;
        } else if (Array.isArray(planificacionResponse)) {
          dataArray = planificacionResponse;
        }

        // --- DEBUG: Ver qué trae el primer ítem para saber el nombre de la fecha ---
        if (dataArray.length > 0) {
          console.log("🔍 ESTRUCTURA DE UN ITEM:", dataArray[0]);
        }

        setRawData(dataArray);

        let metasArray = [];
        if (metasResponse?.data && Array.isArray(metasResponse.data)) {
          metasArray = metasResponse.data;
        } else if (Array.isArray(metasResponse)) {
          metasArray = metasResponse;
        }
        setMetasData(metasArray);
      } catch (err) {
        console.error("Error cargando tablero:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const vendedoresFinal = useMemo(() => {
    if (!rawData.length) return [];
    const agrupado = {};

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
    const cleanStr = (str) => (str ? String(str).trim().toLowerCase() : "");

    rawData.forEach((item) => {
      // -----------------------------------------------------
      // 1. FILTRO DE SEMANA (Permisivo)
      // -----------------------------------------------------
      // Buscamos la fecha en varios lugares posibles
      const fechaRegistro =
        item.created_at ||
        item.fecha ||
        item.fecha_asignacion ||
        item.full_data?.fecha ||
        item.full_data?.created_at;

      // Si existe fecha y NO es de esta semana, lo saltamos.
      // Si no existe fecha (undefined), esSemanaActual devuelve true para mostrarlo por seguridad.
      if (!esSemanaActual(fechaRegistro)) {
        return;
      }
      // -----------------------------------------------------

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
        const nombreLimpio = cleanStr(nombreVendedor);
        const codigoLimpio = cleanStr(fullData.co_ven);

        const metaVendedor =
          metasData.find((m) => {
            const mNombre = cleanStr(m.nombre);
            const mCoVen = cleanStr(m.co_ven);
            return (
              (mNombre && mNombre.includes(nombreLimpio)) ||
              (mCoVen && mCoVen === codigoLimpio)
            );
          }) || {};

        agrupado[nombreVendedor] = {
          id: nombreVendedor,
          vendedor: nombreVendedor,
          reportesEstablecidos: Number(metaVendedor[campoDiaActual]) || 0,
          reportesLogrados: 0,
          geoTotalGps: 0,
          geoEnSitio: 0,
          horas: [],
          ultimoRegistroTime: 0,
          ultimaLat: null,
          ultimaLng: null,
          ultimoCliente: "N/A",
          distancia: 0,
          negociaciones: Number(metaVendedor.negociacion) || 0,
          cobradoDia: Number(metaVendedor.cobrado_dia) || 0,
          metaCobranza: Number(metaVendedor.metaCobranza) || 1,
          ventas: Number(metaVendedor.ventas_factura_sum) || 0,
          carteraActiva: Number(metaVendedor.clientes_activos_factura) || 0,
          metaVentasMensual: Number(metaVendedor.metaVentas) || 1,
          nuevosRecuperados: Number(metaVendedor.clientes_recuperados) || 0,
          gestionesPlanificacion: 0,
        };
      }

      const v = agrupado[nombreVendedor];
      v.gestionesPlanificacion += 1;

      if (gestiones.length > 0) {
        v.reportesLogrados += 1;
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

  useEffect(() => {
    if (vendedoresFinal.length === 0) return;
    const faltantes = vendedoresFinal.filter(
      (v) => v.ultimaLat && v.ultimaLng && !direcciones[v.vendedor],
    );
    if (faltantes.length === 0) return;

    const timer = setTimeout(async () => {
      const vendedor = faltantes[0];
      try {
        const dir = await obtenerDireccionBDC(
          vendedor.ultimaLat,
          vendedor.ultimaLng,
        );
        setDirecciones((prev) => ({ ...prev, [vendedor.vendedor]: dir }));
      } catch (e) {
        console.error(e);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [vendedoresFinal, direcciones]);

  return { vendedores: vendedoresFinal, loading, actualizarObservacion };
};
