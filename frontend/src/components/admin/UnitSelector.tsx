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
        `Are you sure you want to delete unit "${unit}"? Items will be reset to "pc".`
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
        className="w-full flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2 bg-white text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
      >
        <span className="text-gray-900 truncate">{value || "Select Unit"}</span>
        <ChevronDown size={14} className="text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-100 z-50 max-h-48 overflow-y-auto w-48 custom-scrollbar">
          <div className="py-1">
            {units.map((unit) => (
              <div
                key={unit}
                className={`group flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer ${
                  value === unit
                    ? "bg-purple-50 text-purple-700 font-medium"
                    : "text-gray-700"
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
                    className="flex items-center gap-1 w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full text-xs px-1 py-0.5 border border-purple-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit(unit);
                        if (e.key === "Escape") setEditingUnit(null);
                      }}
                    />
                    <button
                      onClick={() => handleSaveEdit(unit)}
                      className="p-1 text-green-600 hover:bg-green-100 rounded"
                    >
                      <Check size={12} />
                    </button>
                    <button
                      onClick={() => setEditingUnit(null)}
                      className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="truncate flex-1">{unit}</span>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(activeMenu === unit ? null : unit);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      >
                        <MoreHorizontal size={14} />
                      </button>
                      {activeMenu === unit && (
                        <div className="absolute right-0 top-full mt-1 bg-white rounded-md shadow-lg border border-gray-100 py-1 w-24 z-50">
                          <button
                            onClick={(e) => handleEditClick(unit, e)}
                            className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Edit2 size={10} /> Edit
                          </button>
                          <button
                            onClick={(e) => handleDeleteClick(unit, e)}
                            className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 size={10} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}

            <div
              className="border-t border-gray-100 mt-1 pt-1 px-3 py-2 text-blue-600 hover:bg-blue-50 cursor-pointer text-xs font-medium flex items-center gap-2"
              onClick={() => {
                onChange("custom");
                setIsOpen(false);
              }}
            >
              <Plus size={12} /> Add Custom Unit...
            </div>
          </div>
        </div>
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
