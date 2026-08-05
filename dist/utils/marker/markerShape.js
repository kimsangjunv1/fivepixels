import { getMarkerShapeDefinition, MARKER_SHAPE_STROKE_WIDTH_PX } from "../../constants/markerShapeRegistry.js";
export function resolveMarkerShapeStyle(shape, dotSize, _hasBadge, isModalDetached) {
    if (isModalDetached) {
        const size = dotSize + 2;
        return {
            anchorClass: "-translate-x-1/2 -translate-y-1/2",
            shapeClass: "rounded-[5px]",
            ringClass: "rounded-[8px]",
            width: size,
            height: size,
            usesSvgGlyph: false,
            strokeWidthPx: MARKER_SHAPE_STROKE_WIDTH_PX,
            forceCssBox: true,
        };
    }
    const definition = getMarkerShapeDefinition(shape);
    const size = dotSize + 4;
    return {
        anchorClass: "-translate-x-1/2 -translate-y-1/2",
        shapeClass: "",
        ringClass: "rounded-[12px]",
        width: size,
        height: size,
        usesSvgGlyph: true,
        strokeWidthPx: definition.strokeWidthPx,
        forceCssBox: false,
    };
}
export function getMarkerReplyBadgeSize(dotSize) {
    return Math.max(8, Math.round(dotSize * 0.42));
}
export { MARKER_SHAPE_STROKE_WIDTH_PX };
//# sourceMappingURL=markerShape.js.map