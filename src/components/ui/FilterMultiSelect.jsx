import React, { useState } from "react";
import { Filter, ChevronDown, CheckSquare, Square } from "lucide-react";

export const FilterMultiSelect = ({ label, options, selected, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleOption = (val) => {
        if (selected.includes(val)) {
            onChange(selected.filter((item) => item !== val));
        } else {
            onChange([...selected, val]);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-all shadow-sm ${selected.length > 0
                    ? "bg-teal-50 border-[#1a9888] text-[#1a9888] ring-1 ring-[#1a9888] dark:bg-teal-900/20 dark:border-teal-800"
                    : "bg-white border-gray-300 text-gray-700 dark:bg-[#262626] dark:border-gray-600 dark:text-gray-300"
                    }`}
            >
                <Filter size={16} />
                <span>{label}</span>
                {selected.length > 0 && (
                    <span className="bg-[#1a9888] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        {selected.length}
                    </span>
                )}
                <ChevronDown size={14} className="ml-1 opacity-50" />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute z-50 mt-2 w-80 bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-200 left-0">
                        <div className="text-[10px] font-black text-slate-400 mb-2 px-3 pt-2 uppercase tracking-[0.2em]">
                            Seleccionar {label}
                        </div>
                        <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar p-1">
                            {options.map((opt) => {
                                const isSelected = selected.includes(opt);
                                return (
                                    <div
                                        key={opt}
                                        onClick={() => toggleOption(opt)}
                                        className={`flex items-start gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm transition-all duration-300 ${isSelected
                                            ? "bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 font-bold"
                                            : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"
                                            }`}
                                    >
                                        <div
                                            className={`w-5 h-5 min-w-[1.25rem] border-2 rounded-md flex items-center justify-center transition-all duration-300 mt-0.5 ${isSelected
                                                ? "bg-[#1a9888] border-[#1a9888] shadow-lg shadow-teal-500/20"
                                                : "border-slate-300 dark:border-slate-600"
                                                }`}
                                        >
                                            {isSelected ? (
                                                <CheckSquare size={14} className="text-white" />
                                            ) : null}
                                        </div>
                                        <span className="leading-snug break-words">{opt}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
