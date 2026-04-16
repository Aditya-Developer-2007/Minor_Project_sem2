import { useState, useContext } from "react";
import { AuthContext } from "../context/auth-context";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft } from "lucide-react";

export const AuthPage = ({ onBackToHome }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.name, formData.email, formData.password);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[400px] bg-[#09090b] border border-white/10 p-8 rounded-2xl shadow-2xl"
      >
        <button 
          onClick={onBackToHome}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-6 text-sm group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>
        <div className="flex justify-center mb-8">
          <h1 className="text-4xl font-bold tracking-tighter text-white">NYAI</h1>
        </div>
        <h2 className="text-2xl font-bold text-center text-white mb-2">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-gray-500 text-center mb-8 text-sm">
          Access your personal AI legal assistant
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              className="w-full bg-[#18181b] border border-transparent focus:border-gray-600 p-3 rounded-lg text-white text-sm outline-none transition-all placeholder-gray-600"
              value={formData.name}
              required
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          )}
          <input
            type="email"
            placeholder="Email Address"
            className="w-full bg-[#18181b] border border-transparent focus:border-gray-600 p-3 rounded-lg text-white text-sm outline-none transition-all placeholder-gray-600"
            value={formData.email}
            required
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-[#18181b] border border-transparent focus:border-gray-600 p-3 rounded-lg text-white text-sm outline-none transition-all placeholder-gray-600"
            value={formData.password}
            required
            minLength={6}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          
          {isLogin && (
            <div className="flex justify-end">
              <button 
                type="button" 
                onClick={() => alert("Password reset functionality is under development. Please contact support or try again later.")}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button 
            disabled={isLoading}
            className="w-full bg-white text-black font-medium py-3 rounded-lg hover:bg-gray-200 transition-colors mt-2 text-sm flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isLoading && <Loader2 className="animate-spin" size={16} />}
            {isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-gray-500 hover:text-white transition-colors"
          >
            {isLogin ? "Need an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};