import { OVERLAY_EDGE_MARGIN, PIN_RAIL_BUBBLE_SIZE, PIN_RAIL_EXPANDED_WIDTH } from "../../constants/overlayChrome.js";
export const DEFAULT_EDGE_DOCK_PLACEMENT = {
    edge: "right",
    offsetRatio: 0.2,
};
/** Default free-floating pin window position. */
export const DEFAULT_PIN_RAIL_PLACEMENT = {
    left: OVERLAY_EDGE_MARGIN,
    top: OVERLAY_EDGE_MARGIN,
};
const MIN_SAME_EDGE_SEPARATION = 0.22;
export function clampOffsetRatio(ratio, fallback = DEFAULT_EDGE_DOCK_PLACEMENT.offsetRatio) {
    if (!Number.isFinite(ratio)) {
        return fallback;
    }
    return Math.min(1, Math.max(0, ratio));
}
export function isDockEdge(value) {
    return value === "left" || value === "right";
}
export function isEdgeDockPlacement(value) {
    if (!value || typeof value !== "object") {
        return false;
    }
    const placement = value;
    return isDockEdge(placement.edge) && typeof placement.offsetRatio === "number" && Number.isFinite(placement.offsetRatio);
}
export function isFreePinRailPlacement(value) {
    if (!value || typeof value !== "object") {
        return false;
    }
    const placement = value;
    return typeof placement.left === "number" && Number.isFinite(placement.left) && typeof placement.top === "number" && Number.isFinite(placement.top);
}
export function sanitizeEdgeDockPlacement(value, fallback = DEFAULT_EDGE_DOCK_PLACEMENT) {
    if (!isEdgeDockPlacement(value)) {
        return { ...fallback };
    }
    return {
        edge: value.edge,
        offsetRatio: clampOffsetRatio(value.offsetRatio, fallback.offsetRatio),
    };
}
export function edgeTopFromPlacement(placement, height, viewportHeight) {
    const vh = viewportHeight ?? (typeof window !== "undefined" ? window.innerHeight : 720);
    const usable = Math.max(0, vh - OVERLAY_EDGE_MARGIN * 2 - height);
    return OVERLAY_EDGE_MARGIN + usable * clampOffsetRatio(placement.offsetRatio);
}
function edgePlacementToFreePosition(placement) {
    const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1280;
    const top = edgeTopFromPlacement(placement, PIN_RAIL_BUBBLE_SIZE);
    const left = placement.edge === "left" ? OVERLAY_EDGE_MARGIN : Math.max(OVERLAY_EDGE_MARGIN, viewportWidth - PIN_RAIL_EXPANDED_WIDTH - OVERLAY_EDGE_MARGIN);
    return { left, top };
}
export function sanitizePinRailPlacement(value) {
    if (isFreePinRailPlacement(value)) {
        return {
            left: value.left,
            top: Math.max(0, value.top),
        };
    }
    if (isEdgeDockPlacement(value)) {
        return edgePlacementToFreePosition(sanitizeEdgeDockPlacement(value));
    }
    return { ...DEFAULT_PIN_RAIL_PLACEMENT };
}
/** Map a pointer to the nearest left/right edge (center drops are forced to an edge). */
export function projectPointerToEdgePlacement(clientX, clientY, options) {
    const fallback = options?.fallback ?? DEFAULT_EDGE_DOCK_PLACEMENT;
    const viewportWidth = options?.viewportWidth ?? (typeof window !== "undefined" ? window.innerWidth : 1280);
    const viewportHeight = options?.viewportHeight ?? (typeof window !== "undefined" ? window.innerHeight : 720);
    const height = Math.max(1, options?.height ?? PIN_RAIL_BUBBLE_SIZE);
    const edge = clientX < viewportWidth / 2 ? "left" : "right";
    const usable = Math.max(1, viewportHeight - OVERLAY_EDGE_MARGIN * 2 - height);
    const top = Math.min(Math.max(clientY - height / 2, OVERLAY_EDGE_MARGIN), OVERLAY_EDGE_MARGIN + usable);
    return {
        edge,
        offsetRatio: clampOffsetRatio((top - OVERLAY_EDGE_MARGIN) / usable, fallback.offsetRatio),
    };
}
/** Free-floating pin position from a pointer (centered on the pointer). */
export function projectPointerToPinPlacement(clientX, clientY, options) {
    const width = Math.max(1, options?.width ?? PIN_RAIL_EXPANDED_WIDTH);
    const height = Math.max(1, options?.height ?? PIN_RAIL_BUBBLE_SIZE);
    const viewportWidth = options?.viewportWidth ?? (typeof window !== "undefined" ? window.innerWidth : 1280);
    const viewportHeight = options?.viewportHeight ?? (typeof window !== "undefined" ? window.innerHeight : 720);
    const left = Math.min(Math.max(clientX - width / 2, OVERLAY_EDGE_MARGIN - width + 40), viewportWidth - 40);
    const top = Math.min(Math.max(clientY - height / 2, OVERLAY_EDGE_MARGIN), Math.max(OVERLAY_EDGE_MARGIN, viewportHeight - 40));
    return { left, top };
}
/** Push two same-edge docks apart when their vertical ratios collide. */
export function resolvePlacementAwayFromOther(placement, other, separation = MIN_SAME_EDGE_SEPARATION) {
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
    }
    else {
        offsetRatio = Math.min(1, otherRatio + separation);
        if (Math.abs(offsetRatio - otherRatio) < separation) {
            offsetRatio = Math.max(0, otherRatio - separation);
        }
    }
    return { edge: self.edge, offsetRatio };
}
/**
 * Free pin windows no longer snap away from the panel; keep the stored position.
 */
export function resolvePinPlacementAwayFromPanel(placement) {
    return sanitizePinRailPlacement(placement);
}
export function pinPlacementToStyle(placement, options) {
    const { isDragging, dragLeft, dragTop, width } = options;
    const resolved = sanitizePinRailPlacement(placement);
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
    return {
        position: "fixed",
        top: resolved.top,
        left: resolved.left,
        right: "auto",
        bottom: "auto",
        width,
    };
}
//# sourceMappingURL=edgeDock.js.map