import { useCallback, useState } from "react";
import type { ReportAppearance } from "../types/report.js";

const STORAGE_KEY = "stitchable:appearance-preference";

function isReportAppearance(value: unknown): value is ReportAppearance {
    return value === "system" || value === "light" || value === "dark";
}

function readStoredAppearance(fallback: ReportAppearance): ReportAppearance {
    if (typeof window === "undefined") {
        return fallback;
    }

    try {
        const stored = window.sessionStorage.getItem(STORAGE_KEY);

        if (isReportAppearance(stored)) {
            return stored;
        }
    } catch {
        // Ignore storage failures in restricted environments.
    }

    return fallback;
}

function persistAppearance(appearance: ReportAppearance) {
    try {
        window.sessionStorage.setItem(STORAGE_KEY, appearance);
    } catch {
        // Ignore storage failures in restricted environments.
    }
}

export function useAppearancePreference(initialAppearance: ReportAppearance) {
    const [appearance, setAppearanceState] = useState<ReportAppearance>(() => readStoredAppearance(initialAppearance));

    const setAppearance = useCallback((nextAppearance: ReportAppearance) => {
        setAppearanceState(nextAppearance);
        persistAppearance(nextAppearance);
    }, []);

    return {
        appearance,
        setAppearance,
    };
}
