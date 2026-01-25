import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  MoreHorizontal,
  Edit2,
  Trash2,
  Check,
  Plus,
} from "lucide-react";

interface UnitSelectorProps {
  value: string;
  onChange: (value: string) => void;
  units: string[];
  onEditUnit: (oldUnit: string, newUnit: string) => void;
  onDeleteUnit: (unit: string) => void;
}

const UnitSelector: React.FC<UnitSelectorProps> = ({
  value,
  onChange,
  units,
  onEditUnit,
  onDeleteUnit,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setActiveMenu(null);
        setEditingUnit(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleEditClick = (unit: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingUnit(unit);
    setEditValue(unit);
    setActiveMenu(null);
  };

  const handleSaveEdit = (oldUnit: string) => {
    if (editValue.trim() && editValue !== oldUnit) {
      onEditUnit(oldUnit, editValue.trim());
    }
    setEditingUnit(null);
  };

  const handleDeleteClick = (unit: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      confirm(
        `Are you sure you want to delete unit "${unit}"? Items will be reset to "pc".`,
      )
    ) {
      onDeleteUnit(unit);
      if (value === unit) {
        onChange("pc");
      }
    }
    setActiveMenu(null);
  };

  const isCustomValue = !units.includes(value) && value !== "custom";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 bg-gray-50/50 border rounded-2xl text-sm transition-all duration-300 group ${
          isOpen
            ? "border-orange-200 ring-4 ring-orange-500/5 bg-white shadow-inner"
            : "border-gray-100 hover:border-orange-100 hover:bg-gray-50"
        }`}
      >
        <span
          className={`truncate text-[13px] font-semibold ${value ? "text-gray-900" : "text-gray-400"}`}
        >
          {value || "Select"}
        </span>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform duration-500 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[1001]"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-[-2px] left-[-2px] right-[-2px] p-1 bg-white border border-orange-200 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[1002] animate-in fade-in zoom-in-95 duration-300 origin-top overflow-hidden">
            <div className="max-h-[160px] overflow-y-auto no-scrollbar py-0.5">
              {units.map((unit) => (
                <div
                  key={unit}
                  className={`group flex items-center justify-between px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer relative overflow-hidden ${
                    value === unit
                      ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-200/50"
                      : "text-gray-600 hover:bg-orange-50/50 hover:text-orange-600"
                  }`}
                  onClick={() => {
                    if (editingUnit !== unit) {
                      onChange(unit);
                      setIsOpen(false);
                    }
                  }}
                >
                  {editingUnit === unit ? (
                    <div
                      className="flex items-center gap-1 w-full relative z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full text-[11px] font-bold px-2 py-1 bg-white/20 border border-white/30 rounded-lg text-white placeholder:text-white/50 outline-none focus:ring-2 focus:ring-white/50"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit(unit);
                          if (e.key === "Escape") setEditingUnit(null);
                        }}
                      />
                      <button
                        onClick={() => handleSaveEdit(unit)}
                        className="p-1 text-white hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2.5 truncate">
                        <div
                          className={`w-1.5 h-1.5 rounded-full transition-transform duration-500 ${
                            value === unit
                              ? "bg-white"
                              : "bg-gray-200 group-hover:bg-orange-400 group-hover:scale-150"
                          }`}
                        />
                        <span className="text-[11px] font-bold uppercase tracking-widest truncate">
                          {unit}
                        </span>
                      </div>

                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenu(activeMenu === unit ? null : unit);
                          }}
                          className={`p-1 rounded-lg transition-all ${
                            value === unit
                              ? "text-white/70 hover:text-white hover:bg-white/10"
                              : "text-gray-300 hover:text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          <MoreHorizontal size={14} />
                        </button>

                        {activeMenu === unit && (
                          <>
                            <div
                              className="fixed inset-0 z-[1003]"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenu(null);
                              }}
                            />
                            <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-1 w-28 z-[1004] animate-in fade-in zoom-in-95 duration-200">
                              <button
                                onClick={(e) => handleEditClick(unit, e)}
                                className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Edit2 size={12} className="text-orange-500" />{" "}
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`Delete unit "${unit}"?`)) {
                                    onDeleteUnit(unit);
                                    if (value === unit) onChange("pc");
                                  }
                                  setActiveMenu(null);
                                }}
                                className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}

              <button
                type="button"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest text-orange-500 hover:bg-orange-50 transition-all mt-0.5"
                onClick={() => {
                  onChange("custom");
                  setIsOpen(false);
                }}
              >
                <Plus size={14} />
                <span>Custom Unit</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Helper Icon for canceling edit - defined locally to avoid import issues if not available
const X = ({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default UnitSelector;
