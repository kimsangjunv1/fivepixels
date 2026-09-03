import type { ApiFlowEntry } from "../../../shared/types/networkMonitor.js";
import type { NotificationItem } from "../../../shared/types/notification.js";
import type { ReportFeedback, ReportReply } from "../../../shared/types/report.js";
import type { ReportMessages } from "../../../shared/i18n/types.js";
export type NotificationActor = {
    id: string | null;
    name: string | null;
};
export type FeedbackSnapshot = {
    report: ReportFeedback;
    replies: ReportReply[];
};
export declare function diffNotifications(args: {
    previous: Map<string, FeedbackSnapshot>;
    current: FeedbackSnapshot[];
    actor: NotificationActor;
    messages: ReportMessages;
    apiFailure?: ApiFlowEntry | null;
    previousApiFailureId?: string | null;
}): NotificationItem[];
//# sourceMappingURL=notificationDiff.d.ts.map