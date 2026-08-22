import type {
    CreateReplyPayload,
    CreateReportFeedbackPayload,
    ListRepliesParams,
    ListRepliesResult,
    ReportActivitySummaryParams,
    ReportActivitySummaryResult,
    ReportApiLoginPayload,
    ReportApiRegisterPayload,
    ReportAuthUser,
    ReportAuthor,
    ReportCase,
    ReportFeedback,
    ReportPanelBootstrapParams,
    ReportPanelBootstrapResult,
    ReportReply,
    UpdateReportFeedbackPayload,
} from "./report.js";

export type FivePixelsAuthAdapter = {
    login?: (payload: ReportApiLoginPayload) => Promise<ReportAuthUser>;
    signup?: (payload: ReportApiRegisterPayload) => Promise<void>;
    artemisLogin?: () => Promise<ReportAuthUser>;
};

export type FivePixelsSessionAdapter = {
    getMe?: () => Promise<ReportAuthUser>;
    panelBootstrap?: (params: ReportPanelBootstrapParams) => Promise<ReportPanelBootstrapResult>;
    activitySummary?: (params: ReportActivitySummaryParams) => Promise<ReportActivitySummaryResult>;
};

export type FivePixelsMarkersListParams = {
    pathname: string;
};

export type FivePixelsMarkersAdapter = {
    /** GET /projects/{projectId}/feedback-markers */
    list?: (params: FivePixelsMarkersListParams) => Promise<ReportFeedback[]>;
};

export type FivePixelsFeedbackAdapter = {
    /** POST /projects/{projectId}/feedbacks */
    create?: (payload: CreateReportFeedbackPayload) => Promise<ReportFeedback>;
    /** GET /projects/{projectId}/feedbacks/{feedbackId} */
    get?: (feedbackId: string) => Promise<ReportFeedback>;
    /** GET /ui/projects/{projectId}/feedbacks/{feedbackId} */
    getForUi?: (feedbackId: string) => Promise<ReportFeedback>;
    /** PATCH /projects/{projectId}/feedbacks/{feedbackId} */
    update?: (feedbackId: string, payload: UpdateReportFeedbackPayload) => Promise<ReportFeedback>;
    /** DELETE /projects/{projectId}/feedbacks/{feedbackId} */
    delete?: (feedbackId: string) => Promise<void>;
};

export type FivePixelsCaseTimelineResult = {
    cases?: ReportCase[];
    replies?: ReportReply[];
};

export type FivePixelsCasesAdapter = {
    /** GET /projects/{projectId}/feedbacks/{feedbackId}/report-cases */
    list?: (feedbackId: string) => Promise<ReportCase[]>;
    /** PATCH /projects/{projectId}/feedbacks/{feedbackId}/report-cases/{caseId} */
    update?: (feedbackId: string, caseId: string, payload: Partial<ReportCase>) => Promise<ReportCase>;
    /** GET .../report-cases/{caseId}/timeline */
    getTimeline?: (feedbackId: string, caseId: string) => Promise<FivePixelsCaseTimelineResult>;
};

export type FivePixelsRepliesAdapter = {
    list?: (feedbackId: string, caseId: string, params?: ListRepliesParams) => Promise<ListRepliesResult | ReportReply[]>;
    create?: (feedbackId: string, caseId: string, payload: CreateReplyPayload) => Promise<ReportReply>;
};

export type FivePixelsMembersAdapter = {
    list?: () => Promise<ReportAuthor[]>;
    create?: (payload: Partial<ReportAuthor>) => Promise<ReportAuthor>;
    update?: (userId: string, payload: Partial<ReportAuthor>) => Promise<ReportAuthor>;
};

/**
 * Backend integration surface for `<FivePixels adapter={...} />`.
 *
 * Required for `sync="api"` / `sync="artemis"`:
 * - `markers.list`, `feedback.create`, and at least one of `feedback.update` / `cases.update`.
 */
export type FivePixelsAdapter = {
    auth?: FivePixelsAuthAdapter;
    session?: FivePixelsSessionAdapter;
    markers?: FivePixelsMarkersAdapter;
    feedback?: FivePixelsFeedbackAdapter;
    cases?: FivePixelsCasesAdapter;
    replies?: FivePixelsRepliesAdapter;
    members?: FivePixelsMembersAdapter;
};
