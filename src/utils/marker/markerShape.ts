import type { MarkerShape } from "@/constants/markerAppearance.js";
import { getMarkerShapeDefinition, MARKER_SHAPE_STROKE_WIDTH_PX } from "@/constants/markerShapeRegistry.js";

type MarkerShapeStyle = {
    anchorClass: string;
    width: number;
    height: number;
    strokeWidthPx: number;
};

export function resolveMarkerShapeStyle(shape: MarkerShape, dotSize: number): MarkerShapeStyle {
    const definition = getMarkerShapeDefinition(shape);
    const size = dotSize + 4;

    return {
        anchorClass: "-translate-x-1/2 -translate-y-1/2",
        width: size,
        height: size,
        strokeWidthPx: definition.strokeWidthPx,
    };
}

export function getMarkerReplyBadgeSize(dotSize: number) {
    return Math.max(8, Math.round(dotSize * 0.42)) + 2;
}

export { MARKER_SHAPE_STROKE_WIDTH_PX };
