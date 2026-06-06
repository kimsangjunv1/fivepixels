export type ReportTargetType = "group" | "item";
export type ReportStatus = "open" | "resolved" | "archived";
export type ReportAppearance = "light" | "dark" | "system";
export const REPORT_STATUS_FLOW = ["open", "resolved", "archived"] as const;
export const REPORT_STATUS_TRANSITIONS: Record<ReportStatus, ReportStatus[]> = {
    open: ["resolved", "archived"],
    resolved: ["open", "archived"],
    archived: [],
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
export type ReportReplyStatus = "suggested" | "found_error" | "resolved";

export type ReportReply = {
    id: string;
    message: string;
    created_at: string;
    status: ReportReplyStatus;
    author_type?: "user" | "manager" | "system";
    author_name?: string | null;
};

export type ReportIdentify = {
    id: string;
    name: string;
};

/** Project scope passed to `<Report project={{ id, env, version }} />`. */
export type ReportProject = {
    id?: string;
    env?: string;
    version?: string;
};

/** UI options passed to `<Report ui={{ appearance, showFeedbackList, visibleShortcutKeys, shortcut }} />`. */
export type ReportUi = {
    appearance?: ReportAppearance;
    showFeedbackList?: boolean;
    visibleShortcutKeys?: boolean;
    shortcut?: string;
};

/** Team scope passed to `<Report team={{ user, reviewers }} />`. */
export type ReportTeam = {
    user?: ReportIdentify;
    reviewers?: ReportAuthor[];
};

/** Visibility and route scope passed to `<Report visibility={{ enabled, devOnly, routeKey }} />`. */
export type ReportVisibility = {
    enabled?: boolean;
    devOnly?: boolean;
    routeKey?: string;
};

export type ReportAuthor = {
    id: string;
    name: string;
};

export type ReportFeedback = {
    id: string;
    pathname: string;
    report_id: string;
    report_type: ReportTargetType;
    message: string;
    status: ReportStatus;
    field_values: ReportFieldValues;
    replies: ReportReply[];
    x_ratio: number;
    y_ratio: number;
    element_x_ratio: number | null;
    element_y_ratio: number | null;
    scroll_y: number;
    document_y: number;
    viewport_width: number;
    viewport_height: number;
    design_width: number;
    design_height: number;
    created_at: string;
    environment?: string;
    app_version?: string;
    author_id?: string;
    author_name?: string;
};

export type CreateReportFeedbackPayload = Omit<ReportFeedback, "id" | "created_at" | "replies"> & {
    replies?: ReportReply[];
};

export type UpdateReportFeedbackPayload = Partial<Pick<ReportFeedback, "message" | "status" | "field_values" | "replies" | "report_id" | "report_type">>;

export interface ReportStorageAdapter {
    list(params: { pathname: string }): Promise<ReportFeedback[]>;
    create(payload: CreateReportFeedbackPayload): Promise<ReportFeedback>;
    update(id: string, payload: UpdateReportFeedbackPayload): Promise<ReportFeedback>;
    remove?(id: string): Promise<void>;
}

/** Custom persistence handlers passed to `<Report />`. Requires onList, onCreate, and onUpdate together. */
export type ReportPersistenceHandlers = {
    onList: (params: { pathname: string }) => Promise<ReportFeedback[]>;
    onCreate: (payload: CreateReportFeedbackPayload) => Promise<ReportFeedback>;
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
      };
