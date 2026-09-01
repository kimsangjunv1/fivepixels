import type { CreateReplyPayload, CreateReportFeedbackPayload, ListRepliesParams, ListRepliesResult, ReportActivitySummaryParams, ReportActivitySummaryResult, ReportApiLoginPayload, ReportApiRegisterPayload, ReportAuthUser, ReportAuthor, ReportCase, ReportCaseStatus, ReportFeedback, ReportPanelBootstrapParams, ReportPanelBootstrapResult, ReportReply, ReportStatus, UpdateReportFeedbackPayload } from "./report.js";
export type FivePixelsAuthAdapter = {
    /**
     * POST /auth/login — required when `sync="api"` and `require.authLogin` (default).
     *
     * @param payload `{ loginId, password }`
     * @returns Authenticated user `{ id, name, email? }`
     * @example
     * async ({ loginId, password }) => ({ id: "u1", name: "Hong", email: "hong@example.com" })
     */
    login?: (payload: ReportApiLoginPayload) => Promise<ReportAuthUser>;
    /**
     * POST /auth/register — optional.
     *
     * @param payload `{ loginId, password, passwordConfirm, email, username }`
     * @returns `void` on success (throw on failure)
     */
    signup?: (payload: ReportApiRegisterPayload) => Promise<void>;
    /**
     * POST /auth/logout — optional.
     * Host may clear tokens here; library still clears local session afterward.
     *
     * @returns `void`
     */
    logout?: () => Promise<void>;
    /**
     * POST /auth/refresh — optional.
     *
     * @returns Updated `{ id, name, email? }` to refresh the local session, or `void` if only the host token changed
     */
    refresh?: () => Promise<ReportAuthUser | void>;
    /**
     * Artemis SSO entry — required when `sync="artemis"` and `require.authLogin` (default).
     *
     * @returns Authenticated user `{ id, name, email? }`
     * @example
     * async () => ({ id: "artemis-1", name: "Artemis User", email: "user@example.com" })
     */
    artemisLogin?: () => Promise<ReportAuthUser>;
};
export type FivePixelsSessionAdapter = {
    /**
     * Panel header/stats bootstrap for the current route.
     *
     * @param params `{ pathname }`
     * @returns `{ stats: { found, resolved, inProgress }, routeDetails }`
     */
    panelBootstrap?: (params: ReportPanelBootstrapParams) => Promise<ReportPanelBootstrapResult>;
    /**
     * Activity chart buckets for a year/month scope.
     *
     * @param params `{ year, month?, pathname?, listScope?, actorScope?, metric?, actorName? }`
     * @returns `{ year, month?, buckets: [{ dateKey, count }], totalCount }`
     */
    activitySummary?: (params: ReportActivitySummaryParams) => Promise<ReportActivitySummaryResult>;
};
export type FivePixelsMarkersListParams = {
    /** Current page path used to filter markers. */
    pathname: string;
};
export type FivePixelsMarkersAdapter = {
    /**
     * GET /projects/{projectId}/feedbacks/markers?pathname=
     * Required for `sync="api"` / `sync="artemis"` persistence.
     *
     * @param params `{ pathname }` — current route
     * @returns Feedback markers for that path (`ReportFeedback[]`)
     * @example
     * async ({ pathname }) => [{
     *   id: "fb1",
     *   pathname,
     *   report_id: "el-1",
     *   report_type: "item",
     *   cases: [],
     *   status: "open",
     *   field_values: {},
     * }]
     */
    list?: (params: FivePixelsMarkersListParams) => Promise<ReportFeedback[]>;
};
export type FivePixelsFeedbackAssigneePayload = {
    assignee_name?: string | null;
};
export type FivePixelsFeedbackStatusPayload = {
    status: ReportStatus;
};
export type FivePixelsFeedbackAdapter = {
    /**
     * POST /projects/{projectId}/feedbacks
     * Required for `sync="api"` / `sync="artemis"` persistence.
     *
     * @param payload Create payload (same shape as `ReportFeedback` minus `id` / `created_at`)
     * @returns Created `ReportFeedback` (must include server-assigned `id`)
     */
    create?: (payload: CreateReportFeedbackPayload) => Promise<ReportFeedback>;
    /**
     * GET /projects/{projectId}/feedbacks/{feedbackId}
     *
     * @param feedbackId Feedback id
     * @returns Full `ReportFeedback`
     */
    get?: (feedbackId: string) => Promise<ReportFeedback>;
    /**
     * UI hydration detail.
     * Maps to GET /projects/{projectId}/feedbacks/{feedbackId}/overview
     * (legacy `/ui/...` path is no longer part of the backend contract).
     *
     * @param feedbackId Feedback id
     * @returns `ReportFeedback` shaped for panel detail rendering
     */
    getForUi?: (feedbackId: string) => Promise<ReportFeedback>;
    /**
     * PATCH /projects/{projectId}/feedbacks/{feedbackId}
     * At least one of `feedback.update` / `cases.update` is required for remote persistence.
     *
     * @param feedbackId Feedback id
     * @param payload Partial fields (`cases`, `status`, `category`, `field_values`, …)
     * @returns Updated `ReportFeedback`
     */
    update?: (feedbackId: string, payload: UpdateReportFeedbackPayload) => Promise<ReportFeedback>;
    /**
     * PUT /projects/{projectId}/feedbacks/{feedbackId}/assignee
     *
     * @param feedbackId Feedback id
     * @param payload `{ assignee_name?: string | null }`
     * @returns Updated `ReportFeedback`
     */
    updateAssignee?: (feedbackId: string, payload: FivePixelsFeedbackAssigneePayload) => Promise<ReportFeedback>;
    /**
     * PUT /projects/{projectId}/feedbacks/{feedbackId}/status
     *
     * @param feedbackId Feedback id
     * @param payload `{ status: "open" | "git_issued" | "resolved" | "archived" }`
     * @returns Updated `ReportFeedback`
     */
    updateStatus?: (feedbackId: string, payload: FivePixelsFeedbackStatusPayload) => Promise<ReportFeedback>;
    /**
     * Optional local/API delete.
     * Not present in the current backend Swagger surface — keep only if your API supports it.
     *
     * @param feedbackId Feedback id
     * @returns `void`
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
    /**
     * GET /projects/{projectId}/feedbacks/{feedbackId}/report-cases
     *
     * @param feedbackId Parent feedback id
     * @returns Case list (`ReportCase[]`) — each `{ id, text, status, created_at, updated_at, … }`
     */
    list?: (feedbackId: string) => Promise<ReportCase[]>;
    /**
     * GET /projects/{projectId}/report-cases
     *
     * @returns All cases in the project (`ReportCase[]`)
     */
    listByProject?: () => Promise<ReportCase[]>;
    /**
     * GET /projects/{projectId}/feedbacks/{feedbackId}/report-cases/{caseId}
     *
     * @param feedbackId Parent feedback id
     * @param caseId Case id
     * @returns Single `ReportCase`
     */
    get?: (feedbackId: string, caseId: string) => Promise<ReportCase>;
    /**
     * POST /projects/{projectId}/feedbacks/{feedbackId}/report-cases
     *
     * @param feedbackId Parent feedback id
     * @param payload Partial case fields (`text`, `status`, …)
     * @returns Created `ReportCase` (must include server-assigned `id`, timestamps)
     */
    create?: (feedbackId: string, payload: Partial<ReportCase>) => Promise<ReportCase>;
    /**
     * PATCH /projects/{projectId}/feedbacks/{feedbackId}/report-cases/{caseId}
     * At least one of `feedback.update` / `cases.update` is required for remote persistence.
     *
     * @param feedbackId Parent feedback id
     * @param caseId Case id
     * @param payload Partial case fields
     * @returns Updated `ReportCase`
     */
    update?: (feedbackId: string, caseId: string, payload: Partial<ReportCase>) => Promise<ReportCase>;
    /**
     * PUT /projects/{projectId}/feedbacks/{feedbackId}/report-cases/{caseId}/assignee
     *
     * @param feedbackId Parent feedback id
     * @param caseId Case id
     * @param payload `{ assignee_name?: string | null }`
     * @returns Updated `ReportCase`
     */
    updateAssignee?: (feedbackId: string, caseId: string, payload: FivePixelsCaseAssigneePayload) => Promise<ReportCase>;
    /**
     * PUT /projects/{projectId}/feedbacks/{feedbackId}/report-cases/{caseId}/status
     *
     * @param feedbackId Parent feedback id
     * @param caseId Case id
     * @param payload `{ status: "open" | "resolved" }`
     * @returns Updated `ReportCase`
     */
    updateStatus?: (feedbackId: string, caseId: string, payload: FivePixelsCaseStatusPayload) => Promise<ReportCase>;
    /**
     * GET .../report-cases/{caseId}/timeline
     *
     * @param feedbackId Parent feedback id
     * @param caseId Case id
     * @returns `{ cases?: ReportCase[], replies?: ReportReply[] }`
     */
    getTimeline?: (feedbackId: string, caseId: string) => Promise<FivePixelsCaseTimelineResult>;
};
export type UpdateReplyPayload = Partial<Pick<ReportReply, "message" | "status" | "mentions">>;
export type FivePixelsRepliesAdapter = {
    /**
     * GET .../report-cases/{reportCaseId}/replies
     *
     * @param feedbackId Parent feedback id
     * @param caseId Case id
     * @param params Optional `{ limit?, cursor?, direction?: "older" }`
     * @returns Either `ReportReply[]` or `{ items, hasMore, nextCursor?, totalCount? }`
     */
    list?: (feedbackId: string, caseId: string, params?: ListRepliesParams) => Promise<ListRepliesResult | ReportReply[]>;
    /**
     * POST .../report-cases/{reportCaseId}/replies
     *
     * @param feedbackId Parent feedback id
     * @param caseId Case id
     * @param payload `{ message, status, author_type, … }`
     * @returns Created `ReportReply` (must include `id`, `created_at`, `status`, `case_ids`)
     */
    create?: (feedbackId: string, caseId: string, payload: CreateReplyPayload) => Promise<ReportReply>;
    /**
     * PATCH .../report-cases/{reportCaseId}/replies/{replyId}
     *
     * @param feedbackId Parent feedback id
     * @param caseId Case id
     * @param replyId Reply id
     * @param payload Partial `{ message?, status?, mentions? }`
     * @returns Updated `ReportReply`
     */
    update?: (feedbackId: string, caseId: string, replyId: string, payload: UpdateReplyPayload) => Promise<ReportReply>;
    /**
     * DELETE .../report-cases/{reportCaseId}/replies/{replyId}
     *
     * @param feedbackId Parent feedback id
     * @param caseId Case id
     * @param replyId Reply id
     * @returns `void`
     */
    delete?: (feedbackId: string, caseId: string, replyId: string) => Promise<void>;
};
export type FivePixelsMembersAdapter = {
    /**
     * GET /projects/{projectId}/members — or a user directory such as
     * `GET /users?projectId=` when each item includes `isJoined`.
     *
     * @returns `ReportAuthor[]` — joined members when `isJoined` is omitted; otherwise full directory
     */
    list?: () => Promise<ReportAuthor[]>;
    /**
     * POST /projects/{projectId}/members
     *
     * @param payload Partial author fields
     * @returns Created `ReportAuthor` (must include `id`, `name`)
     */
    create?: (payload: Partial<ReportAuthor>) => Promise<ReportAuthor>;
    /**
     * PATCH /projects/{projectId}/members/{userId}
     *
     * @param userId Member id
     * @param payload Partial author fields
     * @returns Updated `ReportAuthor`
     */
    update?: (userId: string, payload: Partial<ReportAuthor>) => Promise<ReportAuthor>;
    /**
     * DELETE /projects/{projectId}/members/{userId}
     *
     * @param userId Member id
     * @returns `void`
     */
    delete?: (userId: string) => Promise<void>;
};
/**
 * Backend integration surface for `<FivePixels adapter={...} />`.
 *
 * Required for `sync="api"` / `sync="artemis"` persistence:
 * - `markers.list`, `feedback.create`, and at least one of `feedback.update` / `cases.update`
 *
 * Auth (when `require.authLogin` is true, default for remote sync):
 * - `api`: `auth.login` required; `signup` / `logout` / `refresh` optional
 *   (`logout` / `refresh` map to session `logoutWithApi` / `refreshWithApi`)
 * - `artemis`: `auth.artemisLogin` required
 *
 * When `require.authLogin={false}`, identity uses local-style personal key onboarding; auth handlers are unused.
 *
 * Paths follow `/api/v1/fivepixels` (host supplies the base URL).
 * Hover each nested handler for `@param` / `@returns` shapes.
 */
export type FivePixelsAdapter = {
    /** Auth handlers — see `FivePixelsAuthAdapter` (`login` returns `ReportAuthUser`, etc.). */
    auth?: FivePixelsAuthAdapter;
    /** Optional panel bootstrap / activity summary handlers. */
    session?: FivePixelsSessionAdapter;
    /** Marker listing — `list` returns `Promise<ReportFeedback[]>`. */
    markers?: FivePixelsMarkersAdapter;
    /** Feedback CRUD — `create` / `update` return `Promise<ReportFeedback>`. */
    feedback?: FivePixelsFeedbackAdapter;
    /** Case CRUD — handlers return `Promise<ReportCase>` or `ReportCase[]`. */
    cases?: FivePixelsCasesAdapter;
    /** Reply CRUD — `list` may return `ListRepliesResult | ReportReply[]`. */
    replies?: FivePixelsRepliesAdapter;
    /** Team members — handlers return `Promise<ReportAuthor>` or `ReportAuthor[]`. */
    members?: FivePixelsMembersAdapter;
};
//# sourceMappingURL=adapter.d.ts.map