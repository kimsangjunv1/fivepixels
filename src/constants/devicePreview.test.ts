import { describe, expect, it } from "vitest";
import {
    DEFAULT_DEVICE_PREVIEW_ID,
    DEVICE_PREVIEW_PRESETS,
    formatDevicePreviewScale,
    getDevicePreviewLayoutSize,
    getDevicePreviewPreset,
    getDevicePreviewPresetsByBrand,
    normalizeDevicePreviewScale,
    scaleDeviceChrome,
} from "./devicePreview.js";

describe("devicePreview presets", () => {
    it("resolves the default preset when id is missing", () => {
        expect(getDevicePreviewPreset(undefined).id).toBe(DEFAULT_DEVICE_PREVIEW_ID);
        expect(getDevicePreviewPreset("unknown-device").id).toBe(DEFAULT_DEVICE_PREVIEW_ID);
    });

    it("groups presets by brand", () => {
        const apple = getDevicePreviewPresetsByBrand("apple");
        expect(apple.length).toBeGreaterThan(0);
        expect(apple.every((preset) => preset.brand === "apple")).toBe(true);
        expect(DEVICE_PREVIEW_PRESETS.some((preset) => preset.brand === "samsung")).toBe(true);
        expect(DEVICE_PREVIEW_PRESETS.some((preset) => preset.brand === "google")).toBe(true);
    });

    it("keeps device-specific chrome metrics", () => {
        const se = getDevicePreviewPreset("iphone-se");
        const fourteen = getDevicePreviewPreset("iphone-14");
        const pro = getDevicePreviewPreset("iphone-15-pro");
        const proMax = getDevicePreviewPreset("iphone-15-pro-max");
        const air = getDevicePreviewPreset("iphone-air");
        const ultra = getDevicePreviewPreset("galaxy-s24-ultra");

        expect(se.frame).toBe("home-button");
        expect(se.statusBar.layout).toBe("classic");
        expect(se.chrome.bezel.top).toBeGreaterThan(pro.chrome.bezel.top);
        expect(se.chrome.screenRadius).toBeLessThan(pro.chrome.screenRadius);
        expect(pro.frame).toBe("island");
        expect(pro.statusBar.cutout.kind).toBe("island");
        expect(air.width).toBe(420);
        expect(air.height).toBe(912);
        expect(air.frame).toBe("island");
        expect(air.statusBar.safeAreaTop).toBe(68);
        expect(air.statusBar.cutout.kind).toBe("island");
        expect(ultra.frame).toBe("punch-flat");
        expect(ultra.statusBar.layout).toBe("android");
        expect(ultra.chrome.frameRadius).toBeLessThan(pro.chrome.frameRadius);
        expect(fourteen.chrome.bezel).toEqual(pro.chrome.bezel);
        expect(proMax.chrome.bezel).toEqual(pro.chrome.bezel);
        expect(air.chrome.bezel).toEqual(pro.chrome.bezel);
    });

    it("normalizes scale and layout size", () => {
        expect(normalizeDevicePreviewScale(0.75)).toBe(0.75);
        expect(normalizeDevicePreviewScale(0.8)).toBe(1);
        expect(formatDevicePreviewScale(0.5)).toBe("50%");

        const preset = getDevicePreviewPreset("iphone-se");
        expect(getDevicePreviewLayoutSize(preset, 1)).toEqual({ width: 375, height: 667 });
        expect(getDevicePreviewLayoutSize(preset, 0.5)).toEqual({ width: 188, height: 334 });
        expect(scaleDeviceChrome(preset, 0.5).bezel.top).toBe(Math.round(preset.chrome.bezel.top * 0.5));
    });
});
