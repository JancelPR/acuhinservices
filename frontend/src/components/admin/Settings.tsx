import React, { useState } from "react";
import { useStickyState } from "../../hooks/useStickyState";
import { Product } from "../../types";
import {
  User as UserIcon,
  AlertCircle,
  Mail,
  ChevronRight,
  Lock,
  Shield,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
  LayoutGrid,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Loader,
  Coffee,
  GlassWater,
  Sparkles,
  UtensilsCrossed,
  Candy,
  Cookie,
  Bath,
  Beef,
  Fish,
  Apple,
  Carrot,
  Wheat,
  Egg,
  IceCream,
  Soup,
  Beer,
  Baby,
  Dog,
  Cat,
  Scroll,
  Tag,
  Package,
} from "lucide-react";
import { api } from "../../services/api";

interface SettingsProps {
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

const Settings: React.FC<SettingsProps> = ({
  categories,
  setCategories,
  products,
  setProducts,
}) => {
  const [activeSetting, setActiveSetting] = useState<
    | "profile-list"
    | "email-form"
    | "password-form"
    | "category-list"
    | "otp-verify"
  >("profile-list");

  // Auth States
  const [currentEmail, setCurrentEmail] = useStickyState(
    "admin@store.com",
    "admin_email",
  );
  const [newEmail, setNewEmail] = useState("");
  const [emailChangePassword, setEmailChangePassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [settingsSuccess, setSettingsSuccess] = useState("");

  // OTP States
  const [otpCode, setOtpCode] = useState("");
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpType, setOtpType] = useState<"email" | "password">("email");
  const [otpTargetEmail, setOtpTargetEmail] = useState("");
  const [pendingUpdate, setPendingUpdate] = useState<any>(null);

  // Category States
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryValue, setEditCategoryValue] = useState("");

  const getCategoryIcon = (cat: string) => {
    const iconSize = 14;
    const lowerCat = cat.toLowerCase();

    // 1. Exact Matches
    if (cat === "All") return <LayoutGrid size={iconSize} />;
    if (cat === "Snacks") return <Coffee size={iconSize} />;
    if (cat === "Drinks") return <GlassWater size={iconSize} />;
    if (cat === "Toiletries") return <Sparkles size={iconSize} />;
    if (cat === "Canned Goods") return <UtensilsCrossed size={iconSize} />;

    // 2. Keyword Matches
    if (
      lowerCat.includes("drink") ||
      lowerCat.includes("water") ||
      lowerCat.includes("soda")
    )
      return <GlassWater size={iconSize} />;
    if (lowerCat.includes("snack") || lowerCat.includes("chip"))
      return <Coffee size={iconSize} />;
    if (
      lowerCat.includes("candy") ||
      lowerCat.includes("sweet") ||
      lowerCat.includes("chocolate")
    )
      return <Candy size={iconSize} />;
    if (lowerCat.includes("cookie") || lowerCat.includes("pastry"))
      return <Cookie size={iconSize} />;
    if (
      lowerCat.includes("toilet") ||
      lowerCat.includes("bath") ||
      lowerCat.includes("soap")
    )
      return <Bath size={iconSize} />;
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
      lowerCat.includes("potat")
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

    return <Package size={iconSize} />;
  };

  const handleRequestOTP = async (
    type: "email" | "password",
    targetEmail: string,
    data: any,
    currentPassword?: string,
  ) => {
    setSettingsError("");
    setIsSendingOTP(true);
    try {
      await api.requestOTP({
        email: targetEmail,
        type,
        currentEmail: localStorage.getItem("adminEmail") || currentEmail,
        currentPassword,
      });
      setPendingUpdate(data);
      setOtpType(type);
      setOtpTargetEmail(targetEmail);
      setActiveSetting("otp-verify");
      setSettingsSuccess(`Verification code sent to ${targetEmail}`);
      setTimeout(() => setSettingsSuccess(""), 3000);
    } catch (error) {
      setSettingsError(
        error instanceof Error ? error.message : "Failed to send OTP",
      );
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) return;

    setSettingsError("");
    setIsVerifying(true);
    try {
      const result = await api.verifyOTP({
        email: otpTargetEmail,
        code: otpCode,
        type: otpType,
        currentEmail: localStorage.getItem("adminEmail") || currentEmail,
        payload: pendingUpdate,
      });
      if (result.success) {
        // Execute the pending update
        if (otpType === "email") {
          const updatedEmail = pendingUpdate.newEmail;
          setCurrentEmail(updatedEmail);
          localStorage.setItem("adminEmail", updatedEmail);
          setSettingsSuccess("Email updated successfully!");
        } else {
          // Here you'd normally call api.updatePassword, but we're simulating local success
          setSettingsSuccess("Password security updated!");
        }

        setPendingUpdate(null);
        setOtpCode("");
        setTimeout(() => {
          setSettingsSuccess("");
          setActiveSetting("profile-list");
        }, 2000);
      }
    } catch (error) {
      setSettingsError(
        error instanceof Error ? error.message : "Verification failed",
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleChangeEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError("");

    if (!newEmail || !emailChangePassword) {
      setSettingsError("Please fill in all required fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setSettingsError("Please enter a valid email address.");
      return;
    }

    if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      setSettingsError("New email must be different from the current one.");
      return;
    }

    // For demo/logic: normally check password here
    if (emailChangePassword.length < 4) {
      setSettingsError("Verification password is too short.");
      return;
    }

    // Request OTP to the NEW email, but verifying CURRENT password
    handleRequestOTP("email", newEmail, { newEmail }, emailChangePassword);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setSettingsError("Please fill in all required fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setSettingsError("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setSettingsError("Password must be at least 6 characters long");
      return;
    }

    // Request OTP to the CURRENT email, but verifying CURRENT password
    handleRequestOTP(
      "password",
      currentEmail,
      { newPassword },
      currentPassword,
    );
  };

  // Category Handlers
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    if (categories.includes(newCategoryName.trim())) {
      setSettingsError("Category already exists");
      return;
    }
    setCategories([...categories, newCategoryName.trim()]);
    setNewCategoryName("");
    setSettingsSuccess("Category added successfully");
    setTimeout(() => setSettingsSuccess(""), 2000);
  };

  const handleDeleteCategory = (catToDelete: string) => {
    if (catToDelete === "All") return;

    // Update products to 'All' category
    setProducts(
      products.map((p) =>
        p.category === catToDelete ? { ...p, category: "All" } : p,
      ),
    );

    setCategories(categories.filter((c) => c !== catToDelete));
    setSettingsSuccess("Category deleted and products moved to 'All'");
    setTimeout(() => setSettingsSuccess(""), 2000);
  };

  const startEditing = (cat: string) => {
    setEditingCategory(cat);
    setEditCategoryValue(cat);
  };

  const handleSaveEdit = () => {
    const newVal = editCategoryValue.trim();
    if (!newVal || !editingCategory) return;
    if (categories.includes(newVal) && newVal !== editingCategory) {
      setSettingsError("Category name already exists");
      return;
    }

    // Update products use the renamed category
    setProducts(
      products.map((p) =>
        p.category === editingCategory ? { ...p, category: newVal } : p,
      ),
    );

    setCategories(categories.map((c) => (c === editingCategory ? newVal : c)));
    setEditingCategory(null);
    setSettingsSuccess("Category updated");
    setTimeout(() => setSettingsSuccess(""), 2000);
  };

  return (
    <div className="flex-1 h-full overflow-hidden flex flex-col">
      <div className="flex-1 bg-white flex flex-col md:flex-row overflow-hidden animate-in fade-in duration-500">
        {/* Left Sidebar */}
        <div className="relative w-full md:w-52 lg:w-64 overflow-hidden flex flex-col border-r border-gray-50 bg-gray-50/25">
          <div className="relative z-10 p-4 lg:p-6 flex-1 flex flex-col">
            <div className="flex items-center gap-2.5 lg:gap-3 mb-5 lg:mb-8">
              <div className="p-2 lg:p-2.5 bg-[#4285F4] rounded-lg lg:rounded-xl shadow-sm">
                <Shield size={18} className="text-white lg:w-5 lg:h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-base lg:text-lg tracking-tight text-gray-900 leading-none">
                  Settings
                </h2>
              </div>
            </div>

            <nav className="space-y-0.5 lg:space-y-1">
              <button
                onClick={() => setActiveSetting("profile-list")}
                className={`w-full flex items-center gap-2 lg:gap-3 px-3.5 py-2 lg:py-2.5 rounded-lg lg:rounded-xl transition-all duration-300 font-bold text-[11px] lg:text-sm ${
                  activeSetting === "profile-list" ||
                  activeSetting === "email-form" ||
                  activeSetting === "password-form" ||
                  activeSetting === "otp-verify"
                    ? "bg-white text-[#4285F4] shadow-sm border border-gray-100"
                    : "text-gray-500 hover:bg-white/60"
                }`}
              >
                <UserIcon size={14} className="lg:w-4 lg:h-4" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => setActiveSetting("category-list")}
                className={`w-full flex items-center gap-2 lg:gap-3 px-3.5 py-2 lg:py-2.5 rounded-lg lg:rounded-xl transition-all duration-300 font-bold text-[11px] lg:text-sm ${
                  activeSetting === "category-list"
                    ? "bg-white text-[#4285F4] shadow-sm border border-gray-100"
                    : "text-gray-500 hover:bg-white/60"
                }`}
              >
                <LayoutGrid size={14} className="lg:w-4 lg:h-4" />
                <span>Categories</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Right Content */}
        <div
          className={`flex-1 p-4 md:p-5 lg:p-6 bg-[#F5F9FF] flex flex-col overflow-y-auto no-scrollbar ${
            activeSetting !== "profile-list" &&
            activeSetting !== "category-list"
              ? "justify-center items-center"
              : ""
          }`}
        >
          {/* Messages */}
          {settingsSuccess && (
            <div className="mb-4 p-2.5 lg:p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-[10px] lg:text-xs flex items-center gap-2 animate-in slide-in-from-top-4">
              <CheckCircle2 size={14} className="lg:w-4 lg:h-4" />
              <span className="font-bold">{settingsSuccess}</span>
            </div>
          )}
          {settingsError && (
            <div className="mb-4 p-2.5 lg:p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 text-[10px] lg:text-xs flex items-center gap-2 animate-in slide-in-from-top-4">
              <AlertCircle size={14} className="lg:w-4 lg:h-4" />
              <span className="font-bold">{settingsError}</span>
            </div>
          )}

          {activeSetting === "profile-list" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="mb-4 lg:mb-6">
                <h3 className="text-xl lg:text-2xl font-extrabold text-gray-900 mb-0.5">
                  Profile
                </h3>
                <p className="text-gray-500 text-xs lg:text-sm font-medium">
                  Account identity and security settings.
                </p>
              </div>

              <div className="space-y-1 max-w-lg lg:max-w-xl">
                <button
                  onClick={() => setActiveSetting("email-form")}
                  className="w-full group flex items-center justify-between py-2 px-3 lg:py-2 lg:px-4 bg-gray-50 hover:bg-white border border-gray-100 hover:border-blue-100 hover:shadow-sm rounded-xl transition-all duration-300"
                >
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className="w-7 h-7 lg:w-9 lg:h-9 bg-white group-hover:bg-blue-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-[#4285F4] transition-all border border-gray-50 lg:border-gray-100 group-hover:border-blue-100">
                      <Mail size={14} className="lg:w-4 lg:h-4" />
                    </div>
                    <p className="text-gray-900 font-bold text-xs lg:text-sm">
                      Update Email
                    </p>
                  </div>
                  <ChevronRight
                    size={13}
                    className="text-gray-300 lg:w-4 lg:h-4 group-hover:text-[#4285F4] group-hover:translate-x-1 transition-all"
                  />
                </button>

                <button
                  onClick={() => setActiveSetting("password-form")}
                  className="w-full group flex items-center justify-between py-2 px-3 lg:py-2 lg:px-4 bg-gray-50 hover:bg-white border border-gray-100 hover:border-blue-100 hover:shadow-sm rounded-xl transition-all duration-300"
                >
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className="w-7 h-7 lg:w-9 lg:h-9 bg-white group-hover:bg-blue-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-[#4285F4] transition-all border border-gray-50 lg:border-gray-100 group-hover:border-blue-100">
                      <KeyRound size={14} className="lg:w-4 lg:h-4" />
                    </div>
                    <p className="text-gray-900 font-bold text-xs lg:text-sm">
                      Update Password
                    </p>
                  </div>
                  <ChevronRight
                    size={13}
                    className="text-gray-300 lg:w-4 lg:h-4 group-hover:text-[#4285F4] group-hover:translate-x-1 transition-all"
                  />
                </button>
              </div>
            </div>
          )}

          {activeSetting === "category-list" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col h-full overflow-hidden">
              <div className="mb-4 lg:mb-6">
                <h3 className="text-xl lg:text-2xl font-extrabold text-gray-900 mb-0.5">
                  Categories
                </h3>
                <p className="text-gray-500 text-xs lg:text-sm font-medium">
                  Manage store classification.
                </p>
              </div>

              {/* Add category form */}
              <form
                onSubmit={handleAddCategory}
                className="flex gap-2 lg:gap-2 mb-4 lg:mb-6"
              >
                <div className="relative flex-1 max-w-xs lg:max-max-w-sm">
                  <div className="absolute inset-y-0 left-0 pl-[19px] lg:pl-6 flex items-center pointer-events-none text-gray-400">
                    <LayoutGrid size={14} className="lg:w-4 lg:h-4" />
                  </div>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Add category..."
                    className="w-full pl-11 lg:pl-[52px] pr-3 lg:pr-4 py-2 lg:py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/5 focus:border-blue-500 text-gray-900 font-bold text-xs lg:text-sm transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newCategoryName.trim()}
                  className="px-4 lg:px-6 py-1.5 lg:py-2 bg-[#4285F4] text-white rounded-lg lg:rounded-xl font-bold flex items-center gap-1.5 lg:gap-2 hover:shadow-md hover:shadow-blue-500/10 disabled:opacity-50 transition-all text-[11px] lg:text-sm"
                >
                  <Plus size={14} className="lg:w-4 lg:h-4" />
                  <span>Add</span>
                </button>
              </form>

              {/* Category List */}
              <div className="flex-1 overflow-y-auto no-scrollbar pr-1 space-y-1">
                {categories.map((cat) => (
                  <div
                    key={cat}
                    className="group flex items-center justify-between py-1.5 px-3 lg:py-1.5 lg:px-4 bg-gray-50/50 rounded-lg lg:rounded-xl border border-gray-100 hover:bg-white hover:border-blue-50 hover:shadow-xs transition-all duration-200"
                  >
                    {editingCategory === cat ? (
                      <div className="flex-1 flex items-center gap-2 lg:gap-2">
                        <input
                          autoFocus
                          type="text"
                          value={editCategoryValue}
                          onChange={(e) => setEditCategoryValue(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleSaveEdit()
                          }
                          className="flex-1 px-2 py-1 lg:px-2.5 lg:py-1 rounded-md lg:rounded-lg border border-blue-200 outline-none focus:ring-2 focus:ring-blue-500/5 text-gray-900 font-bold bg-white text-[11px] lg:text-sm"
                        />
                        <button
                          onClick={handleSaveEdit}
                          className="p-1 lg:p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md lg:rounded-lg transition-colors"
                        >
                          <Check size={14} className="lg:w-4 lg:h-4" />
                        </button>
                        <button
                          onClick={() => setEditingCategory(null)}
                          className="p-1 lg:p-1.5 text-rose-600 hover:bg-rose-50 rounded-md lg:rounded-lg transition-colors"
                        >
                          <X size={14} className="lg:w-4 lg:h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2.5 lg:gap-3">
                          <div className="w-7 h-7 lg:w-8 lg:h-8 bg-white rounded-lg flex items-center justify-center text-gray-400 group-hover:text-[#4285F4] transition-colors border border-gray-50 lg:border-gray-100">
                            {getCategoryIcon(cat)}
                          </div>
                          <span className="font-bold text-gray-800 text-[11px] lg:text-sm">
                            {cat}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5 lg:gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {cat !== "All" && (
                            <>
                              <button
                                onClick={() => startEditing(cat)}
                                className="p-1 lg:p-1 text-gray-400 hover:text-[#4285F4] hover:bg-blue-50 rounded-md lg:rounded-lg transition-all"
                                title="Rename"
                              >
                                <Edit2
                                  size={12}
                                  className="lg:w-3.5 lg:h-3.5"
                                />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat)}
                                className="p-1 lg:p-1 text-gray-400 hover:text-[#EA4335] hover:bg-red-50 rounded-md lg:rounded-lg transition-all"
                                title="Delete"
                              >
                                <Trash2
                                  size={12}
                                  className="lg:w-3.5 lg:h-3.5"
                                />
                              </button>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSetting === "email-form" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-[360px] w-full bg-white p-8 rounded-[32px] shadow-sm shadow-blue-100/50">
              <button
                onClick={() => {
                  setActiveSetting("profile-list");
                  setNewEmail("");
                  setEmailChangePassword("");
                }}
                className="mb-6 flex items-center gap-1.5 text-slate-400 hover:text-blue-600 font-bold text-[9px] uppercase tracking-widest transition-all group"
              >
                <ArrowLeft
                  size={12}
                  className="group-hover:-translate-x-1 transition-transform"
                />
                Back
              </button>

              <div className="mb-6">
                <h1 className="text-2xl font-black text-[#1e293b] mb-1 tracking-tight">
                  Update Email
                </h1>
                <p className="text-slate-400 font-medium text-xs">
                  Change admin contact address.
                </p>
              </div>

              <div className="space-y-5 px-2">
                {/* New Email Input */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    New Email
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Enter new email address"
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#F8FBFF] border border-blue-50/50 focus:ring-4 focus:ring-blue-100/50 text-[#1e293b] font-bold text-xs transition-all placeholder:text-blue-300"
                    />
                  </div>
                </div>

                {/* Password Verification Input */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400">
                      <Lock size={16} />
                    </div>
                    <input
                      type="password"
                      value={emailChangePassword}
                      onChange={(e) => setEmailChangePassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#F8FBFF] border border-blue-50/50 focus:ring-4 focus:ring-blue-100/50 text-[#1e293b] font-bold text-xs transition-all placeholder:text-blue-300"
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <button
                  onClick={handleChangeEmail}
                  disabled={isSendingOTP}
                  className="w-full bg-[#0084FF] text-white py-4 rounded-xl font-bold text-sm hover:bg-[#0076E5] hover:shadow-lg hover:shadow-blue-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2"
                >
                  {isSendingOTP ? (
                    <Loader size={18} className="animate-spin" />
                  ) : (
                    "Update Email"
                  )}
                </button>
              </div>
            </div>
          )}

          {activeSetting === "password-form" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-[360px] w-full bg-white p-8 rounded-[32px] shadow-sm shadow-blue-100/50">
              <button
                onClick={() => {
                  setActiveSetting("profile-list");
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="mb-6 flex items-center gap-1.5 text-slate-400 hover:text-blue-600 font-bold text-[9px] uppercase tracking-widest transition-all group"
              >
                <ArrowLeft
                  size={12}
                  className="group-hover:-translate-x-1 transition-transform"
                />
                Back
              </button>

              <div className="mb-6">
                <h1 className="text-2xl font-black text-[#1e293b] mb-1 tracking-tight">
                  Security
                </h1>
                <p className="text-slate-400 font-medium text-xs">
                  Update admin access password.
                </p>
              </div>

              <div className="space-y-5 px-2">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Current Password
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400">
                      <Lock size={16} />
                    </div>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#F8FBFF] border border-blue-50/50 focus:ring-4 focus:ring-blue-100/50 text-[#1e293b] font-bold text-xs transition-all placeholder:text-blue-300"
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    New Password
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400">
                      <KeyRound size={16} />
                    </div>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#F8FBFF] border border-blue-50/50 focus:ring-4 focus:ring-blue-100/50 text-[#1e293b] font-bold text-xs transition-all placeholder:text-blue-300"
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Confirm New Password
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400">
                      <CheckCircle2 size={16} />
                    </div>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full pl-14 pr-4 py-3.5 rounded-2xl bg-[#F8FBFF] border border-blue-50/50 focus:ring-4 focus:ring-blue-100/50 text-[#1e293b] font-bold text-xs transition-all placeholder:text-blue-300"
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <button
                  onClick={handleChangePassword}
                  disabled={isSendingOTP}
                  className="w-full bg-[#0084FF] text-white py-4 rounded-xl font-bold text-sm hover:bg-[#0076E5] hover:shadow-lg hover:shadow-blue-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2"
                >
                  {isSendingOTP ? (
                    <Loader size={18} className="animate-spin" />
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            </div>
          )}

          {activeSetting === "otp-verify" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-[360px] w-full bg-white p-8 rounded-[32px] shadow-sm shadow-blue-100/50">
              <button
                onClick={() =>
                  setActiveSetting(
                    otpType === "email" ? "email-form" : "password-form",
                  )
                }
                className="mb-6 flex items-center gap-1.5 text-slate-400 hover:text-blue-600 font-bold text-[9px] uppercase tracking-widest transition-all group"
              >
                <ArrowLeft
                  size={12}
                  className="group-hover:-translate-x-1 transition-transform"
                />
                Back
              </button>

              <div className="mb-6">
                <h1 className="text-2xl font-black text-[#1e293b] mb-1 tracking-tight">
                  Verify Identity
                </h1>
                <p className="text-slate-400 font-medium text-xs">
                  We've sent a 6-digit code to{" "}
                  <span className="text-blue-600 font-black">
                    {otpTargetEmail}
                  </span>
                </p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-8 px-2">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) =>
                      setOtpCode(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="000000"
                    className="w-full text-center tracking-[0.5em] py-5 rounded-2xl bg-[#F8FBFF] border border-blue-50/50 focus:ring-4 focus:ring-blue-100 text-3xl font-black text-[#1e293b] transition-all placeholder:text-blue-200"
                  />
                </div>

                <button
                  type="submit"
                  disabled={otpCode.length !== 6 || isVerifying}
                  className="w-full bg-[#0084FF] text-white py-4 rounded-xl font-bold text-sm hover:bg-[#0076E5] hover:shadow-lg hover:shadow-blue-500/10 active:scale-[0.98] disabled:bg-gray-200 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  {isVerifying ? (
                    <Loader size={18} className="animate-spin" />
                  ) : (
                    "Verify & Update"
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() =>
                      handleRequestOTP(otpType, otpTargetEmail, pendingUpdate)
                    }
                    disabled={isSendingOTP}
                    className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-700 transition-colors disabled:opacity-50"
                  >
                    Resend Code
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
