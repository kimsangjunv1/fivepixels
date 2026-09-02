import { reorderOverlayMinimizedDock } from "../utils/overlay/overlayMinimizedDockRegistry.js";
export type DockMorphRect = {
    left: number;
    top: number;
    width: number;
    height: number;
};
export type DockMorphState = (DockMorphRect & {
    phase: "minimizing" | "restoring";
}) | null;
type UseOverlayMinimizedDockOptions = {
    windowId: string;
    enabled: boolean;
    isMinimized: boolean;
    onMinimizedChange: (minimized: boolean) => void;
};
export declare function useOverlayMinimizedDock({ windowId, enabled, isMinimized, onMinimizedChange }: UseOverlayMinimizedDockOptions): {
    dockMorph: DockMorphState;
    dockPosition: import("../utils/overlay/minimizedDockLayout.js").MinimizedDockPosition;
    dockIndex: number;
    dockCount: number;
    minimizedWidth: number;
    layoutTransition: string | undefined;
    minimizeToDock: (from: DockMorphRect) => void;
    restoreFromDock: (to: DockMorphRect) => void;
    reorderDockItem: typeof reorderOverlayMinimizedDock;
};
export {};
//# sourceMappingURL=useOverlayMinimizedDock.d.ts.map