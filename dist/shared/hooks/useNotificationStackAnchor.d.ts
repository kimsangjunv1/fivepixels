import { type CSSProperties, type RefObject } from "react";
import { type PanelCorner } from "../../shared/hooks/usePanelDock.js";
export declare const PANEL_NOTIFICATION_GAP_PX = 8;
export declare const NOTIFICATION_STACK_MAX_WIDTH_PX = 360;
export type NotificationStackExpandDirection = "up" | "down";
export type NotificationStackAnchor = {
    corner: PanelCorner;
    expandDirection: NotificationStackExpandDirection;
    style: CSSProperties;
    transformOrigin: string;
};
export declare function resolveNotificationExpandDirection(corner: PanelCorner): NotificationStackExpandDirection;
/**
 * Anchors the notification tray to the live panel chrome with an 8px gap,
 * expanding away from the panel based on its docked corner.
 */
export declare function useNotificationStackAnchor(enabled: boolean, stackRef: RefObject<HTMLElement | null>): NotificationStackAnchor;
//# sourceMappingURL=useNotificationStackAnchor.d.ts.map