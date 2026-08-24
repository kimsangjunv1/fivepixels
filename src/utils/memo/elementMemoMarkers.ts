import type { MarkerClampEdge } from "@/types/report-ui.js";
import type { ElementMemoEntry } from "./elementMemos.js";
import { getElementRatioMarkerPosition } from "@/utils/marker/coordinates.js";
import { findElementByProbeKey } from "@/utils/probe/pickProbeSession.js";

export const MEMO_MARKER_COLOR = "#f59e0b";

export type MemoMarker = {
    elementKey: string;
    text: string;
    left: number;
    top: number;
    clampedEdge: MarkerClampEdge | null;
};

export function resolveMemoMarkerPosition(elementKey: string, entry: ElementMemoEntry): MemoMarker | null {
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

export function resolveMemoMarkerPositions(memos: Record<string, ElementMemoEntry>) {
    return Object.entries(memos)
        .map(([elementKey, entry]) => resolveMemoMarkerPosition(elementKey, entry))
        .filter((marker): marker is MemoMarker => marker !== null && marker.clampedEdge === null);
}

export function computeMemoElementRatios(elementKey: string, clientX: number, clientY: number) {
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
