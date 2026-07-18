import { useCallback, useEffect, useState } from "react";
import type { PinnedFeedbackItem, PinnedFeedbackPreference } from "@/types/pinnedFeedback.js";
import {
    getPinnedFeedbackStorageKey,
    removePinnedFeedbackItem,
    sanitizePinnedFeedbackPreference,
    togglePinnedFeedbackItem,
} from "@/utils/pinned/pinnedFeedback.js";

function readStoredPreference(storageKey: string): PinnedFeedbackPreference {
    if (typeof window === "undefined") {
        return sanitizePinnedFeedbackPreference(null);
    }

    try {
        const raw = window.localStorage.getItem(storageKey);

        if (!raw) {
            return sanitizePinnedFeedbackPreference(null);
        }

        return sanitizePinnedFeedbackPreference(JSON.parse(raw));
    } catch {
        return sanitizePinnedFeedbackPreference(null);
    }
}

function persistPreference(storageKey: string, preference: PinnedFeedbackPreference) {
    try {
        window.localStorage.setItem(storageKey, JSON.stringify(preference));
    } catch {
        // Ignore storage failures in restricted environments.
    }
}

export function usePinnedFeedbackPreference(projectId: string, environment?: string) {
    const storageKey = getPinnedFeedbackStorageKey(projectId, environment);
    const [preference, setPreferenceState] = useState<PinnedFeedbackPreference>(() => readStoredPreference(storageKey));

    useEffect(() => {
        setPreferenceState(readStoredPreference(storageKey));
    }, [storageKey]);

    const setPreference = useCallback(
        (next: PinnedFeedbackPreference | ((current: PinnedFeedbackPreference) => PinnedFeedbackPreference)) => {
            setPreferenceState((current) => {
                const resolved = typeof next === "function" ? next(current) : next;
                const sanitized = sanitizePinnedFeedbackPreference(resolved);
                persistPreference(storageKey, sanitized);
                return sanitized;
            });
        },
        [storageKey],
    );

    const togglePinnedFeedback = useCallback(
        (item: PinnedFeedbackItem) => {
            setPreference((current) => ({
                ...current,
                items: togglePinnedFeedbackItem(current.items, item),
                railCollapsed: current.items.length === 0 ? false : current.railCollapsed,
            }));
        },
        [setPreference],
    );

    const unpinFeedback = useCallback(
        (reportId: string) => {
            setPreference((current) => ({
                ...current,
                items: removePinnedFeedbackItem(current.items, reportId),
            }));
        },
        [setPreference],
    );

    const setPinRailCollapsed = useCallback(
        (railCollapsed: boolean) => {
            setPreference((current) => ({
                ...current,
                railCollapsed,
            }));
        },
        [setPreference],
    );

    return {
        pinnedFeedbackItems: preference.items,
        pinRailCollapsed: preference.railCollapsed,
        togglePinnedFeedback,
        unpinFeedback,
        setPinRailCollapsed,
    };
}
