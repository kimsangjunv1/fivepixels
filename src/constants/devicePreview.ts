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
        left?: Array<{ topRatio: number; height: number }>;
        right?: Array<{ topRatio: number; height: number }>;
    };
};

export type DevicePreviewFrame =
    | "home-button"
    | "notch"
    | "island"
    | "punch"
    | "punch-flat"
    | "tablet"
    | "tablet-thin"
    | "desktop";

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
export const DEVICE_PREVIEW_PRESETS: readonly DevicePreviewPreset[] = [
    {
        id: "iphone-se",
        brand: "apple",
        label: "iPhone SE",
        width: 375,
        height: 667,
        frame: "home-button",
        chrome: {
            frameRadius: 68,
            screenRadius: 2,
            bezel: { top: 108, right: 28, bottom: 108, left: 28 },
            buttons: {
                left: [
                    { topRatio: 0.16, height: 22 },
                    { topRatio: 0.22, height: 48 },
                    { topRatio: 0.3, height: 48 },
                ],
                right: [{ topRatio: 0.24, height: 64 }],
            },
        },
    },
    {
        id: "iphone-14",
        brand: "apple",
        label: "iPhone 14",
        width: 390,
        height: 844,
        frame: "notch",
        chrome: {
            frameRadius: 54,
            screenRadius: 47,
            bezel: { top: 12, right: 12, bottom: 12, left: 12 },
            buttons: {
                left: [
                    { topRatio: 0.14, height: 28 },
                    { topRatio: 0.2, height: 52 },
                    { topRatio: 0.28, height: 52 },
                ],
                right: [{ topRatio: 0.22, height: 72 }],
            },
        },
    },
    {
        id: "iphone-15-pro",
        brand: "apple",
        label: "iPhone 15 Pro",
        width: 393,
        height: 852,
        frame: "island",
        chrome: {
            frameRadius: 58,
            screenRadius: 55,
            bezel: { top: 11, right: 11, bottom: 11, left: 11 },
            buttons: {
                left: [
                    { topRatio: 0.15, height: 30 },
                    { topRatio: 0.22, height: 54 },
                    { topRatio: 0.3, height: 54 },
                ],
                right: [{ topRatio: 0.23, height: 74 }],
            },
        },
    },
    {
        id: "iphone-15-pro-max",
        brand: "apple",
        label: "iPhone 15 Pro Max",
        width: 430,
        height: 932,
        frame: "island",
        chrome: {
            frameRadius: 62,
            screenRadius: 58,
            bezel: { top: 12, right: 12, bottom: 12, left: 12 },
            buttons: {
                left: [
                    { topRatio: 0.15, height: 32 },
                    { topRatio: 0.22, height: 56 },
                    { topRatio: 0.3, height: 56 },
                ],
                right: [{ topRatio: 0.23, height: 78 }],
            },
        },
    },
    {
        id: "ipad-mini",
        brand: "apple",
        label: "iPad mini",
        width: 768,
        height: 1024,
        frame: "tablet",
        chrome: {
            frameRadius: 42,
            screenRadius: 18,
            bezel: { top: 36, right: 36, bottom: 36, left: 36 },
        },
    },
    {
        id: "ipad-pro-11",
        brand: "apple",
        label: "iPad Pro 11\"",
        width: 834,
        height: 1194,
        frame: "tablet-thin",
        chrome: {
            frameRadius: 36,
            screenRadius: 18,
            bezel: { top: 22, right: 22, bottom: 22, left: 22 },
        },
    },
    {
        id: "galaxy-s24",
        brand: "samsung",
        label: "Galaxy S24",
        width: 360,
        height: 780,
        frame: "punch",
        chrome: {
            frameRadius: 44,
            screenRadius: 38,
            bezel: { top: 10, right: 9, bottom: 10, left: 9 },
            buttons: {
                left: [{ topRatio: 0.2, height: 70 }],
                right: [
                    { topRatio: 0.18, height: 36 },
                    { topRatio: 0.26, height: 70 },
                ],
            },
        },
    },
    {
        id: "galaxy-s24-ultra",
        brand: "samsung",
        label: "Galaxy S24 Ultra",
        width: 384,
        height: 824,
        frame: "punch-flat",
        chrome: {
            frameRadius: 18,
            screenRadius: 12,
            bezel: { top: 9, right: 8, bottom: 9, left: 8 },
            buttons: {
                left: [{ topRatio: 0.2, height: 74 }],
                right: [
                    { topRatio: 0.18, height: 38 },
                    { topRatio: 0.26, height: 74 },
                ],
            },
        },
    },
    {
        id: "galaxy-tab-s9",
        brand: "samsung",
        label: "Galaxy Tab S9",
        width: 800,
        height: 1280,
        frame: "tablet",
        chrome: {
            frameRadius: 28,
            screenRadius: 16,
            bezel: { top: 28, right: 28, bottom: 28, left: 28 },
        },
    },
    {
        id: "pixel-8",
        brand: "google",
        label: "Pixel 8",
        width: 412,
        height: 915,
        frame: "punch",
        chrome: {
            frameRadius: 40,
            screenRadius: 34,
            bezel: { top: 12, right: 11, bottom: 14, left: 11 },
            buttons: {
                left: [],
                right: [
                    { topRatio: 0.18, height: 34 },
                    { topRatio: 0.24, height: 72 },
                    { topRatio: 0.34, height: 72 },
                ],
            },
        },
    },
    {
        id: "pixel-8-pro",
        brand: "google",
        label: "Pixel 8 Pro",
        width: 448,
        height: 998,
        frame: "punch",
        chrome: {
            frameRadius: 42,
            screenRadius: 36,
            bezel: { top: 12, right: 11, bottom: 14, left: 11 },
            buttons: {
                left: [],
                right: [
                    { topRatio: 0.18, height: 36 },
                    { topRatio: 0.24, height: 76 },
                    { topRatio: 0.34, height: 76 },
                ],
            },
        },
    },
    {
        id: "desktop-hd",
        brand: "desktop",
        label: "Desktop HD",
        width: 1280,
        height: 720,
        frame: "desktop",
        chrome: {
            frameRadius: 14,
            screenRadius: 4,
            bezel: { top: 22, right: 18, bottom: 42, left: 18 },
        },
    },
    {
        id: "desktop-fhd",
        brand: "desktop",
        label: "Desktop FHD",
        width: 1440,
        height: 900,
        frame: "desktop",
        chrome: {
            frameRadius: 14,
            screenRadius: 4,
            bezel: { top: 22, right: 18, bottom: 42, left: 18 },
        },
    },
    {
        id: "desktop-qhd",
        brand: "desktop",
        label: "Desktop QHD",
        width: 1920,
        height: 1080,
        frame: "desktop",
        chrome: {
            frameRadius: 14,
            screenRadius: 4,
            bezel: { top: 22, right: 18, bottom: 42, left: 18 },
        },
    },
] as const;

export const DEFAULT_DEVICE_PREVIEW_ID = "iphone-14";

export const DEVICE_PREVIEW_BRAND_ORDER = ["apple", "samsung", "google", "desktop"] as const;

export type DevicePreviewBrand = (typeof DEVICE_PREVIEW_BRAND_ORDER)[number];

export const DEVICE_PREVIEW_SCALE_OPTIONS = [0.5, 0.75, 1, 1.25] as const;

export type DevicePreviewScale = (typeof DEVICE_PREVIEW_SCALE_OPTIONS)[number];

export const DEFAULT_DEVICE_PREVIEW_SCALE: DevicePreviewScale = 1;

export function getDevicePreviewPreset(deviceId: string | null | undefined): DevicePreviewPreset {
    return (
        DEVICE_PREVIEW_PRESETS.find((preset) => preset.id === deviceId) ??
        DEVICE_PREVIEW_PRESETS.find((preset) => preset.id === DEFAULT_DEVICE_PREVIEW_ID) ??
        DEVICE_PREVIEW_PRESETS[0]
    );
}

export function getDevicePreviewPresetsByBrand(brand: DevicePreviewBrand): DevicePreviewPreset[] {
    return DEVICE_PREVIEW_PRESETS.filter((preset) => preset.brand === brand);
}

export function normalizeDevicePreviewScale(value: number | null | undefined): DevicePreviewScale {
    const match = DEVICE_PREVIEW_SCALE_OPTIONS.find((scale) => scale === value);
    return match ?? DEFAULT_DEVICE_PREVIEW_SCALE;
}

export function formatDevicePreviewScale(scale: DevicePreviewScale): string {
    return `${Math.round(scale * 100)}%`;
}

export function getDevicePreviewLayoutSize(preset: DevicePreviewPreset, scale: DevicePreviewScale) {
    return {
        width: Math.max(1, Math.round(preset.width * scale)),
        height: Math.max(1, Math.round(preset.height * scale)),
    };
}

export function scaleDeviceChrome(preset: DevicePreviewPreset, scale: DevicePreviewScale): DeviceChromeSpec {
    const s = scale;
    return {
        frameRadius: Math.max(0, Math.round(preset.chrome.frameRadius * s)),
        screenRadius: Math.max(0, Math.round(preset.chrome.screenRadius * s)),
        bezel: {
            top: Math.max(0, Math.round(preset.chrome.bezel.top * s)),
            right: Math.max(0, Math.round(preset.chrome.bezel.right * s)),
            bottom: Math.max(0, Math.round(preset.chrome.bezel.bottom * s)),
            left: Math.max(0, Math.round(preset.chrome.bezel.left * s)),
        },
        buttons: preset.chrome.buttons,
    };
}

export function getEmptyBezel(): DeviceBezelInset {
    return { top: 0, right: 0, bottom: 0, left: 0 };
}
