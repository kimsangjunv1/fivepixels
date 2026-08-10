import type { MarkerFillStyle, MarkerShape } from "@/constants/markerAppearance.js";
import { getMarkerShapeDefinition, MARKER_SHAPE_STROKE_WIDTH_PX } from "@/constants/markerShapeRegistry.js";

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

export function resolveMarkerGlyphPaint(color: string, fillStyle: MarkerFillStyle, strokeWidthPx: number): MarkerGlyphPaint {
    if (fillStyle === "outlined") {
        return {
            fill: "transparent",
            stroke: color,
            strokeWidthPx: Math.max(strokeWidthPx, 2.5),
            labelColor: color,
        };
    }

    return {
        fill: color,
        stroke: "#ffffff",
        strokeWidthPx,
        labelColor: "#ffffff",
    };
}

export function getMarkerReplyBadgeSize(dotSize: number) {
    return Math.max(8, Math.round(dotSize * 0.42)) + 2;
}

export { MARKER_SHAPE_STROKE_WIDTH_PX };
