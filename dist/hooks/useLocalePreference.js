import { useCallback, useState } from "react";
const STORAGE_KEY = "fivepixels:locale-preference";
function isReportLocale(value) {
    return value === "en" || value === "ko";
}
function readStoredLocale(fallback) {
    if (typeof window === "undefined") {
        return fallback;
    }
    try {
        const stored = window.sessionStorage.getItem(STORAGE_KEY);
        if (isReportLocale(stored)) {
            return stored;
        }
    }
    catch {
        // Ignore storage failures in restricted environments.
    }
    return fallback;
}
function persistLocale(locale) {
    try {
        window.sessionStorage.setItem(STORAGE_KEY, locale);
    }
    catch {
        // Ignore storage failures in restricted environments.
    }
}
export function useLocalePreference(initialLocale) {
    const [locale, setLocaleState] = useState(() => readStoredLocale(initialLocale));
    const setLocale = useCallback((nextLocale) => {
        setLocaleState(nextLocale);
        persistLocale(nextLocale);
    }, []);
    return {
        locale,
        setLocale,
    };
}
//# sourceMappingURL=useLocalePreference.js.map