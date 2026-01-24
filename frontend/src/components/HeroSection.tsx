import {
  Zap,
  Sparkles,
  Terminal,
  Boxes,
  BarChart3,
  Star,
  ArrowRight,
  ShoppingBag,
  Navigation,
} from "lucide-react";
import { Link } from "react-router-dom";

interface HeroSectionProps {
  onLoginClick?: () => void;
}

export default function HeroSection({ onLoginClick }: HeroSectionProps) {
  return (
    <section className="bg-gradient-to-br from-sky-100/40 via-white to-indigo-100/40 min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-5rem)] md:pt-4 md:pb-12 overflow-hidden relative">
      {/* Background Decorative Bloom */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/30 rounded-full blur-[120px] -z-10"></div>

      <div className="mx-auto max-w-7xl px-6 w-full pt-1 pb-2">
        <div className="grid items-center gap-12 md:grid-cols-2 lg:gap-20">
          {/* LEFT CONTENT */}
          <div className="animate-in slide-in-from-left-8 duration-1000 flex flex-col items-start relative z-10 md:pt-0">
            <span className="inline-block rounded-full bg-blue-100 px-4 py-1 text-xs font-semibold text-blue-700 mb-6 uppercase tracking-wider">
              Open Daily • Mon–Sun • 7AM–9PM
            </span>

            <h1 className="text-5xl font-black text-gray-900 md:text-5xl lg:text-7xl tracking-tight leading-tight">
              Smart & Simple <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                Store Checkout
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-lg md:text-base lg:text-lg text-gray-600 leading-relaxed font-medium">
              Scan items, manage your cart, and checkout faster with our modern
              point-of-sale system. Track your sales and inventory in real-time.
            </p>

            <div className="mt-8 flex flex-wrap gap-4 md:gap-3 lg:gap-4">
              <Link
                to="/#products-section"
                className="rounded-xl bg-orange-500 px-7 py-3 md:px-5 md:py-2.5 md:text-base lg:px-7 lg:py-3 lg:text-base font-bold text-white shadow-xl shadow-orange-200 hover:bg-orange-600 transition-all active:scale-95 flex items-center gap-2"
              >
                <ShoppingBag className="w-5 h-5 md:w-5 md:h-5 lg:w-5 lg:h-5" />
                Our Products
              </Link>
              <Link
                to="/#features"
                className="rounded-xl border-2 border-blue-600 bg-white px-7 py-3 md:px-5 md:py-2.5 md:text-base lg:px-7 lg:py-3 lg:text-base font-bold text-blue-600 hover:bg-blue-50 transition-all active:scale-95 flex items-center gap-2"
              >
                Navigate our store
                <Navigation className="w-4 h-4 md:w-4 md:h-4 lg:w-4 lg:h-4" />
              </Link>
            </div>

            {/* Loyalty / Trust Indicator (Kept as requested) */}
            <div className="mt-12 md:mt-8 lg:mt-12 flex items-center gap-4 md:gap-3 py-4 md:py-2 px-6 md:px-4 bg-white/40 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 md:w-9 md:h-9 rounded-full border-2 border-white bg-blue-${
                      i * 100 + 100
                    } flex items-center justify-center text-[10px] md:text-[9px] font-bold text-white`}
                  >
                    User
                  </div>
                ))}
              </div>
              <div className="text-sm md:text-sm font-semibold text-gray-700">
                <div className="flex items-center gap-1 text-orange-500">
                  <Star className="w-3.5 h-3.5 md:w-3.5 md:h-3.5 fill-orange-500" />
                  <Star className="w-3.5 h-3.5 md:w-3.5 md:h-3.5 fill-orange-500" />
                  <Star className="w-3.5 h-3.5 md:w-3.5 md:h-3.5 fill-orange-500" />
                  <Star className="w-3.5 h-3.5 md:w-3.5 md:h-3.5 fill-orange-500" />
                  <Star className="w-3.5 h-3.5 md:w-3.5 md:h-3.5 fill-orange-500" />
                </div>
                Trusted by 500+ Local Neighbors
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT - ILLUSTRATION + FLOATING BADGES */}
          <div className="relative flex justify-center lg:justify-end animate-in zoom-in duration-1000 mt-10 lg:mt-0 lg:pt-24 md:pt-0">
            {/* Main Image Container */}
            <div className="relative group">
              <div className="absolute inset-0 bg-orange-400 opacity-20 blur-[100px] rounded-full group-hover:opacity-30 transition-opacity"></div>

              <img
                src="/store-checkout-illustration.png"
                alt="Smart Store Checkout"
                className="relative z-10 w-full max-w-[800px] md:max-w-[800px] lg:max-w-[800px] h-auto drop-shadow-[0_20px_60px_rgba(0,0,0,0.15)] transform transition-transform duration-700 group-hover:scale-105 animate-float"
              />

              {/* Floating Badge 1 - Top Left */}
              <div className="absolute -top-4 -left-4 md:top-4 md:-left-8 lg:top-8 lg:-left-12 z-20 bg-white p-3 md:p-2 lg:p-4 rounded-3xl shadow-2xl flex items-center gap-3 md:gap-2 lg:gap-4 animate-float">
                <div className="w-10 h-10 md:w-7 md:h-7 lg:w-12 lg:h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
                  <Sparkles className="w-7 h-7 md:w-4 md:h-4 lg:w-7 lg:h-7" />
                </div>
                <div>
                  <p className="text-[10px] md:text-[8px] text-gray-400 font-bold uppercase">
                    Smart System
                  </p>
                  <p className="text-xs md:text-[10px] lg:text-sm font-black text-gray-800">
                    AI-Powered
                  </p>
                </div>
              </div>

              {/* Floating Badge 2 - Bottom Right */}
              <div className="absolute -bottom-20 right-4 md:-bottom-8 md:right-2 lg:-bottom-12 lg:right-4 z-20 bg-white p-3 md:p-2 lg:p-4 rounded-3xl shadow-2xl flex items-center gap-3 md:gap-2 lg:gap-4 animate-float [animation-delay:1s]">
                <div className="w-10 h-10 md:w-7 md:h-7 lg:w-12 lg:h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                  <BarChart3 className="w-7 h-7 md:w-4 md:h-4 lg:w-7 lg:h-7" />
                </div>
                <div>
                  <p className="text-[10px] md:text-[8px] text-gray-400 font-bold uppercase">
                    Full Insights
                  </p>
                  <p className="text-xs md:text-[10px] lg:text-sm font-black text-gray-800">
                    Sales Analytics & Reports
                  </p>
                </div>
              </div>

              {/* Floating Badge 3 - Top Right */}
              <div className="absolute top-2 -right-4 md:top-2 md:-right-6 lg:top-6 lg:-right-12 z-20 bg-white p-3 md:p-2 lg:p-4 rounded-3xl shadow-2xl flex items-center gap-3 md:gap-2 lg:gap-4 animate-float [animation-delay:1.5s]">
                <div className="w-10 h-10 md:w-7 md:h-7 lg:w-12 lg:h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                  <Terminal className="w-7 h-7 md:w-4 md:h-4 lg:w-7 lg:h-7" />
                </div>
                <div>
                  <p className="text-[10px] md:text-[8px] text-gray-400 font-bold uppercase">
                    Core Engine
                  </p>
                  <p className="text-xs md:text-[10px] lg:text-sm font-black text-gray-800">
                    Point of Sale
                  </p>
                </div>
              </div>

              {/* Floating Badge 4 - Bottom Left (Below the cart) */}
              <div className="absolute -bottom-16 -left-8 md:-bottom-2 md:-left-12 lg:bottom-[-40px] lg:-left-20 z-20 bg-white p-3 md:p-2 lg:p-4 rounded-3xl shadow-2xl flex items-center gap-3 md:gap-2 lg:gap-4 animate-float [animation-delay:0.5s]">
                <div className="w-10 h-10 md:w-7 md:h-7 lg:w-12 lg:h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
                  <Boxes className="w-7 h-7 md:w-4 md:h-4 lg:w-7 lg:h-7" />
                </div>
                <div>
                  <p className="text-[10px] md:text-[8px] text-gray-400 font-bold uppercase">
                    Real-time
                  </p>
                  <p className="text-xs md:text-[10px] lg:text-sm font-black text-gray-800">
                    Inventory Management
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
