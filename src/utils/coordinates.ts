import { DOT_SIZE, TARGET_SELECTOR } from "../constants/report.js";
import type { ReportFeedback } from "../types/report.js";
import type { DraftReport, Marker, TargetSnapshot } from "../types/report-ui.js";
import { escapeAttribute } from "./dom.js";

export function clampRatio(value: number) {
    if (Number.isNaN(value)) {
        return 0;
    }

    return Math.min(1, Math.max(0, value));
}

export function getMarkerFromReport(report: ReportFeedback, currentScrollY: number): Marker {
    const selector = `${TARGET_SELECTOR}[data-report-id="${escapeAttribute(report.report_id)}"][data-report-type="${report.report_type}"]`;
    const targetElement = document.querySelector<HTMLElement>(selector);
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

export function getDraftMarkerPosition(draft: Pick<DraftReport, "clientX" | "clientY" | "elementXRatio" | "elementYRatio">, selectedTarget: TargetSnapshot | null) {
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

export function resolveTooltipAnchor(markers: Marker[], reportId: string | null) {
    if (!reportId) {
        return null;
    }

    return markers.find((marker) => marker.report.id === reportId) ?? null;
}

const TOOLTIP_PREVIEW_WIDTH = 260;
const TOOLTIP_EXPANDED_WIDTH = 320;
const TOOLTIP_PREVIEW_OFFSET = 104;
const TOOLTIP_EXPANDED_OFFSET = 280;
const TOOLTIP_MARGIN = 16;

export function getTooltipPosition(anchor: Pick<Marker, "left" | "top">, expanded: boolean) {
    const width = expanded ? TOOLTIP_EXPANDED_WIDTH : TOOLTIP_PREVIEW_WIDTH;
    const heightOffset = expanded ? TOOLTIP_EXPANDED_OFFSET : TOOLTIP_PREVIEW_OFFSET;
    const preferredLeft = anchor.left - 12;
    const left = Math.min(Math.max(preferredLeft, TOOLTIP_MARGIN), window.innerWidth - width - TOOLTIP_MARGIN);
    const top = Math.max(anchor.top - heightOffset, TOOLTIP_MARGIN);

    return { left, top, width };
}

export type DraftPopoverPlacement = "right" | "left" | "bottom" | "top";
export type DraftPopoverTailCorner = "bottom-left" | "bottom-right" | "top-left" | "top-right";

export const DRAFT_POPOVER_WIDTH = 280;
export const DRAFT_POPOVER_HEIGHT = 260;
export const DRAFT_POPOVER_GAP = 10;
export const DRAFT_POPOVER_MARGIN = 16;
/** Horizontal line from bubble edge to marker center. */
export const DRAFT_POPOVER_CONNECTOR_WIDTH = DRAFT_POPOVER_GAP + DOT_SIZE / 2;
/** Nudge popover upward when vertically centered on the marker. */
export const DRAFT_POPOVER_VERTICAL_NUDGE = 6;

const DRAFT_POPOVER_PLACEMENTS: DraftPopoverPlacement[] = ["right", "left", "bottom", "top"];

function getDraftPopoverWidth(viewportWidth: number) {
    return Math.min(DRAFT_POPOVER_WIDTH, viewportWidth - DRAFT_POPOVER_MARGIN * 2);
}

function getAnchorCenter(anchor: Pick<Marker, "left" | "top">) {
    return {
        x: anchor.left + DOT_SIZE / 2,
        y: anchor.top + DOT_SIZE / 2,
    };
}

function getTailCornerForPlacement(placement: DraftPopoverPlacement): DraftPopoverTailCorner {
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

function isHorizontallyAlignedPlacement(placement: DraftPopoverPlacement) {
    return placement === "right" || placement === "left";
}

function computeDraftPopoverCandidate(placement: DraftPopoverPlacement, center: { x: number; y: number }, width: number, height: number) {
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

function draftPopoverFitsInViewport(
    placement: DraftPopoverPlacement,
    left: number,
    width: number,
    height: number,
    viewportWidth: number,
    viewportHeight: number,
    anchorCenterY?: number,
    top?: number,
) {
    const horizontalFits = left >= DRAFT_POPOVER_MARGIN && left + width <= viewportWidth - DRAFT_POPOVER_MARGIN;

    if (isHorizontallyAlignedPlacement(placement) && anchorCenterY !== undefined) {
        return horizontalFits && anchorCenterY - height / 2 >= DRAFT_POPOVER_MARGIN && anchorCenterY + height / 2 <= viewportHeight - DRAFT_POPOVER_MARGIN;
    }

    return horizontalFits && top !== undefined && top >= DRAFT_POPOVER_MARGIN && top + height <= viewportHeight - DRAFT_POPOVER_MARGIN;
}

function clampAnchorCenterY(anchorCenterY: number, height: number, viewportHeight: number) {
    const halfHeight = height / 2;
    const minCenterY = DRAFT_POPOVER_MARGIN + halfHeight;
    const maxCenterY = Math.max(minCenterY, viewportHeight - DRAFT_POPOVER_MARGIN - halfHeight);

    return Math.min(Math.max(anchorCenterY, minCenterY), maxCenterY);
}

function clampDraftPopoverPosition(placement: DraftPopoverPlacement, left: number, width: number, height: number, viewportWidth: number, viewportHeight: number, anchorCenterY?: number, top?: number) {
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

export function getDraftPopoverPosition(
    anchor: Pick<Marker, "left" | "top">,
    options?: {
        width?: number;
        height?: number;
        viewportWidth?: number;
        viewportHeight?: number;
    },
) {
    const viewportWidth = options?.viewportWidth ?? window.innerWidth;
    const viewportHeight = options?.viewportHeight ?? window.innerHeight;
    const width = options?.width ?? getDraftPopoverWidth(viewportWidth);
    const height = options?.height ?? DRAFT_POPOVER_HEIGHT;
    const center = getAnchorCenter(anchor);

    let placement: DraftPopoverPlacement = "right";
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
