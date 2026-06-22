import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "@/services/api";

export type UserRole = "candidate" | "recruiter" | "admin";

export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  avatar?: string;
}

type AuthUserResponse = Omit<User, "id"> & { id?: string };

const normalizeUser = (user: AuthUserResponse): User => ({
  ...user,
  _id: user._id || user.id || "",
  id: user.id || user._id,
});

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: { name: string; email: string; password: string; role: string }) => Promise<User>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const validateSession = async () => {
      if (!api.hasToken()) {
        api.clearToken();
        if (active) setIsLoading(false);
        return;
      }
      try {
        const response = await api.get<{ user: AuthUserResponse }>("/auth/me", {
          redirectOnUnauthorized: false,
        });
        const safeUser = normalizeUser(response.user);
        localStorage.setItem("ox_user", JSON.stringify(safeUser));
        if (active) setUser(safeUser);
      } catch {
        api.clearToken();
        if (active) setUser(null);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void validateSession();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.login(email, password) as { user: AuthUserResponse };
    const safeUser = normalizeUser(data.user);
    localStorage.setItem("ox_user", JSON.stringify(safeUser));
    setUser(safeUser);
    return safeUser;
  }, []);

  const register = useCallback(async (payload: { name: string; email: string; password: string; role: string }) => {
    const data = await api.register(payload) as { user: AuthUserResponse };
    const safeUser = normalizeUser(data.user);
    localStorage.setItem("ox_user", JSON.stringify(safeUser));
    setUser(safeUser);
    return safeUser;
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    await api.logout();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: Boolean(user), isLoading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
