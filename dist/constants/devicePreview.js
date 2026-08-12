/** Hardware chrome color — bezel, notch, island, and camera stay this regardless of theme. */
export const DEVICE_CHROME_COLOR = "#101010";
function statusBarClassic(overrides = {}) {
    return {
        layout: "classic",
        safeAreaTop: 20,
        padLeft: 0,
        padRight: 0,
        timeSize: 16,
        cellularH: 12,
        wifi: 15,
        batteryW: 27,
        batteryH: 12,
        iconGap: 6,
        batteryPercent: false,
        cutout: { kind: "none" },
        ...overrides,
    };
}
function statusBarFaceId(overrides) {
    return {
        layout: "faceId",
        padLeft: 0,
        padRight: 0,
        timeSize: 16,
        cellularH: 13,
        wifi: 17,
        batteryW: 34,
        batteryH: 15,
        iconGap: 7,
        batteryPercent: true,
        ...overrides,
    };
}
function statusBarAndroid(overrides) {
    return {
        layout: "android",
        safeAreaTop: 28,
        padLeft: 14,
        padRight: 12,
        timeSize: 14,
        cellularH: 12,
        wifi: 16,
        batteryW: 28,
        batteryH: 12,
        iconGap: 6,
        batteryPercent: false,
        ...overrides,
    };
}
function statusBarTablet(overrides = {}) {
    return {
        layout: "tablet",
        safeAreaTop: 24,
        padLeft: 18,
        padRight: 16,
        timeSize: 14,
        cellularH: 12,
        wifi: 16,
        batteryW: 30,
        batteryH: 12,
        iconGap: 7,
        batteryPercent: true,
        cutout: { kind: "none" },
        ...overrides,
    };
}
function statusBarNone() {
    return {
        layout: "none",
        safeAreaTop: 0,
        padLeft: 0,
        padRight: 0,
        timeSize: 0,
        cellularH: 0,
        wifi: 0,
        batteryW: 0,
        batteryH: 0,
        iconGap: 0,
        batteryPercent: false,
        cutout: { kind: "none" },
    };
}
/**
 * Chrome metrics are derived from public body/display mm ratios,
 * scaled to each device's CSS logical width so bezels/radii stay proportional.
 *
 * Status bar / cutout values live on each preset so DeviceStatusBar and
 * DeviceFrameArtwork share one source of truth.
 */
export const DEVICE_PREVIEW_PRESETS = [
    {
        id: "iphone-se",
        brand: "apple",
        label: "iPhone SE",
        width: 375,
        height: 667,
        frame: "home-button",
        statusBar: statusBarClassic(),
        chrome: {
            frameRadius: 56,
            screenRadius: 2,
            bezel: { top: 90, right: 9, bottom: 90, left: 9 },
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
        statusBar: statusBarFaceId({
            safeAreaTop: 47,
            cutout: { kind: "notch", width: 133, height: 31, top: 0 },
        }),
        chrome: {
            frameRadius: 54,
            screenRadius: 50,
            bezel: { top: 6, right: 6, bottom: 6, left: 6 },
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
        statusBar: statusBarFaceId({
            safeAreaTop: 59,
            cutout: { kind: "island", width: 126, height: 34, top: 10 },
        }),
        chrome: {
            frameRadius: 55,
            screenRadius: 51,
            bezel: { top: 6, right: 6, bottom: 6, left: 6 },
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
        statusBar: statusBarFaceId({
            safeAreaTop: 59,
            cutout: { kind: "island", width: 126, height: 37, top: 10 },
        }),
        chrome: {
            frameRadius: 58,
            screenRadius: 54,
            bezel: { top: 6, right: 6, bottom: 6, left: 6 },
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
        id: "iphone-air",
        brand: "apple",
        label: "iPhone Air",
        width: 420,
        height: 912,
        frame: "island",
        statusBar: statusBarFaceId({
            safeAreaTop: 68,
            cutout: { kind: "island", width: 126, height: 36, top: 10 },
        }),
        chrome: {
            frameRadius: 56,
            screenRadius: 52,
            bezel: { top: 6, right: 6, bottom: 6, left: 6 },
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
        id: "ipad-mini",
        brand: "apple",
        label: "iPad mini",
        width: 768,
        height: 1024,
        frame: "tablet",
        statusBar: statusBarTablet(),
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
        statusBar: statusBarTablet({ safeAreaTop: 24 }),
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
        statusBar: statusBarAndroid({
            cutout: { kind: "punch", radius: 12, top: 16 },
        }),
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
        statusBar: statusBarAndroid({
            cutout: { kind: "punch", radius: 11, top: 16 },
        }),
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
        statusBar: statusBarTablet({ batteryPercent: false }),
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
        statusBar: statusBarAndroid({
            cutout: { kind: "punch", radius: 12, top: 16 },
        }),
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
        statusBar: statusBarAndroid({
            cutout: { kind: "punch", radius: 12, top: 16 },
        }),
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
        statusBar: statusBarNone(),
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
        statusBar: statusBarNone(),
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
        statusBar: statusBarNone(),
        chrome: {
            frameRadius: 14,
            screenRadius: 4,
            bezel: { top: 22, right: 18, bottom: 42, left: 18 },
        },
    },
];
export const DEFAULT_DEVICE_PREVIEW_ID = "iphone-14";
export const DEVICE_PREVIEW_BRAND_ORDER = ["apple", "samsung", "google", "desktop"];
export const DEVICE_PREVIEW_SCALE_OPTIONS = [0.5, 0.75, 1, 1.25];
export const DEFAULT_DEVICE_PREVIEW_SCALE = 1;
export function getDevicePreviewPreset(deviceId) {
    return (DEVICE_PREVIEW_PRESETS.find((preset) => preset.id === deviceId) ??
        DEVICE_PREVIEW_PRESETS.find((preset) => preset.id === DEFAULT_DEVICE_PREVIEW_ID) ??
        DEVICE_PREVIEW_PRESETS[0]);
}
export function getDevicePreviewPresetsByBrand(brand) {
    return DEVICE_PREVIEW_PRESETS.filter((preset) => preset.brand === brand);
}
export function normalizeDevicePreviewScale(value) {
    const match = DEVICE_PREVIEW_SCALE_OPTIONS.find((scale) => scale === value);
    return match ?? DEFAULT_DEVICE_PREVIEW_SCALE;
}
export function formatDevicePreviewScale(scale) {
    return `${Math.round(scale * 100)}%`;
}
export function getDevicePreviewLayoutSize(preset, scale) {
    return {
        width: Math.max(1, Math.round(preset.width * scale)),
        height: Math.max(1, Math.round(preset.height * scale)),
    };
}
export function scaleDeviceChrome(preset, scale) {
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
export function getEmptyBezel() {
    return { top: 0, right: 0, bottom: 0, left: 0 };
}
/** Scale preset cutout metrics to the current on-screen width. */
export function getScaledDeviceCutout(preset, screenWidth) {
    const cutout = preset.statusBar.cutout;
    const s = preset.width > 0 ? screenWidth / preset.width : 1;
    switch (cutout.kind) {
        case "notch":
            return {
                kind: "notch",
                width: Math.round(cutout.width * s),
                height: Math.round(cutout.height * s),
                top: Math.round(cutout.top * s),
            };
        case "island":
            return {
                kind: "island",
                width: Math.round(cutout.width * s),
                height: Math.round(cutout.height * s),
                top: Math.round(cutout.top * s),
            };
        case "punch": {
            const radius = Math.round(cutout.radius * s);
            return {
                kind: "punch",
                width: radius * 2 + 8,
                height: radius * 2 + 8,
                top: Math.round(cutout.top * s),
                radius,
            };
        }
        case "none":
        default:
            return {
                kind: "none",
                width: Math.max(8, Math.round(screenWidth * 0.08)),
                height: 0,
                top: 0,
            };
    }
}
export function getDeviceSafeAreaTop(preset, screenWidth) {
    const base = preset.statusBar.safeAreaTop;
    if (preset.width <= 0) {
        return base;
    }
    return Math.max(0, Math.round(base * (screenWidth / preset.width)));
}
export function scaleStatusBarMetrics(preset, screenWidth) {
    const s = preset.width > 0 ? screenWidth / preset.width : 1;
    const mild = Math.min(1.12, Math.max(0.95, s));
    const bar = preset.statusBar;
    return {
        safeAreaTop: getDeviceSafeAreaTop(preset, screenWidth),
        padLeft: bar.padLeft * mild,
        padRight: bar.padRight * mild,
        // Keep exact pt for clock so Face ID / classic stay at 16px.
        timeSize: bar.layout === "faceId" || bar.layout === "classic" ? bar.timeSize : bar.timeSize * mild,
        cellularH: bar.cellularH * mild,
        wifi: bar.wifi * mild,
        batteryW: bar.batteryW * mild,
        batteryH: bar.batteryH * mild,
        iconGap: bar.iconGap * mild,
        batteryPercent: bar.batteryPercent,
        layout: bar.layout,
        cutout: getScaledDeviceCutout(preset, screenWidth),
    };
}
//# sourceMappingURL=devicePreview.js.map