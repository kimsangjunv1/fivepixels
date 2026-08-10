import { DOT_SIZE } from "@/constants/report.js";
import { getMarkerScaleFactor, type AppearanceScale } from "@/constants/markerAppearance.js";

let currentScaleFactor = 1;

export function setMarkerDotSizeFromScale(scale: AppearanceScale) {
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
