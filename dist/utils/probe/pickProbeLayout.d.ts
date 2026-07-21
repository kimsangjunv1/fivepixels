export type PickProbePanelPlacement = "below" | "above";
export type PickProbePanelLayout = {
    top: number;
    left: number;
    placement: PickProbePanelPlacement;
};
export declare function getPickProbePanelLayout(anchorRect: DOMRect, panelWidth: number, panelHeight: number): PickProbePanelLayout;
export declare function getPickProbeCompareChipLayout(anchorRect: DOMRect, chipWidth: number, chipHeight: number): {
    top: number;
    left: number;
};
export declare function getPickProbeSavedBadgeLayout(anchorRect: DOMRect, badgeWidth: number, badgeHeight: number): {
    top: number;
    left: number;
};
//# sourceMappingURL=pickProbeLayout.d.ts.map