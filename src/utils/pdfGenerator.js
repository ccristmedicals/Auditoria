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

  // --- 2. FILTRAR DÍAS ACTIVOS (LÓGICA MEJORADA) ---
  const days = [
    { key: "lunes", label: "Lun" },
    { key: "martes", label: "Mar" },
    { key: "miercoles", label: "Mie" },
    { key: "jueves", label: "Jue" },
    { key: "viernes", label: "Vie" },
  ];

  const activeDays = days.filter((day) => {
    // some() devuelve true si AL MENOS UNA compañía cumple la condición
    return selectedCompanies.some((c) => {
      const tarea = c[`${day.key}_tarea`];
      const accion = c[`${day.key}_accion`];

      // Función auxiliar para saber si hay TEXTO REAL
      const hasContent = (val) => {
        if (val === null || val === undefined) return false;
        const str = String(val).trim(); // Convierte a string y quita espacios
        // Verifica que no esté vacío y que no sea solo un guión
        return str.length > 0 && str !== "-" && str !== "—";
      };

      return hasContent(tarea) || hasContent(accion);
    });
  });

  // --- 3. DEFINIR COLUMNAS ---
  const columnsDef = [
    { title: "Cód.", dataKey: "codigo", width: 18, align: "center" },
    { title: "Cliente", dataKey: "nombre", width: 45, align: "center" },
    { title: "Ciudad", dataKey: "ciudad", width: 28, align: "center" },
    { title: "Límite", dataKey: "limite", width: 18, align: "center" },
    { title: "Tránsito", dataKey: "transito", width: 18, align: "center" },
    { title: "Vencido", dataKey: "vencido", width: 18, align: "center" },
    {
      title: "Últ. Compra",
      dataKey: "fecha_compra",
      width: 18,
      align: "center",
    },
    { title: "Morosidad", dataKey: "morosidad", width: 16, align: "center" },
    { title: "SKU", dataKey: "sku", width: 12, align: "center" },
    { title: "Clasif.", dataKey: "clasif", width: 10, align: "center" },
  ];

  // Agregar días dinámicos (Solo los que pasaron el filtro estricto)
  activeDays.forEach((day) => {
    columnsDef.push({
      title: day.label,
      dataKey: day.key,
      width: "auto",
      align: "center",
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
      _vencidoRaw: item.saldo_vencido,
      fecha_compra: item.fecha_ultima_compra || item.fecha_compra || "-",
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
    head: [columnsDef.map((col) => col.title)],
    body: tableBody.map((row) => columnsDef.map((col) => row[col.dataKey])),
    theme: "grid",
    styles: {
      fontSize: 7,
      cellPadding: 1.5,
      valign: "middle",
      overflow: "linebreak",
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
