import type { MarkerShape } from "../../constants/markerAppearance.js";
import { MARKER_SHAPE_STROKE_WIDTH_PX } from "../../constants/markerShapeRegistry.js";
type MarkerShapeStyle = {
    anchorClass: string;
    width: number;
    height: number;
    strokeWidthPx: number;
};
export declare function resolveMarkerShapeStyle(shape: MarkerShape, dotSize: number): MarkerShapeStyle;
export declare function getMarkerReplyBadgeSize(dotSize: number): number;
export { MARKER_SHAPE_STROKE_WIDTH_PX };
//# sourceMappingURL=markerShape.d.ts.map