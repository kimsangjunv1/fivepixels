import type { ReportMessages } from "../../../shared/i18n/types.js";
import type { NotificationItem } from "../../../shared/types/notification.js";
export declare const HIDDEN_MARKER_NOTIFICATION_ID = "status:element_missing:hidden";
export declare const MODAL_MARKER_NOTIFICATION_ID = "status:modal_marker";
export declare const PROBE_EDIT_NOTIFICATION_ID = "status:probe_edit";
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
export declare function buildStatusNotifications(input: StatusNotificationInput): NotificationItem[];
//# sourceMappingURL=buildStatusNotifications.d.ts.map