export type AppearanceScale = "xs" | "sm" | "md" | "lg" | "xl";

export const APPEARANCE_SCALE_VALUES = ["xs", "sm", "md", "lg", "xl"] as const satisfies readonly AppearanceScale[];

export const MARKER_SCALE_FACTOR: Record<AppearanceScale, number> = {
    xs: 0.7,
    sm: 0.85,
    md: 1,
    lg: 1.15,
    xl: 1.3,
};

export type MarkerLabelFontSize = "sm" | "md" | "lg" | "xl";

export type MarkerFontSize = "none" | MarkerLabelFontSize;

export const MARKER_FONT_SIZE_VALUES = ["none", "sm", "md", "lg", "xl"] as const satisfies readonly MarkerFontSize[];

export type MarkerShape = "cookie4" | "sunny" | "cookie6" | "clover4" | "flower" | "ghostish" | "bun" | "gem" | "pill" | "pentagon" | "puffy";

export const MARKER_SHAPE_VALUES = [
    "cookie4",
    "sunny",
    "cookie6",
    "clover4",
    "flower",
    "ghostish",
    "bun",
    "gem",
    "pill",
    "pentagon",
    "puffy",
] as const satisfies readonly MarkerShape[];

export type MarkerColorPreferences = {
    open: string;
    resolved: string;
    gitIssued: string;
};

export type FeedbackModeDotColors = {
    light: string;
    dark: string;
};

export type MarkerAppearancePreferences = {
    size: AppearanceScale;
    shape: MarkerShape;
    colors: MarkerColorPreferences;
    feedbackModeDotColors: FeedbackModeDotColors;
};

export type TypographyPreferences = {
    fontSize: MarkerFontSize;
    fontFamily: string;
};

export const MARKER_APPEARANCE_STORAGE_KEY = "fivepixels:marker-appearance";
export const TYPOGRAPHY_STORAGE_KEY = "fivepixels:typography";

export const MARKER_LABEL_FONT_SIZE_PX: Record<MarkerLabelFontSize, number> = {
    sm: 10,
    md: 12,
    lg: 14,
    xl: 16,
};

export const DEFAULT_MARKER_COLORS: MarkerColorPreferences = {
    open: "#f6572d",
    resolved: "#03b26c",
    gitIssued: "#3182f6",
};

export const DEFAULT_FEEDBACK_MODE_DOT_COLORS: FeedbackModeDotColors = {
    light: "#111827",
    dark: "#f8fafc",
};

export const DEFAULT_MARKER_APPEARANCE: MarkerAppearancePreferences = {
    size: "md",
    shape: "cookie4",
    colors: DEFAULT_MARKER_COLORS,
    feedbackModeDotColors: DEFAULT_FEEDBACK_MODE_DOT_COLORS,
};

export const DEFAULT_FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", sans-serif';

export const DEFAULT_TYPOGRAPHY: TypographyPreferences = {
    fontSize: "md",
    fontFamily: DEFAULT_FONT_FAMILY,
};

export const FONT_FAMILY_SUGGESTIONS = [
    'system-ui, -apple-system, "Segoe UI", sans-serif',
    '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    '"Pretendard", system-ui, sans-serif',
    '"Noto Sans KR", sans-serif',
    "Arial, sans-serif",
    "Georgia, serif",
    '"Courier New", monospace',
] as const;

export function isMarkerLabelFontSize(value: unknown): value is MarkerLabelFontSize {
    return value === "sm" || value === "md" || value === "lg" || value === "xl";
}

export function isMarkerFontSize(value: unknown): value is MarkerFontSize {
    return value === "none" || isMarkerLabelFontSize(value);
}

export function isAppearanceScale(value: unknown): value is AppearanceScale {
    return value === "xs" || value === "sm" || value === "md" || value === "lg" || value === "xl";
}

export function isMarkerShape(value: unknown): value is MarkerShape {
    return (MARKER_SHAPE_VALUES as readonly string[]).includes(value as string);
}

export function getMarkerScaleFactor(size: AppearanceScale) {
    return MARKER_SCALE_FACTOR[size];
}

export const MARKER_COMPACT_LABEL = "·";
export const MARKER_BADGE_FONT_SIZE_PX = 10;
export const MARKER_BADGE_FONT_WEIGHT = 900;

export function isCompactMarkerLabelScale(size: AppearanceScale) {
    return size === "xs" || size === "sm";
}

export function resolveMarkerBadgeDisplay(size: AppearanceScale, label: string | null) {
    if (!label) {
        return {
            content: null as string | null,
            fontSizePx: undefined as number | undefined,
            fontWeight: undefined as number | undefined,
        };
    }

    if (isCompactMarkerLabelScale(size)) {
        return {
            content: MARKER_COMPACT_LABEL,
            fontSizePx: undefined,
            fontWeight: undefined,
        };
    }

    return {
        content: label,
        fontSizePx: MARKER_BADGE_FONT_SIZE_PX,
        fontWeight: MARKER_BADGE_FONT_WEIGHT,
    };
}

export function getMarkerLabelFontSizePx(size: MarkerLabelFontSize) {
    return MARKER_LABEL_FONT_SIZE_PX[size];
}
