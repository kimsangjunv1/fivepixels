import { type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import type { DockEdge } from "../types/pinnedFeedback.js";
import { type EdgeDockPlacement } from "../utils/overlay/edgeDock.js";
export type PanelCorner = "top-left" | "top-right" | "bottom-left" | "bottom-right";
export type PanelPlacement = EdgeDockPlacement;
export declare const PANEL_CORNERS: PanelCorner[];
export declare function placementToPanelCorner(placement: PanelPlacement): PanelCorner;
/** Read the persisted panel dock for collision avoidance with other chrome. */
export declare function getStoredPanelPlacement(): PanelPlacement;
/** @deprecated Prefer getStoredPanelPlacement — kept for callers that only need a coarse corner. */
export declare function getStoredPanelCorner(): PanelCorner;
export declare function clampPanelPlacement(placement: PanelPlacement): PanelPlacement;
export declare function projectPointerToPlacement(clientX: number, clientY: number, height?: number): PanelPlacement;
type PanelStyleOptions = {
    collapsed?: boolean;
    isDragging?: boolean;
    dragLeft?: number | null;
    dragTop?: number | null;
    height?: number;
};
export declare function placementToPanelStyle(placement: PanelPlacement, options?: PanelStyleOptions): CSSProperties;
export declare function placementToCollapsedPanelStyle(placement: PanelPlacement): CSSProperties;
export declare function getMobilePanelStyle(): CSSProperties;
export declare function usePanelDock({ enabled, measureKey, collapsed, pinPlacement, onTap, onPlacementSettled, }: {
    enabled: boolean;
    measureKey?: unknown;
    collapsed?: boolean;
    pinPlacement?: EdgeDockPlacement | null;
    onTap?: () => void;
    onPlacementSettled?: (placement: PanelPlacement) => void;
}): {
    panelRef: import("react").RefObject<HTMLDivElement>;
    panelStyle: CSSProperties;
    placement: EdgeDockPlacement;
    placementCorner: PanelCorner;
    placementEdge: DockEdge;
    isDragging: boolean;
    activeCorner: PanelCorner | null;
    activeEdge: DockEdge | null;
    handleDragHandlePointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
    consumeClickSuppressed: () => boolean;
};
export declare function panelHeaderAlignModifier(corner: PanelCorner): "align-left" | "align-right";
export declare function panelAnchorSide(cornerOrEdge: PanelCorner | DockEdge): "left" | "right";
export {};
//# sourceMappingURL=usePanelDock.d.ts.map