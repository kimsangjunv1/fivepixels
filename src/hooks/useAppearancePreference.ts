import { useCallback, useState } from "react";
import { LEGACY_APPEARANCE_STORAGE_KEY } from "@/constants/appearance.js";
import type { ReportAppearance } from "@/types/report.js";

function isReportAppearance(value: unknown): value is ReportAppearance {
    return value === "system" || value === "light" || value === "dark";
}

function readStoredValue(storageKey: string): ReportAppearance | null {
    if (typeof window === "undefined") {
        return null;
    }

    try {
        const stored = window.sessionStorage.getItem(storageKey);

        if (isReportAppearance(stored)) {
            return stored;
        }
    } catch {
        // Ignore storage failures in restricted environments.
    }

    return null;
}

function readStoredAppearance(storageKey: string, fallback: ReportAppearance): ReportAppearance {
    return readStoredValue(storageKey) ?? readStoredValue(LEGACY_APPEARANCE_STORAGE_KEY) ?? fallback;
}

function persistAppearance(storageKey: string, appearance: ReportAppearance) {
    try {
        window.sessionStorage.setItem(storageKey, appearance);
    } catch {
        // Ignore storage failures in restricted environments.
    }
}

export function useAppearancePreference(storageKey: string, initialAppearance: ReportAppearance) {
    const [appearance, setAppearanceState] = useState<ReportAppearance>(() => readStoredAppearance(storageKey, initialAppearance));

    const setAppearance = useCallback(
        (nextAppearance: ReportAppearance) => {
            setAppearanceState(nextAppearance);
            persistAppearance(storageKey, nextAppearance);
        },
        [storageKey],
    );

    return {
        appearance,
        setAppearance,
    };
}
