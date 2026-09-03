export function resolveMobilePreviewScreenSize(preset, orientation) {
    if (orientation === "landscape") {
        return {
            width: preset.height,
            height: preset.width,
        };
    }
    return {
        width: preset.width,
        height: preset.height,
    };
}
/** Scaled on-screen screen area for the current orientation. */
export function resolveMobilePreviewLayout(preset, scale, orientation) {
    const screenSize = resolveMobilePreviewScreenSize(preset, orientation);
    return {
        width: Math.max(1, Math.round(screenSize.width * scale)),
        height: Math.max(1, Math.round(screenSize.height * scale)),
    };
}
export function resolveMobilePreviewStatusBarReferenceWidth(preset, orientation) {
    return orientation === "landscape" ? preset.height : preset.width;
}
export function resolveMobilePreviewFrameMetrics(layout, bezel) {
    return {
        frameWidth: layout.width + bezel.left + bezel.right,
        frameHeight: layout.height + bezel.top + bezel.bottom,
    };
}
/**
 * Remap portrait chrome to a landscape silhouette (90° clockwise, home indicator on the right).
 * Screen content stays upright — only the physical frame geometry changes.
 */
export function rotateDeviceChromeForLandscape(chrome) {
    const { bezel, buttons } = chrome;
    return {
        frameRadius: chrome.frameRadius,
        screenRadius: chrome.screenRadius,
        bezel: {
            top: bezel.left,
            right: bezel.bottom,
            bottom: bezel.right,
            left: bezel.top,
        },
        buttons: {
            top: (buttons?.left ?? []).map((button) => ({
                leftRatio: button.topRatio,
                width: button.height,
            })),
            bottom: (buttons?.right ?? []).map((button) => ({
                leftRatio: button.topRatio,
                width: button.height,
            })),
        },
    };
}
export function resolveMobilePreviewChrome(portraitChrome, orientation) {
    return orientation === "landscape" ? rotateDeviceChromeForLandscape(portraitChrome) : portraitChrome;
}
//# sourceMappingURL=mobilePreviewLayout.js.map