import { DOT_SIZE } from "../../../shared/constants/report.js";
import { getMarkerScaleFactor } from "../../../shared/constants/markerAppearance.js";
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