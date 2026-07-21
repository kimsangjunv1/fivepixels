/**
 * Class-name map for fivepixels motion utilities.
 * Definitions live in `src/styles/motion.css` — tune animations there.
 */
export const MOTION = {
    fadeScaleIn: "fivepixels-motion-fade-scale-in",
    fadeScaleOut: "fivepixels-motion-fade-scale-out",
    tooltipIn: "fivepixels-motion-tooltip-in",
    /** Opacity-only enter — use when the element also relies on CSS transform for layout/placement */
    tooltipFadeIn: "fivepixels-motion-tooltip-fade-in",
    tooltipOut: "fivepixels-motion-tooltip-out",
    slideUpIn: "fivepixels-motion-slide-up-in",
    slideFromLeft: "fivepixels-motion-slide-from-left",
    slideFromRight: "fivepixels-motion-slide-from-right",
    noticeIn: "fivepixels-motion-notice-in",
    dialogIn: "fivepixels-motion-dialog-in",
    menuIn: "fivepixels-motion-menu-in",
    ghostIn: "fivepixels-motion-ghost-in",
    panelEnter: "fivepixels-panel-enter",
    panelDock: "fivepixels-panel-dock",
    panelDockDragging: "fivepixels-panel-dock--dragging",
    panelCollapseInLeft: "fivepixels-panel-collapse-in--left",
    panelCollapseInRight: "fivepixels-panel-collapse-in--right",
    panelModeSwap: "fivepixels-panel-mode-swap",
    panelTabShell: "fivepixels-panel-tab-shell",
    panelTabShellInner: "fivepixels-panel-tab-shell-inner",
    panelTabHeight: "fivepixels-panel-tab-height",
    panelTabHeightAnimate: "fivepixels-panel-tab-height--animate",
    panelTabPane: "fivepixels-panel-tab-pane",
    panelTabPaneFadeOut: "fivepixels-panel-tab-pane--fade-out",
    panelTabPaneFromLeft: "fivepixels-panel-tab-pane--from-left",
    panelTabPaneFromRight: "fivepixels-panel-tab-pane--from-right",
    panelTabPaneOutToLeft: "fivepixels-panel-tab-pane--out-to-left",
    panelTabPaneOutToRight: "fivepixels-panel-tab-pane--out-to-right",
    markerWindowEnter: "fivepixels-marker-window-enter",
    markerWindowExit: "fivepixels-marker-window-exit",
    pinRailEnter: "fivepixels-pin-rail-enter",
    pinRailShell: "fivepixels-pin-rail-shell",
    pinRailBody: "fivepixels-pin-rail-body",
    pinRailBodyInner: "fivepixels-pin-rail-body-inner",
    pinCardEnter: "fivepixels-pin-card-enter",
    pinStarPop: "fivepixels-pin-star-pop",
    pinCardPulse: "fivepixels-pin-card-pulse",
};
export const PANEL_TAB_FADE_MS = 180;
export const PANEL_TAB_HEIGHT_MS = 300;
export function panelCollapseInClass(anchorSide) {
    return anchorSide === "right" ? MOTION.panelCollapseInRight : MOTION.panelCollapseInLeft;
}
export function panelTabPaneClass(direction) {
    if (direction === "left") {
        return MOTION.panelTabPaneFromLeft;
    }
    if (direction === "right") {
        return MOTION.panelTabPaneFromRight;
    }
    return MOTION.panelTabPane;
}
/** Exit opposite to enter direction so content slides away as the next pane arrives. */
export function panelTabPaneExitClass(direction) {
    if (direction === "right") {
        return MOTION.panelTabPaneOutToLeft;
    }
    if (direction === "left") {
        return MOTION.panelTabPaneOutToRight;
    }
    return MOTION.panelTabPaneFadeOut;
}
//# sourceMappingURL=motionClasses.js.map