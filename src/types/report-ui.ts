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

export type PickTargetFontStyle = {
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
    lineHeight: string;
};

export type PickTargetBoxStyle = {
    display: string;
    padding: string;
    margin: string;
};

export type PickTargetContextMenuState = {
    clientX: number;
    clientY: number;
};

export type HoverPointer = {
    clientX: number;
    clientY: number;
};

export type PickProbeFieldKey =
    | "textContent"
    | "fontSize"
    | "padding"
    | "margin"
    | "lineHeight"
    | "textColor"
    | "backgroundColor"
    | "borderColor";

export type PickProbeValues = Record<PickProbeFieldKey, string>;

export type PickProbeCompareMode = "before" | "after";

export type ProposedChange = {
    key: PickProbeFieldKey;
    before: string;
    after: string;
};

export type SavedProbeEntry = {
    elementKey: string;
    baseline: PickProbeValues;
    applied: PickProbeValues;
    originalStyle: string | null;
    originalTextContent: string | null;
    originalInnerHTML: string | null;
    originalInputValue: string | null;
};

export type SavedProbeDeletion = {
    elementKey: string;
    outerHTML: string;
    parentSelector: string;
    childIndex: number;
};

export type ProbeOriginalSnapshot = {
    style: string | null;
    innerHTML: string;
    textContent: string;
    inputValue: string | null;
};

export type TargetSnapshot = {
    id: string;
    type: ReportTargetType;
    rect: DOMRect;
    isTagged: boolean;
    targetSelector?: string | null;
    suggestedReportId?: string | null;
    tagName?: string;
    reportIdAttribute?: string | null;
    boxStyle?: PickTargetBoxStyle;
    fontStyle?: PickTargetFontStyle | null;
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
    targetSelector: string | null;
    suggestedReportId: string | null;
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
