import { jsx as _jsx } from "react/jsx-runtime";
import { getMarkerShapeDefinition } from "../constants/markerShapeRegistry.js";
/**
 * Renders a marker silhouette from official Material 3 SVG path data
 * with a non-scaling stroke so the outline stays exactly `strokeWidthPx` (2px).
 */
export function MarkerShapeGlyph({ shape, fill, width, height, stroke = "#ffffff", strokeWidthPx, dashed = false, className = "", style }) {
    const definition = getMarkerShapeDefinition(shape);
    const resolvedStrokeWidth = strokeWidthPx ?? definition.strokeWidthPx;
    return (_jsx("svg", { "aria-hidden": true, width: width, height: height, viewBox: "0 0 1 1", className: `pointer-events-none overflow-visible ${className}`, style: {
            display: "block",
            overflow: "visible",
            filter: "drop-shadow(0px 0px 1px #1118271a) drop-shadow(0px 0px 1px #1118271a)  drop-shadow(0px 4px 2px rgba(17, 24, 39, 0.1))",
            ...style,
        }, children: _jsx("path", { d: definition.pathD, fill: fill, stroke: stroke, strokeWidth: resolvedStrokeWidth, strokeDasharray: dashed ? "0.06 0.04" : undefined, strokeLinejoin: "round", strokeLinecap: "round", vectorEffect: "non-scaling-stroke" }) }));
}
//# sourceMappingURL=MarkerShapeGlyph.js.map