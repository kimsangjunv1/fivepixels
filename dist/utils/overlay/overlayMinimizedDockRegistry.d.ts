type DockListener = () => void;
export declare const MARKER_DOCK_WINDOW_ID_PREFIX = "marker:";
export declare function getMarkerDockWindowId(reportId: string): string;
export declare function parseMarkerDockWindowId(windowId: string): string | null;
export declare function getOverlayMinimizedDockOrder(): readonly string[];
export declare function subscribeOverlayMinimizedDock(listener: DockListener): () => void;
export declare function isOverlayMinimizedDocked(windowId: string): boolean;
export declare function registerOverlayMinimizedDock(windowId: string): readonly string[];
export declare function unregisterOverlayMinimizedDock(windowId: string): readonly string[];
export declare function reorderOverlayMinimizedDock(fromIndex: number, toIndex: number): readonly string[];
/** Test helper */
export declare function resetOverlayMinimizedDockRegistryForTests(): void;
export {};
//# sourceMappingURL=overlayMinimizedDockRegistry.d.ts.map