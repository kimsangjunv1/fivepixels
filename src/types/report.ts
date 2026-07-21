import type { FeedbackCategory } from "@/constants/feedbackCategory.js";
import type { FeedbackDisplayStatus } from "@/constants/feedbackStatus.js";

export type { FeedbackCategory } from "@/constants/feedbackCategory.js";
export type ReportTargetType = "group" | "item";
export type ReportStatus = "open" | "git_issued" | "resolved" | "archived";
export type ReportAppearance = "light" | "dark" | "system";
export const REPORT_STATUS_FLOW = ["open", "git_issued", "resolved", "archived"] as const;
export const REPORT_STATUS_TRANSITIONS: Record<ReportStatus, ReportStatus[]> = {
    open: ["git_issued", "resolved", "archived"],
    git_issued: ["open", "resolved", "archived"],
    resolved: ["open", "archived"],
    archived: [],
};

export type ReportCaseStatus = "open" | "resolved";

export type ReportCase = {
    id: string;
    text: string;
    status: ReportCaseStatus;
    assignee_name?: string | null;
    previous_assignee_name?: string | null;
    created_at: string;
    updated_at: string;
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
export type ReportField = (ReportFieldBase & { type: "textarea" }) | (ReportFieldBase & { type: "checkbox" });
export type ReportFieldValues = Record<string, string | boolean>;
/** Stored on each timeline reply. Hover-only states use helpers, not storage. */
export type ReportReplyStatus =
    | "suggested"
    | "additional_question"
    | "found_error"
    | "recheck_requested"
    | "resolved"
    | "assignee_assigned"
    | "assignee_transferred";

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

/** Runtime mode for `<FivePixels />`. Presentation mode enables viewer switching in settings. */
export type FivePixelsMode = "default" | "presentation";

/** UI options passed to `<FivePixels ui={{ appearance, panelAppearance, tooltipAppearance, showFeedbackList, visibleShortcutKeys, shortcut, locale, messages, replyHistory }} />`. */
export type ReportUi = {
    panelAppearance?: ReportAppearance;
    tooltipAppearance?: ReportAppearance;
    showFeedbackList?: boolean;
    visibleShortcutKeys?: boolean;
    questionThreadDefault?: QuestionThreadDisplay;
    replyHistory?: ReplyHistoryConfig;
    shortcut?: string;
    locale?: import("../i18n/types.js").ReportLocale;
    messages?: import("../i18n/types.js").DeepPartialReportMessages;
};

/** Team scope passed to `<FivePixels team={{ user, reviewers }} />`. */
export type ReportTeam = {
    user?: ReportIdentify;
    reviewers?: ReportAuthor[];
    requireReviewerKey?: boolean;
};

/** Visibility and route scope passed to `<FivePixels visibility={{ enabled, devOnly, routeKey }} />`. */
export type ReportVisibility = {
    enabled?: boolean;
    devOnly?: boolean;
    routeKey?: string;
};

export type ReportAuthor = {
    id: string;
    name: string;
    department?: string;
    publicKey?: string;
    /** Presentation-only private key matching `publicKey`. */
    privateKey?: string;
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

export type UpdateReportFeedbackPayload = Partial<
    Pick<ReportFeedback, "cases" | "status" | "category" | "field_values" | "replies" | "report_id" | "report_type" | "integrations" | "auth">
>;

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
    list(params: { pathname: string }): Promise<ReportFeedback[]>;
    listAll?(params: ReportListAllParams): Promise<ReportListAllResult>;
    listReplies?(commentId: string, params?: ListRepliesParams): Promise<ListRepliesResult | ReportReply[]>;
    create(payload: CreateReportFeedbackPayload): Promise<ReportFeedback>;
    createReply?(commentId: string, payload: CreateReplyPayload): Promise<ReportReply>;
    update(id: string, payload: UpdateReportFeedbackPayload): Promise<ReportFeedback>;
    remove?(id: string): Promise<void>;
}

/** Custom persistence handlers passed to `<FivePixels />`. Requires onList, onCreate, and onUpdate together.
 * Exposed on `FivePixelsProps` via `Partial<ReportPersistenceHandlers>` (`src/types/publicApi.ts`).
 */
export type ReportPersistenceHandlers = {
    /** Current-page list. Returns `ReportFeedback[]`. */
    onList: (params: { pathname: string }) => Promise<ReportFeedback[]>;
    /** Paginated all-pages list. */
    onListAll?: (params: ReportListAllParams) => Promise<ReportListAllResult>;
    onPanelBootstrap?: (params: ReportPanelBootstrapParams) => Promise<ReportPanelBootstrapResult>;
    onActivitySummary?: (params: ReportActivitySummaryParams) => Promise<ReportActivitySummaryResult>;
    onListReplies?: (commentId: string, params?: ListRepliesParams) => Promise<ListRepliesResult | ReportReply[]>;
    /** Create feedback. Body: `CreateReportFeedbackPayload` → `ReportFeedback`. */
    onCreate: (payload: CreateReportFeedbackPayload) => Promise<ReportFeedback>;
    onCreateReply?: (commentId: string, payload: CreateReplyPayload) => Promise<ReportReply>;
    /** Patch feedback / cases / replies embed. → `ReportFeedback`. */
    onUpdate: (id: string, payload: UpdateReportFeedbackPayload) => Promise<ReportFeedback>;
    onDelete?: (id: string) => Promise<void>;
};

export type SerializedReportFeedback = ReportFeedback;
export type SerializedReportReply = ReportReply;

export type Report = ReportFeedback;
export type CreateReportPayload = CreateReportFeedbackPayload;

export type ReportEvent =
    | { type: "feedback:create"; payload: ReportFeedback }
    | { type: "feedback:update"; payload: ReportFeedback }
    | { type: "feedback:delete"; payload: { id: string } }
    | {
          type: "feedback:reply";
          payload: {
              feedbackId: string;
              message: string;
          };
      }
    | {
          type: "feedback:github-issue-created";
          payload: {
              feedback: ReportFeedback;
              issueUrl: string;
          };
      };
