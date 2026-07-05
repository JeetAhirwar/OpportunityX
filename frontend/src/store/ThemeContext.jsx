import React, { createContext, useContext, useState, useEffect } from "react";
const ThemeContext = createContext(undefined);
export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        const stored = localStorage.getItem("ox_theme");
        if (stored)
            return stored;
        return "dark";
    });
    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(theme);
        localStorage.setItem("ox_theme", theme);
    }, [theme]);
    const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));
    return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context)
        throw new Error("useTheme must be used within ThemeProvider");
    return context;
};
