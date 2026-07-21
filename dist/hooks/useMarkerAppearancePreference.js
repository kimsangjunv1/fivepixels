import { useCallback, useState } from "react";
import { DEFAULT_FEEDBACK_MODE_DOT_COLORS, DEFAULT_MARKER_APPEARANCE, DEFAULT_MARKER_COLORS, isAppearanceScale, isMarkerShape, MARKER_APPEARANCE_STORAGE_KEY, } from "../constants/markerAppearance.js";
import { isValidHexColor } from "../utils/shared/hexColor.js";
import { setMarkerDotSizeFromScale } from "../utils/marker/markerRuntime.js";
function normalizeMarkerColors(value) {
    if (!value || typeof value !== "object") {
        return DEFAULT_MARKER_COLORS;
    }
    const colors = value;
    return {
        open: isValidHexColor(colors.open ?? "") ? colors.open : DEFAULT_MARKER_COLORS.open,
        resolved: isValidHexColor(colors.resolved ?? "") ? colors.resolved : DEFAULT_MARKER_COLORS.resolved,
        gitIssued: isValidHexColor(colors.gitIssued ?? "") ? colors.gitIssued : DEFAULT_MARKER_COLORS.gitIssued,
    };
}
function normalizeFeedbackModeDotColors(value) {
    if (!value || typeof value !== "object") {
        return DEFAULT_FEEDBACK_MODE_DOT_COLORS;
    }
    const colors = value;
    return {
        light: isValidHexColor(colors.light ?? "") ? colors.light : DEFAULT_FEEDBACK_MODE_DOT_COLORS.light,
        dark: isValidHexColor(colors.dark ?? "") ? colors.dark : DEFAULT_FEEDBACK_MODE_DOT_COLORS.dark,
    };
}
function readStoredMarkerAppearance() {
    if (typeof window === "undefined") {
        return DEFAULT_MARKER_APPEARANCE;
    }
    try {
        const stored = window.sessionStorage.getItem(MARKER_APPEARANCE_STORAGE_KEY);
        if (!stored) {
            return DEFAULT_MARKER_APPEARANCE;
        }
        const parsed = JSON.parse(stored);
        return {
            size: isAppearanceScale(parsed.size) ? parsed.size : DEFAULT_MARKER_APPEARANCE.size,
            shape: isMarkerShape(parsed.shape) ? parsed.shape : DEFAULT_MARKER_APPEARANCE.shape,
            colors: normalizeMarkerColors(parsed.colors),
            feedbackModeDotColors: normalizeFeedbackModeDotColors(parsed.feedbackModeDotColors),
        };
    }
    catch {
        return DEFAULT_MARKER_APPEARANCE;
    }
}
function persistMarkerAppearance(preferences) {
    try {
        window.sessionStorage.setItem(MARKER_APPEARANCE_STORAGE_KEY, JSON.stringify(preferences));
    }
    catch {
        // Ignore storage failures in restricted environments.
    }
}
export function useMarkerAppearancePreference() {
    const [markerAppearance, setMarkerAppearanceState] = useState(() => {
        const initial = readStoredMarkerAppearance();
        setMarkerDotSizeFromScale(initial.size);
        return initial;
    });
    const setMarkerAppearance = useCallback((next) => {
        setMarkerAppearanceState((current) => {
            const resolved = typeof next === "function" ? next(current) : next;
            setMarkerDotSizeFromScale(resolved.size);
            persistMarkerAppearance(resolved);
            return resolved;
        });
    }, []);
    const setMarkerSize = useCallback((size) => {
        setMarkerAppearance((current) => ({
            ...current,
            size,
        }));
    }, [setMarkerAppearance]);
    const setMarkerShape = useCallback((shape) => {
        setMarkerAppearance((current) => ({
            ...current,
            shape,
        }));
    }, [setMarkerAppearance]);
    const setMarkerColors = useCallback((colors) => {
        setMarkerAppearance((current) => ({
            ...current,
            colors,
        }));
    }, [setMarkerAppearance]);
    const setMarkerColor = useCallback((key, color) => {
        setMarkerAppearance((current) => ({
            ...current,
            colors: {
                ...current.colors,
                [key]: color,
            },
        }));
    }, [setMarkerAppearance]);
    const setFeedbackModeDotColors = useCallback((colors) => {
        setMarkerAppearance((current) => ({
            ...current,
            feedbackModeDotColors: colors,
        }));
    }, [setMarkerAppearance]);
    const setFeedbackModeDotColor = useCallback((appearance, color) => {
        setMarkerAppearance((current) => ({
            ...current,
            feedbackModeDotColors: {
                ...current.feedbackModeDotColors,
                [appearance]: color,
            },
        }));
    }, [setMarkerAppearance]);
    return {
        markerAppearance,
        setMarkerAppearance,
        setMarkerSize,
        setMarkerShape,
        setMarkerColors,
        setMarkerColor,
        setFeedbackModeDotColors,
        setFeedbackModeDotColor,
    };
}
//# sourceMappingURL=useMarkerAppearancePreference.js.map