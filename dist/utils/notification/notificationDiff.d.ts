import type { ApiFlowEntry } from "../../types/networkMonitor.js";
import type { NotificationItem } from "../../types/notification.js";
import type { ReportFeedback, ReportReply } from "../../types/report.js";
import type { ReportMessages } from "../../i18n/types.js";
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