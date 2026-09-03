import type { ReportTargetType } from "../../types/report.js";
export declare function escapeAttribute(value: string): string;
export declare function resolveReportType(element: HTMLElement): ReportTargetType;
export declare function getFeedbackTargetSelector(reportId: string, reportType: ReportTargetType): string;
export declare function isFeedbackTargetVisible(element: HTMLElement): boolean;
//# sourceMappingURL=targetDom.d.ts.map