import { useCallback, useState } from "react";
const STORAGE_KEY = "stitchable:appearance-preference";
function isReportAppearance(value) {
    return value === "system" || value === "light" || value === "dark";
}
function readStoredAppearance(fallback) {
    if (typeof window === "undefined") {
        return fallback;
    }
    try {
        const stored = window.sessionStorage.getItem(STORAGE_KEY);
        if (isReportAppearance(stored)) {
            return stored;
        }
    }
    catch {
        // Ignore storage failures in restricted environments.
    }
    return fallback;
}
function persistAppearance(appearance) {
    try {
        window.sessionStorage.setItem(STORAGE_KEY, appearance);
    }
    catch {
        // Ignore storage failures in restricted environments.
    }
}
export function useAppearancePreference(initialAppearance) {
    const [appearance, setAppearanceState] = useState(() => readStoredAppearance(initialAppearance));
    const setAppearance = useCallback((nextAppearance) => {
        setAppearanceState(nextAppearance);
        persistAppearance(nextAppearance);
    }, []);
    return {
        appearance,
        setAppearance,
    };
}
//# sourceMappingURL=useAppearancePreference.js.map