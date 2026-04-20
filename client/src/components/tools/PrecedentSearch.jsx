import { useState, useEffect, useContext } from 'react';
import { Search, Loader2, Scale, ExternalLink, Bookmark, Info, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../hooks/api';
import { AuthContext } from '../../context/auth-context';

const PrecedentSearch = () => {
    const { user } = useContext(AuthContext);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Live Search with Debounce
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.trim().length > 2) {
                performSearch();
            } else if (query.length === 0) {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const performSearch = async () => {
        setIsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await api.post('/tools/search', { query }, config);
            setResults(data.results);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#09090b] text-gray-100 p-4 md:p-8 overflow-hidden">
            <div className="max-w-4xl mx-auto w-full flex flex-col h-full gap-8">
                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest">
                        <Scale size={14} />
                        <span>Landmark Case Archive</span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight">Semantic Precedent Search</h1>
                    <p className="text-gray-400 text-sm max-w-lg mx-auto">
                        Describe your case situation in Hinglish. AI will find the most relevant Landmark Supreme Court / High Court precedents.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-400 transition-colors">
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                    </div>
                    <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g., Termination of employment without notice periods during pregnancy..."
                        className="w-full bg-[#111111] border border-white/5 focus:border-indigo-500/50 pl-12 pr-4 py-5 rounded-2xl text-white outline-none transition-all shadow-2xl placeholder:text-gray-600"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-500 bg-white/5 px-2 py-1 rounded border border-white/5">LIVE SEARCH ACTIVE</span>
                    </div>
                </div>

                {/* Results Section */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">
                    {results.length > 0 ? (
                        <div className="grid gap-4">
                            <AnimatePresence mode='popLayout'>
                                {results.map((caseItem, idx) => (
                                    <motion.div
                                        key={caseItem.title}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="bg-[#111111]/50 border border-white/5 p-6 rounded-2xl hover:border-indigo-500/30 transition-all group relative overflow-hidden"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="space-y-1">
                                                <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{caseItem.title}</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {caseItem.keywords.map(k => (
                                                        <span key={k} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-400 font-medium">{k}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <button className="p-2 text-gray-500 hover:text-indigo-400 transition-colors">
                                                <Bookmark size={18} />
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
                                                <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                                                    <Sparkles size={10} /> Normal Explanation
                                                </p>
                                                <p className="text-sm text-gray-300 leading-relaxed font-medium">
                                                    {caseItem.simplified_explanation}
                                                </p>
                                            </div>
                                            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                                                    <Info size={10} /> Professional Analysis
                                                </p>
                                                <p className="text-sm text-gray-400 leading-relaxed italic">
                                                    {caseItem.professional_analysis}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                                            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                                                98% SEMANTIC MATCH
                                            </div>
                                            <button className="flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                                                <span>View Full Citation</span>
                                                <ExternalLink size={14} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        !isLoading && query.length > 0 && (
                            <div className="h-40 flex flex-col items-center justify-center text-gray-600">
                                <Search size={32} className="mb-2 opacity-20" />
                                <p className="text-sm">No matching precedents found for "{query}"</p>
                            </div>
                        )
                    )}

                    {!isLoading && query.length === 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
                            <div className="p-8 rounded-3xl bg-[#111111] border border-dashed border-white/10 flex flex-col items-center text-center">
                                <Scale size={32} className="text-gray-700 mb-4" />
                                <h4 className="text-white font-bold mb-2">Comprehensive Database</h4>
                                <p className="text-gray-500 text-xs">Access over 50+ landmark Supreme Court judgments indexed for semantic search.</p>
                            </div>
                            <div className="p-8 rounded-3xl bg-[#111111] border border-dashed border-white/10 flex flex-col items-center text-center">
                                <Sparkles size={32} className="text-gray-700 mb-4" />
                                <h4 className="text-white font-bold mb-2">AI-Powered Extraction</h4>
                                <p className="text-gray-500 text-xs">Our models extract the Ratio Decidendi to match your unique case scenario.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PrecedentSearch;
