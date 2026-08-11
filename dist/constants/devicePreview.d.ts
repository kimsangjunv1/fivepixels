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
    };
};
export type DevicePreviewFrame = "home-button" | "notch" | "island" | "punch" | "punch-flat" | "tablet" | "tablet-thin" | "desktop";
export type DevicePreviewPreset = {
    id: string;
    brand: "apple" | "samsung" | "google" | "desktop";
    label: string;
    width: number;
    height: number;
    frame: DevicePreviewFrame;
    chrome: DeviceChromeSpec;
};
/**
 * Chrome metrics are derived from public body/display mm ratios,
 * scaled to each device's CSS logical width so bezels/radii stay proportional.
 *
 * iPhone SE 3: 67.3×138.4mm body, ~4.7" 16:9 panel → thick top/bottom, sharp screen.
 * iPhone 14 / 15 Pro: near-bezel-less Super Retina with continuous corners.
 * Galaxy S24: centered punch-hole; Ultra uses flatter corners.
 * Pixel 8: centered punch-hole with slightly thicker chin than S24.
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
//# sourceMappingURL=devicePreview.d.ts.map