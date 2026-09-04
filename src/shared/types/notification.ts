export type NotificationType =
    | "user_mention"
    | "case_assigned"
    | "case_resolved"
    | "feedback_resolved"
    | "case_deleted"
    | "feedback_deleted"
    | "api_error"
    | "element_missing"
    | "modal_marker"
    | "probe_edit";

export type NotificationActionId = "hide_markers" | "show_markers" | "probe_reset" | "probe_undo" | "probe_redo";

export type NotificationPayload = {
    reportId?: string;
    caseId?: string;
    replyId?: string;
    pathname?: string;
    apiFlowEntryId?: string;
    detachedKind?: "hidden" | "modal";
    markersVisible?: boolean;
    canUndo?: boolean;
    canRedo?: boolean;
};

export type NotificationItem = {
    id: string;
    type: NotificationType;
    title: string;
    body: string;
    createdAt: string;
    read: boolean;
    payload: NotificationPayload;
};
