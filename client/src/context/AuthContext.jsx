import { useState } from "react";
import axios from "axios";
import { AuthContext } from "./auth-context";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const userInfo = localStorage.getItem("userInfo");
    return userInfo ? JSON.parse(userInfo) : null;
  });

  const login = async (email, password) => {
    try {
      const { data } = await axios.post("/api/auth/login", { email, password });
      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);
      return true;
    } catch (error) {
      alert(error.response?.data?.message || "Login Failed");
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await axios.post("/api/auth/register", { name, email, password });
      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);
      return true;
    } catch (error) {
      alert(error.response?.data?.message || "Registration Failed");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};