import type { MarkerFillStyle, MarkerShape } from "@/shared/constants/markerAppearance.js";
import { getMarkerShapeDefinition, MARKER_SHAPE_STROKE_WIDTH_PX } from "@/shared/constants/markerShapeRegistry.js";

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

export function resolveMarkerGlyphPaint({ color, fillStyle, strokeColor, strokeWidthPx }: ResolveMarkerGlyphPaintInput): MarkerGlyphPaint {
    if (fillStyle === "outlined") {
        return {
            fill: "transparent",
            stroke: color,
            strokeWidthPx: Math.max(strokeWidthPx, 2.5),
            labelColor: color,
        };
    }

    if (fillStyle === "both") {
        return {
            fill: color,
            stroke: strokeColor,
            strokeWidthPx,
            labelColor: "#ffffff",
        };
    }

    return {
        fill: color,
        stroke: "transparent",
        strokeWidthPx: 0,
        labelColor: "#ffffff",
    };
}

export function getMarkerReplyBadgeSize(dotSize: number) {
    return Math.max(8, Math.round(dotSize * 0.42)) + 2;
}

export { MARKER_SHAPE_STROKE_WIDTH_PX };
