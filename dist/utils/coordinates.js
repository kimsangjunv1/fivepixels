import { DOT_SIZE, TARGET_SELECTOR } from "../constants/report.js";
import { escapeAttribute } from "./dom.js";
export function clampRatio(value) {
    if (Number.isNaN(value)) {
        return 0;
    }
    return Math.min(1, Math.max(0, value));
}
export function getMarkerFromReport(report, currentScrollY) {
    const selector = `${TARGET_SELECTOR}[data-report-id="${escapeAttribute(report.report_id)}"][data-report-type="${report.report_type}"]`;
    const targetElement = document.querySelector(selector);
    const pointLeft = window.innerWidth * report.x_ratio - DOT_SIZE / 2;
    const pointTop = report.document_y - currentScrollY - DOT_SIZE / 2;
    if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        return {
            id: report.id,
            report,
            left: rect.left + rect.width * (report.element_x_ratio ?? report.x_ratio) - DOT_SIZE / 2,
            top: rect.top + rect.height * (report.element_y_ratio ?? report.y_ratio) - DOT_SIZE / 2,
            rect,
        };
    }
    return {
        id: report.id,
        report,
        left: pointLeft,
        top: pointTop,
        rect: null,
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
const TOOLTIP_EXPANDED_WIDTH = 280;
const TOOLTIP_PREVIEW_OFFSET = 104;
const TOOLTIP_EXPANDED_OFFSET = 232;
const TOOLTIP_MARGIN = 16;
export function getTooltipPosition(anchor, expanded) {
    const width = expanded ? TOOLTIP_EXPANDED_WIDTH : TOOLTIP_PREVIEW_WIDTH;
    const heightOffset = expanded ? TOOLTIP_EXPANDED_OFFSET : TOOLTIP_PREVIEW_OFFSET;
    const preferredLeft = anchor.left - 12;
    const left = Math.min(Math.max(preferredLeft, TOOLTIP_MARGIN), window.innerWidth - width - TOOLTIP_MARGIN);
    const top = Math.max(anchor.top - heightOffset, TOOLTIP_MARGIN);
    return { left, top, width };
}
export const DRAFT_POPOVER_WIDTH = 280;
export const DRAFT_POPOVER_HEIGHT = 228;
export const DRAFT_POPOVER_GAP = 10;
export const DRAFT_POPOVER_MARGIN = 16;
/** Bubble bottom sits near the marker; tail extends below the main rounded body. */
export const DRAFT_POPOVER_TAIL_OFFSET = 14;
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
function computeDraftPopoverCandidate(placement, center, width, height) {
    const markerRadius = DOT_SIZE / 2;
    switch (placement) {
        case "right":
            return {
                left: center.x + markerRadius + DRAFT_POPOVER_GAP,
                top: center.y - height + DRAFT_POPOVER_TAIL_OFFSET,
            };
        case "left":
            return {
                left: center.x - markerRadius - DRAFT_POPOVER_GAP - width,
                top: center.y - height + DRAFT_POPOVER_TAIL_OFFSET,
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
function draftPopoverFitsInViewport(left, top, width, height, viewportWidth, viewportHeight) {
    return (left >= DRAFT_POPOVER_MARGIN &&
        top >= DRAFT_POPOVER_MARGIN &&
        left + width <= viewportWidth - DRAFT_POPOVER_MARGIN &&
        top + height <= viewportHeight - DRAFT_POPOVER_MARGIN);
}
function clampDraftPopoverPosition(left, top, width, height, viewportWidth, viewportHeight) {
    const maxLeft = Math.max(DRAFT_POPOVER_MARGIN, viewportWidth - width - DRAFT_POPOVER_MARGIN);
    const maxTop = Math.max(DRAFT_POPOVER_MARGIN, viewportHeight - height - DRAFT_POPOVER_MARGIN);
    return {
        left: Math.min(Math.max(left, DRAFT_POPOVER_MARGIN), maxLeft),
        top: Math.min(Math.max(top, DRAFT_POPOVER_MARGIN), maxTop),
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
        if (draftPopoverFitsInViewport(nextPosition.left, nextPosition.top, width, height, viewportWidth, viewportHeight)) {
            placement = candidate;
            position = nextPosition;
            break;
        }
    }
    const clamped = clampDraftPopoverPosition(position.left, position.top, width, height, viewportWidth, viewportHeight);
    return {
        ...clamped,
        width,
        placement,
        tailCorner: getTailCornerForPlacement(placement),
    };
}
//# sourceMappingURL=coordinates.js.map