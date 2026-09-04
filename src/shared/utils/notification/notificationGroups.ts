import type { NotificationItem, NotificationType } from "@/shared/types/notification.js";

export type NotificationGroupId = "system" | "user_action";

export type NotificationGroup = {
    id: NotificationGroupId;
    items: NotificationItem[];
};

const SYSTEM_NOTIFICATION_TYPES = new Set<NotificationType>(["api_error", "element_missing", "modal_marker", "probe_edit"]);

export const STATUS_NOTIFICATION_ID_PREFIX = "status:";

export function isStatusNotificationId(id: string) {
    return id.startsWith(STATUS_NOTIFICATION_ID_PREFIX);
}

export function getNotificationGroupId(type: NotificationType): NotificationGroupId {
    return SYSTEM_NOTIFICATION_TYPES.has(type) ? "system" : "user_action";
}

function sortByNewest(items: NotificationItem[]) {
    return [...items].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

export function groupNotifications(items: NotificationItem[]): NotificationGroup[] {
    const buckets: Record<NotificationGroupId, NotificationItem[]> = {
        system: [],
        user_action: [],
    };

    for (const item of items) {
        buckets[getNotificationGroupId(item.type)].push(item);
    }

    const order: NotificationGroupId[] = ["user_action", "system"];

    return order
        .map((id) => ({
            id,
            items: sortByNewest(buckets[id]),
        }))
        .filter((group) => group.items.length > 0);
}

export function mergeStickyNotifications(current: NotificationItem[], stickyItems: NotificationItem[]) {
    const nonSticky = current.filter((item) => !isStatusNotificationId(item.id));
    const previousById = new Map(current.map((item) => [item.id, item]));

    const nextSticky = stickyItems.map((item) => {
        const previous = previousById.get(item.id);

        if (!previous) {
            return item;
        }

        return {
            ...item,
            createdAt: previous.createdAt,
            read: previous.read,
        };
    });

    return [...nextSticky, ...nonSticky].slice(0, 100);
}
