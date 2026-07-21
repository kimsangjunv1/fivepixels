import { DOT_SIZE } from "@/constants/report.js";
import { getMarkerDotSizePx, type AppearanceScale } from "@/constants/markerAppearance.js";

let currentDotSize = DOT_SIZE;

export function setMarkerDotSizeFromScale(scale: AppearanceScale) {
    currentDotSize = getMarkerDotSizePx(scale);
}

export function getMarkerDotSize() {
    return currentDotSize;
}

export function resetMarkerDotSize() {
    currentDotSize = DOT_SIZE;
}
