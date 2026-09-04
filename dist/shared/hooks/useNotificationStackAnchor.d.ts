import { type CSSProperties, type RefObject } from "react";
import { type PanelCorner } from "../../shared/hooks/usePanelDock.js";
export declare const PANEL_NOTIFICATION_GAP_PX = 0;
export declare const NOTIFICATION_STACK_MAX_WIDTH_PX = 360;
export type NotificationStackExpandDirection = "up" | "down";
export type NotificationStackAnchor = {
    corner: PanelCorner;
    expandDirection: NotificationStackExpandDirection;
    style: CSSProperties;
    transformOrigin: string;
    /** True only after a live panel rect was measured (or retries exhausted). */
    ready: boolean;
};
export declare function resolveNotificationExpandDirection(corner: PanelCorner): NotificationStackExpandDirection;
export declare function resolveCornerFromPanelRect(panel: HTMLElement): PanelCorner;
export declare function buildAnchorFromPanel(panel: HTMLElement, corner: PanelCorner): Omit<NotificationStackAnchor, "ready">;
/**
 * Anchors the notification tray to the live panel chrome with an 8px gap,
 * expanding away from the panel based on its docked corner.
 *
 * While the panel is dragged (`data-dragging="true"`), tracks the live rect every frame
 * so the tray follows preview placement instead of waiting for drag end.
 */
export declare function useNotificationStackAnchor(enabled: boolean, stackRef: RefObject<HTMLElement | null>): NotificationStackAnchor;
//# sourceMappingURL=useNotificationStackAnchor.d.ts.map