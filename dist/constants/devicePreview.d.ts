/** Hardware chrome color — bezel, notch, island, and camera stay this regardless of theme. */
export declare const DEVICE_CHROME_COLOR = "#101010";
export type DeviceBezelInset = {
    top: number;
    right: number;
    bottom: number;
    left: number;
};
export type DeviceChromeSpec = {
    /** Outer chassis corner radius (CSS px at 1x logical screen size). */
    frameRadius: number;
    /** Screen content corner radius. */
    screenRadius: number;
    /** Bezel thickness around the logical screen. */
    bezel: DeviceBezelInset;
    /** Optional hardware button hints (relative to frame). */
    buttons?: {
        left?: Array<{
            topRatio: number;
            height: number;
        }>;
        right?: Array<{
            topRatio: number;
            height: number;
        }>;
        top?: Array<{
            leftRatio: number;
            width: number;
        }>;
        bottom?: Array<{
            leftRatio: number;
            width: number;
        }>;
    };
};
export type DevicePreviewFrame = "home-button" | "notch" | "island" | "punch" | "punch-flat" | "tablet" | "tablet-thin" | "desktop";
export type DeviceStatusBarLayout = "classic" | "faceId" | "android" | "tablet" | "none";
/** Cutout geometry at the device's 1x logical width (scaled with screen width at render). */
export type DeviceCutoutSpec = {
    kind: "none";
} | {
    kind: "notch";
    width: number;
    height: number;
    top: number;
} | {
    kind: "island";
    width: number;
    height: number;
    top: number;
} | {
    kind: "punch";
    radius: number;
    top: number;
};
export type DeviceStatusBarSpec = {
    layout: DeviceStatusBarLayout;
    /** Top safe-area inset in CSS points at 1x logical size. */
    safeAreaTop: number;
    padLeft: number;
    padRight: number;
    timeSize: number;
    cellularH: number;
    wifi: number;
    batteryW: number;
    batteryH: number;
    iconGap: number;
    /** Show green fill + percent inside battery (iOS Face ID style). */
    batteryPercent: boolean;
    cutout: DeviceCutoutSpec;
};
export type ScaledDeviceCutout = {
    kind: "none";
    width: number;
    height: number;
    top: number;
} | {
    kind: "notch";
    width: number;
    height: number;
    top: number;
} | {
    kind: "island";
    width: number;
    height: number;
    top: number;
} | {
    kind: "punch";
    width: number;
    height: number;
    top: number;
    radius: number;
};
export type DevicePreviewPreset = {
    id: string;
    brand: "apple" | "samsung" | "google" | "desktop";
    label: string;
    width: number;
    height: number;
    frame: DevicePreviewFrame;
    chrome: DeviceChromeSpec;
    statusBar: DeviceStatusBarSpec;
};
/**
 * Chrome metrics are derived from public body/display mm ratios,
 * scaled to each device's CSS logical width so bezels/radii stay proportional.
 *
 * Status bar / cutout values live on each preset so DeviceStatusBar and
 * DeviceFrameArtwork share one source of truth.
 */
export declare const DEVICE_PREVIEW_PRESETS: readonly DevicePreviewPreset[];
export declare const DEFAULT_DEVICE_PREVIEW_ID = "iphone-14";
export declare const DEVICE_PREVIEW_BRAND_ORDER: readonly ["apple", "samsung", "google", "desktop"];
export type DevicePreviewBrand = (typeof DEVICE_PREVIEW_BRAND_ORDER)[number];
export declare const DEVICE_PREVIEW_SCALE_OPTIONS: readonly [0.5, 0.75, 1, 1.25];
export type DevicePreviewScale = (typeof DEVICE_PREVIEW_SCALE_OPTIONS)[number];
export declare const DEFAULT_DEVICE_PREVIEW_SCALE: DevicePreviewScale;
export declare function getDevicePreviewPreset(deviceId: string | null | undefined): DevicePreviewPreset;
export declare function getDevicePreviewPresetsByBrand(brand: DevicePreviewBrand): DevicePreviewPreset[];
export declare function normalizeDevicePreviewScale(value: number | null | undefined): DevicePreviewScale;
export declare function formatDevicePreviewScale(scale: DevicePreviewScale): string;
export declare function getDevicePreviewLayoutSize(preset: DevicePreviewPreset, scale: DevicePreviewScale): {
    width: number;
    height: number;
};
export declare function scaleDeviceChrome(preset: DevicePreviewPreset, scale: DevicePreviewScale): DeviceChromeSpec;
export declare function getEmptyBezel(): DeviceBezelInset;
/** Scale preset cutout metrics to the current on-screen width. */
export declare function getScaledDeviceCutout(preset: DevicePreviewPreset, screenWidth: number, referenceLogicalWidth?: number): ScaledDeviceCutout;
export declare function getDeviceSafeAreaTop(preset: DevicePreviewPreset, screenWidth: number, referenceLogicalWidth?: number): number;
export declare function scaleStatusBarMetrics(preset: DevicePreviewPreset, screenWidth: number, referenceLogicalWidth?: number): {
    safeAreaTop: number;
    padLeft: number;
    padRight: number;
    timeSize: number;
    cellularH: number;
    wifi: number;
    batteryW: number;
    batteryH: number;
    iconGap: number;
    batteryPercent: boolean;
    layout: DeviceStatusBarLayout;
    cutout: ScaledDeviceCutout;
};
//# sourceMappingURL=devicePreview.d.ts.map