import { useCallback, useState } from "react";
import type { ReportLocale } from "@/shared/i18n/types.js";

export const LOCALE_PREFERENCE_STORAGE_KEY = "fivepixels:locale-preference";

function isReportLocale(value: unknown): value is ReportLocale {
    return value === "en" || value === "ko";
}

function readStoredLocale(fallback: ReportLocale): ReportLocale {
    if (typeof window === "undefined") {
        return fallback;
    }

    try {
        const stored = window.sessionStorage.getItem(LOCALE_PREFERENCE_STORAGE_KEY);

        if (isReportLocale(stored)) {
            return stored;
        }
    } catch {
        // Ignore storage failures in restricted environments.
    }

    return fallback;
}

function persistLocale(locale: ReportLocale) {
    try {
        window.sessionStorage.setItem(LOCALE_PREFERENCE_STORAGE_KEY, locale);
    } catch {
        // Ignore storage failures in restricted environments.
    }
}

export function hasStoredLocalePreference(): boolean {
    if (typeof window === "undefined") {
        return false;
    }

    try {
        const stored = window.sessionStorage.getItem(LOCALE_PREFERENCE_STORAGE_KEY);
        return isReportLocale(stored);
    } catch {
        return false;
    }
}

export function useLocalePreference(initialLocale: ReportLocale) {
    const [locale, setLocaleState] = useState<ReportLocale>(() => readStoredLocale(initialLocale));

    const setLocale = useCallback((nextLocale: ReportLocale) => {
        setLocaleState(nextLocale);
        persistLocale(nextLocale);
    }, []);

    return {
        locale,
        setLocale,
    };
}
