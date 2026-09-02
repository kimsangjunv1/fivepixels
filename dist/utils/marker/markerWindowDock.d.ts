export declare const MARKER_MINIMIZED_WINDOW_WIDTH = 256;
export declare const MARKER_MINIMIZED_WINDOW_HEIGHT = 56;
export declare const MARKER_WINDOW_MARGIN = 16;
export declare const MARKER_MINIMIZED_DOCK_GAP = 8;
export type MarkerWindowDockPosition = {
    left: number;
    top: number;
};
export type MinimizedDockRegion = {
    regionLeft: number;
    regionWidth: number;
};
/**
 * Lay out minimized marker windows in a horizontal strip centered in the available region,
 * filling left → right in minimize order.
 */
export declare function resolveMinimizedDockPosition(index: number, count: number, viewportWidth: number, viewportHeight: number, itemWidth?: number, itemHeight?: number, gap?: number, margin?: number, region?: MinimizedDockRegion): MarkerWindowDockPosition;
/** Resolve the dock slot index under a horizontal center point (Mac Dock–style). */
export declare function resolveMinimizedDockIndexFromPointer(centerX: number, count: number, viewportWidth: number, itemWidth?: number, gap?: number, margin?: number, region?: MinimizedDockRegion): number;
export declare function moveMinimizedDockItem<T>(items: readonly T[], fromIndex: number, toIndex: number): T[];
//# sourceMappingURL=markerWindowDock.d.ts.map