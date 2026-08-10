import { useCallback, useState } from "react";
const HIDDEN_MARKERS_STORAGE_KEY = "fivepixels:show-hidden-detached-markers";
const MODAL_MARKERS_STORAGE_KEY = "fivepixels:show-modal-detached-markers";
function readStoredFlag(key, fallback) {
    if (typeof window === "undefined") {
        return fallback;
    }
    try {
        const stored = window.sessionStorage.getItem(key);
        if (stored === "1") {
            return true;
        }
        if (stored === "0") {
            return false;
        }
        return fallback;
    }
    catch {
        return fallback;
    }
}
function persistFlag(key, enabled) {
    try {
        window.sessionStorage.setItem(key, enabled ? "1" : "0");
    }
    catch {
        // Ignore storage failures in restricted environments.
    }
}
/** Controls whether detached (hidden/modal) markers are drawn on the page. Default: shown. */
export function useDetachedMarkerVisibilityPreference() {
    const [showHiddenDetachedMarkers, setShowHiddenDetachedMarkersState] = useState(() => readStoredFlag(HIDDEN_MARKERS_STORAGE_KEY, true));
    const [showModalDetachedMarkers, setShowModalDetachedMarkersState] = useState(() => readStoredFlag(MODAL_MARKERS_STORAGE_KEY, true));
    const setShowHiddenDetachedMarkers = useCallback((enabled) => {
        setShowHiddenDetachedMarkersState(enabled);
        persistFlag(HIDDEN_MARKERS_STORAGE_KEY, enabled);
    }, []);
    const setShowModalDetachedMarkers = useCallback((enabled) => {
        setShowModalDetachedMarkersState(enabled);
        persistFlag(MODAL_MARKERS_STORAGE_KEY, enabled);
    }, []);
    return {
        showHiddenDetachedMarkers,
        setShowHiddenDetachedMarkers,
        showModalDetachedMarkers,
        setShowModalDetachedMarkers,
    };
}
//# sourceMappingURL=useDetachedMarkerVisibilityPreference.js.map