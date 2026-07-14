import { useCallback, useState } from "react";
import {
    DEFAULT_MARKER_APPEARANCE,
    DEFAULT_MARKER_COLORS,
    isAppearanceScale,
    isMarkerShape,
    MARKER_APPEARANCE_STORAGE_KEY,
    type MarkerAppearancePreferences,
    type MarkerColorPreferences,
    type MarkerShape,
    type AppearanceScale,
} from "@/constants/markerAppearance.js";
import { isValidHexColor } from "@/utils/shared/hexColor.js";
import { setMarkerDotSizeFromScale } from "@/utils/marker/markerRuntime.js";

function normalizeMarkerColors(value: unknown): MarkerColorPreferences {
    if (!value || typeof value !== "object") {
        return DEFAULT_MARKER_COLORS;
    }

    const colors = value as Partial<MarkerColorPreferences>;

    return {
        open: isValidHexColor(colors.open ?? "") ? colors.open! : DEFAULT_MARKER_COLORS.open,
        resolved: isValidHexColor(colors.resolved ?? "") ? colors.resolved! : DEFAULT_MARKER_COLORS.resolved,
        gitIssued: isValidHexColor(colors.gitIssued ?? "") ? colors.gitIssued! : DEFAULT_MARKER_COLORS.gitIssued,
    };
}

function readStoredMarkerAppearance(): MarkerAppearancePreferences {
    if (typeof window === "undefined") {
        return DEFAULT_MARKER_APPEARANCE;
    }

    try {
        const stored = window.sessionStorage.getItem(MARKER_APPEARANCE_STORAGE_KEY);

        if (!stored) {
            return DEFAULT_MARKER_APPEARANCE;
        }

        const parsed = JSON.parse(stored) as Partial<MarkerAppearancePreferences>;

        return {
            size: isAppearanceScale(parsed.size) ? parsed.size : DEFAULT_MARKER_APPEARANCE.size,
            shape: isMarkerShape(parsed.shape) ? parsed.shape : DEFAULT_MARKER_APPEARANCE.shape,
            colors: normalizeMarkerColors(parsed.colors),
        };
    } catch {
        return DEFAULT_MARKER_APPEARANCE;
    }
}

function persistMarkerAppearance(preferences: MarkerAppearancePreferences) {
    try {
        window.sessionStorage.setItem(MARKER_APPEARANCE_STORAGE_KEY, JSON.stringify(preferences));
    } catch {
        // Ignore storage failures in restricted environments.
    }
}

export function useMarkerAppearancePreference() {
    const [markerAppearance, setMarkerAppearanceState] = useState<MarkerAppearancePreferences>(() => {
        const initial = readStoredMarkerAppearance();
        setMarkerDotSizeFromScale(initial.size);
        return initial;
    });

    const setMarkerAppearance = useCallback((next: MarkerAppearancePreferences | ((current: MarkerAppearancePreferences) => MarkerAppearancePreferences)) => {
        setMarkerAppearanceState((current) => {
            const resolved = typeof next === "function" ? next(current) : next;
            setMarkerDotSizeFromScale(resolved.size);
            persistMarkerAppearance(resolved);
            return resolved;
        });
    }, []);

    const setMarkerSize = useCallback(
        (size: AppearanceScale) => {
            setMarkerAppearance((current) => ({
                ...current,
                size,
            }));
        },
        [setMarkerAppearance],
    );

    const setMarkerShape = useCallback(
        (shape: MarkerShape) => {
            setMarkerAppearance((current) => ({
                ...current,
                shape,
            }));
        },
        [setMarkerAppearance],
    );

    const setMarkerColors = useCallback(
        (colors: MarkerColorPreferences) => {
            setMarkerAppearance((current) => ({
                ...current,
                colors,
            }));
        },
        [setMarkerAppearance],
    );

    const setMarkerColor = useCallback(
        (key: keyof MarkerColorPreferences, color: string) => {
            setMarkerAppearance((current) => ({
                ...current,
                colors: {
                    ...current.colors,
                    [key]: color,
                },
            }));
        },
        [setMarkerAppearance],
    );

    return {
        markerAppearance,
        setMarkerAppearance,
        setMarkerSize,
        setMarkerShape,
        setMarkerColors,
        setMarkerColor,
    };
}
