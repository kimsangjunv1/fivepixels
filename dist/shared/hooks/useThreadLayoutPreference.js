import { useCallback, useState } from "react";
const STORAGE_KEY = "fivepixels:thread-layout-preference";
function isThreadLayoutStyle(value) {
    return value === "classic" || value === "feed";
}
function readStoredThreadLayout(fallback) {
    if (typeof window === "undefined") {
        return fallback;
    }
    try {
        const stored = window.sessionStorage.getItem(STORAGE_KEY);
        if (isThreadLayoutStyle(stored)) {
            return stored;
        }
    }
    catch {
        // Ignore storage failures in restricted environments.
    }
    return fallback;
}
function persistThreadLayout(layout) {
    try {
        window.sessionStorage.setItem(STORAGE_KEY, layout);
    }
    catch {
        // Ignore storage failures in restricted environments.
    }
}
export function useThreadLayoutPreference(initialLayout) {
    const [threadLayout, setThreadLayoutState] = useState(() => readStoredThreadLayout(initialLayout));
    const setThreadLayout = useCallback((nextLayout) => {
        setThreadLayoutState(nextLayout);
        persistThreadLayout(nextLayout);
    }, []);
    return {
        threadLayout,
        setThreadLayout,
    };
}
//# sourceMappingURL=useThreadLayoutPreference.js.map