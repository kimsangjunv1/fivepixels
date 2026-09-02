export {
    MARKER_MINIMIZED_DOCK_GAP as MINIMIZED_DOCK_GAP,
    MARKER_MINIMIZED_WINDOW_HEIGHT as MINIMIZED_WINDOW_HEIGHT,
    MARKER_MINIMIZED_WINDOW_WIDTH as MINIMIZED_WINDOW_WIDTH,
    MARKER_WINDOW_MARGIN as MINIMIZED_WINDOW_MARGIN,
    moveMinimizedDockItem,
    resolveMinimizedDockIndexFromPointer,
    resolveMinimizedDockPosition,
    type MarkerWindowDockPosition as MinimizedDockPosition,
} from "@/utils/marker/markerWindowDock.js";

export const MINIMIZE_MORPH_MS = 420;
export const MINIMIZE_MORPH_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
export const MINIMIZE_MORPH_TRANSITION = `left ${MINIMIZE_MORPH_MS}ms ${MINIMIZE_MORPH_EASE}, top ${MINIMIZE_MORPH_MS}ms ${MINIMIZE_MORPH_EASE}, width ${MINIMIZE_MORPH_MS}ms ${MINIMIZE_MORPH_EASE}, height ${MINIMIZE_MORPH_MS}ms ${MINIMIZE_MORPH_EASE}`;
export const MINIMIZED_DOCK_SLIDE_TRANSITION = `left ${MINIMIZE_MORPH_MS}ms ${MINIMIZE_MORPH_EASE}, top ${MINIMIZE_MORPH_MS}ms ${MINIMIZE_MORPH_EASE}`;

export function prefersReducedMotion() {
    return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
