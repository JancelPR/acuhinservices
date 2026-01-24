import React from "react";
import { Droplets, PiggyBank, Wallet } from "lucide-react";

const FeaturesSection: React.FC = () => {
  return (
    <section
      id="features"
      className="pt-4 pb-16 md:pt-6 md:pb-12 bg-slate-50 relative z-10 scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-6">
          <h2 className="text-4xl md:text-3xl lg:text-6xl font-black text-[#0f172a] mb-3 tracking-tight">
            Our Other Services
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-base md:text-sm lg:text-lg font-medium leading-relaxed px-4">
            Beyond our retail products, we offer essential community services
            designed for your daily convenience and needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-4 lg:gap-10">
          {/* Service 1: Water Refilling */}
          <div className="reveal-on-scroll reveal-fade-up delay-75 flex flex-col items-center text-center p-8 md:p-5 lg:p-10 rounded-[2.5rem] bg-gradient-to-b from-blue-50/50 to-blue-100/50 border border-blue-100/50 relative group transition-all duration-500 hover:-translate-y-2">
            <div className="mb-6 md:mb-4 lg:mb-8 relative">
              <div className="p-5 md:p-3 lg:p-5 bg-white rounded-3xl shadow-[0_10px_40px_rgba(59,130,246,0.1)] text-blue-600 group-hover:scale-110 transition-transform duration-500 border border-blue-50 z-10 relative">
                <Droplets
                  className="w-9 h-9 md:w-6 md:h-6 lg:w-9 lg:h-9"
                  strokeWidth={2.5}
                />
              </div>
              <div className="absolute inset-0 bg-blue-400 blur-2xl opacity-20 scale-0 group-hover:scale-150 transition-transform duration-700"></div>
            </div>

            <h3 className="font-black text-2xl md:text-lg lg:text-2xl text-blue-700 mb-4 md:mb-3 lg:mb-5 tracking-tight">
              Water Refilling Station
            </h3>
            <p className="text-slate-600 text-sm md:text-[13px] lg:text-base leading-relaxed font-medium">
              Access clean, safe, and purified drinking water. We utilize
              advanced filtration systems to ensure the highest quality for your
              family.
            </p>

            {/* Bottom Accent Line */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1.5 bg-blue-400/20 blur-sm rounded-full"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-blue-500 rounded-t-full"></div>
          </div>

          {/* Service 2: Animal Feed */}
          <div className="reveal-on-scroll reveal-fade-up delay-150 flex flex-col items-center text-center p-8 md:p-5 lg:p-10 rounded-[2.5rem] bg-gradient-to-b from-orange-50/50 to-orange-100/50 border border-orange-100/50 relative group transition-all duration-500 hover:-translate-y-2">
            <div className="mb-6 md:mb-4 lg:mb-8 relative">
              <div className="p-5 md:p-3 lg:p-5 bg-white rounded-3xl shadow-[0_10px_40px_rgba(249,115,22,0.1)] text-orange-600 group-hover:scale-110 transition-transform duration-500 border border-orange-50 z-10 relative">
                <PiggyBank
                  className="w-9 h-9 md:w-6 md:h-6 lg:w-9 lg:h-9"
                  strokeWidth={2.5}
                />
              </div>
              <div className="absolute inset-0 bg-orange-400 blur-2xl opacity-20 scale-0 group-hover:scale-150 transition-transform duration-700"></div>
            </div>

            <h3 className="font-black text-2xl md:text-lg lg:text-2xl text-orange-700 mb-4 md:mb-3 lg:mb-5 tracking-tight">
              Agricultural Feed Supply
            </h3>
            <p className="text-slate-600 text-sm md:text-[13px] lg:text-base leading-relaxed font-medium">
              High-quality feeds for livestock and poultry. We provide
              nutrient-rich options to support the health and growth of your
              animals.
            </p>

            {/* Bottom Accent Line */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1.5 bg-orange-400/20 blur-sm rounded-full"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-orange-500 rounded-t-full"></div>
          </div>

          {/* Service 3: Cash Services */}
          <div className="reveal-on-scroll reveal-fade-up delay-300 flex flex-col items-center text-center p-8 md:p-5 lg:p-10 rounded-[2.5rem] bg-gradient-to-b from-emerald-50/50 to-emerald-100/50 border border-emerald-100/50 relative group transition-all duration-500 hover:-translate-y-2">
            <div className="mb-6 md:mb-4 lg:mb-8 relative">
              <div className="p-5 md:p-3 lg:p-5 bg-white rounded-3xl shadow-[0_10px_40px_rgba(16,185,129,0.1)] text-emerald-600 group-hover:scale-110 transition-transform duration-500 border border-emerald-50 z-10 relative">
                <Wallet
                  className="w-9 h-9 md:w-6 md:h-6 lg:w-9 lg:h-9"
                  strokeWidth={2.5}
                />
              </div>
              <div className="absolute inset-0 bg-emerald-400 blur-2xl opacity-20 scale-0 group-hover:scale-150 transition-transform duration-700"></div>
            </div>

            <h3 className="font-black text-2xl md:text-lg lg:text-2xl text-emerald-700 mb-4 md:mb-3 lg:mb-5 tracking-tight">
              Secure Financial Services
            </h3>
            <p className="text-slate-600 text-sm md:text-[13px] lg:text-base leading-relaxed font-medium">
              Convenient and secure cash-in and cash-out operations. Handle your
              digital transactions and remittances with ease right here.
            </p>

            {/* Bottom Accent Line */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1.5 bg-emerald-400/20 blur-sm rounded-full"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-emerald-500 rounded-t-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
