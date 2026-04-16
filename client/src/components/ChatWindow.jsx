import { useState, useEffect, useRef, useContext } from "react";
import api from "../hooks/api";
import { Send, Copy, Bot, Loader2, Paperclip } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { AuthContext } from "../context/auth-context";
import Typewriter from "./TypewriterEffect";
import { motion, AnimatePresence } from "framer-motion";

const ChatWindow = ({ currentSession, setSessions }) => {
  const { user } = useContext(AuthContext);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [localMessages, setLocalMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const suggestions = [
    { label: "Arrest Rights", text: "What are my rights if arrested?" },
    { label: "Rent Agreement", text: "Draft a rental agreement template." },
    { label: "Consumer Case", text: "How to file a consumer court case?" },
    { label: "Cyber Fraud", text: "Steps to report online financial fraud." }
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

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setLocalMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await api.post("/chats/message", {
        chatId: currentSession._id,
        content: userMsg.content,
      }, config);
      
      setSessions((prev) => prev.map(s => s._id === data._id ? data : s));
      setLocalMessages(data.messages);
    } catch (error) {
      console.error("Error sending message", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('chatId', currentSession._id);

    // Optimistic UI: Show uploading state
    setLocalMessages((prev) => [...prev, { role: "user", content: `📄 Uploading: ${file.name}...` }]);

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}`, "Content-Type": "multipart/form-data" } };
      const { data } = await api.post("/chats/upload", formData, config);
      
      setSessions((prev) => prev.map(s => s._id === data._id ? data : s));
      setLocalMessages(data.messages);
    } catch (error) {
      console.error("Error uploading file", error);
      alert("Failed to upload PDF");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Legal advice copied to clipboard.");
  };

  if (!currentSession) return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#09090b] text-gray-400">
      <div className="mb-8">
        <h1 className="text-6xl font-bold text-white tracking-tighter opacity-20">NYAI</h1>
      </div>
      <h3 className="text-xl font-medium text-gray-200 mb-2">Welcome to NYAI</h3>
      <p className="text-sm text-gray-500">Select a consultation or start a new one.</p>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#09090b] relative text-gray-100 font-sans">
      {/* Minimal Header */}
      <div className="h-14 flex items-center justify-between px-6 sticky top-0 z-10 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold tracking-tight text-white">NYAI</span>
          <div className="h-4 w-[1px] bg-gray-800"></div>
          <h2 className="text-xs font-medium text-gray-400 tracking-wide uppercase truncate max-w-[200px]">{currentSession.title}</h2>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar ${localMessages.length === 0 ? 'flex flex-col justify-center' : 'space-y-8'}`}>
        {localMessages.length === 0 && (
          <div className="w-full max-w-2xl mx-auto space-y-8 animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 mb-4">
                <Bot size={24} className="text-gray-200" />
              </div>
              <h3 className="text-xl font-medium text-white">How can I help you today?</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setInput(s.text)}
                  className="p-4 bg-[#18181b] border border-white/5 rounded-xl hover:bg-[#27272a] hover:border-white/10 transition-all text-left group"
                >
                  <h4 className="font-medium text-gray-200 mb-1 text-sm group-hover:text-blue-400 transition-colors">{s.label}</h4>
                  <p className="text-xs text-gray-500">{s.text}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {localMessages.map((msg, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx}
              className={`flex gap-4 max-w-3xl mx-auto ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {/* Avatar only for AI */}
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-1">
                  <Bot size={16} className="text-white" />
                </div>
              )}
              
              <div className={`relative max-w-[85%] px-5 py-3.5 text-[15px] leading-7 
                ${msg.role === "user"
                  ? "bg-[#2f2f2f] text-white rounded-3xl rounded-tr-md" // User: Dark Pill
                  : "text-gray-200 pl-0" // AI: Clean Text (Gemini Style)
                }`}>
                
                {msg.role === "assistant" ? (
                   (idx === localMessages.length - 1 && isLoading === false) ? 
                    <Typewriter text={msg.content} speed={5} /> : 
                    <div className="prose prose-invert max-w-none prose-p:leading-7 prose-li:marker:text-gray-400">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                ) : (
                  msg.content
                )}

                {msg.role === "assistant" && (
                  <button 
                    onClick={() => copyToClipboard(msg.content)}
                    className="mt-2 text-gray-500 hover:text-white transition-colors flex items-center gap-1 text-xs"
                  >
                    <Copy size={14} />
                    Copy
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 max-w-3xl mx-auto">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 animate-pulse">
              <Bot size={16} className="text-white" />
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm mt-2">
              <Loader2 className="animate-spin text-blue-500" size={16} />
              <span className="text-xs tracking-wide uppercase">Thinking...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 pb-6 bg-[#09090b]">
        <form onSubmit={handleSend} className="relative max-w-4xl mx-auto">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="application/pdf" 
            onChange={handleFileUpload} 
          />
          
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="absolute left-3 top-3 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <Paperclip size={20} />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask NYAI anything..."
            className="w-full bg-[#1e1e1e] text-gray-100 p-4 pl-12 pr-14 rounded-full border border-transparent focus:border-gray-600 focus:bg-[#2f2f2f] outline-none shadow-sm transition-all placeholder-gray-500"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 p-2.5 bg-white text-black rounded-full hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-white transition-all"
          >
            <Send size={18} fill="currentColor" />
          </button>
        </form>
        <p className="text-center text-[11px] text-gray-600 mt-3">
          NYAI can make mistakes. Verify important legal info.
        </p>
      </div>
    </div>
  );
};

export default ChatWindow;