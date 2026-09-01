import type { ApiFlowEntry } from "../../types/networkMonitor.js";
import type { NotificationItem } from "../../types/notification.js";
import type { ReportFeedback, ReportReply } from "../../types/report.js";
import type { ReportMessages } from "../../i18n/types.js";
import { type NotificationActor } from "../../utils/notification/notificationDiff.js";
type UseNotificationCenterParams = {
    projectId?: string;
    messages: ReportMessages;
    sessionActor: NotificationActor | null;
    reports: ReportFeedback[];
    allPageReports: ReportFeedback[];
    getRepliesForReport?: (reportId: string) => ReportReply[];
    activeApiFailureAlert: ApiFlowEntry | null;
};
export declare function useNotificationCenter({ projectId, messages, sessionActor, reports, allPageReports, getRepliesForReport, activeApiFailureAlert, }: UseNotificationCenterParams): {
    notifications: NotificationItem[];
    unreadNotificationCount: number;
    notificationUiOpen: boolean;
    setNotificationUiOpen: import("react").Dispatch<import("react").SetStateAction<boolean>>;
    toggleNotificationUiOpen: () => void;
    closeNotificationUi: () => void;
    markNotificationRead: (id: string) => void;
    markAllNotificationsRead: () => void;
    dismissNotification: (id: string) => void;
    clearNotifications: () => void;
};
export {};
//# sourceMappingURL=useNotificationCenter.d.ts.map