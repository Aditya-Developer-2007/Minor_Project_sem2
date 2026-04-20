import { useContext, useEffect, useState, useCallback } from "react";
import api from "./hooks/api";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import Header from "./components/Header";
import HomeDashboard from "./components/HomeDashboard";
import { ToolContext } from "./context/ToolContext";
import { AuthPage } from "./pages/AuthPages";
import { AuthContext } from "./context/auth-context";
import LandingPage from "./pages/LandingPage";

// Tools
import CaseBriefGenerator from "./components/tools/CaseBriefGenerator";
import PrecedentSearch from "./components/tools/PrecedentSearch";
import LawMapper from "./components/tools/LawMapper";

function App() {
  const { user, logout } = useContext(AuthContext);
  const { activeTool, resetTool } = useContext(ToolContext);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [showLanding, setShowLanding] = useState(true);

  const fetchSessions = useCallback(async () => {
    if (!user) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await api.get("/chats", config);
      setSessions(data);
    } catch (error) {
      console.error(error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user, fetchSessions]);

  const handleNewSession = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await api.post("/chats", {}, config);
      setSessions([data, ...sessions]);
      setCurrentSessionId(data._id);
      resetTool(); // Ensure we switch to chat view
    } catch (error) {
      console.error(error);
    }
  };

  const handleTogglePin = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await api.patch(`/chats/${id}/pin`, {}, config);
      setSessions((prev) => prev.map((s) => (s._id === id ? data : s)));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteSession = useCallback(async (id) => {
    if (!window.confirm("Are you sure you want to delete this chat?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await api.delete(`/chats/${id}`, config);
      setSessions((prev) => prev.filter((s) => s._id !== id));
      if (currentSessionId === id) {
        setCurrentSessionId(null);
      }
    } catch (error) {
      console.error("Delete Session Error:", error);
    }
  }, [user, currentSessionId]);

  const handleLogout = () => {
    logout();
    setSessions([]);
    setCurrentSessionId(null);
    setShowLanding(true);
    resetTool();
  };

  const renderContent = () => {
    if (activeTool) {
        switch(activeTool) {
            case 'brief': return <CaseBriefGenerator onBriefSaved={fetchSessions} />;
            case 'search': return <PrecedentSearch />;
            case 'mapper': return <LawMapper />;
            default: return <HomeDashboard onNewChat={handleNewSession} />;
        }
    }

    const currentSession = sessions.find((s) => s._id === currentSessionId);
    if (currentSessionId && currentSession) {
        return <ChatWindow currentSession={currentSession} setSessions={setSessions} />;
    }

    return <HomeDashboard onNewChat={handleNewSession} />;
  };

  if (!user) {
    if (showLanding) {
      return <LandingPage onGetStarted={() => setShowLanding(false)} />;
    }
    return <AuthPage onBackToHome={() => setShowLanding(true)} />;
  }

  return (
    <div className="flex h-screen bg-[#09090b] text-gray-100 overflow-hidden font-sans selection:bg-blue-500/30 selection:text-blue-200">
      <Sidebar 
        sessions={sessions} 
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onNewSession={handleNewSession}
        onLogout={handleLogout}
        onPin={handleTogglePin}
        onDelete={handleDeleteSession}
      />
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        <Header />
        <main className="flex-1 overflow-hidden relative">
            {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;