import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import fs from "node:fs";
import path from "node:path";

const state = vi.hoisted(() => ({ receivedTheme: null }));

vi.mock("sonner", () => ({
    Toaster: ({ theme }) => {
        state.receivedTheme = theme;
        return <div data-testid="sonner-toaster" />;
    },
    toast: () => {},
}));

import { ThemeProvider } from "@/store/ThemeContext";
import { Toaster } from "@/components/ui/sonner";

describe("sonner theme regression", () => {
    it("passes the app theme to the sonner toaster through ThemeContext", () => {
        localStorage.setItem("ox_theme", "light");
        render(
            <ThemeProvider>
                <Toaster />
            </ThemeProvider>
        );
        expect(state.receivedTheme).toBe("light");
    });

    it("defaults to the app default theme when no preference is stored", () => {
        localStorage.removeItem("ox_theme");
        render(
            <ThemeProvider>
                <Toaster />
            </ThemeProvider>
        );
        expect(state.receivedTheme).toBe("dark");
    });

    it("does not depend on next-themes", () => {
        const sourcePath = path.resolve("src/components/ui/sonner.jsx");
        const source = fs.readFileSync(sourcePath, "utf8");
        expect(source).not.toContain("next-themes");
        expect(source).toContain("@/store/ThemeContext");
    });
});
