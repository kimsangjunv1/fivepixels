/**
 * Class-name map for fivepixels motion utilities.
 * Definitions live in `src/styles/motion.css` — tune animations there.
 */
export declare const MOTION: {
    readonly fadeScaleIn: "fivepixels-motion-fade-scale-in";
    readonly fadeScaleOut: "fivepixels-motion-fade-scale-out";
    readonly tooltipIn: "fivepixels-motion-tooltip-in";
    /** Opacity-only enter — use when the element also relies on CSS transform for layout/placement */
    readonly tooltipFadeIn: "fivepixels-motion-tooltip-fade-in";
    readonly tooltipOut: "fivepixels-motion-tooltip-out";
    readonly slideUpIn: "fivepixels-motion-slide-up-in";
    readonly slideFromLeft: "fivepixels-motion-slide-from-left";
    readonly slideFromRight: "fivepixels-motion-slide-from-right";
    readonly noticeIn: "fivepixels-motion-notice-in";
    readonly dialogIn: "fivepixels-motion-dialog-in";
    readonly menuIn: "fivepixels-motion-menu-in";
    readonly ghostIn: "fivepixels-motion-ghost-in";
    readonly panelEnter: "fivepixels-panel-enter";
    readonly panelDock: "fivepixels-panel-dock";
    readonly panelDockDragging: "fivepixels-panel-dock--dragging";
    readonly panelCollapseInLeft: "fivepixels-panel-collapse-in--left";
    readonly panelCollapseInRight: "fivepixels-panel-collapse-in--right";
    readonly panelModeSwap: "fivepixels-panel-mode-swap";
    readonly panelTabShell: "fivepixels-panel-tab-shell";
    readonly panelTabShellInner: "fivepixels-panel-tab-shell-inner";
    readonly panelTabHeight: "fivepixels-panel-tab-height";
    readonly panelTabHeightAnimate: "fivepixels-panel-tab-height--animate";
    readonly panelTabPane: "fivepixels-panel-tab-pane";
    readonly panelTabPaneFadeOut: "fivepixels-panel-tab-pane--fade-out";
    readonly panelTabPaneFromLeft: "fivepixels-panel-tab-pane--from-left";
    readonly panelTabPaneFromRight: "fivepixels-panel-tab-pane--from-right";
    readonly panelTabPaneOutToLeft: "fivepixels-panel-tab-pane--out-to-left";
    readonly panelTabPaneOutToRight: "fivepixels-panel-tab-pane--out-to-right";
    readonly markerWindowEnter: "fivepixels-marker-window-enter";
    readonly markerWindowExit: "fivepixels-marker-window-exit";
    readonly pinRailEnter: "fivepixels-pin-rail-enter";
    readonly pinRailShell: "fivepixels-pin-rail-shell";
    readonly pinRailBody: "fivepixels-pin-rail-body";
    readonly pinRailBodyInner: "fivepixels-pin-rail-body-inner";
    readonly pinCardEnter: "fivepixels-pin-card-enter";
    readonly pinStarPop: "fivepixels-pin-star-pop";
    readonly pinCardPulse: "fivepixels-pin-card-pulse";
};
export type MotionClassName = (typeof MOTION)[keyof typeof MOTION];
export declare const PANEL_TAB_FADE_MS = 180;
export declare const PANEL_TAB_HEIGHT_MS = 300;
export declare function panelCollapseInClass(anchorSide: "left" | "right"): string;
export declare function panelTabPaneClass(direction: "left" | "right" | "open" | null): string;
/** Exit opposite to enter direction so content slides away as the next pane arrives. */
export declare function panelTabPaneExitClass(direction: "left" | "right" | "open" | null): string;
//# sourceMappingURL=motionClasses.d.ts.map