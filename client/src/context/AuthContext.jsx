import { useState } from "react";
import api from "../hooks/api";
import { AuthContext } from "./auth-context";
import toast from "react-hot-toast";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const userInfo = localStorage.getItem("userInfo");
    return userInfo ? JSON.parse(userInfo) : null;
  });

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);
      toast.success("Welcome back!");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Login Failed");
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await api.post("/auth/register", { name, email, password });
      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);
      toast.success("Account created successfully!");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration Failed");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
    toast.success("Logged out");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};