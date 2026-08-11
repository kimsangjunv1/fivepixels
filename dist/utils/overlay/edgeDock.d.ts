import type { CSSProperties } from "react";
import type { DockEdge, PinRailPlacement } from "../../types/pinnedFeedback.js";
export type { DockEdge, PinRailPlacement };
/** Shared left/right edge dock used by both panel and pin rail. */
export type EdgeDockPlacement = {
    edge: DockEdge;
    /** 0 = near top, 1 = near bottom within the usable vertical band. */
    offsetRatio: number;
};
export declare const DEFAULT_PIN_RAIL_PLACEMENT: EdgeDockPlacement;
export declare const DEFAULT_PANEL_EDGE_PLACEMENT: EdgeDockPlacement;
export declare function clampOffsetRatio(ratio: number, fallback?: number): number;
export declare function isDockEdge(value: unknown): value is DockEdge;
export declare function isEdgeDockPlacement(value: unknown): value is EdgeDockPlacement;
export declare function sanitizeEdgeDockPlacement(value: unknown, fallback?: EdgeDockPlacement): EdgeDockPlacement;
export declare function sanitizePinRailPlacement(value: unknown): PinRailPlacement;
/** Map a pointer to the nearest left/right edge (center drops are forced to an edge). */
export declare function projectPointerToEdgePlacement(clientX: number, clientY: number, options?: {
    height?: number;
    viewportWidth?: number;
    viewportHeight?: number;
    fallback?: EdgeDockPlacement;
}): EdgeDockPlacement;
export declare function projectPointerToPinPlacement(clientX: number, clientY: number, options?: {
    height?: number;
    viewportWidth?: number;
    viewportHeight?: number;
}): PinRailPlacement;
export declare function edgeTopFromPlacement(placement: EdgeDockPlacement, height: number, viewportHeight?: number): number;
export declare function pinTopFromPlacement(placement: PinRailPlacement, height: number, viewportHeight?: number): number;
/** Push two same-edge docks apart when their vertical ratios collide. */
export declare function resolvePlacementAwayFromOther(placement: EdgeDockPlacement, other: EdgeDockPlacement | null | undefined, separation?: number): EdgeDockPlacement;
/**
 * Keep the pin bubble clear of the panel on the same edge.
 */
export declare function resolvePinPlacementAwayFromPanel(placement: PinRailPlacement, panelPlacement: EdgeDockPlacement | null | undefined): PinRailPlacement;
export declare function resolvePanelPlacementAwayFromPin(placement: EdgeDockPlacement, pinPlacement: EdgeDockPlacement | null | undefined): EdgeDockPlacement;
type PinStyleOptions = {
    collapsed: boolean;
    peeking: boolean;
    isDragging: boolean;
    dragLeft?: number | null;
    dragTop?: number | null;
    width: number;
    height: number;
};
export declare function pinPlacementToStyle(placement: PinRailPlacement, options: PinStyleOptions): CSSProperties;
//# sourceMappingURL=edgeDock.d.ts.map