import { useCallback, useState } from "react";
import { DEFAULT_DEVICE_PREVIEW_ID, getDevicePreviewPreset } from "@/constants/devicePreview.js";
import { isInsidePreviewGuestFrame } from "@/preview/previewGuestFrame.js";

const UI_OPEN_STORAGE_KEY = "fivepixels:mobile-preview-ui-open";
const DEVICE_STORAGE_KEY = "fivepixels:mobile-preview-device";
const ORIENTATION_STORAGE_KEY = "fivepixels:mobile-preview-orientation";

export type MobilePreviewOrientation = "portrait" | "landscape";

function readStoredFlag(key: string, fallback: boolean) {
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
    } catch {
        return fallback;
    }
}

function persistFlag(key: string, enabled: boolean) {
    try {
        window.sessionStorage.setItem(key, enabled ? "1" : "0");
    } catch {
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
    } catch {
        return DEFAULT_DEVICE_PREVIEW_ID;
    }
}

function readStoredOrientation(): MobilePreviewOrientation {
    if (typeof window === "undefined") {
        return "portrait";
    }

    try {
        const stored = window.sessionStorage.getItem(ORIENTATION_STORAGE_KEY);
        return stored === "landscape" ? "landscape" : "portrait";
    } catch {
        return "portrait";
    }
}

function persistDeviceId(deviceId: string) {
    try {
        window.sessionStorage.setItem(DEVICE_STORAGE_KEY, deviceId);
    } catch {
        // Ignore storage failures in restricted environments.
    }
}

function persistOrientation(orientation: MobilePreviewOrientation) {
    try {
        window.sessionStorage.setItem(ORIENTATION_STORAGE_KEY, orientation);
    } catch {
        // Ignore storage failures in restricted environments.
    }
}

export function useMobilePreviewPreference() {
    const [mobilePreviewUiOpen, setMobilePreviewUiOpenState] = useState(() =>
        isInsidePreviewGuestFrame() ? false : readStoredFlag(UI_OPEN_STORAGE_KEY, false),
    );
    const [mobilePreviewDeviceId, setMobilePreviewDeviceIdState] = useState(() => readStoredDeviceId());
    const [mobilePreviewOrientation, setMobilePreviewOrientationState] = useState<MobilePreviewOrientation>(() => readStoredOrientation());

    const setMobilePreviewUiOpen = useCallback((open: boolean) => {
        if (isInsidePreviewGuestFrame()) {
            return;
        }

        setMobilePreviewUiOpenState(open);
        persistFlag(UI_OPEN_STORAGE_KEY, open);
    }, []);

    const setMobilePreviewDeviceId = useCallback((deviceId: string) => {
        const preset = getDevicePreviewPreset(deviceId);
        const nextId = preset.brand === "desktop" ? DEFAULT_DEVICE_PREVIEW_ID : preset.id;
        setMobilePreviewDeviceIdState(nextId);
        persistDeviceId(nextId);
    }, []);

    const setMobilePreviewOrientation = useCallback((orientation: MobilePreviewOrientation) => {
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
