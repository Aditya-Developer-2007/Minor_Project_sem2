import { useState, useContext } from "react";
import { AuthContext } from "../context/auth-context";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, Bot, Shield, Key, Mail, User, Zap } from "lucide-react";
import toast from "react-hot-toast";

export const AuthPage = ({ onBackToHome }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.name, formData.email, formData.password);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] bg-[#111111]/80 backdrop-blur-2xl border border-white/5 p-10 rounded-[32px] shadow-2xl relative z-10"
      >
        <button 
          onClick={onBackToHome}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 text-sm group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Landing
        </button>

        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Bot size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tighter text-white">NYAI</h1>
            <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Protocol v4.0</p>
          </div>
        </div>

        <div className="space-y-2 mb-8">
            <h2 className="text-2xl font-bold text-white">
            {isLogin ? "Welcome Back Counselor" : "Join the Legal Future"}
            </h2>
            <p className="text-gray-500 text-sm">
            Please enter your credentials to access the terminal.
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors">
                    <User size={18} />
                </div>
                <input
                type="text"
                placeholder="Full Name"
                className="w-full bg-[#09090b] border border-white/5 focus:border-blue-500/50 pl-12 pr-4 py-3.5 rounded-xl text-white text-sm outline-none transition-all placeholder-gray-600 shadow-inner"
                value={formData.name}
                required
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
            </div>
          )}
          
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors">
                <Mail size={18} />
            </div>
            <input
                type="email"
                placeholder="Email Address"
                className="w-full bg-[#09090b] border border-white/5 focus:border-blue-500/50 pl-12 pr-4 py-3.5 rounded-xl text-white text-sm outline-none transition-all placeholder-gray-600 shadow-inner"
                value={formData.email}
                required
                onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors">
                <Key size={18} />
            </div>
            <input
                type="password"
                placeholder="Secure Password"
                className="w-full bg-[#09090b] border border-white/5 focus:border-blue-500/50 pl-12 pr-4 py-3.5 rounded-xl text-white text-sm outline-none transition-all placeholder-gray-600 shadow-inner"
                value={formData.password}
                required
                minLength={6}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          
          {isLogin && (
            <div className="flex justify-end">
              <button 
                type="button" 
                onClick={() => toast.error("Please contact admin to reset password.")}
                className="text-[11px] text-gray-500 hover:text-blue-400 transition-colors uppercase font-bold tracking-wider"
              >
                Forgot Key?
              </button>
            </div>
          )}

          <button 
            disabled={isLoading}
            className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-blue-50 transition-all mt-4 text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 shadow-xl shadow-white/5"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : (isLogin ? <Shield size={18} /> : <Zap size={18} />)}
            {isLogin ? "Authenticate" : "Initialize Account"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs text-gray-500 hover:text-white transition-colors uppercase tracking-widest font-bold"
          >
            {isLogin ? "Create New Access Key" : "Already have Credentials?"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};