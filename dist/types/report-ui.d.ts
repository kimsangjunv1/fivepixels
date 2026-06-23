import type { ReportFeedback, ReportFieldValues, ReportStatus, ReportTargetType } from "./report.js";
import type { RouteDetailStatus } from "../utils/routeDetailStatus.js";
export type ReportMode = "idle" | "report" | "view";
export type ResolvedAppearance = "light" | "dark";
export type ReportPanelTab = "route-details" | "feedback-list" | "command";
export type ReportListScope = "current" | "all";
export type ReportFilters = {
    keyword: string;
    status: RouteDetailStatus | "all";
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
    anchorReportId: string | null;
    anchorReportType: ReportTargetType | null;
    anchorXRatio: number | null;
    anchorYRatio: number | null;
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
    detached: boolean;
    report: ReportFeedback;
};
export type EditableDraft = {
    message: string;
    status: ReportStatus;
    fieldValues: ReportFieldValues;
};
export type PendingFeedbackComposer = {
    type: "deny" | "recheck" | "checkout";
    targetReplyId: string;
} | null;
//# sourceMappingURL=report-ui.d.ts.map