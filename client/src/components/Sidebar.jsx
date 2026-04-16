import { Plus, LogOut, Home, Globe, Trash2, Pin } from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "../context/auth-context";
import { motion } from "framer-motion";

const Sidebar = ({ sessions, currentSessionId, onSelectSession, onNewSession, onLogout, onPin, onDelete }) => {
  const { user } = useContext(AuthContext);

  const sortedSessions = [...sessions].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  return (
    <div className="w-[260px] bg-black border-r border-white/5 flex flex-col h-screen flex-shrink-0 font-sans">
      <div className="p-3 pt-4">
        <button
          onClick={() => onSelectSession(null)}
          className="w-full flex items-center gap-3 text-gray-400 hover:text-white hover:bg-[#1A1A1A] px-4 py-3 rounded-lg transition-all mb-2"
        >
          <Home size={18} />
          <span className="text-sm font-medium">Home</span>
        </button>
        <button
          onClick={onNewSession}
          className="w-full flex items-center gap-3 bg-[#1A1A1A] hover:bg-[#252525] text-gray-200 px-4 py-3 rounded-lg transition-all border border-white/5 group"
        >
          <div className="bg-white text-black rounded-full p-0.5"><Plus size={14} /></div>
          <span className="text-sm font-medium">New Chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 custom-scrollbar">
        {sessions.length === 0 && (
            <div className="text-center text-gray-600 mt-10 text-xs">
                No history yet.
            </div>
        )}
        {sortedSessions.map((session) => (
          <div key={session._id} className="relative group">
            <button
              onClick={() => onSelectSession(session._id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all pr-12 ${
                currentSessionId === session._id
                  ? "bg-[#1A1A1A] text-white"
                  : "text-gray-400 hover:bg-[#111] hover:text-gray-200"
              }`}
            >
              <span className="truncate text-[13px] flex-1">
                {session.title || "Untitled Consultation"}
              </span>
              {session.isPinned && <Pin size={12} className="text-blue-500 fill-blue-500" />}
            </button>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 bg-[#1A1A1A] p-1 rounded-md border border-white/10 shadow-lg z-50">
               <button 
                  onClick={(e) => { e.stopPropagation(); onPin(session._id); }}
                  className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-white/5 rounded transition-colors"
                  title={session.isPinned ? "Unpin" : "Pin"}
               >
                 <Pin size={14} className={session.isPinned ? "fill-blue-500 text-blue-500" : ""} />
               </button>
               <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    console.log("Delete button clicked for session:", session._id);
                    onDelete(session._id); 
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white/5 rounded transition-colors"
                  title="Delete"
               >
                 <Trash2 size={14} />
               </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-white/5 bg-black">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-[#222] border border-white/10 flex items-center justify-center text-xs font-medium text-white shrink-0">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-200 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 text-gray-500 hover:text-white px-2 py-2 rounded-lg transition-colors text-xs mb-1"
        >
          <Globe size={14} />
          Back to Landing Page
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 text-gray-500 hover:text-gray-300 px-2 py-2 rounded-lg transition-colors text-xs"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;