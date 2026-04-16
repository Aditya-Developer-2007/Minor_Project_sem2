import { motion } from "framer-motion";
import { Shield, Zap, ArrowRight, CheckCircle } from "lucide-react";

const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tighter text-white">NYAI</span>
        </div>
        <button 
          onClick={onGetStarted}
          className="px-5 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
        >
          Sign In
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-blue-400 text-xs font-medium mb-8">
            <Zap size={12} />
            <span>Powered by Advanced AI Models</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent pb-2">
            Your Personal AI <br /> Legal Assistant.
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Navigate the complexities of Indian Law with ease. Get instant, accurate legal insights tailored to your situation in simple Hinglish.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onGetStarted}
              className="group relative px-8 py-4 bg-white text-black rounded-full font-semibold text-lg hover:bg-gray-200 transition-all flex items-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={onGetStarted} className="px-8 py-4 rounded-full font-semibold text-lg text-gray-400 hover:text-white border border-white/10 hover:bg-white/5 transition-all">
              View Demo
            </button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mt-32 text-left">
          {[
            {
              icon: <Shield className="w-6 h-6 text-blue-400" />,
              title: "Legal Protection",
              desc: "Understand your rights and legal standing in any situation instantly."
            },
            {
              icon: <Zap className="w-6 h-6 text-purple-400" />,
              title: "Instant Analysis",
              desc: "Get immediate answers to complex legal queries without the wait."
            },
            {
              icon: <CheckCircle className="w-6 h-6 text-green-400" />,
              title: "Simplified Language",
              desc: "Complex legal jargon translated into easy-to-understand Hinglish."
            }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="p-6 rounded-2xl bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="mb-4 p-3 bg-white/5 rounded-xl w-fit">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-100">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="border-t border-white/5 py-12 text-center text-gray-600 text-sm">
        <p>&copy; 2024 NYAI Legal Assistant. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;