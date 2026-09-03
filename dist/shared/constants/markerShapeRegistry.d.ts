import type { MarkerShape } from "../../shared/constants/markerAppearance.js";
export declare const MARKER_SHAPE_STROKE_WIDTH_PX = 2;
export type MarkerShapeDefinition = {
    id: MarkerShape;
    kind: "svgPath";
    /** Unit-square SVG path (`viewBox="0 0 1 1"`). */
    pathD: string;
    /** Source MaterialShapes name for traceability. */
    materialName: string;
    strokeWidthPx: number;
};
/**
 * Single registry for marker silhouettes (official Material 3 paths only).
 * Add a shape later: extend `MarkerShape` + `MATERIAL_SHAPE_PATHS` + this map (+ i18n).
 */
export declare const MARKER_SHAPE_REGISTRY: Record<MarkerShape, MarkerShapeDefinition>;
export declare function getMarkerShapeDefinition(shape: MarkerShape): MarkerShapeDefinition;
//# sourceMappingURL=markerShapeRegistry.d.ts.map