import { useLayoutEffect, useState } from "react";
import { getStoredPanelCorner } from "../../shared/hooks/usePanelDock.js";
export const PANEL_NOTIFICATION_GAP_PX = 8;
export const NOTIFICATION_STACK_MAX_WIDTH_PX = 360;
export function resolveNotificationExpandDirection(corner) {
    return corner.startsWith("bottom") ? "up" : "down";
}
function resolveExpandDirection(corner) {
    return resolveNotificationExpandDirection(corner);
}
function findHostPanel(stackNode) {
    if (!stackNode) {
        return null;
    }
    const root = stackNode.getRootNode();
    if (root instanceof ShadowRoot || root instanceof Document) {
        const panel = root.querySelector('[data-fp-chrome="panel"]:not([data-embedded])');
        if (panel) {
            return panel;
        }
    }
    return document.querySelector('[data-fp-chrome="panel"]:not([data-embedded])');
}
function buildAnchorFromPanel(panel, corner) {
    const rect = panel.getBoundingClientRect();
    const expandDirection = resolveExpandDirection(corner);
    const width = Math.min(NOTIFICATION_STACK_MAX_WIDTH_PX, Math.max(rect.width, 280));
    const horizontal = corner.endsWith("right")
        ? { right: Math.max(0, window.innerWidth - rect.right), left: "auto" }
        : { left: Math.max(0, rect.left), right: "auto" };
    if (expandDirection === "up") {
        const bottom = Math.max(0, window.innerHeight - rect.top + PANEL_NOTIFICATION_GAP_PX);
        const maxHeight = Math.max(120, rect.top - PANEL_NOTIFICATION_GAP_PX - 12);
        return {
            corner,
            expandDirection,
            transformOrigin: "bottom center",
            style: {
                ...horizontal,
                top: "auto",
                bottom,
                width,
                maxHeight,
            },
        };
    }
    const top = Math.max(0, rect.bottom + PANEL_NOTIFICATION_GAP_PX);
    const maxHeight = Math.max(120, window.innerHeight - top - 12);
    return {
        corner,
        expandDirection,
        transformOrigin: "top center",
        style: {
            ...horizontal,
            top,
            bottom: "auto",
            width,
            maxHeight,
        },
    };
}
function fallbackAnchor(corner) {
    const expandDirection = resolveExpandDirection(corner);
    const horizontal = corner.endsWith("right") ? { right: 16, left: "auto" } : { left: 16, right: "auto" };
    if (expandDirection === "up") {
        return {
            corner,
            expandDirection,
            transformOrigin: "bottom center",
            style: {
                ...horizontal,
                top: "auto",
                bottom: 16 + PANEL_NOTIFICATION_GAP_PX,
                width: NOTIFICATION_STACK_MAX_WIDTH_PX,
                maxHeight: "min(72dvh, 720px)",
            },
        };
    }
    return {
        corner,
        expandDirection,
        transformOrigin: "top center",
        style: {
            ...horizontal,
            top: 16 + PANEL_NOTIFICATION_GAP_PX,
            bottom: "auto",
            width: NOTIFICATION_STACK_MAX_WIDTH_PX,
            maxHeight: "min(72dvh, 720px)",
        },
    };
}
/**
 * Anchors the notification tray to the live panel chrome with an 8px gap,
 * expanding away from the panel based on its docked corner.
 */
export function useNotificationStackAnchor(enabled, stackRef) {
    const [anchor, setAnchor] = useState(() => fallbackAnchor(getStoredPanelCorner()));
    useLayoutEffect(() => {
        if (!enabled) {
            return;
        }
        let frame = 0;
        let resizeObserver = null;
        let observedPanel = null;
        const measure = () => {
            const corner = getStoredPanelCorner();
            const panel = findHostPanel(stackRef.current);
            if (panel !== observedPanel) {
                resizeObserver?.disconnect();
                observedPanel = panel;
                if (panel && typeof ResizeObserver !== "undefined") {
                    resizeObserver = new ResizeObserver(() => {
                        cancelAnimationFrame(frame);
                        frame = requestAnimationFrame(measure);
                    });
                    resizeObserver.observe(panel);
                }
            }
            setAnchor(panel ? buildAnchorFromPanel(panel, corner) : fallbackAnchor(corner));
        };
        measure();
        const handlePlacement = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(measure);
        };
        window.addEventListener("resize", handlePlacement);
        window.addEventListener("fivepixels:panel-placement", handlePlacement);
        return () => {
            cancelAnimationFrame(frame);
            resizeObserver?.disconnect();
            window.removeEventListener("resize", handlePlacement);
            window.removeEventListener("fivepixels:panel-placement", handlePlacement);
        };
    }, [enabled, stackRef]);
    return anchor;
}
//# sourceMappingURL=useNotificationStackAnchor.js.map