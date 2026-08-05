import type { CSSProperties } from "react";
import type { MarkerShape } from "../../constants/markerAppearance.js";
type MarkerShapeGlyphProps = {
    shape: MarkerShape;
    fill: string;
    width: number;
    height: number;
    stroke?: string;
    strokeWidthPx?: number;
    dashed?: boolean;
    /** Modal-detached markers: simple rounded square, not the selected silhouette. */
    forceCssBox?: boolean;
    cssBoxClassName?: string;
    className?: string;
    style?: CSSProperties;
};
/**
 * Renders a marker silhouette from official Material 3 SVG path data
 * with a non-scaling stroke so the outline stays exactly `strokeWidthPx` (2px).
 */
export declare function MarkerShapeGlyph({ shape, fill, width, height, stroke, strokeWidthPx, dashed, forceCssBox, cssBoxClassName, className, style, }: MarkerShapeGlyphProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=MarkerShapeGlyph.d.ts.map