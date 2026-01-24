import React from "react";
import NotificationsPanel from "./admin/NotificationsPanel";
import {
  LayoutGrid,
  Coffee,
  GlassWater,
  Sparkles,
  Store,
  Clock,
  UtensilsCrossed,
  LogOut,
  Bell,
  BellRing,
  History,
  ChevronLeft,
  Settings as SettingsIcon,
  ChevronRight,
  Apple,
  Beef,
  Beer,
  Candy,
  Carrot,
  Cookie,
  Egg,
  Fish,
  IceCream,
  Soup,
  Wheat,
  Tag,
  Monitor,
  Package,
  Baby,
  Cat,
  Dog,
  Bath,
  ClipboardList,
  BarChart3,
  Scroll,
} from "lucide-react";
import { STORE_NAME } from "../constants";

interface SidebarProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  isAdmin?: boolean;
  currentView?: "inventory" | "pos" | "history" | "analytics" | "settings";
  onViewChange?: (
    view: "inventory" | "pos" | "history" | "analytics" | "settings",
  ) => void;
  onLogout?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  notificationCount?: number;
  onNotificationsClick?: () => void;
  lowStockProducts?: any[];
  onViewProduct?: (productId: string) => void;
  onSeeAll?: () => void;
  isNotificationsOpen?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  isClosingSoon?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeCategory,
  onCategoryChange,
  categories,
  isAdmin,
  currentView,
  onViewChange,
  onLogout,
  isCollapsed = false,
  onToggleCollapse,
  notificationCount = 0,
  onNotificationsClick,
  lowStockProducts = [],
  onViewProduct,
  onSeeAll,
  isNotificationsOpen = false,
  onMouseEnter,
  onMouseLeave,
  isClosingSoon = false,
}) => {
  const getIcon = (cat: string) => {
    const iconSize = 20;
    const lowerCat = cat.toLowerCase();

    // 1. Exact Matches (Legacy & Priorities)
    if (cat === "All") return <LayoutGrid size={iconSize} />;
    if (cat === "Snacks") return <Coffee size={iconSize} />;
    if (cat === "Drinks") return <GlassWater size={iconSize} />;
    if (cat === "Toiletries") return <Sparkles size={iconSize} />;
    if (cat === "Canned Goods") return <UtensilsCrossed size={iconSize} />;

    // 2. Keyword Matches
    if (
      lowerCat.includes("drink") ||
      lowerCat.includes("water") ||
      lowerCat.includes("juice") ||
      lowerCat.includes("soda") ||
      lowerCat.includes("beverage")
    )
      return <GlassWater size={iconSize} />;
    if (
      lowerCat.includes("snack") ||
      lowerCat.includes("chip") ||
      lowerCat.includes("biscuit")
    )
      return <Coffee size={iconSize} />;
    if (
      lowerCat.includes("candy") ||
      lowerCat.includes("sweet") ||
      lowerCat.includes("chocolate")
    )
      return <Candy size={iconSize} />;
    if (
      lowerCat.includes("cookie") ||
      lowerCat.includes("pastry") ||
      lowerCat.includes("cake")
    )
      return <Cookie size={iconSize} />;
    if (
      lowerCat.includes("toiletries") ||
      lowerCat.includes("soap") ||
      lowerCat.includes("clean") ||
      lowerCat.includes("detergent")
    )
      return <Bath size={iconSize} />;
    if (
      lowerCat.includes("hygiene") ||
      lowerCat.includes("beauty") ||
      lowerCat.includes("makeup")
    )
      return <Sparkles size={iconSize} />;
    if (
      lowerCat.includes("canned") ||
      lowerCat.includes("tin") ||
      lowerCat.includes("preserve")
    )
      return <UtensilsCrossed size={iconSize} />;
    if (
      lowerCat.includes("meat") ||
      lowerCat.includes("beef") ||
      lowerCat.includes("pork") ||
      lowerCat.includes("steak")
    )
      return <Beef size={iconSize} />;
    if (lowerCat.includes("fish") || lowerCat.includes("seafood"))
      return <Fish size={iconSize} />;
    if (
      lowerCat.includes("fruit") ||
      lowerCat.includes("apple") ||
      lowerCat.includes("berry")
    )
      return <Apple size={iconSize} />;
    if (
      lowerCat.includes("veg") ||
      lowerCat.includes("carrot") ||
      lowerCat.includes("potato") ||
      lowerCat.includes("onion")
    )
      return <Carrot size={iconSize} />;
    if (
      lowerCat.includes("bakery") ||
      lowerCat.includes("bread") ||
      lowerCat.includes("flour") ||
      lowerCat.includes("grain")
    )
      return <Wheat size={iconSize} />;
    if (
      lowerCat.includes("dairy") ||
      lowerCat.includes("milk") ||
      lowerCat.includes("egg") ||
      lowerCat.includes("cheese")
    )
      return <Egg size={iconSize} />;
    if (
      lowerCat.includes("frozen") ||
      lowerCat.includes("ice") ||
      lowerCat.includes("cream")
    )
      return <IceCream size={iconSize} />;
    if (
      lowerCat.includes("soup") ||
      lowerCat.includes("noodle") ||
      lowerCat.includes("ramen")
    )
      return <Soup size={iconSize} />;
    if (
      lowerCat.includes("beer") ||
      lowerCat.includes("alcohol") ||
      lowerCat.includes("liquor")
    )
      return <Beer size={iconSize} />;
    if (
      lowerCat.includes("baby") ||
      lowerCat.includes("infant") ||
      lowerCat.includes("diaper")
    )
      return <Baby size={iconSize} />;
    if (lowerCat.includes("pet") || lowerCat.includes("dog"))
      return <Dog size={iconSize} />;
    if (lowerCat.includes("cat")) return <Cat size={iconSize} />;
    if (
      lowerCat.includes("paper") ||
      lowerCat.includes("tissue") ||
      lowerCat.includes("towel")
    )
      return <Scroll size={iconSize} />;
    if (lowerCat.includes("gift") || lowerCat.includes("card"))
      return <Tag size={iconSize} />;

    // 3. Defaults for dynamic ones
    return <Package size={iconSize} />;
  };

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`${
        isCollapsed ? "w-20 p-4" : "w-48 lg:w-64 p-4 lg:p-6"
      } bg-white h-screen fixed left-0 top-0 border-r border-gray-100 flex flex-col hidden md:flex z-[100] transition-all duration-[2000ms] shadow-sm ${
        isClosingSoon
          ? "opacity-75 scale-[0.99] grayscale-[0.2]"
          : "opacity-100 scale-100"
      }`}
    >
      <div
        className={`flex items-center ${
          isCollapsed ? "flex-col gap-3" : "justify-between gap-2 lg:gap-3"
        } mb-8 flex-shrink-0 relative`}
      >
        <div
          className={`flex items-center gap-2 lg:gap-3 ${
            isCollapsed ? "justify-center w-full" : ""
          }`}
        >
          <div className="w-8 h-8 lg:w-11 lg:h-11 bg-[#4285F4] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100 flex-shrink-0 transition-all duration-300">
            <Store className="w-4 h-4 lg:w-6 lg:h-6" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden whitespace-nowrap min-w-0 flex-1">
              <h1 className="font-bold text-gray-900 leading-tight tracking-tight text-xs lg:text-base mb-0.5">
                {STORE_NAME}
              </h1>
              <p className="text-[8px] lg:text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">
                {isAdmin ? "Admin" : "Guest"}
              </p>
            </div>
          )}
        </div>

        {/* Notification Bell Button */}
        {isAdmin && (
          <div className="relative">
            <button
              className={`text-gray-400 hover:text-[#4285F4] transition-all flex-shrink-0 relative ${
                !isCollapsed ? "mr-2 lg:mr-6" : ""
              }`}
              title={`${notificationCount} Notifications`}
              onClick={onNotificationsClick}
            >
              <BellRing className="w-5 h-5 lg:w-6 lg:h-6" />
              {notificationCount > 0 && !isNotificationsOpen && (
                <span className="absolute -top-1 -right-1 lg:-top-1.5 lg:-right-1.5 flex h-3 w-3 lg:h-4 lg:w-4 items-center justify-center rounded-full bg-red-500 text-[6px] lg:text-[10px] font-bold text-white shadow-sm ring-1 lg:ring-2 ring-white">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </button>

            {/* Aligned Notifications Panel */}
            <NotificationsPanel
              isOpen={isNotificationsOpen}
              onClose={onNotificationsClick || (() => {})}
              lowStockProducts={lowStockProducts}
              onViewProduct={onViewProduct || (() => {})}
              onSeeAll={onSeeAll}
              isDropdown={true}
            />
          </div>
        )}
      </div>

      {/* Navigation Section */}
      <div className="flex-1 flex flex-col min-h-0">
        {!isCollapsed && (
          <h2 className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-4 flex-shrink-0">
            {isAdmin ? "Services" : "Categories"}
          </h2>
        )}

        <div className="space-y-1 overflow-y-auto flex-1 pr-2 no-scrollbar">
          {isAdmin && (
            // Admin Services List
            <div className="mb-8">
              {[
                { id: "pos", label: "POS", icon: Monitor },
                { id: "inventory", label: "Inventory", icon: Package },
                { id: "history", label: "Logs", icon: ClipboardList },
                { id: "analytics", label: "Analytics", icon: BarChart3 },
              ].map((service) => (
                <button
                  key={service.id}
                  onClick={() => onViewChange?.(service.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-full transition-all text-left relative group
                    ${
                      currentView === service.id
                        ? "bg-[#E8F0FE] text-[#1967D2]"
                        : "text-gray-600 hover:bg-gray-50"
                    }
                    ${isCollapsed ? "justify-center px-0" : ""}`}
                  title={isCollapsed ? service.label : ""}
                >
                  <span
                    className={`${
                      currentView === service.id
                        ? "text-[#1967D2]"
                        : "text-gray-500"
                    }`}
                  >
                    <service.icon className="w-5 h-5 lg:w-6 lg:h-6" />
                  </span>
                  {!isCollapsed && (
                    <span
                      className={`text-sm tracking-tight ${
                        currentView === service.id ? "font-bold" : "font-medium"
                      }`}
                    >
                      {service.label}
                    </span>
                  )}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                      {service.label}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Hiding Categories from Sidebar as per user request. 
              Filtering is still available within POS and Inventory views. */}
          {/*
          {isAdmin && !isCollapsed && (
            <h2 className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-4 flex-shrink-0">
              Categories
            </h2>
          )}

          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-full transition-all text-left relative group
                ${
                  activeCategory === cat
                    ? "bg-[#E8F0FE] text-[#1967D2]"
                    : "text-gray-600 hover:bg-gray-50"
                }
                ${isCollapsed ? "justify-center px-0" : ""}`}
              title={isCollapsed ? cat : ""}
            >
              <span
                className={`${
                  activeCategory === cat ? "text-[#1967D2]" : "text-gray-500"
                }`}
              >
                {getIcon(cat)}
              </span>
              {!isCollapsed && (
                <span
                  className={`text-sm tracking-tight ${
                    activeCategory === cat ? "font-bold" : "font-medium"
                  }`}
                >
                  {cat}
                </span>
              )}

              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                  {cat}
                </div>
              )}
            </button>
          ))}*/}
        </div>
      </div>

      <div className="mt-auto pt-6 space-y-4 flex-shrink-0 border-t border-gray-50">
        {isAdmin && (
          <>
            <button
              onClick={() => onViewChange?.("settings")}
              className={`w-full flex items-center gap-3 px-4 py-3 lg:px-3 lg:py-2.5 rounded-full transition-all text-left relative group
                ${
                  currentView === "settings"
                    ? "bg-[#E8F0FE] text-[#1967D2]"
                    : "text-gray-500 hover:text-[#4285F4] hover:bg-gray-50"
                }
                ${isCollapsed ? "justify-center px-0" : ""}`}
              title={isCollapsed ? "Settings" : ""}
            >
              <SettingsIcon className="w-5 h-5 lg:w-6 lg:h-6" />
              {!isCollapsed && (
                <span className="text-sm font-medium">Settings</span>
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                  Settings
                </div>
              )}
            </button>

            <button
              onClick={onLogout}
              className={`w-full flex items-center gap-3 px-4 py-3 lg:px-3 lg:py-2.5 text-[#EA4335] hover:bg-red-50 rounded-full transition-all text-sm font-medium ${
                isCollapsed ? "justify-center px-0" : ""
              }`}
              title={isCollapsed ? "Logout" : ""}
            >
              <LogOut className="w-5 h-5 lg:w-6 lg:h-6" />{" "}
              {!isCollapsed && "Sign Out"}
            </button>
          </>
        )}

        {!isAdmin && (
          <div
            className={`bg-blue-50/50 rounded-3xl border border-blue-100 ${
              isCollapsed ? "p-2" : "p-4"
            }`}
          >
            {!isCollapsed ? (
              <>
                <div className="flex items-center gap-2 text-gray-800 font-bold mb-2">
                  <Clock size={16} className="text-[#34A853]" />
                  <h3 className="text-sm font-medium">Store Hours</h3>
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-xs font-bold text-[#1967D2]">Open Now</p>
                  <p className="text-[11px] text-gray-500 font-medium">
                    6:00 AM - 9:00 PM
                  </p>
                </div>
              </>
            ) : (
              <div className="flex justify-center flex-col items-center gap-1">
                <Clock size={18} className="text-[#34A853]" />
                <span className="text-[10px] font-bold text-[#34A853]">
                  Open
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toggle Button - Perfectly centered on the border line */}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className="absolute top-8 right-0 translate-x-1/2 bg-white border border-gray-100 text-gray-400 hover:text-[#4285F4] rounded-full p-1.5 shadow-md shadow-gray-200/50 transition-all z-[110] hover:scale-110"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      )}
    </div>
  );
};

export default Sidebar;
