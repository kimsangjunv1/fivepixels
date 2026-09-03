import { useCallback, useState } from "react";
import type { ThreadLayoutStyle } from "@/shared/types/report.js";

const STORAGE_KEY = "fivepixels:thread-layout-preference";

function isThreadLayoutStyle(value: unknown): value is ThreadLayoutStyle {
    return value === "classic" || value === "feed";
}

function readStoredThreadLayout(fallback: ThreadLayoutStyle): ThreadLayoutStyle {
    if (typeof window === "undefined") {
        return fallback;
    }

    try {
        const stored = window.sessionStorage.getItem(STORAGE_KEY);

        if (isThreadLayoutStyle(stored)) {
            return stored;
        }
    } catch {
        // Ignore storage failures in restricted environments.
    }

    return fallback;
}

function persistThreadLayout(layout: ThreadLayoutStyle) {
    try {
        window.sessionStorage.setItem(STORAGE_KEY, layout);
    } catch {
        // Ignore storage failures in restricted environments.
    }
}

export function useThreadLayoutPreference(initialLayout: ThreadLayoutStyle) {
    const [threadLayout, setThreadLayoutState] = useState<ThreadLayoutStyle>(() => readStoredThreadLayout(initialLayout));

    const setThreadLayout = useCallback((nextLayout: ThreadLayoutStyle) => {
        setThreadLayoutState(nextLayout);
        persistThreadLayout(nextLayout);
    }, []);

    return {
        threadLayout,
        setThreadLayout,
    };
}
