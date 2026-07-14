import { getMarkerDotSize } from "../../utils/markerRuntime.js";
import { getFeedbackTargetSelector, getNearestScrollContainer, getScrollContainerClampId, hasFixedPositionAncestor, isFeedbackTargetVisible } from "../shared/dom.js";
import { getFeedbackAnchorElement, getFeedbackTargetElement } from "./locateFeedback.js";
import { findElementByTargetSelector } from "./targetSelector.js";
import { resolveDetachedKind } from "./markerContext.js";
import { getDocumentY } from "../report/reportPosition.js";
function applyScrollContainerClamp(left, top, element) {
    if (!element) {
        return { left, top, clampedEdge: null, clampBounds: null, clampContainerId: null };
    }
    const scrollContainer = getNearestScrollContainer(element);
    if (!scrollContainer) {
        return { left, top, clampedEdge: null, clampBounds: null, clampContainerId: null };
    }
    const bounds = scrollContainer.getBoundingClientRect();
    const clampBounds = {
        left: bounds.left,
        top: bounds.top,
        right: bounds.right,
        bottom: bounds.bottom,
    };
    const clampContainerId = getScrollContainerClampId(scrollContainer);
    const dotSize = getMarkerDotSize();
    const anchorX = left + dotSize / 2;
    const anchorY = top + dotSize / 2;
    let clampedX = anchorX;
    let clampedY = anchorY;
    let clampedEdge = null;
    if (anchorY < bounds.top) {
        clampedY = bounds.top;
        clampedEdge = "top";
    }
    else if (anchorY > bounds.bottom) {
        clampedY = bounds.bottom;
        clampedEdge = "bottom";
    }
    if (anchorX < bounds.left) {
        clampedX = bounds.left;
        if (!clampedEdge) {
            clampedEdge = "left";
        }
    }
    else if (anchorX > bounds.right) {
        clampedX = bounds.right;
        if (!clampedEdge) {
            clampedEdge = "right";
        }
    }
    return {
        left: clampedX - getMarkerDotSize() / 2,
        top: clampedY - getMarkerDotSize() / 2,
        clampedEdge,
        clampBounds: clampedEdge ? clampBounds : null,
        clampContainerId: clampedEdge ? clampContainerId : null,
    };
}
export function clampRatio(value) {
    if (Number.isNaN(value)) {
        return 0;
    }
    return Math.min(1, Math.max(0, value));
}
function getAnchorMarkerPosition(report) {
    const anchor = report.position.anchor;
    if (!anchor) {
        return null;
    }
    const anchorElement = getFeedbackAnchorElement(report);
    if (!anchorElement) {
        return null;
    }
    const rect = anchorElement.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
        return null;
    }
    return applyScrollContainerClamp(rect.left + rect.width * anchor.x - getMarkerDotSize() / 2, rect.top + rect.height * anchor.y - getMarkerDotSize() / 2, anchorElement);
}
function shouldUseViewportDetachedCoords(report, targetElement) {
    if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        return hasFixedPositionAncestor(targetElement) && rect.width > 0 && rect.height > 0;
    }
    return !report.position.anchor;
}
function getDetachedMarkerPosition(report, currentScrollY, targetElement) {
    const anchorPosition = getAnchorMarkerPosition(report);
    if (anchorPosition) {
        return anchorPosition;
    }
    const { viewport } = report.position;
    const widthScale = viewport.width > 0 ? window.innerWidth / viewport.width : 1;
    const left = viewport.width * viewport.x * widthScale - getMarkerDotSize() / 2;
    const useViewportCoords = shouldUseViewportDetachedCoords(report, targetElement);
    if (useViewportCoords) {
        const heightScale = viewport.height > 0 ? window.innerHeight / viewport.height : 1;
        const top = viewport.height * viewport.y * heightScale - getMarkerDotSize() / 2;
        return { left, top, clampedEdge: null, clampBounds: null, clampContainerId: null };
    }
    const top = getDocumentY(report.position) - currentScrollY - getMarkerDotSize() / 2;
    return { left, top, clampedEdge: null, clampBounds: null, clampContainerId: null };
}
export function getMarkerFromReport(report, currentScrollY) {
    const targetElement = getFeedbackTargetElement(report);
    const { target, viewport } = report.position;
    if (targetElement && isFeedbackTargetVisible(targetElement)) {
        const rect = targetElement.getBoundingClientRect();
        const targetX = target?.x ?? viewport.x;
        const targetY = target?.y ?? viewport.y;
        const position = applyScrollContainerClamp(rect.left + rect.width * targetX - getMarkerDotSize() / 2, rect.top + rect.height * targetY - getMarkerDotSize() / 2, targetElement);
        return {
            id: report.id,
            report,
            left: position.left,
            top: position.top,
            rect,
            detached: false,
            detachedKind: null,
            clampedEdge: position.clampedEdge,
            clampBounds: position.clampBounds,
            clampContainerId: position.clampContainerId,
        };
    }
    const detachedPosition = getDetachedMarkerPosition(report, currentScrollY, targetElement);
    return {
        id: report.id,
        report,
        left: detachedPosition.left,
        top: detachedPosition.top,
        rect: null,
        detached: true,
        detachedKind: resolveDetachedKind(report, targetElement, true),
        clampedEdge: detachedPosition.clampedEdge,
        clampBounds: detachedPosition.clampBounds,
        clampContainerId: detachedPosition.clampContainerId,
    };
}
export function getDraftMarkerPosition(draft, selectedTarget) {
    if (selectedTarget) {
        const targetElement = (draft.targetSelector ? findElementByTargetSelector(draft.targetSelector) : null) ??
            document.querySelector(getFeedbackTargetSelector(selectedTarget.id, selectedTarget.type));
        return applyScrollContainerClamp(selectedTarget.rect.left + selectedTarget.rect.width * draft.elementXRatio - getMarkerDotSize() / 2, selectedTarget.rect.top + selectedTarget.rect.height * draft.elementYRatio - getMarkerDotSize() / 2, targetElement);
    }
    return {
        left: draft.clientX - getMarkerDotSize() / 2,
        top: draft.clientY - getMarkerDotSize() / 2,
        clampedEdge: null,
        clampBounds: null,
        clampContainerId: null,
    };
}
const OVERFLOW_HINT_EDGE_OFFSET = 10;
function serializeClampBounds(bounds) {
    return `${bounds.left}:${bounds.top}:${bounds.right}:${bounds.bottom}`;
}
function getOverflowHintPosition(edge, bounds) {
    const centerX = (bounds.left + bounds.right) / 2;
    const centerY = (bounds.top + bounds.bottom) / 2;
    switch (edge) {
        case "top":
            return { left: centerX, top: bounds.top + OVERFLOW_HINT_EDGE_OFFSET };
        case "bottom":
            return { left: centerX, top: bounds.bottom - OVERFLOW_HINT_EDGE_OFFSET };
        case "left":
            return { left: bounds.left + OVERFLOW_HINT_EDGE_OFFSET, top: centerY };
        case "right":
            return { left: bounds.right - OVERFLOW_HINT_EDGE_OFFSET, top: centerY };
    }
}
export function resolveMarkerOverflowHints(markers) {
    const grouped = new Map();
    for (const marker of markers) {
        if (!marker.clampedEdge || !marker.clampBounds || !marker.clampContainerId) {
            continue;
        }
        const key = `${marker.clampContainerId}:${marker.clampedEdge}:${serializeClampBounds(marker.clampBounds)}`;
        const existing = grouped.get(key);
        if (existing) {
            existing.count += 1;
            continue;
        }
        const position = getOverflowHintPosition(marker.clampedEdge, marker.clampBounds);
        grouped.set(key, {
            id: key,
            edge: marker.clampedEdge,
            count: 1,
            bounds: marker.clampBounds,
            containerId: marker.clampContainerId,
            left: position.left,
            top: position.top,
        });
    }
    return Array.from(grouped.values());
}
export function resolveTooltipAnchor(markers, reportId) {
    if (!reportId) {
        return null;
    }
    return markers.find((marker) => marker.report.id === reportId) ?? null;
}
const TOOLTIP_PREVIEW_WIDTH = 260;
export const TOOLTIP_EXPANDED_WIDTH = 320;
export const TOOLTIP_EXPANDED_MIN_WIDTH = 260;
export const TOOLTIP_EXPANDED_MIN_HEIGHT = 180;
export const TOOLTIP_EXPANDED_DEFAULT_MAX_HEIGHT = 512;
export const TOOLTIP_MARGIN = 16;
const TOOLTIP_PREVIEW_HEIGHT_ESTIMATE = 140;
const TOOLTIP_EXPANDED_HEIGHT_ESTIMATE = 320;
export function getTooltipExpandedSizeLimits() {
    if (typeof window === "undefined") {
        return {
            minWidth: TOOLTIP_EXPANDED_MIN_WIDTH,
            minHeight: TOOLTIP_EXPANDED_MIN_HEIGHT,
            maxWidth: 600,
            maxHeight: TOOLTIP_EXPANDED_DEFAULT_MAX_HEIGHT,
        };
    }
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    return {
        minWidth: TOOLTIP_EXPANDED_MIN_WIDTH,
        minHeight: TOOLTIP_EXPANDED_MIN_HEIGHT,
        maxWidth: Math.max(TOOLTIP_EXPANDED_MIN_WIDTH, viewportWidth - TOOLTIP_MARGIN * 2),
        maxHeight: Math.max(TOOLTIP_EXPANDED_MIN_HEIGHT, viewportHeight - TOOLTIP_MARGIN * 2),
    };
}
export function clampTooltipExpandedSize(width, height) {
    const limits = getTooltipExpandedSizeLimits();
    return {
        width: Math.min(Math.max(width, limits.minWidth), limits.maxWidth),
        height: Math.min(Math.max(height, limits.minHeight), limits.maxHeight),
    };
}
function getTooltipHeightEstimate(expanded) {
    return expanded ? TOOLTIP_EXPANDED_HEIGHT_ESTIMATE : TOOLTIP_PREVIEW_HEIGHT_ESTIMATE;
}
function getTooltipAboveTop(anchor) {
    return anchor.top - getMarkerDotSize() / 2 - TOOLTIP_MARGIN;
}
function getTooltipBelowTop(anchor) {
    return anchor.top + getMarkerDotSize() / 2 + TOOLTIP_MARGIN;
}
export function resolveTooltipPlacement(anchor, height, viewportHeight = window.innerHeight) {
    const aboveAnchorTop = getTooltipAboveTop(anchor);
    const belowTop = getTooltipBelowTop(anchor);
    const spaceAbove = aboveAnchorTop - TOOLTIP_MARGIN;
    const spaceBelow = viewportHeight - TOOLTIP_MARGIN - belowTop;
    const aboveFits = height <= spaceAbove;
    const belowFits = height <= spaceBelow;
    if (aboveFits) {
        return "above";
    }
    if (belowFits) {
        return "below";
    }
    return spaceAbove >= spaceBelow ? "above" : "below";
}
function clampTooltipTop(top, height, placement, viewportHeight) {
    if (placement === "above") {
        const visualTop = top - height;
        if (visualTop < TOOLTIP_MARGIN) {
            return TOOLTIP_MARGIN + height;
        }
        return top;
    }
    const maxTop = Math.max(TOOLTIP_MARGIN, viewportHeight - TOOLTIP_MARGIN - height);
    return Math.min(Math.max(top, TOOLTIP_MARGIN), maxTop);
}
export function getTooltipAnchorStyle(placement) {
    if (placement === "above") {
        return {
            transform: "translateY(-100%)",
            transformOrigin: "bottom left",
        };
    }
    return {
        transformOrigin: "top left",
    };
}
export function getTooltipPosition(anchor, expanded, options) {
    const width = options?.width ?? (expanded ? TOOLTIP_EXPANDED_WIDTH : TOOLTIP_PREVIEW_WIDTH);
    const viewportWidth = options?.viewportWidth ?? window.innerWidth;
    const viewportHeight = options?.viewportHeight ?? window.innerHeight;
    const hasMeasuredHeight = options?.height !== undefined;
    const height = options?.height ?? getTooltipHeightEstimate(expanded);
    const preferredLeft = anchor.left - 12;
    const left = Math.min(Math.max(preferredLeft, TOOLTIP_MARGIN), viewportWidth - width - TOOLTIP_MARGIN);
    const aboveAnchorTop = getTooltipAboveTop(anchor);
    let placement;
    if (options?.placement) {
        placement = options.placement;
    }
    else if (!hasMeasuredHeight) {
        // Before measurement, keep the default above placement unless the marker hugs the top edge.
        placement = aboveAnchorTop <= TOOLTIP_MARGIN ? "below" : "above";
    }
    else {
        placement = resolveTooltipPlacement(anchor, height, viewportHeight);
    }
    const anchorTop = placement === "above" ? aboveAnchorTop : getTooltipBelowTop(anchor);
    const top = hasMeasuredHeight ? clampTooltipTop(anchorTop, height, placement, viewportHeight) : anchorTop;
    return { left, top, width, placement };
}
export const DRAFT_POPOVER_WIDTH = 280;
export const DRAFT_POPOVER_HEIGHT = 260;
export const DRAFT_POPOVER_GAP = 10;
export const DRAFT_POPOVER_MARGIN = 16;
/** Horizontal line from bubble edge to marker center. */
export const DRAFT_POPOVER_CONNECTOR_WIDTH = DRAFT_POPOVER_GAP + getMarkerDotSize() / 2;
/** Nudge popover upward when vertically centered on the marker. */
export const DRAFT_POPOVER_VERTICAL_NUDGE = 6;
const DRAFT_POPOVER_PLACEMENTS = ["right", "left", "bottom", "top"];
function getDraftPopoverWidth(viewportWidth) {
    return Math.min(DRAFT_POPOVER_WIDTH, viewportWidth - DRAFT_POPOVER_MARGIN * 2);
}
function getAnchorCenter(anchor) {
    return {
        x: anchor.left + getMarkerDotSize() / 2,
        y: anchor.top + getMarkerDotSize() / 2,
    };
}
function getTailCornerForPlacement(placement) {
    switch (placement) {
        case "right":
            return "bottom-left";
        case "left":
            return "bottom-right";
        case "bottom":
            return "top-left";
        case "top":
            return "bottom-left";
    }
}
function isHorizontallyAlignedPlacement(placement) {
    return placement === "right" || placement === "left";
}
function computeDraftPopoverCandidate(placement, center, width, height) {
    const markerRadius = getMarkerDotSize() / 2;
    switch (placement) {
        case "right":
            return {
                left: center.x + markerRadius + DRAFT_POPOVER_GAP,
                anchorCenterY: center.y - DRAFT_POPOVER_VERTICAL_NUDGE,
            };
        case "left":
            return {
                left: center.x - markerRadius - DRAFT_POPOVER_GAP - width,
                anchorCenterY: center.y - DRAFT_POPOVER_VERTICAL_NUDGE,
            };
        case "bottom":
            return {
                left: center.x - width / 2,
                top: center.y + markerRadius + DRAFT_POPOVER_GAP,
            };
        case "top":
            return {
                left: center.x - width / 2,
                top: center.y - markerRadius - DRAFT_POPOVER_GAP - height,
            };
    }
}
function draftPopoverFitsInViewport(placement, left, width, height, viewportWidth, viewportHeight, anchorCenterY, top) {
    const horizontalFits = left >= DRAFT_POPOVER_MARGIN && left + width <= viewportWidth - DRAFT_POPOVER_MARGIN;
    if (isHorizontallyAlignedPlacement(placement) && anchorCenterY !== undefined) {
        return horizontalFits && anchorCenterY - height / 2 >= DRAFT_POPOVER_MARGIN && anchorCenterY + height / 2 <= viewportHeight - DRAFT_POPOVER_MARGIN;
    }
    return horizontalFits && top !== undefined && top >= DRAFT_POPOVER_MARGIN && top + height <= viewportHeight - DRAFT_POPOVER_MARGIN;
}
function clampAnchorCenterY(anchorCenterY, height, viewportHeight) {
    const halfHeight = height / 2;
    const minCenterY = DRAFT_POPOVER_MARGIN + halfHeight;
    const maxCenterY = Math.max(minCenterY, viewportHeight - DRAFT_POPOVER_MARGIN - halfHeight);
    return Math.min(Math.max(anchorCenterY, minCenterY), maxCenterY);
}
function clampDraftPopoverPosition(placement, left, width, height, viewportWidth, viewportHeight, anchorCenterY, top) {
    const maxLeft = Math.max(DRAFT_POPOVER_MARGIN, viewportWidth - width - DRAFT_POPOVER_MARGIN);
    const clampedLeft = Math.min(Math.max(left, DRAFT_POPOVER_MARGIN), maxLeft);
    if (isHorizontallyAlignedPlacement(placement) && anchorCenterY !== undefined) {
        return {
            left: clampedLeft,
            anchorCenterY: clampAnchorCenterY(anchorCenterY, height, viewportHeight),
        };
    }
    const maxTop = Math.max(DRAFT_POPOVER_MARGIN, viewportHeight - height - DRAFT_POPOVER_MARGIN);
    return {
        left: clampedLeft,
        top: Math.min(Math.max(top ?? DRAFT_POPOVER_MARGIN, DRAFT_POPOVER_MARGIN), maxTop),
    };
}
export function getDraftPopoverPosition(anchor, options) {
    const viewportWidth = options?.viewportWidth ?? window.innerWidth;
    const viewportHeight = options?.viewportHeight ?? window.innerHeight;
    const width = options?.width ?? getDraftPopoverWidth(viewportWidth);
    const height = options?.height ?? DRAFT_POPOVER_HEIGHT;
    const center = getAnchorCenter(anchor);
    let placement = "right";
    let position = computeDraftPopoverCandidate("right", center, width, height);
    for (const candidate of DRAFT_POPOVER_PLACEMENTS) {
        const nextPosition = computeDraftPopoverCandidate(candidate, center, width, height);
        if (draftPopoverFitsInViewport(candidate, nextPosition.left, width, height, viewportWidth, viewportHeight, nextPosition.anchorCenterY, nextPosition.top)) {
            placement = candidate;
            position = nextPosition;
            break;
        }
    }
    const clamped = clampDraftPopoverPosition(placement, position.left, width, height, viewportWidth, viewportHeight, position.anchorCenterY, position.top);
    return {
        ...clamped,
        width,
        placement,
        centerVertically: isHorizontallyAlignedPlacement(placement),
        tailCorner: getTailCornerForPlacement(placement),
    };
}
//# sourceMappingURL=coordinates.js.map