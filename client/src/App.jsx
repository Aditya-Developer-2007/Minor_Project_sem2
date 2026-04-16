import { useContext, useEffect, useState, useCallback } from "react";
import api from "./hooks/api";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import { AuthPage } from "./pages/AuthPages";
import { AuthContext } from "./context/auth-context";
import LandingPage from "./pages/LandingPage";

function App() {
  const { user, logout } = useContext(AuthContext);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [showLanding, setShowLanding] = useState(true);

  const fetchSessions = useCallback(async () => {
    if (!user) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await api.get("/chats", config);
      setSessions(data);
      if (data.length > 0 && !currentSessionId) setCurrentSessionId(data[0]._id);
    } catch (error) {
      console.error(error);
    }
  }, [user, currentSessionId]);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchSessions();
    }
  }, [user, fetchSessions]);

  const handleNewSession = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await api.post("/chats", {}, config);
      setSessions([data, ...sessions]);
      setCurrentSessionId(data._id);
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
    console.log("handleDeleteSession called with id:", id);
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
  };

  const currentSession = sessions.find((s) => s._id === currentSessionId);

  if (!user) {
    if (showLanding) {
      return <LandingPage onGetStarted={() => setShowLanding(false)} />;
    }
    return <AuthPage onBackToHome={() => setShowLanding(true)} />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        sessions={sessions} 
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onNewSession={handleNewSession}
        onLogout={handleLogout}
        onPin={handleTogglePin}
        onDelete={handleDeleteSession}
      />
      <ChatWindow 
        currentSession={currentSession} 
        setSessions={setSessions}
      />
    </div>
  );
}

export default App;