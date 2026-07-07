import { useCallback, useState } from "react";
import { DEFAULT_FONT_FAMILY, DEFAULT_TYPOGRAPHY, isMarkerFontSize, TYPOGRAPHY_STORAGE_KEY, } from "../constants/markerAppearance.js";
function readStoredTypography() {
    if (typeof window === "undefined") {
        return DEFAULT_TYPOGRAPHY;
    }
    try {
        const stored = window.sessionStorage.getItem(TYPOGRAPHY_STORAGE_KEY);
        if (!stored) {
            return DEFAULT_TYPOGRAPHY;
        }
        const parsed = JSON.parse(stored);
        const fontFamily = typeof parsed.fontFamily === "string" && parsed.fontFamily.trim() ? parsed.fontFamily.trim() : DEFAULT_FONT_FAMILY;
        return {
            fontSize: isMarkerFontSize(parsed.fontSize) ? parsed.fontSize : DEFAULT_TYPOGRAPHY.fontSize,
            fontFamily,
        };
    }
    catch {
        return DEFAULT_TYPOGRAPHY;
    }
}
function persistTypography(preferences) {
    try {
        window.sessionStorage.setItem(TYPOGRAPHY_STORAGE_KEY, JSON.stringify(preferences));
    }
    catch {
        // Ignore storage failures in restricted environments.
    }
}
export function useTypographyPreference() {
    const [typography, setTypographyState] = useState(() => readStoredTypography());
    const setTypography = useCallback((next) => {
        setTypographyState((current) => {
            const resolved = typeof next === "function" ? next(current) : next;
            persistTypography(resolved);
            return resolved;
        });
    }, []);
    const setFontSize = useCallback((fontSize) => {
        setTypography((current) => ({
            ...current,
            fontSize,
        }));
    }, [setTypography]);
    const setFontFamily = useCallback((fontFamily) => {
        setTypography((current) => ({
            ...current,
            fontFamily: fontFamily.trim() || DEFAULT_FONT_FAMILY,
        }));
    }, [setTypography]);
    return {
        typography,
        setTypography,
        setFontSize,
        setFontFamily,
    };
}
//# sourceMappingURL=useTypographyPreference.js.map