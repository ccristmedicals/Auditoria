import React, { useState } from "react";
import { useAuditoria } from "../hooks/useAuditoria";
import { Save, MapPin } from "lucide-react";
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
            checked={!!checked}
            onChange={(e) => onChange(e.target.checked)}
            className={`w-4 h-4 rounded border-gray-300 focus:ring-2 cursor-pointer ${colorClass}`}
        />
    </div>
);

const HeaderCountInput = ({ value }) => (
    <div>
        <input
            type="text"
            readOnly
            value={value}
            className="w-full text-center text-[12px] font-bold text-gray-700"
        />
    </div>
);

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

    const calculateTotal = (category, field) => {
        if (!data) return 0;
        return data.reduce((acc, row) => {
            const isChecked = row.auditoria?.[selectedDay]?.[category]?.[field];
            return isChecked ? acc + 1 : acc;
        }, 0);
    };

    // const handleSave = async (row) => {
    //     // Aquí iría la lógica de guardado real
    //     console.log(`Guardando auditoría del día ${selectedDay} para:`, row);
    //     alert(`Guardado (Simulado) para ${row.nombre} - ${selectedDay}`);
    // };

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

                                <Th colSpan={8} stickyTop className="p-0 border-r border-green-200 bg-green-100 h-1">
                                </Th>
                                <Th colSpan={10} stickyTop className="p-0 border-r border-blue-200 bg-blue-100 h-1">
                                </Th>

                                <Th colSpan={18} stickyTop className="bg-purple-100 text-purple-800 text-center border-r border-purple-200 z-20">
                                    GESTIÓN DIARIA: <span className="uppercase font-bold">{selectedDay}</span>
                                </Th>
                                <Th colSpan={4} className="p-0 border-r border-gray-200 bg-gray-200 h-1"></Th>
                                <Th colSpan={1} className="p-0 border-r border-pink-200 bg-pink-200 h-1"></Th>


                            </Tr>


                            <Tr>
                                <Th colSpan={8} className="p-0 border-r border-green-200 bg-green-100 h-1"></Th>
                                {/* Profit (Espaciadores) */}
                                <Th colSpan={10} className="p-0 border-r border-blue-200 bg-blue-100 h-1"></Th>

                                {/* Bitrix (Espaciadores) */}


                                {/* GESTIÓN */}
                                <Th colSpan={2} className="text-center text-[10px] uppercase bg-yellow-50 border-r border-yellow-200 text-gray-500">Inicios</Th>
                                <Th colSpan={6} className="text-center text-[10px] uppercase bg-yellow-50 border-r border-yellow-200 text-gray-500">Acción Realizada</Th>
                                <Th colSpan={6} className="text-center text-[10px] uppercase bg-yellow-50 border-r border-yellow-200 text-gray-500">Llamadas</Th>
                                <Th colSpan={4} className="text-center text-[10px] uppercase bg-yellow-50 border-r border-yellow-200 text-gray-500">Visitas Asesor de Venta</Th>
                                <Th colSpan={4} className="p-0 border-r border-gray-200 bg-gray-200 h-1"></Th>
                                <Th colSpan={1} className="p-0 border-r border-pink-200 bg-pink-200 h-1"></Th>

                            </Tr>

                            <Tr>
                                {/* Bitrix (Espaciadores) */}

                                <Th colSpan={8} className="p-0 border-r border-green-200 bg-green-100 h-1"></Th>
                                {/* Profit (Espaciadores) */}
                                <Th colSpan={10} className="p-0 border-r border-blue-200 bg-blue-100 h-1"></Th>

                                {/* GESTIÓN */}
                                <Th colSpan={2} className="p-0 border-r border-yellow-200 bg-yellow-50 h-1"></Th>
                                <Th colSpan={6} className="p-0 border-r border-yellow-200 bg-yellow-50 h-1"></Th>
                                <Th colSpan={6} className="p-0 border-r border-yellow-200 bg-yellow-50 h-1"></Th>
                                <Th colSpan={1} className="p-0 border-r border-yellow-200 bg-yellow-50 h-1">Puestas</Th>
                                <Th colSpan={1} className="p-0 border-r border-yellow-200 bg-yellow-50 h-1">Cumplidos</Th>
                                <Th colSpan={1} className="p-0 border-r border-yellow-200 bg-yellow-50 h-1">Visitas del dia</Th>
                                <Th colSpan={1} className="p-0 border-r border-yellow-200 bg-yellow-50 h-1">% de Planificación</Th>
                                <Th colSpan={4} className="p-0 border-r border-gray-200 bg-gray-200 h-1"></Th>
                                <Th colSpan={1} className="p-0 border-r border-pink-200 bg-pink-200 h-1"></Th>

                            </Tr>

                            {/* CONTAR GESTIONES (FILA MODIFICADA CON INPUTS) */}
                            <Tr>
                                <Th colSpan={8} className=" bg-green-100 text-green-800 text-center border-r border-green-200 z-20 text-[15px]"> DATOS DEL CLIENTE (BITRIX)</Th>
                                {/* Profit (Espaciadores) */}
                                <Th colSpan={10} className="bg-blue-100 text-blue-800 text-center border-r border-blue-200 z-20 text-[15px]">
                                    DATOS FINANCIEROS (PROFIT)
                                </Th>

                                {/* Inicio Whatsapp */}
                                <Th className="min-w-[30px] bg-white p-0 border-l border-white"><HeaderCountInput value={calculateTotal('inicio_whatsapp', 'e')} /></Th>
                                <Th className="min-w-[30px] bg-white p-0 border-l border-white"><HeaderCountInput value={calculateTotal('inicio_whatsapp', 'c')} /></Th>

                                {/* Acción Venta */}
                                <Th className="min-w-[30px] bg-white p-0 border-l border-white"><HeaderCountInput value={calculateTotal('accion_venta', 'e')} /></Th>
                                <Th className="min-w-[30px] bg-white p-0 border-l border-white"><HeaderCountInput value={calculateTotal('accion_venta', 'p')} /></Th>
                                <Th className="min-w-[30px] bg-white p-0 border-l border-white"><HeaderCountInput value={calculateTotal('accion_venta', 'n')} /></Th>

                                {/* Acción Cobranza */}
                                <Th className="min-w-[30px] bg-white p-0 border-l border-white"><HeaderCountInput value={calculateTotal('accion_cobranza', 'e')} /></Th>
                                <Th className="min-w-[30px] bg-white p-0 border-l border-white"><HeaderCountInput value={calculateTotal('accion_cobranza', 'p')} /></Th>
                                <Th className="min-w-[30px] bg-white p-0 border-l border-white"><HeaderCountInput value={calculateTotal('accion_cobranza', 'n')} /></Th>

                                {/* Llamadas Venta */}
                                <Th className="min-w-[30px] bg-white p-0 border-l border-white"><HeaderCountInput value={calculateTotal('llamadas_venta', 'e')} /></Th>
                                <Th className="min-w-[30px] bg-white p-0 border-l border-white"><HeaderCountInput value={calculateTotal('llamadas_venta', 'p')} /></Th>
                                <Th className="min-w-[30px] bg-white p-0 border-l border-white"><HeaderCountInput value={calculateTotal('llamadas_venta', 'n')} /></Th>

                                {/* Llamadas Cobranza */}
                                <Th className="min-w-[30px] bg-white p-0 border-l border-white"><HeaderCountInput value={calculateTotal('llamadas_cobranza', 'e')} /></Th>
                                <Th className="min-w-[30px] bg-white p-0 border-l border-white"><HeaderCountInput value={calculateTotal('llamadas_cobranza', 'p')} /></Th>
                                <Th className="min-w-[30px] bg-white p-0 border-l border-white"><HeaderCountInput value={calculateTotal('llamadas_cobranza', 'n')} /></Th>

                                {/* Puestas */}
                                <Th className="min-w-[30px] bg-white p-0 border-l border-white"><HeaderCountInput value={calculateTotal('puestas', 'e')} /></Th>
                                <Th className="min-w-[30px] bg-white p-0 border-l border-white"><HeaderCountInput value={calculateTotal('puestas', 'p')} /></Th>
                                <Th className="min-w-[30px] bg-white p-0 border-l border-white"><HeaderCountInput value={calculateTotal('puestas', 'n')} /></Th>
                                <Th className="min-w-[30px] bg-white p-0 border-l border-white"><HeaderCountInput value={calculateTotal('puestas', 'n')} /></Th>

                                <Th colSpan={4} className="text-center text-[15px] uppercase bg-gray-200 border-r border-gray-200 text-gray-700">Vendedores</Th>
                                <Th colSpan={1} className="text-center text-[10px] uppercase bg-pink-200 border-r border-pink-200 text-pink-700">Observación</Th>

                            </Tr>


                            {/* --- NIVEL 2: Categorías de Gestión --- */}
                            <Tr>
                                {/* Bitrix (Espaciadores) */}

                                <Th colSpan={8} className="p-0 border-r border-green-200 bg-green-100 h-1"></Th>
                                {/* Profit (Espaciadores) */}
                                <Th colSpan={10} className="p-0 border-r border-blue-200 bg-blue-100 h-1"></Th>

                                {/* GESTIÓN */}
                                <Th colSpan={2} className="text-center text-[10px] uppercase bg-green-50 border-r border-green-200 text-green-700">Inicio WhatsApp</Th>
                                <Th colSpan={6} className="text-center text-[10px] uppercase bg-blue-50 border-r border-blue-200 text-blue-700">Acción Realizada</Th>
                                <Th colSpan={6} className="text-center text-[10px] uppercase bg-teal-50 border-r border-teal-200 text-teal-700">Llamadas</Th>
                                <Th colSpan={4} className="text-center text-[10px] uppercase bg-yellow-50 border-r border-yellow-200 text-yellow-700">Visitas Asesor de Venta</Th>
                                <Th colSpan={4} className="p-0 border-r border-gray-200 bg-gray-200 h-1"></Th>
                                <Th colSpan={1} className="p-0 border-r border-pink-200 bg-pink-200 h-1"></Th>


                            </Tr>
                            <Tr>
                                {/* Bitrix (Espaciadores) */}

                                <Th colSpan={8} className="p-0 border-r border-green-200 bg-green-100 h-1"></Th>
                                {/* Profit (Espaciadores) */}
                                <Th colSpan={10} className="p-0 border-r border-blue-200 bg-blue-100 h-1"></Th>

                                {/* GESTIÓN */}
                                <Th colSpan={2} className="p-0 border-r border-green-200 bg-green-50 h-1"></Th>
                                <Th colSpan={3} className="text-center text-[10px] uppercase bg-blue-50 border-r border-blue-200 text-blue-700">Venta</Th>
                                <Th colSpan={3} className="text-center text-[10px] uppercase bg-blue-50 border-r border-blue-200 text-blue-700">Cobranza</Th>
                                <Th colSpan={3} className="text-center text-[10px] uppercase bg-teal-50 border-r border-teal-200 text-teal-700">Venta</Th>
                                <Th colSpan={3} className="text-center text-[10px] uppercase bg-teal-50 border-r border-teal-200 text-teal-700">Cobranza</Th>
                                <Th colSpan={4} className="p-0 border-r border-yellow-200 bg-yellow-50 h-1"></Th>
                                <Th colSpan={4} className="p-0 border-r border-gray-200 bg-gray-200 h-1"></Th>
                                <Th colSpan={1} className="p-0 border-r border-pink-200 bg-pink-200 h-1"></Th>

                            </Tr>


                            {/* --- NIVEL 3: Columnas Específicas --- */}
                            <Tr>
                                {/* BITRIX */}
                                <Th stickyLeft={false} className="min-w-[180px] w-[180px] bg-white dark:bg-[#1e1e1e] z-20 shadow-md border-t">Cliente</Th>
                                <Th className="min-w-[60px] bg-white dark:bg-[#1e1e1e] text-xs border-t">Compañia ID</Th>
                                <Th className="min-w-[80px] bg-white dark:bg-[#1e1e1e] text-xs border-t">Etapa</Th>
                                <Th className="min-w-[80px] bg-white dark:bg-[#1e1e1e] text-xs border-t">Código</Th>
                                <Th className="min-w-[120px] bg-white dark:bg-[#1e1e1e] text-xs border-t">Zona</Th>
                                <Th className="min-w-[100px] bg-white dark:bg-[#1e1e1e] text-xs border-t">Segmento</Th>
                                <Th className="min-w-[100px] bg-white dark:bg-[#1e1e1e] text-xs border-t">Coordenadas</Th>
                                <Th className="min-w-[120px] bg-white dark:bg-[#1e1e1e] text-xs border-t">Días</Th>

                                {/* PROFIT */}
                                <Th className="min-w-[100px] text-xs border-t">Límite Créd.</Th>
                                <Th className="min-w-[100px] text-xs border-t">Saldo Tránsito</Th>
                                <Th className="min-w-[100px] text-xs border-t">Saldo Vencido</Th>
                                <Th className="min-w-[90px] text-xs border-t">Fecha Últ. Compra</Th>
                                <Th className="min-w-[110px] text-xs border-t">Fact. Mayor Morosidad</Th>
                                <Th className="min-w-[90px] text-xs border-t">Fecha Últ. Cobro</Th>
                                <Th className="min-w-[70px] text-xs border-t">Clasif.</Th>
                                <Th className="min-w-[80px] text-xs border-t">Posee Convenio</Th>
                                <Th className="min-w-[100px] text-xs bg-blue-50 border-t">Venta Mes Actual</Th>
                                <Th className="min-w-[100px] text-xs border-t">Venta Mes Anterior</Th>

                                {/* GESTION DIARIA (Sub-columnas) */}
                                {/* Inicio WhatsApp */}
                                <Th className="min-w-[30px] font-bold text-center bg-green-50 text-[10px] border-l border-green-200" title="Enviado">E</Th>
                                <Th className="min-w-[30px] font-bold text-center bg-green-50 text-[10px] border-r border-green-200" title="Contestado">C</Th>

                                {/* Acción Realizada (Venta / Cobranza) */}
                                <Th className="min-w-[30px] font-bold text-center bg-blue-50 text-[10px] border-l border-blue-200" title="Venta Enviado">E</Th>
                                <Th className="min-w-[30px] font-bold text-center bg-blue-50 text-[10px]" title="Venta Pendiente">P</Th>
                                <Th className="min-w-[30px] font-bold text-center bg-blue-50 text-[10px] border-r border-blue-200" title="Venta Negada">N</Th>

                                <Th className="min-w-[30px] font-bold text-center bg-blue-50 text-[10px]" title="Cobranza Enviado">E</Th>
                                <Th className="min-w-[30px] font-bold text-center bg-blue-50 text-[10px]" title="Cobranza Pendiente">P</Th>
                                <Th className="min-w-[30px] font-bold text-center bg-blue-50 text-[10px] border-r border-blue-200" title="Cobranza Negada">N</Th>

                                {/* Llamadas (Venta / Cobranza) */}
                                <Th className="min-w-[30px] font-bold text-center bg-teal-50 text-[10px] border-l border-teal-200" title="Llamada Venta E">E</Th>
                                <Th className="min-w-[30px] font-bold text-center bg-teal-50 text-[10px]" title="Llamada Venta P">P</Th>
                                <Th className="min-w-[30px] font-bold text-center bg-teal-50 text-[10px] border-r border-teal-200" title="Llamada Venta N">N</Th>

                                <Th className="min-w-[30px] font-bold text-center bg-teal-50 text-[10px]" title="Llamada Cobranza E">E</Th>
                                <Th className="min-w-[30px] font-bold text-center bg-teal-50 text-[10px]" title="Llamada Cobranza P">P</Th>
                                <Th className="min-w-[30px] font-bold text-center bg-teal-50 text-[10px]" title="Llamada Cobranza N">N</Th>

                                <Th colSpan={1} className="text-center text-[10px] uppercase bg-yellow-50 border-r border-yellow-200 text-yellow-700">Planificación</Th>
                                <Th colSpan={1} className="text-center text-[10px] uppercase bg-yellow-50 border-r border-yellow-200 text-yellow-700">Acción</Th>
                                <Th colSpan={1} className="text-center text-[10px] uppercase bg-yellow-50 border-r border-yellow-200 text-yellow-700">Diferencia de Coordenadas</Th>
                                <Th colSpan={1} className="text-center text-[10px] uppercase bg-yellow-50 border-r border-yellow-200 text-yellow-700">Observación del vendedor</Th>

                                <Th colSpan={1} className="text-center text-[10px] uppercase bg-gray-200 border-r border-gray-200 text-gray-700">Fecha de Registro</Th>
                                <Th colSpan={1} className="text-center text-[10px] uppercase bg-gray-200 border-r border-gray-200 text-gray-700">Tipo de gestión de ventas</Th>
                                <Th colSpan={1} className="text-center text-[10px] uppercase bg-gray-200 border-r border-gray-200 text-gray-700">Tipo de gestión de cobranza</Th>
                                <Th colSpan={1} className="text-center text-[10px] uppercase bg-gray-200 border-r border-gray-200 text-gray-700">Descripción de ambos conceptos</Th>
                                <Th colSpan={1} className="text-center text-[10px] uppercase bg-pink-200 border-r border-pink-200 text-pink-700">Observaciones</Th>


                            </Tr>
                        </Thead>

                        <Tbody>
                            {paginatedData.map((row) => (
                                <Tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-[#333]">
                                    {/* BITRIX */}
                                    <Td stickyLeft={false} className="font-bold border-r text-xs max-w-[180px] truncate bg-white dark:bg-[#191919] z-10" title={row.nombre}>
                                        {row.nombre}
                                    </Td>
                                    <Td className="text-xs text-gray-500">{row.id_bitrix}</Td>
                                    <Td className="text-xs text-gray-400">{row.etapa || "-"}</Td>
                                    <Td className="text-xs font-mono">{row.codigo}</Td>
                                    <Td className="text-xs truncate max-w-[120px]" title={row.zona}>{row.zona}</Td>
                                    <Td className="text-xs truncate max-w-[100px]" title={row.segmento}>{row.segmento}</Td>
                                    <Td className="text-xs truncate max-w-[100px]" title={row.coordenadas}>{row.coordenadas}</Td>
                                    <Td className="text-xs truncate max-w-[120px]" title={row.diasVisita}>{row.diasVisita}</Td>

                                    {/* PROFIT */}
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
                                    <Td className="text-right text-xs text-gray-500 border-r border-gray-200">
                                        {formatCurrency(row.venta_mes_pasado)}
                                    </Td>

                                    {/* --- GESTIÓN DIARIA CHECKBOXES --- */}

                                    {/* Inicio WhatsApp: E, C */}
                                    <Td className="bg-green-50/20 border-l border-green-100 p-0 text-center">
                                        <TableCheckbox
                                            checked={row.auditoria[selectedDay]?.inicio_whatsapp?.e}
                                            onChange={(val) => handleAuditoriaChange(row.id, selectedDay, 'inicio_whatsapp', 'e', val)}
                                            colorClass="text-green-600 focus:ring-green-500"
                                        />
                                    </Td>
                                    <Td className="bg-green-50/20 border-r border-green-100 p-0 text-center">
                                        <TableCheckbox
                                            checked={row.auditoria[selectedDay]?.inicio_whatsapp?.c}
                                            onChange={(val) => handleAuditoriaChange(row.id, selectedDay, 'inicio_whatsapp', 'c', val)}
                                            colorClass="text-green-600 focus:ring-green-500"
                                        />
                                    </Td>

                                    {/* Acción Venta: E, P, N */}
                                    <Td className="bg-blue-50/20 border-l border-blue-100 p-0 text-center">
                                        <TableCheckbox
                                            checked={row.auditoria[selectedDay]?.accion_venta?.e}
                                            onChange={(val) => handleAuditoriaChange(row.id, selectedDay, 'accion_venta', 'e', val)}
                                            colorClass="text-blue-600 focus:ring-blue-500"
                                        />
                                    </Td>
                                    <Td className="bg-blue-50/20 p-0 text-center">
                                        <TableCheckbox
                                            checked={row.auditoria[selectedDay]?.accion_venta?.p}
                                            onChange={(val) => handleAuditoriaChange(row.id, selectedDay, 'accion_venta', 'p', val)}
                                            colorClass="text-blue-600 focus:ring-blue-500"
                                        />
                                    </Td>
                                    <Td className="bg-blue-50/20 border-r border-blue-100 p-0 text-center">
                                        <TableCheckbox
                                            checked={row.auditoria[selectedDay]?.accion_venta?.n}
                                            onChange={(val) => handleAuditoriaChange(row.id, selectedDay, 'accion_venta', 'n', val)}
                                            colorClass="text-red-600 focus:ring-red-500"
                                        />
                                    </Td>

                                    {/* Acción Cobranza: E, P, N */}
                                    <Td className="bg-blue-50/20 p-0 text-center">
                                        <TableCheckbox
                                            checked={row.auditoria[selectedDay]?.accion_cobranza?.e}
                                            onChange={(val) => handleAuditoriaChange(row.id, selectedDay, 'accion_cobranza', 'e', val)}
                                            colorClass="text-blue-600 focus:ring-blue-500"
                                        />
                                    </Td>
                                    <Td className="bg-blue-50/20 p-0 text-center">
                                        <TableCheckbox
                                            checked={row.auditoria[selectedDay]?.accion_cobranza?.p}
                                            onChange={(val) => handleAuditoriaChange(row.id, selectedDay, 'accion_cobranza', 'p', val)}
                                            colorClass="text-blue-600 focus:ring-blue-500"
                                        />
                                    </Td>
                                    <Td className="bg-blue-50/20 border-r border-blue-100 p-0 text-center">
                                        <TableCheckbox
                                            checked={row.auditoria[selectedDay]?.accion_cobranza?.n}
                                            onChange={(val) => handleAuditoriaChange(row.id, selectedDay, 'accion_cobranza', 'n', val)}
                                            colorClass="text-red-600 focus:ring-red-500"
                                        />
                                    </Td>

                                    {/* Llamadas Venta: E, P, N */}
                                    <Td className="bg-orange-50/20 border-l border-orange-100 p-0 text-center">
                                        <TableCheckbox
                                            checked={row.auditoria[selectedDay]?.llamadas_venta?.e}
                                            onChange={(val) => handleAuditoriaChange(row.id, selectedDay, 'llamadas_venta', 'e', val)}
                                            colorClass="text-orange-600 focus:ring-orange-500"
                                        />
                                    </Td>
                                    <Td className="bg-orange-50/20 p-0 text-center">
                                        <TableCheckbox
                                            checked={row.auditoria[selectedDay]?.llamadas_venta?.p}
                                            onChange={(val) => handleAuditoriaChange(row.id, selectedDay, 'llamadas_venta', 'p', val)}
                                            colorClass="text-orange-600 focus:ring-orange-500"
                                        />
                                    </Td>
                                    <Td className="bg-orange-50/20 border-r border-orange-100 p-0 text-center">
                                        <TableCheckbox
                                            checked={row.auditoria[selectedDay]?.llamadas_venta?.n}
                                            onChange={(val) => handleAuditoriaChange(row.id, selectedDay, 'llamadas_venta', 'n', val)}
                                            colorClass="text-red-600 focus:ring-red-500"
                                        />
                                    </Td>

                                    {/* Llamadas Cobranza: E, P, N */}
                                    <Td className="bg-orange-50/20 p-0 text-center">
                                        <TableCheckbox
                                            checked={row.auditoria[selectedDay]?.llamadas_cobranza?.e}
                                            onChange={(val) => handleAuditoriaChange(row.id, selectedDay, 'llamadas_cobranza', 'e', val)}
                                            colorClass="text-orange-600 focus:ring-orange-500"
                                        />
                                    </Td>
                                    <Td className="bg-orange-50/20 p-0 text-center">
                                        <TableCheckbox
                                            checked={row.auditoria[selectedDay]?.llamadas_cobranza?.p}
                                            onChange={(val) => handleAuditoriaChange(row.id, selectedDay, 'llamadas_cobranza', 'p', val)}
                                            colorClass="text-orange-600 focus:ring-orange-500"
                                        />
                                    </Td>
                                    <Td className="bg-orange-50/20 border-r border-orange-100 p-0 text-center">
                                        <TableCheckbox
                                            checked={row.auditoria[selectedDay]?.llamadas_cobranza?.n}
                                            onChange={(val) => handleAuditoriaChange(row.id, selectedDay, 'llamadas_cobranza', 'n', val)}
                                            colorClass="text-red-600 focus:ring-red-500"
                                        />
                                    </Td>



                                    {/* --- VISITAS ASESOR --- */}
                                    <Td className="text-center text-xs whitespace-nowrap">✅</Td>
                                    <Td className="text-xs text-center">Viene de alla</Td>
                                    <Td className="text-right text-xs whitespace-nowrap">Viene de alla</Td>
                                    <Td className="text-center text-xs">Viene de alla</Td>
                                    {/* <Td className="p-1 bg-yellow-50/10">
                                        <EditableCell
                                            value={row.auditoria[selectedDay]?.visitas_asesor?.pla}
                                            onChange={(val) => handleAuditoriaChange(row.id, selectedDay, 'visitas_asesor', 'pla', val)}
                                            placeholder="PLA"
                                        />
                                    </Td>
                                    <Td className="p-1 bg-yellow-50/10">
                                        <EditableCell
                                            value={row.auditoria[selectedDay]?.visitas_asesor?.accion}
                                            onChange={(val) => handleAuditoriaChange(row.id, selectedDay, 'visitas_asesor', 'accion', val)}
                                            placeholder="Acción"
                                        />
                                    </Td>
                                    <Td className="p-1 bg-yellow-50/10">
                                        <EditableCell
                                            value={row.auditoria[selectedDay]?.visitas_asesor?.dif_coordenada}
                                            onChange={(val) => handleAuditoriaChange(row.id, selectedDay, 'visitas_asesor', 'dif_coordenada', val)}
                                            placeholder="Dif..."
                                        />
                                    </Td>
                                    <Td className="p-1 bg-yellow-50/10">
                                        <EditableCell
                                            value={row.auditoria[selectedDay]?.visitas_asesor?.obs_vendedor}
                                            onChange={(val) => handleAuditoriaChange(row.id, selectedDay, 'visitas_asesor', 'obs_vendedor', val)}
                                            placeholder="Obs Vend."
                                        />
                                    </Td> */}

                                    {/* <Td stickyRight className="bg-white dark:bg-[#191919] border-l shadow-[-4px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                        <div className="flex justify-center">
                                            <button
                                                onClick={() => handleSave(row)}
                                                className="p-2 text-white bg-[#1a9888] hover:bg-[#137a6d] rounded-lg transition shadow-sm"
                                            >
                                                <Save size={16} />
                                            </button>
                                        </div>
                                    </Td> */}
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