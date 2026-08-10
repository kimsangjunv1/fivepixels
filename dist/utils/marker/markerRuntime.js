import { DOT_SIZE } from "../../constants/report.js";
import { getMarkerScaleFactor } from "../../constants/markerAppearance.js";
let currentScaleFactor = 1;
export function setMarkerDotSizeFromScale(scale) {
    currentScaleFactor = getMarkerScaleFactor(scale);
}
export function getMarkerScaleFactorValue() {
    return currentScaleFactor;
}
export function getMarkerDotSize() {
    return DOT_SIZE * currentScaleFactor;
}
export function resetMarkerDotSize() {
    currentScaleFactor = 1;
}
//# sourceMappingURL=markerRuntime.js.map