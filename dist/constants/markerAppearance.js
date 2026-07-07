export const APPEARANCE_SCALE_VALUES = ["sm", "md", "lg", "xl"];
export const MARKER_FONT_SIZE_VALUES = ["none", "sm", "md", "lg", "xl"];
export const MARKER_SHAPE_VALUES = ["circle", "square", "pill", "pin"];
export const MARKER_APPEARANCE_STORAGE_KEY = "fivepixels:marker-appearance";
export const TYPOGRAPHY_STORAGE_KEY = "fivepixels:typography";
export const MARKER_SIZE_PX = {
    sm: 10,
    md: 14,
    lg: 18,
    xl: 22,
};
export const MARKER_LABEL_FONT_SIZE_PX = {
    sm: 10,
    md: 12,
    lg: 14,
    xl: 16,
};
export const DEFAULT_MARKER_COLORS = {
    open: "#f6572d",
    resolved: "#03b26c",
    gitIssued: "#3182f6",
};
export const DEFAULT_MARKER_APPEARANCE = {
    size: "md",
    shape: "circle",
    colors: DEFAULT_MARKER_COLORS,
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
export function isMarkerFontSize(value) {
    return value === "none" || isAppearanceScale(value);
}
export function isAppearanceScale(value) {
    return value === "sm" || value === "md" || value === "lg" || value === "xl";
}
export function isMarkerShape(value) {
    return value === "circle" || value === "square" || value === "pill" || value === "pin";
}
export function getMarkerDotSizePx(size) {
    return MARKER_SIZE_PX[size];
}
export function getMarkerLabelFontSizePx(size) {
    return MARKER_LABEL_FONT_SIZE_PX[size];
}
//# sourceMappingURL=markerAppearance.js.map