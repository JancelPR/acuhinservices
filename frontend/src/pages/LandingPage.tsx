import React, { useState, useMemo, useRef, useEffect } from "react";
import { Product } from "../types";
import { STORE_NAME } from "../constants";
import { Search, Store, ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "../components/ProductCard";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";

import StoreFooter from "../components/StoreFooter";
import StoreHeader from "../components/StoreHeader";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { Link } from "react-router-dom";

interface LandingPageProps {
  products: Product[];
  categories: string[];
  isLoading: boolean;
  onLoginClick: () => void;
  onAddToCart: (product: Product) => void;
  onViewProduct: (productId: string) => void;
}

const ProductGrid: React.FC<{
  products: Product[];
  onAddToCart: (product: Product) => void;
}> = ({ products, onAddToCart }) => {
  if (products.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5 lg:gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
};

const LandingPage: React.FC<LandingPageProps> = ({
  products,
  categories,
  isLoading,
  onLoginClick,
  onAddToCart,
  onViewProduct,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;
  const productsRef = useRef<HTMLElement>(null);

  // Use scroll reveal animation hook
  useScrollReveal([currentPage, activeCategory, searchQuery, isLoading]);

  // Computed Values
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        activeCategory === "All" || product.category === activeCategory;
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);
  // No need to split products for grid
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const displayedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery]);

  const stats = useMemo(
    () => ({
      total: products.length,
      available: products.filter((p) => p.stock > 0).length,
      outOfStock: products.filter((p) => p.stock === 0).length,
    }),
    [products]
  );

  const lowStockProducts = useMemo(() => {
    return products.filter((p) => {
      const threshold = p.lowStockThreshold ?? 5;
      return p.stock <= threshold && p.stock !== -1; // -1 might be for unlimited/special items, but usually it's just <= threshold
    });
  }, [products]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="absolute left-0 top-0 h-full bg-white w-72 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-[#4285F4] rounded-lg"></div>
              <h2 className="text-xl font-medium text-gray-800">
                {STORE_NAME}
              </h2>
            </div>

            <nav className="space-y-1">
              {[
                { name: "Home", href: "/" },
                { name: "Categories", href: "/#products-section" },
                { name: "Deals", href: "/#products-section" },
                { name: "Recent Orders", href: "/admin/history" },
              ].map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full block text-left px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-[#4285F4] transition-all font-medium"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute bottom-8 left-6 right-6 py-3 border border-gray-200 rounded-full text-gray-500 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <main
        className={`flex-1 transition-all duration-300 min-h-screen flex flex-col`}
      >
        <StoreHeader
          onLoginClick={onLoginClick}
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />

        {/* Hero Section */}
        <HeroSection onLoginClick={onLoginClick} />

        {/* Features Section */}
        <div className="reveal-on-scroll reveal-fade-up">
          <FeaturesSection />
        </div>

        {/* --- MAIN CONTENT STRIP --- */}
        <section
          id="products-section"
          ref={productsRef}
          className="px-4 md:px-8 lg:px-12 pt-12 pb-6 bg-gray-50/50 scroll-mt-16"
        >
          <div className="max-w-[1600px] mx-auto">
            {/* Header Title */}
            <div className="text-center mb-6 reveal-on-scroll reveal-fade-up">
              <h2 className="text-3xl md:text-3xl lg:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                Our Products
              </h2>
            </div>

            {/* Original Filter & Control Bar */}
            {/* Filter & Control Bar */}
            <div className="mb-8">
              <div className="flex flex-col gap-4">
                <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-full pb-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 shadow-sm active:scale-95 ${
                        activeCategory === cat
                          ? "bg-gray-900 text-white shadow-lg -translate-y-0.5"
                          : "bg-white text-gray-600 hover:bg-gray-50 hover:shadow-md"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Grid */}
            {isLoading ? (
              <div className="text-center py-40">
                <div className="w-20 h-20 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <h3 className="text-xl font-medium text-gray-800 tracking-tight">
                  Preparing your shelf...
                </h3>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-gray-200 shadow-sm">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search size={40} className="text-gray-300" />
                </div>
                <h3 className="text-2xl font-medium text-gray-800 mb-2">
                  No items found
                </h3>
                <p className="text-gray-500 mb-8">
                  Try adjusting your search or filters.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("All");
                  }}
                  className="px-8 py-3 bg-teal-600 text-white rounded-full font-medium hover:bg-teal-700 transition"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <ProductGrid
                  products={displayedProducts}
                  onAddToCart={onAddToCart}
                />

                {/* Pagination UI */}
                {totalPages >= 1 && (
                  <div className="mt-6 flex flex-col items-center gap-2">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setCurrentPage((p) => Math.max(1, p - 1));
                          productsRef.current?.scrollIntoView({
                            behavior: "smooth",
                          });
                        }}
                        disabled={currentPage === 1}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-500 border group ${
                          currentPage === 1
                            ? "border-gray-100 text-gray-300 cursor-not-allowed"
                            : "border-gray-200 text-gray-600 hover:border-teal-500 hover:text-teal-600 bg-white shadow-sm hover:shadow-md active:scale-90"
                        }`}
                      >
                        <ChevronLeft
                          size={16}
                          className="group-hover:-translate-x-0.5 transition-transform"
                        />
                      </button>

                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-md border border-gray-100 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1
                        ).map((page) => {
                          const isActive = currentPage === page;
                          const isVisible =
                            totalPages <= 7 ||
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 &&
                              page <= currentPage + 1);

                          if (!isVisible) {
                            if (page === 2 || page === totalPages - 1) {
                              return (
                                <span
                                  key={page}
                                  className="px-2 text-gray-300 font-bold select-none"
                                >
                                  ...
                                </span>
                              );
                            }
                            return null;
                          }

                          return (
                            <button
                              key={page}
                              onClick={() => {
                                setCurrentPage(page);
                                productsRef.current?.scrollIntoView({
                                  behavior: "smooth",
                                });
                              }}
                              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all duration-500 active:scale-95 relative group ${
                                isActive
                                  ? "text-teal-600"
                                  : "text-gray-400 hover:text-teal-500 hover:bg-teal-50/50"
                              }`}
                            >
                              {page}
                              {isActive && (
                                <span className="absolute inset-0 bg-teal-500/10 rounded-xl -z-10 animate-in zoom-in duration-300"></span>
                              )}
                              {isActive && (
                                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-teal-500 rounded-full"></span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => {
                          setCurrentPage((p) => Math.min(totalPages, p + 1));
                          productsRef.current?.scrollIntoView({
                            behavior: "smooth",
                          });
                        }}
                        disabled={currentPage === totalPages}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-500 border group ${
                          currentPage === totalPages
                            ? "border-gray-100 text-gray-300 cursor-not-allowed"
                            : "border-gray-200 text-gray-600 hover:border-teal-500 hover:text-teal-600 bg-white shadow-sm hover:shadow-md active:scale-90"
                        }`}
                      >
                        <ChevronRight
                          size={16}
                          className="group-hover:translate-x-0.5 transition-transform"
                        />
                      </button>
                    </div>

                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                      Page {currentPage} of {totalPages}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <StoreFooter />
      </main>
    </div>
  );
};

export default LandingPage;
