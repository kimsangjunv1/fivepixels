import type { FeedbackCategory } from "../constants/feedbackCategory.js";
import type { FeedbackDisplayStatus } from "../constants/feedbackStatus.js";
import type { ElementMention, UserMention } from "./mention.js";
export type { FeedbackCategory } from "../constants/feedbackCategory.js";
export type { ElementMention, UserMention } from "./mention.js";
export type ReportTargetType = "group" | "item";
export type ReportStatus = "open" | "git_issued" | "resolved" | "archived";
export type ReportAppearance = "light" | "dark" | "system";
export declare const REPORT_STATUS_FLOW: readonly ["open", "git_issued", "resolved", "archived"];
export declare const REPORT_STATUS_TRANSITIONS: Record<ReportStatus, ReportStatus[]>;
export type ReportCaseStatus = "open" | "resolved";
export type ReportCase = {
    id: string;
    text: string;
    status: ReportCaseStatus;
    assignee_name?: string | null;
    previous_assignee_name?: string | null;
    created_at: string;
    updated_at: string;
    /** Element @mentions embedded in `text` via `@{mentionId}` tokens. */
    mentions?: ElementMention[];
    /** User @mentions embedded in `text` via `@u{userId}` tokens. */
    user_mentions?: UserMention[];
};
export type ReplyHistoryLoadMode = "pagination" | "infinite-scroll" | "load-more-button" | "button-and-scroll";
export type ReplyHistoryConfig = {
    mode?: ReplyHistoryLoadMode;
    pageSize?: number;
};
export type ListRepliesParams = {
    limit?: number;
    cursor?: string;
    direction?: "older";
    /** Required when using `adapter.replies.list` (replies are scoped to a case). */
    caseId?: string;
};
export type ListRepliesResult = {
    items: ReportReply[];
    hasMore: boolean;
    nextCursor?: string;
    totalCount?: number;
};
export type ReportFieldType = "textarea" | "checkbox";
export type ReportFieldBase = {
    key: string;
    label: string;
    required?: boolean;
};
export type ReportField = (ReportFieldBase & {
    type: "textarea";
}) | (ReportFieldBase & {
    type: "checkbox";
});
export type ReportFieldValues = Record<string, string | boolean>;
/** Stored on each timeline reply. Hover-only states use helpers, not storage. */
export type ReportReplyStatus = "suggested" | "additional_question" | "found_error" | "recheck_requested" | "resolved" | "assignee_assigned" | "assignee_transferred";
export type ReportReply = {
    id: string;
    comment_id?: string;
    message: string;
    created_at: string;
    status: ReportReplyStatus;
    case_ids: string[];
    parent_reply_id?: string | null;
    author_type?: "user" | "manager" | "system";
    author_name?: string | null;
    auth?: ReportAuthProof;
    mentions?: ElementMention[];
    user_mentions?: UserMention[];
};
export type ReportReplySummary = Pick<ReportReply, "id" | "message" | "created_at" | "status" | "author_type" | "author_name" | "case_ids">;
export type CreateReplyPayload = {
    message: string;
    status: ReportReplyStatus;
    case_ids?: string[];
    parent_reply_id?: string | null;
    author_type: NonNullable<ReportReply["author_type"]>;
    author_name?: string | null;
    auth?: ReportAuthProof;
    mentions?: ElementMention[];
    user_mentions?: UserMention[];
};
export type ReportIdentify = {
    id: string;
    name: string;
    /** Presentation-only public key for the team creator. */
    publicKey?: string;
    /** Presentation-only private key matching `publicKey`. */
    privateKey?: string;
};
/** Project scope passed to `<FivePixels project={{ id, env, version }} />`. */
export type ReportProject = {
    id?: string;
    env?: string;
    version?: string;
};
export type QuestionThreadDisplay = "expanded" | "collapsed";
/** Marker-window / panel thread layout. `classic` is the time-rail UI; `feed` is the vertical activity feed. */
export type ThreadLayoutStyle = "classic" | "feed";
/** Runtime mode for `<FivePixels />`. Presentation mode enables viewer switching in settings. */
export type FivePixelsMode = "default" | "presentation";
/** UI options passed to `<FivePixels ui={{ appearance, panelAppearance, tooltipAppearance, showFeedbackList, visibleShortcutKeys, shortcut, locale, messages, replyHistory }} />`. */
export type ReportUi = {
    panelAppearance?: ReportAppearance;
    tooltipAppearance?: ReportAppearance;
    showFeedbackList?: boolean;
    visibleShortcutKeys?: boolean;
    questionThreadDefault?: QuestionThreadDisplay;
    /** Default thread layout when the user has not chosen one in Settings → Appearance. */
    threadLayoutDefault?: ThreadLayoutStyle;
    replyHistory?: ReplyHistoryConfig;
    shortcut?: string;
    locale?: import("../i18n/types.js").ReportLocale;
    messages?: import("../i18n/types.js").DeepPartialReportMessages;
};
/** Team scope passed to `<FivePixels team={{ user, reviewers }} />`. */
export type ReportTeam = {
    /**
     * Optional host-injected identity. Prefer personal-key / API login onboarding;
     * most integrations can omit this.
     */
    user?: ReportIdentify;
    /**
     * Local reviewer seed and API fallback when `adapter.members.list` is unavailable.
     * Required for `sync="local"`. Optional for `sync="api"` / `sync="artemis"` when
     * `adapter.members.list` returns roles for the signed-in user.
     */
    reviewers?: ReportAuthor[];
    /**
     * @deprecated Prefer top-level `require.reviewerKey`.
     */
    requireReviewerKey?: boolean;
};
/** Visibility and route scope passed to `<FivePixels visibility={{ enabled, devOnly, routeKey }} />`. */
export type ReportVisibility = {
    enabled?: boolean;
    devOnly?: boolean;
    routeKey?: string;
};
/** Server-side team role (not the UI `PanelRole` tab preset). */
export type ReportAuthorRole = "admin" | "sub_admin" | "member";
export type ReportAuthor = {
    id: string;
    name: string;
    department?: string;
    publicKey?: string;
    /** Presentation-only private key matching `publicKey`. */
    privateKey?: string;
    /**
     * Team permission hierarchy:
     * - `admin`: sees all; can approve/edit sub_admin + member (not other admins)
     * - `sub_admin`: sees sub_admin + member; can approve/edit member only
     * - `member` (default): no Settings → Team tab
     */
    role?: ReportAuthorRole;
    /** Soft-disable without deleting history. Default true when omitted. */
    isActive?: boolean;
    /**
     * Project team membership when `adapter.members.list` returns a user directory
     * (e.g. `GET /users?projectId=`). Omitted or `true` = joined; `false` = not yet registered.
     */
    isJoined?: boolean;
};
export type ReportReviewerRequestStatus = "pending" | "approved" | "rejected";
export type ReportReviewerRequest = {
    id: string;
    author_id: string;
    author_name: string;
    public_key: string;
    status: ReportReviewerRequestStatus;
    created_at: string;
    resolved_at?: string | null;
    resolved_by?: string | null;
};
export type CreateReviewerRequestPayload = {
    author_id: string;
    author_name: string;
    public_key: string;
};
export type RegisterReviewerPayload = {
    author_id: string;
    author_name: string;
    public_key: string;
    role?: ReportAuthorRole;
};
export type UpdateReviewerPayload = {
    author_name?: string;
    public_key?: string;
    role?: ReportAuthorRole;
    is_active?: boolean;
};
export type ResolveReviewerRequestPayload = {
    status: "approved" | "rejected";
    role?: ReportAuthorRole;
};
/**
 * Optional team / reviewer management handlers (P3-auth).
 * Independent of feedback persistence — localStorage mode still shows `team.reviewers` read-only.
 */
export type ReportTeamHandlers = {
    onListReviewers?: () => Promise<ReportAuthor[]>;
    onListReviewerRequests?: () => Promise<ReportReviewerRequest[]>;
    onCreateReviewerRequest?: (payload: CreateReviewerRequestPayload) => Promise<ReportReviewerRequest>;
    onResolveReviewerRequest?: (id: string, payload: ResolveReviewerRequestPayload) => Promise<ReportReviewerRequest>;
    onRegisterReviewer?: (payload: RegisterReviewerPayload) => Promise<ReportAuthor>;
    onUpdateReviewer?: (id: string, payload: UpdateReviewerPayload) => Promise<ReportAuthor>;
    onDeleteReviewer?: (id: string) => Promise<void>;
};
/** User returned by `adapter.auth.login` / `refresh` / `artemisLogin`. */
export type ReportAuthUser = {
    id: string;
    name: string;
    email?: string;
};
/** Argument for `adapter.auth.login`. */
export type ReportApiLoginPayload = {
    loginId: string;
    password: string;
};
/** Argument for `adapter.auth.signup`. */
export type ReportApiRegisterPayload = {
    loginId: string;
    password: string;
    passwordConfirm: string;
    email: string;
    username: string;
};
/**
 * Optional account login handlers for API / Artemis onboarding.
 * Local login still uses personal keys in localStorage.
 *
 * Logout / token refresh map from `adapter.auth.logout` / `adapter.auth.refresh`
 * (optional). Missing handlers still allow local session clear on logout.
 */
export type ReportAuthHandlers = {
    /** @returns `{ id, name, email? }` */
    onApiLogin?: (payload: ReportApiLoginPayload) => Promise<ReportAuthUser>;
    /** @returns `void` on success */
    onApiRegister?: (payload: ReportApiRegisterPayload) => Promise<void>;
    /** @returns `void` */
    onApiLogout?: () => Promise<void>;
    /** @returns Updated `{ id, name, email? }`, or `void` if only the host token changed. */
    onApiRefresh?: () => Promise<ReportAuthUser | void>;
    /** @returns `{ id, name, email? }` */
    onArtemisLogin?: () => Promise<ReportAuthUser>;
};
export type ReportAuthAction = "feedback:create" | "feedback:update" | "reply:create";
export type ReportAuthProof = {
    author_id: string;
    algorithm: "ECDSA-P256-SHA256";
    action: ReportAuthAction;
    signed_at: string;
    signature: string;
};
export type ReportGitHubIntegrationState = {
    issue_number: number;
    issue_url: string;
    issued_at: string;
};
export type ReportIntegrations = {
    github?: ReportGitHubIntegrationState;
};
export type ReportGitHubIssueCreateResult = {
    issueNumber: number;
    issueUrl: string;
};
export type ReportGitHubIntegrationMode = "on-create" | "from-list";
export type ReportGitHubConfig = {
    enabled?: boolean;
    modes?: ReportGitHubIntegrationMode[];
    onCreate?: (feedback: ReportFeedback) => Promise<ReportGitHubIssueCreateResult>;
};
export type ReportPositionRatio = {
    x: number;
    y: number;
};
export type ReportPositionViewport = ReportPositionRatio & {
    width: number;
    height: number;
};
export type ReportPositionAnchor = {
    reportId: string;
    reportType: ReportTargetType;
    x: number;
    y: number;
};
export type ReportPosition = {
    target: ReportPositionRatio | null;
    viewport: ReportPositionViewport;
    scrollY: number;
    anchor: ReportPositionAnchor | null;
    /** Ordered `data-fp-view` keys required to reveal the feedback target. */
    viewPath?: string[];
};
export type ReportFeedback = {
    id: string;
    pathname: string;
    report_id: string;
    report_type: ReportTargetType;
    target_selector?: string;
    cases: ReportCase[];
    status: ReportStatus;
    /** Human-readable Feedback Case number shown as `#FC-{n}`. */
    fc_number?: number;
    /** Fixed feedback category selected when creating feedback. */
    category?: FeedbackCategory | null;
    field_values: ReportFieldValues;
    replies?: ReportReply[];
    reply_count?: number;
    latest_reply?: ReportReplySummary | null;
    position: ReportPosition;
    created_at: string;
    environment?: string;
    app_version?: string;
    author_id?: string;
    author_name?: string;
    auth?: ReportAuthProof;
    integrations?: ReportIntegrations;
};
export type CreateReportFeedbackPayload = Omit<ReportFeedback, "id" | "created_at" | "replies"> & {
    replies?: ReportReply[];
};
export type UpdateReportFeedbackPayload = Partial<Pick<ReportFeedback, "cases" | "status" | "category" | "field_values" | "replies" | "report_id" | "report_type" | "integrations" | "auth">>;
export type ReportListAllParams = {
    cursor?: string;
    limit: number;
};
export type ReportListAllResult = {
    items: ReportFeedback[];
    nextCursor?: string;
};
export type ReportActivitySummaryParams = {
    year: number;
    month?: number;
    pathname?: string;
    listScope?: "current" | "all";
    actorScope?: "team" | "me";
    metric?: "created" | "activity";
    actorName?: string | null;
};
export type ReportActivitySummaryBucket = {
    dateKey: string;
    count: number;
};
export type ReportActivitySummaryResult = {
    year: number;
    month?: number;
    buckets: ReportActivitySummaryBucket[];
    totalCount: number;
};
export type ReportPanelStats = {
    found: number;
    resolved: number;
    inProgress: number;
};
export type ReportRouteDetailsStatusRow = {
    status: FeedbackDisplayStatus;
    today: number;
    yesterday: number;
    delta: number;
};
export type ReportRouteDetailsFieldCount = {
    key: string;
    label: string;
    type: ReportField["type"];
    count: number;
};
export type ReportRouteDetailsSummary = {
    pathname: string;
    statusRows: ReportRouteDetailsStatusRow[];
    fieldCounts: ReportRouteDetailsFieldCount[];
    todayDateKey: string;
    yesterdayDateKey: string;
};
export type ReportPanelBootstrapParams = {
    pathname: string;
};
export type ReportPanelBootstrapResult = {
    stats: ReportPanelStats;
    routeDetails: ReportRouteDetailsSummary;
};
export interface ReportStorageAdapter {
    list(params: {
        pathname: string;
    }): Promise<ReportFeedback[]>;
    listAll?(params: ReportListAllParams): Promise<ReportListAllResult>;
    listReplies?(commentId: string, params?: ListRepliesParams): Promise<ListRepliesResult | ReportReply[]>;
    create(payload: CreateReportFeedbackPayload): Promise<ReportFeedback>;
    createReply?(commentId: string, payload: CreateReplyPayload): Promise<ReportReply>;
    update(id: string, payload: UpdateReportFeedbackPayload): Promise<ReportFeedback>;
    remove?(id: string): Promise<void>;
}
export type SerializedReportFeedback = ReportFeedback;
export type SerializedReportReply = ReportReply;
export type ReportEvent = {
    type: "feedback:create";
    payload: ReportFeedback;
} | {
    type: "feedback:update";
    payload: ReportFeedback;
} | {
    type: "feedback:delete";
    payload: {
        id: string;
    };
} | {
    type: "feedback:reply";
    payload: {
        feedbackId: string;
        message: string;
    };
} | {
    type: "feedback:github-issue-created";
    payload: {
        feedback: ReportFeedback;
        issueUrl: string;
    };
};
//# sourceMappingURL=report.d.ts.map