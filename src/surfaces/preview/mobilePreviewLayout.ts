import type { DeviceBezelInset, DeviceChromeSpec, DevicePreviewPreset } from "@/shared/constants/devicePreview.js";
import type { MobilePreviewOrientation } from "@/surfaces/preview/useMobilePreviewPreference.js";

export function resolveMobilePreviewScreenSize(preset: DevicePreviewPreset, orientation: MobilePreviewOrientation) {
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
export function resolveMobilePreviewLayout(preset: DevicePreviewPreset, scale: number, orientation: MobilePreviewOrientation) {
    const screenSize = resolveMobilePreviewScreenSize(preset, orientation);

    return {
        width: Math.max(1, Math.round(screenSize.width * scale)),
        height: Math.max(1, Math.round(screenSize.height * scale)),
    };
}

export function resolveMobilePreviewStatusBarReferenceWidth(preset: DevicePreviewPreset, orientation: MobilePreviewOrientation) {
    return orientation === "landscape" ? preset.height : preset.width;
}

export type MobilePreviewFrameMetrics = {
    frameWidth: number;
    frameHeight: number;
};

export function resolveMobilePreviewFrameMetrics(
    layout: { width: number; height: number },
    bezel: DeviceBezelInset,
): MobilePreviewFrameMetrics {
    return {
        frameWidth: layout.width + bezel.left + bezel.right,
        frameHeight: layout.height + bezel.top + bezel.bottom,
    };
}

/**
 * Remap portrait chrome to a landscape silhouette (90° clockwise, home indicator on the right).
 * Screen content stays upright — only the physical frame geometry changes.
 */
export function rotateDeviceChromeForLandscape(chrome: DeviceChromeSpec): DeviceChromeSpec {
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

export function resolveMobilePreviewChrome(
    portraitChrome: DeviceChromeSpec,
    orientation: MobilePreviewOrientation,
): DeviceChromeSpec {
    return orientation === "landscape" ? rotateDeviceChromeForLandscape(portraitChrome) : portraitChrome;
}

export type MobilePreviewCornerStyle = "sharp" | "rounded";

/**
 * Visual CSS px added on top of frameRadius when device image is off and corners are rounded.
 * Tune this single constant to make the no-frame rounded preview more/less round.
 */
export const MOBILE_PREVIEW_ROUNDED_CORNER_EXTRA_PX = 0;

/** Screen clip radius in visual CSS px (already scaled with the floating preview). */
export function resolveMobilePreviewScreenRadius(args: {
    deviceChrome: DeviceChromeSpec;
    deviceImageEnabled: boolean;
    cornerStyle: MobilePreviewCornerStyle;
}): number {
    if (args.deviceImageEnabled) {
        return Math.max(0, args.deviceChrome.screenRadius);
    }

    if (args.cornerStyle === "sharp") {
        return 0;
    }

    return Math.max(0, args.deviceChrome.frameRadius + MOBILE_PREVIEW_ROUNDED_CORNER_EXTRA_PX);
}
