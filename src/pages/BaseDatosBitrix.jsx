import { useBaseDatosBitrix } from "../hooks/useBaseDatosBitrix";
import {
    TableContainer,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
} from "../components/ui/Tabla";
import {
    RefreshCw,
    Database,
    MapPin,
    AlertTriangle,
    Calendar,
    Building2,
    Edit3
} from "lucide-react";

const BaseDatosBitrix = () => {
    const { companies, loading, handleCompanyChange } = useBaseDatosBitrix();

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(amount || 0);
    };

    const ErrorAwareCell = ({ value, isError, icon = false }) => {
        if (isError) {
            return (
                <div className="flex items-center gap-1.5 text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-2 py-1 rounded-md w-fit">
                    <AlertTriangle size={14} />
                    <span className="font-bold text-xs">{value || "VACÍO"}</span>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-2">
                {icon && <span className="text-gray-400">{icon}</span>}
                <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>
            </div>
        );
    };

    // --- Componente Input Editable ---
    const EditableCell = ({ value, onChange, placeholder = "..." }) => (
        <div className="relative group">
            <input
                type="text"
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full min-w-[100px] bg-transparent border-b border-transparent hover:border-gray-300 focus:border-[#1a9888] focus:bg-white dark:focus:bg-[#333] px-1 py-1 text-sm outline-none transition-all placeholder-gray-300 dark:placeholder-gray-600 dark:text-gray-200"
            />
            <Edit3 size={10} className="absolute right-1 top-2 text-gray-300 opacity-0 group-hover:opacity-100 pointer-events-none" />
        </div>
    );

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-white dark:bg-[#191919]">
                <div className="text-[#1a9888] flex flex-col items-center">
                    <RefreshCw className="animate-spin w-10 h-10 mb-3" />
                    <span className="font-semibold text-lg">Cargando Base de Datos...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-white dark:bg-[#191919]">

            {/* Header de la Pantalla */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg text-[#1a9888]">
                        <Database size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-[#191919] dark:text-white">
                            Auditoría de Clientes
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Bitrix24 vs Profit Plus + Gestión Semanal
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 text-sm">
                    <div className="px-3 py-1 bg-red-50 text-red-600 rounded-full border border-red-100 dark:bg-red-900/20 dark:border-red-800 flex items-center gap-2">
                        <AlertTriangle size={14} />
                        <span>Errores: <strong>{companies.filter(c => !c.codigo_profit || c.codigo_profit === "0" || !c.coordenadas || c.coordenadas === "0").length}</strong></span>
                    </div>
                    <div className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                        Total: <strong>{companies.length}</strong>
                    </div>
                </div>
            </div>

            <TableContainer>
                <Table>
                    <Thead>
                        {/* --- SUPER HEADER (Agrupaciones por color) --- */}
                        <Tr className="bg-gray-50 dark:bg-[#1e1e1e] !border-b-0">
                            <Th colSpan={2} stickyLeft stickyTop className="border-b border-r border-gray-200 dark:border-[#333] text-[#1a9888]">ID</Th>
                            <Th colSpan={6} className="border-b border-r border-gray-200 dark:border-[#333] text-blue-600">Bitrix</Th>
                            <Th colSpan={8} className="border-b border-r border-gray-200 dark:border-[#333] text-orange-600">Profit</Th>
                            <Th colSpan={2} className="border-b border-r border-gray-200 dark:border-[#333] text-purple-600">Ventas</Th>

                            {/* SECCIÓN DE GESTIÓN */}
                            <Th colSpan={2} className="border-b border-r border-gray-200 dark:border-[#333] text-gray-600 font-bold bg-gray-100 dark:bg-gray-800">GENERAL</Th>
                            <Th colSpan={2} className="border-b border-r border-gray-200 dark:border-[#333] text-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10">LUNES</Th>
                            <Th colSpan={2} className="border-b border-r border-gray-200 dark:border-[#333] text-indigo-600">MARTES</Th>
                            <Th colSpan={2} className="border-b border-r border-gray-200 dark:border-[#333] text-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10">MIÉRCOLES</Th>
                            <Th colSpan={2} className="border-b border-r border-gray-200 dark:border-[#333] text-indigo-600">JUEVES</Th>
                            <Th colSpan={2} className="border-b border-gray-200 dark:border-[#333] text-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10">VIERNES</Th>
                        </Tr>

                        {/* --- COLUMN HEADERS --- */}
                        <Tr>
                            {/* Identificación */}
                            <Th stickyLeft className="min-w-[60px] bg-white dark:bg-[#191919]">ID</Th>
                            <Th stickyLeft className="min-w-[200px] text-left bg-white dark:bg-[#191919] shadow-[4px_0_5px_-2px_rgba(0,0,0,0.1)]">Nombre</Th>

                            {/* Bitrix */}
                            <Th className="min-w-[120px]">Cód. Profit</Th>
                            <Th className="min-w-[140px]">Ciudad</Th>
                            <Th className="min-w-[140px]">Segmento</Th>
                            <Th className="min-w-[160px]">Coordenadas</Th>
                            <Th className="min-w-[150px]">Días Visita</Th>
                            <Th className="min-w-[100px]">Convenio</Th>

                            {/* Profit */}
                            <Th className="min-w-[110px]">Límite</Th>
                            <Th className="min-w-[110px]">Tránsito</Th>
                            <Th className="min-w-[110px]">Vencido</Th>
                            <Th className="min-w-[100px]">F. Compra</Th>
                            <Th className="min-w-[130px]">F. Morosidad</Th>
                            <Th className="min-w-[110px]">Últ. Cobro</Th>
                            <Th className="min-w-[70px]">SKU</Th>
                            <Th className="min-w-[70px]">Clasif.</Th>

                            {/* Ventas */}
                            <Th className="min-w-[110px]">Actual</Th>
                            <Th className="min-w-[110px]">Anterior</Th>

                            {/* GESTIÓN GENERAL */}
                            <Th className="min-w-[160px] bg-gray-50/50 dark:bg-gray-800">Bitácora</Th>
                            <Th className="min-w-[160px] bg-gray-50/50 dark:bg-gray-800">Obs. Ejec.</Th>

                            {/* LUNES */}
                            <Th className="min-w-[140px] bg-indigo-50/30 dark:bg-indigo-900/20">Acción</Th>
                            <Th className="min-w-[140px] bg-indigo-50/30 dark:bg-indigo-900/20">Ejecución</Th>
                            {/* MARTES */}
                            <Th className="min-w-[140px]">Acción</Th>
                            <Th className="min-w-[140px]">Ejecución</Th>
                            {/* MIÉRCOLES */}
                            <Th className="min-w-[140px] bg-indigo-50/30 dark:bg-indigo-900/20">Acción</Th>
                            <Th className="min-w-[140px] bg-indigo-50/30 dark:bg-indigo-900/20">Ejecución</Th>
                            {/* JUEVES */}
                            <Th className="min-w-[140px]">Acción</Th>
                            <Th className="min-w-[140px]">Ejecución</Th>
                            {/* VIERNES */}
                            <Th className="min-w-[140px] bg-indigo-50/30 dark:bg-indigo-900/20">Acción</Th>
                            <Th className="min-w-[140px] bg-indigo-50/30 dark:bg-indigo-900/20">Ejecución</Th>
                        </Tr>
                    </Thead>

                    <Tbody>
                        {companies.map((row) => (
                            <Tr key={row.id_interno}>
                                {/* ID & Nombre */}
                                <Td stickyLeft className="bg-gray-50 dark:bg-[#202020] text-xs font-mono">{row.id}</Td>
                                <Td stickyLeft className="text-left font-semibold bg-white dark:bg-[#191919] border-r shadow-[4px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                    <div className="flex items-center gap-2 truncate max-w-[200px]" title={row.nombre}>
                                        <Building2 size={14} className="text-gray-400 min-w-[14px]" />
                                        {row.nombre}
                                    </div>
                                </Td>

                                {/* Bitrix Data */}
                                <Td><ErrorAwareCell value={row.codigo_profit} isError={!row.codigo_profit || row.codigo_profit === "0"} /></Td>
                                <Td>{row.ciudad}</Td>
                                <Td><span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full dark:bg-blue-900/30 dark:text-blue-200">{row.segmento}</span></Td>
                                <Td><ErrorAwareCell value={row.coordenadas} isError={!row.coordenadas || row.coordenadas === "0"} icon={<MapPin size={12} />} /></Td>
                                <Td className="text-xs truncate max-w-[140px]" title={row.dias_visita}>{row.dias_visita || "-"}</Td>
                                <Td>{row.convenio}</Td>

                                {/* Profit Data */}
                                <Td align="right" className="font-mono text-xs">{row.limite_credito}</Td>
                                <Td align="right" className="font-mono text-xs">{formatCurrency(row.saldo_transito)}</Td>
                                <Td align="right" className={`font-mono text-xs font-bold ${row.saldo_vencido > 0 ? "text-red-600" : "text-green-600"}`}>{formatCurrency(row.saldo_vencido)}</Td>
                                <Td className="text-xs">{row.fecha_compra}</Td>
                                <Td className="text-xs text-red-500 truncate max-w-[120px]" title={row.factura_morosidad}>{row.factura_morosidad}</Td>
                                <Td align="right" className="font-mono text-xs">{formatCurrency(row.ultimo_cobro)}</Td>
                                <Td>{row.sku_mes}</Td>
                                <Td className="font-bold text-center">{row.clasificacion}</Td>

                                {/* Ventas */}
                                <Td align="right" className="font-mono text-xs text-blue-600 bg-gray-50 dark:bg-[#202020]">{formatCurrency(row.ventas_actual)}</Td>
                                <Td align="right" className="font-mono text-xs text-gray-500 bg-gray-50 dark:bg-[#202020]">{formatCurrency(row.ventas_anterior)}</Td>

                                {/* --- GESTIÓN MANUAL (EDITABLE) --- */}
                                <Td className="bg-gray-50/30 dark:bg-gray-800/30 border-l border-gray-200 dark:border-[#333]">
                                    <EditableCell value={row.bitacora} onChange={(val) => handleCompanyChange(row.id_interno, 'bitacora', val)} placeholder="Bitácora..." />
                                </Td>
                                <Td className="bg-gray-50/30 dark:bg-gray-800/30 border-r border-gray-200 dark:border-[#333]">
                                    <EditableCell value={row.obs_ejecutiva} onChange={(val) => handleCompanyChange(row.id_interno, 'obs_ejecutiva', val)} placeholder="Obs..." />
                                </Td>

                                {/* LUNES */}
                                <Td className="bg-indigo-50/20 dark:bg-indigo-900/10"><EditableCell value={row.lunes_accion} onChange={(val) => handleCompanyChange(row.id_interno, 'lunes_accion', val)} /></Td>
                                <Td className="bg-indigo-50/20 dark:bg-indigo-900/10 border-r border-gray-200 dark:border-[#333]"><EditableCell value={row.lunes_ejecucion} onChange={(val) => handleCompanyChange(row.id_interno, 'lunes_ejecucion', val)} /></Td>
                                {/* MARTES */}
                                <Td><EditableCell value={row.martes_accion} onChange={(val) => handleCompanyChange(row.id_interno, 'martes_accion', val)} /></Td>
                                <Td className="border-r border-gray-200 dark:border-[#333]"><EditableCell value={row.martes_ejecucion} onChange={(val) => handleCompanyChange(row.id_interno, 'martes_ejecucion', val)} /></Td>
                                {/* MIÉRCOLES */}
                                <Td className="bg-indigo-50/20 dark:bg-indigo-900/10"><EditableCell value={row.miercoles_accion} onChange={(val) => handleCompanyChange(row.id_interno, 'miercoles_accion', val)} /></Td>
                                <Td className="bg-indigo-50/20 dark:bg-indigo-900/10 border-r border-gray-200 dark:border-[#333]"><EditableCell value={row.miercoles_ejecucion} onChange={(val) => handleCompanyChange(row.id_interno, 'miercoles_ejecucion', val)} /></Td>
                                {/* JUEVES */}
                                <Td><EditableCell value={row.jueves_accion} onChange={(val) => handleCompanyChange(row.id_interno, 'jueves_accion', val)} /></Td>
                                <Td className="border-r border-gray-200 dark:border-[#333]"><EditableCell value={row.jueves_ejecucion} onChange={(val) => handleCompanyChange(row.id_interno, 'jueves_ejecucion', val)} /></Td>
                                {/* VIERNES */}
                                <Td className="bg-indigo-50/20 dark:bg-indigo-900/10"><EditableCell value={row.viernes_accion} onChange={(val) => handleCompanyChange(row.id_interno, 'viernes_accion', val)} /></Td>
                                <Td className="bg-indigo-50/20 dark:bg-indigo-900/10"><EditableCell value={row.viernes_ejecucion} onChange={(val) => handleCompanyChange(row.id_interno, 'viernes_ejecucion', val)} /></Td>

                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default BaseDatosBitrix;