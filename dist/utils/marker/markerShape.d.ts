import type { MarkerShape } from "../../constants/markerAppearance.js";
import { MARKER_SHAPE_STROKE_WIDTH_PX } from "../../constants/markerShapeRegistry.js";
type MarkerShapeStyle = {
    anchorClass: string;
    shapeClass: string;
    ringClass: string;
    width: number;
    height: number;
    usesSvgGlyph: boolean;
    strokeWidthPx: number;
    /** Detached modal markers use a simple rounded square instead of the selected silhouette. */
    forceCssBox: boolean;
};
export declare function resolveMarkerShapeStyle(shape: MarkerShape, dotSize: number, _hasBadge: boolean, isModalDetached: boolean): MarkerShapeStyle;
export declare function getMarkerReplyBadgeSize(dotSize: number): number;
export { MARKER_SHAPE_STROKE_WIDTH_PX };
//# sourceMappingURL=markerShape.d.ts.map