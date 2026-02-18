import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// --- HELPERS ---
const currency = (val) => {
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
  }).format(val || 0);
};

const formatDate = (dateInput) => {
  if (!dateInput) return "Fecha desconocida";
  const date = new Date(dateInput);
  return date.toLocaleDateString("es-VE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Genera un PDF para un grupo específico de planificaciones
 * @param {Array} items - Array de objetos de la planificación (el grupo seleccionado)
 * @param {Date|String} datePlanificacion - La fecha de registro de ese grupo
 */
export const generatePlanificacionPDF = (items, datePlanificacion) => {
  if (!items || items.length === 0) return;

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // --- 1. DATOS DEL ENCABEZADO ---
  // Tomamos el primer item para sacar datos comunes del vendedor
  const headerData = items[0];
  const vendedor = headerData.vendedor || headerData.usuario || "Vendedor";
  const fechaReporte = formatDate(datePlanificacion || new Date());

  // --- 2. DIBUJAR ENCABEZADO ---
  doc.setFontSize(18);
  doc.setTextColor(26, 152, 136); // Color Teal (#1a9888)
  doc.text("Reporte de Planificación Semanal", 14, 15);

  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(`Vendedor: ${vendedor}`, 14, 22);
  doc.text(`Fecha de Planificación: ${fechaReporte}`, 14, 27);

  // Total clientes alineado a la derecha
  doc.text(`Total Clientes: ${items.length}`, 280, 22, { align: "right" });

  // --- 3. DEFINIR COLUMNAS ---
  const columns = [
    { header: "Cliente", dataKey: "cliente" },
    { header: "Cód.", dataKey: "codigo" },
    { header: "Ruta", dataKey: "ruta" },
    { header: "Vencido", dataKey: "vencido" }, // Deuda
    { header: "Lun", dataKey: "lunes" },
    { header: "Mar", dataKey: "martes" },
    { header: "Mie", dataKey: "miercoles" },
    { header: "Jue", dataKey: "jueves" },
    { header: "Vie", dataKey: "viernes" },
  ];

  const days = ["lunes", "martes", "miercoles", "jueves", "viernes"];

  // --- 4. MAPEO DE DATOS (BODY) ---
  const body = items.map((item) => {
    // Fila base
    const row = {
      cliente: item.nombre_cliente || "Sin Nombre",
      codigo: item.codigo_profit || "-",
      ruta: item.full_data?.segmento || "-",
      vencido: currency(item.full_data?.saldo_vencido),
      // Guardamos el valor crudo para validación en didParseCell
      _vencidoRaw: item.full_data?.saldo_vencido || 0,
    };

    // Lógica para cada día
    days.forEach((day) => {
      const dayData = item.semana?.[day];

      let content = "-";
      let cellStyles = { halign: "center", fontSize: 7 };

      if (dayData) {
        const tarea = dayData.tarea ? `P: ${dayData.tarea}` : "";
        const accion = dayData.accion ? `H: ${dayData.accion}` : "";

        // Combinar textos (P: Planificado, H: Hecho)
        if (tarea || accion) {
          content = [tarea, accion].filter(Boolean).join("\n");
        }

        // --- LÓGICA DE COLORES ---
        if (dayData.accion) {
          // CASO 1: VISITADO (Tiene acción) -> VERDE
          cellStyles.fillColor = [220, 252, 231]; // Verde claro
          cellStyles.textColor = [20, 83, 45]; // Verde oscuro
          cellStyles.fontStyle = "bold";
        } else if (dayData.tarea && !dayData.accion) {
          // CASO 2: NO VISITADO (Tiene tarea pero no acción) -> ROJO
          cellStyles.fillColor = [254, 226, 226]; // Rojo claro
          cellStyles.textColor = [127, 29, 29]; // Rojo oscuro
        }
      }

      // Asignar objeto de celda (contenido + estilos)
      row[day] = { content: content, styles: cellStyles };
    });

    return row;
  });

  // --- 5. GENERAR TABLA ---
  autoTable(doc, {
    startY: 35,
    columns: columns,
    body: body,
    theme: "grid",
    headStyles: {
      fillColor: [26, 152, 136], // Cabecera Teal
      textColor: 255,
      fontSize: 9,
      halign: "center",
      valign: "middle",
      fontStyle: "bold",
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
      valign: "middle",
      overflow: "linebreak",
      lineWidth: 0.1,
      lineColor: [200, 200, 200],
    },
    columnStyles: {
      cliente: { cellWidth: 45 },
      codigo: { cellWidth: 15, halign: "center" },
      ruta: { cellWidth: 20, halign: "center" },
      vencido: { cellWidth: 22, halign: "right", fontStyle: "bold" },
      // Los días se reparten el resto del espacio automáticamente
    },
    // Hook para pintar el texto de "Vencido" en rojo si es mayor a 0
    didParseCell: (data) => {
      if (data.section === "body" && data.column.dataKey === "vencido") {
        const rawValue = data.row.raw._vencidoRaw;
        if (rawValue > 0) {
          data.cell.styles.textColor = [220, 38, 38]; // Rojo intenso
        }
      }
    },
  });

  // --- 6. GUARDAR ARCHIVO ---
  // Nombre limpio: Planificacion_Vendedor_YYYY-MM-DD.pdf
  const dateStr = datePlanificacion
    ? new Date(datePlanificacion).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  const cleanVendor = vendedor.replace(/\s+/g, "_");

  doc.save(`Planificacion_${cleanVendor}_${dateStr}.pdf`);
};
