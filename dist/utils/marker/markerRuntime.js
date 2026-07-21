import { DOT_SIZE } from "../../constants/report.js";
import { getMarkerDotSizePx } from "../../constants/markerAppearance.js";
let currentDotSize = DOT_SIZE;
export function setMarkerDotSizeFromScale(scale) {
    currentDotSize = getMarkerDotSizePx(scale);
}
export function getMarkerDotSize() {
    return currentDotSize;
}
export function resetMarkerDotSize() {
    currentDotSize = DOT_SIZE;
}
//# sourceMappingURL=markerRuntime.js.map