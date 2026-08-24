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
    ReportCaseStatus,
    ReportFeedback,
    ReportPanelBootstrapParams,
    ReportPanelBootstrapResult,
    ReportReply,
    ReportStatus,
    UpdateReportFeedbackPayload,
} from "./report.js";

export type FivePixelsAuthAdapter = {
    /** POST /auth/login — required when `sync="api"` */
    login?: (payload: ReportApiLoginPayload) => Promise<ReportAuthUser>;
    /** POST /auth/register — required when `sync="api"` */
    signup?: (payload: ReportApiRegisterPayload) => Promise<void>;
    /** POST /auth/logout — required when `sync="api"` */
    logout?: () => Promise<void>;
    /** POST /auth/refresh — required when `sync="api"` */
    refresh?: () => Promise<ReportAuthUser | void>;
    artemisLogin?: () => Promise<ReportAuthUser>;
};

export type FivePixelsSessionAdapter = {
    panelBootstrap?: (params: ReportPanelBootstrapParams) => Promise<ReportPanelBootstrapResult>;
    activitySummary?: (params: ReportActivitySummaryParams) => Promise<ReportActivitySummaryResult>;
};

export type FivePixelsMarkersListParams = {
    pathname: string;
};

export type FivePixelsMarkersAdapter = {
    /** GET /projects/{projectId}/feedbacks/markers?pathname= */
    list?: (params: FivePixelsMarkersListParams) => Promise<ReportFeedback[]>;
};

export type FivePixelsFeedbackAssigneePayload = {
    assignee_name?: string | null;
};

export type FivePixelsFeedbackStatusPayload = {
    status: ReportStatus;
};

export type FivePixelsFeedbackAdapter = {
    /** POST /projects/{projectId}/feedbacks */
    create?: (payload: CreateReportFeedbackPayload) => Promise<ReportFeedback>;
    /** GET /projects/{projectId}/feedbacks/{feedbackId} */
    get?: (feedbackId: string) => Promise<ReportFeedback>;
    /**
     * UI hydration detail.
     * Maps to GET /projects/{projectId}/feedbacks/{feedbackId}/overview
     * (legacy `/ui/...` path is no longer part of the backend contract).
     */
    getForUi?: (feedbackId: string) => Promise<ReportFeedback>;
    /** PATCH /projects/{projectId}/feedbacks/{feedbackId} */
    update?: (feedbackId: string, payload: UpdateReportFeedbackPayload) => Promise<ReportFeedback>;
    /** PUT /projects/{projectId}/feedbacks/{feedbackId}/assignee */
    updateAssignee?: (feedbackId: string, payload: FivePixelsFeedbackAssigneePayload) => Promise<ReportFeedback>;
    /** PUT /projects/{projectId}/feedbacks/{feedbackId}/status */
    updateStatus?: (feedbackId: string, payload: FivePixelsFeedbackStatusPayload) => Promise<ReportFeedback>;
    /**
     * Optional local/API delete.
     * Not present in the current backend Swagger surface — keep only if your API supports it.
     */
    delete?: (feedbackId: string) => Promise<void>;
};

export type FivePixelsCaseTimelineResult = {
    cases?: ReportCase[];
    replies?: ReportReply[];
};

export type FivePixelsCaseAssigneePayload = {
    assignee_name?: string | null;
};

export type FivePixelsCaseStatusPayload = {
    status: ReportCaseStatus;
};

export type FivePixelsCasesAdapter = {
    /** GET /projects/{projectId}/feedbacks/{feedbackId}/report-cases */
    list?: (feedbackId: string) => Promise<ReportCase[]>;
    /** GET /projects/{projectId}/report-cases */
    listByProject?: () => Promise<ReportCase[]>;
    /** GET /projects/{projectId}/feedbacks/{feedbackId}/report-cases/{caseId} */
    get?: (feedbackId: string, caseId: string) => Promise<ReportCase>;
    /** POST /projects/{projectId}/feedbacks/{feedbackId}/report-cases */
    create?: (feedbackId: string, payload: Partial<ReportCase>) => Promise<ReportCase>;
    /** PATCH /projects/{projectId}/feedbacks/{feedbackId}/report-cases/{caseId} */
    update?: (feedbackId: string, caseId: string, payload: Partial<ReportCase>) => Promise<ReportCase>;
    /** PUT /projects/{projectId}/feedbacks/{feedbackId}/report-cases/{caseId}/assignee */
    updateAssignee?: (feedbackId: string, caseId: string, payload: FivePixelsCaseAssigneePayload) => Promise<ReportCase>;
    /** PUT /projects/{projectId}/feedbacks/{feedbackId}/report-cases/{caseId}/status */
    updateStatus?: (feedbackId: string, caseId: string, payload: FivePixelsCaseStatusPayload) => Promise<ReportCase>;
    /** GET .../report-cases/{caseId}/timeline */
    getTimeline?: (feedbackId: string, caseId: string) => Promise<FivePixelsCaseTimelineResult>;
};

export type UpdateReplyPayload = Partial<Pick<ReportReply, "message" | "status" | "mentions">>;

export type FivePixelsRepliesAdapter = {
    /** GET .../report-cases/{reportCaseId}/replies */
    list?: (feedbackId: string, caseId: string, params?: ListRepliesParams) => Promise<ListRepliesResult | ReportReply[]>;
    /** POST .../report-cases/{reportCaseId}/replies */
    create?: (feedbackId: string, caseId: string, payload: CreateReplyPayload) => Promise<ReportReply>;
    /** PATCH .../report-cases/{reportCaseId}/replies/{replyId} */
    update?: (feedbackId: string, caseId: string, replyId: string, payload: UpdateReplyPayload) => Promise<ReportReply>;
    /** DELETE .../report-cases/{reportCaseId}/replies/{replyId} */
    delete?: (feedbackId: string, caseId: string, replyId: string) => Promise<void>;
};

export type FivePixelsMembersAdapter = {
    /** GET /projects/{projectId}/members */
    list?: () => Promise<ReportAuthor[]>;
    /** POST /projects/{projectId}/members */
    create?: (payload: Partial<ReportAuthor>) => Promise<ReportAuthor>;
    /** PATCH /projects/{projectId}/members/{userId} */
    update?: (userId: string, payload: Partial<ReportAuthor>) => Promise<ReportAuthor>;
    /** DELETE /projects/{projectId}/members/{userId} */
    delete?: (userId: string) => Promise<void>;
};

/**
 * Backend integration surface for `<FivePixels adapter={...} />`.
 *
 * Required for `sync="api"`:
 * - `auth.login`, `auth.signup`, `auth.logout`, `auth.refresh`
 * - `markers.list`, `feedback.create`, and at least one of `feedback.update` / `cases.update`
 *
 * Required for `sync="artemis"`:
 * - `auth.artemisLogin`
 * - `markers.list`, `feedback.create`, and at least one of `feedback.update` / `cases.update`
 *
 * Paths follow `/api/v1/fivepixels` (host supplies the base URL).
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
