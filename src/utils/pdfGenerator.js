import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const currency = (val) => {
  if (val === undefined || val === null || val === "") return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(val);
};

export const generateVendorPDF = (vendorName, selectedCompanies) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // --- TÍTULOS ---
  doc.setFontSize(18);
  doc.setTextColor(26, 152, 136);
  doc.text(`Reporte de Planificación - ${vendorName}`, 14, 15);

  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(
    `Generado: ${new Date().toLocaleString()} | Clientes: ${selectedCompanies.length}`,
    14,
    22,
  );

  // --- 2. FILTRAR DÍAS ACTIVOS ---
  const days = [
    { key: "lunes", label: "Lun" },
    { key: "martes", label: "Mar" },
    { key: "miercoles", label: "Mie" },
    { key: "jueves", label: "Jue" },
    { key: "viernes", label: "Vie" },
  ];

  const activeDays = days.filter((day) => {
    return selectedCompanies.some(
      (c) =>
        (c[`${day.key}_tarea`] && c[`${day.key}_tarea`].trim() !== "") ||
        (c[`${day.key}_accion`] && c[`${day.key}_accion`].trim() !== ""),
    );
  });

  // --- 3. DEFINIR COLUMNAS (Ajuste milimétrico para espacio) ---
  const columnsDef = [
    { title: "Cód.", dataKey: "codigo", width: 14, align: "center" },
    { title: "Cliente", dataKey: "nombre", width: 40, align: "left" }, // Reducido a 40 para dar espacio
    { title: "Ciudad", dataKey: "ciudad", width: 20, align: "left" },

    // Financiero (Alineados a la derecha para leer montos mejor)
    { title: "Límite", dataKey: "limite", width: 18, align: "right" },
    { title: "Tránsito", dataKey: "transito", width: 18, align: "right" },
    { title: "Vencido", dataKey: "vencido", width: 18, align: "right" },

    // Fechas (Centradas)
    {
      title: "Últ. Compra",
      dataKey: "fecha_compra",
      width: 18,
      align: "center",
    },
    {
      title: "Últ. Cobro",
      dataKey: "ultimo_cobro",
      width: 18,
      align: "center",
    },

    // Datos Cortos
    { title: "Morosidad", dataKey: "morosidad", width: 16, align: "center" },

    // SKU: Aquí intentamos mapear varias opciones comunes
    { title: "SKU", dataKey: "sku", width: 12, align: "center" },

    { title: "Clasif.", dataKey: "clasif", width: 10, align: "center" },
  ];

  // Agregar días dinámicos
  activeDays.forEach((day) => {
    columnsDef.push({
      title: day.label,
      dataKey: day.key,
      width: "auto", // Usa el espacio restante
      align: "left",
    });
  });

  // --- 4. MAPEO DE DATOS ---
  const tableBody = selectedCompanies.map((item) => {
    const rowData = {
      codigo: item.codigo_profit || item.codigo || "-",
      nombre: item.nombre,
      ciudad: item.zona || item.ciudad || "-",

      limite: currency(item.limite_credito),
      transito: currency(item.saldo_transito),
      vencido: currency(item.saldo_vencido),
      _vencidoRaw: item.saldo_vencido, // Dato crudo para lógica de color

      fecha_compra: item.fecha_ultima_compra || item.fecha_compra || "-",
      ultimo_cobro: item.fecha_ultimo_cobro || item.ultimo_cobro || "-",

      // INTENTO DE ENCONTRAR EL SKU: Revisa la consola si sigue saliendo "-"
      sku: item.sku_mes || "-",

      morosidad: item.factura_morosidad || "-",
      clasif: item.clasificacion || item.horario_caja || "-",
    };

    activeDays.forEach((day) => {
      rowData[day.key] = item[`${day.key}_tarea`] || "-";
    });

    return rowData;
  });

  // --- 5. ESTILOS DE COLUMNAS ---
  const dynamicColumnStyles = {};
  columnsDef.forEach((col, index) => {
    dynamicColumnStyles[index] = {
      cellWidth: col.width,
      halign: col.align || "left",
    };
  });

  // --- 6. GENERAR PDF ---
  autoTable(doc, {
    startY: 25,
    // HEAD y BODY mapeados explícitamente para garantizar orden
    head: [columnsDef.map((col) => col.title)],
    body: tableBody.map((row) => columnsDef.map((col) => row[col.dataKey])),

    theme: "grid",

    styles: {
      fontSize: 7,
      cellPadding: 1.5, // Padding medio para que no se vea apretado
      valign: "middle",
      overflow: "linebreak", // Permite que el texto baje si es muy largo
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
    },

    headStyles: {
      fillColor: [26, 152, 136],
      textColor: [255, 255, 255],
      fontSize: 7,
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
    },

    columnStyles: dynamicColumnStyles,

    // Lógica para pintar rojo el saldo vencido
    didParseCell: function (data) {
      const vencidoIndex = columnsDef.findIndex((c) => c.dataKey === "vencido");
      if (data.section === "body" && data.column.index === vencidoIndex) {
        const rawValue = tableBody[data.row.index]._vencidoRaw;
        const numVal = parseFloat(rawValue) || 0;
        if (numVal > 0) {
          data.cell.styles.textColor = [220, 50, 50];
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
  });

  doc.save(`Reporte_${vendorName.replace(/\s+/g, "_")}.pdf`);
};
