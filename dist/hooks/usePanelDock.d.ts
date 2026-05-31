import { type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
export type PanelCorner = "top-left" | "top-right" | "bottom-left" | "bottom-right";
/** @deprecated Edge docking replaced by corner placement; kept for storage migration. */
export type PanelEdge = "top" | "bottom" | "left" | "right";
export type PanelPlacement = {
    corner: PanelCorner;
};
declare const PANEL_CORNERS: PanelCorner[];
export declare function getNearestPanelCorner(clientX: number, clientY: number): PanelCorner;
export declare function clampPanelPlacement(placement: PanelPlacement): PanelPlacement;
export declare function projectPointerToPlacement(clientX: number, clientY: number): PanelPlacement;
export declare function placementToPanelStyle(placement: PanelPlacement): CSSProperties;
export declare function getMobilePanelStyle(): CSSProperties;
export declare function usePanelDock({ enabled, measureKey }: {
    enabled: boolean;
    measureKey?: unknown;
}): {
    panelRef: import("react").RefObject<HTMLDivElement>;
    panelStyle: CSSProperties;
    isDragging: boolean;
    activeCorner: PanelCorner | null;
    handleDragHandlePointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
};
export { PANEL_CORNERS };
//# sourceMappingURL=usePanelDock.d.ts.map