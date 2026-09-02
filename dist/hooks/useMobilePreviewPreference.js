import { useCallback, useState } from "react";
import { DEFAULT_DEVICE_PREVIEW_ID, getDevicePreviewPreset } from "../constants/devicePreview.js";
import { isInsidePreviewGuestFrame } from "../utils/overlay/previewGuestFrame.js";
const UI_OPEN_STORAGE_KEY = "fivepixels:mobile-preview-ui-open";
const DEVICE_STORAGE_KEY = "fivepixels:mobile-preview-device";
const ORIENTATION_STORAGE_KEY = "fivepixels:mobile-preview-orientation";
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
function readStoredDeviceId() {
    if (typeof window === "undefined") {
        return DEFAULT_DEVICE_PREVIEW_ID;
    }
    try {
        const preset = getDevicePreviewPreset(window.sessionStorage.getItem(DEVICE_STORAGE_KEY));
        return preset.brand === "desktop" ? DEFAULT_DEVICE_PREVIEW_ID : preset.id;
    }
    catch {
        return DEFAULT_DEVICE_PREVIEW_ID;
    }
}
function readStoredOrientation() {
    if (typeof window === "undefined") {
        return "portrait";
    }
    try {
        const stored = window.sessionStorage.getItem(ORIENTATION_STORAGE_KEY);
        return stored === "landscape" ? "landscape" : "portrait";
    }
    catch {
        return "portrait";
    }
}
function persistDeviceId(deviceId) {
    try {
        window.sessionStorage.setItem(DEVICE_STORAGE_KEY, deviceId);
    }
    catch {
        // Ignore storage failures in restricted environments.
    }
}
function persistOrientation(orientation) {
    try {
        window.sessionStorage.setItem(ORIENTATION_STORAGE_KEY, orientation);
    }
    catch {
        // Ignore storage failures in restricted environments.
    }
}
export function useMobilePreviewPreference() {
    const [mobilePreviewUiOpen, setMobilePreviewUiOpenState] = useState(() => isInsidePreviewGuestFrame() ? false : readStoredFlag(UI_OPEN_STORAGE_KEY, false));
    const [mobilePreviewDeviceId, setMobilePreviewDeviceIdState] = useState(() => readStoredDeviceId());
    const [mobilePreviewOrientation, setMobilePreviewOrientationState] = useState(() => readStoredOrientation());
    const setMobilePreviewUiOpen = useCallback((open) => {
        if (isInsidePreviewGuestFrame()) {
            return;
        }
        setMobilePreviewUiOpenState(open);
        persistFlag(UI_OPEN_STORAGE_KEY, open);
    }, []);
    const setMobilePreviewDeviceId = useCallback((deviceId) => {
        const preset = getDevicePreviewPreset(deviceId);
        const nextId = preset.brand === "desktop" ? DEFAULT_DEVICE_PREVIEW_ID : preset.id;
        setMobilePreviewDeviceIdState(nextId);
        persistDeviceId(nextId);
    }, []);
    const setMobilePreviewOrientation = useCallback((orientation) => {
        setMobilePreviewOrientationState(orientation);
        persistOrientation(orientation);
    }, []);
    const toggleMobilePreviewOrientation = useCallback(() => {
        setMobilePreviewOrientationState((current) => {
            const next = current === "portrait" ? "landscape" : "portrait";
            persistOrientation(next);
            return next;
        });
    }, []);
    return {
        mobilePreviewUiOpen,
        setMobilePreviewUiOpen,
        mobilePreviewDeviceId,
        setMobilePreviewDeviceId,
        mobilePreviewOrientation,
        setMobilePreviewOrientation,
        toggleMobilePreviewOrientation,
        mobilePreviewPreset: getDevicePreviewPreset(mobilePreviewDeviceId),
    };
}
//# sourceMappingURL=useMobilePreviewPreference.js.map