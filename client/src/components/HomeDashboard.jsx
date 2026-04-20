import { useContext } from 'react';
import { AuthContext } from '../context/auth-context';
import { ToolContext } from '../context/ToolContext';
import { Bot, Briefcase, Search, Languages, MessageSquare, ArrowRight, Star, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const HomeDashboard = ({ onNewChat }) => {
    const { user } = useContext(AuthContext);
    const { setActiveTool } = useContext(ToolContext);

    const stats = [
        { label: 'AI Accuracy', value: '99.2%', icon: ShieldCheck, color: 'text-green-400' },
        { label: 'Processing Speed', value: '1.2s', icon: Zap, color: 'text-yellow-400' },
        { label: 'Active Consultation', value: 'PRO', icon: Star, color: 'text-blue-400' },
    ];

    const tools = [
        { id: 'brief', title: 'Case Brief Generator', desc: 'Summarize judgments into 5 lines.', icon: Briefcase, color: 'bg-blue-600' },
        { id: 'search', title: 'Precedent Search', desc: 'Find relevant landmark cases.', icon: Search, color: 'bg-indigo-600' },
        { id: 'mapper', title: 'Law Mapper', icon: Languages, desc: 'Cross-lingual law comparison.', color: 'bg-emerald-600' },
    ];

    return (
        <div className="flex-1 overflow-y-auto bg-[#09090b] text-gray-100 p-8 custom-scrollbar">
            <div className="max-w-5xl mx-auto space-y-12">
                {/* Hero Section */}
                <header className="space-y-4">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider"
                    >
                        <Bot size={14} />
                        <span>Intelligence v4.0 Active</span>
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl sm:text-5xl font-extrabold tracking-tight"
                    >
                        Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">{user?.name}</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-400 text-lg max-w-2xl"
                    >
                        Your advanced legal AI co-pilot is ready. Start a new consultation or use one of our specialized tools below.
                    </motion.p>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {stats.map((stat, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            className="bg-[#111111] border border-white/5 p-6 rounded-2xl flex items-center gap-4 hover:border-white/10 transition-all hover:translate-y-[-2px]"
                        >
                            <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Tools Section */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                             Specialized Legal Tools
                        </h2>
                        <button className="text-xs text-blue-400 font-bold uppercase tracking-widest hover:text-blue-300 transition-colors">View All Tools</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {tools.map((tool, i) => (
                            <motion.button
                                key={i}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setActiveTool(tool.id)}
                                className="bg-[#111111] border border-white/5 p-6 rounded-2xl text-left group hover:border-blue-500/30 transition-all shadow-xl"
                            >
                                <div className={`w-12 h-12 rounded-xl ${tool.color} flex items-center justify-center mb-4 shadow-lg group-hover:rotate-6 transition-transform text-white`}>
                                    <tool.icon size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">{tool.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed mb-4">{tool.desc}</p>
                                <div className="flex items-center gap-2 text-xs font-bold text-blue-400 group-hover:translate-x-1 transition-transform">
                                    <span>Launch Tool</span>
                                    <ArrowRight size={14} />
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </section>

                {/* Quick Actions */}
                <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between shadow-2xl shadow-blue-600/20 gap-6">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-white">Need personal legal advice?</h2>
                        <p className="text-blue-100/80">Start a real-time conversation and get answers in Hinglish instantly.</p>
                    </div>
                    <button 
                        onClick={onNewChat}
                        className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-white/90 transition-all flex items-center gap-2 whitespace-nowrap active:scale-95"
                    >
                        <MessageSquare size={18} />
                        Start Consulting
                    </button>
                </section>
            </div>
        </div>
    );
};

export default HomeDashboard;
