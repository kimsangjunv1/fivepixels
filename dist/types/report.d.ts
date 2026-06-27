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
    created_at: string;
    updated_at: string;
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
export type ReportReplyStatus = "suggested" | "additional_question" | "found_error" | "recheck_requested" | "resolved";
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
};
/** Project scope passed to `<FivePixels project={{ id, env, version }} />`. */
export type ReportProject = {
    id?: string;
    env?: string;
    version?: string;
};
export type QuestionThreadDisplay = "expanded" | "collapsed";
/** UI options passed to `<FivePixels ui={{ appearance, showFeedbackList, visibleShortcutKeys, shortcut, locale, messages }} />`. */
export type ReportUi = {
    appearance?: ReportAppearance;
    showFeedbackList?: boolean;
    visibleShortcutKeys?: boolean;
    questionThreadDefault?: QuestionThreadDisplay;
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
    publicKey?: string;
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
    cases: ReportCase[];
    status: ReportStatus;
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
export type UpdateReportFeedbackPayload = Partial<Pick<ReportFeedback, "cases" | "status" | "field_values" | "replies" | "report_id" | "report_type" | "integrations" | "auth">>;
export type ReportListAllParams = {
    cursor?: string;
    limit: number;
};
export type ReportListAllResult = {
    items: ReportFeedback[];
    nextCursor?: string;
};
export interface ReportStorageAdapter {
    list(params: {
        pathname: string;
    }): Promise<ReportFeedback[]>;
    listAll?(params: ReportListAllParams): Promise<ReportListAllResult>;
    listReplies?(commentId: string): Promise<ReportReply[]>;
    create(payload: CreateReportFeedbackPayload): Promise<ReportFeedback>;
    createReply?(commentId: string, payload: CreateReplyPayload): Promise<ReportReply>;
    update(id: string, payload: UpdateReportFeedbackPayload): Promise<ReportFeedback>;
    remove?(id: string): Promise<void>;
}
/** Custom persistence handlers passed to `<FivePixels />`. Requires onList, onCreate, and onUpdate together. */
export type ReportPersistenceHandlers = {
    onList: (params: {
        pathname: string;
    }) => Promise<ReportFeedback[]>;
    onListAll?: (params: ReportListAllParams) => Promise<ReportListAllResult>;
    onListReplies?: (commentId: string) => Promise<ReportReply[]>;
    onCreate: (payload: CreateReportFeedbackPayload) => Promise<ReportFeedback>;
    onCreateReply?: (commentId: string, payload: CreateReplyPayload) => Promise<ReportReply>;
    onUpdate: (id: string, payload: UpdateReportFeedbackPayload) => Promise<ReportFeedback>;
    onDelete?: (id: string) => Promise<void>;
};
export type SerializedReportFeedback = ReportFeedback;
export type SerializedReportReply = ReportReply;
export type Report = ReportFeedback;
export type CreateReportPayload = CreateReportFeedbackPayload;
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