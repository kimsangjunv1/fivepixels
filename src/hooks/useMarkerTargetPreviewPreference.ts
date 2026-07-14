import { useCallback, useState } from "react";

const STORAGE_KEY = "fivepixels:marker-target-preview";

function readStoredMarkerTargetPreview() {
    if (typeof window === "undefined") {
        return false;
    }

    try {
        return window.sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
        return false;
    }
}

function persistMarkerTargetPreview(enabled: boolean) {
    try {
        window.sessionStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
    } catch {
        // Ignore storage failures in restricted environments.
    }
}

export function useMarkerTargetPreviewPreference() {
    const [showMarkerTargetPreview, setShowMarkerTargetPreviewState] = useState(() => readStoredMarkerTargetPreview());

    const setShowMarkerTargetPreview = useCallback((enabled: boolean) => {
        setShowMarkerTargetPreviewState(enabled);
        persistMarkerTargetPreview(enabled);
    }, []);

    const toggleMarkerTargetPreview = useCallback(() => {
        setShowMarkerTargetPreviewState((current) => {
            const next = !current;
            persistMarkerTargetPreview(next);
            return next;
        });
    }, []);

    return {
        showMarkerTargetPreview,
        setShowMarkerTargetPreview,
        toggleMarkerTargetPreview,
    };
}
