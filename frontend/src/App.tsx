import React, { useState } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import AdminPanel from "./components/AdminPanel";
import LandingPage from "./pages/LandingPage";
import { Product } from "./types";
import { UserCircle, Eye, EyeOff } from "lucide-react";
import { useStoreData } from "./hooks/useStoreData";
import { api } from "./services/api";
import loginIllustration from "./assets/login-illustration.png";

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Data Hook
  const {
    products,
    setProducts,
    transactions,
    setTransactions,
    categories,
    setCategories,
    isLoading,
  } = useStoreData();

  // Simple Auth State (should be improved in real apps)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });

  // Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const result = await api.login({ email, password });
      if (result.success) {
        setIsAuthenticated(true);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("adminEmail", result.user.email);
        setEmail("");
        setPassword("");
        setShowPassword(false);
        navigate("/admin");
      }
    } catch (error) {
      setLoginError(
        error instanceof Error
          ? error.message
          : "Login failed. Please try again.",
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("adminEmail");
    navigate("/");
  };

  const handleAddToCart = (product: Product) => {
    console.log(`Added ${product.name} to cart`);
  };

  const handleViewProduct = (productId: string) => {
    navigate("/admin/inventory");
    // The AdminPanel component will need to handle scrolling to the product
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <LandingPage
            products={products}
            categories={categories}
            isLoading={isLoading}
            onLoginClick={() => navigate("/login")}
            onAddToCart={handleAddToCart}
            onViewProduct={handleViewProduct}
          />
        }
      />
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/admin" replace />
          ) : (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 md:p-6 lg:p-8">
              <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 w-full md:max-w-2xl lg:max-w-4xl overflow-hidden flex flex-col md:flex-row min-h-[480px] lg:min-h-[500px] border border-gray-100/50">
                {/* Left Side: Illustration */}
                <div className="md:w-1/2 bg-[#E0F2FE] relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-40">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 blur-[120px] rounded-full animate-pulse-slow"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>
                  </div>
                  <img
                    src={loginIllustration}
                    alt="Grocery Shopping Illustration"
                    className="relative z-10 w-full h-full object-cover animate-in zoom-in duration-700"
                  />
                </div>

                {/* Right Side: Form */}
                <div className="md:w-1/2 p-5 lg:p-10 flex flex-col justify-center bg-white relative">
                  <div className="max-w-sm mx-auto w-full">
                    {/* branding */}
                    <div className="flex items-center gap-3 mb-4 lg:mb-5 animate-in fade-in slide-in-from-top-4 duration-500">
                      <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                        <UserCircle size={20} />
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold tracking-tight text-gray-900">
                          Store{" "}
                          <span className="text-orange-500 font-medium">
                            Login
                          </span>
                        </h3>
                      </div>
                    </div>

                    <div className="mb-4 lg:mb-6 animate-in fade-in slide-in-from-top-4 duration-500 delay-150">
                      <h1 className="text-2xl lg:text-3xl font-extrabold text-[#1E293B] mb-2 tracking-tight">
                        Welcome back
                      </h1>
                      <p className="text-gray-400 font-medium text-sm lg:text-base leading-relaxed">
                        Login to access your POS dashboard.
                      </p>
                    </div>

                    <form
                      onSubmit={handleLogin}
                      className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300"
                    >
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-[0.15em] ml-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-5 py-3.5 rounded-2xl bg-[#F8FAFC] border border-gray-100/80 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400/50 text-gray-900 font-medium transition-all placeholder:text-gray-300 shadow-sm"
                          placeholder="you@example.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-[0.15em] ml-1">
                          Password
                        </label>
                        <div className="relative group">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-5 pr-14 py-3.5 rounded-2xl bg-[#F8FAFC] border border-gray-100/80 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400/50 text-gray-900 font-medium transition-all placeholder:text-gray-300 shadow-sm"
                            placeholder="••••••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-blue-500 p-2 transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff size={20} />
                            ) : (
                              <Eye size={20} />
                            )}
                          </button>
                        </div>
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            className="text-[11px] font-bold text-gray-400 hover:text-blue-500 transition-colors uppercase tracking-widest"
                          >
                            Forgot password?
                          </button>
                        </div>
                      </div>

                      {loginError && (
                        <div className="bg-rose-50 text-rose-600 text-xs py-3.5 px-5 rounded-2xl text-center font-bold border border-rose-100 animate-in shake duration-300">
                          {loginError}
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full bg-[#3B82F6] text-white py-4 rounded-[1.25rem] font-bold hover:bg-[#2563EB] transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] text-base lg:text-lg mt-2 flex items-center justify-center gap-2 group"
                      >
                        Log In
                      </button>

                      <div className="pt-4 mt-5 border-t border-gray-50 flex flex-col items-center">
                        <button
                          type="button"
                          onClick={() => navigate("/")}
                          className="flex items-center gap-2.5 text-gray-400 hover:text-blue-500 transition-all group font-bold text-sm"
                        >
                          <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="transform group-hover:-translate-x-1 transition-transform"
                            >
                              <path d="M9 14 4 9l5-5" />
                              <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
                            </svg>
                          </div>
                          Return to Store
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      />
      <Route
        path="/admin/*"
        element={
          isAuthenticated ? (
            <AdminPanel
              products={products}
              setProducts={setProducts}
              transactions={transactions}
              setTransactions={setTransactions}
              categories={categories}
              setCategories={setCategories}
              onLogout={handleLogout}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      {/* Catch-all for undefined routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
