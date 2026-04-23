import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Check, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';

const DisclaimerModal = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const hasAccepted = localStorage.getItem('nyai_disclaimer_accepted');
        if (!hasAccepted) {
            setIsOpen(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('nyai_disclaimer_accepted', 'true');
        setIsOpen(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-[#0e0e10] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
                    >
                        {/* Header Decoration */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-500"></div>
                        
                        <div className="p-8 sm:p-12 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                    <ShieldAlert size={32} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tight">Legal Protocol & Disclaimer</h2>
                                    <p className="text-gray-500 font-medium">Important information for NYAI users</p>
                                </div>
                            </div>

                            <div className="space-y-6 text-gray-400 leading-relaxed font-medium text-[15px]">
                                <p>
                                    NYAI is an artificial intelligence system designed to provide <span className="text-white">legal information and research assistance</span>. It is not a licensed attorney and cannot provide legal advice.
                                </p>
                                
                                <ul className="space-y-4">
                                    <li className="flex gap-3">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
                                        <span>Information provided by NYAI should be verified with the official BNS/IPC gazettes and qualified legal professionals.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
                                        <span>Use of this system does not create an attorney-client relationship.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
                                        <span>AI can occasionally generate inaccurate results. NYAI is not liable for actions taken based on its responses.</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <button
                                    onClick={handleAccept}
                                    className="flex-1 bg-white text-black hover:bg-gray-100 px-8 py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xl shadow-white/5"
                                >
                                    <Check size={20} />
                                    I Understand & Accept
                                </button>
                                <a 
                                    href="https://legal.gov.in" 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="px-8 py-4 rounded-2xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all font-bold flex items-center justify-center gap-2 active:scale-95"
                                >
                                    Legal Resources
                                    <ExternalLink size={16} />
                                </a>
                            </div>
                        </div>

                        <div className="bg-white/5 p-4 text-center">
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">NYAI Protocol v2.5 • Security & Compliance Module</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DisclaimerModal;
