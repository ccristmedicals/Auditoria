import React, { useState } from "react";
import { useAuditoria } from "../hooks/useAuditoria";
import { Save, MapPin } from "lucide-react"; // Importamos MapPin
import {
    TableContainer,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
} from "../components/ui/Tabla";

// Helpers de formato
const formatCurrency = (val) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(val);

import {
    Edit3, ChevronDown, CheckCircle, Clock, XCircle, AlertCircle, RefreshCw,
    ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight
} from "lucide-react";


// --- COMPONENTES DE UI (Estandarizados) ---

const EditableCell = ({ value, onChange, placeholder = "..." }) => (
    <div className="relative w-full">
        <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full min-w-[100px] bg-white dark:bg-[#262626] border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-xs outline-none transition-all placeholder-gray-400 focus:ring-2 focus:ring-[#1a9888] focus:border-transparent dark:text-gray-200"
        />
        <Edit3 size={12} className="absolute right-2 top-2 text-gray-400 pointer-events-none opacity-50" />
    </div>
);

const SelectCell = ({ value, onChange, options }) => (
    <div className="relative w-full">
        <select
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-white dark:bg-[#262626] border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-xs outline-none cursor-pointer appearance-none transition-all focus:ring-2 focus:ring-[#1a9888] focus:border-transparent dark:text-gray-200"
            style={{ paddingRight: '1.5rem' }}
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value} className="text-gray-800 bg-white dark:bg-[#333] dark:text-gray-200">
                    {opt.label}
                </option>
            ))}
        </select>
        <ChevronDown size={14} className="absolute right-2 top-2 text-gray-400 pointer-events-none" />
    </div>
);

const TableCheckbox = ({ checked, onChange, colorClass }) => (
    <div className="flex justify-center">
        <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className={`w-4 h-4 rounded border-gray-300 focus:ring-2 cursor-pointer ${colorClass}`}
        />
    </div>
);

const GestionBadge = ({ type, status, description }) => {
    if (!status) return <span className="text-gray-300 text-[10px]">-</span>;

    let color = "bg-gray-100 text-gray-600 border-gray-200";
    let icon = <Clock size={12} />;

    if (status.includes("concretada") || status.includes("cerrada")) {
        color = "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300";
        icon = <CheckCircle size={12} />;
    } else if (status.includes("proceso")) {
        color = "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300";
        icon = <Clock size={12} />;
    } else if (status.includes("rechazada") || status.includes("no_interesado")) {
        color = "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300";
        icon = <XCircle size={12} />;
    }

    return (
        <div className="flex flex-col gap-1 items-start">
            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${color}`}>
                {icon}
                <span className="uppercase">{type}</span>
            </div>
            {description && (
                <span className="text-[10px] text-gray-500 leading-tight truncate max-w-[150px]" title={description}>
                    {description}
                </span>
            )}
        </div>
    );
};

const Matriz = () => {
    const { data, loading, error, handleAuditoriaChange } = useAuditoria();
    const [selectedDay, setSelectedDay] = useState("lunes");

    // --- PAGINACIÓN CLIENT-SIDE ---
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 25;

    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
    const paginatedData = data.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
    );

    const goToPage = (p) => {
        if (p >= 1 && p <= totalPages) setPage(p);
    };

    const handleSave = async (row) => {
        // Aquí iría la lógica de guardado real
        console.log(`Guardando auditoría del día ${selectedDay} para:`, row);
        alert(`Guardado (Simulado) para ${row.nombre} - ${selectedDay}`);
    };

    if (error) return <div className="p-8 text-center text-red-500">Error: {error.message}</div>;

    return (
        <div className="p-2 min-h-screen bg-white dark:bg-[#191919]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg text-[#1a9888]">
                        <Save size={28} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Auditoría de Conversaciones</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Total Registros: {data.length}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#202020] p-1 rounded-lg border border-gray-200 dark:border-[#333]">
                        <span className="text-xs font-bold text-gray-500 px-2 uppercase">Día de Auditoría:</span>
                        <select
                            value={selectedDay}
                            onChange={(e) => setSelectedDay(e.target.value)}
                            className="bg-white dark:bg-[#333] text-gray-700 dark:text-gray-200 text-sm font-medium px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1a9888]"
                        >
                            <option value="lunes">Lunes</option>
                            <option value="martes">Martes</option>
                            <option value="miercoles">Miércoles</option>
                            <option value="jueves">Jueves</option>
                            <option value="viernes">Viernes</option>
                        </select>
                    </div>
                </div>
            </div>

            <TableContainer className="max-h-[85vh]">
                {loading ? (
                    <div className="p-10 flex flex-col items-center justify-center text-gray-500">
                        <RefreshCw className="animate-spin w-8 h-8 mb-2 text-[#1a9888]" />
                        <span>Cargando página 1...</span>
                    </div>
                ) : (
                    <Table>
                        <Thead>
                            {/* --- NIVEL 1 --- */}
                            <Tr>
                                <Th colSpan={8} stickyTop className="bg-green-100 text-green-800 text-center border-r border-green-200 z-20">
                                    DATOS DEL CLIENTE (BITRIX)
                                </Th>
                                <Th colSpan={10} stickyTop className="bg-blue-100 text-blue-800 text-center border-r border-blue-200 z-20">
                                    DATOS FINANCIEROS (PROFIT)
                                </Th>
                                <Th colSpan={2} stickyTop className="bg-purple-100 text-purple-800 text-center border-r border-purple-200 z-20">
                                    GESTIÓN ACTUAL
                                </Th>
                                <Th colSpan={6} stickyTop className="bg-orange-100 text-orange-800 text-center z-20">
                                    AUDITORÍA (ENCARGADA)
                                </Th>
                            </Tr>

                            {/* --- NIVEL 2 --- */}
                            <Tr>
                                {/* BITRIX */}
                                <Th stickyLeft={true} className="min-w-[180px] w-[180px] bg-white dark:bg-[#1e1e1e] z-20 shadow-md">Cliente</Th>
                                <Th className="min-w-[60px] bg-white dark:bg-[#1e1e1e] text-xs">Compañia ID</Th>
                                <Th className="min-w-[80px] bg-white dark:bg-[#1e1e1e] text-xs">Etapa</Th>
                                <Th className="min-w-[80px] bg-green-50 dark:bg-green-900/10">Código</Th>
                                <Th className="min-w-[120px] bg-white dark:bg-[#1e1e1e]">Zona</Th>
                                <Th className="min-w-[100px] bg-white dark:bg-[#1e1e1e]">Segmento</Th>
                                <Th className="min-w-[100px] bg-white dark:bg-[#1e1e1e]">Coordenadas</Th>
                                <Th className="min-w-[120px] bg-white dark:bg-[#1e1e1e]">Días</Th>

                                {/* PROFIT */}
                                <Th className="min-w-[100px] text-xs">Límite Créd.</Th>
                                <Th className="min-w-[100px] text-xs">Saldo Tránsito</Th>
                                <Th className="min-w-[100px] text-xs">Saldo Vencido</Th>
                                <Th className="min-w-[90px] text-xs">Fecha Últ. Compra</Th>
                                <Th className="min-w-[110px] text-xs">Fact. Mayor Morosidad</Th>
                                <Th className="min-w-[90px] text-xs">Fecha Últ. Cobro</Th>
                                <Th className="min-w-[70px] text-xs">Clasif.</Th>
                                <Th className="min-w-[80px] text-xs">Posee Convenio</Th>
                                <Th className="min-w-[100px] text-xs bg-blue-50">Venta Mes Actual</Th>
                                <Th className="min-w-[100px] text-xs">Venta Mes Anterior</Th>

                                {/* GESTION ACTUAL */}
                                {/* <Th className="min-w-[140px] text-xs bg-purple-50">Venta</Th>
                                <Th className="min-w-[140px] text-xs bg-purple-50">Cobranza</Th> */}

                                {/* AUDITORIA */}
                                {/* <Th className="min-w-[40px] text-center bg-orange-50" title="Presencial">P</Th>
                                <Th className="min-w-[40px] text-center bg-orange-50" title="Llamada">C</Th>
                                <Th className="min-w-[40px] text-center bg-orange-50" title="Mensaje">M</Th>
                                <Th className="min-w-[140px] bg-orange-50">Contacto</Th>
                                <Th className="min-w-[180px] bg-orange-50">Observación</Th>
                                <Th className="min-w-[140px] bg-orange-50">Resultado</Th> */}
                                <Th stickyRight className="min-w-[80px] bg-white dark:bg-[#191919] border-l shadow-[-4px_0_5px_-2px_rgba(0,0,0,0.1)] text-center">Guardar</Th>
                            </Tr>
                        </Thead>

                        <Tbody>
                            {paginatedData.map((row) => (
                                <Tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-[#333]">
                                    <Td stickyLeft={true} className="font-bold border-r text-xs max-w-[180px] truncate bg-white dark:bg-[#191919] z-10" title={row.nombre}>
                                        {row.nombre}
                                    </Td>
                                    <Td className="text-xs text-gray-500">{row.id_bitrix}</Td>
                                    <Td className="text-xs text-gray-400">{row.etapa || "-"}</Td>
                                    <Td className="text-xs font-mono">{row.codigo}</Td>
                                    <Td className="text-xs truncate max-w-[120px]" title={row.zona}>{row.zona}</Td>
                                    <Td className="text-xs truncate max-w-[100px]" title={row.segmento}>{row.segmento}</Td>
                                    <Td className="text-xs truncate max-w-[100px]" title={row.coordenadas}>{row.coordenadas}</Td>
                                    <Td className="text-xs truncate max-w-[120px]" title={row.diasVisita}>{row.diasVisita}</Td>

                                    <Td className="text-right text-xs text-blue-700">{formatCurrency(row.limite_credito)}</Td>
                                    <Td className="text-right text-xs">{formatCurrency(row.saldo_transito)}</Td>
                                    <Td className={`text-right text-xs ${row.saldo_vencido > 0 ? 'text-red-500 font-bold' : ''}`}>
                                        {formatCurrency(row.saldo_vencido)}
                                    </Td>
                                    <Td className="text-center text-xs whitespace-nowrap">{row.fecha_ultima_compra}</Td>
                                    <Td className="text-xs text-center">{row.factura_morosidad}</Td>
                                    <Td className="text-right text-xs whitespace-nowrap">{row.ultimo_cobro}</Td>
                                    <Td className="text-center text-xs">{row.horario_caja}</Td>
                                    <Td className="text-center text-xs">{row.posee_convenio}</Td>
                                    <Td className="text-right text-xs font-semibold bg-blue-50/50 dark:bg-blue-900/10">
                                        {formatCurrency(row.venta_mes_actual)}
                                    </Td>
                                    <Td className="text-right text-xs text-gray-500">
                                        {formatCurrency(row.venta_mes_pasado)}
                                    </Td>

                                    {/* --- GESTIÓN ACTUAL --- */}
                                    {/* <Td className="border-l border-gray-200 dark:border-[#333] bg-purple-50/20">
                                        <GestionBadge
                                            type="Venta"
                                            status={row.gestion.venta_tipoGestion}
                                            description={row.gestion.venta_descripcion}
                                        />
                                    </Td>
                                    <Td className="bg-purple-50/20">
                                        <GestionBadge
                                            type="Cobranza"
                                            status={row.gestion.cobranza_tipoGestion}
                                            description={row.gestion.cobranza_descripcion}
                                        />
                                    </Td> */}

                                    {/* --- AUDITORIA --- */}
                                    {/* <Td className="bg-orange-50 border-l border-orange-100 dark:bg-orange-900/10 dark:border-[#333]">
                                        <TableCheckbox
                                            checked={row.auditoria[selectedDay]?.accion?.presencial}
                                            onChange={(val) => handleAuditoriaChange(row.id, selectedDay, 'accion.presencial', val)}
                                            colorClass="text-purple-600 focus:ring-purple-500"
                                        />
                                    </Td>
                                    <Td className="bg-orange-50 dark:bg-orange-900/10">
                                        <TableCheckbox
                                            checked={row.auditoria[selectedDay]?.accion?.llamada}
                                            onChange={(val) => handleAuditoriaChange(row.id, selectedDay, 'accion.llamada', val)}
                                            colorClass="text-blue-600 focus:ring-blue-500"
                                        />
                                    </Td>
                                    <Td className="bg-orange-50 dark:bg-orange-900/10">
                                        <TableCheckbox
                                            checked={row.auditoria[selectedDay]?.accion?.mensaje}
                                            onChange={(val) => handleAuditoriaChange(row.id, selectedDay, 'accion.mensaje', val)}
                                            colorClass="text-green-600 focus:ring-green-500"
                                        />
                                    </Td>

                                    <Td className="p-1 bg-white dark:bg-[#191919]">
                                        <EditableCell
                                            value={row.auditoria[selectedDay]?.contacto}
                                            onChange={(val) => handleAuditoriaChange(row.id, selectedDay, 'contacto', val)}
                                            placeholder="Contacto..."
                                        />
                                    </Td>
                                    <Td className="p-1 bg-white dark:bg-[#191919]">
                                        <EditableCell
                                            value={row.auditoria[selectedDay]?.observacion}
                                            onChange={(val) => handleAuditoriaChange(row.id, selectedDay, 'observacion', val)}
                                            placeholder="Observación..."
                                        />
                                    </Td>
                                    <Td className="p-1 bg-white dark:bg-[#191919]">
                                        <SelectCell
                                            value={row.auditoria[selectedDay]?.proximo_paso}
                                            onChange={(val) => handleAuditoriaChange(row.id, selectedDay, 'proximo_paso', val)}
                                            options={[
                                                { value: "", label: "Seleccionar..." },
                                                { value: "venta", label: "Venta" },
                                                { value: "cobro", label: "Cobro" },
                                                { value: "seguimiento", label: "Seguimiento" },
                                                { value: "no_interesado", label: "No Interesado" },
                                            ]}
                                        />
                                    </Td> */}

                                    <Td stickyRight className="bg-white dark:bg-[#191919] border-l shadow-[-4px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                        <div className="flex justify-center">
                                            <button
                                                onClick={() => handleSave(row)}
                                                className="p-2 text-white bg-[#1a9888] hover:bg-[#137a6d] rounded-lg transition shadow-sm"
                                            >
                                                <Save size={16} />
                                            </button>
                                        </div>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                )}
            </TableContainer>

            {/* --- PAGINACIÓN --- */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4 mt-2 gap-4">
                <div className="flex items-center gap-2">
                    <button onClick={() => goToPage(1)} disabled={page === 1} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300"><ChevronsLeft size={16} /></button>
                    <button onClick={() => goToPage(page - 1)} disabled={page === 1} className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 dark:bg-[#333] dark:text-gray-200 dark:border-gray-600"><ChevronLeft size={16} /> Anterior</button>

                    <span className="px-4 py-2 text-sm font-semibold text-[#1a9888] bg-teal-50 rounded-lg border border-teal-100 dark:bg-teal-900/20 dark:border-teal-800">
                        Página {page} de {totalPages || 1}
                    </span>

                    <button onClick={() => goToPage(page + 1)} disabled={page === totalPages} className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 dark:bg-[#333] dark:text-gray-200 dark:border-gray-600">Siguiente <ChevronRight size={16} /></button>
                    <button onClick={() => goToPage(totalPages)} disabled={page === totalPages} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300"><ChevronsRight size={16} /></button>
                </div>

                <form onSubmit={(e) => {
                    e.preventDefault();
                    const p = parseInt(e.target.pageInput.value);
                    if (p >= 1 && p <= totalPages) {
                        goToPage(p);
                        e.target.pageInput.value = "";
                    } else {
                        alert(`Página inválida (1-${totalPages})`);
                    }
                }} className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Ir a pág:</span>
                    <input
                        name="pageInput"
                        type="number"
                        min="1"
                        max={totalPages}
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a9888] dark:bg-[#333] dark:border-gray-600 dark:text-white"
                    />
                    <button type="submit" className="px-3 py-1 text-xs font-bold text-white bg-gray-600 rounded-md hover:bg-gray-700">IR</button>
                </form>
            </div>
        </div>
    );
};

export default Matriz;