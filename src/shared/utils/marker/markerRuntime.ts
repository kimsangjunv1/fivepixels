import { DOT_SIZE } from "@/shared/constants/report.js";
import { getMarkerScaleFactor, type AppearanceScale } from "@/shared/constants/markerAppearance.js";

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
