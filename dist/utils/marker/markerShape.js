import { getMarkerShapeDefinition, MARKER_SHAPE_STROKE_WIDTH_PX } from "../../constants/markerShapeRegistry.js";
export function resolveMarkerShapeStyle(shape, dotSize) {
    const definition = getMarkerShapeDefinition(shape);
    const size = dotSize + 4;
    return {
        anchorClass: "-translate-x-1/2 -translate-y-1/2",
        width: size,
        height: size,
        strokeWidthPx: definition.strokeWidthPx,
    };
}
export function resolveMarkerGlyphPaint({ color, fillStyle, strokeColor, strokeWidthPx }) {
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
export function getMarkerReplyBadgeSize(dotSize) {
    return Math.max(8, Math.round(dotSize * 0.42)) + 2;
}
export { MARKER_SHAPE_STROKE_WIDTH_PX };
//# sourceMappingURL=markerShape.js.map