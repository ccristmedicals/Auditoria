import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateVendorPDF = (vendorName, selectedCompanies) => {
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    // ... (titulo logic code same)
    doc.setFontSize(18);
    doc.setTextColor(26, 152, 136); // #1a9888
    doc.text(`Reporte de Planificación - Vendedor: ${vendorName}`, 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Fecha de generación: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Total de clientes: ${selectedCompanies.length}`, 14, 33);

    // --- DETECTAR DÍAS ACTIVOS ---
    const days = [
        { key: 'lunes', label: 'Lunes' },
        { key: 'martes', label: 'Martes' },
        { key: 'miercoles', label: 'Miércoles' },
        { key: 'jueves', label: 'Jueves' },
        { key: 'viernes', label: 'Viernes' }
    ];

    // Filtramos qué días tienen data en al menos un cliente seleccionado
    const activeDays = days.filter(day => {
        return selectedCompanies.some(c =>
            (c[`${day.key}_tarea`] && c[`${day.key}_tarea`].trim() !== '') ||
            (c[`${day.key}_accion`] && c[`${day.key}_accion`].trim() !== '') ||
            (c[`${day.key}_observacion`] && c[`${day.key}_observacion`].trim() !== '')
        );
    });

    // Si no hay días activos (ej. solo seleccionó sin llenar nada), mostramos todos o ninguno? 
    // Mostremos todos por defecto si está vacío para no romper la tabla, o mejor:
    // Si realmente quiere ocultar lo vacío, activeDays estará vacío y solo mostrará info básica.

    // --- CONSTRUIR HEADER ---
    const tableColumn = ["ID", "Cliente", "P. Profit", ...activeDays.map(d => d.label)];

    // --- CONSTRUIR FILAS ---
    const tableRows = selectedCompanies.map(company => {
        const row = [
            company.id,
            company.nombre,
            company.codigo_profit || '-'
        ];

        // Agregamos las columnas dinámicas
        activeDays.forEach(day => {
            // Aquí decidimos qué mostrar. El usuario pidió "la columna del día".
            // Asumimos que muestra la TAREA principalmente, o concatena info.
            // Viendo su imagen, es un texto largo. Usaremos la tarea.
            // Si quisiera acción u observación, se podría concatenar:
            // const text = [company[`${day.key}_tarea`], company[`${day.key}_accion`]].filter(Boolean).join(' | ');
            const text = company[`${day.key}_tarea`] || '-';
            row.push(text);
        });

        return row;
    });

    // --- ESTILOS DINÁMICOS DE COLUMNAS ---
    const baseColumnStyles = {
        0: { cellWidth: 15 }, // ID
        1: { cellWidth: 50 }, // Cliente
        2: { cellWidth: 20 }, // P. Profit
    };

    // Las columnas dinámicas (3, 4, 5...) tendrán ancho auto
    activeDays.forEach((_, index) => {
        baseColumnStyles[3 + index] = { cellWidth: 'auto' };
    });

    autoTable(doc, {
        startY: 40,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: {
            fillColor: [26, 152, 136],
            textColor: [255, 255, 255],
            fontSize: 10,
            halign: 'center'
        },
        columnStyles: baseColumnStyles,
        styles: {
            fontSize: 8,
            cellPadding: 3,
            valign: 'middle',
            overflow: 'linebreak'
        }
    });

    // --- GUARDAR ---
    doc.save(`Planificacion_${vendorName.replace(/\s+/g, '_')}.pdf`);
};
