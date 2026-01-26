import React, { useState, useMemo } from "react";
import { Product, CategoryType } from "../../types";
import { CURRENCY } from "../../constants";
import {
  Plus,
  Save,
  X,
  Search,
  Upload,
  Image as ImageIcon,
  Package,
  Loader,
  Wand2,
  Check,
  AlertCircle,
  Trash2,
  Barcode,
  Filter,
  ChevronDown,
  Link,
  Clipboard,
} from "lucide-react";
import { api } from "../../services/api";
import {
  generateProductDescription,
  generateProductImage,
} from "../../services/geminiService";
import ProductCard from "../ProductCard";
import ConfirmationModal from "../ConfirmationModal";
import UnitSelector from "./UnitSelector";

interface InventoryProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  onAddCategory: (newCategory: string) => Promise<void>;
  isSidebarCollapsed?: boolean;
}

const Inventory: React.FC<InventoryProps> = ({
  products,
  setProducts,
  categories,
  setCategories,
  onAddCategory,
  isSidebarCollapsed,
}) => {
  const [activeCategory, setActiveCategory] = useState("All");
  const DEFAULT_UNITS = ["pc", "pack", "sachet", "rim", "sack", "stick", "kg"];

  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<
    "all" | "inStock" | "outOfStock"
  >("all");

  // Inventory State
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isCustomUnit, setIsCustomUnit] = useState(false);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isPriceFocused, setIsPriceFocused] = useState(false);

  const [isStockFocused, setIsStockFocused] = useState(false);
  const [isStockAlertFocused, setIsStockAlertFocused] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isModalCategoryOpen, setIsModalCategoryOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isUrlFocused, setIsUrlFocused] = useState(false);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message?: string;
    content?: React.ReactNode;
    onConfirm: () => void;
    variant: "danger" | "warning" | "info" | "success";
    confirmText: string;
  }>({
    isOpen: false,
    title: "",
    onConfirm: () => {},
    variant: "info",
    confirmText: "Confirm",
  });

  // Computed Values
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Inventory doesn't rely on global activeCategory for filtering?
      // In AdminPanel it used activeCategory which was shared with Sidebar.
      // If we want to filter by category in Inventory view, we should probably ignore the global category
      // OR pass it in. The UI in AdminPanel (lines 715+) shows a Search input and Stock Filters,
      // but NOT a category selector specifically for the list,
      // EXCEPT that AdminPanel uses `activeCategory` in `filteredProducts`.
      // The Sidebar sets `activeCategory`.
      // But wait, the Sidebar is persistent. If I click "Inventory", does the Sidebar category filter apply?
      // Yes, line 79 of AdminPanel: `activeCategory === 'All' || product.category === activeCategory`.
      // So I DO need activeCategory prop if I want to maintain that behavior.
      // However, the Sidebar usually filters the main view.
      // I'll add `activeCategory` to props to maintain behavior.
      const matchesCategory =
        activeCategory === "All" || product.category === activeCategory;
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.barcode &&
          product.barcode.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "inStock" && product.stock > 0) ||
        (stockFilter === "outOfStock" && product.stock === 0);
      return matchesCategory && matchesSearch && matchesStock;
    });
  }, [products, searchQuery, stockFilter, activeCategory]);

  // Wait, I missed the category filtering.
  // I should add activeCategory prop.

  const stats = useMemo(
    () => ({
      total: products.length,
      available: products.filter((p) => p.stock > 0).length,
      outOfStock: products.filter((p) => p.stock === 0).length,
    }),
    [products],
  );

  const sortedCategories = useMemo(() => {
    const cats = categories.filter((c) => c !== "All");
    return ["All", ...cats.sort((a, b) => a.localeCompare(b))];
  }, [categories]);

  const availableUnits = useMemo(() => {
    const units = new Set(DEFAULT_UNITS);
    products.forEach((p) => {
      if (p.unit) units.add(p.unit);
    });
    return Array.from(units).sort();
  }, [products]);

  const handleAddProduct = () => {
    setCurrentProduct({
      category: "" as any,
      stock: 0,
      price: 0,
      image: "",
      unit: "",
      lowStockThreshold: 0,
    });
    setIsEditing(false);
    setIsModalOpen(true);
    setIsCustomUnit(false);
    setIsAddingNewCategory(false);
    setNewCategoryName("");
    setIsPriceFocused(false);
    setIsStockFocused(false);
    setIsStockAlertFocused(false);
  };

  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setIsEditing(true);
    setIsModalOpen(true);
    setIsCustomUnit(!availableUnits.includes(product.unit || "pc"));
  };

  const handleDeleteProduct = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Product",
      message:
        "Are you sure you want to delete this product? This action cannot be undone.",
      variant: "danger",
      confirmText: "Delete",
      onConfirm: async () => {
        try {
          await api.deleteProduct(id);
          setProducts((prev) => prev.filter((p) => p.id !== id));
          if (isEditing && currentProduct.id === id) {
            setIsModalOpen(false);
          }
        } catch (error) {
          console.error("Failed to delete product", error);
          alert("Failed to delete product. Please try again.");
        }
      },
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  const handleFile = (file: File | undefined) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentProduct((prev) => ({
          ...prev,
          image: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) handleFile(file);
          break;
        }
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleUrlSubmit = () => {
    if (imageUrl.trim()) {
      setCurrentProduct((prev) => ({
        ...prev,
        image: imageUrl.trim(),
      }));
      setImageUrl("");
    }
  };

  const handleClipboardClick = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith("image/")) {
            const blob = await item.getType(type);
            const file = new File([blob], "pasted-image.png", { type });
            handleFile(file);
            return;
          }
        }
      }
      alert("No image found in clipboard. Please copy an image first!");
    } catch (err) {
      console.error("Failed to read clipboard:", err);
      alert(
        "Please press Ctrl+V to paste, or allow clipboard access in your browser.",
      );
    }
  };

  const handleGenerateImage = async () => {
    if (!currentProduct.name) {
      alert("Please enter a product name first.");
      return;
    }
    setIsGeneratingImage(true);
    const category = currentProduct.category || "Product";
    const imageBase64 = await generateProductImage(
      currentProduct.name,
      category,
    );

    if (imageBase64) {
      setCurrentProduct((prev) => ({ ...prev, image: imageBase64 }));
    } else {
      alert(
        "Could not generate image. Please try again or upload one manually.",
      );
    }
    setIsGeneratingImage(false);
  };

  const handleSaveProduct = async () => {
    if (!currentProduct.name || !currentProduct.price) {
      alert("Please fill in the required fields (Name and Price).");
      return;
    }

    // Check for duplicate barcode locally before sending to server
    if (currentProduct.barcode) {
      const duplicate = products.find(
        (p) =>
          p.barcode === currentProduct.barcode && p.id !== currentProduct.id,
      );
      if (duplicate) {
        alert(
          `This barcode is already assigned to "${duplicate.name}". Each product must have a unique barcode.`,
        );
        return;
      }
    }

    const productData = {
      ...currentProduct,
      image:
        currentProduct.image || "https://placehold.co/600x400?text=No+Image",
    };

    const confirmSave = async () => {
      if (isEditing && currentProduct.id) {
        try {
          const updated = await api.updateProduct(
            currentProduct.id,
            productData as Product,
          );
          setProducts((prev) =>
            prev.map((p) => (p.id === currentProduct.id ? updated : p)),
          );
        } catch (error) {
          console.error("Failed to update product", error);
          const message =
            error instanceof Error
              ? error.message
              : "Failed to update product.";
          alert(
            message.includes("Duplicate")
              ? "This barcode is already in use by another product."
              : message,
          );
          return;
        }
      } else {
        try {
          const newProduct = await api.createProduct(
            productData as Omit<Product, "id">,
          );
          setProducts((prev) => [newProduct, ...prev]);
        } catch (error) {
          console.error("Failed to create product", error);
          const message =
            error instanceof Error
              ? error.message
              : "Failed to create product.";
          alert(
            message.includes("Duplicate")
              ? "This barcode is already in use by another product."
              : message,
          );
          return;
        }
      }

      setIsModalOpen(false);
      setIsAddingNewCategory(false);
      setNewCategoryName("");
      setIsPriceFocused(false);
      setIsStockFocused(false);
    };

    if (isEditing && currentProduct.id) {
      const originalProduct = products.find((p) => p.id === currentProduct.id);
      const changes: React.ReactNode[] = [];

      if (originalProduct) {
        if (originalProduct.name !== currentProduct.name) {
          changes.push(
            <li key="name">
              Name:{" "}
              <span className="line-through text-gray-400 mr-2">
                {originalProduct.name}
              </span>{" "}
              <span className="font-bold text-gray-800">
                {currentProduct.name}
              </span>
            </li>,
          );
        }
        if (originalProduct.price !== currentProduct.price) {
          changes.push(
            <li key="price">
              Price:{" "}
              <span className="line-through text-gray-400 mr-2">
                {originalProduct.price}
              </span>{" "}
              <span className="font-bold text-gray-800">
                {currentProduct.price}
              </span>
            </li>,
          );
        }
        if (originalProduct.stock !== currentProduct.stock) {
          changes.push(
            <li key="stock">
              Stock:{" "}
              <span className="line-through text-gray-400 mr-2">
                {originalProduct.stock}
              </span>{" "}
              <span className="font-bold text-gray-800">
                {currentProduct.stock}
              </span>
            </li>,
          );
        }
        if (originalProduct.barcode !== currentProduct.barcode) {
          changes.push(
            <li key="barcode">
              Barcode:{" "}
              <span className="line-through text-gray-400 mr-2">
                {originalProduct.barcode || "N/A"}
              </span>{" "}
              <span className="font-bold text-gray-800">
                {currentProduct.barcode || "N/A"}
              </span>
            </li>,
          );
        }
      }

      setConfirmModal({
        isOpen: true,
        title: "Review Changes",
        variant: "info",
        confirmText: "Save Changes",
        content: (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <p className="mb-2 font-medium text-gray-700">
              You are about to update this product:
            </p>
            {changes.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                {changes}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">
                No specific changes detected.
              </p>
            )}
          </div>
        ),
        onConfirm: confirmSave,
      });
    } else {
      confirmSave();
    }
  };

  const handleGenerateDescription = async () => {
    if (!currentProduct.name || !currentProduct.category) return;
    setIsGeneratingAI(true);
    const desc = await generateProductDescription(
      currentProduct.name,
      currentProduct.category,
    );
    setCurrentProduct((prev) => ({ ...prev, description: desc }));
    setIsGeneratingAI(false);
  };

  const handleEditUnit = async (oldUnit: string, newUnit: string) => {
    // 1. Update local state for all matching products
    setProducts((prev) =>
      prev.map((p) => (p.unit === oldUnit ? { ...p, unit: newUnit } : p)),
    );

    // 2. Perform API updates in background (or block if critical)
    // Since backend doesn't have a batch update endpoint, we iterate.
    // Ideally we should have a bulk update endpoint.
    // For now, we'll optimistically update UI.
    const productsToUpdate = products.filter((p) => p.unit === oldUnit);

    // Note: In a real app we'd want to properly await these or handle errors for each.
    for (const p of productsToUpdate) {
      try {
        await api.updateProduct(p.id, { ...p, unit: newUnit });
      } catch (e) {
        console.error(`Failed to update unit for product ${p.name}`, e);
      }
    }

    if (currentProduct.unit === oldUnit) {
      setCurrentProduct((prev) => ({ ...prev, unit: newUnit }));
    }
  };

  const handleDeleteUnit = async (unit: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.unit === unit ? { ...p, unit: "pc" } : p)),
    );

    const productsToUpdate = products.filter((p) => p.unit === unit);
    for (const p of productsToUpdate) {
      try {
        await api.updateProduct(p.id, { ...p, unit: "pc" });
      } catch (e) {
        console.error(`Failed to reset unit for product ${p.name}`, e);
      }
    }

    if (currentProduct.unit === unit) {
      setCurrentProduct((prev) => ({ ...prev, unit: "pc" }));
    }
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Sticky Header Section */}
      {/* Terminal Style Header for Inventory */}
      <div className="bg-transparent px-4 pt-0 pb-2 flex flex-col gap-2 flex-shrink-0">
        <div className="flex items-center justify-between py-3 px-6 bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-[0_15px_35px_-5px_rgba(249,115,22,0.12),0_5px_15px_-3px_rgba(0,0,0,0.04)] relative overflow-hidden group border-none">
          {/* Subtle Inner Glow */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-4 tracking-tight relative z-10">
            <div className="relative">
              <span className="flex bg-orange-50 p-2.5 rounded-2xl text-orange-600 shadow-sm ring-1 ring-orange-100/50 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <Package size={20} />
              </span>
              <div className="absolute inset-0 bg-orange-400 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600">
              Inventory
            </span>
          </h1>

          {/* Integrated Search Bar */}
          <div className="relative flex-1 max-w-sm ml-auto z-20 group/search">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-400/70 group-focus-within/search:text-orange-500 transition-colors"
              size={16}
            />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-1.5 bg-orange-50/10 border border-orange-100/30 rounded-full text-sm text-gray-700 placeholder:text-gray-400/80 outline-none focus:ring-4 focus:ring-orange-500/5 focus:bg-white focus:border-orange-200 transition-all duration-300 shadow-inner"
            />
          </div>

          {/* Liquid highlight effect */}
          <div className="absolute -right-24 -top-24 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl group-hover:bg-orange-500/10 transition-colors duration-700" />
        </div>

        {/* Action Row: Add Button and Filters */}
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between px-2 py-1">
          <button
            onClick={handleAddProduct}
            className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:from-orange-600 hover:to-red-700 transition-all duration-300 text-sm font-bold shadow-lg shadow-orange-200/50 active:scale-95 whitespace-nowrap"
          >
            <Plus size={18} />
            <span>New Product</span>
          </button>

          <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
            {/* Premium Category Filter Dropdown */}
            <div className="relative w-full md:w-auto min-w-[160px] z-[100]">
              <button
                onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                className={`w-full flex items-center justify-between pl-3 pr-2 py-1.5 bg-white/80 backdrop-blur-md border rounded-xl text-xs font-bold transition-all duration-300 shadow-sm hover:shadow-md group ${
                  isCategoryMenuOpen
                    ? "border-orange-200 ring-4 ring-orange-500/5 shadow-inner"
                    : "border-gray-100 hover:border-orange-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1 rounded-lg transition-colors ${
                      activeCategory === "All"
                        ? "bg-gray-50 text-gray-400"
                        : "bg-orange-50 text-orange-500"
                    }`}
                  >
                    <Filter size={12} />
                  </div>
                  <span
                    className={`truncate ${
                      activeCategory === "All"
                        ? "text-gray-500"
                        : "text-gray-900"
                    }`}
                  >
                    {activeCategory}
                  </span>
                </div>
                <ChevronDown
                  size={14}
                  className={`text-gray-400 transition-transform duration-500 ${
                    isCategoryMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Animated Floating Menu */}
              {isCategoryMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsCategoryMenuOpen(false)}
                  />
                  <div className="absolute top-full left-0 right-0 mt-1.5 p-1 bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl shadow-[0_15px_40px_-12px_rgba(0,0,0,0.15)] z-20 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300 origin-top overflow-hidden">
                    <div className="max-h-[200px] overflow-y-auto no-scrollbar py-1">
                      {sortedCategories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setActiveCategory(cat);
                            setIsCategoryMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all duration-200 group/item relative overflow-hidden ${
                            activeCategory === cat
                              ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-200"
                              : "text-gray-600 hover:bg-orange-50/50 hover:text-orange-600"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full transition-transform duration-500 group-hover/item:scale-150 ${
                              activeCategory === cat
                                ? "bg-white"
                                : "bg-gray-200 group-hover/item:bg-orange-400"
                            }`}
                          />
                          <span className="relative z-10 truncate whitespace-nowrap">
                            {cat}
                          </span>

                          {activeCategory === cat && (
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 blur-sm" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setStockFilter("all")}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                stockFilter === "all"
                  ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-200/50"
                  : "bg-white text-gray-500 hover:bg-orange-50/50 border border-gray-100 shadow-sm"
              }`}
            >
              All: {stats.total}
            </button>
            <button
              onClick={() => setStockFilter("inStock")}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                stockFilter === "inStock"
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                  : "bg-white text-emerald-600 hover:bg-emerald-50 border border-emerald-100 shadow-sm"
              }`}
            >
              In Stock: {stats.available}
            </button>
            <button
              onClick={() => setStockFilter("outOfStock")}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                stockFilter === "outOfStock"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-200"
                  : "bg-white text-rose-600 hover:bg-rose-50 border border-rose-100 shadow-sm"
              }`}
            >
              Out of Stock: {stats.outOfStock}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-24 bg-white/50 backdrop-blur-sm rounded-3xl border border-white shadow-sm">
            <div className="w-24 h-24 bg-orange-50/50 rounded-full flex items-center justify-center mx-auto mb-6 relative ring-1 ring-orange-100/20">
              <div className="absolute inset-0 bg-orange-200/20 rounded-full animate-ping duration-[3000ms]" />
              <Search size={40} className="text-orange-300 relative z-10" />
            </div>
            <h3 className="text-2xl font-black text-gray-800 mb-2 tracking-tight">
              No Items Found
            </h3>
            <p className="text-gray-400 text-sm font-medium">
              Add a new product or adjust filters to get started.
            </p>
          </div>
        ) : (
          <div
            className={`grid grid-cols-2 md:grid-cols-4 ${isSidebarCollapsed ? "lg:grid-cols-5 xl:grid-cols-6" : "lg:grid-cols-4 xl:grid-cols-5"} gap-3 lg:gap-4`}
          >
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isAdmin={true}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[1000] p-4 transition-all duration-300">
          <div className="bg-white rounded-[24px] w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col max-h-[90vh] border border-gray-100/50">
            {/* Modal Header */}
            <div className="px-6 py-4 flex justify-between items-center bg-white border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isEditing
                      ? "bg-orange-50 text-orange-600"
                      : "bg-orange-50 text-orange-600 shadow-sm"
                  }`}
                >
                  {isEditing ? <Wand2 size={20} /> : <Plus size={20} />}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 leading-tight">
                    {isEditing ? "Edit Product" : "New Item"}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">
                    {isEditing ? "Modify existing data" : "Add to inventory"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setIsPriceFocused(false);
                  setIsStockFocused(false);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-visible space-y-5">
              {/* Image Section - More compact at top */}
              <div className="flex gap-4 items-start">
                <div className="relative group">
                  <div
                    className={`w-24 h-24 rounded-2xl bg-gray-50 border overflow-hidden flex items-center justify-center shadow-inner transition-all duration-200 ${
                      isDragging
                        ? "border-orange-300 ring-4 ring-orange-500/10 scale-105"
                        : "border-gray-200"
                    }`}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onPaste={handlePaste}
                  >
                    {currentProduct.image ? (
                      <div className="relative w-full h-full">
                        <img
                          src={currentProduct.image}
                          alt="Preview"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentProduct((prev) => ({
                              ...prev,
                              image: "",
                            }));
                          }}
                          className="absolute top-0.5 right-0.5 w-6 h-6 text-red-500 rounded-full flex items-center justify-center transition-all hover:scale-125 z-20 drop-shadow-sm"
                          title="Remove Image"
                        >
                          <X size={16} strokeWidth={3} />
                        </button>
                        {isDragging && (
                          <div className="absolute inset-0 bg-orange-500/20 backdrop-blur-[2px] flex flex-col items-center justify-center border-2 border-orange-500 border-dashed rounded-2xl">
                            <Upload
                              className="text-orange-600 animate-bounce"
                              size={24}
                            />
                            <span className="text-[8px] font-bold text-orange-600 uppercase">
                              Drop
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-1.5 opacity-40 group-hover:opacity-60 transition-opacity">
                        <div className="relative">
                          <Upload
                            size={28}
                            className={`transition-all duration-300 ${isDragging ? "text-orange-500 scale-110" : "text-gray-300"}`}
                          />
                          {isDragging && (
                            <div className="absolute -inset-1 border-2 border-orange-500 border-dashed rounded-full animate-[spin_4s_linear_infinite]" />
                          )}
                        </div>
                        <span
                          className={`text-[8px] font-bold uppercase tracking-wider transition-colors ${isDragging ? "text-orange-600" : "text-gray-400"}`}
                        >
                          {isDragging ? "Drop Now" : "Drag & Drop"}
                        </span>
                      </div>
                    )}
                  </div>
                  {isGeneratingImage && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                      <Loader
                        size={20}
                        className="animate-spin text-orange-500"
                      />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-3 gap-1.5">
                    <label className="cursor-pointer flex flex-col items-center justify-center gap-1 px-1 py-1.5 border border-gray-100 rounded-xl text-[8px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50 hover:bg-white hover:border-orange-200 hover:text-orange-600 transition-all shadow-sm group">
                      <Upload
                        size={12}
                        className="group-hover:scale-110 transition-transform"
                      />
                      <span className="truncate">UPLOAD</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>

                    <button
                      onClick={handleClipboardClick}
                      className="flex flex-col items-center justify-center gap-1 px-1 py-1.5 border border-gray-100 rounded-xl text-[8px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50 hover:bg-white hover:border-orange-200 hover:text-orange-600 transition-all shadow-sm group"
                    >
                      <Clipboard
                        size={12}
                        className="group-hover:scale-110 transition-transform"
                      />
                      <span>PASTE</span>
                    </button>

                    <div className="relative flex flex-col items-center justify-center gap-1 px-1 py-1.5 border border-gray-100 rounded-xl bg-gray-50/50 focus-within:bg-white focus-within:border-orange-200 transition-all shadow-sm group min-h-[44px]">
                      {/* Visual Placeholder */}
                      <div
                        className={`flex flex-col items-center transition-all duration-200 pointer-events-none ${imageUrl || isUrlFocused ? "opacity-0 scale-95" : "opacity-100"}`}
                      >
                        <Link size={12} className="text-gray-400" />
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                          URL
                        </span>
                      </div>

                      <input
                        type="text"
                        value={imageUrl}
                        onFocus={() => setIsUrlFocused(true)}
                        onBlur={() => {
                          setIsUrlFocused(false);
                          handleUrlSubmit();
                        }}
                        onChange={(e) => setImageUrl(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleUrlSubmit()
                        }
                        className="absolute inset-0 w-full h-full text-center bg-transparent border-0 outline-none px-2 text-[10px] font-medium text-gray-900"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage || !currentProduct.name}
                    className="w-full px-3 py-1.5 border border-orange-100 rounded-xl text-[10px] font-bold text-orange-600 bg-orange-50/30 hover:bg-white hover:border-orange-300 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm group"
                  >
                    <Wand2
                      size={14}
                      className="group-hover:rotate-12 transition-transform"
                    />
                    <span>AI GENERATE</span>
                  </button>

                  <div className="flex items-center justify-center gap-1 py-0.5 opacity-40">
                    <span className="text-[10px] font-normal uppercase tracking-widest text-center">
                      Tip: Ctrl+V or Drag & Drop also works
                    </span>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={currentProduct.name || ""}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        name: e.target.value,
                      })
                    }
                    className="w-full bg-gray-50 border-0 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-500/20 focus:bg-white border-transparent focus:border-orange-200 outline-none text-gray-900 text-sm transition-all border border-gray-100"
                    placeholder="e.g. SkyFlakes"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                      Barcode
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors">
                        <Barcode size={16} />
                      </div>
                      <input
                        type="text"
                        value={currentProduct.barcode || ""}
                        onChange={(e) =>
                          setCurrentProduct({
                            ...currentProduct,
                            barcode: e.target.value,
                          })
                        }
                        className="w-full bg-gray-50 border-0 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-orange-500/20 focus:bg-white border-transparent focus:border-orange-200 outline-none text-gray-900 text-sm transition-all border border-gray-100 placeholder:text-[11px]"
                        placeholder="Scan or enter barcode"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    {isAddingNewCategory ? (
                      <div className="relative group/category">
                        <input
                          type="text"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="Category..."
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-3 pr-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white focus:border-orange-200 transition-all shadow-inner"
                          autoFocus
                          onKeyDown={async (e) => {
                            if (e.key === "Enter" && newCategoryName.trim()) {
                              await onAddCategory(newCategoryName.trim());
                              setCurrentProduct({
                                ...currentProduct,
                                category:
                                  newCategoryName.trim() as CategoryType,
                              });
                              setIsAddingNewCategory(false);
                              setNewCategoryName("");
                            }
                            if (e.key === "Escape") {
                              setIsAddingNewCategory(false);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            if (newCategoryName.trim()) {
                              await onAddCategory(newCategoryName.trim());
                              setCurrentProduct({
                                ...currentProduct,
                                category:
                                  newCategoryName.trim() as CategoryType,
                              });
                              setIsAddingNewCategory(false);
                              setNewCategoryName("");
                            }
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 flex items-center justify-center text-orange-600 hover:text-orange-700 active:scale-90 transition-all"
                        >
                          <Check size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setIsModalCategoryOpen(!isModalCategoryOpen)
                          }
                          className={`w-full flex items-center justify-between px-3 py-2 bg-gray-50/50 border rounded-2xl text-sm transition-all duration-300 group ${
                            isModalCategoryOpen
                              ? "border-orange-200 ring-4 ring-orange-500/5 bg-white shadow-inner"
                              : "border-gray-100 hover:border-orange-100 hover:bg-gray-50"
                          }`}
                        >
                          <span
                            className={`truncate text-[13px] font-medium ${currentProduct.category ? "text-gray-900" : "text-gray-400"}`}
                          >
                            {currentProduct.category || "Select"}
                          </span>
                          <ChevronDown
                            size={14}
                            className={`text-gray-400 transition-transform duration-500 ${
                              isModalCategoryOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {/* Liquid Dropdown Menu */}
                        {isModalCategoryOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-[1001]"
                              onClick={() => setIsModalCategoryOpen(false)}
                            />
                            <div className="absolute top-[-2px] left-[-2px] right-[-2px] p-1 bg-white border border-orange-200 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[1002] animate-in fade-in zoom-in-95 duration-300 origin-top overflow-hidden">
                              <div className="max-h-[160px] overflow-y-auto no-scrollbar py-0.5">
                                {categories
                                  .filter((cat) => cat !== "All")
                                  .map((cat) => (
                                    <button
                                      key={cat}
                                      type="button"
                                      onClick={() => {
                                        setCurrentProduct({
                                          ...currentProduct,
                                          category: cat as CategoryType,
                                        });
                                        setIsModalCategoryOpen(false);
                                      }}
                                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] font-medium uppercase tracking-widest transition-all duration-200 group/item relative overflow-hidden ${
                                        currentProduct.category === cat
                                          ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-200/50"
                                          : "text-gray-600 hover:bg-orange-50/50 hover:text-orange-600"
                                      }`}
                                    >
                                      <div
                                        className={`w-1.5 h-1.5 rounded-full transition-transform duration-500 ${
                                          currentProduct.category === cat
                                            ? "bg-white"
                                            : "bg-gray-200 group-hover/item:bg-orange-400 group-hover/item:scale-150"
                                        }`}
                                      />
                                      <span className="relative z-10 truncate">
                                        {cat}
                                      </span>
                                    </button>
                                  ))}

                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsAddingNewCategory(true);
                                    setIsModalCategoryOpen(false);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest text-orange-500 hover:bg-orange-50/50 transition-all mt-0.5"
                                >
                                  <Plus size={14} />
                                  <span>Add New</span>
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-normal text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                      Price Details <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-normal">
                        {CURRENCY}
                      </span>
                      <input
                        type="number"
                        value={currentProduct.price || ""}
                        placeholder="Amount"
                        onChange={(e) => {
                          const val =
                            e.target.value === "" ? 0 : Number(e.target.value);
                          setCurrentProduct({ ...currentProduct, price: val });
                        }}
                        onFocus={() => setIsPriceFocused(true)}
                        onBlur={(e) => {
                          setIsPriceFocused(false);
                          if (e.target.value === "" || e.target.value === "0") {
                            setCurrentProduct({ ...currentProduct, price: 0 });
                          }
                        }}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-6 pr-3 py-2 text-[13px] font-normal outline-none focus:ring-2 focus:ring-orange-500/20 text-gray-900 transition-all focus:bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                      Unit Measure
                    </label>
                    <div className="relative">
                      {isCustomUnit ? (
                        <div className="relative group/unit">
                          <input
                            type="text"
                            value={currentProduct.unit || ""}
                            onChange={(e) =>
                              setCurrentProduct({
                                ...currentProduct,
                                unit: e.target.value,
                              })
                            }
                            placeholder="Unit..."
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-3 pr-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white focus:border-orange-200 transition-all shadow-inner"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") setIsCustomUnit(false);
                              if (e.key === "Escape") {
                                setIsCustomUnit(false);
                                setCurrentProduct({
                                  ...currentProduct,
                                  unit: "pc",
                                });
                              }
                            }}
                          />
                          <button
                            onClick={() => setIsCustomUnit(false)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 flex items-center justify-center text-orange-600 hover:text-orange-700 active:scale-90 transition-all"
                          >
                            <Check size={18} />
                          </button>
                        </div>
                      ) : (
                        <UnitSelector
                          value={currentProduct.unit || ""}
                          onChange={(val) => {
                            if (val === "custom") {
                              setIsCustomUnit(true);
                              setCurrentProduct({
                                ...currentProduct,
                                unit: "",
                              });
                            } else {
                              setCurrentProduct({
                                ...currentProduct,
                                unit: val,
                              });
                            }
                          }}
                          units={availableUnits}
                          onEditUnit={handleEditUnit}
                          onDeleteUnit={handleDeleteUnit}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-normal text-gray-400 uppercase tracking-wider mb-1.5 ml-1 truncate">
                      Stock Alert
                    </label>
                    <div className="relative">
                      <div
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 group-hover:text-orange-500 transition-colors z-10 cursor-help"
                        title="Notifies when stock level falls below this value"
                      >
                        <AlertCircle size={16} />
                      </div>
                      <input
                        type="number"
                        value={currentProduct.lowStockThreshold || ""}
                        placeholder="Threshold"
                        onChange={(e) => {
                          const val =
                            e.target.value === "" ? 0 : Number(e.target.value);
                          setCurrentProduct({
                            ...currentProduct,
                            lowStockThreshold: Math.min(9999, val),
                          });
                        }}
                        onFocus={() => setIsStockAlertFocused(true)}
                        onBlur={(e) => {
                          setIsStockAlertFocused(false);
                          if (e.target.value === "" || e.target.value === "0") {
                            setCurrentProduct({
                              ...currentProduct,
                              lowStockThreshold: 0,
                            });
                          }
                        }}
                        className="w-full bg-gray-50 border-0 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-orange-500/20 focus:bg-white border-transparent focus:border-orange-200 outline-none text-gray-900 text-[13px] transition-all border border-gray-100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-normal text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                      Stock Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      max="9999"
                      value={currentProduct.stock || ""}
                      placeholder="Quantity"
                      onChange={(e) => {
                        const val =
                          e.target.value === "" ? 0 : Number(e.target.value);
                        setCurrentProduct({
                          ...currentProduct,
                          stock: Math.min(9999, val),
                        });
                      }}
                      onFocus={() => setIsStockFocused(true)}
                      onBlur={(e) => {
                        setIsStockFocused(false);
                        if (e.target.value === "" || e.target.value === "0") {
                          setCurrentProduct({ ...currentProduct, stock: 0 });
                        }
                      }}
                      className="w-full bg-gray-50 border-0 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-500/20 focus:bg-white border-transparent focus:border-orange-200 outline-none text-gray-900 text-[13px] transition-all border border-gray-100"
                    />
                  </div>
                </div>

                {/* Temporarily hidden */}
                {false && (
                  <div>
                    <div className="flex justify-between items-center mb-1.5 ml-1">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Description
                      </label>
                      {(!currentProduct.description ||
                        currentProduct.description.trim() === "") && (
                        <button
                          onClick={handleGenerateDescription}
                          disabled={isGeneratingAI || !currentProduct.name}
                          className="text-[10px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 disabled:opacity-40 transition-colors"
                        >
                          <Wand2 size={10} />
                          {isGeneratingAI ? "Writing..." : "AI Write"}
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <textarea
                        value={currentProduct.description || ""}
                        onChange={(e) =>
                          setCurrentProduct({
                            ...currentProduct,
                            description: e.target.value,
                          })
                        }
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 h-20 text-sm outline-none resize-none focus:ring-2 focus:ring-orange-500/20 text-gray-600 leading-relaxed"
                        placeholder="Product highlights..."
                      ></textarea>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-50 flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex gap-2">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsPriceFocused(false);
                    setIsStockFocused(false);
                  }}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all active:scale-95"
                >
                  Cancel
                </button>
                {isEditing && currentProduct.id && (
                  <button
                    onClick={() => handleDeleteProduct(currentProduct.id!)}
                    className="p-2.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-all active:scale-95 border border-red-100"
                    title="Delete product"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
              <button
                onClick={handleSaveProduct}
                className={`sm:w-auto px-8 py-2.5 text-sm font-bold text-white rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                  isEditing
                    ? "bg-gradient-to-r from-orange-500 to-red-600 shadow-orange-200"
                    : "bg-gradient-to-r from-orange-500/90 to-red-600 shadow-orange-100"
                }`}
              >
                <Save size={18} />
                {isEditing ? "Save Changes" : "Create Item"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        variant={confirmModal.variant}
      >
        {confirmModal.content}
      </ConfirmationModal>
    </div>
  );
};

export default Inventory;
