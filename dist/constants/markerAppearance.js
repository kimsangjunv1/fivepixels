import { ACCENT_COLOR_DARK } from "../constants/accentColors.js";
export const APPEARANCE_SCALE_VALUES = ["2xs", "xs", "sm", "md", "lg", "xl"];
export const MARKER_SCALE_FACTOR = {
    "2xs": 0.3,
    xs: 0.7,
    sm: 0.85,
    md: 1,
    lg: 1.15,
    xl: 1.3,
};
export const MARKER_FONT_SIZE_VALUES = ["none", "sm", "md", "lg", "xl"];
export const MARKER_SHAPE_VALUES = [
    "circle",
    "square",
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
];
export const MARKER_FILL_STYLE_VALUES = ["filled", "outlined", "both"];
export const DEFAULT_MARKER_STROKE_COLOR = "#ffffff";
export const MARKER_APPEARANCE_STORAGE_KEY = "fivepixels:marker-appearance";
export const TYPOGRAPHY_STORAGE_KEY = "fivepixels:typography";
export const MARKER_LABEL_FONT_SIZE_PX = {
    sm: 10,
    md: 12,
    lg: 14,
    xl: 16,
};
export const DEFAULT_MARKER_COLORS = {
    open: ACCENT_COLOR_DARK.coral,
    resolved: "#03b26c",
    gitIssued: ACCENT_COLOR_DARK.blue,
};
export const DEFAULT_FEEDBACK_MODE_DOT_COLORS = {
    light: "#111827",
    dark: "#f8fafc",
};
export const DEFAULT_MARKER_APPEARANCE = {
    size: "md",
    shape: "cookie4",
    fillStyle: "both",
    colors: DEFAULT_MARKER_COLORS,
    strokeColor: DEFAULT_MARKER_STROKE_COLOR,
    feedbackModeDotColors: DEFAULT_FEEDBACK_MODE_DOT_COLORS,
};
export const DEFAULT_FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", sans-serif';
export const DEFAULT_TYPOGRAPHY = {
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
];
export function isMarkerLabelFontSize(value) {
    return value === "sm" || value === "md" || value === "lg" || value === "xl";
}
export function isMarkerFontSize(value) {
    return value === "none" || isMarkerLabelFontSize(value);
}
export function isAppearanceScale(value) {
    return value === "2xs" || value === "xs" || value === "sm" || value === "md" || value === "lg" || value === "xl";
}
export function isMarkerShape(value) {
    return MARKER_SHAPE_VALUES.includes(value);
}
export function isMarkerFillStyle(value) {
    return MARKER_FILL_STYLE_VALUES.includes(value);
}
export function getMarkerScaleFactor(size) {
    return MARKER_SCALE_FACTOR[size];
}
export const MARKER_COMPACT_LABEL = "·";
export const MARKER_BADGE_FONT_SIZE_PX = 10;
export const MARKER_BADGE_FONT_WEIGHT = 900;
export function isCompactMarkerLabelScale(size) {
    return size === "2xs" || size === "xs" || size === "sm";
}
export function resolveMarkerBadgeDisplay(size, label) {
    if (!label) {
        return {
            content: null,
            fontSizePx: undefined,
            fontWeight: undefined,
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
export function getMarkerLabelFontSizePx(size) {
    return MARKER_LABEL_FONT_SIZE_PX[size];
}
//# sourceMappingURL=markerAppearance.js.map