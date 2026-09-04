import type { NotificationItem, NotificationType } from "../../../shared/types/notification.js";
export type NotificationGroupId = "system" | "user_action";
export type NotificationGroup = {
    id: NotificationGroupId;
    items: NotificationItem[];
};
export declare const STATUS_NOTIFICATION_ID_PREFIX = "status:";
export declare function isStatusNotificationId(id: string): boolean;
export declare function getNotificationGroupId(type: NotificationType): NotificationGroupId;
export declare function groupNotifications(items: NotificationItem[]): NotificationGroup[];
export declare function mergeStickyNotifications(current: NotificationItem[], stickyItems: NotificationItem[]): NotificationItem[];
//# sourceMappingURL=notificationGroups.d.ts.map