import { MATERIAL_SHAPE_PATHS } from "../constants/markerShapePaths.js";
export const MARKER_SHAPE_STROKE_WIDTH_PX = 2;
function svgEntry(id) {
    const path = MATERIAL_SHAPE_PATHS[id];
    return {
        id,
        kind: "svgPath",
        pathD: path.pathD,
        materialName: path.materialName,
        strokeWidthPx: MARKER_SHAPE_STROKE_WIDTH_PX,
    };
}
/**
 * Single registry for marker silhouettes (official Material 3 paths only).
 * Add a shape later: extend `MarkerShape` + `MATERIAL_SHAPE_PATHS` + this map (+ i18n).
 */
export const MARKER_SHAPE_REGISTRY = {
    cookie4: svgEntry("cookie4"),
    sunny: svgEntry("sunny"),
    cookie6: svgEntry("cookie6"),
    clover4: svgEntry("clover4"),
    flower: svgEntry("flower"),
    ghostish: svgEntry("ghostish"),
    bun: svgEntry("bun"),
    gem: svgEntry("gem"),
    pill: svgEntry("pill"),
    pentagon: svgEntry("pentagon"),
    puffy: svgEntry("puffy"),
};
export function getMarkerShapeDefinition(shape) {
    return MARKER_SHAPE_REGISTRY[shape];
}
//# sourceMappingURL=markerShapeRegistry.js.map