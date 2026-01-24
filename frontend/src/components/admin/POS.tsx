import React, { useState, useMemo, useRef, useEffect } from "react";
import { Product, CartItem, ReceiptData } from "../../types";
import { CURRENCY } from "../../constants";
import { api } from "../../services/api";
import {
  Search,
  ShoppingCart,
  Minus,
  Plus,
  X,
  CreditCard,
  AlertCircle,
  Menu,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Monitor,
} from "lucide-react";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import ProductCard from "../ProductCard";

interface POSProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  setTransactions: React.Dispatch<React.SetStateAction<ReceiptData[]>>;
  onViewReceipt: (receipt: ReceiptData) => void;
  onMobileMenuOpen: () => void;
  onLogout: () => void;
}

const POS: React.FC<POSProps> = ({
  products,
  setProducts,
  categories,
  activeCategory,
  onCategoryChange,
  setTransactions,
  onViewReceipt,
  onMobileMenuOpen,
  onLogout,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 5); // 5px threshold
      setCanScrollRight(scrollWidth > scrollLeft + clientWidth + 5);
    }
  };

  useEffect(() => {
    // Initial check and set up observer for content changes
    setTimeout(checkScroll, 100);

    // Add event listeners
    window.addEventListener("resize", checkScroll);
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
    }

    return () => {
      window.removeEventListener("resize", checkScroll);
      if (container) {
        container.removeEventListener("scroll", checkScroll);
      }
    };
  }, [categories, products]); // Re-check when categories or products change

  // Global Barcode Listener
  const barcodeBuffer = useRef("");
  const lastKeyTime = useRef(0);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't capture if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }

      const now = Date.now();

      // Scanners are fast. If time between keys is > 50ms, it's likely manual typing.
      // But some scanners are slower. Let's use a 100ms threshold for resets.
      if (now - lastKeyTime.current > 100) {
        barcodeBuffer.current = "";
      }

      lastKeyTime.current = now;

      // Most barcodes are alphanumeric. Let's capture characters and digits.
      if (e.key.length === 1) {
        barcodeBuffer.current += e.key;
      } else if (e.key === "Enter") {
        const code = barcodeBuffer.current.trim();
        if (code) {
          const product = products.find((p) => p.barcode === code);
          if (product && product.stock > 0) {
            addToCart(product);
            barcodeBuffer.current = "";
            // Optional: Show a quick feedback toast/message
          }
        }
        barcodeBuffer.current = "";
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [products]);

  // Barcode Auto-Add Logic for the Search Input
  useEffect(() => {
    if (!searchQuery.trim()) return;

    // Only auto-add if the string looks like a full barcode (usually min 4-5 chars)
    // or if the scanner types an Enter which is handled by a separate form submit if we had one.
    // For manual typing, we wait for an exact match.
    const exactMatch = products.find((p) => p.barcode === searchQuery.trim());
    if (exactMatch && exactMatch.stock > 0) {
      addToCart(exactMatch);
      setSearchQuery(""); // Clear search after adding
    }
  }, [searchQuery, products]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Checkout State
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);
  const [customerPayment, setCustomerPayment] = useState("");
  const [isPaymentFocused, setIsPaymentFocused] = useState(false);
  const [isCartVisible, setIsCartVisible] = useState(false); // Mobile cart visibility (Bottom Sheet)

  // Computed Values
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        activeCategory === "All" || product.category === activeCategory;
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.barcode &&
          product.barcode.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStock = product.stock > 0; // POS only shows in-stock items generally?
      // Original logic:
      // const matchesStock = stockFilter === 'all' || (stockFilter === 'inStock' && product.stock > 0) ...
      // But stockFilter was 'all' by default in AdminPanel state.
      // However, usually POS shouldn't show OOS items or should dim them.
      // Let's keep it simple: Show all matching category/search, but Cart logic prevents adding OOS.
      // Actually AdminPanel `filteredProducts` used `stockFilter`.
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  // Initialize Scroll Reveal
  useScrollReveal([filteredProducts, searchQuery, activeCategory]);

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );

  const change = useMemo(() => {
    const payment = parseFloat(customerPayment) || 0;
    const change = payment - cartTotal;
    return change >= 0 ? change : 0;
  }, [customerPayment, cartTotal]);

  const isPaymentValid = useMemo(() => {
    const payment = parseFloat(customerPayment) || 0;
    return payment >= cartTotal;
  }, [customerPayment, cartTotal]);

  // Actions
  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return item;
          const product = products.find((p) => p.id === id);
          if (product && newQty > product.stock) return item;
          return { ...item, quantity: newQty };
        }
        return item;
      });
    });
  };

  const setQuantity = (id: string, value: string) => {
    let newQty = parseInt(value);
    if (isNaN(newQty)) {
      setCart((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity: 1 } : item)),
      );
      return;
    }

    // Cap at 4 digits (max 9999)
    if (newQty > 9999) newQty = 9999;

    setCart((prev) => {
      return prev.map((item) => {
        if (item.id === id) {
          if (newQty <= 0) return { ...item, quantity: 1 };
          const product = products.find((p) => p.id === id);
          if (product && newQty > product.stock)
            return { ...item, quantity: product.stock };
          return { ...item, quantity: newQty };
        }
        return item;
      });
    });
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowCheckoutConfirm(true);
    setCustomerPayment("");
    setIsPaymentFocused(false);
  };

  const confirmCheckout = async () => {
    if (cart.length === 0) return;

    try {
      const transactionId = Math.random()
        .toString(36)
        .substr(2, 9)
        .toUpperCase();
      const paymentAmount = parseFloat(customerPayment) || 0;
      const changeAmount = paymentAmount - cartTotal;

      const newReceipt: ReceiptData = {
        items: [...cart],
        total: cartTotal,
        date: new Date().toISOString(),
        id: transactionId,
        payment: paymentAmount,
        change: changeAmount >= 0 ? changeAmount : 0,
      };

      // 1. Save Transaction to DB
      const savedTransaction = await api.createTransaction(newReceipt);

      // 2. Update Stock in DB for each item
      for (const item of cart) {
        const product = products.find((p) => p.id === item.id);
        if (product) {
          try {
            await api.updateProduct(product.id, {
              ...product,
              stock: product.stock - item.quantity,
            });
          } catch (err) {
            console.error(`Failed to update stock for ${item.name}`, err);
          }
        }
      }

      // 3. Update Local State
      setTransactions((prev) => [savedTransaction, ...prev]);

      const newProducts = products.map((p) => {
        const cartItem = cart.find((c) => c.id === p.id);
        if (cartItem) {
          return { ...p, stock: p.stock - cartItem.quantity };
        }
        return p;
      });
      setProducts(newProducts);

      // 4. Show Receipt
      onViewReceipt(savedTransaction);

      // 5. Clear Cart
      setCart([]);

      // 6. Close confirmation dialog
      setShowCheckoutConfirm(false);
    } catch (error) {
      console.error("Checkout failed", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to process checkout. Please try again.",
      );
    }
  };

  const cancelCheckout = () => {
    setShowCheckoutConfirm(false);
    setCustomerPayment("");
    setIsPaymentFocused(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* Unified POS Header with Pill Categories Stacking */}
      <div className="bg-transparent px-4 pt-0 pb-2 flex flex-col gap-4 flex-shrink-0">
        {/* Terminal Header */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <span className="bg-blue-50 p-2 rounded-xl text-[#4285F4]">
              <Monitor size={24} />
            </span>
            Terminal
          </h1>
        </div>

        <div className="flex flex-col gap-4">
          {/* Scrollable Category Pills with Arrows */}
          <div className="relative flex items-center group/nav">
            {canScrollLeft && (
              <button
                onClick={() => scroll("left")}
                className="absolute left-0 z-20 p-2 bg-white shadow-lg rounded-full border border-gray-100 text-gray-600 hover:text-blue-600 transition-all active:scale-95 animate-in fade-in slide-in-from-left-2 duration-300"
                style={{ marginLeft: "4px" }}
              >
                <ChevronLeft size={20} />
              </button>
            )}

            <div
              ref={scrollContainerRef}
              onScroll={checkScroll}
              className="overflow-x-auto no-scrollbar py-1 w-full flex items-center"
            >
              <div
                className={`flex items-center gap-2 md:gap-3 min-w-max transition-all duration-300 ${
                  canScrollLeft || canScrollRight ? "px-14" : "px-2"
                }`}
              >
                {(categories.includes("All")
                  ? categories
                  : ["All", ...categories]
                ).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => onCategoryChange(cat)}
                    className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 active:scale-95 whitespace-nowrap ${
                      activeCategory === cat
                        ? "bg-[#0f172a] text-white shadow-lg shadow-slate-200"
                        : "bg-white text-slate-600 border border-gray-100 hover:bg-gray-50 shadow-sm"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {canScrollRight && (
              <button
                onClick={() => scroll("right")}
                className="absolute right-0 z-20 p-2 bg-white shadow-lg rounded-full border border-gray-100 text-gray-600 hover:text-blue-600 transition-all active:scale-95 animate-in fade-in slide-in-from-right-2 duration-300"
                style={{ marginRight: "4px" }}
              >
                <ChevronRight size={20} />
              </button>
            )}
          </div>

          {/* Search Input Stacked Below */}
          <div className="relative w-full md:max-w-[224px] lg:max-w-md">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 rounded-full border border-gray-100 bg-white focus:ring-4 focus:ring-blue-50 text-sm text-gray-900 placeholder-gray-400 transition-all outline-none shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* POS Product Grid */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-4 pb-24 lg:pb-6 no-scrollbar">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isAdmin={false}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        </div>

        {/* Mobile Bottom Sheet Overlay (Dimmer) */}
        {isCartVisible && (
          <div
            className="fixed inset-0 bg-black/40 z-[300] md:hidden backdrop-blur-md"
            onClick={() => setIsCartVisible(false)}
          />
        )}

        {/* POS Cart Panel (Mobile: Bottom Sheet | Desktop: Fixed Right) */}
        <div
          className={`
          fixed md:relative bottom-0 left-0 right-0 z-[310]
          md:z-0 md:flex md:w-[310px] lg:w-[320px] xl:w-[340px]
          bg-white shadow-[0_-8px_30px_rgb(0,0,0,0.12)] md:shadow-lg
          rounded-t-[2.5rem] md:rounded-3xl
          flex flex-col flex-shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${
            isCartVisible
              ? "translate-y-0 h-[80vh]"
              : "translate-y-full md:translate-y-0 h-0 md:h-full"
          }
        `}
        >
          {/* Bottom Sheet Handle (Mobile Only) */}
          <div
            className="w-full py-4 flex justify-center md:hidden"
            onClick={() => setIsCartVisible(false)}
          >
            <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
          </div>

          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between flex-shrink-0">
            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <ShoppingCart size={22} className="text-[#4285F4]" /> Current
              Order
            </h3>
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-full text-gray-500"
              onClick={() => setIsCartVisible(false)}
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-2 no-scrollbar">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                  <ShoppingCart size={32} className="opacity-20" />
                </div>
                <p className="font-medium">Cart is empty</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-1.5 lg:gap-2 group"
                >
                  <div className="w-9 h-9 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] lg:text-base font-medium text-gray-800 truncate leading-tight">
                      {item.name}
                    </p>
                    <p className="text-[11px] lg:text-sm font-medium text-blue-600">
                      {CURRENCY}
                      {item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 lg:gap-1.5">
                    <div className="flex items-center bg-gray-50 rounded-full p-0.5 shadow-inner">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-white hover:shadow-sm rounded-full transition-all"
                      >
                        <Minus size={10} />
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => setQuantity(item.id, e.target.value)}
                        className="text-[11px] font-medium w-9 text-center bg-white rounded-md border-none focus:outline-none focus:ring-0 p-0 no-spinners shadow-sm"
                      />
                      <button
                        onClick={() => addToCart(item)}
                        className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-white hover:shadow-sm rounded-full transition-all"
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all flex-shrink-0"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 lg:p-6 bg-gray-50/50 border-t border-gray-100 flex-shrink-0">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-500 font-medium tracking-wide">
                TOTAL
              </span>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                {CURRENCY}
                {cartTotal.toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full bg-gradient-to-r from-[#10B981] to-[#059669] text-white py-3 lg:py-3.5 rounded-xl lg:rounded-2xl font-bold text-sm flex items-center justify-center gap-2 lg:gap-3 hover:from-[#059669] hover:to-[#047857] disabled:from-gray-300 disabled:to-gray-200 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-200/50 hover:shadow-emerald-200 active:scale-[0.98]"
            >
              <CreditCard size={18} className="lg:w-5 lg:h-5" />
              <span>Confirm & Checkout</span>
            </button>
          </div>
        </div>

        {/* Mobile View Cart Bar (Visible when sheet is closed) */}
        {!isCartVisible && cart.length > 0 && (
          <div className="fixed bottom-6 left-6 right-6 z-[150] md:hidden">
            <button
              onClick={() => setIsCartVisible(true)}
              className="w-full bg-gray-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between animate-in slide-in-from-bottom-10 fade-in duration-300"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xs ring-4 ring-blue-500/20">
                  {cart.length}
                </div>
                <span className="font-medium">Review Order</span>
              </div>
              <span className="font-bold text-lg">
                {CURRENCY}
                {cartTotal.toFixed(2)}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Checkout Confirmation Modal */}
      {showCheckoutConfirm && (
        <div className="fixed inset-0 z-[500] flex items-end md:items-center justify-center p-0 md:p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-md"
            onClick={cancelCheckout}
          />
          <div className="bg-white rounded-t-[2.5rem] md:rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative z-[510] animate-in slide-in-from-bottom md:zoom-in duration-300">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="text-yellow-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">
                    Confirm Checkout
                  </h3>
                  <p className="text-sm text-gray-500">
                    Review your order before proceeding
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4 max-h-64 overflow-y-auto">
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex-1">
                        <span className="font-medium text-gray-800">
                          {item.name}
                        </span>
                        <span className="text-gray-500 ml-2">
                          x {item.quantity}
                        </span>
                      </div>
                      <span className="font-medium text-gray-800">
                        {CURRENCY}
                        {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-800">Total:</span>
                  <span className="text-xl font-bold text-green-600">
                    {CURRENCY}
                    {cartTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment Input Section */}
              <div className="mb-4 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                    Amount Received
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                      {CURRENCY}
                    </span>
                    <input
                      type="number"
                      value={
                        isPaymentFocused && customerPayment === "0"
                          ? ""
                          : customerPayment || ""
                      }
                      onChange={(e) => {
                        const val =
                          e.target.value === "" ? "0" : e.target.value;
                        setCustomerPayment(val);
                      }}
                      onFocus={() => {
                        setIsPaymentFocused(true);
                        if (customerPayment === "0") {
                          setCustomerPayment("");
                        }
                      }}
                      onBlur={(e) => {
                        setIsPaymentFocused(false);
                        if (
                          e.target.value === "" ||
                          parseFloat(e.target.value) === 0
                        ) {
                          setCustomerPayment("0");
                        }
                      }}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4285F4] bg-gray-50 text-gray-900 text-sm"
                    />
                  </div>
                </div>

                {customerPayment && parseFloat(customerPayment) > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-medium text-gray-800">
                        {CURRENCY}
                        {cartTotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Payment:</span>
                      <span className="font-medium text-gray-800">
                        {CURRENCY}
                        {parseFloat(customerPayment || "0").toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                      <span className="font-bold text-gray-800">Change:</span>
                      <span
                        className={`text-lg font-bold ${
                          change >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {CURRENCY}
                        {change.toFixed(2)}
                      </span>
                    </div>
                    {!isPaymentValid && (
                      <p className="text-xs text-red-500 mt-1">
                        ⚠️ Insufficient payment. Please enter amount equal to or
                        greater than total.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={cancelCheckout}
                  className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmCheckout}
                  disabled={!isPaymentValid || cart.length === 0}
                  className="flex-1 px-3 py-2 bg-[#34A853] text-white rounded-lg text-sm font-medium hover:bg-[#2d9147] transition-colors flex items-center justify-center gap-1.5 disabled:bg-gray-200 disabled:cursor-not-allowed shadow-md"
                >
                  <CreditCard size={14} /> Confirm Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
