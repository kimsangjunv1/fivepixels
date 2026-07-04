import { useCallback, useState } from "react";
import { LEGACY_APPEARANCE_STORAGE_KEY } from "../constants/appearance.js";
function isReportAppearance(value) {
    return value === "system" || value === "light" || value === "dark";
}
function readStoredValue(storageKey) {
    if (typeof window === "undefined") {
        return null;
    }
    try {
        const stored = window.sessionStorage.getItem(storageKey);
        if (isReportAppearance(stored)) {
            return stored;
        }
    }
    catch {
        // Ignore storage failures in restricted environments.
    }
    return null;
}
function readStoredAppearance(storageKey, fallback) {
    return readStoredValue(storageKey) ?? readStoredValue(LEGACY_APPEARANCE_STORAGE_KEY) ?? fallback;
}
function persistAppearance(storageKey, appearance) {
    try {
        window.sessionStorage.setItem(storageKey, appearance);
    }
    catch {
        // Ignore storage failures in restricted environments.
    }
}
export function useAppearancePreference(storageKey, initialAppearance) {
    const [appearance, setAppearanceState] = useState(() => readStoredAppearance(storageKey, initialAppearance));
    const setAppearance = useCallback((nextAppearance) => {
        setAppearanceState(nextAppearance);
        persistAppearance(storageKey, nextAppearance);
    }, [storageKey]);
    return {
        appearance,
        setAppearance,
    };
}
//# sourceMappingURL=useAppearancePreference.js.map