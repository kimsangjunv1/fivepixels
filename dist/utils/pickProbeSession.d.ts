import type { PickProbeCompareMode, PickProbeValues, ProbeOriginalSnapshot, SavedProbeDeletion, SavedProbeEntry } from "../types/report-ui.js";
export declare function getPickProbeElementKey(element: HTMLElement): string;
export declare function findElementByProbeKey(elementKey: string): HTMLElement | null;
export declare function captureProbeOriginalSnapshot(element: HTMLElement): ProbeOriginalSnapshot;
export declare function captureSavedProbeDeletion(element: HTMLElement, elementKey: string): SavedProbeDeletion | null;
export declare function restoreSavedProbeDeletion(entry: SavedProbeDeletion): HTMLElement | null;
export declare function restoreProbeElementOriginal(element: HTMLElement, entry: SavedProbeEntry): void;
export declare function createSavedProbeEntry(elementKey: string, baseline: PickProbeValues, applied: PickProbeValues, originalStyle: string | null, originalTextContent: string | null, existing?: SavedProbeEntry, originalInnerHTML?: string | null, originalInputValue?: string | null): SavedProbeEntry;
export declare function commitProbeValuesToElement(element: HTMLElement, values: PickProbeValues): void;
export declare function applySavedProbeEditsCompareMode(edits: Record<string, SavedProbeEntry>, mode: PickProbeCompareMode): void;
//# sourceMappingURL=pickProbeSession.d.ts.map