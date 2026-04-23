import { useState, useEffect, useContext } from 'react';
import { Languages, Loader2, Map, ArrowRight, ClipboardList, Info, Split, Table, CheckCircle2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../hooks/api';
import { AuthContext } from '../../context/auth-context';

const LawMapper = () => {
    const { user } = useContext(AuthContext);
    const [query, setQuery] = useState('');
    const [allMatches, setAllMatches] = useState([]);
    const [matches, setMatches] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const suggestions = [
        { ipc: "302", label: "Murder" },
        { ipc: "420", label: "Cheating" },
        { ipc: "376", label: "Rape" },
        { ipc: "307", label: "Attempt to Murder" },
        { ipc: "379", label: "Theft" },
        { ipc: "124A", label: "Sedition" }
    ];

    // Initial Load
    useEffect(() => {
        fetchAllMappings();
    }, []);

    const fetchAllMappings = async () => {
        setIsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await api.post('/tools/map', { query: "" }, config);
            setAllMatches(data.matches);
            setMatches(data.matches);
        } catch (error) {
            console.error("Fetch failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Live Filtering
    useEffect(() => {
        if (query.trim().length === 0) {
            setMatches(allMatches);
        } else {
            const filtered = allMatches.filter(m => 
                m.ipc.toLowerCase().includes(query.toLowerCase()) ||
                m.bns.toLowerCase().includes(query.toLowerCase()) ||
                m.offense.toLowerCase().includes(query.toLowerCase())
            );
            setMatches(filtered);
        }
    }, [query, allMatches]);

    return (
        <div className="h-full flex flex-col bg-[#09090b] text-gray-100 p-4 md:p-8 overflow-hidden font-sans">
            <div className="max-w-5xl mx-auto w-full flex flex-col h-full gap-8">
                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                        <Map size={14} />
                        <span>BNS 2023 Cross-Referencer</span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight">Cross-Lingual Law Mapper</h1>
                    <p className="text-gray-400 text-sm max-w-xl mx-auto">
                        Enter any old IPC section or an offense name. We'll map it to the new Bharatiya Nyaya Sanhita (BNS) equivalent instantly.
                    </p>
                </div>

                {/* Search Bar & Suggestions */}
                <div className="space-y-6 max-w-2xl mx-auto w-full">
                    <div className="relative group">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-400 transition-colors">
                            {isLoading ? <Loader2 className="animate-spin" size={22} /> : <Languages size={22} />}
                        </div>
                        <input 
                            type="text" 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search IPC 302, 420, or 'Theft'..."
                            className="w-full bg-[#111111] border border-white/5 focus:border-emerald-500/50 pl-16 pr-6 py-5 rounded-[2rem] text-white outline-none transition-all shadow-2xl placeholder:text-gray-600 text-lg"
                        />
                    </div>

                    {/* Suggestions Chips */}
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest mr-2">Quick Search:</span>
                        {suggestions.map((s) => (
                            <button
                                key={s.ipc}
                                onClick={() => setQuery(s.ipc)}
                                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-gray-400 text-[10px] font-bold hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400 transition-all active:scale-95"
                            >
                                IPC {s.ipc} ({s.label})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Comparison Grid */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-20">
                    <AnimatePresence mode='popLayout'>
                        {matches.length > 0 ? (
                            <div className="grid gap-6">
                                {matches.map((item, idx) => (
                                    <motion.div
                                        key={item.ipc}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="bg-[#111111]/50 border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative group"
                                    >
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <Split size={80} className="rotate-12" />
                                        </div>

                                        <div className="p-8 flex flex-col md:flex-row items-center gap-12 relative z-10">
                                            {/* Old Law (IPC) */}
                                            <div className="flex-1 w-full space-y-4">
                                                <div className="flex items-center gap-2 text-gray-500 font-black text-[10px] uppercase tracking-[0.2em] mb-2">
                                                    <ClipboardList size={14} /> OLD REGIME (IPC)
                                                </div>
                                                <div className="bg-red-500/5 border border-red-500/10 p-6 rounded-2xl">
                                                    <h3 className="text-4xl font-black text-white mb-2">Section {item.ipc}</h3>
                                                    <p className="text-red-400 font-bold uppercase tracking-widest text-xs truncate">{item.offense}</p>
                                                </div>
                                            </div>

                                            {/* Transition Arrow */}
                                            <div className="bg-emerald-500/10 p-4 rounded-full border border-emerald-500/20 shadow-lg shadow-emerald-500/10 hidden md:block">
                                                <ArrowRight size={32} className="text-emerald-400" />
                                            </div>

                                            {/* New Law (BNS) */}
                                            <div className="flex-1 w-full space-y-4">
                                                <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-[0.2em] mb-2">
                                                    <CheckCircle2 size={14} /> NEW REGIME (BNS)
                                                </div>
                                                <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl shadow-xl shadow-emerald-500/5">
                                                    <h3 className="text-4xl font-black text-white mb-2">Section {item.bns}</h3>
                                                    <p className="text-emerald-400 font-bold uppercase tracking-widest text-xs">Updated Provision</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Description Footer */}
                                        <div className="bg-white/5 px-8 py-6 flex flex-col md:flex-row gap-6 border-t border-white/5">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                    <Info size={12} /> Legal Change Description
                                                </div>
                                                <p className="text-gray-300 text-sm leading-relaxed">{item.change}</p>
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                                                    <Sparkles size={12} /> Simplified Meaning (Normal)
                                                </div>
                                                <p className="text-emerald-400/90 text-sm leading-relaxed italic">{item.simplified}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            !isLoading && (
                                <div className="h-60 flex flex-col items-center justify-center text-gray-600 bg-[#111111]/30 border border-dashed border-white/5 rounded-3xl">
                                    <Map size={48} className="mb-4 opacity-10" />
                                    <p className="text-sm font-medium">No legal mapping found for "{query}"</p>
                                    <button 
                                        onClick={() => setQuery('')}
                                        className="mt-4 text-xs text-emerald-400 font-bold hover:underline"
                                    >
                                        Clear search and view all
                                    </button>
                                </div>
                            )
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default LawMapper;
