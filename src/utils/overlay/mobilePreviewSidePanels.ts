export const MOBILE_PREVIEW_SIDE_PANEL_IDS = ["capture", "qr"] as const;

export type MobilePreviewSidePanelId = (typeof MOBILE_PREVIEW_SIDE_PANEL_IDS)[number];

export const MOBILE_PREVIEW_SIDE_PANEL_WIDTH = 220;
export const MOBILE_PREVIEW_SIDE_PANEL_GAP = 16;
export const MOBILE_PREVIEW_SIDE_PANEL_STACK_GAP = 12;

export function toggleMobilePreviewSidePanel(
    openPanels: readonly MobilePreviewSidePanelId[],
    panelId: MobilePreviewSidePanelId,
): MobilePreviewSidePanelId[] {
    if (openPanels.includes(panelId)) {
        return openPanels.filter((id) => id !== panelId);
    }

    return [...openPanels, panelId];
}

export function isMobilePreviewSidePanelOpen(openPanels: readonly MobilePreviewSidePanelId[], panelId: MobilePreviewSidePanelId) {
    return openPanels.includes(panelId);
}
