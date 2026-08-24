import type { MarkerFillStyle, MarkerShape } from "../../constants/markerAppearance.js";
import { MARKER_SHAPE_STROKE_WIDTH_PX } from "../../constants/markerShapeRegistry.js";
type MarkerShapeStyle = {
    anchorClass: string;
    width: number;
    height: number;
    strokeWidthPx: number;
};
export type MarkerGlyphPaint = {
    fill: string;
    stroke: string;
    strokeWidthPx: number;
    labelColor: string;
};
export type ResolveMarkerGlyphPaintInput = {
    color: string;
    fillStyle: MarkerFillStyle;
    strokeColor: string;
    strokeWidthPx: number;
};
export declare function resolveMarkerShapeStyle(shape: MarkerShape, dotSize: number): MarkerShapeStyle;
export declare function resolveMarkerGlyphPaint({ color, fillStyle, strokeColor, strokeWidthPx }: ResolveMarkerGlyphPaintInput): MarkerGlyphPaint;
export declare function getMarkerReplyBadgeSize(dotSize: number): number;
export { MARKER_SHAPE_STROKE_WIDTH_PX };
//# sourceMappingURL=markerShape.d.ts.map