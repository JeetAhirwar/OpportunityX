import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "@/services/api";
const normalizeUser = (user) => ({
    ...user,
    _id: user._id || user.id || "",
    id: user.id || user._id,
});
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        let active = true;
        const validateSession = async () => {
            if (!api.hasToken()) {
                api.clearToken();
                if (active)
                    setIsLoading(false);
                return;
            }
            try {
                const response = await api.get("/auth/me", {
                    redirectOnUnauthorized: false,
                });
                const safeUser = normalizeUser(response.user);
                localStorage.setItem("ox_user", JSON.stringify(safeUser));
                if (active)
                    setUser(safeUser);
            }
            catch {
                api.clearToken();
                if (active)
                    setUser(null);
            }
            finally {
                if (active)
                    setIsLoading(false);
            }
        };
        void validateSession();
        return () => {
            active = false;
        };
    }, []);
    const login = useCallback(async (email, password) => {
        const data = await api.login(email, password);
        const safeUser = normalizeUser(data.user);
        localStorage.setItem("ox_user", JSON.stringify(safeUser));
        setUser(safeUser);
        return safeUser;
    }, []);
    const register = useCallback(async (payload) => {
        const data = await api.register(payload);
        const safeUser = normalizeUser(data.user);
        localStorage.setItem("ox_user", JSON.stringify(safeUser));
        setUser(safeUser);
        return safeUser;
    }, []);
    const logout = useCallback(async () => {
        setUser(null);
        await api.logout();
    }, []);
    return (<AuthContext.Provider value={{ user, isAuthenticated: Boolean(user), isLoading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>);
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error("useAuth must be used within AuthProvider");
    return context;
};
