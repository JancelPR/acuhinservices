import { User, Menu, Store } from "lucide-react";
import { Link } from "react-router-dom";
import { STORE_NAME } from "../constants";

interface StoreHeaderProps {
  onLoginClick: () => void;
  onMenuClick?: () => void;
}

const StoreHeader = ({ onLoginClick, onMenuClick }: StoreHeaderProps) => {
  return (
    <header className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-sky-100 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-16 lg:h-20">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuClick}
              className="p-2 -ml-2 hover:bg-sky-50 rounded-full md:hidden text-gray-600 transition-colors"
            >
              <Menu size={24} />
            </button>
            <Link
              to="/"
              className="flex items-center gap-3 cursor-pointer group"
            >
              {/* Unique Premium Logo */}
              <div className="w-10 h-10 md:w-10 md:h-10 lg:w-11 lg:h-11 bg-gradient-to-tr from-orange-500 via-orange-500 to-amber-400 rounded-[12px] lg:rounded-[14px] flex items-center justify-center shadow-[0_8px_16px_-4px_rgba(249,115,22,0.4)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <Store className="text-white w-5 h-5 md:w-5 md:h-5 lg:w-6 lg:h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg md:text-lg lg:text-xl font-black tracking-tighter text-gray-900 leading-none animate-signage">
                  {STORE_NAME}
                </span>
                <span className="text-[10px] md:text-[10px] lg:text-[11px] font-bold text-orange-600 mt-0.5 whitespace-nowrap">
                  Always Here for Your Daily Needs
                </span>
              </div>
            </Link>
          </div>

          {/* Actions Section */}
          <div className="flex items-center">
            <Link
              to="/login"
              className="flex items-center gap-2 px-4 py-2 md:px-4 md:py-2 lg:px-6 lg:py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg lg:rounded-xl text-xs md:text-xs lg:text-sm font-black uppercase tracking-widest transition-all shadow-lg shadow-orange-200 hover:shadow-orange-300/50 active:scale-95"
            >
              <User className="w-3.5 h-3.5 lg:w-[18px] lg:h-[18px]" />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default StoreHeader;
