export declare const MARKER_MINIMIZED_WINDOW_WIDTH = 256;
export declare const MARKER_MINIMIZED_WINDOW_HEIGHT = 56;
export declare const MARKER_WINDOW_MARGIN = 16;
export declare const MARKER_MINIMIZED_DOCK_GAP = 8;
export type MarkerWindowDockPosition = {
    left: number;
    top: number;
};
/**
 * Lay out minimized marker windows in a horizontal strip centered on the viewport,
 * filling left → right in minimize order.
 */
export declare function resolveMinimizedDockPosition(index: number, count: number, viewportWidth: number, viewportHeight: number, itemWidth?: number, itemHeight?: number, gap?: number, margin?: number): MarkerWindowDockPosition;
//# sourceMappingURL=markerWindowDock.d.ts.map