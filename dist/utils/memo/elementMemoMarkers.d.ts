import type { MarkerClampEdge } from "../../types/report-ui.js";
import type { ElementMemoEntry } from "./elementMemos.js";
export declare const MEMO_MARKER_COLOR = "#f59e0b";
export type MemoMarker = {
    elementKey: string;
    text: string;
    left: number;
    top: number;
    clampedEdge: MarkerClampEdge | null;
};
export declare function resolveMemoMarkerPosition(elementKey: string, entry: ElementMemoEntry): MemoMarker | null;
export declare function resolveMemoMarkerPositions(memos: Record<string, ElementMemoEntry>): MemoMarker[];
export declare function computeMemoElementRatios(elementKey: string, clientX: number, clientY: number): {
    elementXRatio: number;
    elementYRatio: number;
};
//# sourceMappingURL=elementMemoMarkers.d.ts.map