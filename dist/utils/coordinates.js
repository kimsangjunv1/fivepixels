import { DOT_SIZE } from "../constants/report.js";
import { getFeedbackTargetSelector, isFeedbackTargetVisible } from "./dom.js";
import { getFeedbackAnchorElement } from "./locateFeedback.js";
export function clampRatio(value) {
    if (Number.isNaN(value)) {
        return 0;
    }
    return Math.min(1, Math.max(0, value));
}
function getAnchorMarkerPosition(report) {
    if (!report.anchor_report_id || !report.anchor_report_type) {
        return null;
    }
    if (report.anchor_x_ratio === null || report.anchor_x_ratio === undefined || report.anchor_y_ratio === null || report.anchor_y_ratio === undefined) {
        return null;
    }
    const anchorElement = getFeedbackAnchorElement({
        anchor_report_id: report.anchor_report_id,
        anchor_report_type: report.anchor_report_type,
    });
    if (!anchorElement) {
        return null;
    }
    const rect = anchorElement.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
        return null;
    }
    return {
        left: rect.left + rect.width * report.anchor_x_ratio - DOT_SIZE / 2,
        top: rect.top + rect.height * report.anchor_y_ratio - DOT_SIZE / 2,
    };
}
function getDetachedMarkerPosition(report, currentScrollY) {
    const anchorPosition = getAnchorMarkerPosition(report);
    if (anchorPosition) {
        return anchorPosition;
    }
    const widthScale = report.viewport_width > 0 ? window.innerWidth / report.viewport_width : 1;
    const left = report.viewport_width * report.x_ratio * widthScale - DOT_SIZE / 2;
    const top = report.document_y - currentScrollY - DOT_SIZE / 2;
    return { left, top };
}
export function getMarkerFromReport(report, currentScrollY) {
    const selector = getFeedbackTargetSelector(report.report_id, report.report_type);
    const targetElement = document.querySelector(selector);
    if (targetElement && isFeedbackTargetVisible(targetElement)) {
        const rect = targetElement.getBoundingClientRect();
        return {
            id: report.id,
            report,
            left: rect.left + rect.width * (report.element_x_ratio ?? report.x_ratio) - DOT_SIZE / 2,
            top: rect.top + rect.height * (report.element_y_ratio ?? report.y_ratio) - DOT_SIZE / 2,
            rect,
            detached: false,
        };
    }
    const detachedPosition = getDetachedMarkerPosition(report, currentScrollY);
    return {
        id: report.id,
        report,
        left: detachedPosition.left,
        top: detachedPosition.top,
        rect: null,
        detached: true,
    };
}
export function getDraftMarkerPosition(draft, selectedTarget) {
    if (selectedTarget) {
        return {
            left: selectedTarget.rect.left + selectedTarget.rect.width * draft.elementXRatio - DOT_SIZE / 2,
            top: selectedTarget.rect.top + selectedTarget.rect.height * draft.elementYRatio - DOT_SIZE / 2,
        };
    }
    return {
        left: draft.clientX - DOT_SIZE / 2,
        top: draft.clientY - DOT_SIZE / 2,
    };
}
export function resolveTooltipAnchor(markers, reportId) {
    if (!reportId) {
        return null;
    }
    return markers.find((marker) => marker.report.id === reportId) ?? null;
}
const TOOLTIP_PREVIEW_WIDTH = 260;
const TOOLTIP_EXPANDED_WIDTH = 320;
export const TOOLTIP_MARGIN = 16;
const TOOLTIP_PREVIEW_HEIGHT_ESTIMATE = 140;
const TOOLTIP_EXPANDED_HEIGHT_ESTIMATE = 320;
function getTooltipHeightEstimate(expanded) {
    return expanded ? TOOLTIP_EXPANDED_HEIGHT_ESTIMATE : TOOLTIP_PREVIEW_HEIGHT_ESTIMATE;
}
function getTooltipAboveTop(anchor) {
    return anchor.top - DOT_SIZE / 2 - TOOLTIP_MARGIN;
}
function getTooltipBelowTop(anchor) {
    return anchor.top + DOT_SIZE / 2 + TOOLTIP_MARGIN;
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
    const width = expanded ? TOOLTIP_EXPANDED_WIDTH : TOOLTIP_PREVIEW_WIDTH;
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
export const DRAFT_POPOVER_CONNECTOR_WIDTH = DRAFT_POPOVER_GAP + DOT_SIZE / 2;
/** Nudge popover upward when vertically centered on the marker. */
export const DRAFT_POPOVER_VERTICAL_NUDGE = 6;
const DRAFT_POPOVER_PLACEMENTS = ["right", "left", "bottom", "top"];
function getDraftPopoverWidth(viewportWidth) {
    return Math.min(DRAFT_POPOVER_WIDTH, viewportWidth - DRAFT_POPOVER_MARGIN * 2);
}
function getAnchorCenter(anchor) {
    return {
        x: anchor.left + DOT_SIZE / 2,
        y: anchor.top + DOT_SIZE / 2,
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
    const markerRadius = DOT_SIZE / 2;
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