import type { ReportTargetType } from "../types/report.js";
import type { TargetSnapshot } from "../types/report-ui.js";
export declare function escapeAttribute(value: string): string;
export declare function resolveReportType(element: HTMLElement): ReportTargetType;
export declare function getFeedbackTargetSelector(reportId: string, reportType: ReportTargetType): string;
export declare function isSameHoverTarget(previous: TargetSnapshot | null, next: TargetSnapshot | null): boolean;
export declare function toSnapshot(element: HTMLElement | null): TargetSnapshot | null;
export declare function findTargetElement(baseElement: HTMLElement | null): HTMLElement | null;
export declare function getSelectableTargets(): TargetSnapshot[];
export declare function findTargetByPoint(overlay: HTMLDivElement | null, clientX: number, clientY: number): HTMLElement | null;
//# sourceMappingURL=dom.d.ts.map