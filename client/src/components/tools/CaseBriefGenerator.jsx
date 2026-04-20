import { useState, useContext, useRef } from 'react';
import { FileText, Upload, Send, Loader2, Copy, Check, FileUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../context/auth-context';
import api from '../../hooks/api';
import toast from 'react-hot-toast';

const CaseBriefGenerator = ({ onBriefSaved }) => {
    const { user } = useContext(AuthContext);
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const [results, setResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const fileInputRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text && !file) return;

        setIsLoading(true);
        setResults(null);
        try {
            const formData = new FormData();
            if (file) {
                formData.append('pdf', file);
            } else {
                formData.append('text', text);
            }

            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await api.post('/tools/summarize', formData, config);
            setResults(data.summary);

            // Auto-save brief as a chat session in the background
            try {
                await api.post('/chats/save-brief', { 
                    summary: data.summary, 
                    fileName: file ? file.name : (text.substring(0, 20) + "...") 
                }, config);
                if (onBriefSaved) onBriefSaved();
                toast.success("Brief saved to history!");
            } catch (e) {
                console.error("Auto-save failed", e);
            }
        } catch (error) {
            console.error("Brief generation failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(results);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setText(''); // Clear text if file is uploaded
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
            <header className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 mb-2">
                    <FileText size={28} />
                </div>
                <h2 className="text-2xl font-bold text-white">Case Brief Generator</h2>
                <p className="text-gray-400 max-w-lg mx-auto">Upload a legal judgment or paste the text to get a structured 5-line Hinglish summary with Ratio Decidendi.</p>
            </header>

            <div className="grid grid-cols-1 gap-6">
                <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 shadow-xl">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative group">
                            <textarea
                                value={text}
                                onChange={(e) => { setText(e.target.value); if (e.target.value) setFile(null); }}
                                placeholder="Paste the judgment text here..."
                                className="w-full h-48 bg-[#09090b] text-gray-200 p-4 rounded-xl border border-white/10 focus:border-blue-500/50 outline-none transition-all resize-none placeholder-gray-600 text-sm"
                            />
                            {!text && !file && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                                    <FileUp size={48} />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="application/pdf" 
                                onChange={handleFileChange}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all text-sm font-medium ${
                                    file ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-[#1a1a1a] border-white/10 text-gray-400 hover:text-white"
                                }`}
                            >
                                <Upload size={18} />
                                {file ? file.name : "Upload PDF Judgment"}
                            </button>

                            <button
                                type="submit"
                                disabled={isLoading || (!text && !file)}
                                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg transition-all font-medium shadow-lg shadow-blue-600/20 active:scale-95"
                            >
                                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                <span>Generate Brief</span>
                            </button>
                        </div>
                    </form>
                </div>

                <AnimatePresence>
                    {results && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#111111] border border-white/5 rounded-2xl p-8 shadow-2xl relative group"
                        >
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button
                                    onClick={handleCopy}
                                    className="p-2 bg-[#1a1a1a] text-gray-400 hover:text-white rounded-lg transition-all border border-white/5"
                                    title="Copy Summary"
                                >
                                    {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                                </button>
                            </div>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">NY</div>
                                <h3 className="text-lg font-semibold text-white">Legal Summary (Hinglish)</h3>
                            </div>

                            <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-p:leading-8 prose-li:text-gray-300 prose-strong:text-blue-400 prose-ul:space-y-4">
                                <ReactMarkdown>{results}</ReactMarkdown>
                            </div>
                            
                            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Case Briefing Tool • NYAI Protocol v2.5</p>
                                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                    AI Verified
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CaseBriefGenerator;
