import type { CSSProperties } from "react";
import type { DockEdge, PinRailPlacement } from "../../types/pinnedFeedback.js";
export type { DockEdge, PinRailPlacement };
/** Shared left/right edge dock helpers (legacy migration + panel collision). */
export type EdgeDockPlacement = {
    edge: DockEdge;
    /** 0 = near top, 1 = near bottom within the usable vertical band. */
    offsetRatio: number;
};
export declare const DEFAULT_EDGE_DOCK_PLACEMENT: EdgeDockPlacement;
/** Default free-floating pin window position. */
export declare const DEFAULT_PIN_RAIL_PLACEMENT: PinRailPlacement;
export declare function clampOffsetRatio(ratio: number, fallback?: number): number;
export declare function isDockEdge(value: unknown): value is DockEdge;
export declare function isEdgeDockPlacement(value: unknown): value is EdgeDockPlacement;
export declare function isFreePinRailPlacement(value: unknown): value is PinRailPlacement;
export declare function sanitizeEdgeDockPlacement(value: unknown, fallback?: EdgeDockPlacement): EdgeDockPlacement;
export declare function edgeTopFromPlacement(placement: EdgeDockPlacement, height: number, viewportHeight?: number): number;
export declare function sanitizePinRailPlacement(value: unknown): PinRailPlacement;
/** Map a pointer to the nearest left/right edge (center drops are forced to an edge). */
export declare function projectPointerToEdgePlacement(clientX: number, clientY: number, options?: {
    height?: number;
    viewportWidth?: number;
    viewportHeight?: number;
    fallback?: EdgeDockPlacement;
}): EdgeDockPlacement;
/** Free-floating pin position from a pointer (centered on the pointer). */
export declare function projectPointerToPinPlacement(clientX: number, clientY: number, options?: {
    width?: number;
    height?: number;
    viewportWidth?: number;
    viewportHeight?: number;
}): PinRailPlacement;
/** Push two same-edge docks apart when their vertical ratios collide. */
export declare function resolvePlacementAwayFromOther(placement: EdgeDockPlacement, other: EdgeDockPlacement | null | undefined, separation?: number): EdgeDockPlacement;
/**
 * Free pin windows no longer snap away from the panel; keep the stored position.
 */
export declare function resolvePinPlacementAwayFromPanel(placement: PinRailPlacement): PinRailPlacement;
type PinStyleOptions = {
    isDragging?: boolean;
    dragLeft?: number | null;
    dragTop?: number | null;
    width: number;
};
export declare function pinPlacementToStyle(placement: PinRailPlacement, options: PinStyleOptions): CSSProperties;
//# sourceMappingURL=edgeDock.d.ts.map