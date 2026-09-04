import { describe, expect, it } from "vitest";
import type { NotificationItem } from "@/shared/types/notification.js";
import { getNotificationGroupId, groupNotifications } from "./notificationGroups.js";

function item(partial: Partial<NotificationItem> & Pick<NotificationItem, "id" | "type">): NotificationItem {
    return {
        title: partial.title ?? partial.id,
        body: partial.body ?? "",
        createdAt: partial.createdAt ?? "2026-09-04T00:00:00.000Z",
        read: partial.read ?? false,
        payload: partial.payload ?? {},
        ...partial,
    };
}

describe("notificationGroups", () => {
    it("maps system and user-action types", () => {
        expect(getNotificationGroupId("api_error")).toBe("system");
        expect(getNotificationGroupId("element_missing")).toBe("system");
        expect(getNotificationGroupId("modal_marker")).toBe("system");
        expect(getNotificationGroupId("probe_edit")).toBe("system");
        expect(getNotificationGroupId("user_mention")).toBe("user_action");
        expect(getNotificationGroupId("case_assigned")).toBe("user_action");
    });

    it("groups and sorts notifications with user actions first", () => {
        const grouped = groupNotifications([
            item({ id: "s1", type: "api_error", createdAt: "2026-09-04T01:00:00.000Z" }),
            item({ id: "u1", type: "user_mention", createdAt: "2026-09-04T03:00:00.000Z" }),
            item({ id: "u2", type: "case_assigned", createdAt: "2026-09-04T02:00:00.000Z" }),
            item({ id: "s2", type: "element_missing", createdAt: "2026-09-04T04:00:00.000Z" }),
        ]);

        expect(grouped.map((group) => group.id)).toEqual(["user_action", "system"]);
        expect(grouped[0]?.items.map((entry) => entry.id)).toEqual(["u1", "u2"]);
        expect(grouped[1]?.items.map((entry) => entry.id)).toEqual(["s2", "s1"]);
    });
});
