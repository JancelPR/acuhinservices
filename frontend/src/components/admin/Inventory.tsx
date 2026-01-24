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
} from "lucide-react";
import { api } from "../../services/api";
import {
  generateProductDescription,
  generateProductImage,
} from "../../services/geminiService";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import ProductCard from "../ProductCard";
import ConfirmationModal from "../ConfirmationModal";
import UnitSelector from "./UnitSelector";

interface InventoryProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  activeCategory: string;
  onAddCategory: (newCategory: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({
  products,
  setProducts,
  categories,
  setCategories,
  activeCategory,
  onAddCategory,
}) => {
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

  // Initialize Scroll Reveal
  useScrollReveal([filteredProducts, searchQuery, stockFilter, activeCategory]);

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

  const availableUnits = useMemo(() => {
    const units = new Set(DEFAULT_UNITS);
    products.forEach((p) => {
      if (p.unit) units.add(p.unit);
    });
    return Array.from(units).sort();
  }, [products]);

  const handleAddProduct = () => {
    setCurrentProduct({
      category: "Snacks",
      stock: 0,
      price: 0,
      image: "",
      unit: "pc",
      lowStockThreshold: 5, // Default threshold
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
    if (file) {
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
      <div className="flex-shrink-0 mb-6">
        <div className="mb-3">
          {/* Top Row: Title and Add Button */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <span className="bg-blue-50 p-2 rounded-xl text-[#4285F4]">
                <Package size={24} />
              </span>
              Inventory
            </h1>

            <button
              onClick={handleAddProduct}
              className="bg-[#4285F4] text-white px-4 py-2 md:px-3 md:py-1.5 lg:px-5 lg:py-2.5 rounded-full flex items-center gap-2 hover:bg-[#1a73e8] transition-all text-xs md:text-[11px] lg:text-sm font-medium shadow-lg shadow-blue-100"
            >
              <Plus size={16} />{" "}
              <span className="hidden sm:inline">Add Product</span>
            </button>
          </div>

          {/* Bottom Row: Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
            <div className="relative w-full md:w-32 lg:w-48 xl:w-64 transition-all duration-300">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#4285F4]/20 bg-gray-50 text-gray-900 transition-all focus:bg-white"
              />
            </div>

            <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
              <button
                onClick={() => setStockFilter("all")}
                className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  stockFilter === "all"
                    ? "bg-blue-500 text-white ring-1 ring-blue-300 shadow-sm"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 ring-1 ring-gray-200"
                }`}
              >
                Total: {stats.total}
              </button>
              <button
                onClick={() => setStockFilter("inStock")}
                className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  stockFilter === "inStock"
                    ? "bg-green-500 text-white ring-1 ring-green-300 shadow-sm"
                    : "bg-green-50 text-green-700 hover:bg-green-100 ring-1 ring-green-200/50"
                }`}
              >
                In Stock: {stats.available}
              </button>
              <button
                onClick={() => setStockFilter("outOfStock")}
                className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  stockFilter === "outOfStock"
                    ? "bg-red-500 text-white ring-1 ring-red-300 shadow-sm"
                    : "bg-red-50 text-red-700 hover:bg-red-100 ring-1 ring-red-200/50"
                }`}
              >
                Out of Stock: {stats.outOfStock}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">
              No products found
            </h3>
            <p className="text-gray-500">Add a new product to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-white rounded-[24px] w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col max-h-[90vh] border border-gray-100/50">
            {/* Modal Header */}
            <div className="px-6 py-4 flex justify-between items-center bg-white border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isEditing
                      ? "bg-blue-50 text-[#4285F4]"
                      : "bg-emerald-50 text-emerald-600"
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
            <div className="p-6 overflow-y-auto no-scrollbar space-y-5">
              {/* Image Section - More compact at top */}
              <div className="flex gap-4 items-center">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center shadow-inner">
                    {currentProduct.image ? (
                      <img
                        src={currentProduct.image}
                        alt="Preview"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <ImageIcon size={32} className="text-gray-200" />
                    )}
                  </div>
                  {isGeneratingImage && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                      <Loader
                        size={20}
                        className="animate-spin text-[#4285F4]"
                      />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <label className="cursor-pointer flex items-center gap-2 w-full px-3 py-2 border border-gray-100 rounded-xl text-[11px] font-bold text-gray-600 bg-gray-50/50 hover:bg-white hover:border-blue-200 hover:text-blue-600 transition-all shadow-sm">
                    <Upload size={14} />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>

                  <button
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage || !currentProduct.name}
                    className="w-full px-3 py-2 border border-blue-100 rounded-xl text-[11px] font-bold text-[#4285F4] bg-blue-50/30 hover:bg-white hover:border-blue-300 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                  >
                    <Wand2 size={14} />
                    <span>AI Generate</span>
                  </button>
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
                    className="w-full bg-gray-50 border-0 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#4285F4]/20 focus:bg-white border-transparent focus:border-blue-200 outline-none text-gray-900 text-sm transition-all border border-gray-100"
                    placeholder="e.g. SkyFlakes"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                    Barcode
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4285F4] transition-colors">
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
                      className="w-full bg-gray-50 border-0 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-[#4285F4]/20 focus:bg-white border-transparent focus:border-blue-200 outline-none text-gray-900 text-sm transition-all border border-gray-100"
                      placeholder="Scan or enter barcode"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    {isAddingNewCategory ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="Category..."
                          className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500/20"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newCategoryName.trim()) {
                              onAddCategory(newCategoryName.trim());
                              setCurrentProduct({
                                ...currentProduct,
                                category:
                                  newCategoryName.trim() as CategoryType,
                              });
                              setIsAddingNewCategory(false);
                              setNewCategoryName("");
                            }
                          }}
                          className="p-2 bg-[#4285F4] text-white rounded-xl hover:bg-[#1a73e8] transition-colors"
                        >
                          <Check size={16} />
                        </button>
                      </div>
                    ) : (
                      <select
                        value={currentProduct.category}
                        onChange={(e) => {
                          if (e.target.value === "__add_new__") {
                            setIsAddingNewCategory(true);
                          } else {
                            setCurrentProduct({
                              ...currentProduct,
                              category: e.target.value as CategoryType,
                            });
                          }
                        }}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500/20 text-gray-900 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2210%22%20height%3D%226%22%20viewBox%3D%220%200%2010%206%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M1%201L5%205L9%201%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:10px_6px] bg-[position:right_12px_center] bg-no-repeat"
                      >
                        {categories
                          .filter((c) => c !== "All")
                          .map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        <option value="__add_new__">+ Add new</option>
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                      Stock Level <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={
                        isStockFocused && currentProduct.stock === 0
                          ? ""
                          : currentProduct.stock || 0
                      }
                      onChange={(e) => {
                        const val =
                          e.target.value === "" ? 0 : Number(e.target.value);
                        setCurrentProduct({ ...currentProduct, stock: val });
                      }}
                      onFocus={() => setIsStockFocused(true)}
                      onBlur={(e) => {
                        setIsStockFocused(false);
                        if (e.target.value === "" || e.target.value === "0") {
                          setCurrentProduct({ ...currentProduct, stock: 0 });
                        }
                      }}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4285F4]/20 text-gray-900 transition-all focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                      Price Details <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">
                        {CURRENCY}
                      </span>
                      <input
                        type="number"
                        value={
                          isPriceFocused && currentProduct.price === 0
                            ? ""
                            : currentProduct.price || 0
                        }
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
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-6 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4285F4]/20 text-gray-900 font-bold transition-all focus:bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                      Unit Measure
                    </label>
                    <div className="relative">
                      {isCustomUnit ? (
                        <div className="relative">
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
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4285F4]/20"
                            autoFocus
                          />
                          <button
                            onClick={() => {
                              setIsCustomUnit(false);
                              setCurrentProduct({
                                ...currentProduct,
                                unit: "pc",
                              });
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-blue-500 font-bold hover:underline"
                          >
                            Reset
                          </button>
                        </div>
                      ) : (
                        <UnitSelector
                          value={currentProduct.unit || "pc"}
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

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                    Stock Alert{" "}
                    <span className="text-[9px] font-normal text-gray-400 lowercase italic">
                      (notifies when stock reaches this level)
                    </span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400">
                      <AlertCircle size={16} />
                    </div>
                    <input
                      type="number"
                      value={
                        isStockAlertFocused &&
                        currentProduct.lowStockThreshold === 0
                          ? ""
                          : currentProduct.lowStockThreshold || 0
                      }
                      onChange={(e) => {
                        const val =
                          e.target.value === "" ? 0 : Number(e.target.value);
                        setCurrentProduct({
                          ...currentProduct,
                          lowStockThreshold: val,
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
                      placeholder="Enter minimum threshold (optional)"
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-200 text-gray-900 transition-all focus:bg-white"
                    />
                  </div>
                </div>

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
                        className="text-[10px] font-bold text-[#4285F4] hover:text-[#1a73e8] flex items-center gap-1 disabled:opacity-40 transition-colors"
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
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 h-20 text-sm outline-none resize-none focus:ring-2 focus:ring-purple-500/20 text-gray-600 leading-relaxed"
                      placeholder="Product highlights..."
                    ></textarea>
                  </div>
                </div>
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
                className={`sm:w-auto px-8 py-2.5 text-sm font-bold text-white rounded-xl shadow-[0_8px_20px_-4px_rgba(147,51,234,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2 ${
                  isEditing
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-emerald-600 hover:bg-emerald-700 shadow-[0_8px_20px_-4px_rgba(16,185,129,0.3)]"
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
