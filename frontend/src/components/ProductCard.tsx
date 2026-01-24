import React, { useState } from "react";
import { Product } from "../types";
import { CURRENCY } from "../constants";
import {
  Check,
  X,
  Trash2,
  Edit,
  Plus,
  MoreHorizontal,
  AlertCircle,
  Store,
} from "lucide-react";

interface ProductCardProps {
  product: Product;
  isAdmin?: boolean;
  onAddToCart?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isAdmin,
  onAddToCart,
  onEdit,
  onDelete,
}) => {
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const isAvailable = product.stock > 0;

  return (
    <div
      onClick={() => !isAdmin && isAvailable && onAddToCart?.(product)}
      className={`reveal-on-scroll reveal-fade-up bg-white p-1 md:p-1.5 rounded-xl md:rounded-2xl shadow-sm hover:shadow-lg transition-all duration-500 group relative w-full
      ${!isAdmin && isAvailable ? "cursor-pointer" : ""}
      ${
        !isAvailable && !isAdmin
          ? "opacity-60 cursor-not-allowed grayscale"
          : ""
      }
      ${isAdmin ? "hover:ring-2 hover:ring-[#4285F4] hover:ring-inset" : ""}
      `}
    >
      <div className="relative mb-2 overflow-hidden rounded-[1.2rem] md:rounded-[1.5rem] aspect-square bg-gray-50">
        {product.image && product.image !== "No Image" ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = ""; // Clear src to show placeholder if needed
              (e.target as HTMLImageElement).parentElement?.classList.add(
                "bg-gray-100"
              );
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-200 gap-2">
            <Store size={48} strokeWidth={1} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">
              No Image
            </span>
          </div>
        )}

        {/* Admin Action Menu (Horizontal Slide-out) - No Background */}
        {isAdmin && (
          <div className="absolute top-0 right-2 z-20 flex items-center transition-all duration-300">
            <div
              className={`flex items-center transition-all duration-500 overflow-hidden ${
                showAdminMenu
                  ? "max-w-[100px] opacity-100"
                  : "max-w-0 opacity-0"
              }`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(product);
                  setShowAdminMenu(false);
                }}
                className="p-1 text-[#4285F4] hover:scale-110 active:scale-95 transition-all duration-200"
                title="Edit Item"
              >
                <Edit size={14} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(product.id);
                  setShowAdminMenu(false);
                }}
                className="p-1 text-[#EA4335] hover:scale-110 active:scale-95 transition-all duration-200"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAdminMenu(!showAdminMenu);
              }}
              className={`p-1 text-gray-400 hover:text-gray-600 transition-all duration-300 ${
                showAdminMenu ? "rotate-90 text-gray-700" : ""
              }`}
              title="Actions"
            >
              <MoreHorizontal size={16} />
            </button>
          </div>
        )}

        {/* Status Pill */}
        <div className="absolute bottom-1.5 left-1.5 z-[1] flex flex-col gap-1">
          <div
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[8px] md:text-[10px] font-bold shadow-sm bg-white border border-gray-100/50 text-gray-600 backdrop-blur-sm transition-all duration-300`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                !isAvailable
                  ? "bg-[#EA4335]"
                  : isAdmin &&
                    product.lowStockThreshold !== undefined &&
                    product.stock <= product.lowStockThreshold
                  ? "bg-[#F97316]"
                  : "bg-[#34A853]"
              }`}
            />
            {!isAvailable
              ? "Out of Stock"
              : isAdmin &&
                product.lowStockThreshold !== undefined &&
                product.stock <= product.lowStockThreshold
              ? "Low Stock"
              : "In Stock"}
          </div>
        </div>
      </div>

      <div className="px-1 md:px-1 pe-0.5 pb-1 flex-grow flex flex-col">
        <h3 className="font-normal text-gray-800 text-[10px] md:text-[12px] leading-tight line-clamp-2 h-[1.5rem] md:h-[1.8rem]">
          {product.name}
        </h3>

        <div className="mt-1 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="text-[14px] md:text-[16px] font-bold text-gray-900 flex items-baseline leading-none">
              <span className="text-[9px] md:text-[11px] font-normal mr-0.5">
                {CURRENCY}
              </span>
              {product.price}
            </div>
          </div>

          {!isAdmin && isAvailable && (
            <button className="w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 group-hover:bg-[#4285F4] group-hover:text-white transition-all duration-300 shadow-sm">
              <Plus className="w-4 h-4 md:w-4.5 md:h-4.5" />
            </button>
          )}

          {isAdmin && (
            <div className="text-[9px] md:text-[11px] font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg">
              Qty: {product.stock}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
