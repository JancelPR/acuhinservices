import React, { useState, useMemo, useEffect } from "react";
import { useStickyState } from "../hooks/useStickyState";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Product, ReceiptData } from "../types";
import { LogOut, Menu, BarChart3 } from "lucide-react";
import Sidebar from "./Sidebar";
import ReceiptModal from "./ReceiptModal";
import Inventory from "./admin/Inventory";
import POS from "./admin/POS";
import OrderHistory from "./admin/OrderHistory";
import Settings from "./admin/Settings";
import { STORE_NAME } from "../constants";
import { api } from "../services/api";

interface AdminPanelProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  transactions: ReceiptData[];
  setTransactions: React.Dispatch<React.SetStateAction<ReceiptData[]>>;
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  onLogout: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  products,
  setProducts,
  transactions,
  setTransactions,
  categories,
  setCategories,
  onLogout,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab from URL
  const activeTab = location.pathname.split("/").pop() || "inventory";

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isClosingSoon, setIsClosingSoon] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useStickyState(
    false,
    "notifications_unread",
  );
  const [prevLowStockCount, setPrevLowStockCount] = useStickyState(
    0,
    "prev_low_stock_count",
  );

  const handleAddCategory = async (newCategory: string) => {
    if (!categories.includes(newCategory)) {
      try {
        await api.createCategory(newCategory);
        setCategories((prev) => [...prev, newCategory]);
      } catch (error) {
        console.error("Failed to save category to database", error);
        // Fallback to local update if API fails (though ideally we want DB sync)
        setCategories((prev) => [...prev, newCategory]);
      }
    }
    setActiveCategory(newCategory);
  };

  // Notification Logic
  const lowStockProducts = useMemo(() => {
    return products.filter((p) => {
      const threshold = p.lowStockThreshold ?? 5;
      return p.stock <= threshold;
    });
  }, [products]);

  const lowStockCount = lowStockProducts.length;

  // Track if there are new unread notifications
  useEffect(() => {
    if (lowStockCount > prevLowStockCount) {
      setHasUnread(true);
    }
    setPrevLowStockCount(lowStockCount);
  }, [lowStockCount, prevLowStockCount]);

  const handleToggleNotifications = () => {
    if (!isNotificationsOpen) {
      setHasUnread(false);
    }
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  const handleViewProduct = (productId: string) => {
    navigate("/admin/inventory");
    setIsNotificationsOpen(false);
    // Future: Scroll to or search for productId
  };

  // Auto-hide logic with visual warning
  useEffect(() => {
    let warningTimer: NodeJS.Timeout;
    let collapseTimer: NodeJS.Timeout;

    if (!isSidebarCollapsed && !isSidebarHovered) {
      // Show warning at 4 seconds
      warningTimer = setTimeout(() => {
        setIsClosingSoon(true);
      }, 4000);

      // Collapse at 5 seconds
      collapseTimer = setTimeout(() => {
        setIsSidebarCollapsed(true);
        setIsClosingSoon(false);
      }, 5000);
    } else {
      setIsClosingSoon(false);
    }

    return () => {
      clearTimeout(warningTimer);
      clearTimeout(collapseTimer);
    };
  }, [isSidebarCollapsed, isSidebarHovered]);

  // Shared State
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex transition-all duration-300 selection:bg-blue-100 selection:text-blue-900">
      {/* Decorative background element for premium feel */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,_#4285F405,_transparent_40%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_bottom_left,_#10b98105,_transparent_40%)] pointer-events-none" />
      {/* Sidebar Navigation */}
      <Sidebar
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        categories={categories}
        isAdmin={true}
        currentView={activeTab as any}
        onViewChange={(view) => navigate(`/admin/${view}`)}
        onLogout={onLogout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        notificationCount={hasUnread ? lowStockCount : 0}
        onNotificationsClick={handleToggleNotifications}
        lowStockProducts={lowStockProducts}
        onViewProduct={handleViewProduct}
        onSeeAll={() => handleViewProduct("")}
        isNotificationsOpen={isNotificationsOpen}
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        isClosingSoon={isClosingSoon}
      />

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[400] bg-black/40 backdrop-blur-md md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="absolute left-0 top-0 h-full bg-white w-72 p-6 shadow-2xl z-[410]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-[#4285F4] rounded-lg"></div>
              <h2 className="text-xl font-medium text-gray-800">
                {STORE_NAME}
              </h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                  Management
                </p>
                <div className="space-y-1">
                  {[
                    { id: "pos", label: "POS" },
                    { id: "inventory", label: "Inventory" },
                    { id: "history", label: "Logs" },
                    { id: "analytics", label: "Analytics" },
                    { id: "settings", label: "Settings" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        navigate(`/admin/${tab.id}`);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        activeTab === tab.id
                          ? "bg-[#E8F0FE] text-[#1967D2]"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <button
                  onClick={onLogout}
                  className="w-full text-[#EA4335] text-sm font-medium flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-full transition-all"
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main
        className={`flex-1 transition-all duration-[2000ms] ${
          isSidebarCollapsed ? "md:ml-20" : "md:ml-48 lg:ml-64"
        } pl-1 pr-2 md:pl-2 md:pr-4 pt-2 md:pt-3 pb-0 overflow-hidden h-screen flex flex-col relative`}
      >
        <div className="flex-1 overflow-hidden flex flex-col">
          <Routes>
            <Route index element={<Navigate to="inventory" replace />} />
            <Route
              path="inventory"
              element={
                <Inventory
                  products={products}
                  setProducts={setProducts}
                  categories={categories}
                  setCategories={setCategories}
                  onAddCategory={handleAddCategory}
                  isSidebarCollapsed={isSidebarCollapsed}
                />
              }
            />
            <Route
              path="pos"
              element={
                <POS
                  products={products}
                  setProducts={setProducts}
                  categories={categories}
                  activeCategory={activeCategory}
                  onCategoryChange={setActiveCategory}
                  setTransactions={setTransactions}
                  onViewReceipt={setReceipt}
                  onMobileMenuOpen={() => setIsMobileMenuOpen(true)}
                  onLogout={onLogout}
                  isSidebarCollapsed={isSidebarCollapsed}
                />
              }
            />
            <Route
              path="history"
              element={
                <OrderHistory
                  transactions={transactions}
                  onViewReceipt={setReceipt}
                />
              }
            />
            <Route
              path="analytics"
              element={
                <div className="flex-1 flex items-center justify-center bg-white rounded-3xl m-4 border border-gray-100 shadow-sm">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mx-auto mb-4">
                      <BarChart3 size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      Analytics Dashboard
                    </h3>
                    <p className="text-gray-500">
                      Analytics and reporting features coming soon.
                    </p>
                  </div>
                </div>
              }
            />
            <Route
              path="settings"
              element={
                <Settings
                  categories={categories}
                  setCategories={setCategories}
                  products={products}
                  setProducts={setProducts}
                />
              }
            />
          </Routes>
        </div>
      </main>

      {/* Receipt Modal */}
      <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />
    </div>
  );
};

export default AdminPanel;
