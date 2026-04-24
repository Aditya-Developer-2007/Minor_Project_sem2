import { useState, useEffect, useRef, useContext } from "react";
import api from "../hooks/api";
import { Send, Copy, Bot, Loader2, Paperclip, User, Sparkles, CheckCircle2, Layout, BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { AuthContext } from "../context/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const ChatWindow = ({ currentSession, setSessions }) => {
  const { user } = useContext(AuthContext);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [localMessages, setLocalMessages] = useState([]);
  const [viewMode, setViewMode] = useState("normal"); // 'normal' or 'pro'
  const [pendingPdfText, setPendingPdfText] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const suggestions = [
    { label: "Arrest Rights", text: "Mere arrest rights kya hain?" },
    { label: "Tenant Notice", text: "Makan malik bina notice ke nikal sakta hai?" },
    { label: "Cyber Fraud", text: "Online financial fraud ki report kaise karein?" },
    { label: "FIR Online", text: "Kya hum ghar baithe online FIR file kar sakte hain?" }
  ];

  useEffect(() => {
    if (currentSession) {
      setLocalMessages(currentSession.messages);
    } else {
      setLocalMessages([]);
    }
  }, [currentSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('pdf', file);

    try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await api.post("/chats/upload", formData, config);
        setPendingPdfText(data.text);
        toast.success(`Context Loaded: ${file.name}`);
    } catch (error) {
        toast.error("Failed to process PDF");
        console.error(error);
    } finally {
        setIsUploading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() && !pendingPdfText) return;

    const userMsg = { role: "user", content: input };
    const tempMessages = [...localMessages, userMsg];
    setLocalMessages(tempMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/chats/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          chatId: currentSession._id,
          content: pendingPdfText ? `CONTEXT FROM UPLOADED PDF:\n${pendingPdfText}\n\nUSER QUESTION: ${userMsg.content}` : userMsg.content,
          stream: true
        })
      });

      setPendingPdfText(null);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "AI Service Error");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = "";
      
      setLocalMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6).trim();
            if (dataStr === "[DONE]") break;
            
            try {
              const data = JSON.parse(dataStr);
              if (data.error) {
                throw new Error(data.error);
              }
              if (data.content) {
                assistantResponse += data.content;
                setLocalMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1].content = assistantResponse;
                  return newMsgs;
                });
              }
            } catch (e) {
                if (e.message !== "Unexpected end of JSON input") {
                    throw e;
                }
            }
          }
        }
      }
      
      const { data } = await api.get(`/chats`, { headers: { Authorization: `Bearer ${user.token}` } });
      const updatedSession = data.find(s => s._id === currentSession._id);
      if (updatedSession) {
        setSessions(data);
        setLocalMessages(updatedSession.messages);
      }

    } catch (error) {
      toast.error(error.message || "AI Service Error");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    let toCopy = text;
    try {
        const parsed = JSON.parse(text);
        toCopy = viewMode === 'normal' ? parsed.normal : parsed.professional;
    } catch(e) {}
    navigator.clipboard.writeText(toCopy);
    toast.success("Advice copied!");
  };

  const MessageContent = ({ content, mode }) => {
    let mainContent = content;
    try {
        if (content.trim().startsWith('{')) {
            const parsed = JSON.parse(content);
            mainContent = mode === 'normal' ? (parsed.normal || "") : (parsed.professional || "");
        }
    } catch (e) {}

    return (
        <div className="prose prose-invert max-w-none prose-p:leading-7 prose-li:marker:text-blue-500 prose-strong:text-blue-400 prose-headings:text-white prose-headings:mb-2 text-sm md:text-[15px]">
            <ReactMarkdown>{mainContent}</ReactMarkdown>
        </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#09090b] relative text-gray-100 font-sans">
      
      {localMessages.length > 0 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex bg-[#111111]/80 backdrop-blur-xl border border-white/5 p-1 rounded-2xl shadow-2xl overflow-hidden">
                <button 
                  onClick={() => setViewMode('normal')}
                  className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'normal' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                    <User size={14} />
                    Common Citizen
                </button>
                <button 
                  onClick={() => setViewMode('pro')}
                  className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'pro' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                    <BookOpen size={14} />
                    Legal Professional
                </button>
          </div>
      )}

      <div className={`flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar ${localMessages.length === 0 ? 'flex flex-col justify-center' : 'space-y-12 pt-20 pb-40'}`}>
        {localMessages.length === 0 && (
          <div className="w-full max-w-3xl mx-auto space-y-10 animate-fadeIn">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white mb-2 shadow-2xl shadow-blue-500/20 rotate-3">
                <Bot size={40} />
              </div>
              <h3 className="text-4xl font-black text-white tracking-tighter">Your Ground-Truth <br/> Legal Assistant.</h3>
              <p className="text-gray-500 text-lg font-medium">BNS 2023 Compliant • Landmark Precedents • Hinglish Support</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setInput(s.text)}
                  className="p-6 bg-[#111111]/50 border border-white/5 rounded-[2rem] hover:border-blue-500/30 hover:bg-[#151515] transition-all text-left group relative overflow-hidden active:scale-[0.98]"
                >
                  <div className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500/10 rounded-full">
                    <Send size={14} className="text-blue-400" />
                  </div>
                  <h4 className="font-extrabold text-blue-400 mb-1 text-xs uppercase tracking-widest">{s.label}</h4>
                  <p className="text-sm text-gray-400 line-clamp-1 font-medium">{s.text}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {localMessages.map((msg, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx}
              className={`flex gap-4 max-w-4xl mx-auto ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 border border-blue-500/20 flex items-center justify-center shrink-0 mt-1 shadow-lg shadow-blue-500/5">
                  <Bot size={20} className="text-blue-400" />
                </div>
              )}
              
              <div className={`relative max-w-[85%] group ${msg.role === "user" ? "" : "flex-1"}`}>
                <div className={`px-7 py-5 rounded-[2rem] shadow-2xl leading-relaxed
                    ${msg.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-sm font-medium" 
                      : "bg-[#111111]/80 backdrop-blur-sm border border-white/5 text-gray-200 rounded-tl-sm"
                    }`}>
                  
                  {msg.role === "assistant" ? (
                    <div className="space-y-4">
                        <MessageContent content={msg.content} mode={viewMode} />
                        <div className="flex items-center justify-between pt-5 border-t border-white/5">
                            <div className="flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${viewMode === 'pro' ? 'bg-indigo-500' : 'bg-blue-500'}`}></div>
                                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                                    {viewMode === 'pro' ? 'Expert Jurisprudence Active' : 'NY-Legal Verified'}
                                </span>
                            </div>
                            <button 
                                onClick={() => copyToClipboard(msg.content)}
                                className="text-gray-500 hover:text-white transition-colors flex items-center gap-1.5 text-xs opacity-0 group-hover:opacity-100"
                            >
                                <Copy size={14} />
                                <span>Copy Advice</span>
                            </button>
                        </div>
                    </div>
                  ) : (
                    <p className="text-[15px] font-medium leading-relaxed">{msg.content}</p>
                  )}
                </div>
              </div>

              {msg.role === "user" && (
                <div className="w-10 h-10 rounded-2xl bg-gray-800 border border-white/10 flex items-center justify-center shrink-0 mt-1">
                  <User size={20} className="text-gray-300" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 max-w-4xl mx-auto items-center">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Bot size={20} className="text-blue-400 animate-pulse" />
            </div>
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin text-blue-500" size={14} />
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Compiling Ground-Truth Context...</span>
                </div>
                <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} className="h-10" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#09090b] via-[#09090b]/95 to-transparent z-10">
        <form onSubmit={handleSend} className="relative max-w-4xl mx-auto group">
          <div className="absolute inset-0 bg-blue-600/5 blur-3xl group-focus-within:bg-blue-600/10 transition-all rounded-3xl"></div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="application/pdf" 
            onChange={handleFileUpload} 
          />
          
          <div className="relative flex items-center bg-[#111111]/80 backdrop-blur-2xl border border-white/10 rounded-[28px] focus-within:border-blue-500/50 shadow-2xl transition-all h-[4.5rem] px-3">
            <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="p-4 text-gray-500 hover:text-blue-400 transition-colors disabled:opacity-50"
                title="Upload Case PDF"
            >
                {isUploading ? <Loader2 size={24} className="animate-spin" /> : <Paperclip size={24} />}
            </button>

            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={pendingPdfText ? "Ask about the uploaded PDF..." : "Analyze theft punishment in BNS..."}
                className="flex-1 bg-transparent text-gray-100 px-4 outline-none text-lg placeholder-gray-600 font-medium"
                disabled={isLoading}
            />
            
            <button 
                type="submit" 
                disabled={(!input.trim() && !pendingPdfText) || isLoading}
                className="w-14 h-14 flex items-center justify-center bg-white text-black rounded-full hover:bg-blue-50 disabled:opacity-20 disabled:hover:bg-white transition-all shadow-xl active:scale-95 group/btn"
            >
                <Send size={24} className="group-hover:rotate-12 transition-transform" fill="currentColor" />
            </button>
          </div>
          
          {pendingPdfText && (
              <div className="absolute -top-10 left-4 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-2 shadow-lg animate-bounce">
                  <Sparkles size={10} />
                  PDF Context Active
              </div>
          )}

          <div className="flex justify-center gap-6 mt-4 text-[10px] text-gray-600 font-black uppercase tracking-[0.2em]">
            <span className="flex items-center gap-2"><CheckCircle2 size={12} className="text-emerald-500" /> BNS 2023</span>
            <span className="flex items-center gap-2"><Layout size={12} className="text-indigo-500" /> Dual-Perspective</span>
            <span className="flex items-center gap-2"><Sparkles size={12} className="text-blue-500" /> Ground-Truth</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;