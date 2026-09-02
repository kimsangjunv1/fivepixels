export { MARKER_MINIMIZED_DOCK_GAP as MINIMIZED_DOCK_GAP, MARKER_MINIMIZED_WINDOW_HEIGHT as MINIMIZED_WINDOW_HEIGHT, MARKER_MINIMIZED_WINDOW_WIDTH as MINIMIZED_WINDOW_WIDTH, MARKER_WINDOW_MARGIN as MINIMIZED_WINDOW_MARGIN, moveMinimizedDockItem, resolveMinimizedDockIndexFromPointer, resolveMinimizedDockPosition, type MarkerWindowDockPosition as MinimizedDockPosition, } from "../../utils/marker/markerWindowDock.js";
export declare const MINIMIZE_MORPH_MS = 420;
export declare const MINIMIZE_MORPH_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
export declare const MINIMIZE_MORPH_TRANSITION = "left 420ms cubic-bezier(0.22, 1, 0.36, 1), top 420ms cubic-bezier(0.22, 1, 0.36, 1), width 420ms cubic-bezier(0.22, 1, 0.36, 1), height 420ms cubic-bezier(0.22, 1, 0.36, 1)";
export declare const MINIMIZED_DOCK_SLIDE_TRANSITION = "left 420ms cubic-bezier(0.22, 1, 0.36, 1), top 420ms cubic-bezier(0.22, 1, 0.36, 1)";
export declare function prefersReducedMotion(): boolean;
//# sourceMappingURL=minimizedDockLayout.d.ts.map