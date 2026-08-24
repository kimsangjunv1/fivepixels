import { getElementRatioMarkerPosition } from "../../utils/marker/coordinates.js";
import { findElementByProbeKey } from "../../utils/probe/pickProbeSession.js";
export const MEMO_MARKER_COLOR = "#f59e0b";
export function resolveMemoMarkerPosition(elementKey, entry) {
    const element = findElementByProbeKey(elementKey);
    if (!element) {
        return null;
    }
    const position = getElementRatioMarkerPosition(element, entry.elementXRatio ?? 0.5, entry.elementYRatio ?? 0.5);
    return {
        elementKey,
        text: entry.text,
        left: position.left,
        top: position.top,
        clampedEdge: position.clampedEdge,
    };
}
export function resolveMemoMarkerPositions(memos) {
    return Object.entries(memos)
        .map(([elementKey, entry]) => resolveMemoMarkerPosition(elementKey, entry))
        .filter((marker) => marker !== null && marker.clampedEdge === null);
}
export function computeMemoElementRatios(elementKey, clientX, clientY) {
    const element = findElementByProbeKey(elementKey);
    if (!element) {
        return { elementXRatio: 0.5, elementYRatio: 0.5 };
    }
    const rect = element.getBoundingClientRect();
    const width = Math.max(rect.width, 1);
    const height = Math.max(rect.height, 1);
    return {
        elementXRatio: Math.min(1, Math.max(0, (clientX - rect.left) / width)),
        elementYRatio: Math.min(1, Math.max(0, (clientY - rect.top) / height)),
    };
}
//# sourceMappingURL=elementMemoMarkers.js.map