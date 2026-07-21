export type HoverTooltipLayout = {
    top: number;
    left: number;
};

export const HOVER_TOOLTIP_GAP = 4;
export const HOVER_TOOLTIP_MARGIN = 8;

export function getHoverTooltipLayout(anchorRect: DOMRect, tooltipRect: DOMRect): HoverTooltipLayout {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const anchorCenterX = anchorRect.left + anchorRect.width / 2;
    const aboveTop = anchorRect.top - HOVER_TOOLTIP_GAP - tooltipRect.height;
    const belowTop = anchorRect.bottom + HOVER_TOOLTIP_GAP;
    const spaceAbove = anchorRect.top - HOVER_TOOLTIP_MARGIN;
    const spaceBelow = viewportHeight - HOVER_TOOLTIP_MARGIN - anchorRect.bottom;
    const aboveFits = aboveTop >= HOVER_TOOLTIP_MARGIN;
    const belowFits = belowTop + tooltipRect.height <= viewportHeight - HOVER_TOOLTIP_MARGIN;

    let top: number;

    if (aboveFits) {
        top = aboveTop;
    } else if (belowFits) {
        top = belowTop;
    } else if (spaceAbove >= spaceBelow) {
        top = Math.max(HOVER_TOOLTIP_MARGIN, anchorRect.top - HOVER_TOOLTIP_GAP - tooltipRect.height);
    } else {
        top = Math.min(belowTop, viewportHeight - HOVER_TOOLTIP_MARGIN - tooltipRect.height);
    }

    const centeredLeft = anchorCenterX - tooltipRect.width / 2;
    const left = Math.min(Math.max(centeredLeft, HOVER_TOOLTIP_MARGIN), Math.max(HOVER_TOOLTIP_MARGIN, viewportWidth - HOVER_TOOLTIP_MARGIN - tooltipRect.width));

    return { top, left };
}
