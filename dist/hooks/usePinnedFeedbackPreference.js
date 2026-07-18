import { useCallback, useEffect, useState } from "react";
import { getPinnedFeedbackStorageKey, removePinnedFeedbackItem, sanitizePinnedFeedbackPreference, togglePinnedFeedbackItem, } from "../utils/pinned/pinnedFeedback.js";
function readStoredPreference(storageKey) {
    if (typeof window === "undefined") {
        return sanitizePinnedFeedbackPreference(null);
    }
    try {
        const raw = window.localStorage.getItem(storageKey);
        if (!raw) {
            return sanitizePinnedFeedbackPreference(null);
        }
        return sanitizePinnedFeedbackPreference(JSON.parse(raw));
    }
    catch {
        return sanitizePinnedFeedbackPreference(null);
    }
}
function persistPreference(storageKey, preference) {
    try {
        window.localStorage.setItem(storageKey, JSON.stringify(preference));
    }
    catch {
        // Ignore storage failures in restricted environments.
    }
}
export function usePinnedFeedbackPreference(projectId, environment) {
    const storageKey = getPinnedFeedbackStorageKey(projectId, environment);
    const [preference, setPreferenceState] = useState(() => readStoredPreference(storageKey));
    useEffect(() => {
        setPreferenceState(readStoredPreference(storageKey));
    }, [storageKey]);
    const setPreference = useCallback((next) => {
        setPreferenceState((current) => {
            const resolved = typeof next === "function" ? next(current) : next;
            const sanitized = sanitizePinnedFeedbackPreference(resolved);
            persistPreference(storageKey, sanitized);
            return sanitized;
        });
    }, [storageKey]);
    const togglePinnedFeedback = useCallback((item) => {
        setPreference((current) => ({
            ...current,
            items: togglePinnedFeedbackItem(current.items, item),
            railCollapsed: current.items.length === 0 ? false : current.railCollapsed,
        }));
    }, [setPreference]);
    const unpinFeedback = useCallback((reportId) => {
        setPreference((current) => ({
            ...current,
            items: removePinnedFeedbackItem(current.items, reportId),
        }));
    }, [setPreference]);
    const setPinRailCollapsed = useCallback((railCollapsed) => {
        setPreference((current) => ({
            ...current,
            railCollapsed,
        }));
    }, [setPreference]);
    return {
        pinnedFeedbackItems: preference.items,
        pinRailCollapsed: preference.railCollapsed,
        togglePinnedFeedback,
        unpinFeedback,
        setPinRailCollapsed,
    };
}
//# sourceMappingURL=usePinnedFeedbackPreference.js.map