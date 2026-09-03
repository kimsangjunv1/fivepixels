import { useCallback, useState } from "react";
export const LOCALE_PREFERENCE_STORAGE_KEY = "fivepixels:locale-preference";
function isReportLocale(value) {
    return value === "en" || value === "ko";
}
function readStoredLocale(fallback) {
    if (typeof window === "undefined") {
        return fallback;
    }
    try {
        const stored = window.sessionStorage.getItem(LOCALE_PREFERENCE_STORAGE_KEY);
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
        window.sessionStorage.setItem(LOCALE_PREFERENCE_STORAGE_KEY, locale);
    }
    catch {
        // Ignore storage failures in restricted environments.
    }
}
export function hasStoredLocalePreference() {
    if (typeof window === "undefined") {
        return false;
    }
    try {
        const stored = window.sessionStorage.getItem(LOCALE_PREFERENCE_STORAGE_KEY);
        return isReportLocale(stored);
    }
    catch {
        return false;
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