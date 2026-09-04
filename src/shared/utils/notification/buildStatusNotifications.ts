import type { ReportMessages } from "@/shared/i18n/types.js";
import type { NotificationItem } from "@/shared/types/notification.js";
import { STATUS_NOTIFICATION_ID_PREFIX } from "./notificationGroups.js";

export const HIDDEN_MARKER_NOTIFICATION_ID = `${STATUS_NOTIFICATION_ID_PREFIX}element_missing:hidden`;
export const MODAL_MARKER_NOTIFICATION_ID = `${STATUS_NOTIFICATION_ID_PREFIX}modal_marker`;
export const PROBE_EDIT_NOTIFICATION_ID = `${STATUS_NOTIFICATION_ID_PREFIX}probe_edit`;

export type StatusNotificationInput = {
    messages: ReportMessages;
    hasHiddenMarker: boolean;
    hasModalMarker: boolean;
    hasProbeEdit: boolean;
    showHiddenDetachedMarkers: boolean;
    showModalDetachedMarkers: boolean;
    canUndoProbeSession: boolean;
    canRedoProbeSession: boolean;
};

export function buildStatusNotifications(input: StatusNotificationInput): NotificationItem[] {
    const {
        messages,
        hasHiddenMarker,
        hasModalMarker,
        hasProbeEdit,
        showHiddenDetachedMarkers,
        showModalDetachedMarkers,
        canUndoProbeSession,
        canRedoProbeSession,
    } = input;
    const now = new Date().toISOString();
    const items: NotificationItem[] = [];

    if (hasProbeEdit) {
        items.push({
            id: PROBE_EDIT_NOTIFICATION_ID,
            type: "probe_edit",
            title: messages.notifications.probeEditTitle,
            body: messages.notifications.probeEditBody,
            createdAt: now,
            read: false,
            payload: {
                canUndo: canUndoProbeSession,
                canRedo: canRedoProbeSession,
            },
        });
    }

    if (hasHiddenMarker) {
        items.push({
            id: HIDDEN_MARKER_NOTIFICATION_ID,
            type: "element_missing",
            title: messages.notifications.elementMissingTitle,
            body: messages.notifications.elementMissingBody,
            createdAt: now,
            read: false,
            payload: {
                detachedKind: "hidden",
                markersVisible: showHiddenDetachedMarkers,
            },
        });
    }

    if (hasModalMarker) {
        items.push({
            id: MODAL_MARKER_NOTIFICATION_ID,
            type: "modal_marker",
            title: messages.notifications.modalMarkerTitle,
            body: messages.notifications.modalMarkerBody,
            createdAt: now,
            read: false,
            payload: {
                detachedKind: "modal",
                markersVisible: showModalDetachedMarkers,
            },
        });
    }

    return items;
}
