import type { ReportMessages } from "../i18n/types.js";
import type { PickProbeCompareMode, PickProbeFieldKey, PickProbeLayoutMode, PickProbeValues, ProposedChange, SavedProbeEntry } from "../types/report-ui.js";
export declare const EMPTY_PROBE_LAYOUT_VALUES: {
    justifyContent: string;
    alignItems: string;
    flexDirection: string;
    gap: string;
    gridColumnCount: string;
    gridRowCount: string;
};
export declare function getProbeFieldKeys(supportsTextFields: boolean, layoutMode?: PickProbeLayoutMode): PickProbeFieldKey[];
export declare function getProbeTextContent(element: HTMLElement): string;
export declare function capturePickProbeValues(element: HTMLElement): PickProbeValues;
export declare function applyPickProbeValueDiff(element: HTMLElement, baseline: PickProbeValues, current: PickProbeValues, mode?: PickProbeCompareMode): void;
export declare function applyPickProbeValues(element: HTMLElement, values: PickProbeValues, baseline?: PickProbeValues): void;
export declare function getProposedChanges(baseline: PickProbeValues, current: PickProbeValues, supportsTextFields?: boolean, layoutMode?: PickProbeLayoutMode): ProposedChange[];
export declare function applyPickProbeCompareMode(element: HTMLElement, mode: PickProbeCompareMode, baseline: PickProbeValues, current: PickProbeValues): void;
export declare function formatProbeElementKeyLabel(elementKey: string): string;
export declare function formatProposedChanges(changes: ProposedChange[], messages: ReportMessages): string;
export declare function formatSavedProbeEditsSummary(edits: Record<string, SavedProbeEntry>, messages: ReportMessages): string;
//# sourceMappingURL=pickProbe.d.ts.map