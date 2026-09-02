import {
    MARKER_MINIMIZED_WINDOW_HEIGHT,
    MARKER_WINDOW_MARGIN,
    type MinimizedDockRegion,
} from "@/utils/marker/markerWindowDock.js";

const PANEL_SELECTOR = '[data-fp-chrome="panel"]';

export function measureMinimizedDockRegion(
    viewportWidth: number,
    viewportHeight: number,
    itemHeight = MARKER_MINIMIZED_WINDOW_HEIGHT,
    margin = MARKER_WINDOW_MARGIN,
): MinimizedDockRegion {
    const defaultRegion: MinimizedDockRegion = {
        regionLeft: margin,
        regionWidth: Math.max(0, viewportWidth - margin * 2),
    };

    if (typeof document === "undefined") {
        return defaultRegion;
    }

    const panel = document.querySelector<HTMLElement>(PANEL_SELECTOR);

    if (!panel || panel.getAttribute("data-collapsed") === "true") {
        return defaultRegion;
    }

    const rect = panel.getBoundingClientRect();

    if (rect.width <= 0 || rect.height <= 0) {
        return defaultRegion;
    }

    const dockTop = viewportHeight - margin - itemHeight;

    if (rect.bottom < dockTop - margin) {
        return defaultRegion;
    }

    const anchorSide = panel.getAttribute("data-anchor-side");

    if (anchorSide === "right") {
        return {
            regionLeft: margin,
            regionWidth: Math.max(0, rect.left - margin * 2),
        };
    }

    if (anchorSide === "left") {
        const regionLeft = rect.right + margin;

        return {
            regionLeft,
            regionWidth: Math.max(0, viewportWidth - regionLeft - margin),
        };
    }

    return defaultRegion;
}

export type { MinimizedDockRegion };
