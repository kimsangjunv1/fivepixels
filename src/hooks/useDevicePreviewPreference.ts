import { useCallback, useState } from "react";
import {
    DEFAULT_DEVICE_PREVIEW_ID,
    DEFAULT_DEVICE_PREVIEW_SCALE,
    getDevicePreviewPreset,
    normalizeDevicePreviewScale,
    type DevicePreviewScale,
} from "@/constants/devicePreview.js";

const UI_OPEN_STORAGE_KEY = "fivepixels:device-preview-ui-open";
const DEVICE_STORAGE_KEY = "fivepixels:device-preview-device";
const SCALE_STORAGE_KEY = "fivepixels:device-preview-scale";
const IMAGE_STORAGE_KEY = "fivepixels:device-preview-image";
const FIT_VIEWPORT_STORAGE_KEY = "fivepixels:device-preview-fit-viewport";

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
        return getDevicePreviewPreset(window.sessionStorage.getItem(DEVICE_STORAGE_KEY)).id;
    } catch {
        return DEFAULT_DEVICE_PREVIEW_ID;
    }
}

function readStoredScale(): DevicePreviewScale {
    if (typeof window === "undefined") {
        return DEFAULT_DEVICE_PREVIEW_SCALE;
    }

    try {
        const stored = window.sessionStorage.getItem(SCALE_STORAGE_KEY);
        return normalizeDevicePreviewScale(stored ? Number(stored) : DEFAULT_DEVICE_PREVIEW_SCALE);
    } catch {
        return DEFAULT_DEVICE_PREVIEW_SCALE;
    }
}

function persistDeviceId(deviceId: string) {
    try {
        window.sessionStorage.setItem(DEVICE_STORAGE_KEY, deviceId);
    } catch {
        // Ignore storage failures in restricted environments.
    }
}

function persistScale(scale: DevicePreviewScale) {
    try {
        window.sessionStorage.setItem(SCALE_STORAGE_KEY, String(scale));
    } catch {
        // Ignore storage failures in restricted environments.
    }
}

export function useDevicePreviewPreference() {
    const [devicePreviewUiOpen, setDevicePreviewUiOpenState] = useState(() => readStoredFlag(UI_OPEN_STORAGE_KEY, false));
    const [devicePreviewDeviceId, setDevicePreviewDeviceIdState] = useState(() => readStoredDeviceId());
    const [devicePreviewScale, setDevicePreviewScaleState] = useState<DevicePreviewScale>(() => readStoredScale());
    const [devicePreviewImageEnabled, setDevicePreviewImageEnabledState] = useState(() => readStoredFlag(IMAGE_STORAGE_KEY, true));
    const [devicePreviewFitToViewport, setDevicePreviewFitToViewportState] = useState(() => readStoredFlag(FIT_VIEWPORT_STORAGE_KEY, false));

    const setDevicePreviewUiOpen = useCallback((open: boolean) => {
        setDevicePreviewUiOpenState(open);
        persistFlag(UI_OPEN_STORAGE_KEY, open);
    }, []);

    const setDevicePreviewDeviceId = useCallback((deviceId: string) => {
        const nextId = getDevicePreviewPreset(deviceId).id;
        setDevicePreviewDeviceIdState(nextId);
        persistDeviceId(nextId);
    }, []);

    const setDevicePreviewScale = useCallback((scale: DevicePreviewScale) => {
        const nextScale = normalizeDevicePreviewScale(scale);
        setDevicePreviewScaleState(nextScale);
        persistScale(nextScale);
    }, []);

    const setDevicePreviewImageEnabled = useCallback((enabled: boolean) => {
        setDevicePreviewImageEnabledState(enabled);
        persistFlag(IMAGE_STORAGE_KEY, enabled);
    }, []);

    const setDevicePreviewFitToViewport = useCallback((enabled: boolean) => {
        setDevicePreviewFitToViewportState(enabled);
        persistFlag(FIT_VIEWPORT_STORAGE_KEY, enabled);
    }, []);

    return {
        devicePreviewUiOpen,
        setDevicePreviewUiOpen,
        devicePreviewDeviceId,
        setDevicePreviewDeviceId,
        devicePreviewScale,
        setDevicePreviewScale,
        devicePreviewImageEnabled,
        setDevicePreviewImageEnabled,
        devicePreviewFitToViewport,
        setDevicePreviewFitToViewport,
        devicePreviewPreset: getDevicePreviewPreset(devicePreviewDeviceId),
    };
}
