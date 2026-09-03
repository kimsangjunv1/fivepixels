import type { DeviceBezelInset, DeviceChromeSpec, DevicePreviewPreset } from "../constants/devicePreview.js";
import type { MobilePreviewOrientation } from "../preview/useMobilePreviewPreference.js";
export declare function resolveMobilePreviewScreenSize(preset: DevicePreviewPreset, orientation: MobilePreviewOrientation): {
    width: number;
    height: number;
};
/** Scaled on-screen screen area for the current orientation. */
export declare function resolveMobilePreviewLayout(preset: DevicePreviewPreset, scale: number, orientation: MobilePreviewOrientation): {
    width: number;
    height: number;
};
export declare function resolveMobilePreviewStatusBarReferenceWidth(preset: DevicePreviewPreset, orientation: MobilePreviewOrientation): number;
export type MobilePreviewFrameMetrics = {
    frameWidth: number;
    frameHeight: number;
};
export declare function resolveMobilePreviewFrameMetrics(layout: {
    width: number;
    height: number;
}, bezel: DeviceBezelInset): MobilePreviewFrameMetrics;
/**
 * Remap portrait chrome to a landscape silhouette (90° clockwise, home indicator on the right).
 * Screen content stays upright — only the physical frame geometry changes.
 */
export declare function rotateDeviceChromeForLandscape(chrome: DeviceChromeSpec): DeviceChromeSpec;
export declare function resolveMobilePreviewChrome(portraitChrome: DeviceChromeSpec, orientation: MobilePreviewOrientation): DeviceChromeSpec;
export type MobilePreviewCornerStyle = "sharp" | "rounded";
/**
 * Visual CSS px added on top of frameRadius when device image is off and corners are rounded.
 * Tune this single constant to make the no-frame rounded preview more/less round.
 */
export declare const MOBILE_PREVIEW_ROUNDED_CORNER_EXTRA_PX = 0;
/** Screen clip radius in visual CSS px (already scaled with the floating preview). */
export declare function resolveMobilePreviewScreenRadius(args: {
    deviceChrome: DeviceChromeSpec;
    deviceImageEnabled: boolean;
    cornerStyle: MobilePreviewCornerStyle;
}): number;
//# sourceMappingURL=mobilePreviewLayout.d.ts.map