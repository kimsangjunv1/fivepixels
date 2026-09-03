export const MOBILE_PREVIEW_SIDE_PANEL_IDS = ["capture", "qr"];
export const MOBILE_PREVIEW_SIDE_PANEL_WIDTH = 220;
export const MOBILE_PREVIEW_SIDE_PANEL_GAP = 16;
export const MOBILE_PREVIEW_SIDE_PANEL_STACK_GAP = 12;
export function toggleMobilePreviewSidePanel(openPanels, panelId) {
    if (openPanels.includes(panelId)) {
        return openPanels.filter((id) => id !== panelId);
    }
    return [...openPanels, panelId];
}
export function isMobilePreviewSidePanelOpen(openPanels, panelId) {
    return openPanels.includes(panelId);
}
//# sourceMappingURL=mobilePreviewSidePanels.js.map