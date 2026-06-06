import { useCallback, useState } from "react";
import type { ReportLocale } from "../i18n/types.js";

const STORAGE_KEY = "stitchable:locale-preference";

function isReportLocale(value: unknown): value is ReportLocale {
    return value === "en" || value === "ko";
}

function readStoredLocale(fallback: ReportLocale): ReportLocale {
    if (typeof window === "undefined") {
        return fallback;
    }

    try {
        const stored = window.sessionStorage.getItem(STORAGE_KEY);

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
        window.sessionStorage.setItem(STORAGE_KEY, locale);
    } catch {
        // Ignore storage failures in restricted environments.
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
