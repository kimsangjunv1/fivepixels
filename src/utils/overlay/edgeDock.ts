import type { CSSProperties } from "react";
import type { DockEdge, PinRailPlacement } from "@/types/pinnedFeedback.js";
import { OVERLAY_EDGE_MARGIN, PIN_PEEK_HIDDEN_RATIO, PIN_RAIL_BUBBLE_SIZE } from "@/constants/overlayChrome.js";

export type { DockEdge, PinRailPlacement };

/** Shared left/right edge dock used by both panel and pin rail. */
export type EdgeDockPlacement = {
    edge: DockEdge;
    /** 0 = near top, 1 = near bottom within the usable vertical band. */
    offsetRatio: number;
};

export const DEFAULT_PIN_RAIL_PLACEMENT: EdgeDockPlacement = {
    edge: "right",
    offsetRatio: 0.2,
};

export const DEFAULT_PANEL_EDGE_PLACEMENT: EdgeDockPlacement = {
    edge: "left",
    offsetRatio: 0,
};

const MIN_SAME_EDGE_SEPARATION = 0.22;

export function clampOffsetRatio(ratio: number, fallback = DEFAULT_PIN_RAIL_PLACEMENT.offsetRatio): number {
    if (!Number.isFinite(ratio)) {
        return fallback;
    }

    return Math.min(1, Math.max(0, ratio));
}

export function isDockEdge(value: unknown): value is DockEdge {
    return value === "left" || value === "right";
}

export function isEdgeDockPlacement(value: unknown): value is EdgeDockPlacement {
    if (!value || typeof value !== "object") {
        return false;
    }

    const placement = value as Partial<EdgeDockPlacement>;

    return isDockEdge(placement.edge) && typeof placement.offsetRatio === "number" && Number.isFinite(placement.offsetRatio);
}

export function sanitizeEdgeDockPlacement(value: unknown, fallback: EdgeDockPlacement = DEFAULT_PIN_RAIL_PLACEMENT): EdgeDockPlacement {
    if (!isEdgeDockPlacement(value)) {
        return { ...fallback };
    }

    return {
        edge: value.edge,
        offsetRatio: clampOffsetRatio(value.offsetRatio, fallback.offsetRatio),
    };
}

export function sanitizePinRailPlacement(value: unknown): PinRailPlacement {
    return sanitizeEdgeDockPlacement(value, DEFAULT_PIN_RAIL_PLACEMENT);
}

/** Map a pointer to the nearest left/right edge (center drops are forced to an edge). */
export function projectPointerToEdgePlacement(
    clientX: number,
    clientY: number,
    options?: { height?: number; viewportWidth?: number; viewportHeight?: number; fallback?: EdgeDockPlacement },
): EdgeDockPlacement {
    const fallback = options?.fallback ?? DEFAULT_PIN_RAIL_PLACEMENT;
    const viewportWidth = options?.viewportWidth ?? (typeof window !== "undefined" ? window.innerWidth : 1280);
    const viewportHeight = options?.viewportHeight ?? (typeof window !== "undefined" ? window.innerHeight : 720);
    const height = Math.max(1, options?.height ?? PIN_RAIL_BUBBLE_SIZE);
    const edge: DockEdge = clientX < viewportWidth / 2 ? "left" : "right";
    const usable = Math.max(1, viewportHeight - OVERLAY_EDGE_MARGIN * 2 - height);
    const top = Math.min(Math.max(clientY - height / 2, OVERLAY_EDGE_MARGIN), OVERLAY_EDGE_MARGIN + usable);

    return {
        edge,
        offsetRatio: clampOffsetRatio((top - OVERLAY_EDGE_MARGIN) / usable, fallback.offsetRatio),
    };
}

export function projectPointerToPinPlacement(
    clientX: number,
    clientY: number,
    options?: { height?: number; viewportWidth?: number; viewportHeight?: number },
): PinRailPlacement {
    return projectPointerToEdgePlacement(clientX, clientY, options);
}

export function edgeTopFromPlacement(placement: EdgeDockPlacement, height: number, viewportHeight?: number): number {
    const vh = viewportHeight ?? (typeof window !== "undefined" ? window.innerHeight : 720);
    const usable = Math.max(0, vh - OVERLAY_EDGE_MARGIN * 2 - height);

    return OVERLAY_EDGE_MARGIN + usable * clampOffsetRatio(placement.offsetRatio);
}

export function pinTopFromPlacement(placement: PinRailPlacement, height: number, viewportHeight?: number): number {
    return edgeTopFromPlacement(placement, height, viewportHeight);
}

/** Push two same-edge docks apart when their vertical ratios collide. */
export function resolvePlacementAwayFromOther(
    placement: EdgeDockPlacement,
    other: EdgeDockPlacement | null | undefined,
    separation = MIN_SAME_EDGE_SEPARATION,
): EdgeDockPlacement {
    const self = sanitizeEdgeDockPlacement(placement);

    if (!other || other.edge !== self.edge) {
        return self;
    }

    const otherRatio = clampOffsetRatio(other.offsetRatio);
    let offsetRatio = clampOffsetRatio(self.offsetRatio);

    if (Math.abs(offsetRatio - otherRatio) >= separation) {
        return self;
    }

    if (offsetRatio <= otherRatio) {
        offsetRatio = Math.max(0, otherRatio - separation);
        if (Math.abs(offsetRatio - otherRatio) < separation) {
            offsetRatio = Math.min(1, otherRatio + separation);
        }
    } else {
        offsetRatio = Math.min(1, otherRatio + separation);
        if (Math.abs(offsetRatio - otherRatio) < separation) {
            offsetRatio = Math.max(0, otherRatio - separation);
        }
    }

    return { edge: self.edge, offsetRatio };
}

/**
 * Keep the pin bubble clear of the panel on the same edge.
 */
export function resolvePinPlacementAwayFromPanel(
    placement: PinRailPlacement,
    panelPlacement: EdgeDockPlacement | null | undefined,
): PinRailPlacement {
    return resolvePlacementAwayFromOther(placement, panelPlacement);
}

export function resolvePanelPlacementAwayFromPin(
    placement: EdgeDockPlacement,
    pinPlacement: EdgeDockPlacement | null | undefined,
): EdgeDockPlacement {
    return resolvePlacementAwayFromOther(placement, pinPlacement);
}

type PinStyleOptions = {
    collapsed: boolean;
    peeking: boolean;
    isDragging: boolean;
    dragLeft?: number | null;
    dragTop?: number | null;
    width: number;
    height: number;
};

export function pinPlacementToStyle(placement: PinRailPlacement, options: PinStyleOptions): CSSProperties {
    const { collapsed, peeking, isDragging, dragLeft, dragTop, width, height } = options;

    if (isDragging && typeof dragLeft === "number" && typeof dragTop === "number") {
        return {
            position: "fixed",
            top: dragTop,
            left: dragLeft,
            right: "auto",
            bottom: "auto",
            width,
        };
    }

    const top = pinTopFromPlacement(placement, height);
    const peekOffset = collapsed && peeking ? Math.round(PIN_RAIL_BUBBLE_SIZE * PIN_PEEK_HIDDEN_RATIO) : 0;
    const style: CSSProperties = {
        position: "fixed",
        top,
        bottom: "auto",
        width,
    };

    if (placement.edge === "left") {
        style.left = peekOffset ? -peekOffset : OVERLAY_EDGE_MARGIN;
        style.right = "auto";
    } else {
        style.right = peekOffset ? -peekOffset : OVERLAY_EDGE_MARGIN;
        style.left = "auto";
    }

    return style;
}
