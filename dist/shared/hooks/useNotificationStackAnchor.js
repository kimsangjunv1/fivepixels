import { useLayoutEffect, useState } from "react";
import { getNearestPanelCorner, getStoredPanelCorner } from "../../shared/hooks/usePanelDock.js";
export const PANEL_NOTIFICATION_GAP_PX = 0;
export const NOTIFICATION_STACK_MAX_WIDTH_PX = 360;
const MEASURE_RETRY_LIMIT = 45;
export function resolveNotificationExpandDirection(corner) {
    return corner.startsWith("bottom") ? "up" : "down";
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
export function resolveCornerFromPanelRect(panel) {
    const rect = panel.getBoundingClientRect();
    return getNearestPanelCorner(rect.left + rect.width / 2, rect.top + rect.height / 2);
}
export function buildAnchorFromPanel(panel, corner) {
    const rect = panel.getBoundingClientRect();
    const expandDirection = resolveNotificationExpandDirection(corner);
    const width = Math.min(NOTIFICATION_STACK_MAX_WIDTH_PX, Math.max(rect.width, 280));
    const horizontal = corner.endsWith("right") ? { right: Math.max(0, window.innerWidth - rect.right), left: "auto" } : { left: Math.max(0, rect.left), right: "auto" };
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
function fallbackAnchor(corner, ready) {
    const expandDirection = resolveNotificationExpandDirection(corner);
    const horizontal = corner.endsWith("right") ? { right: 16, left: "auto" } : { left: 16, right: "auto" };
    if (expandDirection === "up") {
        return {
            corner,
            expandDirection,
            ready,
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
        ready,
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
function anchorsEqual(left, right) {
    return (left.ready === right.ready &&
        left.corner === right.corner &&
        left.expandDirection === right.expandDirection &&
        left.style.top === right.style.top &&
        left.style.right === right.style.right &&
        left.style.bottom === right.style.bottom &&
        left.style.left === right.style.left &&
        left.style.width === right.style.width &&
        left.style.maxHeight === right.style.maxHeight);
}
/**
 * Anchors the notification tray to the live panel chrome with an 8px gap,
 * expanding away from the panel based on its docked corner.
 *
 * While the panel is dragged (`data-dragging="true"`), tracks the live rect every frame
 * so the tray follows preview placement instead of waiting for drag end.
 */
export function useNotificationStackAnchor(enabled, stackRef) {
    const [anchor, setAnchor] = useState(() => fallbackAnchor(getStoredPanelCorner(), false));
    useLayoutEffect(() => {
        if (!enabled) {
            setAnchor(fallbackAnchor(getStoredPanelCorner(), false));
            return;
        }
        let frame = 0;
        let dragFrame = 0;
        let attempts = 0;
        let resizeObserver = null;
        let mutationObserver = null;
        let observedPanel = null;
        const stopDragLoop = () => {
            cancelAnimationFrame(dragFrame);
            dragFrame = 0;
        };
        const commitAnchor = (next) => {
            setAnchor((current) => (anchorsEqual(current, next) ? current : next));
        };
        const scheduleMeasure = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                measure();
            });
        };
        let startDragLoop;
        let attachPanelObservers;
        const measure = () => {
            const stackNode = stackRef.current;
            if (!stackNode) {
                if (attempts < MEASURE_RETRY_LIMIT) {
                    attempts += 1;
                    scheduleMeasure();
                }
                return;
            }
            const panel = findHostPanel(stackNode);
            if (!panel) {
                if (attempts < MEASURE_RETRY_LIMIT) {
                    attempts += 1;
                    scheduleMeasure();
                    return;
                }
                commitAnchor(fallbackAnchor(getStoredPanelCorner(), true));
                return;
            }
            attempts = 0;
            attachPanelObservers(panel);
            commitAnchor({ ...buildAnchorFromPanel(panel, resolveCornerFromPanelRect(panel)), ready: true });
        };
        startDragLoop = () => {
            if (dragFrame !== 0) {
                return;
            }
            const tick = () => {
                measure();
                dragFrame = requestAnimationFrame(tick);
            };
            dragFrame = requestAnimationFrame(tick);
        };
        attachPanelObservers = (panel) => {
            if (panel === observedPanel) {
                return;
            }
            resizeObserver?.disconnect();
            mutationObserver?.disconnect();
            stopDragLoop();
            observedPanel = panel;
            if (typeof ResizeObserver !== "undefined") {
                resizeObserver = new ResizeObserver(() => {
                    scheduleMeasure();
                });
                resizeObserver.observe(panel);
            }
            if (typeof MutationObserver !== "undefined") {
                mutationObserver = new MutationObserver(() => {
                    if (panel.getAttribute("data-dragging") === "true") {
                        startDragLoop();
                        return;
                    }
                    stopDragLoop();
                    scheduleMeasure();
                });
                mutationObserver.observe(panel, { attributes: true, attributeFilter: ["data-dragging"] });
            }
            if (panel.getAttribute("data-dragging") === "true") {
                startDragLoop();
            }
        };
        measure();
        const handlePlacement = () => {
            attempts = 0;
            scheduleMeasure();
        };
        window.addEventListener("resize", handlePlacement);
        window.addEventListener("fivepixels:panel-placement", handlePlacement);
        return () => {
            cancelAnimationFrame(frame);
            stopDragLoop();
            resizeObserver?.disconnect();
            mutationObserver?.disconnect();
            window.removeEventListener("resize", handlePlacement);
            window.removeEventListener("fivepixels:panel-placement", handlePlacement);
        };
    }, [enabled, stackRef]);
    return anchor;
}
//# sourceMappingURL=useNotificationStackAnchor.js.map