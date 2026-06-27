import type { ReportCase, ReportFeedback, ReportFieldValues, ReportStatus, ReportTargetType } from "./report.js";
import type { RouteDetailStatus } from "@/utils/routeDetailStatus.js";

export type ReportMode = "idle" | "report" | "view";
export type ResolvedAppearance = "light" | "dark";
export type ReportPanelTab = "route-details" | "feedback-list" | "settings" | "command";
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
    cases: ReportCase[];
    fieldValues: ReportFieldValues;
};

export type MarkerClampEdge = "top" | "bottom" | "left" | "right";

export type MarkerClampBounds = {
    left: number;
    top: number;
    right: number;
    bottom: number;
};

export type MarkerDetachedKind = "modal" | "hidden" | null;

export type Marker = {
    id: string;
    left: number;
    top: number;
    rect: DOMRect | null;
    detached: boolean;
    detachedKind: MarkerDetachedKind;
    clampedEdge: MarkerClampEdge | null;
    clampBounds: MarkerClampBounds | null;
    clampContainerId: string | null;
    report: ReportFeedback;
};

export type MarkerOverflowHint = {
    id: string;
    edge: MarkerClampEdge;
    count: number;
    bounds: MarkerClampBounds;
    containerId: string;
    left: number;
    top: number;
};

export type EditableDraft = {
    cases: ReportCase[];
    status: ReportStatus;
    fieldValues: ReportFieldValues;
};

export type PendingFeedbackComposer = {
    type: "deny" | "recheck" | "checkout" | "question";
    targetReplyId: string;
} | null;
