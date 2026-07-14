import type { ReportFeedback } from "../types/report.js";
export declare function createAutoPickReportId(selector: string): string;
export declare function isAutoPickReportId(reportId: string): boolean;
export declare function generateSuggestedReportId(element: HTMLElement): string;
export declare function buildReportIdAttributeSnippet(reportId: string, reportType?: "group" | "item"): string;
export declare function generateCssSelector(element: HTMLElement): string;
export declare function findElementByTargetSelector(selector: string): HTMLElement | null;
export type TargetBindingKind = "selector" | "report-id" | "coordinates";
export declare function resolveTargetBinding(report: Pick<ReportFeedback, "report_id" | "report_type" | "target_selector">): {
    kind: "selector";
    element: HTMLElement;
} | {
    kind: "report-id";
    element: HTMLElement;
} | {
    kind: "coordinates";
    element: HTMLElement | null;
};
export declare function isPickableElement(element: HTMLElement): boolean;
//# sourceMappingURL=targetSelector.d.ts.map