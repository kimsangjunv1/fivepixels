export type NotificationType = "user_mention" | "case_assigned" | "case_resolved" | "feedback_resolved" | "case_deleted" | "feedback_deleted" | "api_error";
export type NotificationPayload = {
    reportId?: string;
    caseId?: string;
    replyId?: string;
    pathname?: string;
    apiFlowEntryId?: string;
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
//# sourceMappingURL=notification.d.ts.map