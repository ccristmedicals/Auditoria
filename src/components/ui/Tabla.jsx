// 1. Contenedor Principal
export const TableContainer = ({ children, className = "" }) => (
    <div className={`bg-white dark:bg-[#464646] rounded-lg shadow-md border border-gray-200 dark:border-[#464646] flex flex-col relative pb-0 ${className}`}>
        {/* ✅ pb-0 agregado arriba para quitar el padding inferior */}
        <div className="overflow-auto w-full max-h-[72vh]">
            {children}
        </div>
    </div>
);

// 2. La Tabla en sí
export const Table = ({ children, className = "" }) => (
    <table className={`min-w-full table-fixed divide-y divide-gray-200 dark:divide-[#464646] ${className}`}>
        {children}
    </table>
);

// 3. Encabezado (Thead)
export const Thead = ({ children, className = "" }) => (
    <thead className={`bg-gray-50 dark:bg-[#262626] ${className}`}>
        {children}
    </thead>
);

// 4. Cuerpo (Tbody)
export const Tbody = ({ children, className = "" }) => (
    <tbody className={`bg-white dark:bg-[#262626] divide-y divide-gray-200 dark:divide-[#464646] ${className}`}>
        {children}
    </tbody>
);

// 5. Fila (Tr)
export const Tr = ({ children, className = "", onClick }) => (
    <tr
        onClick={onClick}
        className={`hover:bg-gray-50 dark:hover:bg-[#131313] transition-colors ${className}`}
    >
        {children}
    </tr>
);

// 6. Celda de Encabezado (Th)
export const Th = ({
    children,
    stickyLeft = false,
    stickyTop = true,
    align = "center",
    className = "",
    ...props
}) => {
    const alignClass = align === "left" ? "text-left" : align === "right" ? "text-right" : "text-center";

    let stickyClasses = "";
    let zIndex = "";

    if (stickyLeft && stickyTop) {
        stickyClasses = "sticky left-0 top-0 border-r border-gray-200 dark:border-[#464646]";
        zIndex = "z-30";
    } else if (stickyTop) {
        stickyClasses = "sticky top-0";
        zIndex = "z-20";
    } else if (stickyLeft) {
        stickyClasses = "sticky left-0 border-r border-gray-200 dark:border-[#464646]";
        zIndex = "z-20";
    }

    const defaultBg = "bg-gray-50 dark:bg-[#262626]";
    const hasBgClass = className.includes("bg-");
    const bgClass = (stickyLeft || stickyTop) && !hasBgClass ? defaultBg : "";

    return (
        <th
            className={`px-6 py-3 text-xs font-bold text-gray-500 dark:text-white uppercase tracking-wider ${alignClass} ${stickyClasses} ${zIndex} ${bgClass} ${className}`}
            {...props}
        >
            {children}
        </th>
    );
};

// 7. Celda de Datos (Td)
export const Td = ({
    children,
    stickyLeft = false,
    align = "center",
    className = "",
    ...props
}) => {
    const alignClass = align === "left" ? "text-left" : align === "right" ? "text-right" : "text-center";

    let stickyClasses = "";
    let zIndex = "";
    let textColors = "text-gray-500 dark:text-gray-300"; // ✅ Color por defecto (Gris en claro, Blanco hueso en oscuro)

    if (stickyLeft) {
        stickyClasses = "sticky left-0 border-r border-gray-200 dark:border-[#464646]";
        zIndex = "z-10";
        textColors = "font-medium text-gray-900 dark:text-white"; // ✅ Color destacado para columnas fijas
    }

    const defaultBg = "bg-white dark:bg-[#262626]";
    const hasBgClass = className.includes("bg-");
    const bgClass = stickyLeft && !hasBgClass ? defaultBg : "";

    return (
        <td
            className={`px-6 py-4 text-sm whitespace-nowrap ${alignClass} ${textColors} ${stickyClasses} ${zIndex} ${bgClass} ${className}`}
            {...props}
        >
            {children}
        </td>
    );
};

// 8. Input Editable Estándar
export const TableInput = ({ value, onChange, type = "text", className = "" }) => (
    <input
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full min-w-[80px] p-1 text-sm bg-gray-50 dark:bg-[#333] border border-gray-300 dark:border-[#555] rounded dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 text-center ${className}`}
    />
);