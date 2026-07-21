const PANEL_GAP = 8;
const PANEL_MARGIN = 8;
export function getPickProbePanelLayout(anchorRect, panelWidth, panelHeight) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const belowTop = anchorRect.bottom + PANEL_GAP;
    const aboveTop = anchorRect.top - PANEL_GAP - panelHeight;
    const belowFits = belowTop + panelHeight <= viewportHeight - PANEL_MARGIN;
    const aboveFits = aboveTop >= PANEL_MARGIN;
    let placement = "below";
    let top = belowTop;
    if (!belowFits && aboveFits) {
        placement = "above";
        top = aboveTop;
    }
    else if (!belowFits && !aboveFits) {
        placement = aboveTop >= belowTop ? "above" : "below";
        top = placement === "above" ? Math.max(PANEL_MARGIN, aboveTop) : Math.min(belowTop, viewportHeight - PANEL_MARGIN - panelHeight);
    }
    const preferredLeft = anchorRect.left;
    const left = Math.min(Math.max(preferredLeft, PANEL_MARGIN), Math.max(PANEL_MARGIN, viewportWidth - PANEL_MARGIN - panelWidth));
    return { top, left, placement };
}
export function getPickProbeCompareChipLayout(anchorRect, chipWidth, chipHeight) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const margin = 8;
    const gap = 6;
    let top = anchorRect.top - chipHeight - gap;
    let left = anchorRect.right - chipWidth;
    if (top < margin) {
        top = anchorRect.top + gap;
    }
    left = Math.min(Math.max(left, margin), Math.max(margin, viewportWidth - margin - chipWidth));
    top = Math.min(Math.max(top, margin), Math.max(margin, viewportHeight - margin - chipHeight));
    return { top, left };
}
export function getPickProbeSavedBadgeLayout(anchorRect, badgeWidth, badgeHeight) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const margin = 6;
    const gap = 4;
    let top = anchorRect.top + gap;
    let left = anchorRect.right - badgeWidth - gap;
    if (left < margin) {
        left = anchorRect.right - badgeWidth;
    }
    left = Math.min(Math.max(left, margin), Math.max(margin, viewportWidth - margin - badgeWidth));
    top = Math.min(Math.max(top, margin), Math.max(margin, viewportHeight - margin - badgeHeight));
    return { top, left };
}
//# sourceMappingURL=pickProbeLayout.js.map