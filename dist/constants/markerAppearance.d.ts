export type AppearanceScale = "sm" | "md" | "lg" | "xl";
export declare const APPEARANCE_SCALE_VALUES: readonly ["sm", "md", "lg", "xl"];
export type MarkerFontSize = "none" | AppearanceScale;
export declare const MARKER_FONT_SIZE_VALUES: readonly ["none", "sm", "md", "lg", "xl"];
export type MarkerShape = "circle" | "square" | "pill" | "pin";
export declare const MARKER_SHAPE_VALUES: readonly ["circle", "square", "pill", "pin"];
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
export declare const MARKER_APPEARANCE_STORAGE_KEY = "fivepixels:marker-appearance";
export declare const TYPOGRAPHY_STORAGE_KEY = "fivepixels:typography";
export declare const MARKER_SIZE_PX: Record<AppearanceScale, number>;
export declare const MARKER_LABEL_FONT_SIZE_PX: Record<AppearanceScale, number>;
export declare const DEFAULT_MARKER_COLORS: MarkerColorPreferences;
export declare const DEFAULT_FEEDBACK_MODE_DOT_COLORS: FeedbackModeDotColors;
export declare const DEFAULT_MARKER_APPEARANCE: MarkerAppearancePreferences;
export declare const DEFAULT_FONT_FAMILY = "system-ui, -apple-system, \"Segoe UI\", sans-serif";
export declare const DEFAULT_TYPOGRAPHY: TypographyPreferences;
export declare const FONT_FAMILY_SUGGESTIONS: readonly ["system-ui, -apple-system, \"Segoe UI\", sans-serif", "-apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif", "\"Pretendard\", system-ui, sans-serif", "\"Noto Sans KR\", sans-serif", "Arial, sans-serif", "Georgia, serif", "\"Courier New\", monospace"];
export declare function isMarkerFontSize(value: unknown): value is MarkerFontSize;
export declare function isAppearanceScale(value: unknown): value is AppearanceScale;
export declare function isMarkerShape(value: unknown): value is MarkerShape;
export declare function getMarkerDotSizePx(size: AppearanceScale): number;
export declare function getMarkerLabelFontSizePx(size: AppearanceScale): number;
//# sourceMappingURL=markerAppearance.d.ts.map