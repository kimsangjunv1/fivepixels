import type { ReportMessages } from "../i18n/types.js";
import type { PickProbeCompareMode, PickProbeValues, ProposedChange } from "../types/report-ui.js";
export declare function capturePickProbeValues(element: HTMLElement): PickProbeValues;
export declare function applyPickProbeValues(element: HTMLElement, values: PickProbeValues): void;
export declare function getProposedChanges(baseline: PickProbeValues, current: PickProbeValues): ProposedChange[];
export declare function applyPickProbeCompareMode(element: HTMLElement, mode: PickProbeCompareMode, baseline: PickProbeValues, current: PickProbeValues): void;
export declare function formatProposedChanges(changes: ProposedChange[], messages: ReportMessages): string;
//# sourceMappingURL=pickProbe.d.ts.map