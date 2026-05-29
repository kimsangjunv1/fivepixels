import type { ReportFeedback, ReportFieldValues, ReportStatus, ReportTargetType } from "./report.js";
export type ReportMode = "idle" | "report" | "view";
export type ResolvedAppearance = "light" | "dark";
export type ReportFilters = {
    keyword: string;
    status: ReportStatus | "all";
    reportType: ReportTargetType | "all";
};
export type TargetSnapshot = {
    id: string;
    type: ReportTargetType;
    rect: DOMRect;
};
export type DraftReport = {
    clientX: number;
    clientY: number;
    xRatio: number;
    yRatio: number;
    elementXRatio: number;
    elementYRatio: number;
    scrollY: number;
    documentY: number;
    reportId: string;
    reportType: ReportTargetType;
    message: string;
    fieldValues: ReportFieldValues;
};
export type Marker = {
    id: string;
    left: number;
    top: number;
    rect: DOMRect | null;
    report: ReportFeedback;
};
export type EditableDraft = {
    message: string;
    status: ReportStatus;
    fieldValues: ReportFieldValues;
};
//# sourceMappingURL=report-ui.d.ts.map