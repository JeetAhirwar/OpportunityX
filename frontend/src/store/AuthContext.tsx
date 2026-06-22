import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "@/services/api";

export type UserRole = "candidate" | "recruiter" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; role: string }) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("ox_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("ox_user");
      }
    }
    setIsLoading(false);
  }, []);

  // const login = useCallback(async (email: string, password: string) => {
  //   const data = await api.login(email, password);
  //   setUser(data.user);
  // }, []);

  const login = useCallback(async (email: string, password: string) => {
  const data = await api.login(email, password);

  // ðŸ”¥ SAVE TOKEN HERE
  localStorage.setItem("token", data.token);

  // Optional: save user also
  localStorage.setItem("ox_user", JSON.stringify(data.user));

  setUser(data.user);
}, []);

  // const register = useCallback(async (payload: { name: string; email: string; password: string; role: string }) => {
  //   const data = await api.register(payload);
  //   setUser(data.user);
  // }, []);

  const register = useCallback(async (payload: { name: string; email: string; password: string; role: string }) => {
  const data = await api.register(payload);

  localStorage.setItem("token", data.token);
  localStorage.setItem("ox_user", JSON.stringify(data.user));

  setUser(data.user);
}, []);

  // const logout = useCallback(() => {
  //   setUser(null);
  //   api.logout();
  // }, []);

const logout = useCallback(() => {
  setUser(null);
  localStorage.removeItem("token");
  localStorage.removeItem("ox_user");
}, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

