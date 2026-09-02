import { useCallback, useState } from "react";
import { isInsidePreviewGuestFrame } from "../utils/overlay/previewGuestFrame.js";
const UI_OPEN_STORAGE_KEY = "fivepixels:mobile-preview-ui-open";
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
export function useMobilePreviewPreference() {
    const [mobilePreviewUiOpen, setMobilePreviewUiOpenState] = useState(() => isInsidePreviewGuestFrame() ? false : readStoredFlag(UI_OPEN_STORAGE_KEY, false));
    const setMobilePreviewUiOpen = useCallback((open) => {
        if (isInsidePreviewGuestFrame()) {
            return;
        }
        setMobilePreviewUiOpenState(open);
        persistFlag(UI_OPEN_STORAGE_KEY, open);
    }, []);
    return {
        mobilePreviewUiOpen,
        setMobilePreviewUiOpen,
    };
}
//# sourceMappingURL=useMobilePreviewPreference.js.map