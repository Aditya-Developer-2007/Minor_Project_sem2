import { useState, useEffect, useContext } from 'react';
import { Languages, Loader2, Map, ArrowRight, ClipboardList, Info, Split, Table, CheckCircle2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../hooks/api';
import { AuthContext } from '../../context/auth-context';

const LawMapper = () => {
    const { user } = useContext(AuthContext);
    const [query, setQuery] = useState('');
    const [matches, setMatches] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Live Mapping with Debounce
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.trim().length > 1) {
                performMapping();
            } else if (query.length === 0) {
                setMatches([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const performMapping = async () => {
        setIsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await api.post('/tools/map', { query }, config);
            setMatches(data.matches);
        } catch (error) {
            console.error("Mapping failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

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

                {/* Search Bar */}
                <div className="relative group max-w-2xl mx-auto w-full">
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
                                                    <p className="text-red-400 font-bold uppercase tracking-widest text-xs">{item.offense}</p>
                                                </div>
                                            </div>

                                            {/* Transition Arrow */}
                                            <div className="bg-emerald-500/10 p-4 rounded-full border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
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
                            !isLoading && query.length > 0 && (
                                <div className="h-40 flex flex-col items-center justify-center text-gray-600">
                                    <Map size={32} className="mb-2 opacity-20" />
                                    <p className="text-sm">No mapping found for "{query}"</p>
                                </div>
                            )
                        )}
                    </AnimatePresence>

                    {!isLoading && query.length === 0 && (
                        <div className="mt-12 space-y-12">
                             <div className="bg-[#111111]/30 border border-white/5 p-10 rounded-[3rem] text-center space-y-4">
                                <Table size={48} className="mx-auto text-gray-800" />
                                <h3 className="text-2xl font-bold">Why the new mapping?</h3>
                                <p className="text-gray-500 text-sm max-w-2xl mx-auto">
                                    The Bharatiya Nyaya Sanhita (BNS) replaces the age-old IPC. Sections have been rearranged and updated to reflect modern Indian judicial values and to remove colonial-era terminology.
                                </p>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { label: '302 → 101', desc: 'Murder' },
                                    { label: '307 → 109', desc: 'Attempt to Murder' },
                                    { label: '420 → 318', desc: 'Cheating' }
                                ].map((badge, i) => (
                                    <div key={i} className="flex flex-col items-center p-6 bg-white/5 rounded-3xl border border-white/5">
                                        <span className="text-xl font-black text-white">{badge.label}</span>
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{badge.desc}</span>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LawMapper;
