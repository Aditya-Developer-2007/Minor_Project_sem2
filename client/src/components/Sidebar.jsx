import { Plus, LogOut, Home, Globe, Trash2, Pin, Briefcase, Search, Languages, MessageSquare, ShieldAlert } from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "../context/auth-context";
import { ToolContext } from "../context/ToolContext";
import { motion } from "framer-motion";

const Sidebar = ({ sessions, currentSessionId, onSelectSession, onNewSession, onLogout, onPin, onDelete }) => {
  const { user } = useContext(AuthContext);
  const { activeTool, setActiveTool, resetTool } = useContext(ToolContext);

  const sortedSessions = [...sessions].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  const tools = [
    { id: 'brief', name: 'Brief Generator', icon: Briefcase, color: 'text-blue-400' },
    { id: 'search', name: 'Precedent Search', icon: Search, color: 'text-indigo-400' },
    { id: 'mapper', name: 'Law Mapper', icon: Languages, color: 'text-emerald-400' },
  ];

  const handleToolClick = (toolId) => {
    onSelectSession(null);
    setActiveTool(toolId);
  };

  const handleChatClick = (sessionId) => {
    resetTool();
    onSelectSession(sessionId);
  };

  return (
    <div className="w-[280px] bg-[#0c0c0e] border-r border-white/5 flex flex-col h-screen flex-shrink-0 font-sans shadow-2xl">
      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={() => { resetTool(); onNewSession(); }}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl transition-all shadow-lg shadow-blue-600/10 font-medium group active:scale-95"
        >
          <Plus size={18} />
          <span>New Consultation</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6 custom-scrollbar">
        {/* Navigation Section */}
        <section>
          <p className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Navigation</p>
          <button
            onClick={() => { resetTool(); onSelectSession(null); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all mb-1 ${
              !activeTool && !currentSessionId ? "bg-white/5 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Home size={18} />
            <span className="text-sm font-medium">Home Dashboard</span>
          </button>
        </section>

        {/* Legal Tools Section */}
        <section>
          <p className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Legal AI Tools</p>
          <div className="space-y-1">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                  activeTool === tool.id ? "bg-white/5 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <tool.icon size={18} className={activeTool === tool.id ? tool.color : "group-hover:" + tool.color} />
                <span className="text-sm font-medium">{tool.name}</span>
                {activeTool === tool.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></div>}
              </button>
            ))}
          </div>
        </section>

        {/* Chat History Section */}
        <section>
          <p className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Recent Chats</p>
          <div className="space-y-1">
            {sessions.length === 0 ? (
              <div className="px-3 py-4 text-gray-600 text-[11px] italic">
                No consultation history.
              </div>
            ) : (
                sortedSessions.map((session) => (
                    <div key={session._id} className="relative group">
                      <button
                        onClick={() => handleChatClick(session._id)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all pr-12 ${
                          currentSessionId === session._id && !activeTool
                            ? "bg-white/5 text-white shadow-sm"
                            : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                        }`}
                      >
                        <MessageSquare size={16} className={currentSessionId === session._id && !activeTool ? "text-blue-400" : "text-gray-500"} />
                        <span className="truncate text-sm flex-1">
                          {session.title || "Untitled Consultation"}
                        </span>
                        {session.isPinned && <Pin size={12} className="text-blue-500 fill-blue-500" />}
                      </button>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 bg-[#1A1A1A] p-1 rounded-md border border-white/10 shadow-lg z-50">
                         <button 
                            onClick={(e) => { e.stopPropagation(); onPin(session._id); }}
                            className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-white/5 rounded transition-colors"
                         >
                           <Pin size={14} className={session.isPinned ? "fill-blue-500 text-blue-500" : ""} />
                         </button>
                         <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(session._id); }}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white/5 rounded transition-colors"
                         >
                           <Trash2 size={14} />
                         </button>
                      </div>
                    </div>
                  ))
            )}
          </div>
        </section>
      </div>

      {/* User & Logout Section */}
      <div className="p-4 mt-auto border-t border-white/5 bg-[#09090b]">
        <div className="flex items-center gap-3 mb-4 px-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-lg">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-200 truncate">{user?.name}</p>
            <p className="text-[10px] text-gray-500 truncate lowercase">{user?.email}</p>
          </div>
        </div>
        
        <button
            onClick={() => { localStorage.removeItem('nyai_disclaimer_accepted'); window.location.reload(); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-all mb-4 group"
        >
            <ShieldAlert size={14} className="group-hover:text-amber-500 transition-colors" />
            Legal Disclaimer
        </button>

        <div className="flex gap-2">

            <button
                onClick={onLogout}
                className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 py-2.5 rounded-lg transition-all text-xs font-medium border border-transparent hover:border-red-500/20"
                title="Sign Out"
            >
                <LogOut size={14} />
                <span>Sign Out</span>
            </button>
            <button
                onClick={() => { resetTool(); onSelectSession(null); }}
                className="w-10 flex items-center justify-center bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white py-2.5 rounded-lg transition-all border border-transparent hover:border-white/10"
                title="Landing Page"
            >
                <Globe size={14} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;