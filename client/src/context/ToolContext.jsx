import { createContext, useState, useContext } from 'react';
import api from '../hooks/api';
import { AuthContext } from './auth-context';
import toast from 'react-hot-toast';

export const ToolContext = createContext();

export const ToolProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [activeTool, setActiveTool] = useState(null); // 'brief', 'search', 'mapper', or null
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetTool = () => {
    setActiveTool(null);
    setResults(null);
    setIsLoading(false);
  };

  const generateBrief = async (text, file) => {
    setIsLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      let data;
      if (file) {
        const formData = new FormData();
        formData.append('pdf', file);
        // Important: Remove manual 'Content-Type' to let axios/browser handle boundary
        const res = await api.post('/tools/summarize', formData, {
            headers: { Authorization: `Bearer ${user.token}` }
        });
        data = res.data;
      } else {
        const res = await api.post('/tools/summarize', { text }, config);
        data = res.data;
      }
      setResults(data.summary);
      toast.success("Case Brief Generated!");
    } catch (error) {
      toast.error("Failed to generate brief.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchPrecedents = async (query) => {
    setIsLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await api.post('/tools/search', { query }, config);
      setResults(data.results);
      toast.success("Precedents Found!");
    } catch (error) {
      toast.error("Search failed.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const mapLaw = async (text) => {
    setIsLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await api.post('/tools/map', { text }, config);
      setResults(data.mapping);
      toast.success("Law Mapping Complete!");
    } catch (error) {
      toast.error("Mapping failed.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolContext.Provider value={{ 
      activeTool, setActiveTool, 
      results, setResults, 
      isLoading, 
      generateBrief, searchPrecedents, mapLaw, 
      resetTool 
    }}>
      {children}
    </ToolContext.Provider>
  );
};
