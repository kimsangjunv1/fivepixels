export type AppearanceScale = "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export declare const APPEARANCE_SCALE_VALUES: readonly ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"];
/** Evenly spaced from 50% to 150% with 100% (`md`) at the center step. */
export declare const MARKER_SCALE_FACTOR: Record<AppearanceScale, number>;
export type MarkerLabelFontSize = "sm" | "md" | "lg" | "xl";
export type MarkerFontSize = "none" | MarkerLabelFontSize;
export declare const MARKER_FONT_SIZE_VALUES: readonly ["none", "sm", "md", "lg", "xl"];
export type MarkerShape = "circle" | "square" | "cookie4" | "sunny" | "cookie6" | "clover4" | "flower" | "ghostish" | "bun" | "gem" | "pill" | "pentagon" | "puffy";
export declare const MARKER_SHAPE_VALUES: readonly ["circle", "square", "cookie4", "sunny", "cookie6", "clover4", "flower", "ghostish", "bun", "gem", "pill", "pentagon", "puffy"];
export type MarkerFillStyle = "filled" | "outlined" | "both";
export declare const MARKER_FILL_STYLE_VALUES: readonly ["filled", "outlined", "both"];
export declare const DEFAULT_MARKER_STROKE_COLOR = "#ffffff";
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
    fillStyle: MarkerFillStyle;
    colors: MarkerColorPreferences;
    strokeColor: string;
    feedbackModeDotColors: FeedbackModeDotColors;
};
export type TypographyPreferences = {
    fontSize: MarkerFontSize;
    fontFamily: string;
};
export declare const MARKER_APPEARANCE_STORAGE_KEY = "fivepixels:marker-appearance";
export declare const TYPOGRAPHY_STORAGE_KEY = "fivepixels:typography";
export declare const MARKER_LABEL_FONT_SIZE_PX: Record<MarkerLabelFontSize, number>;
export declare const DEFAULT_MARKER_COLORS: MarkerColorPreferences;
export declare const DEFAULT_FEEDBACK_MODE_DOT_COLORS: FeedbackModeDotColors;
export declare const DEFAULT_MARKER_APPEARANCE: MarkerAppearancePreferences;
export declare const DEFAULT_FONT_FAMILY = "system-ui, -apple-system, \"Segoe UI\", sans-serif";
export declare const DEFAULT_TYPOGRAPHY: TypographyPreferences;
export declare const FONT_FAMILY_SUGGESTIONS: readonly ["system-ui, -apple-system, \"Segoe UI\", sans-serif", "-apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif", "\"Pretendard\", system-ui, sans-serif", "\"Noto Sans KR\", sans-serif", "Arial, sans-serif", "Georgia, serif", "\"Courier New\", monospace"];
export declare function isMarkerLabelFontSize(value: unknown): value is MarkerLabelFontSize;
export declare function isMarkerFontSize(value: unknown): value is MarkerFontSize;
export declare function isAppearanceScale(value: unknown): value is AppearanceScale;
export declare function isMarkerShape(value: unknown): value is MarkerShape;
export declare function isMarkerFillStyle(value: unknown): value is MarkerFillStyle;
export declare function getMarkerScaleFactor(size: AppearanceScale): number;
export declare const MARKER_COMPACT_LABEL = "\u00B7";
export declare const MARKER_BADGE_FONT_SIZE_PX = 10;
export declare const MARKER_BADGE_FONT_WEIGHT = 700;
export declare const MARKER_BADGE_LABEL_CLASS = "text-[12px] font-bold leading-none text-white";
export declare function isCompactMarkerLabelScale(size: AppearanceScale): size is "2xs" | "xs" | "sm";
export declare function resolveMarkerBadgeDisplay(size: AppearanceScale, label: string | null): {
    content: string | null;
    fontSizePx: number | undefined;
    fontWeight: number | undefined;
};
export declare function getMarkerLabelFontSizePx(size: MarkerLabelFontSize): number;
//# sourceMappingURL=markerAppearance.d.ts.map