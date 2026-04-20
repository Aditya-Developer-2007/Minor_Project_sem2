import { motion } from "framer-motion";
import { Shield, Zap, ArrowRight, CheckCircle, Scale, Globe, Lock } from "lucide-react";

const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans selection:bg-blue-500/30 overflow-hidden relative">
      {/* Aurora Background Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <nav className="flex items-center justify-between px-8 py-8 max-w-7xl mx-auto relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center font-black text-xl shadow-xl shadow-white/10">NY</div>
          <span className="text-2xl font-black tracking-tighter text-white">NYAI</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-500 uppercase tracking-widest">
            <a href="#" className="hover:text-blue-500 transition-colors">Solutions</a>
            <a href="#" className="hover:text-blue-500 transition-colors">Laws</a>
            <a href="#" className="hover:text-blue-500 transition-colors">Pricing</a>
        </div>
        <button 
          onClick={onGetStarted}
          className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-bold transition-all backdrop-blur-md"
        >
          Access Terminal
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-32 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-10">
            <Zap size={14} className="animate-pulse" />
            <span>Next-Gen Legal Protocol Active</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-10 leading-[0.9]">
            The Future of <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500">Legal Intelligence.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-14 leading-relaxed font-medium">
            De-bottlenecking the Indian Judiciary with Contextual AI. Get precise legal insights, case summaries, and law mapping in clear Hinglish.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={onGetStarted}
              className="group relative px-10 py-5 bg-white text-black rounded-2xl font-black text-lg hover:bg-blue-50 transition-all flex items-center gap-3 shadow-2xl shadow-white/5 active:scale-95"
            >
              Start Consultations
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={onGetStarted} className="px-10 py-5 rounded-2xl font-bold text-lg text-gray-400 hover:text-white border border-white/10 hover:bg-white/5 transition-all backdrop-blur-md active:scale-95">
              Explore Tools
            </button>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-40 text-left">
          {[
            {
              icon: <Scale className="w-6 h-6 text-blue-500" />,
              title: "Judicial Precision",
              desc: "Engineered specifically for Indian legal contexts including BNS 2023 and Landmark Precedents."
            },
            {
              icon: <Globe className="w-6 h-6 text-indigo-500" />,
              title: "Cross-Lingual Layer",
              desc: "Breaking language barriers with advanced regional-to-national law mapping technology."
            },
            {
              icon: <Lock className="w-6 h-6 text-emerald-500" />,
              title: "Privacy First",
              desc: "Secure, in-memory processing of sensitive legal documents and judicial consultations."
            }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="p-8 rounded-[32px] bg-[#111111]/50 border border-white/5 hover:border-blue-500/20 transition-all group backdrop-blur-sm shadow-xl"
            >
              <div className="mb-6 p-4 bg-white/5 rounded-2xl w-fit group-hover:scale-110 group-hover:rotate-3 transition-transform">{feature.icon}</div>
              <h3 className="text-xl font-black mb-3 text-white tracking-tight">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed text-sm font-medium">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="border-t border-white/5 py-16 mt-20 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center font-bold text-sm">NY</div>
                <span className="font-black text-white text-lg tracking-tighter">NYAI</span>
            </div>
            <p className="text-gray-600 text-sm font-medium tracking-wide">
                &copy; 2026 NYAI Legal Intelligence Systems. Built for the next billion users.
            </p>
            <div className="flex items-center gap-6 text-gray-500 font-bold text-xs uppercase tracking-widest">
                <a href="#" className="hover:text-white transition-colors">Security</a>
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                <a href="#" className="hover:text-white transition-colors">Terms</a>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;