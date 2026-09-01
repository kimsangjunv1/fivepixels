import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

export type DemoInvestTheme = "dark" | "light";

const STORAGE_KEY = "demo-invest-theme";

type DemoInvestThemeContextValue = {
    theme: DemoInvestTheme;
    setTheme: (theme: DemoInvestTheme) => void;
    toggleTheme: () => void;
};

const DemoInvestThemeContext = createContext<DemoInvestThemeContextValue | null>(null);

function readStoredTheme(): DemoInvestTheme {
    if (typeof window === "undefined") {
        return "dark";
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "light" ? "light" : "dark";
}

export function DemoInvestThemeProvider({ children }: PropsWithChildren) {
    const [theme, setThemeState] = useState<DemoInvestTheme>(readStoredTheme);

    const setTheme = useCallback((next: DemoInvestTheme) => {
        setThemeState(next);
        window.localStorage.setItem(STORAGE_KEY, next);
    }, []);

    const toggleTheme = useCallback(() => {
        setThemeState((current) => {
            const next = current === "dark" ? "light" : "dark";
            window.localStorage.setItem(STORAGE_KEY, next);
            return next;
        });
    }, []);

    useEffect(() => {
        document.documentElement.dataset.demoInvestTheme = theme;
    }, [theme]);

    const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [setTheme, theme, toggleTheme]);

    return <DemoInvestThemeContext.Provider value={value}>{children}</DemoInvestThemeContext.Provider>;
}

export function useDemoInvestTheme() {
    const context = useContext(DemoInvestThemeContext);
    if (!context) {
        throw new Error("useDemoInvestTheme must be used within DemoInvestThemeProvider");
    }
    return context;
}
