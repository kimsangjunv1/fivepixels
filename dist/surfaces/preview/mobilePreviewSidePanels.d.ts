export declare const MOBILE_PREVIEW_SIDE_PANEL_IDS: readonly ["capture", "qr"];
export type MobilePreviewSidePanelId = (typeof MOBILE_PREVIEW_SIDE_PANEL_IDS)[number];
export declare const MOBILE_PREVIEW_SIDE_PANEL_WIDTH = 220;
export declare const MOBILE_PREVIEW_SIDE_PANEL_GAP = 16;
export declare const MOBILE_PREVIEW_SIDE_PANEL_STACK_GAP = 12;
export declare function toggleMobilePreviewSidePanel(openPanels: readonly MobilePreviewSidePanelId[], panelId: MobilePreviewSidePanelId): MobilePreviewSidePanelId[];
export declare function isMobilePreviewSidePanelOpen(openPanels: readonly MobilePreviewSidePanelId[], panelId: MobilePreviewSidePanelId): boolean;
//# sourceMappingURL=mobilePreviewSidePanels.d.ts.map