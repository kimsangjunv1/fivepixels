import type { ReportMessages } from "../i18n/types.js";
import type { PickProbeCompareMode, PickProbeFieldKey, PickProbeValues, ProposedChange, SavedProbeEntry } from "../types/report-ui.js";
export declare function getProbeFieldKeys(supportsTextFields: boolean): PickProbeFieldKey[];
export declare function getProbeTextContent(element: HTMLElement): string;
export declare function capturePickProbeValues(element: HTMLElement): PickProbeValues;
export declare function applyPickProbeValues(element: HTMLElement, values: PickProbeValues): void;
export declare function getProposedChanges(baseline: PickProbeValues, current: PickProbeValues, supportsTextFields?: boolean): ProposedChange[];
export declare function applyPickProbeCompareMode(element: HTMLElement, mode: PickProbeCompareMode, baseline: PickProbeValues, current: PickProbeValues): void;
export declare function formatProbeElementKeyLabel(elementKey: string): string;
export declare function formatProposedChanges(changes: ProposedChange[], messages: ReportMessages): string;
export declare function formatSavedProbeEditsSummary(edits: Record<string, SavedProbeEntry>, messages: ReportMessages): string;
//# sourceMappingURL=pickProbe.d.ts.map