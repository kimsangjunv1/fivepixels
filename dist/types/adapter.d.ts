import type { CreateReplyPayload, CreateReportFeedbackPayload, ListRepliesParams, ListRepliesResult, ReportActivitySummaryParams, ReportActivitySummaryResult, ReportApiLoginPayload, ReportApiRegisterPayload, ReportAuthUser, ReportAuthor, ReportCase, ReportFeedback, ReportPanelBootstrapParams, ReportPanelBootstrapResult, ReportReply, UpdateReportFeedbackPayload } from "./report.js";
export type FivePixelsAuthAdapter = {
    login?: (payload: ReportApiLoginPayload) => Promise<ReportAuthUser>;
    signup?: (payload: ReportApiRegisterPayload) => Promise<void>;
    logout?: () => Promise<void>;
    refresh?: (payload: {
        refreshToken: string;
    }) => Promise<{
        accessToken: string;
        refreshToken?: string;
    }>;
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
    /** PUT /projects/{projectId}/feedbacks/{feedbackId}/assignee */
    updateAssignee?: (feedbackId: string, payload: {
        assignee_name: string;
    }) => Promise<ReportFeedback>;
    /** PUT /projects/{projectId}/feedbacks/{feedbackId}/status */
    updateStatus?: (feedbackId: string, payload: {
        status: ReportFeedback["status"];
    }) => Promise<ReportFeedback>;
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
    /** GET /projects/{projectId}/feedbacks/{feedbackId}/report-cases/{caseId} */
    get?: (feedbackId: string, caseId: string) => Promise<ReportCase>;
    /** POST /projects/{projectId}/feedbacks/{feedbackId}/report-cases */
    create?: (feedbackId: string, payload: Pick<ReportCase, "text"> & Partial<ReportCase>) => Promise<ReportCase>;
    /** PATCH /projects/{projectId}/feedbacks/{feedbackId}/report-cases/{caseId} */
    update?: (feedbackId: string, caseId: string, payload: Partial<ReportCase>) => Promise<ReportCase>;
    /** PUT .../report-cases/{caseId}/assignee */
    updateAssignee?: (feedbackId: string, caseId: string, payload: {
        assignee_name: string;
    }) => Promise<ReportCase>;
    /** PUT .../report-cases/{caseId}/status */
    updateStatus?: (feedbackId: string, caseId: string, payload: {
        status: ReportCase["status"];
    }) => Promise<ReportCase>;
    /** GET .../report-cases/{caseId}/timeline */
    getTimeline?: (feedbackId: string, caseId: string) => Promise<FivePixelsCaseTimelineResult>;
};
export type FivePixelsRepliesAdapter = {
    list?: (feedbackId: string, caseId: string, params?: ListRepliesParams) => Promise<ListRepliesResult | ReportReply[]>;
    create?: (feedbackId: string, caseId: string, payload: CreateReplyPayload) => Promise<ReportReply>;
    update?: (feedbackId: string, caseId: string, replyId: string, payload: Partial<ReportReply>) => Promise<ReportReply>;
    delete?: (feedbackId: string, caseId: string, replyId: string) => Promise<void>;
};
export type FivePixelsMembersAdapter = {
    list?: () => Promise<ReportAuthor[]>;
    create?: (payload: Partial<ReportAuthor>) => Promise<ReportAuthor>;
    update?: (userId: string, payload: Partial<ReportAuthor>) => Promise<ReportAuthor>;
    delete?: (userId: string) => Promise<void>;
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
//# sourceMappingURL=adapter.d.ts.map