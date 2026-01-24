import React from "react";
import {
  X,
  AlertTriangle,
  ArrowRight,
  Bell,
  PackageSearch,
  MoreHorizontal,
} from "lucide-react";
import { Product } from "../../types";

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  lowStockProducts: Product[];
  onViewProduct: (productId: string) => void;
  onSeeAll?: () => void;
  isDropdown?: boolean;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  isOpen,
  onClose,
  lowStockProducts,
  onViewProduct,
  onSeeAll,
  isDropdown = false,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (!isOpen) return null;

  // Mock "Previous" notifications for demonstration
  const pastNotifications = [
    {
      id: "past-1",
      name: "Fresh Milk",
      type: "refill",
      msg: "Stock refilled to 50 units",
      time: "2h ago",
    },
    {
      id: "past-2",
      name: "Coke Zero",
      type: "price",
      msg: "Price updated to ₱35.00",
      time: "5h ago",
    },
    {
      id: "past-3",
      name: "Gardenia Bread",
      type: "refill",
      msg: "Stock refilled to 20 units",
      time: "Yesterday",
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[2000] animate-in fade-in duration-300 ${
          isDropdown ? "bg-transparent" : "bg-slate-900/10 backdrop-blur-[2px]"
        }`}
        onClick={() => {
          setIsExpanded(false);
          onClose();
        }}
      />

      {/* Admin Card Modal / Dropdown */}
      <div
        className={`
        ${
          isDropdown
            ? `absolute top-full mt-3 left-0 w-[320px] origin-top-left`
            : `fixed top-20 right-6 w-[calc(100vw-3rem)] sm:w-[320px] origin-top-right`
        } 
        bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100/50 z-[2001] overflow-visible animate-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
      `}
      >
        {/* Visual Caret for Dropdown */}
        {isDropdown && (
          <div className="absolute -top-1.5 left-3 w-4 h-4 bg-white border-l border-t border-gray-100/50 rotate-45 z-[0] shadow-[-2px_-2px_5px_rgba(0,0,0,0.02)]" />
        )}

        <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm z-10 transition-all duration-500">
          {/* Header */}
          <div className="px-4 py-3.5 flex items-center justify-between border-b border-gray-50 bg-white/95 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-2.5">
              {isExpanded ? (
                <button
                  onClick={() => setIsExpanded(false)}
                  className="w-8 h-8 bg-gray-50 text-gray-500 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-all active:scale-90"
                >
                  <ArrowRight size={16} className="rotate-180" />
                </button>
              ) : (
                <div className="w-8 h-8 bg-blue-50 text-[#4285F4] rounded-xl flex items-center justify-center font-bold shadow-sm">
                  <Bell size={16} />
                </div>
              )}
              <div>
                <h2 className="text-sm font-bold text-gray-800 leading-none">
                  {isExpanded ? "All Notifications" : "Notifications"}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 transition-all hover:text-gray-600 active:scale-90">
                <MoreHorizontal size={14} />
              </button>
              <button
                onClick={() => {
                  setIsExpanded(false);
                  onClose();
                }}
                className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 transition-all hover:text-red-500 active:scale-90"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          <div
            className={`${
              isExpanded ? "max-h-[480px]" : "max-h-[380px]"
            } overflow-y-auto no-scrollbar py-1.5 transition-all duration-500`}
          >
            {/* New Alerts Section */}
            <div className="px-2">
              {!isExpanded && (
                <div className="px-2 py-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    New
                  </span>
                </div>
              )}

              {lowStockProducts.length === 0 ? (
                <div className="py-12 text-center px-6 group">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto mb-3">
                    <PackageSearch size={24} />
                  </div>
                  <p className="text-[10px] text-gray-300 font-bold uppercase">
                    Healthy Inventory
                  </p>
                </div>
              ) : (
                lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="p-2.5 mb-1 last:mb-0 rounded-xl hover:bg-gray-50 cursor-pointer transition-all group flex items-center gap-3 relative active:scale-[0.98]"
                    onClick={() => onViewProduct(product.id || "")}
                  >
                    <div className="relative flex-shrink-0 transition-transform group-hover:scale-105 duration-300">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center text-gray-400 font-bold text-[10px] border border-gray-100 shadow-sm">
                          {product.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm text-white">
                        <AlertTriangle size={8} />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-[13px] font-bold text-gray-900 truncate tracking-tight">
                          {product.name}
                        </h4>
                        <span className="text-[9px] text-gray-300 font-bold whitespace-nowrap ml-2 uppercase">
                          Now
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-orange-600 font-bold px-1.5 py-0.5 bg-orange-50 rounded-md border border-orange-100/50">
                          {product.stock} left
                        </span>
                        <span className="text-[11px] text-gray-500 truncate font-semibold tracking-tight">
                          {product.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* History Section (Visible in expanded mode or with items) */}
            {isExpanded && (
              <div className="mt-4 px-2 animate-in slide-in-from-bottom-4 duration-500">
                <div className="px-2 py-2 border-t border-gray-50 mt-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Earlier
                  </span>
                </div>
                {pastNotifications.map((past) => (
                  <div
                    key={past.id}
                    className="p-3 mb-1 rounded-xl hover:bg-gray-50 cursor-default flex items-center gap-3 active:scale-[0.99] transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300">
                      <PackageSearch size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="text-[12px] font-bold text-gray-600 truncate">
                          {past.name}
                        </h4>
                        <span className="text-[9px] text-gray-400 font-medium">
                          {past.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 font-medium">
                        {past.msg}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {!isExpanded && (
            <div className="p-3 border-t border-gray-50 flex justify-center bg-gray-50/30 sticky bottom-0 z-20">
              <button
                onClick={() => setIsExpanded(true)}
                className="w-full text-[11px] font-bold text-[#4285F4] hover:bg-white px-4 py-2.5 rounded-xl transition-all active:scale-[0.98] border border-transparent hover:border-blue-100/50 hover:shadow-sm"
              >
                See All Notifications
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationsPanel;
